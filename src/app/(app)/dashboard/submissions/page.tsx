"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ToastContainer, toast } from "react-toastify";
import Link from "next/link";
import { 
  Loader2, FileText, CheckCircle2, Clock, FolderDot, 
  ExternalLink, ArrowRightIcon, LayoutGrid
} from "lucide-react";

export default function AllSubmissionsPage() {
  const { data: session } = useSession();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await fetch('/api/submissions');
        if (res.ok) {
          const data = await res.json();
          setSubmissions(data.submissions || []);
        } else {
          toast.error("Failed to load submission history.");
        }
      } catch (err) {
        toast.error("Network error while fetching submissions.");
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchSubmissions();
    }
  }, [session]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600 dark:text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white pb-20 font-sans">
      <ToastContainer />
      
      <div className="py-10 px-6 md:px-12 max-w-7xl mx-auto border-b border-gray-200 dark:border-zinc-800/50 mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
          <LayoutGrid className="h-8 w-8 text-emerald-600 dark:text-emerald-500" />
          Submission History
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
          A complete timeline of every file your team has submitted across all projects.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 dark:border-zinc-800 bg-white/50 dark:bg-[#18181b]/50 p-16 text-center">
            <div className="h-20 w-20 bg-gray-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-gray-200 dark:border-zinc-800 shadow-inner">
              <FolderDot className="h-10 w-10 text-gray-400 dark:text-zinc-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">No Submissions Found</h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2 max-w-sm leading-relaxed">
              You haven't submitted any files for any projects yet. When you do, they will appear here in chronological order.
            </p>
            <Link 
              href="/dashboard/projects"
              className="mt-6 px-6 py-2.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-500 font-bold text-sm rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-500 dark:hover:text-white transition-colors"
            >
              Browse Projects
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#18181b] rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm dark:shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/80 dark:bg-[#09090b]/50 border-b border-gray-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-5 text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-wider w-1/4">Project Details</th>
                    <th className="px-6 py-5 text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-wider">Stage</th>
                    <th className="px-6 py-5 text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-wider w-1/3">Uploaded Files</th>
                    <th className="px-6 py-5 text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-wider">Submitted On</th>
                    <th className="px-6 py-5 text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-wider text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/50">
                  {submissions.map((sub, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/50 transition-colors group">
                      
                      <td className="px-6 py-5 align-top">
                        <div className="font-bold text-base text-gray-900 dark:text-white mb-1 line-clamp-2">
                          {sub.projectTitle}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-zinc-500 flex items-center gap-1.5">
                          <span className="bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-gray-700 dark:text-zinc-300">Team: {sub.teamName}</span>
                        </div>
                        <Link 
                          href={`/dashboard/projects/${sub.projectId}/workspace`}
                          className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          Go to workspace <ArrowRightIcon className="h-3 w-3" />
                        </Link>
                      </td>

                      <td className="px-6 py-5 align-top">
                        <span className="font-bold text-gray-700 dark:text-zinc-200 block">Stage {sub.stageIndex}</span>
                        <span className="text-xs text-gray-500 dark:text-zinc-500 mt-1 block">{sub.stageName}</span>
                      </td>

                      <td className="px-6 py-5 align-top">
                        <div className="flex flex-wrap gap-2">
                          {sub.documents?.map((doc: any, dIdx: number) => (
                            <a 
                              key={dIdx}
                              href={doc.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors w-max"
                            >
                              <FileText className="h-4 w-4 shrink-0" />
                              <span className="truncate max-w-[150px] text-xs font-bold">{doc.fileName}</span>
                              <ExternalLink className="h-3 w-3 opacity-50 shrink-0" />
                            </a>
                          ))}
                        </div>
                      </td>

                      <td className="px-6 py-5 align-top">
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-zinc-400 text-sm font-medium">
                          <Clock className="h-4 w-4 text-gray-400 dark:text-zinc-500 shrink-0" /> 
                          {formatDate(sub.submittedAt)}
                        </div>
                      </td>

                      <td className="px-6 py-5 align-top text-right">
                        {sub.status === 'evaluated' ? (
                          <div className="flex flex-col items-end gap-1.5">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-3 py-1.5 rounded-lg">
                              <CheckCircle2 className="h-4 w-4" /> Evaluated
                            </span>
                            <span className="text-xs font-bold text-gray-500 dark:text-zinc-500">
                              Score: <span className="text-gray-900 dark:text-white text-sm">{sub.marksAwarded}</span> / {sub.maxMarks}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-3 py-1.5 rounded-lg">
                            Pending Grading
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