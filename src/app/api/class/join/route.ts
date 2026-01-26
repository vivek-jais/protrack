import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOption } from "@/lib/authOption";
import connectDb from "@/lib/db";
import Class from "@/models/Class";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    // 1. Check Session (Must be logged in)
    const session = await getServerSession(authOption);
    // @ts-ignore
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ message: "Class code is required" }, { status: 400 });
    }

    await connectDb();

    // 2. Find the Class by unique code
    const targetClass = await Class.findOne({ code: code.trim().toUpperCase() });

    if (!targetClass) {
      return NextResponse.json({ message: "Invalid Class Code" }, { status: 404 });
    }

    // 3. Check if already enrolled
    // @ts-ignore
    if (targetClass.students.includes(session.user.id)) {
      return NextResponse.json({ message: "You are already in this class" }, { status: 400 });
    }

    // 4. Enroll the Student
    // @ts-ignore
    targetClass.students.push(session.user.id);
    await targetClass.save();

    return NextResponse.json({ 
      message: "Joined class successfully", 
      classId: targetClass._id 
    }, { status: 200 });

  } catch (error: any) {
    console.error("JOIN CLASS ERROR:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}