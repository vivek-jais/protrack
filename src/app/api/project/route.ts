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
        // @ts-ignore
        const role = session.user.role;

        let projects = [];

        if (role === "teacher") {
            // Teachers just see the projects they created
            projects = await Project.find({ professor: userId })
                .populate("classId", "name code")
                .sort({ createdAt: -1 });
        } 
        else if (role === "student") {
            // 1. Find all classes the student is enrolled in
            const enrolledClasses = await Class.find({ students: userId }).select("_id");
            const classIds = enrolledClasses.map(c => c._id);

            // 2. Fetch projects assigned to their classes OR standalone projects
            // Notice: No Group logic here at all!
            projects = await Project.find({
                $or: [
                    { classId: { $in: classIds } },
                    { classId: null },
                    { classId: { $exists: false } }
                ]
            })
            .populate("classId", "name code")
            .populate("professor", "name")
            .sort({ deadline: 1 });
        }

        return NextResponse.json({ projects }, { status: 200 });

    } catch (error) {
        console.error("Fetch Projects Error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

async function sendProjectNotificationEmails(emails: string[], className: string, projectTitle: string) {
    try {
        // Resend allows sending to batches (up to 50 at a time). 
        // For larger classes, you might need to chunk this array.
        await resend.emails.send({
            from: 'ProTrack Notifications <no-reply@yourdomain.com>',
            to: emails, // Send to all students at once via BCC or multiple 'to' fields
            subject: `New Project Assigned in ${className}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #10b981;">New Project Alert!</h2>
                    <p>Hello,</p>
                    <p>A new project titled <strong>"${projectTitle}"</strong> has just been created for your class: <strong>${className}</strong>.</p>
                    <p>Please log in to your ProTrack dashboard to review the requirements and form your groups or join solo as instructed by your professor.</p>
                    <br/>
                    <a href="https://yourprotrackurl.com/dashboard" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
                    <p style="margin-top: 30px; font-size: 12px; color: #888;">This is an automated message from ProTrack. Please do not reply.</p>
                </div>
            `
        });
        console.log("Notification emails sent successfully.");
    } catch (error) {
        console.error("Failed to send notification emails:", error);
    }
}