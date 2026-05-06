"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  Loader2, ArrowLeft, Users, CheckCircle2, 
  Clock, FileText, ExternalLink, MessageSquare, Award
} from "lucide-react";
import { toast, ToastContainer, Zoom } from "react-toastify";

import ExportExcelButton from "@/components/ExportExcelButton";

export default function TeacherProjectWorkspace() {
  const params = useParams();
  const projectId = params.id
  const { data: session } = useSession();

  const [project, setProject] = useState<any>(null);
  const [classGroups, setClassGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Evaluation Modal State
  const [evaluatingSubmission, setEvaluatingSubmission] = useState<any>(null);
  const [evalMarks, setEvalMarks] = useState<number>(0);
  const [evalFeedback, setEvalFeedback] = useState("");

  useEffect(() => {
    const fetchWorkspaceData = async () => {
      try {
        // 1. Fetch the Project Data
        const projRes = await fetch(`/api/project/${projectId}`);
        const projData = await projRes.json();
        const fetchedProject = projData.project;
        setProject(fetchedProject);

        // 2. Fetch all Groups in this Class
        if (fetchedProject?.classId) {
          const groupRes = await fetch(`/api/groups?classId=${fetchedProject.classId._id || fetchedProject.classId}`);
          if (groupRes.ok) {
            const groupData = await groupRes.json();
            setClassGroups(groupData.groups || []);
          }
        }
      } catch (error) {
        toast.error("Failed to load workspace data.");
      } finally {
        setIsLoading(false);
      }
    };

    if (session) fetchWorkspaceData();
  }, [session, projectId]);


  // Helper: Find a group's submission for a specific stage
  const getSubmissionForGroup = (stage: any, groupId: string) => {
    return stage.submissions?.find((sub: any) => sub.groupId === groupId);
  };


  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-12 dark:bg-zinc-950">
      <ToastContainer />
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Navigation & Header */}
        <div>
          <Link href="/teacherDashboard/projects" className="mb-6 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Project Library
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{project.title}</h1>
              <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">Class Evaluation Workspace</p>
            </div>
            
            {/* 🔥 2. ADDED THE EXPORT BUTTON TO THE RIGHT SIDE UI */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              
              {/* Excel Download Button */}
              <ExportExcelButton projectId={projectId as string} />

              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="font-bold text-gray-900 dark:text-white">{classGroups.length} Teams</span>
              </div>
            </div>

          </div>
        </div>

        {/* The Master Grid: Groups vs Stages */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-gray-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                <tr>
                  <th className="p-4 font-bold whitespace-nowrap min-w-[200px]">Team / Group</th>
                  {project.stages?.map((stage: any, idx: number) => (
                    <th key={idx} className="p-4 font-bold whitespace-nowrap min-w-[250px]">
                      Stage {idx + 1}: {stage.stageName} <br/>
                      <span className="text-xs font-normal text-gray-400">Max Marks: {stage.maxMarks}</span>
                    </th>
                  ))}
                  <th className="p-4 font-bold whitespace-nowrap text-right">Total Grade</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {classGroups.length === 0 ? (
                  <tr>
                    <td colSpan={project.stages?.length + 2} className="p-8 text-center text-gray-500">
                      No groups found in this class. Students need to form groups first!
                    </td>
                  </tr>
                ) : (
                  classGroups.map((group) => {
                    let totalMarksEarned = 0;

                    return (
                      <tr key={group._id} className="hover:bg-gray-50/50 transition-colors dark:hover:bg-zinc-900/50">
                        {/* Group Column */}
                        <td className="p-4">
                          <p className="font-bold text-gray-900 dark:text-white">{group.name}</p>
                          <p className="text-xs text-gray-500 dark:text-zinc-400">{group.members?.length || 0} Members</p>
                        </td>

                        {/* Stage Columns */}
                        {project.stages?.map((stage: any, idx: number) => {
                          const submission = getSubmissionForGroup(stage, group._id);
                          if (submission) totalMarksEarned += (submission.marksAwarded || 0);

                          return (
                            <td key={idx} className="p-4 align-top">
                              {!submission ? (
                                <div className="flex items-center gap-2 text-gray-400 dark:text-zinc-600">
                                  <Clock className="h-4 w-4" /> Pending Upload
                                </div>
                              ) : (
                                <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
                                  <div className="flex items-center justify-between">
                                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold ${
                                      submission.status === "evaluated" 
                                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                        : "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                    }`}>
                                      {submission.status === "evaluated" ? <CheckCircle2 className="h-3 w-3"/> : <FileText className="h-3 w-3"/>}
                                      {submission.status.toUpperCase()}
                                    </span>
                                    {submission.status === "evaluated" && (
                                      <span className="font-bold text-gray-900 dark:text-white">
                                        {submission.marksAwarded}/{stage.maxMarks}
                                      </span>
                                    )}
                                  </div>

                                  <div className="text-xs text-gray-500 space-y-1">
                                    {submission.documents?.map((doc: any, i: number) => (
                                      <a key={i} href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-600 transition-colors truncate">
                                        <ExternalLink className="h-3 w-3 shrink-0" /> {doc.fileName}
                                      </a>
                                    ))}
                                    {submission.submissionLinks?.map((link: any, i: number) => (
                                      <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-600 transition-colors truncate">
                                        <ExternalLink className="h-3 w-3 shrink-0" /> {link.title}
                                      </a>
                                    ))}
                                  </div>

                                  <button 
                                    onClick={() => setEvaluatingSubmission({ stageId: stage._id, stageName: stage.stageName, maxMarks: stage.maxMarks, submission, groupName: group.name })}
                                    className="w-full mt-2 rounded-lg bg-gray-900 py-1.5 text-xs font-bold text-white hover:bg-gray-800 transition-colors dark:bg-white dark:text-gray-900"
                                  >
                                    {submission.status === "evaluated" ? "Update Grade" : "Evaluate"}
                                  </button>
                                </div>
                              )}
                            </td>
                          );
                        })}

                        {/* Total Grade Column */}
                        <td className="p-4 text-right font-bold text-xl text-gray-900 dark:text-white">
                          {totalMarksEarned} <span className="text-sm font-normal text-gray-400">/ {project.maxTotalMarks}</span>
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