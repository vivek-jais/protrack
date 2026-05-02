import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    // 🔗 Link back to the core NextAuth User account
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      unique: true 
    },

    // 👤 Identity (Copied/Synced from User account upon profile creation)
    name: { type: String, required: true },
    email: { type: String, required: true },
    
    // 🟢 Workspace Availability
    availabilityStatus: {
      type: String,
      enum: ["available", "occupied"],
      default: "available"
    },

    // 💻 Primary or Preferred Role (e.g., "Frontend Engineer", "UI/UX Designer")
    preferredRole: { 
      type: String, 
      default: "Full Stack Developer" 
    },

    // 🎓 Academic & Skill Details
    skills: [{ type: String }],
    institution: { type: String, default: "" }, 
    department: { type: String, default: "" },

    // 🕘 Activity Tracking
    lastActive: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Auto-update lastActive
studentSchema.pre("save", function() {
  this.lastActive = new Date();
});

export default mongoose.models.Student || mongoose.model("Student", studentSchema);