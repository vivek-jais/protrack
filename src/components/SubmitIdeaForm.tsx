"use client";

import React, { useState } from "react";
// 🔥 1. Added useParams here
import { useRouter, useParams } from "next/navigation"; 
import { Lightbulb, ArrowRight, Loader2, Rocket } from "lucide-react";
import { toast } from "react-toastify";

export default function SubmitIdeaForm() {
  const router = useRouter();
  // 🔥 2. Grab the project ID from the URL
  const params = useParams();
  const projectId = params.id; 

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter your project idea.");
      return;
    }
    
    // Safety check just in case the URL doesn't have the ID
    if (!projectId) {
      toast.error("Project ID is missing!");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/student/submit-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 🔥 3. Added projectId to the body!
        body: JSON.stringify({ title, description, projectId }), 
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit idea");
      }

      toast.success("Idea submitted to your professor!");
      router.refresh(); 

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-white p-8 shadow-lg dark:border-emerald-900/50 dark:bg-zinc-900/80">
      
      {/* Background Glow */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-[80px]"></div>

      <div className="relative z-10">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
          <Rocket className="h-7 w-7" />
        </div>
        
        <h2 className="mb-2 text-2xl font-extrabold text-zinc-900 dark:text-white">
          Pitch Your Idea
        </h2>
        <p className="mb-8 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          Your team is formed! Pitch your specific idea for this course project. Your professor will review it and provide approval or feedback before you begin Stage 2.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-bold text-zinc-700 dark:text-zinc-300">
              Idea Title <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <Lightbulb className="h-4 w-4 text-zinc-400" />
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Full-Stack E-Commerce Platform"
                className="block w-full rounded-xl border border-zinc-300 bg-zinc-50 p-3 pl-10 text-sm text-zinc-900 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-zinc-700 dark:text-zinc-300">
              Brief Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What problem does it solve? What tech stack will you use?"
              rows={4}
              className="block w-full resize-none rounded-xl border border-zinc-300 bg-zinc-50 p-3 text-sm text-zinc-900 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 p-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-emerald-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Submit Idea for Approval 
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}