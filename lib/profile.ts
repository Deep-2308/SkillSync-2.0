import "server-only";
import { Types } from "mongoose";

import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Badge from "@/models/Badge";
import Project from "@/models/Project";
import Challenge from "@/models/Challenge";
import type { Difficulty } from "@/models/Badge";
import type { ProjectStatus } from "@/models/Project";

export interface ProfileUser {
  id: string;
  name: string;
  image?: string;
  bio?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  primaryDomain?: string;
  selectedSkills: string[];
  badgeCount: number;
  projectCount: number;
  createdAt: string;
}

export interface ProfileBadge {
  id: string;
  skillName: string;
  domain: string;
  difficulty?: Difficulty;
  score: number;
  badgeSummary?: string;
  issuedAt: string;
}

export interface ProfileProject {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  tags: string[];
  myRole: string;
  teamSize: number;
}

export interface PrivateStats {
  totalAttempts: number;
  evaluated: number;
  passed: number;
}

export interface PublicProfile {
  user: ProfileUser;
  badges: ProfileBadge[];
  projects: ProfileProject[];
  avgScore: number;
  privateStats?: PrivateStats;
}

type LeanBadge = {
  _id: Types.ObjectId;
  skillName: string;
  domain: string;
  difficulty?: Difficulty;
  score: number;
  badgeSummary?: string;
  issuedAt: Date;
};

type LeanProject = {
  _id: Types.ObjectId;
  title: string;
  description: string;
  status: ProjectStatus;
  tags: string[];
  ownerId: Types.ObjectId;
  ownerRole: string;
  members?: { userId?: Types.ObjectId; role: string }[];
};

/**
 * Aggregate a user's public profile: their record, verified badges (highest
 * score first), and the projects they own or belong to. When `includePrivate`
 * is set (the viewer is the owner), challenge-attempt stats are included.
 *
 * Returns null when the id is malformed or the user doesn't exist.
 */
export async function getPublicProfile(
  id: string,
  includePrivate = false
): Promise<PublicProfile | null> {
  if (!Types.ObjectId.isValid(id)) return null;

  await dbConnect();

  // password has `select: false`, so it's never returned here.
  const user = await User.findById(id);
  if (!user) return null;

  const [badges, projects] = await Promise.all([
    Badge.find({ userId: id }).sort({ score: -1 }).lean<LeanBadge[]>(),
    Project.find({ $or: [{ ownerId: id }, { "members.userId": id }] })
      .select("title description status tags ownerId ownerRole members")
      .sort({ createdAt: -1 })
      .lean<LeanProject[]>(),
  ]);

  const mappedBadges: ProfileBadge[] = badges.map((b) => ({
    id: b._id.toString(),
    skillName: b.skillName,
    domain: b.domain,
    difficulty: b.difficulty,
    score: b.score,
    badgeSummary: b.badgeSummary,
    issuedAt: b.issuedAt.toISOString(),
  }));

  const mappedProjects: ProfileProject[] = projects.map((p) => {
    const isOwner = p.ownerId.toString() === id;
    const memberRole = p.members?.find(
      (m) => m.userId?.toString() === id
    )?.role;
    return {
      id: p._id.toString(),
      title: p.title,
      description: p.description,
      status: p.status,
      tags: p.tags ?? [],
      myRole: isOwner ? p.ownerRole : memberRole ?? "Member",
      teamSize: p.members?.length ?? 0,
    };
  });

  const avgScore = mappedBadges.length
    ? Math.round(
        mappedBadges.reduce((sum, b) => sum + b.score, 0) / mappedBadges.length
      )
    : 0;

  const profileUser: ProfileUser = {
    id: user._id.toString(),
    name: user.name,
    image: user.image,
    bio: user.bio,
    githubUrl: user.githubUrl,
    portfolioUrl: user.portfolioUrl,
    primaryDomain: user.primaryDomain,
    selectedSkills: user.selectedSkills ?? [],
    badgeCount: mappedBadges.length,
    projectCount: mappedProjects.length,
    createdAt: user.createdAt.toISOString(),
  };

  let privateStats: PrivateStats | undefined;
  if (includePrivate) {
    const [totalAttempts, evaluated] = await Promise.all([
      Challenge.countDocuments({ userId: id }),
      Challenge.countDocuments({ userId: id, status: "evaluated" }),
    ]);
    privateStats = {
      totalAttempts,
      evaluated,
      passed: mappedBadges.length,
    };
  }

  return {
    user: profileUser,
    badges: mappedBadges,
    projects: mappedProjects,
    avgScore,
    privateStats,
  };
}
