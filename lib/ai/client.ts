import { GoogleGenAI } from "@google/genai";
import { AIServiceError } from "@/lib/errors";
import { AI_TRANSPORT, RETRYABLE_STATUS } from "@/lib/ai/config";

// Provide a generic interface for creating messages
export interface CreateMessageParams {
  system: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface CreateMessageResult {
  text: string;
  model: string;
  usage: { inputTokens: number; outputTokens: number };
  attempts: number;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function statusOf(error: unknown): number | undefined {
  if (typeof error === "object" && error !== null && "status" in error) {
    return (error as { status: number }).status;
  }
  return undefined;
}

/**
 * Single non-streaming Gemini completion with:
 *  - a hard per-attempt timeout via AbortController, and
 *  - exponential backoff (with jitter) on transient upstream failures.
 */
export async function createMessage(
  params: CreateMessageParams
): Promise<CreateMessageResult> {
  const { system, messages, model, temperature, maxTokens } = params;
  const { maxRetries, baseRetryDelayMs, requestTimeoutMs } = AI_TRANSPORT;

  // Initialize Gemini client dynamically to avoid edge runtime issues if env is missing at build time
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

  let lastError: unknown;

  // Map the generic messages array to Gemini's format
  const geminiContents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), requestTimeoutMs);

    try {
      const response = await ai.models.generateContent({
        model,
        contents: geminiContents,
        config: {
          systemInstruction: system,
          temperature,
          maxOutputTokens: maxTokens,
          responseMimeType: "application/json",
          // Flash defaults to thinking, which can cause JSON truncation or prose.
          thinkingConfig: { thinkingBudget: 0 },
          // @ts-expect-error - Next.js/SDK types might vary, but signal is often supported by underlying fetch
          httpOptions: { signal: controller.signal },
        },
      });

      const text = response.text || "";

      return {
        text,
        model: model, // Gemini response might not echo the exact model string back
        usage: {
          inputTokens: response.usageMetadata?.promptTokenCount ?? 0,
          outputTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
        },
        attempts: attempt + 1,
      };
    } catch (error) {
      lastError = error;
      const status = statusOf(error);
      const retryable = typeof status === "number" && RETRYABLE_STATUS.has(status);

      // Also retry on AbortError (timeout)
      const isTimeout = error instanceof Error && error.name === "AbortError";

      if ((!retryable && !isTimeout) || attempt === maxRetries) break;

      const backoff =
        baseRetryDelayMs * 2 ** attempt + Math.floor(Math.random() * 100);
      await sleep(backoff);
    } finally {
      clearTimeout(timer);
    }
  }

  throw mapToServiceError(lastError);
}

/**
 * Translate an upstream API failure into a typed {@link AIServiceError}
 * with a client-facing message that reflects the real cause.
 */
function mapToServiceError(error: unknown): AIServiceError {
  const status = statusOf(error);
  const upstream =
    error instanceof Error ? error.message : "AI request failed";

  if (status === 400 && /credit balance|billing|quota/i.test(upstream)) {
    return new AIServiceError(
      upstream,
      "AI is unavailable: The account is out of credits. Please check your billing dashboard.",
      402
    );
  }
  if (status === 401 || status === 403) {
    return new AIServiceError(
      upstream,
      "AI is unavailable: The API key is missing or invalid.",
      502
    );
  }
  if (status === 429) {
    return new AIServiceError(
      upstream,
      "The AI service is rate-limited right now. Please try again in a moment.",
      429
    );
  }
  
  if (error instanceof Error && error.name === "AbortError") {
    return new AIServiceError("Timeout", "The AI service took too long to respond. Please try again.", 504);
  }
  
  return new AIServiceError(upstream);
}
