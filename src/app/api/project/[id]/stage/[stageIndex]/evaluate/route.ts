import connectDb from "@/lib/db";
import Project from "@/models/Project";
import Group from "@/models/Group";
import { getServerSession } from "next-auth";
import { authOption } from "@/lib/authOption";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string, stageIndex: string }> }) {
    try {
        await connectDb();
        const session = await getServerSession(authOption);
        
        const { id: projectId, stageIndex } = await params;
        const index = parseInt(stageIndex, 10);

        if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        // @ts-ignore
        if (session.user.role !== "teacher") return NextResponse.json({ message: "Only teachers can grade." }, { status: 403 });

        const body = await req.json();
        const { groupId, marksAwarded, feedback } = body;

        // 1. Fetch the Project to determine the correct stageNumber
        const project = await Project.findById(projectId);
        if (!project || isNaN(index) || index < 0 || index >= project.stages.length) {
            return NextResponse.json({ message: "Invalid project or stage." }, { status: 404 });
        }
        
        const targetStageNumber = project.stages[index].stageNumber || (index + 1);

        // 2. Fetch the specific Group being graded
        const group = await Group.findById(groupId);
        if (!group) return NextResponse.json({ message: "Group not found." }, { status: 404 });

        // 3. Find the specific stage slot within the Group's progress array
        const progressSlotIndex = group.stageProgress.findIndex(
            (sp: any) => sp.stageNumber === targetStageNumber
        );

        if (progressSlotIndex === -1 || group.stageProgress[progressSlotIndex].status === "Pending") {
            return NextResponse.json({ message: "No submission found to grade for this stage." }, { status: 400 });
        }

        // 4. Update the evaluation data inside the group document
        group.stageProgress[progressSlotIndex].status = "Graded";
        group.stageProgress[progressSlotIndex].marksAwarded = Number(marksAwarded);
        group.stageProgress[progressSlotIndex].feedback = feedback || "No remarks provided.";

        // Explicitly tell Mongoose that the nested array has been modified
        group.markModified("stageProgress");

        // 🔥 THE SAFETY NET: Self-heal any broken data in other stages before saving
        group.stageProgress.forEach((sp: any, i: number) => {
            if (!sp.stageNumber) {
                sp.stageNumber = i + 1;
            }
        });

        // Save the updated group
        await group.save();

        return NextResponse.json({ message: "Grade saved successfully!", group }, { status: 200 });
 
    } catch (error) {
        console.error("Evaluation Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}