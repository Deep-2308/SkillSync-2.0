import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type Difficulty = "beginner" | "intermediate" | "advanced";
export type ChallengeStatus = "active" | "submitted" | "evaluated" | "expired";

export interface IChallengeContent {
  title: string;
  context: string;
  requirements: string[];
  deliverables: string[];
  evaluationCriteria: string[];
  estimatedMinutes: number;
}

export interface IChallengeSubmission {
  textContent?: string;
  url?: string;
  submittedAt?: Date;
}

export interface IScoreBreakdown {
  completeness: number;
  quality: number;
  accuracy: number;
  depth: number;
}

export interface IChallengeEvaluation {
  score: number;
  passed: boolean;
  scoreBreakdown?: IScoreBreakdown;
  overallFeedback: string;
  strengths: string[];
  improvements: string[];
  badgeSummary: string;
  evaluatedAt: Date;
}

export interface IChallenge extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  skillName: string;
  domain: string;
  difficulty: Difficulty;
  challengeContent: IChallengeContent;
  generatedAt: Date;
  expiresAt: Date;
  status: ChallengeStatus;
  submission?: IChallengeSubmission;
  evaluation?: IChallengeEvaluation;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const ChallengeContentSchema = new Schema<IChallengeContent>(
  {
    title: { type: String, required: true },
    context: { type: String, required: true },
    requirements: { type: [String], default: [] },
    deliverables: { type: [String], default: [] },
    evaluationCriteria: { type: [String], default: [] },
    estimatedMinutes: { type: Number },
  },
  { _id: false }
);

const ChallengeSubmissionSchema = new Schema<IChallengeSubmission>(
  {
    textContent: { type: String },
    url: { type: String },
    submittedAt: { type: Date },
  },
  { _id: false }
);

const ChallengeEvaluationSchema = new Schema<IChallengeEvaluation>(
  {
    score: { type: Number, min: 0, max: 100 },
    passed: { type: Boolean },
    scoreBreakdown: {
      type: new Schema<IScoreBreakdown>(
        {
          completeness: { type: Number, min: 0, max: 25 },
          quality: { type: Number, min: 0, max: 30 },
          accuracy: { type: Number, min: 0, max: 25 },
          depth: { type: Number, min: 0, max: 20 },
        },
        { _id: false }
      ),
    },
    overallFeedback: { type: String },
    strengths: { type: [String], default: [] },
    improvements: { type: [String], default: [] },
    badgeSummary: { type: String },
    evaluatedAt: { type: Date },
  },
  { _id: false }
);

const ChallengeSchema = new Schema<IChallenge>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  skillName: {
    type: String,
    required: true,
  },
  domain: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    required: true,
  },
  challengeContent: {
    type: ChallengeContentSchema,
    required: true,
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + SEVEN_DAYS_MS),
  },
  status: {
    type: String,
    enum: ["active", "submitted", "evaluated", "expired"],
    default: "active",
    index: true,
  },
  submission: ChallengeSubmissionSchema,
  evaluation: ChallengeEvaluationSchema,
});

ChallengeSchema.index({ userId: 1, status: 1 });

const Challenge: Model<IChallenge> =
  (mongoose.models.Challenge as Model<IChallenge>) ||
  mongoose.model<IChallenge>("Challenge", ChallengeSchema);

export default Challenge;
