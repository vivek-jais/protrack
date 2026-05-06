import connectDb from "@/lib/db";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOption } from "@/lib/authOption";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
    try {
        await connectDb();
        const session = await getServerSession(authOption);
        
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { preferences } = body;

        if (!preferences) {
            return NextResponse.json({ message: "Preferences payload is missing" }, { status: 400 });
        }

        // @ts-ignore
        const userId = session.user.id;

        // 🔥 THE MAGIC: We ONLY update the nested `preferences` object. 
        // This will NEVER accidentally overwrite their name, password, or email!
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { preferences: preferences } },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Preferences updated successfully", preferences: updatedUser.preferences }, { status: 200 });

    } catch (error) {
        console.error("Preferences Update Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}