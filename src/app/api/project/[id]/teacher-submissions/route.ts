import connectDb from "@/lib/db";
import Project from "@/models/Project";
import Group from "@/models/Group";
import { getServerSession } from "next-auth";
import { authOption } from "@/lib/authOption";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDb();
        const session = await getServerSession(authOption);
        const { id: projectId } = await params;

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // @ts-ignore
        if (session.user.role !== "teacher") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        // 1. Fetch the project (we need this for the stage blueprints like maxMarks)
        const project = await Project.findById(projectId).lean();
        if (!project) return NextResponse.json({ message: "Project not found" }, { status: 404 });

        // 2. Fetch all groups that belong to this specific project
        const groups = await Group.find({ projectId: projectId }).lean();

        let teacherSubmissions: any[] = [];

        // 3. --- NEW ARCHITECTURE: Extract from Group Stage Progress ---
        groups.forEach((group: any) => {
            (group.stageProgress || []).forEach((progress: any) => {
                // Ignore stages that haven't been submitted yet
                if (progress.status === "Pending") return;

                const stageBlueprint = project.stages?.find((s: any) => s.stageNumber === progress.stageNumber);

                teacherSubmissions.push({
                    stageIndex: progress.stageNumber,
                    stageName: stageBlueprint?.name || stageBlueprint?.title || `Stage ${progress.stageNumber}`,
                    groupId: group._id,
                    teamName: group.name || "Unknown Team",
                    // Map the new status terminology back to what your UI expects
                    status: progress.status.toLowerCase() === "graded" ? "evaluated" : "submitted",
                    submittedAt: progress.submittedAt,
                    // Reconstruct the documents array for the UI
                    documents: progress.submissionUrl ? [{
                        fileName: progress.submissionUrl.split('/').pop().replace(/^\d+-/, ''),
                        fileUrl: progress.submissionUrl
                    }] : [],
                    // Reconstruct the evaluation object for the UI
                    evaluation: progress.status.toLowerCase() === "graded" ? {
                        marksAwarded: progress.marksAwarded,
                        feedback: progress.feedback
                    } : null,
                    maxMarks: stageBlueprint?.maxMarks || stageBlueprint?.marks || 100
                });
            });
        });

        // 4. --- LEGACY FALLBACK --- (Preserves older submissions)
        project.stages?.forEach((stage: any, index: number) => {
            if (stage.submissions && stage.submissions.length > 0) {
                stage.submissions.forEach((sub: any) => {
                    // Check to make sure we haven't already added this submission via the new architecture
                    const alreadyAdded = teacherSubmissions.some(ts => 
                        String(ts.groupId) === String(sub.groupId) && ts.stageIndex === (index + 1)
                    );

                    if (!alreadyAdded) {
                        const groupName = groups.find(g => String(g._id) === String(sub.groupId))?.name || "Unknown Team";
                        
                        teacherSubmissions.push({
                            stageIndex: index + 1,
                            stageName: stage.stageName || stage.name || stage.title || `Stage ${index + 1}`,
                            groupId: sub.groupId,
                            teamName: groupName,
                            status: sub.status,
                            submittedAt: sub.submittedAt,
                            documents: sub.documents || [],
                            evaluation: sub.evaluation || null,
                            maxMarks: stage.maxMarks || stage.marks || 100
                        });
                    }
                });
            }
        });

        // 5. Sort submissions: Most recent submissions at the top
        teacherSubmissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

        return NextResponse.json({ submissions: teacherSubmissions }, { status: 200 });

    } catch (error) {
        console.error("Teacher Submissions Fetch Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}