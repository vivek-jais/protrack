import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOption } from "@/lib/authOption";
import connectDb from "@/lib/db";
import Class from "@/models/Class";
import User from "@/models/User";

// Helper to generate a 6-character unique class code
function generateClassCode(length = 6) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export async function POST(req: Request) {
  try {
    // 1. Check Session (Must be logged in)
    const session = await getServerSession(authOption);
    console.log(session);
    
    
    // @ts-ignore
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized: Please login first" }, { status: 401 });
    }

    // 2. Check Role (Must be a Teacher)
    // @ts-ignore
    if (session.user.role !== "teacher") {
      return NextResponse.json({ message: "Forbidden: Only teachers can create classes" }, { status: 403 });
    }

    // 3. Get Data from Request
    const { name, description, schedule, theme } = await req.json();

    if (!name) {
      return NextResponse.json({ message: "Class name is required" }, { status: 400 });
    }

    await connectDb();
    let code = generateClassCode();
    let isUnique = false;
    let attempts = 0;

    // Safety loop to ensure code is truly unique
    while (!isUnique && attempts < 5) {
      const existingClass = await Class.findOne({ code });
      if (!existingClass) {
        isUnique = true;
      } else {
        code = generateClassCode();
        attempts++;
      }
    }

    if (!isUnique) {
      return NextResponse.json({ message: "Server busy, please try again" }, { status: 500 });
    }

    // 5. Create the Class
    const newClass = await Class.create({
      name,
      code, // The auto-generated code (e.g., "XY72B9")
      // @ts-ignore
      professor: session.user.id, // Link to the logged-in teacher
      description: description || "",
      schedule: schedule || "",
      theme: theme || "from-emerald-500 to-teal-500", // Default or user-picked theme
      students: [], // Start with 0 students
    });

    return NextResponse.json({ 
      message: "Class created successfully", 
      class: newClass 
    }, { status: 201 });

  } catch (error: any) {
    console.error("CREATE CLASS ERROR:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
  }
}