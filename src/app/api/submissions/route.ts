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

        // 1. Find all groups the user belongs to
        const userGroups = await Group.find({ "members.student": userId }).select('_id name');
        const groupIds = userGroups.map(g => g._id);

        if (groupIds.length === 0) {
            return NextResponse.json({ submissions: [] }, { status: 200 });
        }

        // 2. Find all projects that have submissions from these groups
        const projects = await Project.find({
            "stages.submissions.groupId": { $in: groupIds }
        }).select("title stages");

        // 3. Flatten the data into a clean, easy-to-read list for the frontend
        let allSubmissions: any[] = [];

        projects.forEach(project => {
            project.stages.forEach((stage: any, stageIndex: number) => {
                // Find the submission for this specific stage that belongs to one of the user's groups
                const groupSubmission = stage.submissions.find((s: any) => 
                    groupIds.some(id => id.equals(s.groupId))
                );

                if (groupSubmission && groupSubmission.documents.length > 0) {
                    const groupName = userGroups.find(g => g._id.equals(groupSubmission.groupId))?.name;

                    allSubmissions.push({
                        projectId: project._id,
                        projectTitle: project.title,
                        stageName: stage.stageName,
                        stageIndex: stageIndex + 1,
                        teamName: groupName,
                        status: groupSubmission.status,
                        submittedAt: groupSubmission.submittedAt,
                        documents: groupSubmission.documents,
                        marksAwarded: groupSubmission.evaluation?.marksAwarded || null,
                        maxMarks: stage.maxMarks
                    });
                }
            });
        });

        // 4. Sort by most recent submission first
        allSubmissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

        return NextResponse.json({ submissions: allSubmissions }, { status: 200 });

    } catch (error) {
        console.error("Submissions fetch error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}