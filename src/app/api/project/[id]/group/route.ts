import connectDb from "@/lib/db";
import Group from "@/models/Group";
import Project from "@/models/Project";
import { getServerSession } from "next-auth";
import { authOption } from "@/lib/authOption";
import { NextResponse } from "next/server";
import Student from "@/models/Student";
import User from "@/models/User";

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

        // Find a group for this specific project where the current user is a member
        // (Includes both "pending" and "joined" members)
        const userGroup = await Group.findOne({ 
    projectId: projectId, 
    "members.student": userId // Changed 'user' to 'student'
}).populate("members.student", "name email image"); // Changed 'user' to 'student'

        return NextResponse.json({ group: userGroup }, { status: 200 });

    } catch (error) {
        console.error("Check Group Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDb();
        const session = await getServerSession(authOption);
        const { id: projectId } = await params;

        if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        // @ts-ignore
        const userId = session.user.id;
        const body = await req.json();
        const { name, invitees } = body;

        if (!name) return NextResponse.json({ message: "Group name is required." }, { status: 400 });

        const project = await Project.findById(projectId);
        if (!project) return NextResponse.json({ message: "Project not found." }, { status: 404 });

        const existingGroup = await Group.findOne({ 
            projectId: projectId, 
            "members.student": userId 
        });

        if (existingGroup) return NextResponse.json({ message: "You are already part of a team." }, { status: 400 });

        const formattedMembers = [
            { student: userId, assignedRole: "Team Lead", joinStatus: "joined" }
        ];

        if (invitees && Array.isArray(invitees)) {
            for (const invitee of invitees) {
                if (invitee.userId !== userId) {
                    formattedMembers.push({
                        student: invitee.userId,
                        assignedRole: invitee.role || "Member",
                        joinStatus: "joined" 
                    });
                }
            }
        }

        const initialStageProgress = (project.stages || []).map((stage: any, index: number) => ({
            stageNumber: stage.stageNumber || (index + 1),
            status: "Pending",
            marksAwarded: 0,
            feedback: ""
        }));

        const groupPayload: any = {
            name,
            projectId: project._id,
            leader: userId,
            members: formattedMembers, 
            status: "forming", 
            currentStage: 1, 
            stageProgress: initialStageProgress 
        };

        if (project.classId) {
            groupPayload.classId = project.classId;
        }

        // 1. Create the new Group
        const newGroup = await Group.create(groupPayload);

        // ==========================================
        // 🔥 THE FIX: SYNC WITH THE PROJECT ARRAY
        // ==========================================
        // Extract all the student IDs from the newly formed team
        const memberIds = formattedMembers.map(m => m.student);

        // Push any ID that isn't already in the project's joinedStudents array
        memberIds.forEach(id => {
            if (!project.joinedStudents.includes(id)) {
                project.joinedStudents.push(id);
            }
        });

        // Save the updated project document to MongoDB!
        await project.save();
        // ==========================================

        return NextResponse.json({ message: "Team formed successfully!", group: newGroup }, { status: 201 });

    } catch (error) {
        console.error("Create Group Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}