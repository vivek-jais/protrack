"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  Users, 
  Search, 
  Mail, 
  ArrowLeft, 
  Loader2, 
  GraduationCap
} from "lucide-react";

export default function ClassDirectoryPage() {
  const params = useParams();
  const classId = params.id as string;

  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch Classmates
  useEffect(() => {
    const fetchClassmates = async () => {
      try {
        // Fetching from the API route that returns class data
        const res = await fetch(`/api/class/${classId}`);
        if (res.ok) {
          const data = await res.json();
          setStudents(data.students || []);
        }
      } catch (error) {
        console.error("Failed to load classmates", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassmates();
  }, [classId]);

  // Filter students based on search
  const filteredStudents = students.filter(student => 
    student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <p className="text-sm font-medium text-zinc-500">Loading classmate directory...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-[96%] max-w-[1400px] space-y-8 py-8">
      
      {/* 1. Header Section */}
      <div className="animate-in fade-in slide-in-from-top-4 duration-700">
        <Link 
          href={`/class/${classId}`} 
          className="mb-6 inline-flex items-center text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Class Dashboard
        </Link>
        
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-zinc-200 pb-6 dark:border-zinc-800">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              <div className="rounded-xl bg-emerald-50 p-2 dark:bg-emerald-500/10">
                <Users className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              Classmate Directory
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-xl">
              Connect and collaborate with your peers. Reach out to form study groups or project teams.
            </p>
          </div>
          
          <div className="flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <GraduationCap className="h-4 w-4 text-emerald-500" />
            {students.length} Enrolled
          </div>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="relative max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
        <Search className="absolute left-4 top-3.5 h-5 w-5 text-zinc-400" />
        <input
          type="text"
          placeholder="Search classmates by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 bg-white px-11 py-3 text-sm shadow-sm outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
        />
      </div>

      {/* 3. Classmates Grid */}
      {filteredStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 py-20 text-center animate-in fade-in zoom-in-95 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="rounded-full bg-zinc-200/50 p-4 dark:bg-zinc-800">
            <Search className="h-8 w-8 text-zinc-400" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">No classmates found</h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {searchQuery ? "Try adjusting your search terms." : "You are the first one here!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredStudents.map((student, index) => (
            <div 
              key={student._id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-900/50 animate-in fade-in slide-in-from-bottom-8 fill-mode-both"
              style={{ animationDelay: `${index * 50}ms` }} // Fast staggered entrance
            >
              <div className="flex items-start gap-4">
                {/* Avatar with subtle hover scale */}
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
                  <img 
                    src={student.image || `https://api.dicebear.com/7.x/notionists/svg?seed=${student.name}`} 
                    alt={student.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                
                {/* Info Container */}
                <div className="flex flex-col overflow-hidden pt-1">
                  <h3 className="truncate text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {student.name}
                  </h3>
                  <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {student.email}
                  </p>
                </div>
              </div>

              {/* Action Button (Mailto link) */}
              <div className="mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800/80">
                <a 
                  href={`https://mail.google.com${student.email}`}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-50 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-emerald-50 hover:text-emerald-600 dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
                >
                  <Mail className="h-4 w-4" />
                  Send Email
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}