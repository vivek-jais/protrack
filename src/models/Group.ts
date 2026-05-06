import mongoose from "mongoose";

// 👥 Group Member Sub-Schema
const groupMemberSchema = new mongoose.Schema(
  {
    student: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    assignedRole: { 
      type: String, 
      default: "Member" 
    },
    joinStatus: { 
      type: String, 
      enum: ["pending", "joined", "rejected"], 
      default: "pending" 
    }
  },
  { _id: false }
);

// 📈 Stage Progress Sub-Schema
const stageProgressSchema = new mongoose.Schema(
  {
    stageNumber: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ["Pending", "Submitted", "Late", "Graded"], 
      default: "Pending" 
    },
    submissionUrl: { type: String, default: "" },
    submittedAt: { type: Date },
    marksAwarded: { type: Number, default: 0 },
    feedback: { type: String, default: "" }
  },
  { _id: false }
);

// 💡 NEW: Project Idea Sub-Schema
const ideaSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    approvalStatus: { 
      type: String, 
      enum: ["Pending", "Approved", "Rejected"], 
      default: "Pending" 
    },
    feedback: { type: String, default: "" } // For teacher comments on the idea
  },
  { _id: false }
);

// 🚀 MAIN GROUP SCHEMA
const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
    leader: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [groupMemberSchema],
    
    // 📌 GROUP STATUS
    status: {
      type: String,
      enum: ["forming", "active", "archived"],
      default: "forming", 
    },

    // ==========================================
    // 🔥 NEW: IDEA PITCHING SYSTEM
    // ==========================================
    idea: ideaSchema,

    // ==========================================
    // 🔥 STATUS TRACKING SYSTEM
    // ==========================================
    currentStage: { 
      type: Number, 
      default: 1 
    },
    stageProgress: [stageProgressSchema]

  },
  { timestamps: true }
);

export default mongoose.models.Group || mongoose.model("Group", groupSchema);