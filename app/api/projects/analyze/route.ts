import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

import { auth } from "@/auth";
import { parseAIResponse } from "@/lib/ai/parse";
import { successResponse, handleApiError } from "@/lib/api/responses";
import { UnauthorizedError, AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";

const ENDPOINT = "POST /api/projects/analyze";
const GEMINI_MODEL = "gemini-2.5-flash";

// The other two agents run on Anthropic; the project analyzer runs on Google
// Gemini to demonstrate a provider-agnostic, multi-AI architecture.
const GEMINI_API_KEY =
  process.env.GOOGLE_GENAI_API_KEY ?? process.env.GEMINI_API_KEY;

// ─── Input ───────────────────────────────────────────────────────────────────
const inputSchema = z.object({
  title: z.string().trim().min(5).max(120),
  description: z.string().trim().min(30).max(2000),
  ownerRole: z.string().trim().min(2),
});

// ─── AI response contract ──────────────────────────────────────────────────────
const roleSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  requiredSkills: z.array(z.string().min(1)).min(1).max(12),
  importance: z.string().min(1),
});

const analysisSchema = z.object({
  summary: z.string().min(1),
  problemStatement: z.string().min(1),
  targetOutcome: z.string().min(1),
  estimatedDuration: z.string().min(1),
  complexity: z.enum(["low", "medium", "high"]),
  tags: z.array(z.string().min(1)).min(2).max(12),
  roles: z.array(roleSchema).min(2).max(8),
});

/** Raised when the Gemini call itself fails (network/timeout/upstream). */
class GeminiServiceError extends AppError {
  constructor(message = "Gemini request failed") {
    super(500, { error: "Failed to analyze project" }, message);
  }
}

function buildAnalyzePrompt(
  title: string,
  description: string,
  ownerRole: string
): string {
  return `You are an experienced startup advisor and technical project manager. A founder wants to build this project:

Title: ${title}
Description: ${description}
Their role: ${ownerRole}

Analyze this project idea and identify the team roles needed to execute it (EXCLUDE the owner's role: ${ownerRole}). For each role, be SPECIFIC to this project — not generic descriptions. Say exactly what they would build or do in this specific project. Include 3-5 roles total.

IMPORTANT: If the description is too vague to analyze meaningfully, still provide sensible roles based on what can be inferred. Always return valid JSON.

Respond ONLY with valid JSON — no markdown, no code fences, no extra text:
{
  "summary": "string (2 sentences: what this project is and who it helps)",
  "problemStatement": "string (1 sentence: the core problem being solved)",
  "targetOutcome": "string (1 sentence: what success looks like after building)",
  "estimatedDuration": "string (e.g. '4-6 weeks', '2-3 months')",
  "complexity": "low" | "medium" | "high",
  "tags": ["string"] (3-5 relevant topic tags),
  "roles": [
    {
      "title": "string (specific role title)",
      "description": "string (what they specifically build/do in this project, 2 sentences)",
      "requiredSkills": ["string"] (2-4 specific, verifiable skills),
      "importance": "string (1 sentence: why this role is critical)"
    }
  ]
}`;
}

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  const session = await auth();
  const userId = session?.user?.id;

  try {
    // 1. AUTH
    if (!userId) throw new UnauthorizedError();

    // 2. INPUT VALIDATION (ZodError -> 400 via handleApiError)
    const body = await request.json();
    const { title, description, ownerRole } = inputSchema.parse(body);

    if (!GEMINI_API_KEY) {
      throw new GeminiServiceError("Missing GOOGLE_GENAI_API_KEY");
    }

    // 3. GEMINI CALL
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const prompt = buildAnalyzePrompt(title, description, ownerRole);

    const aiStartedAt = Date.now();
    let text: string | undefined;
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          temperature: 0.5,
          maxOutputTokens: 2048,
          // gemini-2.5-flash is a "thinking" model: without this it spends the
          // whole token budget on internal reasoning and truncates the JSON.
          thinkingConfig: { thinkingBudget: 0 },
          // Force a clean JSON body (no markdown fences / prose).
          responseMimeType: "application/json",
        },
      });
      text = response.text;
    } catch (geminiError) {
      throw new GeminiServiceError(
        geminiError instanceof Error ? geminiError.message : "Gemini call failed"
      );
    }
    const aiLatencyMs = Date.now() - aiStartedAt;

    if (!text) throw new GeminiServiceError("Empty response from Gemini");

    // 4. PARSE + VALIDATE (AIResponseError -> 500 via handleApiError)
    const analysis = parseAIResponse(text, analysisSchema);

    logger.info("project.analyze.success", {
      endpoint: ENDPOINT,
      userId,
      model: GEMINI_MODEL,
      latencyMs: Date.now() - startedAt,
      aiLatencyMs,
      success: true,
    });

    // 5. RETURN
    return successResponse({ success: true, analysis });
  } catch (error) {
    const response = handleApiError(error, {
      error: "Failed to analyze project",
      status: 500,
    });

    logger.error("project.analyze.failure", {
      endpoint: ENDPOINT,
      userId,
      model: GEMINI_MODEL,
      latencyMs: Date.now() - startedAt,
      success: false,
      errorName: error instanceof Error ? error.name : "Unknown",
      statusCode: response.status,
    });

    return response;
  }
}
