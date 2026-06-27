import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/errors";

/** Standard JSON success response. */
export function successResponse(
  data: Record<string, unknown>,
  status = 200
): NextResponse {
  return NextResponse.json(data, { status });
}

/** Standard JSON error response. */
export function errorResponse(
  payload: Record<string, unknown>,
  status: number
): NextResponse {
  return NextResponse.json(payload, { status });
}

interface Fallback {
  error: string;
  status: number;
}

/**
 * Map any thrown error to an HTTP response.
 *
 * - {@link AppError} subclasses carry their own status + payload.
 * - {@link ZodError} (e.g. input validation) maps to a 400 with field errors.
 * - Anything else maps to the caller-provided fallback, preserving the
 *   endpoint's original catch-all behavior.
 */
export function handleApiError(
  error: unknown,
  fallback: Fallback
): NextResponse {
  if (error instanceof AppError) {
    return errorResponse(error.payload, error.statusCode);
  }

  if (error instanceof ZodError) {
    return errorResponse(
      { error: "Validation failed", details: error.flatten().fieldErrors },
      400
    );
  }

  return errorResponse({ error: fallback.error }, fallback.status);
}
