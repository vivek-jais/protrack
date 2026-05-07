"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
    Megaphone, FileText, Video, Link as LinkIcon,
    Loader2, ExternalLink, BookOpen, Users, Calendar
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import Link from "next/link";

export default function StudentClassWorkspace() {
    const params = useParams();
    const classId = params.id;

    const [classDetails, setClassDetails] = useState<any>(null);
    const [resources, setResources] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchClassData = async () => {
            try {
                // 1. Fetch Class Header Info
                const classRes = await fetch(`/api/class/${classId}`);
                if (classRes.ok) {
                    const classData = await classRes.json();
                    setClassDetails(classData.class || classData);
                }

                // 2. Fetch the Read-Only Resource Stream
                const resourceRes = await fetch(`/api/class/${classId}/resources`);
                if (resourceRes.ok) {
                    const resourceData = await resourceRes.json();
                    setResources(resourceData.resources || []);
                }
            } catch (error) {
                toast.error("Failed to load class materials.");
            } finally {
                setIsLoading(false);
            }
        };

        if (classId) fetchClassData();
    }, [classId]);

    const getIconForType = (type: string) => {
        switch (type) {
            case "video": return <Video className="h-5 w-5 text-red-500" />;
            case "note": return <FileText className="h-5 w-5 text-blue-500" />;
            case "link": return <LinkIcon className="h-5 w-5 text-purple-500" />;
            default: return <Megaphone className="h-5 w-5 text-emerald-500" />;
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 pb-20">
            <ToastContainer />

            {/* 🏫 IMMERSIVE CLASS HEADER */}
            <div className="bg-emerald-700 dark:bg-emerald-900 pb-24 pt-12 px-4 sm:px-6 lg:px-8 shadow-inner relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>

                <div className="max-w-4xl mx-auto relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex items-start gap-5">
                        <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/30 shadow-lg shrink-0">
                            <BookOpen className="h-8 w-8" />
                        </div>
                        <div className="text-white">
                            <p className="text-emerald-100 font-bold tracking-widest text-sm uppercase mb-1">
                                {/* 🔥 Changed courseCode to code */}
                                {classDetails?.code || "Class Workspace"}
                            </p>
                            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
                                {classDetails?.name || "Loading Class..."}
                            </h1>
                            <p className="flex items-center gap-2 text-emerald-50 font-medium">
                                <Users className="h-4 w-4" />
                                {/* 🔥 Changed teacher.name to professor.name */}
                                Prof. {classDetails?.professor?.name || "TBA"}
                            </p>
                        </div>
                    </div>

                    {/* Quick Action for Student */}
                    <Link
                        href={`/dashboard/projects`}
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-5 py-2.5 rounded-xl font-bold transition-all"
                    >
                        <Calendar className="h-4 w-4" /> View Assignments
                    </Link>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-20 space-y-8">

                {/* 📚 THE READ-ONLY CLASS STREAM */}
                <div className="space-y-6">
                    {resources.length === 0 ? (
                        <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
                            <BookOpen className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Welcome to {classDetails?.courseCode || "class"}!</h3>
                            <p className="text-zinc-500 font-medium">No materials or announcements have been posted here yet.</p>
                        </div>
                    ) : (
                        resources.map((res) => (
                            <div key={res._id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-all">
                                <div className="flex items-start gap-4">

                                    {/* Dynamic Icon */}
                                    <div className="mt-1 h-12 w-12 shrink-0 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center border border-zinc-100 dark:border-zinc-700">
                                        {getIconForType(res.type)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{res.title}</h3>
                                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                                                {new Date(res.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                            </span>
                                        </div>

                                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-3">
                                            Posted by Prof. {res.teacherId?.name || "Teacher"}
                                        </p>

                                        {res.content && (
                                            <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4 whitespace-pre-wrap">
                                                {res.content}
                                            </div>
                                        )}

                                        {/* Attachment Link */}
                                        {res.url && (
                                            <a
                                                href={res.url} target="_blank" rel="noreferrer"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                                            >
                                                <ExternalLink className="h-4 w-4" /> Open Attachment
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
}