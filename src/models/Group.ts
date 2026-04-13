import mongoose from "mongoose";

// 👥 Group Member Sub-Schema
const groupMemberSchema = new mongoose.Schema(
  {
    // 🔥 FIXED: Now references the core "User" model
    student: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    
    // The specific role they are playing in THIS group (e.g., "Backend Engineer")
    assignedRole: { 
      type: String, 
      default: "Member" 
    },
    
    // The Invitation Flow Tracking
    joinStatus: { 
      type: String, 
      enum: ["pending", "joined", "rejected"], 
      default: "pending" 
    }
  },
  { _id: false }
);

// 🚀 MAIN GROUP SCHEMA
const groupSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
    
    projectId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Project", 
      required: true 
    },

    classId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Class", 
      required: true 
    },
    
    // 👑 Group Leader 
    // 🔥 FIXED: Now references the core "User" model
    leader: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: true
    },

    // 👥 The Member List
    members: [groupMemberSchema],

    // 📌 GROUP STATUS
    status: {
      type: String,
      enum: ["forming", "active", "archived"],
      default: "forming", 
    }
  },
  { timestamps: true }
);

export default mongoose.models.Group || mongoose.model("Group", groupSchema);