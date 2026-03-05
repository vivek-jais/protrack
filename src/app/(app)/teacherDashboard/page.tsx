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

export default function TeacherDashboard() {
  const { data: session } = useSession();
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState("");

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
            console.log(data.classes)
            setClasses(data.classes||[]);
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-zinc-950 md:p-12">
      <div className="mx-auto max-w-6xl space-y-12">
        
        {/* 1. WELCOME HEADER (Animated) */}
        <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-col items-start justify-between gap-6 rounded-3xl bg-white p-8 shadow-sm duration-700 dark:bg-zinc-900 md:flex-row md:items-center">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-4xl">
              {/* @ts-ignore */}
              Welcome back SIR {session?.user?.name}
              <Sparkles className="h-6 w-6 text-amber-400 animate-pulse" />
            </h1>
            <p className="mt-2 text-gray-500 dark:text-zinc-400">
              Here is an overview of your active classes and student progress.
            </p>
          </div>
          <Link
            href="/createClass"
            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gray-900 px-8 py-4 font-bold text-white transition-all hover:scale-105 hover:shadow-xl hover:shadow-gray-900/20 dark:bg-white dark:text-gray-900 dark:hover:shadow-white/20"
          >
            <span className="absolute inset-0 h-full w-full bg-linear-to-r from-emerald-500 to-teal-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
            <Plus className="relative z-10 h-5 w-5 transition-transform group-hover:rotate-90" />
            <span className="relative z-10">Create New Class</span>
          </Link>
        </div>

        {/* 2. CLASSES GRID */}
        <div>
          <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
            <BookOpen className="h-6 w-6 text-emerald-500" />
            Your Classes
          </h2>

          {classes.length === 0 ? (
            /* EMPTY STATE */
            <div className="animate-in fade-in zoom-in-95 flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-white/50 py-20 text-center duration-700 dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="rounded-full bg-gray-100 p-4 dark:bg-zinc-800">
                <BookOpen className="h-10 w-10 text-gray-400 dark:text-zinc-500" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">No classes yet</h3>
              <p className="mt-2 text-gray-500 dark:text-zinc-400">Create your first class to get started.</p>
            </div>
          ) : (
            /* CLASS CARDS */
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {classes.map((cls, index) => (
                <div 
                  key={cls._id} 
                  // Staggered animation effect using inline delay based on index
                  className="group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-3xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:bg-zinc-900 animate-in fade-in slide-in-from-bottom-8"
                  style={{ animationDelay: `${index * 150}ms`, animationFillMode: "both" }}
                >
                  {/* Card Header (Uses the dynamic theme from createClass) */}
                  <div className={`h-32 w-full bg-linear-to-r ${cls.theme || "from-emerald-500 to-teal-500"} p-6 relative overflow-hidden`}>
                    {/* Decorative Background Circle */}
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl transition-transform duration-500 group-hover:scale-150"></div>
                    
                    <div className="relative z-10 flex items-start justify-between">
                      <h3 className="text-2xl font-bold text-white drop-shadow-md">{cls.name}</h3>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-6 flex items-center justify-between rounded-xl bg-gray-50 p-3 dark:bg-zinc-800/50">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400">Class Code</p>
                        <p className="font-mono text-lg font-bold tracking-wider text-gray-900 dark:text-white">
                          {cls.code}
                        </p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.preventDefault(); // Prevent navigating when copying
                          copyToClipboard(cls.code);
                        }}
                        className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-white"
                      >
                        {copiedCode === cls.code ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5" />}
                      </button>
                    </div>

                    <div className="mb-6 flex gap-4 text-sm text-gray-600 dark:text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-emerald-500" />
                        <span className="font-medium">{cls.students?.length || 0} Students</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-emerald-500" />
                        <span className="truncate">{cls.schedule || "No schedule"}</span>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <Link 
                      href={`/teacherDashboard/class/${cls._id}`} 
                      className="mt-auto flex w-full items-center justify-between rounded-xl border border-gray-200 p-4 font-semibold text-gray-900 transition-colors hover:bg-gray-50 dark:border-zinc-800 dark:text-white dark:hover:bg-zinc-800"
                    >
                      View Dashboard
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-2 text-emerald-500" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}