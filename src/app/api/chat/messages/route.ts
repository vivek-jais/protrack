import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOption } from "@/lib/authOption";
import connectDb from "@/lib/db";
import Message from "@/models/Message";
import User from "@/models/User";

export async function GET(req: Request) {
  const session = await getServerSession(authOption);
  // @ts-ignore
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const otherUserId = searchParams.get("userId");

  if (!otherUserId) return NextResponse.json({ message: "User ID required" }, { status: 400 });

  await connectDb();

  const messages = await Message.find({
    $or: [
      // @ts-ignore
      { sender: session.user.id, receiver: otherUserId },
      // @ts-ignore
      { sender: otherUserId, receiver: session.user.id }
    ]
  }).sort({ createdAt: 1 }); // Oldest first

  // Update last active status for the current user
  // @ts-ignore
  await User.findByIdAndUpdate(session.user.id, { lastActive: new Date() });

  return NextResponse.json(messages, { status: 200 });
}

// POST a new message
export async function POST(req: Request) {
  const session = await getServerSession(authOption);
  // @ts-ignore
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { receiverId, content } = await req.json();

  await connectDb();

  const newMessage = await Message.create({
    // @ts-ignore
    sender: session.user.id,
    receiver: receiverId,
    content,
  });

  return NextResponse.json(newMessage, { status: 201 });
}