import { notFound, redirect } from "next/navigation";
import { Types } from "mongoose";

import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Challenge from "@/models/Challenge";
import Badge from "@/models/Badge";
import type { Difficulty } from "@/models/Challenge";
import {
  ResultExperience,
  type ResultData,
} from "@/components/skills/ResultExperience";

interface PageProps {
  params: Promise<{ challengeId: string }>;
}

type LeanChallenge = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  skillName: string;
  domain: string;
  difficulty: Difficulty;
  status: string;
  evaluation?: {
    score: number;
    passed: boolean;
    scoreBreakdown?: {
      completeness: number;
      quality: number;
      accuracy: number;
      depth: number;
    };
    overallFeedback: string;
    strengths: string[];
    improvements: string[];
    badgeSummary: string;
    evaluatedAt: Date;
  };
};

type LeanBadge = {
  _id: Types.ObjectId;
  issuedAt: Date;
};

// Each breakdown metric is scored out of a different max — used to normalise
// into the 0–100 percentages the UI renders.
const METRIC_MAX = {
  completeness: 25,
  quality: 30,
  accuracy: 25,
  depth: 20,
} as const;

export default async function ResultPage({ params }: PageProps) {
  const { challengeId } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  if (!Types.ObjectId.isValid(challengeId)) notFound();

  await dbConnect();

  const challenge = await Challenge.findById(challengeId).lean<LeanChallenge>();
  if (!challenge) notFound();

  // Ownership: 404 rather than 403 so we don't leak that the id exists.
  if (challenge.userId.toString() !== session.user.id) notFound();

  // Nothing to show until the submission has been evaluated.
  if (challenge.status !== "evaluated" || !challenge.evaluation) {
    redirect("/skills/prove");
  }

  const evaluation = challenge.evaluation;

  // Fall back to a proportional breakdown for any legacy record saved before
  // scoreBreakdown was persisted.
  const breakdown =
    evaluation.scoreBreakdown ??
    {
      completeness: Math.round((evaluation.score / 100) * METRIC_MAX.completeness),
      quality: Math.round((evaluation.score / 100) * METRIC_MAX.quality),
      accuracy: Math.round((evaluation.score / 100) * METRIC_MAX.accuracy),
      depth: Math.round((evaluation.score / 100) * METRIC_MAX.depth),
    };

  let badgeId: string | undefined;
  let issuedAt: Date = evaluation.evaluatedAt;
  if (evaluation.passed) {
    const badge = await Badge.findOne({ challengeId: challenge._id }).lean<LeanBadge>();
    if (badge) {
      badgeId = badge._id.toString();
      issuedAt = badge.issuedAt;
    }
  }

  const metrics: ResultData["metrics"] = [
    {
      label: "Completeness",
      value: breakdown.completeness,
      max: METRIC_MAX.completeness,
    },
    { label: "Quality", value: breakdown.quality, max: METRIC_MAX.quality },
    { label: "Accuracy", value: breakdown.accuracy, max: METRIC_MAX.accuracy },
    { label: "Depth", value: breakdown.depth, max: METRIC_MAX.depth },
  ];

  const data: ResultData = {
    challengeId: challenge._id.toString(),
    skillName: challenge.skillName,
    domain: challenge.domain,
    difficulty: challenge.difficulty,
    score: evaluation.score,
    passed: evaluation.passed,
    metrics,
    overallFeedback: evaluation.overallFeedback,
    strengths: evaluation.strengths,
    improvements: evaluation.improvements,
    badgeSummary: evaluation.badgeSummary,
    badgeId,
    issuedAt: issuedAt.toISOString(),
  };

  return <ResultExperience data={data} />;
}
