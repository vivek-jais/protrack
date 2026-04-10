"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import { 
  Loader2, Plus, Trash2, Calendar, Target, 
  FileText, School, AlignLeft, Send
} from "lucide-react";
import Link from "next/link";

export default function CreateProjectPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // Basic Details
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [classId, setClassId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  
  // Stages (Roadmap)
  const [stages, setStages] = useState([
    { stageName: "Phase 1: Planning", maxMarks: 10, startDate: "", deadline: "" }
  ]);

  // Data
  const [myClasses, setMyClasses] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch classes the teacher owns
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        // @ts-ignore
        const res = await fetch(`/api/user/classes/${session?.user?.id}`);
        if (res.ok) {
          const data = await res.json();
          setMyClasses(data.classes);
        }
      } catch (error) {
        console.error("Failed to fetch classes");
      }
    };
    if (session) fetchClasses();
  }, [session]);

  // Stage Handlers
  const addStage = () => {
    setStages([...stages, { stageName: `Phase ${stages.length + 1}`, maxMarks: 10, startDate: "", deadline: "" }]);
  };

  const removeStage = (index: number) => {
    setStages(stages.filter((_, i) => i !== index));
  };

  const updateStage = (index: number, field: string, value: string | number) => {
    const updated = [...stages];
    updated[index] = { ...updated[index], [field]: value };
    setStages(updated);
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stages.length === 0) return toast.error("You must add at least one stage.");

    setIsSubmitting(true);
    try {
      const payload = {
        title,
        description,
        classId: classId || undefined,
        startDate,
        deadline,
        stages
      };

      const res = await fetch("/api/project", { // Update this URL if your route is different
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        toast.success("Project created successfully!");
        setTimeout(() => {
          router.push(`/dashboard/projects/${data.project._id}`);
        }, 1500);
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to create project");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 dark:bg-zinc-950 p-4 md:p-8">
      <ToastContainer />
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Create New Assignment</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">Design a roadmap-style project for your students.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Basic Info */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 space-y-6">
            <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white border-b border-gray-100 dark:border-zinc-800 pb-4">
              <FileText className="h-5 w-5 text-blue-500" /> Core Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300">Project Title</label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Full Stack E-Commerce App" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-blue-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300">Description & Instructions</label>
                <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Describe the overarching goal of this project..." className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-blue-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white resize-none" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300">Assign to Class (Optional)</label>
                <div className="relative">
                  <School className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <select value={classId} onChange={(e) => setClassId(e.target.value)} className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white">
                    <option value="">-- Select a Class --</option>
                    {myClasses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-blue-600 dark:text-blue-400">Project Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                  <input type="datetime-local" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded-xl border border-blue-200 bg-blue-50/50 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-600 dark:border-blue-900/50 dark:bg-blue-900/10 dark:text-white" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300">Final Project Deadline</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input type="datetime-local" required value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Roadmap Stages */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                <Target className="h-5 w-5 text-emerald-500" /> Roadmap Stages
              </h2>
              <button type="button" onClick={addStage} className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 dark:text-blue-400">
                <Plus className="h-4 w-4" /> Add Stage
              </button>
            </div>

            <div className="space-y-4">
              {stages.map((stage, index) => (
                <div key={index} className="p-5 rounded-xl border border-gray-200 bg-gray-50 dark:bg-zinc-950/50 dark:border-zinc-800 relative group transition-all hover:border-blue-300 dark:hover:border-blue-900/50">
                  
                  <div className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                    {index + 1}
                  </div>

                  {stages.length > 1 && (
                    <button type="button" onClick={() => removeStage(index)} className="absolute right-4 top-4 text-gray-400 hover:text-rose-500 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-2">
                    
                    <div className="md:col-span-8 space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-zinc-400">Stage Name</label>
                      <input type="text" required value={stage.stageName} onChange={(e) => updateStage(index, 'stageName', e.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-600 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white" />
                    </div>

                    <div className="md:col-span-4 space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-zinc-400">Points / Marks</label>
                      <input type="number" required min="1" value={stage.maxMarks} onChange={(e) => updateStage(index, 'maxMarks', e.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-600 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white" />
                    </div>

                    {/* 🔥 NEW: Start Date and End Date side-by-side */}
                    <div className="md:col-span-6 space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-zinc-400 text-blue-600 dark:text-blue-400">Go-Live Date (Start)</label>
                      <input type="datetime-local" value={stage.startDate} onChange={(e) => updateStage(index, 'startDate', e.target.value)} className="w-full rounded-lg border border-blue-200 bg-blue-50/50 px-3 py-2 text-sm outline-none focus:border-blue-600 dark:bg-blue-900/10 dark:border-blue-900/50 dark:text-white" />
                    </div>

                    <div className="md:col-span-6 space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-zinc-400 text-rose-600 dark:text-rose-400">Deadline (End)</label>
                      <input type="datetime-local" required value={stage.deadline} onChange={(e) => updateStage(index, 'deadline', e.target.value)} className="w-full rounded-lg border border-rose-200 bg-rose-50/50 px-3 py-2 text-sm outline-none focus:border-rose-600 dark:bg-rose-900/10 dark:border-rose-900/50 dark:text-white" />
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Send className="h-5 w-5" /> Publish Assignment Roadmap</>}
          </button>

        </form>
      </div>
    </div>
  );
}