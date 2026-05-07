import connectDb from "@/lib/db";
import Resource from "@/models/Resource";
import Group from "@/models/Group";
import Class from "@/models/Class";
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
        const userId = session.user.id || session.user._id;

        // 1. Find all classes this student is enrolled in directly
        const enrolledClasses = await Class.find({ students: userId }).select("_id").lean();
        
        // Extract just the class IDs into an array
        const classIds = enrolledClasses.map(cls => cls._id).filter(id => id != null);

        if (classIds.length === 0) {
            return NextResponse.json({ announcements: [] }, { status: 200 });
        }

        // 2. Fetch the 5 most recent resources from ANY of those classes
        const recentAnnouncements = await Resource.find({ classId: { $in: classIds } })
            .populate('teacherId', 'name')
            .populate('classId', 'courseCode name')
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        return NextResponse.json({ announcements: recentAnnouncements }, { status: 200 });

    } catch (error) {
        console.error("Student Announcements Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}