"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast, ToastContainer } from "react-toastify";
import { 
  Send, Loader2, FileText, UserCheck, BookOpen, 
  CheckCircle2, UploadCloud, Bot, GraduationCap, History
} from "lucide-react";
import { useTheme } from "next-themes"; // Useful if you need to force Toast theme

export default function ProfessorMentorPage() {
  const { data: session, status } = useSession();
  const { theme } = useTheme(); // Get current theme for ToastContainer
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- State ---
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // @ts-ignore
  const userId = session?.user?.id || "anonymous_student";
  const [threadId, setThreadId] = useState(`mentor_thread_${userId}`);

  // Context State
  const [resumeText, setResumeText] = useState("");
  const [resumeName, setResumeName] = useState("");
  const [srsText, setSrsText] = useState("");
  const [srsName, setSrsName] = useState("");

  // --- 1. INITIALIZATION: Load Local Storage & Chat History ---
  useEffect(() => {
    if (status === "loading") return; 

    const initializeState = async () => {
      const savedResumeText = localStorage.getItem('mentor_resumeText');
      const savedResumeName = localStorage.getItem('mentor_resumeName');
      const savedSrsText = localStorage.getItem('mentor_srsText');
      const savedSrsName = localStorage.getItem('mentor_srsName');

      if (savedResumeText) setResumeText(savedResumeText);
      if (savedResumeName) setResumeName(savedResumeName);
      if (savedSrsText) setSrsText(savedSrsText);
      if (savedSrsName) setSrsName(savedSrsName);

      if (userId !== "anonymous_student") {
        setThreadId(`mentor_thread_${userId}`);
        try {
          const res = await fetch(`/api/mentor/history?threadId=mentor_thread_${userId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.messages && data.messages.length > 0) {
              setMessages(data.messages);
            }
          }
        } catch (error) {
          console.error("Failed to load chat history:", error);
        }
      }
      setIsInitializing(false);
    };

    initializeState();
  }, [status, userId]);

  // --- Auto-scroll ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const studentProfile = {
    // @ts-ignore
    name: session?.user?.name || "Student",
    major: "Computer Science",
    skills: ["React", "Next.js", "MongoDB", "C++"]
  };

  // --- Handlers ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'resume' | 'srs') => {
    const file = e.target.files?.[0];
    if (!file) return;

    toast.info(`Extracting text from ${file.name}...`);
    
    setTimeout(() => {
      const simulatedText = `[Simulated extracted text from ${file.name}]`;
      
      if (type === 'resume') {
        setResumeText(simulatedText);
        setResumeName(file.name);
        localStorage.setItem('mentor_resumeText', simulatedText);
        localStorage.setItem('mentor_resumeName', file.name);
      }
      if (type === 'srs') {
        setSrsText(simulatedText);
        setSrsName(file.name);
        localStorage.setItem('mentor_srsText', simulatedText);
        localStorage.setItem('mentor_srsName', file.name);
      }
      toast.success(`${file.name} processed and saved!`);
    }, 1500);
  };

  const clearDocuments = () => {
      setResumeText("");
      setResumeName("");
      setSrsText("");
      setSrsName("");
      localStorage.removeItem('mentor_resumeText');
      localStorage.removeItem('mentor_resumeName');
      localStorage.removeItem('mentor_srsText');
      localStorage.removeItem('mentor_srsName');
      toast.info("Context documents cleared.");
  }

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    const newMessages = [...messages, { role: 'user', content: userMessage } as const];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mentor/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thread_id: threadId,
          message: userMessage,
          student_profile: studentProfile,
          project_context: srsText || null, 
          resume_context: resumeText || null 
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiResponse = data.response;
        
        const updatedMessages = [...newMessages, { role: 'assistant', content: aiResponse } as const];
        setMessages(updatedMessages);

        await fetch('/api/mentor/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                threadId: threadId,
                userId: userId,
                messages: updatedMessages
            })
        });

      } else {
        toast.error("Professor AI is currently unavailable.");
      }
    } catch (error) {
      toast.error("Network error reaching the AI server.");
    } finally {
      setLoading(false);
    }
  };

  if (isInitializing) {
      return (
        <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-[#09090b]">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-[#09090b] text-gray-900 dark:text-white p-6 font-sans flex flex-col lg:flex-row gap-6 transition-colors duration-200">
      <ToastContainer theme={theme === "dark" ? "dark" : "light"} />

      {/* LEFT COLUMN: CONTEXT & UPLOADS */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        
        {/* Header */}
        <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm transition-colors duration-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-emerald-600 dark:text-emerald-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Professor AI</h1>
              <p className="text-xs text-gray-500 dark:text-zinc-400">Your Personal Academic Mentor</p>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 flex-1 flex flex-col shadow-sm transition-colors duration-200">
          <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest">Mentor Context</h2>
              {(resumeText || srsText) && (
                  <button onClick={clearDocuments} className="text-xs text-gray-500 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                      Clear Context
                  </button>
              )}
          </div>

          <div className="space-y-6 flex-1">
            {/* Resume Upload */}
            <div className={`p-5 rounded-2xl border transition-colors duration-200 ${resumeText ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20' : 'bg-gray-50 dark:bg-[#09090b] border-gray-200 dark:border-zinc-800'}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <UserCheck className={`h-5 w-5 ${resumeText ? 'text-emerald-600 dark:text-emerald-500' : 'text-gray-400 dark:text-zinc-500'}`} />
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white">My Resume</h3>
                </div>
                {resumeText && <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />}
              </div>
              
              {!resumeText ? (
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-6 h-6 mb-2 text-gray-400 dark:text-zinc-500" />
                    <p className="text-xs text-gray-500 dark:text-zinc-500 font-medium">Click to upload PDF</p>
                  </div>
                  <input type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={(e) => handleFileUpload(e, 'resume')} />
                </label>
              ) : (
                <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-2">
                  <FileText className="h-3 w-3" /> {resumeName} loaded from storage
                </div>
              )}
            </div>

            {/* SRS Upload */}
            <div className={`p-5 rounded-2xl border transition-colors duration-200 ${srsText ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20' : 'bg-gray-50 dark:bg-[#09090b] border-gray-200 dark:border-zinc-800'}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className={`h-5 w-5 ${srsText ? 'text-emerald-600 dark:text-emerald-500' : 'text-gray-400 dark:text-zinc-500'}`} />
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white">Project SRS</h3>
                </div>
                {srsText && <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />}
              </div>
              
              {!srsText ? (
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-6 h-6 mb-2 text-gray-400 dark:text-zinc-500" />
                    <p className="text-xs text-gray-500 dark:text-zinc-500 font-medium">Click to upload SRS</p>
                  </div>
                  <input type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={(e) => handleFileUpload(e, 'srs')} />
                </label>
              ) : (
                <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-2">
                  <FileText className="h-3 w-3" /> {srsName} loaded from storage
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: CHAT INTERFACE */}
      <div className="w-full lg:w-2/3 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-zinc-800 rounded-3xl flex flex-col overflow-hidden shadow-sm transition-colors duration-200 h-[calc(100vh-6rem)]">
        
        {/* Chat Header */}
        <div className="p-5 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] flex items-center justify-between shrink-0 transition-colors duration-200">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 bg-gray-100 dark:bg-zinc-900 rounded-full border border-gray-200 dark:border-zinc-700 flex items-center justify-center">
                <Bot className="h-5 w-5 text-gray-500 dark:text-zinc-300" />
              </div>
              <span className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-500 border-2 border-white dark:border-[#18181b] rounded-full"></span>
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white text-sm">Professor Agent</h2>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400 font-medium">Online • Persistent Memory</p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gray-50/50 dark:bg-[#09090b]/50">
          {messages.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-center opacity-70 dark:opacity-50">
               <GraduationCap className="h-16 w-16 text-gray-400 dark:text-zinc-600 mb-4" />
               <h3 className="text-lg font-bold text-gray-900 dark:text-white">Office Hours are Open</h3>
               <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-sm mt-2">
                 Upload your documents on the left, then say hello to start your mentorship session.
               </p>
             </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-emerald-600 text-white rounded-br-sm' 
                      : 'bg-white dark:bg-[#18181b] border border-gray-200 dark:border-zinc-800 text-gray-800 dark:text-zinc-200 rounded-bl-sm'
                  }`}
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-zinc-800 rounded-2xl rounded-bl-sm p-4 flex items-center gap-3 shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-600 dark:text-emerald-500" />
                <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium">Professor is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white dark:bg-[#18181b] border-t border-gray-200 dark:border-zinc-800 shrink-0 transition-colors duration-200">
          <div className="relative flex items-center">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask for architectural advice, review your resume..."
              className="w-full bg-gray-50 dark:bg-[#09090b] border border-gray-300 dark:border-zinc-800 rounded-xl pl-4 pr-14 py-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 resize-none transition-colors"
              rows={1}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="absolute right-2 p-2.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-600 dark:disabled:hover:bg-emerald-500 text-white rounded-lg transition-colors"
            >
              <Send className="h-4 w-4 -ml-0.5 mt-0.5" />
            </button>
          </div>
           <div className="flex justify-between items-center mt-3 px-1">
             <p className="text-[10px] text-gray-500 dark:text-zinc-500">
                Context is saved locally. Chat history is saved to the database.
             </p>
             <button 
                onClick={() => {
                  setMessages([]);
                  toast.info("Cleared local view. (History remains in DB)");
                }}
                className="text-[10px] text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 flex items-center gap-1 transition-colors"
              >
               <History className="h-3 w-3"/> Clear Chat View
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}