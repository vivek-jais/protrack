// import mongoose, { Schema, Document, Model } from "mongoose";

// export interface IUpdate {
//   content: string;
//   createdAt: Date;
// }

// export interface IProject extends Document {
//   student: mongoose.Types.ObjectId;
//   classId: mongoose.Types.ObjectId;
//   title: string;
//   description: string;
 
//   status: "In Progress" | "Completed" | "Stuck";
//   progress: number; // 0 to 100
//   blocker?: string; // Why are they stuck?
  
//   documents: { name: string; url: string }[];
//   updates: IUpdate[];
//   createdAt: Date;
//   updatedAt: Date;
// }

// const ProjectSchema = new Schema<IProject>(
//   {
//     student: { type: Schema.Types.ObjectId, ref: "User", required: true },
//     classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
//     title: { type: String, required: true },
//     description: { type: String },
    
//     status: { 
//       type: String, 
//       enum: ["In Progress", "Completed", "Stuck"], 
//       default: "In Progress" 
//     },
//     progress: { type: Number, min: 0, max: 100, default: 0 },
//     blocker: { type: String, default: "" }, // Optional field for "Stuck" reason

//     documents: [{ name: String, url: String }],
//     updates: [{ content: String, createdAt: { type: Date, default: Date.now } }],
//   },
//   { timestamps: true }
// );

// const Project = (mongoose.models.Project as Model<IProject>) || mongoose.model<IProject>("Project", ProjectSchema);
// export default Project;