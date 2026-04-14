import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
export async function GET(req:NextRequest){
    try{
        const {searchParams}=new URL(req.url)
        const email=searchParams.get('email')
        if(!email){
            return NextResponse.json({message:'invalid email'},{status:400});
        }
        await connectDb()
        const user=await User.findOne({email:email})
        if(!user){
            return NextResponse.json({message:"User not found"},{status:400})
        }
        return NextResponse.json({
            _id:user._id,
            name:user.name,
            email:user.email,
            image:user.image
        },{status:200})
    }
    catch(error){
        return NextResponse.json({message:'server error'},{status:500})
    }
}