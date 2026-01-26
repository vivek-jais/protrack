"use client";

import { useState, useEffect, useRef } from "react";
import { Send, User, MessageSquare, Loader2 } from "lucide-react";

type Teacher = {
  _id: string;
  name: string;
  email: string;
  image?: string;
};

type Message = {
  _id: string;
  sender: string;
  content: string;
  createdAt: string;
};

export default function ChatPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  // Ref for auto-scrolling to bottom
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Teachers on Load
  useEffect(() => {
    async function fetchTeachers() {
      try {
        const res = await fetch("/api/chat/users");
        if (res.ok) {
          const data = await res.json();
          setTeachers(data);
        }
      } catch (error) {
        console.error("Failed to load teachers", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTeachers();
  }, []);

  // 2. Poll for Messages (Every 3 seconds)
  useEffect(() => {
    if (!selectedTeacher) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat/messages?userId=${selectedTeacher._id}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (error) {
        console.error("Error fetching messages", error);
      }
    };

    // Initial fetch
    fetchMessages();

    // Poll every 3 seconds
    const interval = setInterval(fetchMessages, 3000);

    return () => clearInterval(interval);
  }, [selectedTeacher]);

  // 3. Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4. Send Message Handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTeacher) return;

    setSending(true);
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: selectedTeacher._id,
          content: newMessage,
        }),
      });

      if (res.ok) {
        const sentMsg = await res.json();
        setMessages((prev) => [...prev, sentMsg]); // Optimistic update
        setNewMessage("");
      }
    } catch (error) {
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50 dark:bg-zinc-950">
      
      {/* --- Sidebar: Teacher List --- */}
      <div className="w-80 border-r bg-white dark:bg-zinc-900 dark:border-zinc-800 flex flex-col">
        <div className="p-4 border-b dark:border-zinc-800">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Your Teachers
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {loading ? (
            <div className="flex justify-center p-4"><Loader2 className="animate-spin text-gray-400" /></div>
          ) : teachers.length === 0 ? (
             <p className="text-center text-sm text-gray-500 mt-4">No teachers found.</p>
          ) : (
            teachers.map((teacher) => (
              <button
                key={teacher._id}
                onClick={() => setSelectedTeacher(teacher)}
                className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors ${
                  selectedTeacher?._id === teacher._id
                    ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300"
                    : "hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300"
                }`}
              >
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center overflow-hidden">
                   {teacher.image ? (
                     <img src={teacher.image} alt={teacher.name} className="h-full w-full object-cover" />
                   ) : (
                     <User className="h-5 w-5 text-gray-400" />
                   )}
                </div>
                <div>
                  <p className="font-semibold">{teacher.name}</p>
                  <p className="text-xs text-gray-500 truncate">{teacher.email}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* --- Main Chat Area --- */}
      <div className="flex flex-1 flex-col bg-gray-50 dark:bg-zinc-950">
        {selectedTeacher ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 border-b bg-white px-6 py-3 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                 {selectedTeacher.image ? (
                     <img src={selectedTeacher.image} alt={selectedTeacher.name} className="h-10 w-10 rounded-full object-cover" />
                 ) : (
                   <span className="font-bold text-lg">{selectedTeacher.name[0]}</span>
                 )}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{selectedTeacher.name}</h3>
                <span className="flex items-center gap-1.5 text-xs text-emerald-500">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Online
                </span>
              </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-gray-400">
                  <MessageSquare className="h-12 w-12 mb-2 opacity-20" />
                  <p>Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => {
                   // Check if message is from ME (the logged in user)
                   // Note: You might need to adjust this logic depending on if 'sender' is an object or ID string.
                   // Usually the API returns sender ID string for simplicity here.
                   const isMe = msg.sender !== selectedTeacher._id; 
                   
                   return (
                    <div
                      key={msg._id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                          isMe
                            ? "bg-zinc-900 text-white dark:bg-emerald-600 rounded-br-none"
                            : "bg-white text-gray-800 dark:bg-zinc-800 dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-zinc-700"
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className={`mt-1 text-[10px] ${isMe ? "text-zinc-400 dark:text-emerald-200" : "text-gray-400"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t dark:bg-zinc-900 dark:border-zinc-800">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-2 focus:border-zinc-900 focus:outline-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </form>
            </div>

          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-gray-400">
            <MessageSquare className="h-16 w-16 mb-4 opacity-10" />
            <p className="text-lg">Select a teacher to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}