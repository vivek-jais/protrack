"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  Plus, 
  BookOpen, 
  Users, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Copy, 
  CheckCircle2,
  Loader2
} from "lucide-react";
import { redirect, useRouter } from "next/navigation";

export default function TeacherDashboard() {
  const router = useRouter();
  const { data: session } = useSession();
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState("");

  //@ts-ignore
  if(session?.user?.role === 'student'){
    alert("Unauthorized Access");
    redirect('/dashboard');
  }

  // Fetch Teacher's Classes
  useEffect(() => {
    const fetchClasses = async () => {
      // @ts-ignore
      if (session?.user?.id) {
        try {
          // @ts-ignore
          const res = await fetch(`/api/user/classes/${session.user.id}`);
          if (res.ok) {
            const data = await res.json();
            console.log(data.classes);
            setClasses(data.classes || []);
          }
        } catch (error) {
          console.error("Failed to fetch classes", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (session) fetchClasses();
  }, [session]);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  // Array of solid, professional colors for the class cards
  const solidColors = [
    "bg-emerald-600",
    "bg-blue-600",
    "bg-indigo-600",
    "bg-violet-600",
    "bg-rose-600"
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-zinc-950 md:p-12">
      <div className="mx-auto max-w-6xl space-y-12">
        
        {/* 1. WELCOME HEADER (Solid Colors, Clean Lines) */}
        <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-col items-start justify-between gap-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm duration-700 dark:border-zinc-800 dark:bg-zinc-900 md:flex-row md:items-center">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
              {/* @ts-ignore */}
              Welcome back, Prof. {session?.user?.name?.split(" ")[0]}
              <Sparkles className="h-6 w-6 text-amber-400" />
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
              Here is the administrative overview of your active classes and student progress.
            </p>
          </div>
          <Link
            href="/createClass"
            className="group flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
          >
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
            <span>Create New Class</span>
          </Link>
        </div>

        {/* 2. CLASSES GRID */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
              <BookOpen className="h-6 w-6 text-emerald-600" />
              Active Roster
            </h2>
          </div>

          {classes.length === 0 ? (
            /* EMPTY STATE */
            <div className="animate-in fade-in zoom-in-95 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white/50 py-20 text-center duration-700 dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="rounded-lg bg-emerald-50 p-4 dark:bg-emerald-900/20">
                <BookOpen className="h-8 w-8 text-emerald-600 dark:text-emerald-500" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">No classes established</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">Initialize your first class to generate a workspace.</p>
            </div>
          ) : (
            /* CLASS CARDS */
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {classes.map((cls, index) => {
                // Assign a solid color based on the index to create a vibrant but flat grid
                const cardColor = solidColors[index % solidColors.length];

                return (
                  <div 
                    key={cls._id} 
                    className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 animate-in fade-in slide-in-from-bottom-8"
                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}
                  >
                    {/* Card Header (Strictly Solid Color, No Gradients) */}
                    <div className={`h-24 w-full ${cardColor} p-6`}>
                      <h3 className="text-xl font-bold text-white line-clamp-1">
                        {cls.name}
                      </h3>
                    </div>

                    {/* Card Body */}
                    <div className="flex flex-1 flex-col p-6">
                      
                      {/* Access Code Block */}
                      <div className="mb-6 flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-zinc-700 dark:bg-zinc-950">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-400">Class Code</p>
                          <p className="font-mono text-base font-semibold tracking-wider text-gray-900 dark:text-white mt-0.5">
                            {cls.code}
                          </p>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.preventDefault(); 
                            copyToClipboard(cls.code);
                          }}
                          className="rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-900 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                          title="Copy Class Code"
                        >
                          {copiedCode === cls.code ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>

                      {/* Meta Data */}
                      <div className="mb-8 space-y-3 text-sm text-gray-600 dark:text-zinc-400">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-emerald-600" />
                            <span className="font-medium">Enrollment</span>
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-zinc-100">{cls.students?.length || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-emerald-600" />
                            <span className="font-medium">Schedule</span>
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-zinc-100 truncate max-w-30 text-right">
                            {cls.schedule || "TBD"}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-auto grid gap-3 sm:grid-cols-2">
                        <Link
                          href={`/teacherDashboard/class/${cls._id}/workspace`}
                          className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-3 text-sm font-semibold text-white transition-all hover:bg-emerald-700"
                        >
                          Workspace
                          <ArrowRight className="h-4 w-4" />
                        </Link>

                        <Link
                          href={`/teacherDashboard/class/${cls._id}`}
                          className="flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white py-3 text-sm font-semibold text-zinc-900 transition-all hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-emerald-500 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300"
                        >
                          <Users className="h-4 w-4 text-emerald-500" />
                          View Students
                        </Link>
                      </div>
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