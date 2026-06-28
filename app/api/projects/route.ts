import { NextRequest } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import User from "@/models/User";
import { successResponse, handleApiError } from "@/lib/api/responses";
import { UnauthorizedError } from "@/lib/errors";
import { logger } from "@/lib/logger";

const ENDPOINT = "/api/projects";
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 48;

// ─── GET: discovery feed ───────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") ?? "recruiting";
    const skill = searchParams.get("skill")?.trim();
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, Number(searchParams.get("limit")) || DEFAULT_LIMIT)
    );

    const filter: Record<string, unknown> = {};
    if (status && status !== "all") filter.status = status;
    if (skill) filter["roles.requiredSkills"] = skill;

    const [total, projects] = await Promise.all([
      Project.countDocuments(filter),
      Project.find(filter)
        .populate("ownerId", "name image primaryDomain")
        .populate("members.userId", "name image")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    return successResponse({
      projects,
      total,
      page,
      hasMore: page * limit < total,
    });
  } catch (error) {
    return handleApiError(error, {
      error: "Failed to list projects",
      status: 500,
    });
  }
}

// ─── POST: create project ──────────────────────────────────────────────────────
const roleInputSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1),
  requiredSkills: z.array(z.string().trim().min(1)).min(1).max(12),
  importance: z.string().trim().default(""),
});

const analysisInputSchema = z
  .object({
    summary: z.string(),
    problemStatement: z.string(),
    targetOutcome: z.string(),
    estimatedDuration: z.string(),
    complexity: z.enum(["low", "medium", "high"]),
    tags: z.array(z.string()).default([]),
  })
  .optional();

const createSchema = z.object({
  title: z.string().trim().min(5).max(120),
  description: z.string().trim().min(30).max(2000),
  ownerRole: z.string().trim().min(2),
  aiAnalysis: analysisInputSchema,
  roles: z.array(roleInputSchema).min(1).max(8),
});

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  const session = await auth();
  const userId = session?.user?.id;

  try {
    if (!userId) throw new UnauthorizedError();

    const body = await request.json();
    const { title, description, ownerRole, aiAnalysis, roles } =
      createSchema.parse(body);

    await dbConnect();

    const project = await Project.create({
      ownerId: userId,
      title,
      description,
      ownerRole,
      status: "recruiting",
      tags: aiAnalysis?.tags ?? [],
      aiAnalysis: aiAnalysis
        ? {
            summary: aiAnalysis.summary,
            problemStatement: aiAnalysis.problemStatement,
            targetOutcome: aiAnalysis.targetOutcome,
            estimatedDuration: aiAnalysis.estimatedDuration,
            complexity: aiAnalysis.complexity,
            analyzedAt: new Date(),
          }
        : undefined,
      roles: roles.map((r) => ({
        title: r.title,
        description: r.description,
        requiredSkills: r.requiredSkills,
        importance: r.importance,
        isFilled: false,
      })),
      // The creator is the first member of their own project.
      members: [{ userId, role: ownerRole, joinedAt: new Date() }],
    });

    await User.updateOne({ _id: userId }, { $inc: { projectCount: 1 } });

    logger.info("project.create.success", {
      endpoint: `POST ${ENDPOINT}`,
      userId,
      latencyMs: Date.now() - startedAt,
      success: true,
    });

    return successResponse(
      { success: true, projectId: project._id.toString() },
      201
    );
  } catch (error) {
    const response = handleApiError(error, {
      error: "Failed to create project",
      status: 500,
    });

    logger.error("project.create.failure", {
      endpoint: `POST ${ENDPOINT}`,
      userId,
      latencyMs: Date.now() - startedAt,
      success: false,
      errorName: error instanceof Error ? error.name : "Unknown",
      statusCode: response.status,
    });

    return response;
  }
}
