import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  role: "student" | "teacher";
  bio?: string;
  skills: string[];
  university?: string;
  branch?: string;
  semester?: number;
  socials: {
    github?: string;
    linkedin?: string;
    website?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true 
    },
    password: { 
      type: String, 
      select: false 
    },
    image: { 
      type: String 
    },
    role: { 
      type: String, 
      enum: ["student", "teacher"], 
      default: "student" 
    },
    bio: { 
      type: String 
    },
    skills: { 
      type: [String], 
      default: [] 
    },
    university: { 
      type: String 
    },
    branch: { 
      type: String 
    },
    semester: { 
      type: Number 
    },
    socials: {
      github: { type: String },
      linkedin: { type: String },
      website: { type: String },
    },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>("User", UserSchema);

export default User;