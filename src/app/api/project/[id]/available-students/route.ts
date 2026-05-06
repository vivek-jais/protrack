import connectDb from "@/lib/db";
import Project from "@/models/Project";
import Class from "@/models/Class";
import Group from "@/models/Group";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOption } from "@/lib/authOption";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDb();
        const session = await getServerSession(authOption);
        
        const { id: projectId } = await params; 

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // 1. Fetch the project
        const project = await Project.findById(projectId);
        if (!project) {
            return NextResponse.json({ availableStudents: [] }, { status: 200 });
        }

        let allClassStudents = [];

        // 2. Fetch Potential Teammates (EXCLUDING TEACHERS)
        if (project.classId) {
            // A. Class Project: Fetch enrolled students, but strictly block teachers just in case
            const classData = await Class.findById(project.classId);
            if (classData && classData.students && classData.students.length > 0) {
                allClassStudents = await User.find({ 
                    _id: { $in: classData.students },
                    role: { $ne: "teacher" } // 🔥 Ensure no teachers slip into class rosters
                }).select("name email image role");
            }
        } else {
            // B. Standalone Project: Fetch all users, but strictly IGNORE teachers
            allClassStudents = await User.find({
                role: { $ne: "teacher" } // 🔥 THE FIX: Block teachers from the global pool
            }).select("name email image role");
        }

        // 3. Find ALL Groups formed for THIS specific project
        const projectGroups = await Group.find({ projectId: projectId });

        // Extract every single userId that is already part of a group for this project
        const occupiedUserIds = new Set();
        projectGroups.forEach(group => {
            group.members.forEach((member: any) => {
                if (member.student) {
                    occupiedUserIds.add(member.student.toString());
                }
            });
        });

        // 4. The Magic Filter: Keep only students who are NOT in the occupied Set
        const availableStudents = allClassStudents.filter(
            (student: any) => !occupiedUserIds.has(student._id.toString())
        );

        return NextResponse.json({ availableStudents }, { status: 200 });

    } catch (error) {
        console.error("Fetch Available Students Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}