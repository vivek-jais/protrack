"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, Send, Save, Plus, Trash2,Upload } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";

// Default empty state for manual entry
const EMPTY_PROJECT = {
  title: "",
  description: "",
  startDate: "",
  deadline: "",
  totalMarks: 0,
  github_repository: true,
  stages: []
};

export default function HybridProjectBuilder() {
  const router = useRouter();

  // Chat State
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [threadId] = useState(`teacher_${Date.now()}`);

  // Form State (Editable by AI and Human)
  const [formData, setFormData] = useState<any>(EMPTY_PROJECT);

  // ==========================================
  // AI INTERACTION LOGIC
  // ==========================================
  const handleAIStep = async () => {
    if (!input) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/builder/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send the chat text AND the current manual form state to sync them
        body: JSON.stringify({ thread_id: threadId, text: input, current_draft: formData }),
      });

      const data = await res.json();
      
      // Auto-fill the manual form with AI's response
      if (data.draft) setFormData(data.draft);
      
    } catch (err) {
      toast.error("AI Server unreachable. Ensure Python backend is running.");
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  // ==========================================
  // MANUAL FORM LOGIC
  // ==========================================
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleStageChange = (index: number, field: string, value: any) => {
    const newStages = [...(formData.stages || [])];
    newStages[index] = { ...newStages[index], [field]: value };
    setFormData((prev: any) => ({ ...prev, stages: newStages }));
  };

  const addStage = () => {
    setFormData((prev: any) => ({
      ...prev,
      stages: [...(prev.stages || []), { stageName: "", deadline: "", maxMarks: 0 }]
    }));
  };

  const removeStage = (index: number) => {
    const newStages = [...(formData.stages || [])];
    newStages.splice(index, 1);
    setFormData((prev: any) => ({ ...prev, stages: newStages }));
  };

  const saveToDatabase = async () => {
    try {
      // Send the finalized JSON to your Next.js API
      const res = await fetch("/api/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        toast.success("Project saved successfully!");
        // 🔥 Redirect back to projects library immediately
        router.push("/projects"); 
      } else {
        toast.error("Error saving project.");
      }
    } catch (error) {
      toast.error("Network error.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20 font-sans dark:bg-[#09090b] dark:text-white">
      <ToastContainer theme="dark" />
      
      {/* HEADER */}
      <div className="py-10 px-8 max-w-[95%] mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          Project Creation Studio
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
          Build your project manually, or use the AI Architect to auto-generate the curriculum.
        </p>
      </div>

      <div className="max-w-[95%] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: AI ASSISTANT (4/12 width) */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl p-6 flex flex-col sticky top-8 shadow-md dark:bg-[#18181b]">
            
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-sm">
                <Sparkles className="text-white h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Architect</h2>
            </div>

            <div className="relative mt-4">
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask AI to generate or modify stages..."
                className="w-full bg-gray-100 border border-gray-200 rounded-xl p-4 pr-12 text-sm focus:outline-none focus:border-emerald-500 text-gray-900 resize-none shadow-inner dark:bg-[#09090b] dark:border-zinc-800 dark:text-white"
                rows={5}
              />
              <button 
                onClick={handleAIStep}
                disabled={loading || !input}
                className="cursor-pointer absolute bottom-4 right-4 p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4 -ml-0.5 mt-0.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: MANUAL EDITABLE FORM (8/12 width) */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl p-8 shadow-md dark:bg-[#18181b]">
            
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200 dark:border-zinc-800">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest dark:text-white">Project Specification</h2>
              <button 
                onClick={saveToDatabase}
                className="cursor-pointer px-5 py-2.5 bg-white text-black rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-gray-200 transition-colors"
              >
                <Upload className="h-4 w-4" /> Upload Project
              </button>
            </div>

            <div className="space-y-6">
              {/* Row 1: Title & Total Marks */}
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-grow">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 dark:text-zinc-400">Project Title</label>
                  <input 
                    type="text" 
                    value={formData.title} 
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-emerald-500 transition-colors dark:bg-[#09090b] dark:border-zinc-800 dark:text-white"
                  />
                </div>
                <div className="w-full md:w-48">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 dark:text-zinc-400">Total Marks</label>
                  <input 
                    type="number" 
                    value={formData.totalMarks} 
                    onChange={(e) => handleInputChange("totalMarks", Number(e.target.value))}
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-emerald-500 transition-colors font-bold dark:bg-[#09090b] dark:border-zinc-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Row 2: Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 dark:text-zinc-400">Start Date</label>
                  <input 
                    type="date" 
                    value={formData.startDate} 
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-emerald-500 transition-colors dark:bg-[#09090b] dark:border-zinc-800 dark:text-white"
                    style={{ colorScheme: "dark" }}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 dark:text-zinc-400">Overall Deadline</label>
                  <input 
                    type="date" 
                    value={formData.deadline} 
                    onChange={(e) => handleInputChange("deadline", e.target.value)}
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-emerald-500 transition-colors dark:bg-[#09090b] dark:border-zinc-800 dark:text-white"
                    style={{ colorScheme: "dark" }}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 dark:text-zinc-400">Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-emerald-500 transition-colors h-32 resize-none leading-relaxed dark:bg-[#09090b] dark:border-zinc-800 dark:text-zinc-300"
                />
              </div>

              {/* GitHub Toggle */}
              <div className="flex items-center gap-4 p-5 bg-gray-100 border border-gray-200 rounded-xl dark:bg-[#09090b] dark:border-zinc-800">
                <input 
                  type="checkbox" 
                  checked={formData.github_repository}
                  onChange={(e) => handleInputChange("github_repository", e.target.checked)}
                  className="h-5 w-5 accent-emerald-500 rounded bg-white border-gray-300 cursor-pointer dark:bg-zinc-900 dark:border-zinc-700"
                />
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Require GitHub Repository</p>
                  <p className="text-xs text-gray-500 mt-0.5 dark:text-zinc-500">Teams must link a repository to this project.</p>
                </div>
              </div>

              {/* Stages Editor */}
              <div className="pt-8 mt-8 border-t border-gray-200 dark:border-zinc-800">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest dark:text-white">Project Stages</h3>
                  <button onClick={addStage} className="text-xs font-bold text-emerald-500 flex items-center gap-1 hover:text-emerald-400 transition-colors">
                    <Plus className="h-4 w-4" /> Add Stage Manually
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.stages?.map((stage: any, idx: number) => (
                    <div key={idx} className="flex flex-col md:flex-row gap-4 p-5 bg-gray-100 border border-gray-200 rounded-xl items-start md:items-center dark:bg-[#09090b] dark:border-zinc-800">
                      <div className="flex-1 w-full">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 dark:text-zinc-500">Stage Name</label>
                        <input 
                          type="text" 
                          value={stage.stageName} 
                          onChange={(e) => handleStageChange(idx, "stageName", e.target.value)}
                          className="w-full bg-transparent border-b border-gray-300 text-sm py-1.5 focus:outline-none focus:border-emerald-500 text-gray-900 transition-colors dark:border-zinc-700 dark:text-white"
                        />
                      </div>
                      <div className="w-full md:w-40">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 dark:text-zinc-500">Deadline</label>
                        <input 
                          type="date" 
                          value={stage.deadline} 
                          onChange={(e) => handleStageChange(idx, "deadline", e.target.value)}
                          className="w-full bg-transparent border-b border-gray-300 text-sm py-1.5 focus:outline-none focus:border-emerald-500 text-gray-700 transition-colors dark:border-zinc-700 dark:text-zinc-300"
                          style={{ colorScheme: "dark" }}
                        />
                      </div>
                      <div className="w-full md:w-24">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 dark:text-zinc-500">Max Marks</label>
                        <input 
                          type="number" 
                          value={stage.maxMarks} 
                          onChange={(e) => handleStageChange(idx, "maxMarks", Number(e.target.value))}
                          className="w-full bg-transparent border-b border-gray-300 text-sm py-1.5 focus:outline-none focus:border-emerald-500 text-gray-900 font-bold transition-colors dark:border-zinc-700 dark:text-white"
                        />
                      </div>
                      <button onClick={() => removeStage(idx)} className="mt-4 md:mt-0 p-2 text-gray-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all self-end dark:text-zinc-400">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  {(!formData.stages || formData.stages.length === 0) && (
                    <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 text-sm dark:border-zinc-800 dark:text-zinc-400">
                      No stages defined. Ask the AI to generate some, or add them manually!
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}