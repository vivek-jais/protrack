"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import { 
  Loader2, ArrowLeft, CheckCircle2, AlertCircle, FileText, 
  ExternalLink, Save, Clock, MessageSquare, Loader
} from "lucide-react";
import Link from "next/link";

export default function TeacherEvaluationERP() {
  const params = useParams();
  const projectId =params.id;

  const [project, setProject] = useState<any>(null);
  const [allGroups, setAllGroups] = useState<any[]>([]);
  const [teacherSubmissions, setTeacherSubmissions] = useState<any[]>([]); // 🔥 NEW STATE
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [gradingState, setGradingState] = useState<{ [key: string]: { marks: string, feedback: string, loading: boolean } }>({});

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch Project Data
      const projRes = await fetch(`/api/project/${projectId}`);
      if (projRes.ok) {
        const projData = await projRes.json();
        setProject(projData.project);
      }

      // 2. Fetch Group Data
      const allGroupsRes = await fetch(`/api/project/${projectId}/all-groups`);
      if (allGroupsRes.ok) {
        const allGroupsData = await allGroupsRes.json();
        setAllGroups(allGroupsData.groups);
      }

      // 3. 🔥 Fetch the Dedicated Teacher Submissions
      const subRes = await fetch(`/api/project/${projectId}/teacher-submissions`);
      if (subRes.ok) {
        const subData = await subRes.json();
        setTeacherSubmissions(subData.submissions);
      }
    } catch (err) {
      toast.error("Error loading evaluation dashboard.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [projectId]);

  const handleGradeSubmit = async (groupId: string) => {
    const marks = gradingState[groupId]?.marks;
    const feedback = gradingState[groupId]?.feedback || ""; 

    if (!marks || isNaN(Number(marks))) return toast.error("Please enter a valid number for marks.");

    setGradingState(prev => ({ ...prev, [groupId]: { ...(prev[groupId] || {}), loading: true } }));

    try {
      const res = await fetch(`/api/project/${projectId}/stage/${activeStageIndex}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, marksAwarded: marks, feedback })
      });

      if (res.ok) {
        toast.success("Grade and remarks saved successfully!");
        setGradingState(prev => ({ ...prev, [groupId]: { marks: "", feedback: "", loading: false } }));
        fetchDashboardData(); 
      } else {
        toast.error("Failed to save grade.");
        setGradingState(prev => ({ ...prev, [groupId]: { ...(prev[groupId] || {}), loading: false } }));
      }
    } catch (error) {
      toast.error("Error saving grade.");
      setGradingState(prev => ({ ...prev, [groupId]: { ...(prev[groupId] || {}), loading: false } }));
    }
  };

  const getStageState = (stage: any) => {
    const now = new Date().getTime(); 
    const deadlineTime = stage.deadline ? new Date(stage.deadline).getTime() : null;
    const startTime = stage.startDate ? new Date(stage.startDate).getTime() : null;
    
    if (deadlineTime && now > deadlineTime) return 'closed';
    if (startTime && now < startTime) return 'upcoming';
    return 'live';
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950"><Loader2 className="animate-spin text-blue-600 h-8 w-8" /></div>;
  if (!project) return <div className="p-8 text-center text-gray-500">Project not found.</div>;

  const currentStage = project.stages[activeStageIndex];
  const stageState = getStageState(currentStage);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 dark:bg-zinc-950">
      <ToastContainer />

      <div className="bg-white border-b border-gray-200 dark:bg-zinc-900 dark:border-zinc-800 py-6">
        <div className="max-w-[95%] mx-auto px-4">
          <Link href="/teacherDashboard/projects" className="flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 mb-4 dark:text-zinc-400">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Evaluation Matrix</h1>
              <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
                {project.title} • Grade student submissions and provide remarks.
              </p>
            </div>
            
            <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl">
              <div className="px-6 py-2.5 text-sm font-bold rounded-lg transition-all bg-white text-blue-600 shadow-sm dark:bg-zinc-950 dark:text-white cursor-default">
                Evaluation Matrix
              </div>
              <Link href={`/teacherDashboard/project/${projectId}/graphs`} className="px-6 py-2.5 text-sm font-bold rounded-lg transition-all text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white">
                Graphical Analysis
              </Link>
            </div>
          </div>
          
          <div className="flex gap-2 mt-6 overflow-x-auto pb-2">
            {project.stages.map((stage: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setActiveStageIndex(idx)}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap border ${activeStageIndex === idx ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-900/50 dark:text-blue-400" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400"}`}
              >
                Stage {idx + 1}: {stage.stageName}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[95%] mx-auto px-4 mt-8 animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden">
          
          <div className="bg-gray-50/80 p-4 border-b border-gray-200 flex justify-between items-center dark:bg-zinc-950/50 dark:border-zinc-800">
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              {currentStage.stageName}
              <span className={`ml-3 text-[10px] uppercase px-2 py-0.5 rounded-full ${stageState === 'live' ? 'bg-blue-100 text-blue-700' : stageState === 'closed' ? 'bg-rose-100 text-rose-700' : 'bg-gray-200 text-gray-600'}`}>
                {stageState}
              </span>
            </h2>
            <div className="text-sm font-bold text-gray-700 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-700">
              Max Marks: {currentStage.maxMarks}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-white border-b border-gray-100 dark:bg-zinc-900 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider dark:text-zinc-400 w-1/5">Team Details</th>
                  <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider dark:text-zinc-400 w-32">Status</th>
                  <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider dark:text-zinc-400 w-1/4">Submitted Files</th>
                  <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider dark:text-zinc-400 w-1/4">Remarks / Feedback</th>
                  <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider dark:text-zinc-400 w-32 text-right">Grading</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {allGroups.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500 dark:text-zinc-400">
                      No teams have joined this project yet.
                    </td>
                  </tr>
                ) : (
                  allGroups.map((group) => {
                    // 🔥 Find exactly the submission for THIS group in THIS stage
                    const submission = teacherSubmissions.find((s: any) => 
                      String(s.groupId) === String(group._id) && s.stageIndex === (activeStageIndex + 1)
                    );

                    const isGrading = gradingState[group._id]?.loading;
                    const hasFiles = submission && submission.documents && submission.documents.length > 0;

                    return (
                      <tr key={group._id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-950/30 transition-colors border-b border-gray-50 dark:border-zinc-800/50 last:border-0">
                        
                        <td className="px-6 py-5 align-top">
                          <div className="font-bold text-gray-900 dark:text-white text-base mb-1">{group.name}</div>
                          <div className="flex -space-x-2 mt-2">
                            {group.members.map((m: any, mIdx: number) => (
                              <img key={mIdx} src={m.student?.image || `https://api.dicebear.com/7.x/initials/svg?seed=${m.student?.name}`} title={m.student?.name} className="h-8 w-8 rounded-full border-2 border-white dark:border-zinc-900 object-cover" />
                            ))}
                          </div>
                        </td>

                        <td className="px-6 py-5 align-top">
                          {!hasFiles ? (
                            stageState === 'live' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 w-max border border-blue-100 dark:border-blue-900/50">
                                <Loader className="h-3.5 w-3.5 animate-spin" /> Ongoing
                              </span>
                            ) : stageState === 'upcoming' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-zinc-400 w-max border border-gray-200 dark:border-zinc-700">
                                Upcoming
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 w-max border border-rose-100 dark:border-rose-900/50">
                                <AlertCircle className="h-3.5 w-3.5" /> Missing
                              </span>
                            )
                          ) : submission.status === 'evaluated' ? (
                            <div className="flex flex-col gap-1">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 w-max">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Evaluated
                              </span>
                              <span className="text-[10px] text-gray-400 flex items-center gap-1"><Clock className="h-3 w-3"/> {submission.evaluation?.evaluatedAt ? new Date(submission.evaluation.evaluatedAt).toLocaleDateString() : 'Just now'}</span>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 w-max">
                                <FileText className="h-3.5 w-3.5" /> Submitted
                              </span>
                              <span className="text-[10px] text-gray-400 flex items-center gap-1"><Clock className="h-3 w-3"/> {new Date(submission.submittedAt).toLocaleDateString()}</span>
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-5 align-top">
                          {hasFiles ? (
                            <div className="flex flex-col gap-2">
                              {submission.documents.map((doc: any, dIdx: number) => (
                                <a 
                                  key={dIdx} 
                                  href={doc.fileUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30 w-max"
                                >
                                  <FileText className="h-4 w-4" /> 
                                  <span className="truncate max-w-[200px]">{doc.fileName}</span>
                                  <ExternalLink className="h-3 w-3 opacity-50" />
                                </a>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 dark:text-zinc-500 italic text-xs">No files uploaded.</span>
                          )}
                        </td>

                        <td className="px-6 py-5 align-top">
                          {!hasFiles ? (
                            <span className="text-gray-400 text-xs italic">Awaiting submission...</span>
                          ) : submission.status === 'evaluated' ? (
                            <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg dark:bg-zinc-950/50 dark:border-zinc-800">
                              <p className="text-sm text-gray-700 dark:text-zinc-300 flex items-start gap-2">
                                <MessageSquare className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                                <span>{submission.evaluation?.feedback || "No remarks provided."}</span>
                              </p>
                            </div>
                          ) : (
                            <textarea 
                              placeholder="Leave constructive feedback..."
                              value={gradingState[group._id]?.feedback || ""}
                              onChange={(e) => setGradingState(prev => ({ ...prev, [group._id]: { ...(prev[group._id] || {}), feedback: e.target.value } }))}
                              className="w-full h-20 px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:bg-zinc-900 dark:border-zinc-700 dark:text-white resize-none"
                            />
                          )}
                        </td>

                        <td className="px-6 py-5 align-top text-right">
                          {!hasFiles ? (
                            <span className="text-gray-400 text-xs italic">Cannot grade yet</span>
                          ) : submission.status === 'evaluated' ? (
                            <div className="inline-flex flex-col items-end border border-emerald-200 bg-emerald-50 px-4 py-2 rounded-xl dark:bg-emerald-900/10 dark:border-emerald-900/30">
                              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Score</span>
                              <span className="text-xl font-black text-emerald-700 dark:text-emerald-400">{submission.evaluation?.marksAwarded || submission.marksAwarded} <span className="text-sm font-medium text-emerald-500">/ {currentStage.maxMarks}</span></span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-end gap-2">
                              <div className="relative w-full">
                                <input 
                                  type="number" 
                                  min="0" max={currentStage.maxMarks} 
                                  placeholder="0"
                                  value={gradingState[group._id]?.marks || ""}
                                  onChange={(e) => setGradingState(prev => ({ ...prev, [group._id]: { ...(prev[group._id] || {}), marks: e.target.value } }))}
                                  className="w-full px-3 py-2 text-center font-bold border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:bg-zinc-900 dark:border-zinc-700 dark:text-white"
                                />
                              </div>
                              <button 
                                onClick={() => handleGradeSubmit(group._id)}
                                disabled={isGrading}
                                className="w-full py-2 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 transition-all"
                              >
                                {isGrading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-1.5"/> Save</>}
                              </button>
                            </div>
                          )}
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}