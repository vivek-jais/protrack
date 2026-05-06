"use client";

import React, { useState, useEffect } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    Loader2, Users, ArrowLeft, Target, Calendar, Info, ArrowRight, Lightbulb, Clock, CheckCircle2, XCircle
} from "lucide-react";
import Link from "next/link";
// Make sure to import the component we created in the previous step!
import SubmitIdeaForm from "@/components/SubmitIdeaForm"; 

export default function ProjectOverviewPage() {
    const params = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const { data: session } = useSession();

    const projectId = Array.isArray(params.id) ? params.id[0] : params.id;

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
        if (session && projectId) fetchWorkspaceData();
    }, [session, projectId]);

    const handleResetWorkspace = async () => {
        if (!confirm("Are you sure you want to delete your Solo Workspace? This will allow you to create a new team.")) return;

        try {
            const res = await fetch(`/api/project/${projectId}/leave`, { 
                method: "DELETE" 
            });
            
            if (res.ok) {
                window.location.reload(); 
            } else {
                toast.error("Failed to reset workspace.");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while leaving the workspace.");
        }
    };

    if (isLoading) return <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950"><Loader2 className="animate-spin text-emerald-500 h-8 w-8" /></div>;
    if (!project) return <div className="p-8 text-center text-gray-900 dark:text-white bg-gray-50 dark:bg-zinc-950 min-h-screen">Project not found.</div>;

    // Helper to determine badge color based on idea approval status
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Approved":
                return <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"><CheckCircle2 className="h-3.5 w-3.5" /> Approved</span>;
            case "Rejected":
                return <span className="flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"><XCircle className="h-3.5 w-3.5" /> Rejected</span>;
            default:
                return <span className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"><Clock className="h-3.5 w-3.5" /> Pending Approval</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 dark:bg-zinc-950">
            <ToastContainer />

            {/* HEADER & TABS (Kept exactly as yours) */}
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
                                    className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${pathname.includes('submissions') ? "bg-white text-emerald-600 shadow-sm dark:bg-zinc-950 dark:text-white" : "text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white"}`}
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
                    
                    {/* LEFT COLUMN: Project Details & Idea Pitching */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* 1. Base Project Details (From Teacher) */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                            <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-gray-900 dark:text-white">
                                <Info className="h-5 w-5 text-emerald-500" /> Master Project Details
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

                        {/* 2. 🔥 THE NEW IDEA WORKFLOW 🔥 */}
                        {myGroup && (
                            <>
                                {myGroup.idea && myGroup.idea.title ? (
                                    // State A: Idea is already submitted. Show the status card.
                                    <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                    <Lightbulb className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-zinc-400">Team's Pitched Idea</p>
                                                    <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">{myGroup.idea.title}</h2>
                                                </div>
                                            </div>
                                            {getStatusBadge(myGroup.idea.approvalStatus)}
                                        </div>
                                        
                                        <div className="bg-gray-50 dark:bg-zinc-950/50 p-4 rounded-xl border border-gray-100 dark:border-zinc-800/50">
                                            <p className="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
                                                {myGroup.idea.description || "No detailed description provided."}
                                            </p>
                                        </div>

                                        {/* Show teacher feedback if it exists */}
                                        {myGroup.idea.feedback && (
                                            <div className="mt-4 border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-900/10 p-4 rounded-r-xl">
                                                <p className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider mb-1">Professor Feedback</p>
                                                <p className="text-sm text-amber-900 dark:text-amber-200/80">{myGroup.idea.feedback}</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    // State B: Group formed, but NO Idea pitched yet. Show the form.
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <SubmitIdeaForm />
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Roster & Controls */}
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
                                
                                <button
                                    onClick={handleResetWorkspace}
                                    className="mt-6 w-full rounded-xl border border-rose-500 bg-rose-50 py-2.5 text-sm font-bold text-rose-600 transition-colors hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
                                >
                                    Delete Solo Workspace & Create Team
                                </button>
                            </div>
                        ) : (
                            <div className="bg-gray-900 p-8 rounded-3xl text-white shadow-xl dark:bg-white dark:text-gray-900 relative overflow-hidden">
                                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/20 blur-2xl"></div>
                                <h3 className="text-xl font-bold mb-2 relative z-10">Ready to Start?</h3>
                                <p className="text-gray-400 dark:text-gray-600 text-sm mb-6 leading-relaxed relative z-10">
                                    You need to form a group for this project to unlock the workspace and pitch your idea to the professor.
                                </p>
                                <button
                                    onClick={() => router.push(`/createGroup?projectId=${project._id}`)}
                                    className="relative z-10 w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
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