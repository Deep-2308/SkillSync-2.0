import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { onboardingProfileSchema } from "@/lib/validations";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const user = await User.findById(session.user.id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user: user.toPublicJSON() });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = onboardingProfileSchema.parse(body);

    await dbConnect();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.primaryDomain = data.primaryDomain;
    user.selectedSkills = data.selectedSkills;
    if (data.bio !== undefined) user.bio = data.bio;
    if (data.githubUrl !== undefined) user.githubUrl = data.githubUrl;
    if (data.portfolioUrl !== undefined) user.portfolioUrl = data.portfolioUrl;
    if (data.onboardingCompleted !== undefined) {
      user.onboardingCompleted = data.onboardingCompleted;
    }

    await user.save();

    return NextResponse.json({ success: true, user: user.toPublicJSON() });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error("[users/me] PATCH failed:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
