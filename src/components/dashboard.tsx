'use client';

import { useSession } from 'next-auth/react';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from "lucide-react";

function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // 1. If NOT logged in -> Go to Login
    if (status === 'unauthenticated') {
      router.replace('/login');
    }

    // 2. If Logged in BUT role is "pending" -> Go to Onboarding
    // (This prevents new users from skipping the role selection)
    // @ts-ignore
    if (status === 'authenticated' && session?.user?.role === 'pending') {
      router.replace('/onboarding');
    }
  }, [status, session, router]);

  // 3. Show Loader while NextAuth checks if you are logged in
  if (status === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  // 4. Safety check: If no session exists yet, render nothing (prevents flashing)
  if (!session) return null;

  // 5. Render your actual Dashboard UI here
  return (
    <>
    </>
  );
}

export default DashboardPage;