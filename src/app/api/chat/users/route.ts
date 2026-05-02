import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOption } from "@/lib/authOption";
import connectDb from "@/lib/db";
import Class from "@/models/Class";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOption);

    // --- DEBUG LOGS ---
    console.log("🔹 API HIT: Chat Users Fetch");
    console.log("🔹 User Email:", session?.user?.email);
    // @ts-ignore
    console.log("🔹 Detected Role:", session?.user?.role);
    // @ts-ignore
    console.log("🔹 User ID:", session?.user?.id);
    // ------------------

    // @ts-ignore
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectDb();

    // @ts-ignore
    const role = session.user.role;
    // @ts-ignore
    const userId = session.user.id;
    const chatUsersMap = new Map();

    if (role === "teacher") {
      console.log("✅ Logic: Fetching Students for Teacher...");

      const classes = await Class.find({ professor: userId }).populate("students", "name email image lastActive");
      console.log(`🔹 Found ${classes.length} classes for this teacher.`);

      classes.forEach((c) => {

        c.students.forEach((student) => {
          // @ts-ignore
          console.log("   -> Found Student:", student.name);
          chatUsersMap.set(student._id.toString(), student);
        });
      });

    } else {
      console.log("✅ Logic: Fetching Teachers for Student...");

      const classes = await Class.find({ students: userId }).populate("professor", "name email image lastActive");

      classes.forEach((c) => {
        if (c.professor) {
          // @ts-ignore
          chatUsersMap.set(c.professor._id.toString(), c.professor);
        }
      });
    }

    const result = Array.from(chatUsersMap.values());
    console.log(`🔹 Sending back ${result.length} users.`);

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error("Chat User Fetch Error:", error);
    return NextResponse.json({ message: "Error fetching users" }, { status: 500 });
  }
}