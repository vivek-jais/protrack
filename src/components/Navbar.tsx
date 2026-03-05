"use client";

import { Menu, X,Bell, Search, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { useSidebar } from "@/context/SidebarContext"; 
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function Navbar() {
  const {toggle,isOpen} = useSidebar();
  const router = useRouter(); 
  const user  = useSession().data?.user;
  

  console.log("current user :", user);
  

  return (
    <nav className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-zinc-200 bg-white/80 px-4 backdrop-blur-xl transition-all dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="flex items-center gap-4">
        <button
          onClick={toggle}
          className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          {isOpen ? (
            <X className="h-6 w-6 cursor-pointer" />
          ) : (
            <Menu className="h-6 w-6 cursor-pointer" />
          )}
        </button>
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="bg-linear-to-r from-zinc-800 to-zinc-600 bg-clip-text text-xl font-bold text-transparent dark:from-zinc-100 dark:to-zinc-400">
            ProTrack
          </span>
        </Link>
      </div>

      <div className="hidden max-w-md flex-1 md:flex">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search classes, projects..."
            className="h-10 w-full rounded-full border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm text-zinc-900 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-emerald-500/50"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
         
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Create</span>
        </button>

        <button className="relative rounded-full p-2.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-zinc-950"></span>
        </button>

        <button className="ml-1 h-9 w-9 overflow-hidden rounded-full ring-2 ring-transparent transition-all hover:ring-emerald-500/50">
          {user?.image ? (
            <Image
              src={user.image}
              alt="User avatar"
              width={36}
              height={36}
              className="h-full w-full object-cover rounded-full"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white">
              {user?.name?.[0] ?? "U"}
            </div>
          )}
        </button>
      </div>
    </nav>
  );
}