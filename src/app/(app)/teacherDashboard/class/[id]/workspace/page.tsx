"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  Megaphone, FileText, Video, Link as LinkIcon, 
  Send, Loader2, ExternalLink 
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";

export default function ClassWorkspaceStream() {
  const params = useParams();
  const classId = params.id;
  const { data: session } = useSession();
  
  // @ts-ignore
  const isTeacher = session?.user?.role === "teacher";

  const [resources, setResources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("announcement");
  const [url, setUrl] = useState("");

  const fetchResources = async () => {
    try {
      const res = await fetch(`/api/class/${classId}/resources`);
      const data = await res.json();
      if (res.ok) setResources(data.resources || []);
    } catch (error) {
      toast.error("Failed to load stream.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (classId) fetchResources();
  }, [classId]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Title is required!");

    setIsPosting(true);
    try {
      const res = await fetch(`/api/class/${classId}/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, type, url }),
      });

      if (res.ok) {
        toast.success("Posted successfully!");
        setTitle(""); setContent(""); setUrl(""); setType("announcement");
        fetchResources(); // Refresh the feed
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to post");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsPosting(false);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "video": return <Video className="h-5 w-5 text-red-500" />;
      case "note": return <FileText className="h-5 w-5 text-blue-500" />;
      case "link": return <LinkIcon className="h-5 w-5 text-purple-500" />;
      default: return <Megaphone className="h-5 w-5 text-emerald-500" />;
    }
  };

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <ToastContainer />
      
      {/* 🧑‍🏫 TEACHER ONLY: Create Post Box */}
      {isTeacher && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-zinc-400" /> Share with your class
          </h2>
          <form onSubmit={handlePost} className="space-y-4">
            
            <div className="flex gap-4">
              <select 
                value={type} onChange={(e) => setType(e.target.value)}
                className="rounded-xl border border-zinc-300 bg-zinc-50 p-3 text-sm outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
              >
                <option value="announcement">Announcement</option>
                <option value="note">Notes / Document</option>
                <option value="video">Video Lecture</option>
                <option value="link">External Link</option>
              </select>
              
              <input 
                type="text" placeholder="Title (e.g. Midterm Grades Posted)" required
                value={title} onChange={(e) => setTitle(e.target.value)}
                className="flex-1 rounded-xl border border-zinc-300 bg-zinc-50 p-3 text-sm outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
              />
            </div>

            <textarea 
              rows={3} placeholder="Add details, instructions, or descriptions..."
              value={content} onChange={(e) => setContent(e.target.value)}
              className="w-full resize-none rounded-xl border border-zinc-300 bg-zinc-50 p-3 text-sm outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
            />

            {(type === "video" || type === "link" || type === "note") && (
              <input 
                type="url" placeholder="Attach URL (e.g. YouTube link or Google Drive link)"
                value={url} onChange={(e) => setUrl(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-zinc-50 p-3 text-sm outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
              />
            )}

            <div className="flex justify-end pt-2">
              <button 
                type="submit" disabled={isPosting}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-70"
              >
                {isPosting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Post to Class
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 📚 THE CLASS STREAM (Visible to both Teacher and Student) */}
      <div className="space-y-6">
        {resources.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <p className="text-zinc-500 font-medium">No materials have been posted to this class yet.</p>
          </div>
        ) : (
          resources.map((res) => (
            <div key={res._id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-all">
              <div className="flex items-start gap-4">
                
                {/* Icon based on Type */}
                <div className="mt-1 h-10 w-10 shrink-0 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center border border-zinc-100 dark:border-zinc-700">
                  {getIconForType(res.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{res.title}</h3>
                    <span className="text-xs font-medium text-zinc-400">
                      {new Date(res.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">
                    Posted by Prof. {res.teacherId?.name || "Teacher"}
                  </p>
                  
                  {res.content && (
                    <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4 whitespace-pre-wrap">
                      {res.content}
                    </div>
                  )}

                  {/* Attachment Link */}
                  {res.url && (
                    <a 
                      href={res.url} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" /> Open Attachment
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}