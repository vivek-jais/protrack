import connectDb from "@/lib/db";
import Group from "@/models/Group";
import Student from "@/models/Student";
import { getServerSession } from "next-auth";
import { authOption } from "@/lib/authOption";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        await connectDb();
        const session = await getServerSession(authOption);

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // @ts-ignore
        const userId = session.user.id;
        const body = await req.json();

        // invitees should be an array of objects from the frontend: 
        // [{ studentId: "...", assignedRole: "Frontend" }, { studentId: "...", assignedRole: "Backend" }]
        const { name, classId, invitees } = body;

        if (!name || !classId) {
            return NextResponse.json({ message: "Group name and class ID are required" }, { status: 400 });
        }

        // 1. Fetch the actual Student profile for the currently logged-in User
        const creatorStudent = await Student.findOne({ userId: userId });
        
        if (!creatorStudent) {
            return NextResponse.json({ message: "Student profile not found. Please complete your profile setup." }, { status: 404 });
        }

        if (creatorStudent.availabilityStatus === "occupied") {
            return NextResponse.json({ message: "You are already part of an active group." }, { status: 400 });
        }

        // 2. Initialize the Members array with the Group Creator
        const formattedMembers = [
            {
                student: creatorStudent._id,
                assignedRole: "Team Lead", // Or let them pass this from the frontend
                joinStatus: "joined"       // The creator automatically joins
            }
        ];

        // 3. Add the invited classmates as "Pending" members
        if (invitees && Array.isArray(invitees)) {
            for (const invitee of invitees) {
                formattedMembers.push({
                    student: invitee.studentId,
                    assignedRole: invitee.assignedRole || "Member",
                    joinStatus: "pending" // 🔥 This is the magic that creates the invitation!
                });
            }
        }

        // 4. Create the new Group Workspace
        const newGroup = await Group.create({
            name,
            classId,
            leader: creatorStudent._id,
            members: formattedMembers,
            status: "forming" // Group stays in "forming" state until everyone accepts
        });

        // 5. Mark the creator as "occupied" so they can't be invited to other groups
        creatorStudent.availabilityStatus = "occupied";
        await creatorStudent.save();

        return NextResponse.json({ 
            message: "Group workspace initialized and invitations sent!", 
            group: newGroup 
        }, { status: 201 });

    } catch (error) {
        console.error("Create Group Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}