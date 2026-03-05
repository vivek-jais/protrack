import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGroup extends Document {
  name: string;
  classId: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  groupHead: mongoose.Types.ObjectId; //leader
  createdAt: Date;
}

const GroupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    groupHead: { type: Schema.Types.ObjectId, ref: "User", required: true }, 
  },
  { timestamps: true }
);

const Group = (mongoose.models.Group as Model<IGroup>) || mongoose.model<IGroup>("Group", GroupSchema);
export default Group;