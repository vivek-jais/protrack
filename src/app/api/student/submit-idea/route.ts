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

        const { title, description } = await req.json();

        if (!title || title.trim().length === 0) {
            return NextResponse.json({ message: "Idea title is required" }, { status: 400 });
        }

        // @ts-ignore
        const userId = session.user.id;

        // 1. Find the group this student belongs to
        const group = await Group.findOne({ "members.student": userId });
        
        if (!group) {
            return NextResponse.json({ message: "You must form or join a group first." }, { status: 403 });
        }

        // Check if an idea was already submitted
        if (group.idea && group.idea.title) {
            return NextResponse.json({ message: "Your team has already submitted an idea." }, { status: 400 });
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
            // 🔥 FIXED: Capital "S" in "Submitted" to match Mongoose enum exactly
            group.stageProgress[stage1Index].status = "Submitted";
            group.stageProgress[stage1Index].submittedAt = new Date();
        } else {
            // Fallback if stageProgress wasn't initialized properly
            group.stageProgress.push({
                stageNumber: 1,
                // 🔥 FIXED: Capital "S" in "Submitted" here as well
                status: "Submitted",
                submittedAt: new Date()
            });
        }
        
        // This will now save successfully without throwing the ValidatorError!
        await group.save();

        return NextResponse.json({ message: "Project idea submitted for approval!" }, { status: 200 });

    } catch (error) {
        console.error("Submit Idea Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}