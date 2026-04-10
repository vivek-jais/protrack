import connectDb from "@/lib/db";
import Project from "@/models/Project";
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

        const project = await Project.findById(projectId);
        if (!project) {
            return NextResponse.json({ message: "Project not found" }, { status: 404 });
        }

        // Check if student already joined
        if (project.joinedStudents.includes(userId)) {
            return NextResponse.json({ message: "You have already joined this project." }, { status: 400 });
        }

        // Add student to the project
        project.joinedStudents.push(userId);
        await project.save();

        return NextResponse.json({ message: "Successfully joined the project!" }, { status: 200 });

    } catch (error) {
        console.error("Join Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    } 
}