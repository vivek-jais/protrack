"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Palette, Clock, BookOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";

const THEME_OPTIONS = [
  { id: "emerald", name: "Emerald", value: "from-emerald-500 to-teal-500", bg: "bg-gradient-to-r from-emerald-500 to-teal-500" },
  { id: "blue", name: "Royal Blue", value: "from-blue-600 to-indigo-600", bg: "bg-gradient-to-r from-blue-600 to-indigo-600" },
  { id: "purple", name: "Midnight", value: "from-purple-600 to-pink-600", bg: "bg-gradient-to-r from-purple-600 to-pink-600" },
  { id: "orange", name: "Sunset", value: "from-orange-500 to-red-500", bg: "bg-gradient-to-r from-orange-500 to-red-500" },
  { id: "dark", name: "Obsidian", value: "from-gray-800 to-gray-900", bg: "bg-gradient-to-r from-gray-800 to-gray-900" },
];

export default function CreateClassPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    schedule: "",
    theme: THEME_OPTIONS[0].value, 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/class/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create class");
      }
      router.push("/teacherDashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 dark:bg-zinc-950">
      <div className="mx-auto max-w-2xl">
        <Link 
          href="/dashboard/teacher" 
          className="mb-6 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Card */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-zinc-900">
          
          <div className={`h-32 w-full bg-linear-to-r ${formData.theme} p-8 transition-colors duration-500`}>
            <h1 className="text-3xl font-bold text-white">Create New Class</h1>
            <p className="mt-2 text-white/80">Set up a new space for your students.</p>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* 1. Class Name */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-zinc-300">
                  <BookOpen className="h-4 w-4 text-gray-400" />
                  Class Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Advanced Data Structures"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
                />
              </div>

              {/* 2. Schedule */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-zinc-300">
                  <Clock className="h-4 w-4 text-gray-400" />
                  Schedule (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mon & Wed, 10:00 AM"
                  value={formData.schedule}
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
                />
              </div>

              {/* 3. Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="What will students learn in this course?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
                />
              </div>

              {/* 4. Theme Selector */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-zinc-300">
                  <Palette className="h-4 w-4 text-gray-400" />
                  Class Theme
                </label>
                <div className="flex flex-wrap gap-3">
                  {THEME_OPTIONS.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, theme: theme.value })}
                      className={`h-10 w-10 rounded-full ${theme.bg} transition-transform hover:scale-110 ${
                        formData.theme === theme.value 
                          ? "ring-2 ring-gray-900 ring-offset-2 dark:ring-white dark:ring-offset-zinc-900" 
                          : ""
                      }`}
                      title={theme.name}
                    />
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-gray-900 py-4 font-bold text-white transition-all hover:bg-gray-800 disabled:opacity-70 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating Class...
                  </span>
                ) : (
                  "Create Class"
                )}
              </button>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}