"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, BookOpen, FileText, Calendar, ArrowLeft, Link as LinkIcon, Building2 } from "lucide-react";
import Link from "next/link";
import { ToastContainer, Bounce,toast} from "react-toastify";

export default function CreateProjectPage() {
    const router = useRouter();
    const { data: session } = useSession();

    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingClasses, setIsFetchingClasses] = useState(true);
    const [classes, setClasses] = useState<any[]>([]);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        classId: "", // Will hold the _id from the dropdown
        deadline: "",
        githubRequired: true,
    });

    // 1. Fetch the teacher's classes automatically on mount
    useEffect(() => {
        const fetchClasses = async () => {
            // @ts-ignore
            if (session?.user?.id) {
                try {
                    // @ts-ignore
                    const res = await fetch(`/api/user/classes/${session.user.id}`);
                    if (res.ok) {
                        const data = await res.json();
                        setClasses(data.classes || []);
                    }
                } catch (error) {
                    console.error("Failed to fetch classes for dropdown", error);
                } finally {
                    setIsFetchingClasses(false);
                }
            }
        };

        if (session) fetchClasses();
    }, [session]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/project", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    deadline: formData.deadline,
                    classId: formData.classId === "" ? undefined : formData.classId, // Pass undefined if "Standalone" is selected
                    requirements: {
                        githubRepository: formData.githubRequired,
                        liveDemoUrl: false,
                    }
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to create project");
            }
            toast.success('Project published successfully', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                    transition: Bounce,
                });
            setTimeout(() => {
                router.push("/projects");
            }, 3000);
            
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-12 dark:bg-zinc-950">
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
                transition={Bounce}
            />
            <div className="mx-auto max-w-2xl">
                <Link
                    href="/teacherDashboard"
                    className="mb-6 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

                    {/* Formal Solid Header */}
                    <div className="bg-emerald-600 p-8">
                        <h1 className="text-3xl font-bold text-white">Create New Project</h1>
                        <p className="mt-2 text-white/80">Draft an assignment and optionally attach it to a class.</p>
                    </div>

                    <div className="p-8">
                        {error && (
                            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Project Title */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                                    <FileText className="h-4 w-4 text-gray-400" />
                                    Project Title
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Full-Stack E-Commerce Platform"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none transition-all focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                                />
                            </div>

                            {/* AUTOMATED CLASS DROPDOWN */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                                    <Building2 className="h-4 w-4 text-gray-400" />
                                    Assign to Class
                                </label>
                                <div className="relative">
                                    <select
                                        value={formData.classId}
                                        onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                                        disabled={isFetchingClasses}
                                        className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none transition-all focus:border-blue-600 focus:ring-1 focus:ring-blue-600 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                                    >
                                        <option value="">Standalone Project</option>
                                        {classes.map((cls) => (
                                            <option key={cls._id} value={cls._id}>
                                                {cls.name} — ({cls.code})
                                            </option>
                                        ))}
                                    </select>
                                    {/* Custom dropdown arrow for better cross-browser styling */}
                                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                                        {isFetchingClasses ? (
                                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                        ) : (
                                            <svg className="h-4 w-4 fill-current text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-zinc-500">
                                    Selecting a class automatically makes this project visible to enrolled students.
                                </p>
                            </div>

                            {/* Deadline */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    Deadline
                                </label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none transition-all focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300">
                                    Instructions / Description
                                </label>
                                <textarea
                                    rows={4}
                                    required
                                    placeholder="Detail the technical requirements and learning objectives..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none transition-all focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                                />
                            </div>

                            {/* Requirements Toggles */}
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.githubRequired}
                                        onChange={(e) => setFormData({ ...formData, githubRequired: e.target.checked })}
                                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Require GitHub Submission</p>
                                        <p className="text-xs text-gray-500 dark:text-zinc-400">Students must submit a valid repository link.</p>
                                    </div>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="cursor-pointer w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2 ">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Publishing Project...
                                    </span>
                                ) : (
                                    "Create Project"
                                )}
                            </button>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}