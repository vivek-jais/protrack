"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSidebar } from "@/context/SidebarContext";
import { 
  LayoutDashboard, 
  BookOpen, 
  FolderGit2, 
  Bot, 
  Settings, 
  Moon, 
  Sun,
  LogOut,
  FileText,     
  PlusCircle, Bug
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";

export default function Sidebar() {
  const { isOpen } = useSidebar(); 
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();

  // @ts-ignore 
  const role = session?.user?.role || "student"; 

  const studentRoutes = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Classes", href: "/dashboard/classes", icon: BookOpen },
    { label: "My Projects", href: "/dashboard/projects", icon: FolderGit2 },
    { label: "My Submissions", href: "/dashboard/submissions", icon: FileText }, 
    { label: "AI Assistant", href: "/dashboard/mentor", icon: Bot, isSpecial: true }, 
    {label:"All Hackathons",href:"/dashboard/hackathons",icon:Bug},
    { label: "Settings", href: "/dashboard/settings", icon: Settings }
    
  ];

  const teacherRoutes = [
    { label: "Dashboard", href: "/teacherDashboard", icon: LayoutDashboard },
    { label: "My Classes", href: "/dashboard/classes", icon: BookOpen },
    { label: "All Projects", href: "/projects", icon: FolderGit2 },
    { label: "Create Project", href: "/teacherDashboard/project/createProject", icon: PlusCircle }, // 🔥 Easy access for teachers
    { label: "AI Assistant", href: "/dashboard/assistant", icon: Bot, isSpecial: true }, 
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const routes = role === "teacher" ? teacherRoutes : studentRoutes;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <aside 
      className={`
        ${isOpen ? "flex" : "hidden"} 
        sticky top-16 h-[calc(100vh-64px)] w-64 flex-col border-r border-gray-200 bg-white 
        transition-all duration-300 
        dark:bg-zinc-950 dark:border-zinc-800
      `}
    >
      
      <div className="flex-1 space-y-1 p-4 overflow-y-auto">
        {routes.map((route) => {
          // Check if the current URL starts with the route href to keep it highlighted when inside sub-pages
          const isActive = pathname === route.href || (pathname.startsWith(route.href) && route.href !== '/dashboard' && route.href !== '/teacherDashboard');
          
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

      <div className="border-t border-gray-200 p-4 dark:border-zinc-800 shrink-0">
        

        <Link 
          href={'/signOut'}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="h-5 w-5"  />
          Sign Out
        </Link>
      </div>
    </aside>
  );
}