import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionWrapping from "@/lib/sessionWrapping";
import { SidebarProvider } from "@/context/SidebarContext";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
// import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Protrack",
  description: "Project Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
     <SessionWrapping>
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-gray-100`}>
       
      <SidebarProvider>
      <div className="flex min-h-screen flex-col">
     

        <div className="flex flex-1">
      
         

          {/*Main Content */}
          <main className="flex-1 p-6 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
   
      </body>
    </html>
     </SessionWrapping>
  );
}