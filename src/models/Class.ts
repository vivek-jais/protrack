import mongoose, { Schema, Document, Model } from "mongoose";

export interface IClass extends Document {
  name: string;
  code: string; // Unique Class Code (e.g., CS-101)
  professor: mongoose.Types.ObjectId; // Link to the Teacher
  students: mongoose.Types.ObjectId[]; // List of enrolled Students
  description?: string;
  theme?: string; // The gradient color (e.g., "from-blue-500 to-indigo-500")
  schedule?: string; // e.g., "Mon, Wed 10:00 AM"
  createdAt: Date;
  updatedAt: Date;
}

const ClassSchema: Schema<IClass> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Class name is required"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Class code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    professor: {
      type: Schema.Types.ObjectId,
      ref: "User", // References the User model (must be a teacher)
      required: true,
    },
    students: [
      {
        type: Schema.Types.ObjectId,
        ref: "User", // References the User model (students)
      },
    ],
    description: {
      type: String,
      maxlength: 500,
    },
    theme: {
      type: String,
      default: "from-emerald-500 to-teal-500", // Default beautiful gradient
    },
    schedule: {
      type: String,
    },
  },
  { timestamps: true }
);

// Prevent model overwrite error in Next.js development mode
const Class: Model<IClass> =
  (mongoose.models.Class as Model<IClass>) || mongoose.model<IClass>("Class", ClassSchema);

export default Class;