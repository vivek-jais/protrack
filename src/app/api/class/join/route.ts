import connectDb from "@/lib/db";
import Class from "@/models/Class";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOption } from "@/lib/authOption";

export async function POST(req: Request) {
    try {
        await connectDb();
        const session = await getServerSession(authOption);

        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // @ts-ignore
        const userId = session.user.id;
        // @ts-ignore
        if (session.user.role !== 'student') {
            return NextResponse.json({ message: 'Only students can join classes' }, { status: 403 });
        }

        const { classId } = await req.json();

        // Check if class exists
        const classDoc = await Class.findById(classId);
        if (!classDoc) {
            return NextResponse.json({ message: "Class not found" }, { status: 404 });
        }

        // Check if student is already in the class
        if (classDoc.students.includes(userId)) {
            return NextResponse.json({ message: "You are already enrolled in this class" }, { status: 400 });
        }

        // Add the student to the class
        classDoc.students.push(userId);
        await classDoc.save();

        return NextResponse.json({ message: "Successfully joined the class!" }, { status: 200 });
    } catch (error) {
        console.error("Join Class Error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}