import Anthropic from "@anthropic-ai/sdk";
import { anthropic } from "@/lib/claude";
import { AIServiceError } from "@/lib/errors";
import { AI_TRANSPORT, RETRYABLE_STATUS } from "@/lib/ai/config";

export interface CreateMessageParams {
  system: string;
  messages: Anthropic.MessageParam[];
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
  return error instanceof Anthropic.APIError ? error.status : undefined;
}

/**
 * Single non-streaming Anthropic completion with:
 *  - a hard per-attempt timeout via AbortController, and
 *  - exponential backoff (with jitter) on transient upstream failures.
 *
 * Built-in SDK retries are disabled (`maxRetries: 0`) so this is the single
 * source of retry behavior. All failures surface as a typed {@link AIServiceError}.
 */
export async function createMessage(
  params: CreateMessageParams
): Promise<CreateMessageResult> {
  const { system, messages, model, temperature, maxTokens } = params;
  const { maxRetries, baseRetryDelayMs, requestTimeoutMs } = AI_TRANSPORT;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), requestTimeoutMs);

    try {
      const response = await anthropic.messages.create(
        {
          model,
          max_tokens: maxTokens,
          temperature,
          system,
          messages,
        },
        { signal: controller.signal, maxRetries: 0 }
      );

      const text = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === "text")
        .map((block) => block.text)
        .join("");

      return {
        text,
        model: response.model,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
        attempts: attempt + 1,
      };
    } catch (error) {
      lastError = error;
      const status = statusOf(error);
      const retryable = typeof status === "number" && RETRYABLE_STATUS.has(status);

      if (!retryable || attempt === maxRetries) break;

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
 * Translate an upstream Anthropic failure into a typed {@link AIServiceError}
 * with a client-facing message that reflects the real cause (billing, auth,
 * rate limit) instead of a generic catch-all.
 */
function mapToServiceError(error: unknown): AIServiceError {
  const status = statusOf(error);
  const upstream =
    error instanceof Error ? error.message : "Anthropic request failed";

  if (status === 400 && /credit balance|billing|quota/i.test(upstream)) {
    return new AIServiceError(
      upstream,
      "AI is unavailable: the Anthropic account is out of credits. Add credits in the Anthropic console (Plans & Billing) and try again.",
      402
    );
  }
  if (status === 401 || status === 403) {
    return new AIServiceError(
      upstream,
      "AI is unavailable: the Anthropic API key is missing or invalid.",
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
  return new AIServiceError(upstream);
}
