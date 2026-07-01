import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Challenge from "@/models/Challenge";
import Badge from "@/models/Badge";
import User from "@/models/User";
import { runAICompletion } from "@/lib/ai/orchestrator";
import {
  buildEvaluationSystemPrompt,
  evaluationResponseSchema,
} from "@/lib/prompts/evaluation";
import { successResponse, handleApiError } from "@/lib/api/responses";
import {
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from "@/lib/errors";
import { logger } from "@/lib/logger";

const ENDPOINT = "POST /api/skills/challenge/[challengeId]/submit";


const TOO_SHORT_MESSAGE =
  "Submission too short. Please provide a detailed response (minimum 150 characters).";

const inputSchema = z.object({
  textContent: z
    .string()
    .trim()
    .min(150, { message: TOO_SHORT_MESSAGE })
    .max(8000, { message: "Submission too long (maximum 8000 characters)." }),
  url: z.string().url().optional(),
});

interface RouteParams {
  params: Promise<{ challengeId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const startedAt = Date.now();
  const session = await auth();
  const userId = session?.user?.id;

  try {
    // 1. AUTH + OWNERSHIP + STATE
    if (!userId) throw new UnauthorizedError();

    const { challengeId } = await params;

    await dbConnect();

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) throw new NotFoundError("Challenge not found");

    if (challenge.userId.toString() !== userId) {
      throw new ForbiddenError("You do not own this challenge");
    }

    if (challenge.status !== "active") {
      throw new ValidationError(
        "This challenge has already been submitted."
      );
    }

    // 2. INPUT VALIDATION
    // Surface the exact "too short" message instead of the generic Zod payload.
    const body = await request.json();
    const parsed = inputSchema.safeParse(body);
    if (!parsed.success) {
      const message =
        parsed.error.issues.find((i) => i.path[0] === "textContent")?.message ??
        "Validation failed";
      throw new ValidationError(message);
    }
    const { textContent, url } = parsed.data;

    // 3 + 4. PROMPT + AI CALL (flash, low temperature for consistency).
    const system = buildEvaluationSystemPrompt({
      domain: challenge.domain,
      difficulty: challenge.difficulty,
      challengeContent: challenge.challengeContent,
      textContent,
      url,
    });

    const evaluation = await runAICompletion({
      task: "evaluation",
      request: {
        systemPrompt: system,
        userPrompt: "Evaluate the submission now. Respond with the JSON object only.",
      },
      schema: evaluationResponseSchema,
      semanticValidator: (data) => {
        if (!data.overallFeedback || data.overallFeedback.trim() === "") {
          throw new Error("Evaluation feedback cannot be empty");
        }
        if (data.score < 0 || data.score > 100) {
          throw new Error("Score must be between 0 and 100");
        }
      }
    });
    // Trust the rubric total over the model's self-reported boolean.
    const passed = evaluation.score >= 70;

    // 6. PERSIST
    const now = new Date();

    challenge.submission = {
      textContent,
      url,
      submittedAt: now,
    };
    challenge.evaluation = {
      score: evaluation.score,
      passed,
      scoreBreakdown: evaluation.scoreBreakdown,
      overallFeedback: evaluation.overallFeedback,
      strengths: evaluation.strengths,
      improvements: evaluation.improvements,
      badgeSummary: evaluation.badgeSummary,
      evaluatedAt: now,
    };
    challenge.status = "evaluated";
    await challenge.save();

    let badgeId: string | undefined;
    if (passed) {
      const badge = await Badge.create({
        userId: challenge.userId,
        challengeId: challenge._id,
        skillName: challenge.skillName,
        domain: challenge.domain,
        difficulty: challenge.difficulty,
        score: evaluation.score,
        badgeSummary: evaluation.badgeSummary,
        issuedAt: now,
      });
      badgeId = badge._id.toString();

      await User.updateOne({ _id: challenge.userId }, { $inc: { badgeCount: 1 } });
    }

    logger.info("challenge.submit.success", {
      endpoint: ENDPOINT,
      userId,
      latencyMs: Date.now() - startedAt,
      success: true,
      passed,
      score: evaluation.score,
    });

    // 7. RETURN
    return successResponse({
      success: true,
      passed,
      score: evaluation.score,
      scoreBreakdown: evaluation.scoreBreakdown,
      overallFeedback: evaluation.overallFeedback,
      strengths: evaluation.strengths,
      improvements: evaluation.improvements,
      badgeSummary: evaluation.badgeSummary,
      ...(badgeId ? { badgeId } : {}),
    });
  } catch (error) {
    const response = handleApiError(error, {
      error: "Failed to evaluate submission",
      status: 500,
    });

    logger.error("challenge.submit.failure", {
      endpoint: ENDPOINT,
      userId,
      latencyMs: Date.now() - startedAt,
      success: false,
      errorName: error instanceof Error ? error.name : "Unknown",
      statusCode: response.status,
    });

    return response;
  }
}
