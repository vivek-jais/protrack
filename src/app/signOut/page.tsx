"use client";

import React, { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { LogOut, ArrowLeft, Loader2 } from "lucide-react";
import { getServerSession } from "next-auth";

export default function SignOutPage() {
  const router = useRouter();
  const {data:session}=useSession()
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    // Signs the user out and sends them back to the login page
    await signOut({ callbackUrl: "/login" });
  };

  const handleCancel = () => {
    // Sends the user back to whatever page they were just on
    router.back();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm animate-in fade-in zoom-in-95 space-y-6 rounded-3xl bg-white p-8 text-center shadow-xl duration-300 dark:bg-zinc-900">
        
        {/* Animated Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
          <LogOut className="h-10 w-10 text-red-500" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Sign Out
          </h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            {/* @ts-ignore */}
            Are you sure you want to sign out of your account Mr. {session?.user?.name}? You will need to log back in to access your classes.
          </p>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex flex-col gap-3">
          {/* YES Button */}
          <button
            onClick={handleSignOut}
            disabled={isLoading}
            className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 py-3.5 text-sm font-bold text-white transition-all hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-70 dark:focus:ring-offset-zinc-900"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Yes, Sign Out"
            )}
          </button>

          {/* NO Button */}
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 py-3.5 text-sm font-bold text-gray-900 transition-all hover:bg-gray-200 disabled:opacity-70 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
          >
            <ArrowLeft className="h-4 w-4" />
            No, Keep Me Logged In
          </button>
        </div>

      </div>
    </div>
  );
}