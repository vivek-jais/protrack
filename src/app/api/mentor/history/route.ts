import connectDb from "@/lib/db";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import ChatHistory from "@/models/ChatHistory";

export async function GET(req: Request) {
    try {
        await connectDb();
        const { searchParams } = new URL(req.url);
        const threadId = searchParams.get('threadId');

        if (!threadId) {
            return NextResponse.json({ message: "threadId required" }, { status: 400 });
        }

        const session = await ChatHistory.findOne({ threadId });
        
        if (!session) {
            return NextResponse.json({ messages: [] }, { status: 200 });
        }

        return NextResponse.json({ messages: session.messages }, { status: 200 });
    } catch (error) {
        console.error("Error fetching chat history:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectDb();
        const body = await req.json();
        const { threadId, userId, messages } = body;

        if (!threadId || !userId || !messages) {
             return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        await ChatHistory.findOneAndUpdate(
            { threadId },
            { 
                threadId, 
                userId, 
                messages
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({ message: "History saved successfully" }, { status: 200 });

    } catch (error) {
         console.error("Error saving chat history:", error);
         return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}