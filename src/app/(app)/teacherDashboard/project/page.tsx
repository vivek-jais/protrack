"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Calendar, BookOpen, Users, Loader2, ArrowRight, FolderKanban } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";

export default function ProjectsLibrary() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🔥 Identify if the logged-in user is a Teacher
  // @ts-ignore
  const isTeacher = session?.user?.role === "teacher";

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/project");
        if (res.ok) {
          const data = await res.json();
          setProjects(data.projects);
        } else {
          toast.error("Failed to load projects.");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    if (session) fetchProjects();
  }, [session]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  };

  if (isLoading) {
    return <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 dark:bg-zinc-950"><Loader2 className="animate-spin text-blue-500 h-8 w-8" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 dark:bg-zinc-950">
      <ToastContainer />
      <div className="max-w-6xl mx-auto">
        
        <div className="mb-8 border-b border-gray-200 pb-6 dark:border-zinc-800">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Project Library</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
            {isTeacher ? "Manage your assigned projects and evaluate student submissions." : "View available assignments and manage your active work."}
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-white rounded-3xl border border-gray-200 p-16 text-center shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
            <FolderKanban className="h-16 w-16 text-gray-300 mb-4 dark:text-zinc-700" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">No Projects Found</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <div key={proj._id} className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col shadow-sm hover:shadow-md transition-all dark:bg-zinc-900 dark:border-zinc-800">
                
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{proj.title}</h2>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2 dark:text-zinc-400">{proj.description}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-6 dark:bg-zinc-950/50">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-zinc-300">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                    <span>{proj.classId?.name || "Independent Project"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-zinc-300">
                    <Calendar className="h-4 w-4 text-rose-500" />
                    <span>Due: {formatDate(proj.deadline)}</span>
                  </div>
                </div>

                <div className="mt-auto">
                  {/* 🔥 ROLE-BASED CONDITIONAL BUTTONS */}
                  {isTeacher ? (
                    <Link 
                      href={`/teacherDashboard/project/${proj._id}/workspace`} 
                      className="w-full py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                    >
                      Evaluate Submissions <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <Link 
                      href={`/teacherDashboard/project/${proj._id}/workspace`} 
                      className="w-full py-2.5 border-2 border-blue-600 text-blue-600 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-50 transition-all dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-900/20"
                    >
                      <Users className="h-4 w-4" /> View & Join
                    </Link>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}