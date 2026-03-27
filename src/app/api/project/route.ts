import connectDb from "@/lib/db";
import Project from "@/models/Project";
import Class from "@/models/Class";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOption } from "@/lib/authOption";
import { executionAsyncId } from "async_hooks";
export async function POST(req:Request){
    try{
        await connectDb()
        const session=await getServerSession(authOption)
        if(!session||!session.user){
            return NextResponse.json({message:'Unauhtorized'},{status:400})
        }
        //@ts-ignore
        const userId=session.user.id
        //@ts-ignore
        if(session.user.role!=='teacher'){
            return NextResponse.json({message:'only teachers are allowed to create peoject'},{status:401})
        }
        const {title,description,classId,requirements,referenceLinks,materials,deadline}=await req.json()
        if (!title || !description || !deadline) {
            return NextResponse.json({ message: "Title, description, and deadline are required" }, { status: 400 });
        }
        const newProject = await Project.create({
            title,
            description,
            classId: classId ? classId : undefined, // Leave undefined if not attached to a class
            professor: userId,
            requirements: requirements || { githubRepository: true, liveDemoUrl: false },
            referenceLinks: referenceLinks || [],
            materials: materials || [],
            deadline: new Date(deadline),
        });
        return NextResponse.json({message:'project created',project:newProject},{status:201})
    }        
    catch(error){
        return NextResponse.json({error:'error'},{status:501})
    }
}

export async function GET(req: Request) {
    try {
        await connectDb();
        const session = await getServerSession(authOption);

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // @ts-ignore
        const userId = session.user.id;
        // @ts-ignore
        const role = session.user.role;

        let projects = [];

        if (role === "teacher") {
            projects = await Project.find({ professor: userId })
                .populate("classId", "name code")
                .sort({ createdAt: -1 });
        } else if (role === "student") {
            const studentClasses = await Class.find({ students: userId }).select("_id");
            const classIds = studentClasses.map(c => c._id);

            projects = await Project.find({ classId: { $in: classIds } })
                .populate("classId", "name code")
                .populate("professor", "name")
                .sort({ deadline: 1 });
        }

        return NextResponse.json({ projects }, { status: 200 })
    }
    catch(error){
        return NextResponse.json({error:'error'},{status:501})
    }
}