"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { 
  MoreVertical, Calendar, Clock, ArrowRight, Users, 
  CheckCircle2, ExternalLink, Plus, TrendingUp, Loader2, BookOpen, X, Search
import {
  MoreVertical,
  Calendar,
  Clock,
  ArrowRight,
  Users,
  ExternalLink,
  Plus,
  TrendingUp,
  Loader2,
  CheckCircle2,
  BookOpen
} from "lucide-react";
import { redirect } from "next/navigation";

export default function StudentDashboard() {
  const { data: session } = useSession();

  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- JOIN CLASS MODAL STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classCode, setClassCode] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [previewClass, setPreviewClass] = useState<any>(null);
  const [modalError, setModalError] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  //@ts-ignore
    if(session?.user?.role === 'teacher'){
      alert("Unauthorized Access");
      redirect('/teacherDashboard');
    }

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

  /* ---------------- Fetch Classes ---------------- */

  const fetchClasses = async () => {
    try {
      if (!session?.user?.id) return;

      const res = await fetch(`/api/user/classes/${session.user.id}`);

      if (res.ok) {
        const data = await res.json();
        setClasses(data.classes || []);
      }
    } catch (error) {
      console.error("Failed to load classes", error);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Get All Users ---------------- */

  const GetAllUsers = async () => {
    try {
      const res = await fetch("/api/user/", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });

      const data = await res.json();
      console.log(data.users);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  /* ---------------- Hooks ---------------- */

  useEffect(() => {
    if (session) {
      fetchClasses();
    }
  };

  useEffect(() => {
    if (session) fetchClasses();
  }, [session]);

  const handleSearchClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classCode.trim()) return;
    
    setIsSearching(true);
    setModalError("");
    setPreviewClass(null);

    try {
      const res = await fetch(`/api/class/code/${classCode.trim()}`);
      const data = await res.json();

      if (res.ok) {
        setPreviewClass(data.class);
      } else {
        setModalError(data.message || "Class not found. Check the code and try again.");
      }
    } catch (err) {
      setModalError("Failed to search for class. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleJoinClass = async () => {
    if (!previewClass) return;
    setIsJoining(true);
    setModalError("");

    try {
      const res = await fetch('/api/class/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId: previewClass._id })
      });
      
      const data = await res.json();

      if (res.ok) {
        // Close modal, reset states, and refresh class list
        setIsModalOpen(false);
        setClassCode("");
        setPreviewClass(null);
        await fetchClasses(); 
      } else {
        setModalError(data.message || "Failed to join class.");
      }
    } catch (err) {
      setModalError("An error occurred. Please try again.");
    } finally {
      setIsJoining(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setClassCode("");
    setPreviewClass(null);
    setModalError("");
  };
  useEffect(() => {
    GetAllUsers();
  }, []);

  /* ---------------- Stats ---------------- */

  const stats = [
    {
      label: "Active Projects",
      value: classes.length > 0 ? "3" : "0",
      icon: Users,
      color: "text-blue-600 dark:text-blue-400"
    },
    {
      label: "Pending Reviews",
      value: "5",
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400"
    },
    {
      label: "Completed",
      value: "12",
      icon: CheckCircle2,
      color: "text-purple-600 dark:text-purple-400"
    },
    {
      label: "Overall GPA",
      value: "3.8",
      icon: TrendingUp,
      color: "text-emerald-600 dark:text-emerald-400"
    }
  ];

  /* ---------------- Loading Screen ---------------- */

  if (loading) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-zinc-500">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          <p className="text-sm font-medium">
            Loading your academic workspace...
          </p>
        </div>
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="mx-auto w-[96%] max-w-[1800px] space-y-10 py-8 relative">
      
      {/* --- JOIN CLASS MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Join a Class</h3>
              <button onClick={closeModal} className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {!previewClass ? (
                // SEARCH FORM
                <form onSubmit={handleSearchClass} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Class Code
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. CS302-FALL"
                        value={classCode}
                        onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-10 py-2.5 uppercase tracking-wide outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  {modalError && <p className="text-sm font-medium text-red-500">{modalError}</p>}

                  <button
                    type="submit"
                    disabled={isSearching || !classCode}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white transition-all hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : "Find Class"}
                  </button>
                </form>
              ) : (
                // PREVIEW & CONFIRM UI
                <div className="space-y-6">
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      {previewClass.code}
                    </p>
                    <h4 className="mt-1 text-lg font-bold text-zinc-900 dark:text-white">
                      {previewClass.name}
                    </h4>
                    <div className="mt-4 flex items-center gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                      <img 
                        src={previewClass.professor?.image || `https://api.dicebear.com/7.x/initials/svg?seed=${previewClass.professor?.name}`} 
                        alt="Prof" 
                        className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-700" 
                      />
                      <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-white">Prof. {previewClass.professor?.name}</p>
                        <p className="text-xs text-zinc-500">{previewClass.professor?.email}</p>
                      </div>
                    </div>
                  </div>

                  {modalError && <p className="text-sm font-medium text-red-500 text-center">{modalError}</p>}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setPreviewClass(null)}
                      className="w-full rounded-xl border border-zinc-200 py-3 text-sm font-bold text-zinc-700 transition-all hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleJoinClass}
                      disabled={isJoining}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-sm font-bold text-white transition-all hover:bg-zinc-800 disabled:opacity-70 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                      {isJoining ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirm Join"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 1. Formal Header Section */}
      <div className="flex flex-col gap-6 border-b border-zinc-200 pb-8 dark:border-zinc-800 md:flex-row md:items-end md:justify-between animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 uppercase">
            Welcome back, {session?.user?.name?.split(' ')[0] || "Student"}.
      {/* Header */}

      <div className="flex flex-col gap-6 border-b border-zinc-200 pb-8 dark:border-zinc-800 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Welcome back, {session?.user?.name?.split(" ")[0] || "Student"}.
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Here is your academic overview for the current semester.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
            <Calendar className="h-4 w-4 text-zinc-400" />
            View Schedule
          </button>
          
          {/* 👇 TRIGGER MODAL HERE 👇 */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-zinc-800 focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >

          <button className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900">
            <Plus className="h-4 w-4" />
            Join Class
          </button>
        </div>
      </div>

      {/* Stats */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className={`rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50 ${stat.color}`}>
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div
              className={`rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50 ${stat.color}`}
            >
              <stat.icon className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Main Dashboard Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 xl:grid-cols-4">
        
        {/* Left Column: Classes */}
        <div className="lg:col-span-2 xl:col-span-3 space-y-6">
      {/* Main Layout */}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* Classes */}

        <div className="lg:col-span-2 space-y-6">

          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              <BookOpen className="h-5 w-5 text-zinc-400" />
              Enrolled Classes
            </h2>

            <Link
              href="/classes"
              className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              View Directory
            </Link>
          </div>
          
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            
            {classes.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 py-16 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
                <BookOpen className="h-10 w-10 text-zinc-300 dark:text-zinc-600" />
                <h3 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-200">
                  No classes found
                </h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  You haven't joined any classes for this semester.
                </p>
              </div>
            ) : (
              classes.map((item) => {

                const progress =
                  item.progress || Math.floor(Math.random() * 100);

                const project =
                  item.currentProject || "No active assignment";

                return (
                  <div key={item._id} className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
                  <div
                    key={item._id}
                    className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    
                    {/* Card Header */}

                    <div className="border-b border-zinc-100 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-800/20">

                      <div className="flex items-start justify-between">

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                            {item.code || "CS-101"}
                          </p>

                          <h3 className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                            {item.name}
                          </h3>
                        </div>

                        <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                          <MoreVertical className="h-5 w-5" />
                        </button>

                      </div>
                    </div>

                    {/* Body */}

                    <div className="flex flex-1 flex-col p-5">

                      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-4">
                        Prof. {item.professor?.name || "Instructor"}
                      </p>

                      <div className="mt-auto space-y-3">

                        <div className="flex items-center justify-between text-sm">

                          <span className="flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300">
                            <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                            {project}
                          </span>

                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {progress}%
                          </span>

                        </div>

                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                          <div className="h-full rounded-full bg-zinc-900 dark:bg-zinc-200 transition-all duration-1000" style={{ width: `${progress}%` }} />
                          <div
                            className="h-full rounded-full bg-zinc-900 dark:bg-zinc-200 transition-all duration-1000"
                            style={{ width: `${progress}%` }}
                          />
                        </div>

                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-white px-5 py-3 dark:bg-zinc-900">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map((_, i) => (
                          <img key={i} src={`https://api.dicebear.com/7.x/notionists/svg?seed=${item._id + i}`} alt="Student Avatar" className="h-7 w-7 rounded-full border-2 border-white bg-zinc-100 dark:border-zinc-900" />
                        ))}
                      </div>
                      <Link href={`dashboard//class/${item._id}`} className="text-sm font-medium text-zinc-900 hover:text-blue-600 dark:text-zinc-100 dark:hover:text-blue-400 flex items-center gap-1">
                        Enter Workspace <ArrowRight className="h-3.5 w-3.5" />
                    {/* Footer */}

                    <div className="flex items-center justify-between px-5 py-3">

                      <div className="flex -space-x-2">
                        {[1, 2, 3].map((_, i) => (
                          <img
                            key={i}
                            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${item._id + i}`}
                            className="h-7 w-7 rounded-full border-2 border-white bg-zinc-100 dark:border-zinc-900"
                          />
                        ))}
                      </div>

                      <Link
                        href={`/dashboard/class/${item._id}`}
                        className="text-sm font-medium text-zinc-900 hover:text-blue-600 dark:text-zinc-100"
                      >
                        View Students →
                      </Link>

                    </div>

                  </div>
                );
              })
            )}

          </div>
        </div>

        {/* Right Column: Deadlines / Activity Feed */}
        <div className="space-y-6 lg:col-span-1">
        {/* Deadlines */}

        <div className="space-y-6">

          <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            <Clock className="h-5 w-5 text-zinc-400" />
            Upcoming Deadlines
          </h2>
          
          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">

          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

            {[
              {
                title: "Database Schema Submission",
                class: "CS-302",
                time: "Today, 11:59 PM",
                urgent: true
              },
              {
                title: "Midterm Project Proposal",
                class: "ENG-201",
                time: "Tomorrow, 5:00 PM",
                urgent: false
              },
              {
                title: "Peer Code Review",
                class: "CS-401",
                time: "Friday, 10:00 AM",
                urgent: false
              }
            ].map((task, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 border-b border-zinc-100 p-4 dark:border-zinc-800"
              >
                <div
                  className={`mt-1 h-2.5 w-2.5 rounded-full ${
                    task.urgent
                      ? "bg-red-500 animate-pulse"
                      : "bg-zinc-300 dark:bg-zinc-600"
                  }`}
                />

                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {task.title}
                  </h4>

                  <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {task.class} • {task.time}
                  </div>
                </div>
              </div>
            ))}
            <button className="w-full bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">
              View Full Calendar
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}