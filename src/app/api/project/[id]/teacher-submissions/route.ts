import connectDb from "@/lib/db";
import Project from "@/models/Project";
import Group from "@/models/Group";
import { getServerSession } from "next-auth";
import { authOption } from "@/lib/authOption";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDb();
        const session = await getServerSession(authOption);
        const { id: projectId } = await params;

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // @ts-ignore
        if (session.user.role !== "teacher") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        // 1. Fetch the project
        const project = await Project.findById(projectId);
        if (!project) return NextResponse.json({ message: "Project not found" }, { status: 404 });

        // 2. Fetch all groups for this project so we can map their names
        const groups = await Group.find({ projectId: projectId }).select("_id name");

        // 3. Extract and flatten all submissions from the project stages
        let teacherSubmissions: any[] = [];

        project.stages.forEach((stage: any, stageIndex: number) => {
            if (stage.submissions && stage.submissions.length > 0) {
                stage.submissions.forEach((sub: any) => {
                    // Match the group ID to get the team name
                    const groupName = groups.find(g => String(g._id) === String(sub.groupId))?.name || "Unknown Team";
                    
                    teacherSubmissions.push({
                        stageIndex: stageIndex + 1,
                        stageName: stage.stageName,
                        groupId: sub.groupId,
                        teamName: groupName,
                        status: sub.status,
                        submittedAt: sub.submittedAt,
                        documents: sub.documents || [],
                        evaluation: sub.evaluation || null,
                        maxMarks: stage.maxMarks
                    });
                });
            }
        });

        return NextResponse.json({ submissions: teacherSubmissions }, { status: 200 });

    } catch (error) {
        console.error("Teacher Submissions Fetch Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}