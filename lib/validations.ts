import { z } from "zod";
import { PRIMARY_DOMAINS } from "@/lib/constants";

// ─── Auth Validations ────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Signup form (client) — includes the Builder/Learner role toggle.
export const authSignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["Builder", "Learner"]),
});

// Onboarding — final profile payload sent to PATCH /api/users/me.
export const onboardingProfileSchema = z.object({
  primaryDomain: z.enum(PRIMARY_DOMAINS),
  selectedSkills: z
    .array(z.string())
    .min(1, "Select at least one skill")
    .max(8, "You can select up to 8 skills"),
  bio: z
    .string()
    .max(300, "Bio must be under 300 characters")
    .optional()
    .or(z.literal("")),
  githubUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  portfolioUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  onboardingCompleted: z.boolean().optional(),
});

// ─── Onboarding Validations ─────────────────────────────────────────────────

export const onboardingSchema = z.object({
  bio: z.string().min(10, "Bio must be at least 10 characters").max(500, "Bio must be under 500 characters"),
  skills: z.array(z.string()).min(1, "Select at least one skill"),
  interests: z.array(z.string()).min(1, "Select at least one interest"),
  experience: z.enum(["beginner", "intermediate", "advanced", "expert"]),
  github: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  linkedin: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  portfolio: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

// ─── Project Validations ────────────────────────────────────────────────────

export const projectSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be under 100 characters"),
  description: z.string().min(20, "Description must be at least 20 characters").max(2000, "Description must be under 2000 characters"),
  category: z.string().min(1, "Please select a category"),
  techStack: z.array(z.string()).min(1, "Select at least one technology"),
  requiredSkills: z.array(z.string()).min(1, "Define at least one required skill"),
  maxTeamSize: z.number().min(2, "Team must have at least 2 members").max(20, "Team cannot exceed 20 members"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  timeline: z.string().min(1, "Please set a timeline"),
});

// ─── Challenge Validations ──────────────────────────────────────────────────

export const challengeGenerateSchema = z.object({
  skill: z.string().min(1, "Skill name is required"),
  difficulty: z.enum(["beginner", "intermediate", "advanced", "expert"]),
});

export const challengeSubmitSchema = z.object({
  challengeId: z.string().min(1, "Challenge ID is required"),
  solution: z.string().min(1, "Solution is required"),
  language: z.string().optional(),
});

// ─── Application Validations ────────────────────────────────────────────────

export const applicationSchema = z.object({
  message: z.string().min(20, "Application message must be at least 20 characters").max(1000, "Message must be under 1000 characters"),
  role: z.string().min(1, "Please specify your desired role"),
  relevantSkills: z.array(z.string()).min(1, "Highlight at least one relevant skill"),
});

// ─── Type Exports ───────────────────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type AuthSignupInput = z.infer<typeof authSignupSchema>;
export type OnboardingProfileInput = z.infer<typeof onboardingProfileSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type ChallengeGenerateInput = z.infer<typeof challengeGenerateSchema>;
export type ChallengeSubmitInput = z.infer<typeof challengeSubmitSchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
