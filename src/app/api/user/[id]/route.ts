import User from "@/models/User";
import { NextResponse } from "next/server";
import { useSession } from "next-auth/react";
import connectDb from "@/lib/db";
export default async function GET(req: Request,
  { params }: { params: Promise<{ id: string }> } // params is a Promise now
){
    // const {data:session}=useSession()
    try{
        const {id}=await params
        await connectDb()
        const dbUser=await User.findById(id)
        if(!dbUser){
            return NextResponse.json({message:"User not registered"},{status:400})
        }
        return NextResponse.json(dbUser,{status:200})
    }
    catch(error){
        return NextResponse.json({error:"error"},{status:500})
    }
}
