import { IUser } from "@/models/User";
import { IChallenge } from "@/models/Challenge";
import { IBadge } from "@/models/Badge";
import { IProject, IProjectMember, IProjectApplication, IProjectTask } from "@/models/Project";

// ─── Re-exports for convenience ─────────────────────────────────────────────

export type { IUser, IChallenge, IBadge, IProject, IProjectMember, IProjectApplication, IProjectTask };

// ─── API Response Types ─────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── Auth Types ─────────────────────────────────────────────────────────────

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  onboarded: boolean;
}

// ─── Challenge Types ────────────────────────────────────────────────────────

export interface ChallengeGenerateRequest {
  skill: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
}

export interface ChallengeSubmitRequest {
  solution: string;
  language?: string;
}

export interface ChallengeEvaluation {
  score: number;
  feedback: string;
  passed: boolean;
  badgeEarned?: {
    level: string;
    title: string;
  };
}

// ─── Project Types ──────────────────────────────────────────────────────────

export interface ProjectCreateRequest {
  title: string;
  description: string;
  category: string;
  techStack: string[];
  requiredSkills: string[];
  maxTeamSize: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  timeline: string;
}

export interface ProjectAnalysis {
  feasibility: number;
  suggestions: string[];
  estimatedDuration: string;
  recommendedTeamComposition: string[];
}

export interface ProjectApplicationRequest {
  message: string;
  role: string;
  relevantSkills: string[];
}

// ─── Skill Types ────────────────────────────────────────────────────────────

export interface SkillWithBadge {
  name: string;
  badge?: IBadge;
  challengeCount: number;
  highestScore: number;
}

// ─── Component Props ────────────────────────────────────────────────────────

export interface BadgeDisplayProps {
  badge: IBadge;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

export interface ProjectCardProps {
  project: IProject;
  showActions?: boolean;
  onApply?: (projectId: string) => void;
}

export interface SkillCardProps {
  skill: SkillWithBadge;
  onChallenge?: (skillName: string) => void;
}

// ─── Navigation Types ───────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  badge?: string | number;
}

export interface SidebarSection {
  title: string;
  items: NavItem[];
}
