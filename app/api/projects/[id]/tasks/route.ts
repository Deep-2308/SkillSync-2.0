import { NextRequest } from "next/server";
import { Types } from "mongoose";
import { z } from "zod";

import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Project, { type IProject } from "@/models/Project";
import { successResponse, handleApiError } from "@/lib/api/responses";
import {
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from "@/lib/errors";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const objectId = z
  .string()
  .refine((v) => Types.ObjectId.isValid(v), { message: "Invalid id" });

const createSchema = z.object({
  title: z.string().trim().min(1).max(140),
  assignedTo: objectId.nullish(),
  status: z.enum(["todo", "in-progress", "done"]).default("todo"),
});

const patchSchema = z.object({
  taskId: objectId,
  status: z.enum(["todo", "in-progress", "done"]).optional(),
  assignedTo: objectId.nullish(),
});

/** True when the user owns or is a member of the project. */
function isMember(project: Pick<IProject, "ownerId" | "members">, userId: string) {
  if (project.ownerId.toString() === userId) return true;
  return project.members.some((m) => m.userId?.toString() === userId);
}

// ─── GET: list tasks (members only) ────────────────────────────────────────────
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new UnauthorizedError();

    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) throw new NotFoundError("Project not found");

    await dbConnect();

    const project = await Project.findById(id).select("ownerId members tasks");
    if (!project) throw new NotFoundError("Project not found");
    if (!isMember(project, userId)) {
      throw new ForbiddenError("You are not a member of this project");
    }

    return successResponse({ success: true, tasks: project.tasks });
  } catch (error) {
    return handleApiError(error, { error: "Failed to list tasks", status: 500 });
  }
}

// ─── POST: create task (members only) ──────────────────────────────────────────
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new UnauthorizedError();

    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) throw new NotFoundError("Project not found");

    const body = await request.json();
    const { title, assignedTo, status } = createSchema.parse(body);

    await dbConnect();

    const project = await Project.findById(id);
    if (!project) throw new NotFoundError("Project not found");
    if (!isMember(project, userId)) {
      throw new ForbiddenError("You are not a member of this project");
    }

    if (
      assignedTo &&
      !project.members.some((m) => m.userId?.toString() === assignedTo) &&
      project.ownerId.toString() !== assignedTo
    ) {
      throw new ValidationError("Assignee must be a project member");
    }

    project.tasks.push({
      title,
      assignedTo: assignedTo ? new Types.ObjectId(assignedTo) : null,
      status,
      createdAt: new Date(),
    } as (typeof project.tasks)[number]);

    await project.save();

    const created = project.tasks[project.tasks.length - 1];
    return successResponse({ success: true, task: created }, 201);
  } catch (error) {
    return handleApiError(error, { error: "Failed to create task", status: 500 });
  }
}

// ─── PATCH: update status / assignee (members only) ────────────────────────────
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new UnauthorizedError();

    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) throw new NotFoundError("Project not found");

    const body = await request.json();
    const { taskId, status, assignedTo } = patchSchema.parse(body);

    await dbConnect();

    const project = await Project.findById(id);
    if (!project) throw new NotFoundError("Project not found");
    if (!isMember(project, userId)) {
      throw new ForbiddenError("You are not a member of this project");
    }

    const task = project.tasks.find((t) => t._id.toString() === taskId);
    if (!task) throw new NotFoundError("Task not found");

    if (status) task.status = status;
    if (assignedTo !== undefined) {
      task.assignedTo = assignedTo ? new Types.ObjectId(assignedTo) : null;
    }

    await project.save();

    return successResponse({ success: true, task });
  } catch (error) {
    return handleApiError(error, { error: "Failed to update task", status: 500 });
  }
}
