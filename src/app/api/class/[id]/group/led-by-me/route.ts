import connectDb from "@/lib/db";
import Group from "@/models/Group";
import Student from "@/models/Student";
import { getServerSession } from "next-auth";
import { authOption } from "@/lib/authOption";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        await connectDb();
        const session = await getServerSession(authOption);

        // 1. Security Check
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // @ts-ignore
        const userId = session.user.id;

        // 2. Find the Student profile linked to this User account
        const student = await Student.findOne({ userId: userId });

        if (!student) {
            // If they don't have a student profile yet, they definitely don't lead any groups.
            // Return an empty array instead of an error so the frontend doesn't crash.
            return NextResponse.json({ groups: [] }, { status: 200 });
        }

        // 3. Find all groups where this student is the designated leader
        const groups = await Group.find({ leader: student._id })
            .select("_id name classId status") // Only fetch the fields we need for the UI
            .sort({ createdAt: -1 }); // Show the newest groups first

        return NextResponse.json({ groups }, { status: 200 });

    } catch (error) {
        console.error("Fetch Led Groups Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}