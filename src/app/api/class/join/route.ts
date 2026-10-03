import connectDb from "@/lib/db";
import Class from "@/models/Class";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOption } from "@/lib/authOption";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOption);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "student") {
      return NextResponse.json(
        { message: "You are not allowed to access this route" },
        { status: 403 },
      );
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const { classId } = await req.json();
    if (!classId) {
      return NextResponse.json({ message: "Class ID is required" }, { status: 400 });
    }

    await connectDb();
    const classInfo = await Class.findById(classId);
    if (!classInfo) {
      return NextResponse.json({ message: "Class not found" }, { status: 404 });
    }
    if (classInfo.students.some((studentId) => studentId.equals(userId))) {
      return NextResponse.json({ message: "You are already enrolled in this class" }, { status: 400 });
    }

    classInfo.students.push(userId);
    await classInfo.save();
    return NextResponse.json({ message: "Successfully joined the class!" }, { status: 200 });
  } catch (error) {
    console.error("Class join error:", error);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}