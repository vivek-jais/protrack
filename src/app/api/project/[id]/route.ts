import connectDb from "@/lib/db";
import Project from "@/models/Project";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOption } from "@/lib/authOption";

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

        // Find project and verify ownership
        const project = await Project.findById(projectId);
        if (!project) {
            return NextResponse.json({ message: "Project not found" }, { status: 404 });
        }

        if (project.professor.toString() !== userId) {
            return NextResponse.json({ message: "Unauthorized to edit this project" }, { status: 403 });
        }

        // Update the project
        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            { $set: body },
            { new: true, runValidators: true }
        );

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

        // Find project and verify ownership
        const project = await Project.findById(projectId);
        if (!project) {
            return NextResponse.json({ message: "Project not found" }, { status: 404 });
        }

        if (project.professor.toString() !== userId) {
            return NextResponse.json({ message: "Unauthorized to delete this project" }, { status: 403 });
        }

        // Delete the project
        await Project.findByIdAndDelete(projectId);

        return NextResponse.json({ message: "Project deleted successfully" }, { status: 200 });

    } catch (error) {
        console.error("Delete Project Error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}