"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { 
  ArrowRight, Shield, Layers, Users, BarChart, 
  Award, CheckCircle, GraduationCap, Loader2,
  Lightbulb, FileText, Presentation, FileCheck, ChevronRight
} from "lucide-react";

export default function DetailedLandingPage() {
  const { data: session, status } = useSession();

  // Show a loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  const isAuthenticated = status === "authenticated";
  const firstName = session?.user?.name?.split(" ")[0] || "Student";

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full bg-white dark:bg-zinc-950 overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-emerald-50/50 to-white dark:from-emerald-900/10 dark:to-zinc-950 z-0"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        
        {/* ================= 1. HERO SECTION ================= */}
        <div className="text-center max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-1.5 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-900/20">
            <GraduationCap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold tracking-widest text-emerald-700 dark:text-emerald-400 uppercase">
              Official Platform • NIT Delhi
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.15] mb-6">
            The Complete Lifecycle for <br />
            <span className="text-emerald-600 dark:text-emerald-400">Academic Engineering Projects</span>
          </h1>

          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            ProTrack eliminates the chaos of WhatsApp groups and lost emails. It provides a secure, structured, and professor-controlled environment for submitting, evaluating, and certifying mini-projects.
          </p>

          {/* DYNAMIC CALL TO ACTION */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                <div className="text-left">
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">Welcome back, {firstName}!</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">You are securely signed in.</p>
                </div>
                <Link 
                  href="/dashboard/projects" 
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-emerald-700 hover:shadow-lg hover:-translate-y-0.5"
                >
                  Enter Workspace <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-3.5 text-base font-bold text-white shadow-md transition-all hover:bg-emerald-700 hover:shadow-lg hover:-translate-y-0.5"
                >
                  Sign in with NIT Delhi Account <ArrowRight className="h-4 w-4" />
                </Link>
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  <Shield className="h-4 w-4 text-emerald-500" /> Domain Restricted (@nitdelhi.ac.in)
                </div>
              </>
            )}
          </div>
        </div>

        {/* ================= 2. HOW IT WORKS (THE ACADEMIC WORKFLOW) ================= */}
        <div className="mt-24 md:mt-32 pt-16 border-t border-zinc-100 dark:border-zinc-800/50">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white">Structured from Idea to Final Delivery</h2>
            <p className="mt-4 text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
              Our 4-stage academic pipeline ensures students get continuous feedback and professors can monitor progress without the administrative overhead.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Desktop Connector Line */}
            <div className="hidden md:block absolute top-12 left-1/8 right-1/8 h-0.5 bg-zinc-200 dark:bg-zinc-800 z-0"></div>

            {/* Stage 1 */}
            <div className="relative z-10 bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm text-center flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 ring-4 ring-white dark:ring-zinc-950">
                <Lightbulb className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Stage 1: Idea</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Form a group, lock in your team members, and submit your initial project concept for professor approval.
              </p>
            </div>

            {/* Stage 2 */}
            <div className="relative z-10 bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm text-center flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 ring-4 ring-white dark:ring-zinc-950">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Stage 2: Proposal</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Submit detailed SRS documents, architectural diagrams, and tech stack choices for architectural review.
              </p>
            </div>

            {/* Stage 3 */}
            <div className="relative z-10 bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm text-center flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 ring-4 ring-white dark:ring-zinc-950">
                <Presentation className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Stage 3: Mid-Review</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Upload half-completed progress reports, initial code bases, and receive mid-semester grading.
              </p>
            </div>

            {/* Stage 4 */}
            <div className="relative z-10 bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm text-center flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 ring-4 ring-white dark:ring-zinc-950">
                <FileCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Stage 4: Final</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Final code submission, live presentation grading, and automatic certificate generation upon completion.
              </p>
            </div>
          </div>
        </div>

        {/* ================= 3. DETAILED FEATURES GRID ================= */}
        <div className="mt-24 md:mt-32 pt-16 border-t border-zinc-100 dark:border-zinc-800/50">
          <div className="mb-12">
            <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white mb-4">Platform Capabilities</h2>
            <p className="text-zinc-500 dark:text-zinc-400">Designed to handle the complexities of university-level team projects.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Secure Roll Number Verification</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  The system automatically verifies Google Auth logins against the official NIT Delhi student database (Roll Numbers 241210000–241210138), preventing unauthorized access.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Smart Team Builder</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Students can invite peers to form groups within professor-defined size limits. Once a group is full, the workspace locks to prevent unauthorized modifications.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                <Layers className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Centralized Submission Hub</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Upload PDFs, code files, and presentations directly to your group's workspace. View a complete timeline of your uploads and teacher feedback in one place.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Teacher Evaluation Portal</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Professors get a dedicated dashboard to view all groups, download submissions, assign marks out of the stage maximum, and leave constructive text feedback.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                <BarChart className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Analytics & Export</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Teachers can track class progress at a glance and export all grades to Excel with a single click at the end of the semester for official university records.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Automated Certificates</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Upon clearing the final stage, the system dynamically generates a customized PDF completion certificate featuring a unique verifiable ID and QR code.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* ================= 4. BOTTOM CTA ================= */}
        {!isAuthenticated && (
          <div className="mt-24 md:mt-32 rounded-3xl bg-zinc-900 dark:bg-zinc-900 border border-zinc-800 px-6 py-16 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-emerald-500/10 mix-blend-overlay"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-extrabold mb-4">Start managing your projects today.</h2>
              <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
                Join the rest of the Computer Science department on ProTrack. Use your official NIT Delhi credentials to log in.
              </p>
              <Link
                href="/login" 
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:bg-emerald-400 hover:-translate-y-1"
              >
                Sign In to ProTrack <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}