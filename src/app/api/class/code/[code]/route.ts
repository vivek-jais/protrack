import connectDb from "@/lib/db";
import Class from "@/models/Class";
import User from "@/models/User"; // Ensure User model is loaded for .populate()
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOption } from "@/lib/authOption";

export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
    try {
        await connectDb();
        const session = await getServerSession(authOption);
        const { code } = await params;

        if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        // Find the class by its code and populate the professor's details
        const classData = await Class.findOne({ code: code.toUpperCase() })
            .populate("professor", "name email image");

        if (!classData) {
            return NextResponse.json({ message: "Class not found with this code" }, { status: 404 });
        }

        return NextResponse.json({ class: classData }, { status: 200 });
    } catch (error) {
        console.error("Fetch Class by Code Error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}