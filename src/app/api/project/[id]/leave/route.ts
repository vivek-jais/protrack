import connectDb from "@/lib/db";
import Group from "@/models/Group";
import Project from "@/models/Project";
import { getServerSession } from "next-auth";
import { authOption } from "@/lib/authOption";
import { NextResponse } from "next/server";

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

        // 1. Find the user's solo group for this project
        const group = await Group.findOne({ projectId: projectId, "members.student": userId });
        if (!group) {
            return NextResponse.json({ message: "No active workspace found." }, { status: 404 });
        }

        // 2. Delete the group entirely from the database
        await Group.findByIdAndDelete(group._id);

        // 3. Remove the user from the Project's joinedStudents array
        const project = await Project.findById(projectId);
        if (project) {
            project.joinedStudents = project.joinedStudents.filter((id: any) => id.toString() !== userId);
            await project.save();
        }

        return NextResponse.json({ message: "Successfully left the workspace." }, { status: 200 });

    } catch (error) {
        console.error("Leave Project Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}