import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOption } from "@/lib/authOption";
import connectDb from "@/lib/db";
import Class from "@/models/Class";
export async function GET(req:Request,{params}:{params:Promise<{id:string}>}){
    try{
        const session=await getServerSession(authOption)
        const {id}=await params
        const userId=id
        console.log("🔹 API HIT: Get User Classes");
    console.log("🔹 Requested ID (URL):", userId);
    // @ts-ignore
    console.log("🔹 Session ID (Cookie):", session?.user?.id || "NO SESSION");
        //@ts-ignore
        if(!session||!session.user){
            return NextResponse.json({message:"unauthorized user"},{status:401})
        }
        
        if(!userId){
            return NextResponse.json({message:"User ID is required"},{status:400})
        }
        await connectDb()
        const enrolledClasses=await Class.find({students:userId})
        .populate("professor", "name email image")
        .sort({ createdAt: -1 });
        return NextResponse.json({count: enrolledClasses.length, classes: enrolledClasses},{status:201})
    }
    catch(error){
        console.error("FETCH ENROLLED CLASSES ERROR:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}