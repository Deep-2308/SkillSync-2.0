import { NextRequest } from "next/server";
import { Types } from "mongoose";
import { z } from "zod";

import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import { successResponse, handleApiError } from "@/lib/api/responses";
import {
  UnauthorizedError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import { logger } from "@/lib/logger";

const ENDPOINT = "POST /api/projects/[id]/apply";

const applySchema = z.object({
  roleId: z.string().refine((v) => Types.ObjectId.isValid(v), {
    message: "Invalid role id",
  }),
  message: z.string().trim().min(20).max(1000),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const startedAt = Date.now();
  const session = await auth();
  const userId = session?.user?.id;

  try {
    if (!userId) throw new UnauthorizedError();

    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) throw new NotFoundError("Project not found");

    const body = await request.json();
    const { roleId, message } = applySchema.parse(body);

    await dbConnect();

    const project = await Project.findById(id);
    if (!project) throw new NotFoundError("Project not found");

    if (project.ownerId.toString() === userId) {
      throw new ValidationError("You can't apply to your own project.");
    }
    if (project.status !== "recruiting") {
      throw new ValidationError("This project is no longer recruiting.");
    }

    const role = project.roles.find((r) => r._id.toString() === roleId);
    if (!role) throw new NotFoundError("Role not found");
    if (role.isFilled) throw new ValidationError("This role is already filled.");

    const alreadyApplied = project.applications.some(
      (a) =>
        a.userId.toString() === userId &&
        a.roleId.toString() === roleId &&
        a.status === "pending"
    );
    if (alreadyApplied) {
      throw new ValidationError("You've already applied for this role.");
    }

    project.applications.push({
      userId: new Types.ObjectId(userId),
      roleId: new Types.ObjectId(roleId),
      message,
      status: "pending",
      appliedAt: new Date(),
    } as (typeof project.applications)[number]);

    await project.save();

    logger.info("project.apply.success", {
      endpoint: ENDPOINT,
      userId,
      latencyMs: Date.now() - startedAt,
      success: true,
    });

    return successResponse({ success: true }, 201);
  } catch (error) {
    const response = handleApiError(error, {
      error: "Failed to apply to project",
      status: 500,
    });

    logger.error("project.apply.failure", {
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
