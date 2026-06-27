/**
 * Anthropic generation settings, sourced from the environment with safe
 * defaults that preserve the previously hard-coded behavior.
 */
function numberFromEnv(raw: string | undefined, fallback: number): number {
  if (raw === undefined) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const AI_CONFIG = {
  model: process.env.ANTHROPIC_MODEL?.trim() || "claude-haiku-4-5-20251001",
  temperature: numberFromEnv(process.env.ANTHROPIC_TEMPERATURE, 0.85),
  maxTokens: numberFromEnv(process.env.ANTHROPIC_MAX_TOKENS, 900),
} as const;

/** Transport-level settings for the Anthropic client. */
export const AI_TRANSPORT = {
  requestTimeoutMs: numberFromEnv(process.env.ANTHROPIC_TIMEOUT_MS, 15_000),
  maxRetries: numberFromEnv(process.env.ANTHROPIC_MAX_RETRIES, 3),
  baseRetryDelayMs: numberFromEnv(process.env.ANTHROPIC_RETRY_BASE_MS, 500),
} as const;

/** HTTP statuses worth retrying with backoff. */
export const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);
