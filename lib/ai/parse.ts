import type { ZodType } from "zod";
import { AIResponseError } from "@/lib/errors";

/**
 * Strip accidental markdown fences / preamble so JSON.parse stays robust even
 * when a model ignores "no fences" instructions.
 */
export function extractJson(raw: string): string {
  const trimmed = raw.trim();

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced) return fenced[1].trim();

  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    return trimmed.slice(first, last + 1);
  }

  return trimmed;
}

/**
 * Parse raw AI text into a validated, typed object.
 * Throws {@link AIResponseError} on malformed JSON or schema mismatch.
 */
export function parseAIResponse<T>(raw: string, schema: ZodType<T>): T {
  let candidate: unknown;

  try {
    candidate = JSON.parse(extractJson(raw));
  } catch {
    throw new AIResponseError();
  }

  const result = schema.safeParse(candidate);
  if (!result.success) {
    throw new AIResponseError();
  }

  return result.data;
}
