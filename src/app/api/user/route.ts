import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allUsers = await User.find({});
    console.log(allUsers);
 
    return NextResponse.json(
      { users: allUsers },
      { status: 200 }
    );
  } catch (error) {
    console.error("FETCH ERROR:", error);
    return NextResponse.json(
      { message: "Error in fetching users data" },
      { status: 500 }
    );
  }
}
