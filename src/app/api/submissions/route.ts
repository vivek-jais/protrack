import connectDb from "@/lib/db";
import Project from "@/models/Project";
import Group from "@/models/Group";
import { getServerSession } from "next-auth";
import { authOption } from "@/lib/authOption";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connectDb();
        const session = await getServerSession(authOption);
        
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // @ts-ignore
        const userId = session.user.id;

        const userGroups = await Group.find({ "members.student": userId })
            .populate({
                path: 'projectId',
                select: 'title stages'
            })
            .lean();

        if (userGroups.length === 0) {
            return NextResponse.json({ submissions: [] }, { status: 200 });
        }

        let allSubmissions: any[] = [];

        userGroups.forEach((group: any) => {
            const project = group.projectId;
            if (!project) return; 

            // --- THE NEW ARCHITECTURE ---
            (group.stageProgress || []).forEach((progress: any) => {
                if (progress.status === "Pending") return;

                const stageBlueprint = project.stages?.find((s: any) => s.stageNumber === progress.stageNumber);

                allSubmissions.push({
                    projectId: project._id,
                    projectTitle: project.title,
                    stageName: stageBlueprint?.name || stageBlueprint?.title || `Stage ${progress.stageNumber}`,
                    stageIndex: progress.stageNumber,
                    teamName: group.name,
                    // 🔥 THE FIX: Translate "Graded" back into "evaluated" for the frontend
                    status: progress.status.toLowerCase() === 'graded' ? 'evaluated' : 'submitted',
                    submittedAt: progress.submittedAt,
                    documents: progress.submissionUrl ? [{
                        fileName: progress.submissionUrl.split('/').pop().replace(/^\d+-/, ''), 
                        fileUrl: progress.submissionUrl
                    }] : [],
                    marksAwarded: progress.marksAwarded || null,
                    maxMarks: stageBlueprint?.maxMarks || stageBlueprint?.marks || 100
                });
            });

            // --- LEGACY FALLBACK ---
            project.stages?.forEach((stage: any, index: number) => {
                const legacySub = stage.submissions?.find((s: any) => String(s.groupId) === String(group._id));

                if (legacySub && legacySub.documents?.length > 0) {
                    const alreadyAdded = allSubmissions.some(sub => 
                        String(sub.projectId) === String(project._id) && sub.stageIndex === (index + 1)
                    );

                    if (!alreadyAdded) {
                        allSubmissions.push({
                            projectId: project._id,
                            projectTitle: project.title,
                            stageName: stage.stageName || stage.name || stage.title || `Stage ${index + 1}`,
                            stageIndex: index + 1,
                            teamName: group.name,
                            // 🔥 THE FIX: Pass "evaluated" directly through from the old database schema
                            status: legacySub.status === 'evaluated' ? 'evaluated' : 'submitted',
                            submittedAt: legacySub.submittedAt,
                            documents: legacySub.documents,
                            marksAwarded: legacySub.evaluation?.marksAwarded || null,
                            maxMarks: stage.maxMarks || stage.marks || 100
                        });
                    }
                }
            });
        });

        allSubmissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

        return NextResponse.json({ submissions: allSubmissions }, { status: 200 });

    } catch (error) {
        console.error("Submissions fetch error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}