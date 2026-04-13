"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2, Plus, FileText, Calendar, BookOpen,
  Pencil, Trash2, X, AlertTriangle, Target
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
          // Fetch Projects
          const projRes = await fetch("/api/project"); // Note: Ensure this matches your API route name
          if (projRes.ok) {
            const projData = await projRes.json();
            setProjects(projData.projects || []);
          }

          // Fetch Classes (for the Edit Dropdown)
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
      }
    } catch (error) {
      console.error("Failed to delete project", error);
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
          stages: editingProject.stages // Pass the updated stages array back to the API
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
      }
    } catch (error) {
      console.error("Failed to update project", error);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Helper to format dates
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-zinc-950 md:p-12">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Project Library</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
              Manage all assignments, stages, and deadlines.
            </p>
          </div>
          <Link
            href="/teacherDashboard/project/createProject"
            className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            Create Project
          </Link>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white/50 py-20 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
            <FileText className="h-10 w-10 text-gray-400" />
            <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">No projects found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">You haven't created any assignments yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div key={project._id} className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex flex-1 flex-col p-6">

                  <div className="mb-4 flex items-start justify-between gap-4">

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2">
                      {project.title}
                    </h3>
                    <Link
                      href={`/teacherDashboard/project/${project._id}/workspace`}
                      className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                    >
                      <Plus className="h-4 w-4" />
                      Enter Workspace
                    </Link>
                  </div>

                  <p className="mb-6 text-sm text-gray-600 dark:text-zinc-400 line-clamp-3">
                    {project.description}
                  </p>

                  <div className="mt-auto space-y-3 rounded-lg bg-gray-50 p-4 text-sm dark:bg-zinc-950">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-zinc-300">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold truncate">
                        {project.classId ? `${project.classId.name} (${project.classId.code})` : "Standalone Project"}
                      </span>
                    </div>
                    {/* NEW: Show Stage Data */}
                    <div className="flex items-center gap-2 text-gray-700 dark:text-zinc-300">
                      <Target className="h-4 w-4 text-emerald-600" />
                      <span className="font-medium">
                        {project.stages?.length || 0} Stages ({project.maxTotalMarks || 0} Total Marks)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-zinc-300">
                      <Calendar className="h-4 w-4 text-rose-600" />
                      <span className="font-medium">
                        Due: {new Date(project.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center divide-x divide-gray-200 border-t border-gray-200 bg-gray-50 dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/50">
                  <button
                    onClick={() => setEditingProject({
                      ...project,
                      classId: project.classId?._id || "",
                    })}
                    className="flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-blue-400"
                  >
                    <Pencil className="h-4 w-4" /> Edit
                  </button>
                  <button
                    onClick={() => setDeletingProjectId(project._id)}
                    className="flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-rose-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-rose-500"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ========================================== */}
      {/* EDIT MODAL (Now includes Stage Editing) */}
      {/* ========================================== */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          {/* Increased max-height and added scrolling for long stage lists */}
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-900">

            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-zinc-800 shrink-0">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Project</h3>
              <button onClick={() => setEditingProject(null)} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-6">
              <form id="edit-form" onSubmit={handleUpdate} className="space-y-6">

                {/* Core Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-zinc-300">Title</label>
                    <input
                      type="text" required
                      value={editingProject.title}
                      onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-zinc-300">Associated Class</label>
                    <select
                      value={editingProject.classId || ""}
                      onChange={(e) => setEditingProject({ ...editingProject, classId: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                    >
                      <option value="">Standalone Project</option>
                      {classes.map(c => (
                        <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-zinc-300">Absolute Deadline</label>
                    <input
                      type="datetime-local" required
                      value={formatForInput(editingProject.deadline)}
                      onChange={(e) => setEditingProject({ ...editingProject, deadline: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-zinc-300">Description</label>
                    <textarea
                      rows={3} required
                      value={editingProject.description}
                      onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                    />
                  </div>
                </div>

                {/* Stages Builder */}
                <div className="pt-4 border-t border-gray-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900 dark:text-white">Stages</h4>
                    <button
                      type="button"
                      onClick={handleAddStage}
                      className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 dark:text-blue-500"
                    >
                      <Plus className="h-4 w-4" /> Add Stage
                    </button>
                  </div>

                  <div className="space-y-3">
                    {editingProject.stages?.map((stage: any, index: number) => (
                      <div key={index} className="flex flex-wrap sm:flex-nowrap items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200 dark:bg-zinc-950 dark:border-zinc-800">
                        <div className="flex-1 min-w-[150px]">
                          <input
                            type="text" required placeholder="Stage Name"
                            value={stage.stageName}
                            onChange={(e) => handleStageChange(index, "stageName", e.target.value)}
                            className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                          />
                        </div>
                        <div className="w-24 shrink-0">
                          <input
                            type="number" required min="1" placeholder="Marks" title="Max Marks"
                            value={stage.maxMarks}
                            onChange={(e) => handleStageChange(index, "maxMarks", Number(e.target.value))}
                            className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                          />
                        </div>
                        <div className="w-36 shrink-0">
                          <input
                            type="date" title="Deadline"
                            value={formatDateOnly(stage.deadline)}
                            onChange={(e) => handleStageChange(index, "deadline", e.target.value)}
                            className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveStage(index)}
                          className="shrink-0 p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors dark:hover:bg-rose-900/30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </form>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 shrink-0">
              <button type="button" onClick={() => setEditingProject(null)} className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-white dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
                Cancel
              </button>
              <button form="edit-form" type="submit" disabled={isActionLoading} className="flex-1 flex justify-center items-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-70">
                {isActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal remains exactly the same */}
      {deletingProjectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-900 p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30">
              <AlertTriangle className="h-7 w-7 text-rose-600 dark:text-rose-500" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">Delete Project?</h3>
            <p className="mb-6 text-sm text-gray-500 dark:text-zinc-400">
              This action cannot be undone. All student submissions linked to this project will be orphaned.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingProjectId(null)} className="w-full rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={isActionLoading} className="w-full flex justify-center items-center gap-2 rounded-lg bg-rose-600 py-2.5 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-70">
                {isActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}