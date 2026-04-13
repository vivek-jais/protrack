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

        const group = await Group.findById(groupId);
        if (!group) return NextResponse.json({ message: "Group not found" }, { status: 404 });
        if (group.leader.toString() !== userId) return NextResponse.json({ message: "Only the Team Leader can submit work." }, { status: 403 });

        const project = await Project.findById(projectId);
        if (!project) return NextResponse.json({ message: "Project not found" }, { status: 404 });
        
        if (isNaN(index) || index < 0 || index >= project.stages.length) {
            return NextResponse.json({ message: "Invalid stage" }, { status: 404 });
        }
        
        const stage = project.stages[index];
        
        // 1. Convert the uploaded file into a readable Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 2. Define the path to the Next.js 'public/uploads' folder
        const uploadDir = path.join(process.cwd(), "public/uploads");

        // 3. Create the 'public/uploads' folder if it doesn't exist yet
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        // 4. Create a clean, unique filename (removes spaces and special chars)
        const safeFilename = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "");
        const uniqueName = `${Date.now()}-${safeFilename}`;
        const filePath = path.join(uploadDir, uniqueName);

        // 5. Write the file to your hard drive
        await writeFile(filePath, buffer);

        // 6. This is the URL the frontend will use to open the file
        const fileUrl = `/uploads/${uniqueName}`;

        const newDocument = {
            fileName: file.name,
            fileUrl: fileUrl,
            fileType: file.type || "application/octet-stream",
            uploadedAt: new Date()
        };

        // ==========================================

        let submission = stage.submissions.find((s: any) => s.groupId.toString() === groupId);

        if (!submission) {
            stage.submissions.push({
                groupId: groupId,
                submittedBy: userId,
                documents: [newDocument], 
                status: "submitted",
                submittedAt: new Date()
            });
        } else {
            submission.documents.push(newDocument);
            submission.status = "submitted";
            submission.submittedAt = new Date();
        }

        await project.save();

        return NextResponse.json({ message: "File submitted successfully!", project }, { status: 200 });

    } catch (error) {
        console.error("Submit Stage Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}