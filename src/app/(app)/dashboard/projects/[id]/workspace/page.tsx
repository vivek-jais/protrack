"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ToastContainer, toast } from "react-toastify";
import { 
  Loader2, ArrowLeft, Target, Calendar, 
  CheckCircle2, Lock, UploadCloud, FileText
} from "lucide-react";
import Link from "next/link";

export default function ProjectWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const projectId = params.id;

  const [project, setProject] = useState<any>(null);
  const [myGroup, setMyGroup] = useState<any>(null);
  const [isLeader, setIsLeader] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [submittingStageIndex, setSubmittingStageIndex] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchWorkspaceData = async () => {
    try {
      const projRes = await fetch(`/api/project/${projectId}`);
      const projData = await projRes.json();
      setProject(projData.project);

      const groupRes = await fetch(`/api/project/${projectId}/group`);
      if (groupRes.ok) {
        const groupData = await groupRes.json();
        setMyGroup(groupData.group);
        // @ts-ignore
        if (groupData.group && groupData.group.leader === session?.user?.id) {
          setIsLeader(true);
        }
      }
    } catch (err) {
      toast.error("Error loading workspace.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchWorkspaceData();
  }, [session, projectId]);

  const handleFileSubmit = async (stageIndex: number) => {
    if (!selectedFile) {
      toast.error("Please select a PDF or DOCX file to upload.");
      return;
    }
    setSubmittingStageIndex(stageIndex);
    try {
      const formData = new FormData();
      formData.append("groupId", myGroup._id);
      formData.append("file", selectedFile);

      const res = await fetch(`/api/project/${projectId}/stage/${stageIndex}/submit`, {
        method: "POST",
        body: formData, 
      });

      if (res.ok) {
        toast.success("File uploaded successfully!");
        setSelectedFile(null); 
        await fetchWorkspaceData(); 
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to upload file.");
      }
    } catch (error) {
      toast.error("Upload error.");
    } finally {
      setSubmittingStageIndex(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "TBD";
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStageStatus = (stage: any, submission: any) => {
    if (submission?.status === 'evaluated') return 'evaluated';
    
    const now = new Date().getTime(); 
    const deadlineTime = stage.deadline ? new Date(stage.deadline).getTime() : null;
    const startTime = stage.startDate ? new Date(stage.startDate).getTime() : null;

    if (deadlineTime && now > deadlineTime) return 'closed';
    if (startTime && now < startTime) return 'upcoming';
    return 'live'; // If it's between start and deadline, it's live!
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-zinc-950"><Loader2 className="animate-spin text-emerald-500 h-8 w-8" /></div>;
  if (!project) return <div className="p-8 text-center text-white bg-zinc-950 min-h-screen">Project not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 dark:bg-zinc-950">
      <ToastContainer />
      
      {/* HEADER & ROUTING TABS */}
      <div className="bg-white border-b border-gray-200 dark:bg-zinc-900 dark:border-zinc-800 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <Link href="/dashboard/projects" className="flex items-center text-sm font-medium text-gray-500 hover:text-emerald-600 mb-4 dark:text-zinc-400">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{project.title}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-zinc-400">
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Due: {formatDate(project.deadline)}</span>
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
                  className="px-6 py-2.5 text-sm font-bold rounded-lg transition-all text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  Overview
                </Link>
                <div className="px-6 py-2.5 text-sm font-bold rounded-lg transition-all bg-white text-emerald-600 shadow-sm dark:bg-zinc-950 dark:text-white cursor-default">
                  Workspace
                </div>
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

      {/* WORKSPACE CONTENT */}
      <div className="max-w-7xl mx-auto px-4 mt-8 animate-in fade-in duration-200">
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Milestone Tracking</h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
              {isLeader ? "As the Team Leader, upload your team's PDF or DOCX files for each stage." : "Only the Team Leader can upload files for the group."}
            </p>
          </div>
          
          {!myGroup ? (
            <div className="p-16 text-center flex flex-col items-center bg-white rounded-2xl border border-gray-200 dark:bg-zinc-900 dark:border-zinc-800">
              <Lock className="h-12 w-12 text-gray-300 dark:text-zinc-700 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Workspace Locked</h3>
              <p className="text-sm text-gray-500 mt-2">You must form or join a team before you can upload submissions.</p>
              <button onClick={() => router.push('/createGroup')} className="mt-6 px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700">Form a Team</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {project.stages?.map((stage: any, idx: number) => {
                const submission = stage.submissions?.find((s: any) => s.groupId === myGroup?._id);
                const status = getStageStatus(stage, submission);
                
                return (
                  <div key={idx} className={`p-6 rounded-2xl border transition-all flex flex-col ${
                    status === 'live' ? 'border-emerald-300 bg-emerald-50/30 dark:border-emerald-900/50 dark:bg-emerald-900/10 shadow-sm' : 
                    'border-gray-200 bg-white dark:bg-zinc-900 dark:border-zinc-800'
                  }`}>
                    
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Stage {idx + 1}</p>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{stage.stageName}</h3>
                      </div>
                      
                      <div className="shrink-0">
                        {status === 'evaluated' ? (
                          <span className="flex items-center gap-1 text-xs font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md dark:bg-emerald-900/30 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" /> EVALUATED
                          </span>
                        ) : status === 'live' && submission?.documents?.length > 0 ? (
                          <span className="flex items-center gap-1.5 text-xs font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md dark:bg-emerald-900/30 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" /> SUBMITTED
                          </span>
                        ) : status === 'live' ? (
                          <span className="flex items-center gap-1.5 text-xs font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md dark:bg-emerald-900/30 dark:text-emerald-400">
                            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
                            LIVE
                          </span>
                        ) : status === 'closed' ? (
                          <span className="text-xs font-bold bg-rose-100 text-rose-700 px-2.5 py-1 rounded-md dark:bg-rose-900/30 dark:text-rose-400">CLOSED</span>
                        ) : (
                          <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2.5 py-1 rounded-md dark:bg-zinc-800 dark:text-zinc-400">UPCOMING</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-4 text-xs font-medium text-gray-500 dark:text-zinc-400 mb-6">
                      <span>Max: {stage.maxMarks} Marks</span>
                      <span>•</span>
                      <span>{formatDate(stage.startDate)} - {formatDate(stage.deadline)}</span>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-zinc-800/50 space-y-4">
                      
                      {/* 🔥 SHOW ALL FILES LOOP */}
                      {submission && submission.documents && submission.documents.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider dark:text-zinc-400">Uploaded Files</p>
                          <div className="flex flex-col gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                            {submission.documents.map((doc: any, dIdx: number) => (
                              <a 
                                key={dIdx} 
                                href={doc.fileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                download={doc.fileName} // Ensures the file downloads/opens
                                className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 p-2.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/20 transition-colors"
                              >
                                <FileText className="h-4 w-4 shrink-0" /> 
                                <span className="truncate">{doc.fileName}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 🔥 SHOW UPLOAD FORM (Only if Leader AND Status is Live) */}
                      {isLeader && status === 'live' ? (
                        <div className="flex flex-col gap-3">
                          <label className="flex items-center justify-between p-3 border border-dashed border-emerald-300 bg-emerald-50/50 rounded-xl cursor-pointer hover:bg-emerald-50 transition-colors dark:border-emerald-900/50 dark:bg-emerald-900/10 dark:hover:bg-emerald-900/20">
                            <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 overflow-hidden">
                              <UploadCloud className="h-5 w-5 shrink-0" />
                              <span className="truncate">{selectedFile && submittingStageIndex === idx ? selectedFile.name : "Select PDF/DOCX File"}</span>
                            </div>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setSelectedFile(e.target.files[0]);
                                  setSubmittingStageIndex(idx);
                                }
                              }}
                            />
                          </label>
                          <button 
                            onClick={() => handleFileSubmit(idx)}
                            disabled={submittingStageIndex !== idx || !selectedFile}
                            className="w-full py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 disabled:opacity-50 disabled:bg-gray-400 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                          >
                            {submittingStageIndex === idx && !selectedFile ? "Select file to add" : submittingStageIndex === idx && selectedFile ? "Confirm & Upload" : "Upload Additional File"}
                          </button>
                        </div>
                      ) : 
                      
                      /* STATUS MESSAGES FOR NON-LEADERS OR CLOSED STAGES */
                      !isLeader && status === 'live' ? (
                        <p className="text-xs text-amber-600 font-medium bg-amber-50 p-3 rounded-lg dark:bg-amber-900/10 dark:text-amber-400">Only Team Leader could upload the documents</p>
                      ) : status === 'closed' ? (
                        <p className="text-xs text-rose-500 font-medium bg-rose-50 p-3 rounded-lg dark:bg-rose-900/10 dark:text-rose-400 text-center">Submission window has closed.</p>
                      ) : status === 'upcoming' ? (
                        <p className="text-xs text-gray-400 font-medium bg-gray-50 p-3 rounded-lg dark:bg-zinc-800/50 dark:text-zinc-500 text-center">Stage not yet active.</p>
                      ) : null}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}