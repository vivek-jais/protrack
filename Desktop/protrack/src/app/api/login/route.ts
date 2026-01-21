import { NextResponse } from "next/server";
import { useRouter } from "next/navigation";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import connectDb from "@/lib/mongoose";

export async function POST(req: Request) {
    const router=useRouter()
  try {
    const { email, password } = await req.json();

    // 1. Validate Input
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and Password are required" },
        { status: 400 }
      );
    }

    // 2. Connect to Database
    await connectDb();

    // 3. Find User (and explicitly select password since it's usually hidden)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // 4. Check if user is a Google account (no password)
    if (!user.password) {
      return NextResponse.json(
        { message: "Please log in with Google" },
        { status: 400 }
      );
    }

    // 5. Compare Passwords
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { 
        message: "Login successful", 
      },
      { status: 200 },
    );

    
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}