/**
 * Typed application errors.
 *
 * Each error carries the exact HTTP status and JSON payload it maps to, so
 * route handlers can `throw` instead of returning early, and a single
 * error-handling helper can translate them into responses. The payloads here
 * intentionally match the established API contract byte-for-byte.
 */
export class AppError extends Error {
  readonly statusCode: number;
  readonly payload: Record<string, unknown>;

  constructor(
    statusCode: number,
    payload: Record<string, unknown>,
    message?: string
  ) {
    super(message ?? (payload.error as string) ?? "AppError");
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.payload = payload;
  }
}

export class UnauthorizedError extends AppError {
  constructor() {
    super(401, { error: "Unauthorized" });
  }
}

export class DomainValidationError extends AppError {
  constructor() {
    super(400, { error: "Validation failed", message: "Unknown domain" });
  }
}

export class RateLimitError extends AppError {
  constructor() {
    super(429, {
      error: "Daily limit reached",
      message:
        "You can generate up to 5 challenges per day. Try again tomorrow.",
    });
  }
}

/** Requested resource does not exist. */
export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(404, { error: message });
  }
}

/** Authenticated, but not allowed to act on this resource. */
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(403, { error: message });
  }
}

/** Generic 400 with a human-readable message (e.g. failed precondition). */
export class ValidationError extends AppError {
  constructor(message = "Validation failed") {
    super(400, { error: message });
  }
}

/** The AI returned something we couldn't parse/validate into a challenge. */
export class AIResponseError extends AppError {
  constructor() {
    super(500, { error: "AI response invalid, please try again" });
  }
}

/** The upstream AI provider failed (after retries) or timed out. */
export class AIServiceError extends AppError {
  constructor(message = "Anthropic request failed") {
    super(500, { error: "Failed to generate challenge" }, message);
  }
}
