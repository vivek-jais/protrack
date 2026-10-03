import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOption } from "@/lib/authOption";
import connectDb from "@/lib/db";
import Class from "@/models/Class";

export async function GET() {
  try {
    const session = await getServerSession(authOption);

    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectDb();

    const role = session.user.role;
    const userId = session.user.id;
    const chatUsersMap = new Map();

    if (role === "teacher") {
      const classes = await Class.find({ professor: userId }).populate("students", "name email image lastActive");

      classes.forEach((c) => {

        c.students.forEach((student) => {
          chatUsersMap.set(student._id.toString(), student);
        });
      });

    } else {
      const classes = await Class.find({ students: userId }).populate("professor", "name email image lastActive");

      classes.forEach((c) => {
        if (c.professor) {
          chatUsersMap.set(c.professor._id.toString(), c.professor);
        }
      });
    }
    const result = Array.from(chatUsersMap.values());

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error("Chat User Fetch Error:", error);
    return NextResponse.json({ message: "Error fetching users" }, { status: 500 });
  }
}