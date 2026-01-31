import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOption } from "@/lib/authOption";
import connectDb from "@/lib/db";
import Class from "@/models/Class";

export async function PATCH(request:Request){
    try{
        const session=await getServerSession(authOption)
        //@ts-ignore
        if(!session||!session.user||!session.user.id){
            return NextResponse.json({message:'unauthorized'},{status:400})
        }
        //destrec
        const {classId,name,description,schedule,theme}=await request.json()
        if(!classId){
            return NextResponse.json({message:"First make class"},{status:400})
        }
        await connectDb()
        const existingClass=await Class.findById(classId)
        if(!existingClass){
            return NextResponse.json({message:"class not found"},{status:404})
        }
        //@ts-ignore
        if(existingClass.professor.toString()!==session.user.id){
            return NextResponse.json({message:"you dont own this class"},{status:403})
        }
        if(name) existingClass.name=name
        if(description!==undefined) existingClass.description=description
        if (schedule !== undefined) existingClass.schedule = schedule
        if (theme) existingClass.theme = theme

        await existingClass.save()
        return NextResponse.json(
            {
                message:"Class updated successfully",
                class:existingClass
            },
            {
                status:200
            }
        )
    }catch(error){
        return NextResponse.json({error:"internal server error"},{status:500})
    }
}