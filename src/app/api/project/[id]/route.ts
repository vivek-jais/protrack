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

        // Fetch project and deeply populate all relevant details for the Workspace UI
        const project = await Project.findById(projectId)
            .populate("professor", "name email image")
            .populate("classId", "name code")
            // Deep populate: Fetch the Group details for each submission
            .populate({
                path: "stages.submissions.groupId",
                select: "name members",
                model: Group
            })
            // Deep populate: Fetch the Student details who clicked 'upload'
            .populate({
                path: "stages.submissions.submittedBy",
                select: "name image",
                model: User
            });

        if (!project) {
            return NextResponse.json({ message: "Project not found" }, { status: 404 });
        }

        return NextResponse.json({ project }, { status: 200 });

    } catch (error) {
        console.error("Get Project Workspace Error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
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

        // If the teacher sends an updated stages array (e.g., changing stage names/maxMarks)
        // Ensure we don't accidentally wipe out student submissions inside those stages
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