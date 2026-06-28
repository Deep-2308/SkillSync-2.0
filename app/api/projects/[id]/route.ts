import { NextRequest } from "next/server";
import { Types } from "mongoose";

import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import Badge from "@/models/Badge";
import User from "@/models/User";
import { successResponse, handleApiError } from "@/lib/api/responses";
import { NotFoundError } from "@/lib/errors";

// Ensure the User model is registered for population (referenced by ref).
void User;

interface RouteParams {
  params: Promise<{ id: string }>;
}

type LeanBadge = {
  userId: Types.ObjectId;
  skillName: string;
  difficulty?: string;
  score: number;
};

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) throw new NotFoundError("Project not found");

    await dbConnect();

    const project = await Project.findById(id)
      .populate("ownerId", "name image primaryDomain bio")
      .populate("members.userId", "name image primaryDomain")
      .populate("applications.userId", "name image")
      .lean<Record<string, unknown> & { _id: Types.ObjectId }>();

    if (!project) throw new NotFoundError("Project not found");

    // Gather verified badges for the owner + members so the team section can
    // render each person's proven skills.
    const memberIds = Array.isArray(project.members)
      ? (project.members as { userId?: { _id?: Types.ObjectId } }[])
          .map((m) => m.userId?._id)
          .filter(Boolean)
      : [];
    const ownerId = (project.ownerId as { _id?: Types.ObjectId } | undefined)?._id;
    const userIds = [ownerId, ...memberIds].filter(Boolean) as Types.ObjectId[];

    const badges = userIds.length
      ? await Badge.find({ userId: { $in: userIds } })
          .select("userId skillName difficulty score")
          .lean<LeanBadge[]>()
      : [];

    const badgesByUser: Record<
      string,
      { skillName: string; difficulty?: string; score: number }[]
    > = {};
    for (const b of badges) {
      const key = b.userId.toString();
      (badgesByUser[key] ??= []).push({
        skillName: b.skillName,
        difficulty: b.difficulty,
        score: b.score,
      });
    }

    return successResponse({ success: true, project, badgesByUser });
  } catch (error) {
    return handleApiError(error, {
      error: "Failed to get project",
      status: 500,
    });
  }
}
