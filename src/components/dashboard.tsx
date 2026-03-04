'use client';

import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  BookOpen, 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  Quote,
  Mail
} from "lucide-react";

function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // --- 1. AUTHENTICATION LOGIC (Unchanged) ---
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
    // @ts-ignore
    if (status === 'authenticated' && session?.user?.role === 'pending') {
      router.replace('/onboarding');
    }
  }, [status, session, router]);

  // --- 2. TESTIMONIAL CAROUSEL LOGIC ---
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    { quote: "ProTrack completely changed how I manage my CS-302 capstone projects. It is an absolute lifesaver.", author: "Prof. Alan Turing", role: "Computer Science Dept." },
    { quote: "Finally, a tool where my team can report blockers before it's too late. Highly intuitive design.", author: "Sarah Mitchell", role: "Senior Student" },
    { quote: "The automated roster management and progress bars make tracking 100+ students effortless.", author: "Dr. R. Patel", role: "Engineering Faculty" },
    { quote: "Clean, distraction-free, and perfectly tailored for university workflows. I love using it daily.", author: "James K.", role: "Student" },
  ];

  // Auto-slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  // --- 3. UI DATA ---
  const features = [
    {
      title: "Real-Time Progress",
      description: "Monitor project milestones and identify blockers early to ensure every team stays on track without micromanaging.",
      icon: TrendingUp,
    },
    {
      title: "Seamless Groups",
      description: "Organize students into structured teams with designated Group Heads, creating clear accountability for submissions.",
      icon: Users,
    },
    {
      title: "Academic Hub",
      description: "Move beyond scattered emails. Access class rosters, assignments, and workspaces in one unified dashboard.",
      icon: BookOpen,
    },
    {
      title: "Secure & Role-Based",
      description: "Enterprise-grade role management ensures students stay focused while giving professors complete control.",
      icon: ShieldCheck,
    },
  ];

  if (status === 'loading') {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!session) return null;

  // --- 4. DASHBOARD UI ---
  return (
    // 'w-full overflow-hidden' ensures it never breaks the sidebar layout
    <div className="w-full overflow-hidden bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      
      {/* HERO SECTION */}
      <section className="relative flex flex-col items-center justify-center px-6 py-20 text-center md:py-32">
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[24px_24px]"></div>
        
        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="mx-auto inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-4 py-1.5 text-xs font-semibold text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 md:text-sm">
            <span className="mr-2 flex h-2 w-2 rounded-full bg-emerald-500"></span>
            The Standard for Academic Management
          </div>
          
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            A Unified Platform for <br className="hidden sm:block" />
            <span className="bg-linear-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Professors & Students
            </span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-base text-zinc-500 dark:text-zinc-400 md:text-lg">
            Bridge the gap between teaching and learning. ProTrack provides a formal, distraction-free environment to track class progress, manage groups, and achieve academic excellence.
          </p>
        </div>
      </section>

      {/* FEATURES SECTION (No Buttons) */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-16 border-t border-zinc-100 dark:border-zinc-900">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Designed for the Modern Classroom
          </h2>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">Everything you need to manage courses, minus the clutter.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group flex flex-col rounded-2xl border border-zinc-200 bg-zinc-50/50 p-6 transition-all hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-emerald-900"
            >
              <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-zinc-900 dark:text-white">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SLIDING TESTIMONIALS SECTION (Interval Carousel) */}
      <section className="bg-zinc-50 py-20 dark:bg-zinc-900/30">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-10 text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Trusted by Academic Leaders
          </h2>

          <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:p-12">
            <Quote className="mx-auto mb-6 h-8 w-8 text-emerald-500/30" />
            
            {/* Carousel Track */}
            <div 
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}
            >
              {testimonials.map((testimonial, idx) => (
                <div key={idx} className="w-full shrink-0 px-4">
                  <p className="mx-auto max-w-2xl text-lg font-medium italic text-zinc-700 dark:text-zinc-300 md:text-xl">
                    "{testimonial.quote}"
                  </p>
                  <div className="mt-8">
                    <h4 className="font-bold text-zinc-900 dark:text-white">{testimonial.author}</h4>
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Dots Indicator */}
            <div className="mt-8 flex justify-center gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTestimonial(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === activeTestimonial ? "w-6 bg-emerald-500" : "w-2 bg-zinc-300 dark:bg-zinc-700"
                  }`}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FORMAL FOOTER */}
      <footer className="border-t border-zinc-200 bg-white py-10 dark:border-zinc-900 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 text-center md:flex-row md:text-left">
          
          <div>
            <span className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">ProTrack.</span>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Setting the standard for academic management.
            </p>
          </div>

          <div className="flex flex-col items-center gap-2 md:items-end">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
              Designed & Developed by <br className="block sm:hidden" />
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Pranshu Singla</span> & <span className="font-bold text-emerald-600 dark:text-emerald-400">Vivek Jaiswal</span>
            </p>
            <a 
              href="mailto:contact@protrack.com" 
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-emerald-50 hover:text-emerald-600 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400"
            >
              <Mail className="h-3.5 w-3.5" />
              Contact us for improvements
            </a>
          </div>

        </div>
      </footer>

    </div>
  );
}

export default DashboardPage;