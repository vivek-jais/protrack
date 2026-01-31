"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { 
  MoreVertical, 
  Calendar, 
  Clock, 
  ArrowRight, 
  Users, 
  Github, 
  ExternalLink,
  Plus,
  Sparkles,
  TrendingUp,
  Loader2
} from "lucide-react";

export default function StudentDashboard() {
  const { data: session } = useSession();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchClasses = async () => {
      // @ts-ignore
      if (session?.user?.id) {
        try {
          // @ts-ignore
          const res = await fetch(`/api/user/classes/${session.user.id}`);
          if (res.ok) {
            const data = await res.json();
            setClasses(data.classes);
          }
        } catch (error) {
          console.error("Failed to load classes", error);
        } finally {
          setLoading(false);
        }
      }
    };
    //whenever theere would be active session then fetch the classes available
    if (session) {
      fetchClasses();
    }
  }, [session]);

  const stats = [
    { label: "Active Projects", value: classes.length > 0 ? "3" : "0", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Pending Reviews", value: "5", icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Completed", value: "12", icon: Github, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Overall Grade", value: "A-", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-10 p-2">
      
      {/* 1. Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between animate-in slide-in-from-top-4 fade-in duration-700">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Hello, <span className="bg-linear-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">{session?.user?.name || "Student"}</span> 
          </h1>
          <p className="mt-2 text-lg text-gray-500 dark:text-zinc-400">
            Ready to crush your goals today?
          </p>
        </div>
        <div className="flex gap-3">
          <button className="group flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 shadow-xs transition-all hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800">
            <Calendar className="h-4 w-4 text-zinc-500 group-hover:text-zinc-700 dark:text-zinc-400" />
            Schedule
          </button>
          <button className="group flex items-center gap-2 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] hover:shadow-emerald-500/40 active:scale-[0.98]">
            <Sparkles className="h-4 w-4 transition-transform group-hover:rotate-12" />
            Join Class
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white/50 p-6 backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900/50"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
              <div className={`rounded-2xl p-3.5 ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Classes Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Classes</h2>
          <Link href="/classes" className="text-sm font-medium text-emerald-600 hover:text-emerald-500 hover:underline dark:text-emerald-400">
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {classes.length === 0 ? (
             <div className="col-span-full py-10 text-center text-zinc-500">
                You haven't joined any classes yet.
             </div>
          ) : (
            classes.map((item, index) => {
              const linear = item.theme || "from-blue-600 via-indigo-600 to-violet-600"; 
              const progress = item.progress || Math.floor(Math.random() * 100); // Random for demo
              const project = item.currentProject || null; 
              // -------------------------------

              return (
                <div 
                  key={item._id} 
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-2xl hover:shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:shadow-black/50 animate-in fade-in zoom-in-95 duration-500"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {/* Card Header */}
                  <div className={`relative h-32 w-full bg-linear-to-br ${linear} p-6`}>
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
                    <div className="relative z-10 flex justify-between items-start">
                      <div className="rounded-lg bg-black/20 px-2 py-1 text-xs font-medium text-white backdrop-blur-md">
                        {item.code || "CODE"}
                      </div>
                      <button className="rounded-full bg-white/20 p-2 text-white opacity-0 transition-all hover:bg-white/30 group-hover:opacity-100 backdrop-blur-md">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                    <h3 className="relative z-10 mt-4 text-2xl font-bold text-white shadow-sm truncate">
                      {item.name}
                    </h3>
                  </div>

                  {/* Card Body */}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-6 flex-1">
                      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-4">
                        {item.professor?.name || "Unknown Instructor"}
                      </p>
                      
                      {project ? (
                        <div className="space-y-4 rounded-2xl bg-zinc-50 p-4 border border-zinc-100 dark:bg-zinc-800/50 dark:border-zinc-700/50 transition-colors group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-sm font-bold text-zinc-800 dark:text-zinc-200">
                              <ExternalLink className="h-3.5 w-3.5 text-emerald-500" />
                              {project}
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="font-medium text-zinc-500">Progress</span>
                              <span className={`font-bold ${progress > 70 ? 'text-emerald-500' : 'text-orange-500'}`}>
                                {progress}%
                              </span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ease-out group-hover:brightness-110 ${
                                  progress > 70 ? 'bg-linear-to-r from-emerald-500 to-teal-400' : 'bg-linear-to-r from-orange-500 to-yellow-400'
                                }`}
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex h-full min-h-25 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50">
                          <p className="text-sm font-medium text-zinc-400">No active project</p>
                          <button className="mt-2 text-xs font-semibold text-emerald-600 hover:text-emerald-500">Start one now</button>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="mt-auto flex items-center justify-between border-t border-zinc-100 pt-5 dark:border-zinc-800">
                        <div className="flex -space-x-3 transition-all hover:space-x-1">
                        {/* Fake avatars for now, replace with item.students if available */}
                        {[1, 2, 3].map((_, i) => (
                          <div key={i} className="h-9 w-9 rounded-full border-2 border-white bg-zinc-200 shadow-sm dark:border-zinc-900 transition-transform hover:scale-110 z-10 overflow-hidden">
                            <img 
                              src={`https://api.dicebear.com/7.x/notionists/svg?seed=${item._id + i}`} 
                              alt="Avatar" 
                              className="h-full w-full"
                            />
                          </div>
                        ))}
                      </div>
                      
                      <Link 
                        href={`/classes/${item._id}`} 
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition-all hover:bg-emerald-600 hover:text-white dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-emerald-600 dark:hover:text-white"
                      >
                        <ArrowRight className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* New Class Card */}
          <button className="group relative flex min-h-100 flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-zinc-300 bg-zinc-50/50 transition-all hover:border-emerald-500 hover:bg-emerald-50/10 dark:border-zinc-700 dark:bg-zinc-900/20">
             <div className="absolute inset-0 bg-linear-to-tr from-emerald-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
             <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg transition-transform group-hover:scale-110 dark:bg-zinc-800">
              <Plus className="h-8 w-8 text-zinc-400 transition-colors group-hover:text-emerald-500" />
            </div>
            <p className="relative z-10 mt-4 font-semibold text-zinc-500 group-hover:text-emerald-600">Join new class</p>
          </button>
        </div>
      </div>
    </div>
  );
}