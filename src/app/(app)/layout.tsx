import { SidebarProvider } from "@/context/SidebarContext";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ChatPage from "@/components/ChatPage";
import { requireAuthenticatedSession } from "@/lib/requireAuthenticatedSession";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAuthenticatedSession();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-zinc-950">
        <Navbar />

        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-4 md:p-8">
            {children}
            <ChatPage />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}