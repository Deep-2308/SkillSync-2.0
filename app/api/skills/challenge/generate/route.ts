import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Challenge from "@/models/Challenge";
import { AI_CONFIG } from "@/lib/ai/config";
import { createMessage } from "@/lib/ai/client";
import { parseAIResponse } from "@/lib/ai/parse";
import {
  DOMAIN_CONTEXT,
  buildChallengeSystemPrompt,
  challengeResponseSchema,
} from "@/lib/prompts/challenge";
import { successResponse, handleApiError } from "@/lib/api/responses";
import {
  UnauthorizedError,
  DomainValidationError,
  RateLimitError,
} from "@/lib/errors";
import { logger } from "@/lib/logger";

const ENDPOINT = "POST /api/skills/challenge/generate";
const DAILY_LIMIT = 5;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const inputSchema = z.object({
  skillName: z.string().min(2).max(60),
  domain: z.string(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
});

function startOfTodayUTC(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
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
    const { skillName, domain, difficulty } = inputSchema.parse(body);

    const domainContext = DOMAIN_CONTEXT[domain];
    if (!domainContext) throw new DomainValidationError();

    await dbConnect();

    // 3. RATE LIMITING — challenges generated since midnight UTC today.
    const todayCount = await Challenge.countDocuments({
      userId,
      generatedAt: { $gte: startOfTodayUTC() },
    });
    if (todayCount >= DAILY_LIMIT) throw new RateLimitError();

    // 4 + 5. PROMPT + AI CALL (env-driven model/temperature/maxTokens,
    // with retry/backoff and a hard timeout inside createMessage).
    const system = buildChallengeSystemPrompt({
      domainContext,
      difficulty,
      skillName,
    });

    const aiStartedAt = Date.now();
    const ai = await createMessage({
      system,
      messages: [
        {
          role: "user",
          content:
            "Generate the challenge now. Respond with the JSON object only.",
        },
      ],
      model: AI_CONFIG.model,
      temperature: AI_CONFIG.temperature,
      maxTokens: AI_CONFIG.maxTokens,
    });
    const aiLatencyMs = Date.now() - aiStartedAt;

    // 6. PARSE + VALIDATE (AIResponseError -> 500 via handleApiError)
    const challengeContent = parseAIResponse(ai.text, challengeResponseSchema);

    // 7. PERSIST
    const challenge = await Challenge.create({
      userId,
      skillName,
      domain,
      difficulty,
      challengeContent,
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + SEVEN_DAYS_MS),
      status: "active",
    });

    logger.info("challenge.generate.success", {
      endpoint: ENDPOINT,
      userId,
      model: ai.model,
      latencyMs: Date.now() - startedAt,
      aiLatencyMs,
      inputTokens: ai.usage.inputTokens,
      outputTokens: ai.usage.outputTokens,
      attempts: ai.attempts,
      success: true,
    });

    return successResponse(
      {
        success: true,
        challengeId: challenge._id.toString(),
        challengeContent,
      },
      201
    );
  } catch (error) {
    const response = handleApiError(error, {
      error: "Failed to generate challenge",
      status: 500,
    });

    logger.error("challenge.generate.failure", {
      endpoint: ENDPOINT,
      userId,
      model: AI_CONFIG.model,
      latencyMs: Date.now() - startedAt,
      success: false,
      errorName: error instanceof Error ? error.name : "Unknown",
      statusCode: response.status,
    });

    return response;
  }
}
