import connectDb from "@/lib/db";
import Group from "@/models/Group";
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

        // 🔥 THE FIX: Extract projectId from the request body
        const { title, description, projectId } = await req.json();

        if (!title || title.trim().length === 0) {
            return NextResponse.json({ message: "Idea title is required" }, { status: 400 });
        }
        
        if (!projectId) {
            return NextResponse.json({ message: "Project ID is required" }, { status: 400 });
        }

        // @ts-ignore
        const userId = session.user.id;

        // 🔥 THE FIX: Find the group for THIS SPECIFIC project, not just any project
        const group = await Group.findOne({ 
            "members.student": userId,
            projectId: projectId // Isolates the query to the current project!
        });
        
        if (!group) {
            return NextResponse.json({ message: "You must form or join a group for this project first." }, { status: 403 });
        }

        // Check if an idea was already submitted for THIS project
        if (group.idea && group.idea.title) {
            return NextResponse.json({ message: "Your team has already submitted an idea for this project." }, { status: 400 });
        }

        // 2. Save the Idea to the Group
        group.idea = {
            title: title.trim(),
            description: description || "",
            approvalStatus: "Pending"
        };

        // 3. Automatically mark Stage 1 (Idea Stage) as Submitted
        const stage1Index = group.stageProgress.findIndex((s: any) => s.stageNumber === 1);
        
        if (stage1Index !== -1) {
            group.stageProgress[stage1Index].status = "Submitted";
            group.stageProgress[stage1Index].submittedAt = new Date();
        } else {
            group.stageProgress.push({
                stageNumber: 1,
                status: "Submitted",
                submittedAt: new Date()
            });
        }
        
        await group.save();

        return NextResponse.json({ message: "Project idea submitted for approval!" }, { status: 200 });

    } catch (error) {
        console.error("Submit Idea Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}