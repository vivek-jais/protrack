import connectDb from "@/lib/db";
import Resource from "@/models/Resource";
import Class from "@/models/Class";
import { getServerSession } from "next-auth";
import { authOption } from "@/lib/authOption";
import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusherServer";
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDb();
        const session = await getServerSession(authOption);
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { id: classId } = await params;

        // 🔥 STRICT FILTER: Only pulls resources matching this exact classId
        const resources = await Resource.find({ classId: classId })
            .populate('teacherId', 'name image')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ resources }, { status: 200 });
    } catch (error) {
        console.error("Fetch Resources Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

// 📤 POST: Create a new material (Strictly for the Teacher who owns the class)
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDb();
        const session = await getServerSession(authOption);
        
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // @ts-ignore
        if (session.user.role !== "teacher") {
            return NextResponse.json({ message: "Forbidden: Only teachers can post materials" }, { status: 403 });
        }

        const { id: classId } = await params;
        const { title, content, type, url } = await req.json();

        if (!title) {
            return NextResponse.json({ message: "Title is required" }, { status: 400 });
        }

        const existingClass = await Class.findById(classId);
        
        if (!existingClass) {
            return NextResponse.json({ message: "Class not found" }, { status: 404 });
        }

        // 🔥 FIX: NextAuth sometimes uses _id instead of id depending on your DB adapter. This catches both!
        // @ts-ignore
        const userId = session?.user?.id || session?.user?._id; 

        const classOwnerId = existingClass.professor?.toString();
        
        if (classOwnerId !== userId) {
            return NextResponse.json({ message: "Forbidden: You are not the professor for this class." }, { status: 403 });
        }

        // Save the resource 
        const newResource = new Resource({
            classId: classId,
            teacherId: userId,
            title,
            content,
            type: type || "announcement",
            url: url || ""
        });

        await newResource.save();

        // 🔥 DEBUG LOG: This will print in your VS Code terminal when a teacher posts!
        console.log(`[PUSHER] Attempting to trigger class-${classId}...`);

        // Trigger the real-time notification
        await pusherServer.trigger(`class-${classId}`, "new-announcement", {
            title: newResource.title,
            courseCode: existingClass.code,
            message: `New ${newResource.type} posted by Professor!`
        });

        console.log(`[PUSHER] Successfully triggered!`);

        return NextResponse.json({ message: "Posted successfully!", resource: newResource }, { status: 201 });

    } catch (error) {
        console.error("Post Resource Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}