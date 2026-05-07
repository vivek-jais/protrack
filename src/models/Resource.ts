import mongoose, { Schema, Document, Model } from "mongoose";

export interface IResource extends Document {
  classId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  type: "announcement" | "note" | "video" | "link";
  url?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema: Schema<IResource> = new Schema(
  {
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    content: { type: String, default: "" },
    type: { 
      type: String, 
      enum: ["announcement", "note", "video", "link"], 
      default: "announcement" 
    },
    url: { type: String, default: "" }, // For Google Drive links, YouTube links, etc.
  },
  { timestamps: true }
);

const Resource: Model<IResource> =
  (mongoose.models.Resource as Model<IResource>) || mongoose.model<IResource>("Resource", ResourceSchema);

export default Resource;