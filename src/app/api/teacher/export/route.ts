import connectDb from "@/lib/db";
import Group from "@/models/Group";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOption } from "@/lib/authOption";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        await connectDb();
        const session = await getServerSession(authOption);
        
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // @ts-ignore
        if (session.user.role !== "teacher") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        // 🔥 Extract projectId from the URL (e.g., /api/teacher/export?projectId=123)
        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get("projectId");

        if (!projectId) {
            return NextResponse.json({ message: "Project ID is required" }, { status: 400 });
        }

        // 🔥 Only fetch groups that belong to THIS specific project
        const groups = await Group.find({ projectId: projectId })
            .populate({
                path: 'leader',
                select: 'name'
            })
            .lean();

        // Flatten the data into exactly ONE row per team
        const excelRows: any[] = [];

        groups.forEach((group: any) => {
            const ideaTitle = group.idea?.title || "No Idea Submitted Yet";
            const leaderName = group.leader?.name || "Unknown Leader";

            excelRows.push({
                "Team Name": group.name,
                "Leader Name": leaderName,
                "Pitched Idea": ideaTitle
            });
        });

        return NextResponse.json({ data: excelRows }, { status: 200 });

    } catch (error) {
        console.error("Export fetch error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}