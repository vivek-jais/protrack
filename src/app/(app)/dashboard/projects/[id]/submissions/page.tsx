"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  Loader2, FileText, CheckCircle2, Clock, FolderDot, ExternalLink, ArrowLeft, Calendar, Target, Lock, MessageSquare
} from "lucide-react";
import Link from "next/link";

export default function ProjectSubmissionsTab() {
  const params = useParams();
  const { data: session } = useSession();
  
  // Ensure projectId is treated as a string
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [project, setProject] = useState<any>(null);
  const [myGroup, setMyGroup] = useState<any>(null);
  const [projectSubmissions, setProjectSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let projData = null;
        let groupData = null;

        // 1. Fetch Project Details
        const projRes = await fetch(`/api/project/${projectId}`);
        if (projRes.ok) {
          const resJson = await projRes.json();
          projData = resJson.project;
          setProject(projData);
        }

        // 2. Fetch Group Details (This handles BOTH Solo and Multi-member teams!)
        const groupRes = await fetch(`/api/project/${projectId}/group`);
        if (groupRes.ok) {
          const resJson = await groupRes.json();
          groupData = resJson.group;
          setMyGroup(groupData);
        }

        // 3. 🔥 THE FIX: Extract Submissions directly from Group Stage Progress
        // Because Solo workspaces are just "Groups of 1", this handles both flawlessly.
        if (projData && groupData && groupData.stageProgress) {
            const mappedSubmissions = groupData.stageProgress
              .filter((sp: any) => sp.status !== "Pending") // Only show submitted/graded stages
              .map((sp: any) => {
                  // Match the progress slot to the project blueprint
                  const stageDef = projData.stages.find((s: any) => s.stageNumber === sp.stageNumber);
                  
                  // Legacy Fallback (just in case old submissions are stuck in the project array)
                  const legacySub = stageDef?.submissions?.find((s:any) => String(s.groupId) === String(groupData._id));

                  const fileUrl = sp.submissionUrl || legacySub?.documents?.[0]?.fileUrl;

                  return {
                      stageIndex: sp.stageNumber,
                      stageName: stageDef?.name || stageDef?.title || `Stage ${sp.stageNumber}`,
                      maxMarks: stageDef?.marks || stageDef?.maxMarks || 100,
                      status: sp.status.toLowerCase() === 'graded' || legacySub?.status === 'evaluated' ? 'graded' : 'submitted',
                      submittedAt: sp.submittedAt || legacySub?.submittedAt,
                      submissionUrl: fileUrl,
                      fileName: fileUrl ? fileUrl.split('/').pop().replace(/^\d+-/, '') : "View Submission", // Cleans up the timestamp prefix
                      marksAwarded: sp.marksAwarded || legacySub?.evaluation?.marksAwarded,
                      feedback: sp.feedback || legacySub?.evaluation?.feedback
                  };
              });

            // Sort by stage number descending (newest stages first)
            mappedSubmissions.sort((a: any, b: any) => b.stageIndex - a.stageIndex);
            setProjectSubmissions(mappedSubmissions);
        }
        
      } catch (err) {
        toast.error("Error loading submissions data.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (session && projectId) fetchData();
  }, [session, projectId]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  if (isLoading) {
    return <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 dark:bg-zinc-950"><Loader2 className="animate-spin text-emerald-500 h-8 w-8" /></div>;
  }
  if (!project) return <div className="p-8 text-center text-gray-500 dark:text-zinc-400 min-h-screen">Project not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 dark:bg-zinc-950">
      <ToastContainer />
      
      {/* 🚀 HEADER & TABS */}
      <div className="bg-white border-b border-gray-200 dark:bg-zinc-900 dark:border-zinc-800 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <Link href="/dashboard/projects" className="flex items-center text-sm font-medium text-gray-500 hover:text-emerald-600 mb-4 dark:text-zinc-400 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{project.title}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" /> Due: {new Date(project.deadline).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1.5">
                  <Target className="h-4 w-4" /> {project.stages?.length || 0} Stages
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {myGroup && (
                <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg font-bold text-sm border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/50">
                  Team: {myGroup.name}
                </div>
              )}
              {/* URL ROUTING TABS */}
              <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl">
                <Link 
                  href={`/dashboard/projects/${projectId}/overview`}
                  className="px-6 py-2.5 text-sm font-bold rounded-lg transition-all text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  Overview
                </Link>
                <Link 
                  href={`/dashboard/projects/${projectId}/workspace`}
                  className="px-6 py-2.5 text-sm font-bold rounded-lg transition-all text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  Workspace
                </Link>
                <div className="px-6 py-2.5 text-sm font-bold rounded-lg transition-all bg-white text-emerald-600 shadow-sm dark:bg-zinc-950 dark:text-emerald-400 cursor-default">
                  My Submissions
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 📄 SUBMISSIONS CONTENT */}
      <div className="max-w-7xl mx-auto px-4 mt-8 animate-in fade-in duration-200">
        
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Submission History</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            All files uploaded by your team for this project, along with teacher remarks.
          </p>
        </div>

        {!myGroup ? (
          <div className="p-16 text-center flex flex-col items-center bg-white rounded-2xl border border-gray-200 dark:bg-zinc-900 dark:border-zinc-800">
            <Lock className="h-12 w-12 text-gray-300 dark:text-zinc-700 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Workspace Locked</h3>
            <p className="text-sm text-gray-500 mt-2">You must form a team or join solo before you can view submissions.</p>
          </div>
        ) : projectSubmissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-white rounded-3xl border border-gray-200 dark:bg-zinc-900 dark:border-zinc-800 p-16 text-center shadow-sm">
            <div className="h-20 w-20 bg-gray-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mb-6">
              <FolderDot className="h-10 w-10 text-gray-400 dark:text-zinc-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">No Submissions Yet</h3>
            <p className="text-sm text-gray-500 mt-2 max-w-sm leading-relaxed dark:text-zinc-400">
              Your team hasn't uploaded any files for this project yet. Go to the Workspace tab to submit your work.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/80 border-b border-gray-100 dark:bg-zinc-950/50 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-zinc-400 w-1/4">Stage</th>
                    <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-zinc-400 w-2/5">Uploaded Files & Feedback</th>
                    <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-zinc-400">Submitted On</th>
                    <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-zinc-400 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {projectSubmissions.map((sub, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors dark:hover:bg-zinc-950/30 group">
                        
                        {/* Stage Info */}
                        <td className="px-6 py-5 align-top">
                          <span className="font-bold text-base text-gray-900 dark:text-white block">
                            Stage {sub.stageIndex}
                          </span>
                          <span className="text-xs font-medium text-gray-500 dark:text-zinc-400 mt-1 block">
                            {sub.stageName}
                          </span>
                        </td>

                        {/* File Chips & Feedback */}
                        <td className="px-6 py-5 align-top">
                          <div className="flex flex-col gap-4">
                            
                            {/* Files */}
                            <div className="flex flex-wrap gap-2">
                              {sub.submissionUrl && (
                                <a 
                                  href={sub.submissionUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200 transition-all dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-900/30 dark:hover:bg-emerald-900/20 w-max"
                                >
                                  <FileText className="h-4 w-4 shrink-0 opacity-80" />
                                  <span className="truncate max-w-[200px] text-xs font-bold">{sub.fileName}</span>
                                  <ExternalLink className="h-3 w-3 opacity-50 shrink-0" />
                                </a>
                              )}
                            </div>

                            {/* 🔥 TEACHER FEEDBACK VISIBLE TO STUDENTS */}
                            {sub.status === 'graded' && sub.feedback && (
                              <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl dark:bg-emerald-900/10 dark:border-emerald-900/20">
                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1.5 dark:text-emerald-500">
                                  <MessageSquare className="h-3 w-3" /> Teacher Remarks
                                </p>
                                <p className="text-sm text-emerald-900 dark:text-emerald-100 leading-relaxed">
                                  "{sub.feedback}"
                                </p>
                              </div>
                            )}

                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-5 align-top">
                          <div className="flex items-center gap-1.5 text-gray-600 dark:text-zinc-400 text-sm font-medium mt-1">
                            <Clock className="h-4 w-4 text-gray-400 dark:text-zinc-500" /> 
                            {formatDate(sub.submittedAt)}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-5 align-top text-right">
                          {sub.status === 'graded' ? (
                            <div className="flex flex-col items-end gap-1.5">
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg dark:bg-emerald-900/20 dark:border-emerald-900/30 dark:text-emerald-400">
                                <CheckCircle2 className="h-4 w-4" /> Evaluated
                              </span>
                              <span className="text-xs font-bold text-gray-500 dark:text-zinc-400">Score: <span className="text-gray-900 dark:text-white">{sub.marksAwarded}</span>/{sub.maxMarks}</span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg dark:bg-emerald-900/20 dark:border-emerald-900/30 dark:text-emerald-400">
                              Submitted Pending
                            </span>
                          )}
                        </td>

                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}