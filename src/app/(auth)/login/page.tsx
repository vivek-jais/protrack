"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, BookOpen, Sparkles } from "lucide-react";

function LoginForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (searchParams.get("error")) {
      setErrorMsg("Login failed. Please try again.");
      setIsLoggingIn(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // @ts-ignore
      const role = session.user.role; 

      if (role === "teacher") {
        router.push("/teacherDashboard");
      if (role === "teacher" || role === 'student') {
        router.push("/");
      } else {
        router.push('/onboarding');
      }
    }
  }, [status, session, router]);

  // Simple Login Handler
  const handleGoogleLogin = () => {
    setIsLoggingIn(true);
    signIn("google", { redirect: false });
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
         <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-50 dark:bg-zinc-950 p-4">
      
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute left-1/2 top-1/2 -z-10 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/20 opacity-50 blur-[100px] dark:bg-emerald-500/10"></div>
      <div className="absolute right-0 top-0 -z-10 h-[300px] w-[300px] rounded-full bg-teal-500/10 blur-[80px]"></div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/80 sm:p-10">
          
          {/* Header & Logo */}
          <div className="mb-10 flex flex-col items-center text-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-inner dark:bg-emerald-500/10 dark:text-emerald-400">
              <BookOpen className="h-8 w-8" />
            </div>
            <h2 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              ProTrack
            </h2>
            <p className="mt-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Your unified academic workspace. <br /> Sign in to continue.
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-6 animate-in zoom-in-95 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm font-medium text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
              {errorMsg}
            </div>
          )}

          {/* Login Action */}
          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="cursor-pointer group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl border border-zinc-300 bg-white px-4 py-3.5 text-sm font-bold text-zinc-700 shadow-sm transition-all hover:border-zinc-400 hover:bg-zinc-50 hover:shadow-md disabled:opacity-70 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
            >
              {isLoggingIn ? (
                <Loader2 className="h-5 w-5 animate-spin text-zinc-500 dark:text-zinc-400" />
              ) : (
                <>
                  <svg className="h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>
            
            <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
              Only university-affiliated accounts are permitted.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}