import connectDb from "@/lib/db";
import Group from "@/models/Group";
import { getServerSession } from "next-auth";
import { authOption } from "@/lib/authOption";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDb();
        const session = await getServerSession(authOption);
        const { id: projectId } = await params;

        if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        // Fetch all groups linked to this project and populate the student details
        const groups = await Group.find({ projectId: projectId }).populate("members.student", "name email image");

        return NextResponse.json({ groups }, { status: 200 });
    } catch (error) {
        console.error("Fetch All Groups Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}