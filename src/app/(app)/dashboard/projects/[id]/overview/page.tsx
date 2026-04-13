"use client";

import React, { useState, useEffect } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ToastContainer, toast } from "react-toastify";
import {
    Loader2, Users, ArrowLeft, Target, Calendar, Info, ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function ProjectOverviewPage() {
    const params = useParams();
    const router = useRouter();
    const pathname = usePathname(); // Used to highlight the active tab
    const { data: session } = useSession();

    const projectId = params.id;

    const [project, setProject] = useState<any>(null);
    const [myGroup, setMyGroup] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchWorkspaceData = async () => {
            try {
                const projRes = await fetch(`/api/project/${projectId}`);
                const projData = await projRes.json();
                setProject(projData.project);

                const groupRes = await fetch(`/api/project/${projectId}/group`);
                if (groupRes.ok) {
                    const groupData = await groupRes.json();
                    setMyGroup(groupData.group);
                }
            } catch (err) {
                toast.error("Error loading workspace.");
            } finally {
                setIsLoading(false);
            }
        };
        if (session) fetchWorkspaceData();
    }, [session, projectId]);

    if (isLoading) return <div className="flex h-screen items-center justify-center bg-zinc-950"><Loader2 className="animate-spin text-emerald-500 h-8 w-8" /></div>;
    if (!project) return <div className="p-8 text-center text-white bg-zinc-950 min-h-screen">Project not found.</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20 dark:bg-zinc-950">
            <ToastContainer />

            {/* HEADER & TABS */}
            <div className="bg-white border-b border-gray-200 dark:bg-zinc-900 dark:border-zinc-800 py-6">
                <div className="max-w-7xl mx-auto px-4">
                    <Link href="/dashboard/projects" className="flex items-center text-sm font-medium text-gray-500 hover:text-emerald-600 mb-4 dark:text-zinc-400">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{project.title}</h1>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-zinc-400">
                                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Due: {new Date(project.deadline).toLocaleDateString()}</span>
                                <span className="flex items-center gap-1.5"><Target className="h-4 w-4" /> {project.stages?.length || 0} Stages</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {myGroup && (
                                <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg font-bold text-sm border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/50">
                                    Team: {myGroup.name}
                                </div>
                            )}
                            {/* TRUE URL ROUTING TABS */}
                            <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl">
                                <Link
                                    href={`/dashboard/projects/${projectId}/overview`}
                                    className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${pathname.includes('overview') ? "bg-white text-emerald-600 shadow-sm dark:bg-zinc-950 dark:text-white" : "text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white"}`}
                                >
                                    Overview
                                </Link>
                                <Link
                                    href={`/dashboard/projects/${projectId}/workspace`}
                                    className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${pathname.includes('workspace') ? "bg-white text-emerald-600 shadow-sm dark:bg-zinc-950 dark:text-white" : "text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white"}`}
                                >
                                    Workspace
                                </Link>
                                <Link
                                    href={`/dashboard/projects/${projectId}/submissions`}
                                    className="px-6 py-2.5 text-sm font-bold rounded-lg transition-all text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white"
                                >
                                    My Submissions
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* OVERVIEW CONTENT */}
            <div className="max-w-7xl mx-auto px-4 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                            <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-gray-900 dark:text-white">
                                <Info className="h-5 w-5 text-emerald-500" /> Project Details
                            </h2>
                            <div className="mb-4 flex items-center gap-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30">
                                <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                                    {project.professor?.image ? <img src={project.professor.image} alt="p" className="h-full w-full object-cover" /> : project.professor?.name?.[0] || "P"}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-zinc-400">Assigned By</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{project.professor?.name || "Professor"}</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">{project.description}</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {myGroup ? (
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Users className="h-5 w-5 text-emerald-500" /> Your Roster
                                </h3>
                                <div className="space-y-3">
                                    {myGroup.members?.map((m: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 dark:bg-zinc-950/50 dark:border-zinc-800">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                                                    {m.student?.image ? <img src={m.student.image} alt="profile" className="h-full w-full object-cover" /> : m.student?.name?.[0]}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate flex items-center gap-2">
                                                        {m.student?.name} {myGroup.leader === m.student?._id && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded uppercase">(Lead)</span>}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider truncate">{m.assignedRole}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-900 p-8 rounded-2xl text-white shadow-xl dark:bg-white dark:text-gray-900">
                                <h3 className="text-xl font-bold mb-2">Ready to Start?</h3>
                                <p className="text-gray-400 dark:text-gray-600 text-sm mb-6 leading-relaxed">
                                    You need to form a group for this project to unlock the workspace and start submitting milestones.
                                </p>
                                <button
                                    onClick={() => router.push('/dashboard/createGroup')}
                                    className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    Go to Team Builder <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}