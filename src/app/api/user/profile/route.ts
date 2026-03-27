import connectDb from "@/lib/db";
import User from '@/models/User'
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOption } from "@/lib/authOption";
import { University } from "lucide-react";
export async function GET(req:Request){
    try{
        await connectDb()
        const session=await getServerSession(authOption)
        if(!session||!session.user){
            return NextResponse.json({message:'unauthorized'},{status:401})
        }
        //@ts-ignore
        const userId=session.user.id
        const userProfile=await User.findById(userId)
        if(!userProfile){
            return NextResponse.json({message:'user not found'},{status:402})
        }
        return NextResponse.json({user:userProfile},{status:201})
    }
    catch(error){
        return NextResponse.json({error:'error'},{status:501})
    }
}

export async function PUT(req: Request) {
    try {
        await connectDb();
        const session = await getServerSession(authOption);

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // @ts-ignore
        const userId = session.user.id;
        const { 
            name, 
            image, 
            bio,           
            phoneNumber,   
            university,   
            department     
        } = await req.json();

        const updateData: Record<string, any> = {};
        
        if (name !== undefined) updateData.name = name;
        if (image !== undefined) updateData.image = image;
        if (bio !== undefined) updateData.bio = bio;
        if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
        if (university !== undefined) updateData.university = university;
        if (department !== undefined) updateData.department = department;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ message: "No valid fields provided for update" }, { status: 400 });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        )

        if (!updatedUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }
        console.log(university)

        return NextResponse.json({ message: "Profile updated successfully", user: updatedUser }, { status: 200 });

    } catch (error) {
        console.error("Update Profile Error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}