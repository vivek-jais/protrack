import Class from "@/models/Class";
import User from "@/models/User";
import connectDb from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOption } from "@/lib/authOption";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDb();
        const session = await getServerSession(authOption);
        const { id: classId } = await params;

        if (!session || !session?.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const classData = await Class.findById(classId).populate("students", "name email image");

        if (!classData) {
            return NextResponse.json({ message: 'Class not found' }, { status: 404 });
        }

        return NextResponse.json({ students: classData.students }, { status: 200 });

    } catch (error) {
        console.error("Fetch Students Error:", error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOption);
    //@ts-ignore
    if(session?.user?.role==='teacher'){
        try {
        await connectDb();
        const session = await getServerSession(authOption);
        const { id: classId } = await params;
        const { email } = await req.json();

        if (!session || !session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        // @ts-ignore
        if (session.user.role !== 'teacher') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

        const studentToAdd = await User.findOne({ email: email });
        if (!studentToAdd) {
            return NextResponse.json({ message: "Student not found with this email" }, { status: 404 });
        }

        const updatedClass = await Class.findByIdAndUpdate(
            classId,
            { $addToSet: { students: studentToAdd._id } },
            { new: true }
        ).populate("students", "name email image");

        return NextResponse.json({ 
            message: "Student added successfully", 
            students: updatedClass?.students 
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
    }
    
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOption);
    // @ts-ignore 
    if(session?.user?.role==='teacher'){
        try {
        await connectDb();
        const session = await getServerSession(authOption);
        const { id: classId } = await params;
        
        const { studentId } = await req.json();

        if (!session || !session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        // @ts-ignore
        if (session.user.role !== 'teacher') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

        if (!studentId) {
            return NextResponse.json({ message: "Student ID is required" }, { status: 400 });
        }

        const updatedClass = await Class.findByIdAndUpdate(
            classId,
            { $pull: { students: studentId } },
            { new: true }
        ).populate("students", "name email image");

        return NextResponse.json({ 
            message: "Student removed successfully",
            students: updatedClass?.students 
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
    }
    
}