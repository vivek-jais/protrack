"use client";
 
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Calendar, BookOpen, ArrowRight, UserPlus, CheckCircle2 } from "lucide-react";
import { toast, ToastContainer, Zoom } from "react-toastify";

export default function StudentProjectsHub() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  // @ts-ignore
  const myUserId = session?.user?.id;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`/api/project`); 
        if (res.ok) {
          const data = await res.json();
          setProjects(data.projects || []);
        }
      } catch (error) {
        console.error("Failed to load projects", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) fetchProjects();
  }, [session]);

  const handleJoin = async (projectId: string) => {
    setJoiningId(projectId);
    try {
      const res = await fetch(`/api/project/${projectId}/join`, { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        toast.success("Joined project successfully!", { theme: "dark", transition: Zoom });
        // 🔥 FIX: Update local state to set isEnrolled to true so the UI flips instantly
        setProjects(projects.map(p => 
          p._id === projectId ? { ...p, isEnrolled: true } : p
        ));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to join project");
    } finally {
      setJoiningId(null);
    }
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
      <div className="mx-auto max-w-6xl space-y-8">
        
        <div className="border-b border-gray-200 pb-6 dark:border-zinc-800">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Project Library</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
            View available assignments and manage your active work.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            // 🔥 FIX: Check BOTH the new group-based 'isEnrolled' flag AND the legacy joinedStudents array just in case
            const hasJoined = project.isEnrolled === true || project.joinedStudents?.includes(myUserId);

            return (
              <div key={project._id} className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex flex-1 flex-col p-6">
                  
                  {hasJoined && (
                    <span className="mb-3 inline-flex w-max items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Actively Working
                    </span>
                  )}

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2">
                    {project.title}
                  </h3>
                  <p className="mt-2 mb-6 text-sm text-gray-500 dark:text-zinc-400 line-clamp-3">
                    {project.description}
                  </p>

                  <div className="mt-auto space-y-3 rounded-lg bg-gray-50 p-4 text-sm dark:bg-zinc-950">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-zinc-300">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold truncate">
                        {project.classId ? project.classId.name : "Standalone Project"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-zinc-300">
                      <Calendar className="h-4 w-4 text-rose-600" />
                      <span className="font-medium">
                        Due: {new Date(project.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-gray-100 bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900/50 p-4">
                  {hasJoined ? (
                    <button 
                      onClick={() => router.push(`/dashboard/projects/${project._id}`)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-sm font-bold text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                    >
                      Open Project Workspace <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleJoin(project._id)}
                      disabled={joiningId === project._id}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-blue-600 bg-white py-2.5 text-sm font-bold text-blue-600 transition-colors hover:bg-blue-50 dark:border-blue-500 dark:bg-zinc-900 dark:text-blue-400 dark:hover:bg-blue-900/20 disabled:opacity-50"
                    >
                      {joiningId === project._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><UserPlus className="h-4 w-4" /> Join Solo</>}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}