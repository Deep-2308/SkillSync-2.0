import { NextRequest } from "next/server";

import { auth } from "@/auth";
import { getPublicProfile } from "@/lib/profile";
import { successResponse, handleApiError } from "@/lib/api/responses";
import { NotFoundError } from "@/lib/errors";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Private challenge stats are only included when you view your own profile.
    const session = await auth();
    const includePrivate = session?.user?.id === id;

    const profile = await getPublicProfile(id, includePrivate);
    if (!profile) throw new NotFoundError("User not found");

    return successResponse({
      user: profile.user,
      badges: profile.badges,
      projects: profile.projects,
      avgScore: profile.avgScore,
      ...(profile.privateStats ? { privateStats: profile.privateStats } : {}),
    });
  } catch (error) {
    return handleApiError(error, { error: "Failed to get user", status: 500 });
  }
}
