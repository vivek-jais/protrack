import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  image?: string;
  role: "student" | "teacher" | "pending";
  bio?: string;
  skills: string[];
  university: string;
  phoneNumber?: number;
  branch: string;
  status: "occupied" | "vacant";
  semester?: number;
  socials: {
    github?: string;
    linkedin?: string;
    website?: string;
  };
  
  // 🔥 NEW: Added preferences to the TypeScript Interface
  preferences: {
    focusMode: boolean;
    defaultView: "list" | "grid";
    showOnlineStatus: boolean;
    dailyDigest: boolean;
  };
  
  createdAt: Date;
  updatedAt: Date;
  lastActive?: Date;
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
    image: {
      type: String
    },
    phoneNumber:{
      type: Number,
    },
    role: {
      type: String,
      enum: ["student", "teacher", "pending"],
      default: "pending"
    },
    bio: {
      type: String
    },
    skills: {
      type: [String],
      default: []
    },
    university: {
      type: String,
      default: ""
    },
    branch: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      // 🔥 FIXED: Changed 'occupoed' to 'occupied' to match the interface
      enum: ['vacant', 'occupied'], 
      default: "vacant"
    },
    semester: {
      type: Number
    },
    socials: {
      github: { type: String },
      linkedin: { type: String },
      website: { type: String },
    },
    lastActive: { type: Date },

    // 🔥 NEW: Added the preferences block for the isolated settings API
    preferences: {
      focusMode: { type: Boolean, default: false },
      defaultView: { type: String, enum: ['list', 'grid'], default: 'list' },
      showOnlineStatus: { type: Boolean, default: true },
      dailyDigest: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>("User", UserSchema);

export default User;