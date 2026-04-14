"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import {
  Loader2, Plus, FileText, Calendar, BookOpen,
  Pencil, Trash2, X, AlertTriangle, Target, ArrowRightIcon
} from "lucide-react";

export default function ManageProjectsPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [projects, setProjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [editingProject, setEditingProject] = useState<any>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Security & Fetching
  useEffect(() => {
    // @ts-ignore  
    if (session?.user?.role === "student") {
      router.push("/dashboard/projects");
      return;
    }

    const fetchData = async () => {
      // @ts-ignore
      if (session?.user?.id) {
        try {
          const projRes = await fetch("/api/project");
          if (projRes.ok) {
            const projData = await projRes.json();
            setProjects(projData.projects || []);
          }

          // @ts-ignore
          const classRes = await fetch(`/api/user/classes/${session.user.id}`);
          if (classRes.ok) {
            const classData = await classRes.json();
            setClasses(classData.classes || []);
          }
        } catch (error) {
          console.error("Failed to fetch data", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (session) fetchData();
  }, [session, router]);

  // ==========================================
  // DELETE LOGIC
  // ==========================================
  const handleDelete = async () => {
    if (!deletingProjectId) return;
    setIsActionLoading(true);

    try {
      const res = await fetch(`/api/project/${deletingProjectId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p._id !== deletingProjectId));
        setDeletingProjectId(null);
        toast.success("Project deleted successfully");
      } else {
        toast.error("Failed to delete project");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setIsActionLoading(false);
    }
  };

  // ==========================================
  // EDIT MODAL: STAGE HANDLERS
  // ==========================================
  const handleAddStage = () => {
    const updatedStages = [...(editingProject.stages || []), { stageName: "New Stage", maxMarks: 10, deadline: "" }];
    setEditingProject({ ...editingProject, stages: updatedStages });
  };

  const handleRemoveStage = (index: number) => {
    const updatedStages = editingProject.stages.filter((_: any, i: number) => i !== index);
    setEditingProject({ ...editingProject, stages: updatedStages });
  };

  const handleStageChange = (index: number, field: string, value: string | number) => {
    const updatedStages = [...editingProject.stages];
    updatedStages[index][field] = value;
    setEditingProject({ ...editingProject, stages: updatedStages });
  };

  // ==========================================
  // UPDATE LOGIC
  // ==========================================
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);

    try {
      const res = await fetch(`/api/project/${editingProject._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingProject.title,
          description: editingProject.description,
          deadline: editingProject.deadline,
          classId: editingProject.classId === "" ? null : editingProject.classId,
          stages: editingProject.stages 
        }),
      });

      if (res.ok) {
        const { project: updatedProj } = await res.json();

        setProjects((prev) =>
          prev.map((p) => (p._id === updatedProj._id ? {
            ...updatedProj,
            classId: classes.find(c => c._id === updatedProj.classId) || null
          } : p))
        );
        setEditingProject(null);
        toast.success("Project updated successfully!");
      } else {
        toast.error("Failed to update project");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setIsActionLoading(false);
    }
  };

  const formatForInput = (dateString: string) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const formatDateOnly = (dateString: string) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toISOString().split("T")[0];
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] p-6 md:p-12 font-sans">
      <ToastContainer theme="dark" />
      
      <div className="mx-auto max-w-7xl space-y-8">

        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Project Library</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Manage all assignments, stages, and deadlines in one place.
            </p>
          </div>
          <Link
            href="/teacherDashboard/project/createProject"
            className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-emerald-600 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            <Plus className="h-4 w-4" />
            Create Project
          </Link>
        </div>

        {/* PROJECTS GRID */}
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-zinc-800 bg-[#18181b]/50 py-24 text-center">
            <div className="h-16 w-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-4 border border-zinc-800">
              <FileText className="h-8 w-8 text-zinc-600" />
            </div>
            <h3 className="text-xl font-bold text-white">No projects found</h3>
            <p className="mt-2 text-sm text-zinc-400 max-w-sm">You haven't created any assignments yet. Click the button above to get started with the AI Architect.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <div 
                key={project._id} 
                className="group flex flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-[#18181b] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-[0_8px_30px_rgb(16,185,129,0.1)]"
              >
                <div className="flex flex-1 flex-col p-6">
                  
                  {/* Title & Icons */}
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <h3 className="text-xl font-bold text-white line-clamp-2 leading-tight">
                      {project.title}
                    </h3>
                    <div className="flex gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingProject({ ...project, classId: project.classId?._id || "" })}
                        className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeletingProjectId(project._id)}
                        className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mb-6 text-sm text-zinc-400 line-clamp-3 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Metadata Pills */}
                  <div className="mt-auto flex flex-wrap gap-2 mb-6">
                    <span className="flex items-center gap-1.5 bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-500/20">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span className="truncate max-w-[120px]">{project.classId ? project.classId.name : "Standalone"}</span>
                    </span>
                    <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-500/20">
                      <Target className="h-3.5 w-3.5" />
                      {project.stages?.length || 0} Stages
                    </span>
                    <span className="flex items-center gap-1.5 bg-rose-500/10 text-rose-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-rose-500/20">
                      <Calendar className="h-3.5 w-3.5" />
                      Due: {new Date(project.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>

                  {/* CTA Button */}
                  <Link
                    href={`/teacherDashboard/project/${project._id}/workspace`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500/10 py-3 text-sm font-bold text-emerald-500 transition-all hover:bg-emerald-500 hover:text-white"
                  >
                    Enter Workspace
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* EDIT MODAL */}
      {/* ========================================== */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl bg-[#18181b] border border-zinc-800 shadow-2xl">

            <div className="flex items-center justify-between border-b border-zinc-800 px-8 py-5 shrink-0">
              <h3 className="text-xl font-bold text-white">Edit Project Specification</h3>
              <button onClick={() => setEditingProject(null)} className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-8 custom-scrollbar">
              <form id="edit-form" onSubmit={handleUpdate} className="space-y-6">

                {/* Core Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Project Title</label>
                    <input
                      type="text" required
                      value={editingProject.title}
                      onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                      className="w-full px-4 py-3 bg-[#09090b] border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Associated Class</label>
                    <select
                      value={editingProject.classId || ""}
                      onChange={(e) => setEditingProject({ ...editingProject, classId: e.target.value })}
                      className="w-full px-4 py-3 bg-[#09090b] border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    >
                      <option value="">Standalone Project</option>
                      {classes.map(c => (
                        <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Absolute Deadline</label>
                    <input
                      type="datetime-local" required
                      value={formatForInput(editingProject.deadline)}
                      onChange={(e) => setEditingProject({ ...editingProject, deadline: e.target.value })}
                      className="w-full px-4 py-3 bg-[#09090b] border border-zinc-800 rounded-xl text-zinc-300 focus:outline-none focus:border-emerald-500 transition-colors"
                      style={{ colorScheme: "dark" }}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Description</label>
                    <textarea
                      rows={4} required
                      value={editingProject.description}
                      onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                      className="w-full px-4 py-3 bg-[#09090b] border border-zinc-800 rounded-xl text-zinc-300 focus:outline-none focus:border-emerald-500 transition-colors resize-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* Stages Builder */}
                <div className="pt-6 border-t border-zinc-800">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-sm font-bold text-white uppercase tracking-widest">Project Stages</h4>
                    <button
                      type="button"
                      onClick={handleAddStage}
                      className="text-xs font-bold text-emerald-500 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                    >
                      <Plus className="h-4 w-4" /> Add Stage
                    </button>
                  </div>

                  <div className="space-y-4">
                    {editingProject.stages?.map((stage: any, index: number) => (
                      <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#09090b] p-5 rounded-xl border border-zinc-800">
                        <div className="flex-1 w-full">
                          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Stage Name</label>
                          <input
                            type="text" required
                            value={stage.stageName}
                            onChange={(e) => handleStageChange(index, "stageName", e.target.value)}
                            className="w-full bg-transparent border-b border-zinc-700 text-sm py-1.5 focus:outline-none focus:border-emerald-500 text-white transition-colors"
                          />
                        </div>
                        <div className="w-full sm:w-32 shrink-0">
                          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Max Marks</label>
                          <input
                            type="number" required min="1"
                            value={stage.maxMarks}
                            onChange={(e) => handleStageChange(index, "maxMarks", Number(e.target.value))}
                            className="w-full bg-transparent border-b border-zinc-700 text-sm py-1.5 focus:outline-none focus:border-emerald-500 text-white font-bold transition-colors"
                          />
                        </div>
                        <div className="w-full sm:w-40 shrink-0">
                          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Deadline</label>
                          <input
                            type="date"
                            value={formatDateOnly(stage.deadline)}
                            onChange={(e) => handleStageChange(index, "deadline", e.target.value)}
                            className="w-full bg-transparent border-b border-zinc-700 text-sm py-1.5 focus:outline-none focus:border-emerald-500 text-zinc-300 transition-colors"
                            style={{ colorScheme: "dark" }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveStage(index)}
                          className="mt-4 sm:mt-0 p-2 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors self-end"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </form>
            </div>

            <div className="flex gap-4 px-8 py-5 border-t border-zinc-800 bg-[#18181b] shrink-0">
              <button type="button" onClick={() => setEditingProject(null)} className="flex-1 rounded-xl border border-zinc-800 py-3 text-sm font-bold text-zinc-300 hover:bg-zinc-800 transition-colors">
                Cancel
              </button>
              <button form="edit-form" type="submit" disabled={isActionLoading} className="flex-1 flex justify-center items-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white hover:bg-emerald-600 transition-colors disabled:opacity-70">
                {isActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* DELETE MODAL */}
      {/* ========================================== */}
      {deletingProjectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-[#18181b] border border-zinc-800 shadow-2xl p-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20">
              <AlertTriangle className="h-8 w-8 text-rose-500" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">Delete Project?</h3>
            <p className="mb-8 text-sm text-zinc-400">
              This action cannot be undone. All student submissions linked to this project will be permanently orphaned.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingProjectId(null)} className="w-full rounded-xl border border-zinc-800 py-3 text-sm font-bold text-zinc-300 hover:bg-zinc-800 transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={isActionLoading} className="w-full flex justify-center items-center gap-2 rounded-xl bg-rose-600 py-3 text-sm font-bold text-white hover:bg-rose-700 transition-colors disabled:opacity-70">
                {isActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}