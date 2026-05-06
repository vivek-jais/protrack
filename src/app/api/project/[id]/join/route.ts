import connectDb from "@/lib/db";
import Project from "@/models/Project";
import Group from "@/models/Group";
import { getServerSession } from "next-auth";
import { authOption } from "@/lib/authOption";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDb();
        const session = await getServerSession(authOption);
        const { id: projectId } = await params;

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // @ts-ignore
        const userId = session.user.id;
        const userName = session.user.name || "Student";

        const project = await Project.findById(projectId);
        if (!project) return NextResponse.json({ message: "Project not found" }, { status: 404 });

        const existingGroup = await Group.findOne({ 
            projectId: projectId, 
            "members.student": userId 
        });

        if (existingGroup) {
            return NextResponse.json({ message: "You are already enrolled in this project." }, { status: 400 });
        }

        // 🔥 THE FIX: Added 'index' to provide a fallback stageNumber for old projects
        const initialStageProgress = (project.stages || []).map((stage: any, index: number) => ({
            stageNumber: stage.stageNumber || (index + 1), 
            status: "Pending", 
            marksAwarded: 0,
            feedback: ""
        }));

        // Dynamically build the group payload so we don't pass null for classId
        const groupPayload: any = {
            name: `${userName}'s Solo Workspace`,
            projectId: project._id,
            leader: userId,
            members: [{
                student: userId,           
                assignedRole: "Solo Developer",     
                joinStatus: "joined"       
            }],
            status: "active",
            currentStage: 1,
            stageProgress: initialStageProgress
        };

        // Only attach classId if this is NOT a standalone project
        if (project.classId) {
            groupPayload.classId = project.classId;
        }

        const soloGroup = await Group.create(groupPayload);

        // Keep legacy array synced just in case
        if (!project.joinedStudents.includes(userId)) {
            project.joinedStudents.push(userId);
            await project.save();
        }

        return NextResponse.json({ message: "Successfully joined the project solo!", group: soloGroup }, { status: 200 });

    } catch (error) {
        console.error("Join Solo Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    } 
}