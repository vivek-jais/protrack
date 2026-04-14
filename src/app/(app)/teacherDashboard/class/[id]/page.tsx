"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Mail, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Search
} from "lucide-react";

export default function ManageStudentsPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  
  const classId = params.id as string;

  // States
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Add Student States
  const [newEmail, setNewEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [addMessage, setAddMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  // Delete Student States
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 1. Fetch Students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(`/api/class/${classId}`);
        if (res.ok) {
          const data = await res.json();
          setStudents(data.students || []);
        }
      } catch (error) {
        console.error("Failed to load students", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) fetchStudents();
  }, [session, classId]);

  // 2. Handle Add Student
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;

    setIsAdding(true);
    setAddMessage(null);

    try {
      const res = await fetch(`/api/class/${classId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        setStudents(data.students); // Update list with new student
        setNewEmail(""); // Clear input
        setAddMessage({ type: "success", text: "Student added successfully!" });
      } else {
        setAddMessage({ type: "error", text: data.message || "Failed to add student." });
      }
    } catch (error) {
      setAddMessage({ type: "error", text: "Server error occurred." });
    } finally {
      setIsAdding(false);
      // Clear message after 3 seconds
      setTimeout(() => setAddMessage(null), 3000);
    }
  };

  // 3. Handle Remove Student
  const handleRemoveStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`Are you sure you want to remove ${studentName} from this class?`)) return;

    setDeletingId(studentId);

    try {
      const res = await fetch(`/api/class/${classId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });

      const data = await res.json();

      if (res.ok) {
        setStudents(data.students); // Update list
      } else {
        alert(data.message || "Failed to remove student.");
      }
    } catch (error) {
      alert("Server error occurred.");
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 py-8 sm:p-6 lg:p-8">
      
      {/* Header */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Link 
          href={`/teacherDashboard`} 
          className="mb-4 inline-flex items-center text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              <Users className="h-8 w-8 text-emerald-500" />
              Manage Students
            </h1>
            <p className="mt-1 text-zinc-500 dark:text-zinc-400">
              Add or remove students from your class workspace.
            </p>
          </div>
          <div className="rounded-full bg-zinc-100 px-4 py-1.5 text-sm font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            Total Enrolled: {students.length}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* Left Column: Add Student Form */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm animate-in fade-in slide-in-from-left-8 duration-700 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="border-b border-zinc-100 bg-zinc-50 p-6 dark:border-zinc-800/50 dark:bg-zinc-800/20">
              <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-white">
                <UserPlus className="h-5 w-5 text-emerald-500" />
                Enroll Student
              </h2>
            </div>
            
            <form onSubmit={handleAddStudent} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Student Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
                  <input
                    type="email"
                    required
                    placeholder="student@university.edu"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-10 py-2.5 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isAdding || !newEmail}
                className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-sm font-bold text-white transition-all hover:bg-zinc-800 disabled:opacity-70 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add to Class"}
              </button>

              {/* Success/Error Message Animation */}
              {addMessage && (
                <div className={`flex items-center gap-2 rounded-lg p-3 text-sm animate-in zoom-in-95 duration-300 ${
                  addMessage.type === "success" 
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" 
                    : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                }`}>
                  {addMessage.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  {addMessage.text}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right Column: Students Grid */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Search/Filter Bar (Visual Only for now) */}
          <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in slide-in-from-top-4">
            <Search className="ml-2 h-5 w-5 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search enrolled students..." 
              className="w-full bg-transparent px-2 text-sm outline-none dark:text-white"
            />
          </div>

          {/* Empty State */}
          {students.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 py-20 text-center animate-in fade-in zoom-in-95 dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="rounded-full bg-zinc-200/50 p-4 dark:bg-zinc-800">
                <Users className="h-8 w-8 text-zinc-400" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">Class is empty</h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Use the form on the left to add students.</p>
            </div>
          ) : (
            /* Student Cards Grid */
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {students.map((student, index) => (
                <div 
                  key={student._id}
                  className="group relative flex items-center justify-between overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 animate-in fade-in slide-in-from-bottom-8 fill-mode-both"
                  style={{ animationDelay: `${index * 100}ms` }} // Staggered animation!
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative h-12 w-12 overflow-hidden rounded-full bg-zinc-100 border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800">
                      <img 
                        src={student.image || `https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`} 
                        alt={student.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    {/* Info */}
                    <div className="flex flex-col">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-37.5">
                        {student.name}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-37.5">
                        {student.email}
                      </span>
                    </div>
                  </div>

                  {/* Delete Button (Appears clearly on hover) */}
                  <button
                    onClick={() => handleRemoveStudent(student._id, student.name)}
                    disabled={deletingId === student._id}
                    className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                    // @ts-ignore
                    title='Remove Student'
                  >
                    {deletingId === student._id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}