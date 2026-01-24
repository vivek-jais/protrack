'use client';

import GoogleSignInButton from '@/components/googleSignIn';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const { data: session, status } = useSession();
  const router = useRouter();

  console.log(session);
  

  // Redirect if already logged in
  useEffect(() => {
    if (session) {
      router.replace('/');
    }
  }, [session, router]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-500">Checking session...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-zinc-900 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-800 p-8 shadow-lg">
        {/* Logo / Title */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome to Protrack
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to manage your projects efficiently
          </p>
        </div>

        {/* Google Sign In */}
        <div className="flex justify-center">
          <GoogleSignInButton />
        </div>

        {/* Footer text */}
        <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
