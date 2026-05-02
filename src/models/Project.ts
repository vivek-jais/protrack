import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    fileName: String,
    fileUrl: String,
    fileType: String, // pdf, zip, docx, etc.
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// 🔗 Link Schema (Reusable for reference materials and student submissions)
const linkSchema = new mongoose.Schema(
  {
    title: String,
    url: String,
  },
  { _id: false }
);

// 🧾 Submission History (Keeps track of multiple submission attempts)
const submissionHistorySchema = new mongoose.Schema(
  {
    documents: [fileSchema],
    submissionLinks: [linkSchema],
    notes: String,
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// 🎯 Stage Evaluation Schema
const stageEvaluationSchema = new mongoose.Schema(
  {
    stageName: {
      type: String,
      required: true,
    },
    maxMarks: {
      type: Number,
      required: true,
      default: 10,
    },
    startDate: Date,
    deadline: Date,

    submissions: [{
      groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" }, // Added for team projects
      submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // The specific user who clicked upload

      submissionLinks: [linkSchema],
      documents: [fileSchema],
      notes: String,
      submittedAt: Date,

      // 🕘 VERSION HISTORY (Specific to this group/student)
      submissionHistory: [submissionHistorySchema],

      // 👨‍🏫 TEACHER EVALUATION DATA (Specific to this group/student)
      evaluation: {
        evaluatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        marksAwarded: { type: Number, default: 0 },
        feedback: String,
        feedbackDocuments: [fileSchema],
        evaluatedAt: Date,
      },

      // STATUS TRACKING (Specific to this group/student)
      status: {
        type: String,
        enum: ["pending", "submitted", "evaluated", "resubmission_required"],
        default: "pending",
      }
    }],
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },

    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
    professor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    joinedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    requirements: {
      githubRepository: { type: Boolean, default: true },
      liveDemoUrl: { type: Boolean, default: false },
      projectReport: { type: Boolean, default: true },
    },

    referenceLinks: [linkSchema],
    materials: [fileSchema],

    startDate: { type: Date, required: true },
    deadline: { type: Date, required: true },

    stages: [stageEvaluationSchema],

    totalMarks: { type: Number, default: 0 },
    maxTotalMarks: { type: Number, default: 0 },
    finalFeedback: String,

    status: {
      type: String,
      enum: ["ongoing", "completed"],
      default: "ongoing",
    },
  },
  { timestamps: true }
);

projectSchema.pre("save", function () {
  // We removed 'next' completely!
  if (this.stages && this.stages.length > 0) {
    this.totalMarks = this.stages.reduce(
      // Note: Because evaluation moved inside the submissions array, this will default to 0 for the project document
      (sum, stage) => sum + 0,
      0
    );

    this.maxTotalMarks = this.stages.reduce(
      (sum, stage) => sum + (stage.maxMarks || 0),
      0
    );
  }
});

// 🔥 FIXED: Removed the stray 'u' at the end of this line
export default mongoose.models.Project || mongoose.model("Project", projectSchema);