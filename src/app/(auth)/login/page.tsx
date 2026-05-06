"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Loader2, 
  BookOpen, 
  Shield, 
  Award, 
  GraduationCap, 
  AlertTriangle 
} from "lucide-react";

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
    <div className="flex min-h-screen w-full bg-white dark:bg-zinc-950">
      
      {/* ================= LEFT PANEL (INFO & BRANDING) ================= */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-emerald-900 p-12 lg:flex">
        
        {/* Dynamic Background Elements for Left Panel */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        <div className="absolute -left-20 -top-20 z-0 h-[500px] w-[500px] rounded-full bg-emerald-600/30 blur-[120px]"></div>
        <div className="absolute -bottom-40 -right-20 z-0 h-[600px] w-[600px] rounded-full bg-teal-500/20 blur-[100px]"></div>

        {/* Top: Logo & Institute Name */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md shadow-inner border border-white/20">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white leading-tight">ProTrack</h1>
            <p className="text-xs font-medium tracking-widest text-emerald-300 uppercase">NIT Delhi</p>
          </div>
        </div>

        {/* Middle: Headline, Subtitle, & Feature Cards */}
        <div className="relative z-10 my-auto py-12">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-xs font-bold tracking-wider text-emerald-100 uppercase">Academic Year 2024–25</span>
          </div>

          {/* Headline */}
          <h2 className="text-5xl font-extrabold tracking-tight text-white mb-2 leading-tight">
            Project <br /> Management <br />
            <span className="text-amber-400">Redefined</span>
          </h2>
          
          <p className="mt-6 max-w-md text-base leading-relaxed text-emerald-100/90">
            Secure stage-wise evaluation, certificate generation, and academic analytics — built exclusively for NIT Delhi.
          </p>

          {/* Feature Grid */}
          <div className="mt-12 grid grid-cols-2 gap-4 max-w-lg">
            
            <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-colors hover:bg-white/10">
              <Shield className="h-5 w-5 text-emerald-300" />
              <div>
                <h3 className="text-sm font-bold text-white">Domain Restricted</h3>
                <p className="text-xs text-emerald-200 mt-0.5">@nitdelhi.ac.in only</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-colors hover:bg-white/10">
              <BookOpen className="h-5 w-5 text-emerald-300" />
              <div>
                <h3 className="text-sm font-bold text-white">Stage-wise Eval</h3>
                <p className="text-xs text-emerald-200 mt-0.5">4 structured stages</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-colors hover:bg-white/10">
              <Award className="h-5 w-5 text-emerald-300" />
              <div>
                <h3 className="text-sm font-bold text-white">Certificates</h3>
                <p className="text-xs text-emerald-200 mt-0.5">Auto-generated PDFs</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-colors hover:bg-white/10">
              <GraduationCap className="h-5 w-5 text-emerald-300" />
              <div>
                <h3 className="text-sm font-bold text-white">Professor Control</h3>
                <p className="text-xs text-emerald-200 mt-0.5">Full class management</p>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom: Footer Address */}
        <div className="relative z-10 text-xs text-emerald-300/60 font-medium">
          National Institute of Technology Delhi • Sector A-7, Dwarka, New Delhi 110077
        </div>
      </div>

      {/* ================= RIGHT PANEL (LOGIN FORM) ================= */}
      <div className="relative flex w-full flex-col items-center justify-center p-8 lg:w-1/2">
        
        {/* Mobile-only header (hidden on desktop since left panel handles it) */}
        <div className="absolute top-8 left-8 flex items-center gap-3 lg:hidden">
           <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-zinc-900 dark:text-white">ProTrack</span>
        </div>

        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white">Sign in</h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Use your <span className="font-semibold text-emerald-600 dark:text-emerald-500">@nitdelhi.ac.in</span> Google account.
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
              {errorMsg}
            </div>
          )}

          <div className="space-y-6">
            
            {/* Google Sign-in Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl border border-zinc-300 bg-white px-4 py-3.5 text-sm font-bold text-zinc-700 shadow-sm transition-all hover:border-zinc-400 hover:bg-zinc-50 hover:shadow-md disabled:opacity-70 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
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

            {/* Access Warning Box */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-500 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider mb-1">
                    Access Restricted
                  </h3>
                  <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-500/80">
                    This platform is exclusively for NIT Delhi. Student roll numbers <strong>241210000–241210138</strong> are authorized.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Note */}
            <div className="text-center text-xs text-zinc-500 dark:text-zinc-500 pt-4">
              Professors use their institute Google account. <br />
              Contact your administrator for professor access.
            </div>

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