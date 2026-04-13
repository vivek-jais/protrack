import connectDb from "@/lib/db";
import Class from "@/models/Class";
import Student from "@/models/Student";
import User from '@/models/User'
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDb();
        const { id: classId } = await params;

        // 1. Find the class and populate
        const classData = await Class.findById(classId).populate("students", "email");
        
        if (!classData) {
            return NextResponse.json({ message: "Class not found" }, { status: 404 });
        }

        const studentEmails = classData.students.map((s: any) => s.email);

        // 2. Fetch the detailed Student profiles for everyone in that class
        const members = await User.find({ email: { $in: studentEmails } });

        return NextResponse.json({ members }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}