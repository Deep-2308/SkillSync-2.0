import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { PRIMARY_DOMAINS, type PrimaryDomain } from "@/lib/constants";

export { PRIMARY_DOMAINS };
export type { PrimaryDomain };

export interface PublicUser {
  id: string;
  name: string;
  image?: string;
  bio?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  primaryDomain?: PrimaryDomain;
  selectedSkills: string[];
  badgeCount: number;
  projectCount: number;
  createdAt: Date;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  /** Bcrypt hash. Only set for credentials accounts. select: false. */
  password?: string;
  emailVerified?: Date | null;
  image?: string;
  bio?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  primaryDomain?: PrimaryDomain;
  selectedSkills: string[];
  badgeCount: number;
  projectCount: number;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  toPublicJSON(): PublicUser;
}

export type UserModel = Model<IUser, Record<string, never>, IUserMethods>;

const UserSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      select: false,
    },
    emailVerified: {
      type: Date,
      default: null,
    },
    image: {
      type: String,
    },
    bio: {
      type: String,
      maxlength: [300, "Bio cannot exceed 300 characters"],
    },
    githubUrl: {
      type: String,
    },
    portfolioUrl: {
      type: String,
    },
    primaryDomain: {
      type: String,
      enum: PRIMARY_DOMAINS,
    },
    selectedSkills: {
      type: [String],
      default: [],
      validate: {
        validator: (skills: string[]) => skills.length <= 8,
        message: "You can select up to 8 skills",
      },
    },
    badgeCount: {
      type: Number,
      default: 0,
    },
    projectCount: {
      type: Number,
      default: 0,
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.method("toPublicJSON", function (this: IUser): PublicUser {
  return {
    id: this._id.toString(),
    name: this.name,
    image: this.image,
    bio: this.bio,
    githubUrl: this.githubUrl,
    portfolioUrl: this.portfolioUrl,
    primaryDomain: this.primaryDomain,
    selectedSkills: this.selectedSkills,
    badgeCount: this.badgeCount,
    projectCount: this.projectCount,
    createdAt: this.createdAt,
  };
});

const User: UserModel =
  (mongoose.models.User as UserModel) ||
  mongoose.model<IUser, UserModel>("User", UserSchema);

export default User;
