import connectDb from "@/lib/db";
import Project from "@/models/Project";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOption } from "@/lib/authOption";
import User from "@/models/User";
import Group from "@/models/Group";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

        const project = await Project.findById(projectId).populate("professor", "name email image");
        
        if (!project) {
            return NextResponse.json({ message: "Project not found" }, { status: 404 });
        }

        // 2. Try to find the user's group
        let userGroup = await Group.findOne({ 
            projectId: projectId, 
            "members.student": userId 
        }).populate("members.student", "name email image");

        if (!userGroup && project.joinedStudents && project.joinedStudents.includes(userId)) {
            
            console.log("Ghost state detected! Auto-generating missing Solo Group...");

            const initialStageProgress = (project.stages || []).map((stage: any, index: number) => ({
                stageNumber: stage.stageNumber || (index + 1),
                status: "Pending",
                marksAwarded: 0,
                feedback: ""
            }));

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

            if (project.classId) {
                groupPayload.classId = project.classId;
            }

            // Create the missing group in the database
            const newGroup = await Group.create(groupPayload);

            // Fetch and populate it so it instantly matches what the frontend expects
            userGroup = await Group.findById(newGroup._id).populate("members.student", "name email image");
        }

        // Return the group (either the existing one, or the newly healed one!)
        return NextResponse.json({ project: project, group: userGroup }, { status: 200 });

    } catch (error) {
        console.error("Check Group Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDb();
        const session = await getServerSession(authOption);
        const { id: projectId } = await params;

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // @ts-ignore
        const userId = session.user.id;
        // @ts-ignore
        if (session.user.role !== "teacher") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();

        const project = await Project.findById(projectId);
        if (!project) {
            return NextResponse.json({ message: "Project not found" }, { status: 404 });
        }

        if (project.professor.toString() !== userId) {
            return NextResponse.json({ message: "Unauthorized to edit this project" }, { status: 403 });
        }

        // Protect internal tracking fields from direct overwriting via this route
        const { totalMarks, maxTotalMarks, stages, status, ...safeUpdateData } = body;

        if (stages) {
            const formattedStages = stages.map((stage: any) => ({
                ...stage,
                stageName: stage.stageName,
                maxMarks: stage.maxMarks || 10,
            }));
            safeUpdateData.stages = formattedStages;
        }

        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            { $set: safeUpdateData },
            { new: true, runValidators: true }
        );

        // Save it manually once to trigger the 'pre-save' hook that calculates totalMarks
        if (updatedProject) {
            await updatedProject.save(); 
        }

        return NextResponse.json({ message: "Project updated successfully", project: updatedProject }, { status: 200 });

    } catch (error) {
        console.error("Update Project Error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDb();
        const session = await getServerSession(authOption);
        const { id: projectId } = await params;

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // @ts-ignore
        const userId = session.user.id;
        // @ts-ignore
        if (session.user.role !== "teacher") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return NextResponse.json({ message: "Project not found" }, { status: 404 });
        }

        if (project.professor.toString() !== userId) {
            return NextResponse.json({ message: "Unauthorized to delete this project" }, { status: 403 });
        }

        await Project.findByIdAndDelete(projectId);

        return NextResponse.json({ message: "Project deleted successfully" }, { status: 200 });

    } catch (error) {
        console.error("Delete Project Error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}