"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { 
  LayoutDashboard, 
  BookOpen, 
  FolderGit2, 
  MessageSquare, 
  Bot, 
  Settings, 
  Moon, 
  Sun,
  LogOut
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";

const routes = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Classes", href: "/classes", icon: BookOpen },
  { label: "Projects", href: "/projects", icon: FolderGit2 },
  // { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "AI Assistant", href: "/assistant", icon: Bot, isSpecial: true }, 
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const { isOpen } = useSidebar(); // Get the state
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <aside 
      className={`
        ${isOpen ? "flex" : "hidden"} /* <-- THE TOGGLE LOGIC */
        sticky top-16 h-[calc(100vh-64px)] w-64 flex-col border-r border-gray-200 bg-white 
        transition-all duration-300 
        dark:bg-zinc-950 dark:border-zinc-800
      `}
    >
      
      <div className="flex-1 space-y-1 p-4">
        {routes.map((route) => {
          const isActive = pathname === route.href;
          return (
            <Link
              key={route.href}
              href={route.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 
                ${isActive 
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" 
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800 dark:hover:text-gray-100"
                }
                ${route.isSpecial && !isActive ? "text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20" : ""}
              `}
            >
              <route.icon className={`h-5 w-5 ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-gray-200"}`} />
              {route.label}
            </Link>
          );
        })}
      </div>

      <div className="border-t border-gray-200 p-4 dark:border-zinc-800">
        
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="mb-2 flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800"
        >
          <span className="flex items-center gap-3">
             {mounted && theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
             {mounted && theme === 'dark' ? "Dark Mode" : "Light Mode"}
          </span>
        </button>

        <button 
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10">
          <LogOut className="h-5 w-5"  />
          Sign Out
        </button>
      </div>
    </aside>
  );
}