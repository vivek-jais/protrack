"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  User, Mail, Phone, Building2, BookOpen, 
  Loader2, CheckCircle2, AlertCircle, Camera 
} from "lucide-react";

export default function ProfileSettingsPage() {
  // Extract 'update' to refresh the session after saving
  const { data: session, update } = useSession();
  
  const [isLoading, setIsLoading] = useState(true); 
  const [isSaving, setIsSaving] = useState(false);
  
  const [message, setMessage] = useState({ text: "", type: "" }); // type: "success" | "error"

  const [formData, setFormData] = useState({
    name: "",
    image: "",
    bio: "",
    phoneNumber: "",
    university: "",
    department: "",
  });

  // 1. Fetch Existing Profile Data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          // Populate form with existing DB data, falling back to empty strings to avoid uncontrolled input errors
          setFormData({
            name: data.user.name || "",
            image: data.user.image || "",
            bio: data.user.bio || "",
            phoneNumber: data.user.phoneNumber || "",
            university: data.user.university || "",
            department: data.user.department || "",
          });
        }
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchProfile();
    }
  }, [session]);

  // 2. Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      // 🔥 CRITICAL: Force NextAuth to refresh the session cookie
      // This immediately updates the Navbar with the new Name/Image!
      await update(); 

      setMessage({ text: "Profile updated successfully!", type: "success" });
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);

    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6 md:p-12">
      
      {/* Header */}
      <div className="border-b border-gray-200 pb-6 dark:border-zinc-800">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
          Manage your personal information and academic affiliations.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {/* Status Message */}
          {message.text && (
            <div className={`flex items-center gap-2 rounded-lg p-4 text-sm font-semibold ${
              message.type === "success" 
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" 
                : "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400"
            }`}>
              {message.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
              {message.text}
            </div>
          )}

          {/* Avatar Section */}
          <div className="flex items-center gap-6 pb-6 border-b border-gray-100 dark:border-zinc-800/50">
            <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-gray-50 bg-gray-100 dark:border-zinc-800 dark:bg-zinc-800">
              <img 
                src={formData.image || `https://api.dicebear.com/7.x/initials/svg?seed=${formData.name}`} 
                alt="Profile Avatar" 
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                <Camera className="h-4 w-4 text-gray-400" />
                Profile Image URL
              </label>
              <input
                type="url"
                disabled
                placeholder="https://example.com/your-image.jpg"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-100 p-3 text-sm text-gray-500 cursor-not-allowed dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500"
              />
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            
            {/* Full Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                <User className="h-4 w-4 text-gray-400" />
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none transition-all focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
              />
            </div>

            {/* Email (Read Only - Assuming managed by OAuth) */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                <Mail className="h-4 w-4 text-gray-400" />
                Email Address
              </label>
              <input
                type="email"
                disabled
                // @ts-ignore
                value={session?.user?.email || ""}
                className="w-full rounded-xl border border-gray-200 bg-gray-100 p-3 text-sm text-gray-500 cursor-not-allowed dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500"
                title="Email cannot be changed directly"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                <Phone className="h-4 w-4 text-gray-400" />
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none transition-all focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
              />
            </div>

            {/* Institution */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                <Building2 className="h-4 w-4 text-gray-400" />
                Institution / University
              </label>
              <input
                type="text"
                placeholder="e.g. Stanford University"
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none transition-all focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
              />
            </div>

            {/* Department */}
            <div className="space-y-2 md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                <BookOpen className="h-4 w-4 text-gray-400" />
                Department or Major
              </label>
              <input
                type="text"
                placeholder="e.g. Computer Science"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none transition-all focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300">
                Professional Bio
              </label>
              <textarea
                rows={4}
                placeholder="A brief summary of your academic background or teaching philosophy..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none transition-all focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
              />
            </div>

          </div>

          {/* Action Footer */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex w-full md:w-auto min-w-[160px] items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3 font-bold text-white transition-all hover:bg-gray-800 disabled:opacity-70 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}