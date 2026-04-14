"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, School, CheckCircle2, Loader2, Camera, User, Upload } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();

  // --- State ---
  const [selectedRole, setSelectedRole] = useState<"student" | "teacher" | null>(null);
  const [name, setName] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Hidden file input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  //@ts-ignore
  // const role=session?.user?.role

  // --- 1. Load Session Data Initially ---
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setImagePreview(session.user.image || "");
    }
  }, [session]);

  // --- 2. Handle Image Upload (Convert to Base64) ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024 * 2) { // 2MB Limit
         alert("File is too large! Please choose an image under 2MB.");
         return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

 // --- 3. Handle Submit (Debug Version) ---
  const handleSubmit = async () => {
    if (!selectedRole) return;
    if (!name.trim()) return alert("Please enter your name");

    setLoading(true);

    try {
      // Send Updated Name, Image, and Role to API
      const res = await fetch("/api/user/setCredentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: selectedRole,
          name: name,
          image: imagePreview, 
        }),
      });

      // ✅ FIX: Read the server response to see the REAL error
      const data = await res.json();

      if (!res.ok) {
        // This will alert "File too large" or "Unauthorized" instead of a generic error
        throw new Error(data.message || "Server Error: " + res.statusText);
      }

      // Update Client Session
      await update({ role: selectedRole, name, image: imagePreview });

      router.refresh();
      if(selectedRole==='student')
      router.push("/dashboard");
      else if(selectedRole==='teacher') router.push('/teacherDashboard')

    } catch (error: any) {
      console.error(error);
      // Now the alert will tell you exactly what is wrong
      alert(error.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-3xl text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Welcome to ProTrack! 👋
        </h1>
        <p className="mt-4 text-lg text-gray-500 dark:text-zinc-400">
          Let's set up your profile and get you started.
        </p>

        <div className="mt-10 space-y-10">
          
          {/* --- SECTION 1: Personal Details --- */}
          <div className="rounded-3xl bg-white p-8 shadow-sm dark:bg-zinc-900/50 dark:border dark:border-zinc-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Profile Details</h2>
            
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
              
              {/* Image Upload */}
              <div className="relative group">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative h-24 w-24 cursor-pointer overflow-hidden rounded-full border-4 border-white shadow-lg transition-transform hover:scale-105 dark:border-zinc-800"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-zinc-800">
                      <User className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <p className="mt-2 text-xs text-gray-500">Tap to change</p>
              </div>

              {/* Name Input */}
              <div className="w-full max-w-xs text-left">
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                  placeholder="Enter your name"
                />
              </div>
            </div>
          </div>

          {/* --- SECTION 2: Role Selection --- */}
          <div>
            <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">I am a...</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              
              {/* Student Card */}
              <button
                onClick={() => setSelectedRole("student")}
                className={`group relative flex flex-col items-center rounded-2xl border-2 p-8 transition-all hover:scale-105 ${
                  selectedRole === "student"
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10"
                    : "border-gray-200 bg-white hover:border-emerald-200 dark:border-zinc-800 dark:bg-zinc-900"
                }`}
              >
                {selectedRole === "student" && (
                  <div className="absolute right-4 top-4 text-emerald-500">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                )}
                <div className="rounded-full bg-emerald-100 p-4 dark:bg-emerald-900/30">
                  <GraduationCap className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Student</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
                  I want to join classes and track my progress.
                </p>
              </button>

              {/* Teacher Card */}
              <button
                onClick={() => setSelectedRole("teacher")}
                className={`group relative flex flex-col items-center rounded-2xl border-2 p-8 transition-all hover:scale-105 ${
                  selectedRole === "teacher"
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10"
                    : "border-gray-200 bg-white hover:border-blue-200 dark:border-zinc-800 dark:bg-zinc-900"
                }`}
              >
                 {selectedRole === "teacher" && (
                  <div className="absolute right-4 top-4 text-blue-500">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                )}
                <div className="rounded-full bg-blue-100 p-4 dark:bg-blue-900/30">
                  <School className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Teacher</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
                  I want to create classes and manage students.
                </p>
              </button>
            </div>
          </div>

          {/* --- Submit Button --- */}
          <button
            onClick={handleSubmit}
            disabled={!selectedRole || !name.trim() || loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-zinc-900 sm:w-auto mx-auto"
          >
            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
            Complete Setup
          </button>

        </div>
      </div>
    </div>
  );
}