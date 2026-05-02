import connectDb from "@/lib/db";
import Class from "@/models/Class";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOption } from "@/lib/authOption";
export async function POST(req:Request){
    try{
        await connectDb()
        const session=await getServerSession(authOption)
        //@ts-ignore
        if(!session||!session.user){
            return NextResponse.json({message:'unauthorized'},{status:401})
        }
        //@ts-ignore
        const userId=session?.user?.id
        //@ts-ignore
        const role=session?.user?.role
        if(role!=='student'){
            return NextResponse.json({message:"you are not allowed to access the page"},{status:403})
        }
        //vo placeholder mai classId daalenge that woyld be in POST request
        const {classId}=await req.json()
        if(!classId){
            return NextResponse.json({ message: "Class ID is required" }, { status: 400 });
        }
        const classInfo=await Class.findById(classId);
        if (!classInfo) {
            return NextResponse.json({ message: "Class not found" }, { status: 404 });
        }
        if (classInfo.students.includes(userId)) {
            return NextResponse.json({ message: "You are already enrolled in this class" }, { status: 400 });
        }
        classInfo.students.push(userId)
        await classInfo.save()
        return NextResponse.json({ message: "Successfully joined the class!" }, { status: 200 });
    }
    catch(error){
        return NextResponse.json({error:"Unexpected error"},{status:501})
    }
}