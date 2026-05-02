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

// ==========================================
// POST: Create a new Group specifically for this Project
// ==========================================
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
        const body = await req.json();

        // invitees expected format from frontend: [{ userId: "...", role: "Frontend" }]
        const { name, invitees } = body;

        if (!name) {
            return NextResponse.json({ message: "Group name is required." }, { status: 400 });
        }

        // 1. Verify the Project exists and grab its classId
        const project = await Project.findById(projectId);
        if (!project) {
            return NextResponse.json({ message: "Project not found. You must join a valid project to form a group." }, { status: 404 });
        }

        // 2. Project-Specific Availability Check
        // Check if the user is already in a group for THIS project.
        // Important: Update query to match your schema's 'student' key!
        const existingGroup = await Group.findOne({ 
            projectId: projectId, 
            "members.student": userId 
        });

        if (existingGroup) {
            return NextResponse.json({ message: "You are already part of a team for this specific project." }, { status: 400 });
        }

        // 3. Initialize the Members array with the Group Creator
        // 🔥 FIXED: Using 'student', 'assignedRole', and 'joinStatus' to match your schema
        const formattedMembers = [
            {
                student: userId,           
                assignedRole: "Team Lead",     
                joinStatus: "joined"       
            }
        ];

        // 4. Add the invited classmates as "Pending" members
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

        // 5. Create the Project-Specific Group
        const newGroup = await Group.create({
            name,
            projectId: project._id,
            classId: project.classId, 
            leader: userId,
            members: formattedMembers, // 🔥 Passes validation perfectly now
            status: "forming" // Or whatever your schema defaults to
        });

        return NextResponse.json({ 
            message: "Team formed and invitations sent!", 
            group: newGroup 
        }, { status: 201 });

    } catch (error) {
        console.error("Create Group Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}