import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ZodError } from "zod";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { registerSchema } from "@/lib/validations";

const SALT_ROUNDS = 12;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = registerSchema.parse(body);
    const normalizedEmail = email.toLowerCase().trim();

    await dbConnect();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    console.error("[auth/register] Failed to register user:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
