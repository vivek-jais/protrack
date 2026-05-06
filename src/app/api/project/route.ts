import connectDb from "@/lib/db";
import Project from "@/models/Project";
import Class from "@/models/Class";
import Group from "@/models/Group"; // Assuming you have a Group model
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOption } from "@/lib/authOption";

export async function POST(req: Request) {
    try {
        await connectDb();
        const session = await getServerSession(authOption);

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // @ts-ignore
        const userId = session.user.id;
        // @ts-ignore
        if (session.user.role !== "teacher") {
            return NextResponse.json({ message: "Only teachers can create projects" }, { status: 403 });
        }

        const body = await req.json();
        const { title, description, classId, deadline, startDate, stages, requirements } = body;

        if (!title || !description || !deadline) {
            return NextResponse.json({ message: "Title, description, and overall deadline are required" }, { status: 400 });
        }

        // Format stages to ensure dates are properly passed
        const formattedStages = stages.map((stage: any) => ({
            stageName: stage.stageName,
            maxMarks: Number(stage.maxMarks) || 10,
            startDate: stage.startDate ? new Date(stage.startDate) : undefined,
            deadline: stage.deadline ? new Date(stage.deadline) : undefined,
            submissions: [] // Initialize empty submissions array
        }));

        // Create the Project
        const newProject = await Project.create({
            title,
            description,
            classId: classId || null, // Can be null if it's a standalone project
            professor: userId,
            startDate: startDate ? new Date(startDate) : new Date(),
            deadline: new Date(deadline),
            requirements: requirements || { githubRepository: true, projectReport: true },
            stages: formattedStages,
            status: "ongoing"
        });

        // Trigger the pre-save hook by manually saving once (calculates total marks)
        await newProject.save();

        return NextResponse.json({ message: "Project created successfully!", project: newProject }, { status: 201 });

    } catch (error) {
        console.error("Create Project Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        await connectDb();
        const session = await getServerSession(authOption);
        
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // @ts-ignore
        const userId = session.user.id;

        // 1. Fetch all projects relevant to this student
        const projects = await Project.find({}).lean(); 

        // 2. Fetch ALL groups where this specific user is a member
        const userGroups = await Group.find({ 
            "members.student": userId 
        }).lean();

        // Create an array of Project IDs that the user is already enrolled in
        const enrolledProjectIds = userGroups.map(group => group.projectId.toString());

        // 3. Map through the projects and attach the 'isEnrolled' flag
        const projectsWithStatus = projects.map(project => {
            const isEnrolled = enrolledProjectIds.includes(project._id.toString());
            return {
                ...project,
                isEnrolled // This will be true if they were invited/joined, false otherwise
            };
        });

        return NextResponse.json({ projects: projectsWithStatus }, { status: 200 });

    } catch (error) {
        console.error("Fetch Projects Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
