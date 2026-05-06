import connectDb from "@/lib/db";
import Project from "@/models/Project";
import Group from "@/models/Group";
import { getServerSession } from "next-auth";
import { authOption } from "@/lib/authOption";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function POST(req: Request, { params }: { params: Promise<{ id: string, stageIndex: string }> }) {
    try {
        await connectDb();
        const session = await getServerSession(authOption);
        
        const { id: projectId, stageIndex } = await params;
        const index = parseInt(stageIndex, 10);

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // @ts-ignore
        const userId = session.user.id;

        const formData = await req.formData();
        const groupId = formData.get("groupId") as string;
        const file = formData.get("file") as File;

        if (!groupId || !file) {
            return NextResponse.json({ message: "Group ID and File are required." }, { status: 400 });
        }

        // 1. Fetch the Group
        const group = await Group.findById(groupId);
        if (!group) return NextResponse.json({ message: "Group not found" }, { status: 404 });
        
        if (group.leader.toString() !== userId) {
            return NextResponse.json({ message: "Only the Team Lead can submit work." }, { status: 403 });
        }

        // 2. Fetch the Project
        const project = await Project.findById(projectId);
        if (!project || isNaN(index) || index < 0 || index >= project.stages.length) {
            return NextResponse.json({ message: "Invalid project or stage." }, { status: 404 });
        }

        // 🔥 FIX 1: Add a fallback `|| (index + 1)` in case the Project stage lacks a stageNumber
        const targetStageNumber = project.stages[index].stageNumber || (index + 1);

        // 3. Handle File Upload Logic
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uploadDir = path.join(process.cwd(), "public/uploads");
        
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        const safeFilename = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "");
        const uniqueName = `${Date.now()}-${safeFilename}`;
        const filePath = path.join(uploadDir, uniqueName);
        await writeFile(filePath, buffer);
        
        const fileUrl = `/uploads/${uniqueName}`;

        // 4. Update the Group's stageProgress array
        const progressSlotIndex = group.stageProgress.findIndex(
            (sp: any) => sp.stageNumber === targetStageNumber
        );

        if (progressSlotIndex === -1) {
             group.stageProgress.push({
                 stageNumber: targetStageNumber,
                 status: "Submitted",
                 submissionUrl: fileUrl,
                 submittedAt: new Date()
             });
        } else {
             group.stageProgress[progressSlotIndex].status = "Submitted";
             group.stageProgress[progressSlotIndex].submissionUrl = fileUrl;
             group.stageProgress[progressSlotIndex].submittedAt = new Date();
        }

        group.markModified('stageProgress');
        
        if (group.currentStage === targetStageNumber && group.currentStage < project.stages.length) {
            group.currentStage += 1;
        }

        // 🔥 FIX 2: THE SELF-HEALING LOOP
        // This prevents the "stageProgress.3.stageNumber is required" error by 
        // ensuring ALL items in the array have a valid stageNumber before Mongoose validates them.
        group.stageProgress.forEach((sp: any, i: number) => {
            if (!sp.stageNumber) {
                sp.stageNumber = i + 1;
            }
        });

        // Now it will save flawlessly!
        await group.save();

        return NextResponse.json({ message: "File submitted successfully!", group }, { status: 200 });

    } catch (error) {
        console.error("Submit Stage Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}