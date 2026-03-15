import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    
    // The subject/class this project belongs to
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    
    // The teacher who created the project
    professor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    requirements: {
      githubRepository: { type: Boolean, default: true },
      liveDemoUrl: { type: Boolean, default: false },
    },
    referenceLinks: [
      {
        title: String,
        url: String,
      }
    ],
    materials: [
      {
        fileName: String,
        fileUrl: String, 
      }
    ],
    deadline: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Project || mongoose.model("Project", projectSchema);