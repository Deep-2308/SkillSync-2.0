import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type ProjectStatus =
  | "recruiting"
  | "building"
  | "completed"
  | "abandoned";
export type Complexity = "low" | "medium" | "high";
export type ApplicationStatus = "pending" | "accepted" | "declined";
export type TaskStatus = "todo" | "in-progress" | "done";

export interface IProjectAnalysis {
  summary: string;
  problemStatement: string;
  targetOutcome: string;
  estimatedDuration: string;
  complexity: Complexity;
  analyzedAt: Date;
}

export interface IProjectRole {
  _id: Types.ObjectId;
  title: string;
  description: string;
  requiredSkills: string[];
  importance: string;
  isFilled: boolean;
  assignedUserId?: Types.ObjectId | null;
}

export interface IProjectApplication {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  roleId: Types.ObjectId;
  message: string;
  status: ApplicationStatus;
  appliedAt: Date;
}

export interface IProjectMember {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  role: string;
  joinedAt: Date;
}

export interface IProjectTask {
  _id: Types.ObjectId;
  title: string;
  assignedTo?: Types.ObjectId | null;
  status: TaskStatus;
  createdAt: Date;
}

export interface IProject extends Document {
  _id: Types.ObjectId;
  ownerId: Types.ObjectId;
  title: string;
  description: string;
  ownerRole: string;
  status: ProjectStatus;
  tags: string[];
  aiAnalysis?: IProjectAnalysis;
  roles: IProjectRole[];
  applications: IProjectApplication[];
  members: IProjectMember[];
  tasks: IProjectTask[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectAnalysisSchema = new Schema<IProjectAnalysis>(
  {
    summary: { type: String },
    problemStatement: { type: String },
    targetOutcome: { type: String },
    estimatedDuration: { type: String },
    complexity: { type: String, enum: ["low", "medium", "high"] },
    analyzedAt: { type: Date },
  },
  { _id: false }
);

const ProjectRoleSchema = new Schema<IProjectRole>({
  title: { type: String, required: true },
  description: { type: String },
  requiredSkills: { type: [String], default: [] },
  importance: { type: String },
  isFilled: { type: Boolean, default: false },
  assignedUserId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
});

const ProjectApplicationSchema = new Schema<IProjectApplication>({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  roleId: { type: Schema.Types.ObjectId },
  message: { type: String },
  status: {
    type: String,
    enum: ["pending", "accepted", "declined"],
    default: "pending",
  },
  appliedAt: { type: Date, default: Date.now },
});

const ProjectMemberSchema = new Schema<IProjectMember>({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  role: { type: String },
  joinedAt: { type: Date, default: Date.now },
});

const ProjectTaskSchema = new Schema<IProjectTask>({
  title: { type: String, required: true },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  status: {
    type: String,
    enum: ["todo", "in-progress", "done"],
    default: "todo",
  },
  createdAt: { type: Date, default: Date.now },
});

const ProjectSchema = new Schema<IProject>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    ownerRole: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["recruiting", "building", "completed", "abandoned"],
      default: "recruiting",
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    aiAnalysis: ProjectAnalysisSchema,
    roles: [ProjectRoleSchema],
    applications: [ProjectApplicationSchema],
    members: [ProjectMemberSchema],
    tasks: [ProjectTaskSchema],
  },
  {
    timestamps: true,
  }
);

ProjectSchema.index({ createdAt: -1 });

const Project: Model<IProject> =
  (mongoose.models.Project as Model<IProject>) ||
  mongoose.model<IProject>("Project", ProjectSchema);

export default Project;
