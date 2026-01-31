import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOption } from "@/lib/authOption"; 
import connectToDB from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    // 1. Check Session
    const session = await getServerSession(authOption);
    
    // Safety Check: Make sure session has user AND id
    // @ts-ignore
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized: No Session ID found" }, { status: 401 });
    }

    // 2. Get Data from Client
    const { role, name, image } = await req.json();

    // 3. Validate Role
    if (!["student", "teacher"].includes(role)) {
      return NextResponse.json({ message: "Invalid role selected" }, { status: 400 });
    }

    await connectToDB();

    // 4. Update the User
    // We use a dynamic object to only update fields that actually exist
    const updateData: any = { role };

    // Only update name if it's a valid string
    if (name && name.trim().length > 0) {
      updateData.name = name;
    }

    // Only update image if it's provided (allow empty string to clear it, or valid URL)
    if (image !== undefined) {
      updateData.image = image;
    }

    // @ts-ignore
    const updatedUser = await User.findByIdAndUpdate(
      // @ts-ignore
      session.user.id,
      updateData,
      { new: true } // This option returns the updated document
    );

    if (!updatedUser) {
        return NextResponse.json({ message: "User not found in database" }, { status: 404 });
    }

    return NextResponse.json({ 
        message: "Profile updated successfully", 
        user: updatedUser 
    }, { status: 200 });

  } catch (error) {
    console.error("UPDATE ERROR:", error); // Log the actual error to your terminal
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}