/**
 * Minimal structured logger.
 *
 * Emits a single JSON line per event so logs are machine-parseable in any
 * aggregator (CloudWatch, Datadog, etc.). console.* is only the transport —
 * application code should never call console directly.
 */
type LogLevel = "info" | "warn" | "error";

export interface LogFields {
  endpoint?: string;
  userId?: string;
  model?: string;
  latencyMs?: number;
  aiLatencyMs?: number;
  inputTokens?: number;
  outputTokens?: number;
  attempts?: number;
  success?: boolean;
  errorName?: string;
  statusCode?: number;
  [key: string]: unknown;
}

function emit(level: LogLevel, event: string, fields: LogFields): void {
  const line = JSON.stringify({
    level,
    event,
    timestamp: new Date().toISOString(),
    ...fields,
  });

  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  info: (event: string, fields: LogFields = {}) => emit("info", event, fields),
  warn: (event: string, fields: LogFields = {}) => emit("warn", event, fields),
  error: (event: string, fields: LogFields = {}) =>
    emit("error", event, fields),
};
