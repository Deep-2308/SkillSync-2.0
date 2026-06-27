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

  throw new AIServiceError(
    lastError instanceof Error ? lastError.message : "Anthropic request failed"
  );
}
