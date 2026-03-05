import Group from "@/models/Group";
import { getServerSession } from "next-auth";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { authOption } from "@/lib/authOption";
export async function POST(req: Request) {

  const session = await getServerSession(authOption);
  // @ts-ignore
  const userId = session.user.id;

  const { name, classId, selectedMemberIds } = await req.json();

  const newGroup = await Group.create({
    name,
    classId,
    groupHead: userId, 
    members: [userId, ...selectedMemberIds] 
  });

  return NextResponse.json(newGroup);
}