import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface IBadge extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  challengeId: Types.ObjectId;
  skillName: string;
  domain: string;
  difficulty: Difficulty;
  score: number;
  badgeSummary: string;
  issuedAt: Date;
}

const BadgeSchema = new Schema<IBadge>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  challengeId: {
    type: Schema.Types.ObjectId,
    ref: "Challenge",
    required: true,
  },
  skillName: {
    type: String,
    required: true,
    index: true,
  },
  domain: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
  },
  score: {
    type: Number,
    required: true,
  },
  badgeSummary: {
    type: String,
  },
  issuedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

const Badge: Model<IBadge> =
  (mongoose.models.Badge as Model<IBadge>) ||
  mongoose.model<IBadge>("Badge", BadgeSchema);

export default Badge;
