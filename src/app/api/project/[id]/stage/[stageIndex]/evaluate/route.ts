import connectDb from "@/lib/db";
import Project from "@/models/Project";
import { getServerSession } from "next-auth";
import { authOption } from "@/lib/authOption";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string, stageIndex: string }> }) {
    try {
        await connectDb();
        const session = await getServerSession(authOption);
        
        const { id: projectId, stageIndex } = await params;
        const index = parseInt(stageIndex, 10);

        if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        // @ts-ignore
        if (session.user.role !== "teacher") return NextResponse.json({ message: "Only teachers can grade." }, { status: 403 });
        // @ts-ignore
        const teacherId = session.user.id;

        const body = await req.json();
        const { groupId, marksAwarded, feedback } = body;

        const project = await Project.findById(projectId);
        if (!project) return NextResponse.json({ message: "Project not found" }, { status: 404 });
        
        const stage = project.stages[index];
        let submission = stage.submissions.find((s: any) => s.groupId.toString() === groupId);

        if (!submission) return NextResponse.json({ message: "No submission found to grade." }, { status: 404 });

        // Save the evaluation data in memory
        submission.evaluation = {
            evaluatedBy: teacherId,
            marksAwarded: Number(marksAwarded),
            feedback: feedback || "No remarks provided.",
            evaluatedAt: new Date()
        };
        submission.status = "evaluated";

        // 🔥 THE MAGIC FIX 🔥
        // Explicitly tell Mongoose that a deeply nested array has been modified!
        project.markModified("stages");

        // Now when we save, it will actually push the changes to MongoDB
        await project.save();

        return NextResponse.json({ message: "Grade saved successfully!", project }, { status: 200 });
 
    } catch (error) {
        console.error("Evaluation Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}