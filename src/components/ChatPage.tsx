"use client";

import { useState, useEffect, useRef } from "react";
import { Send, User, MessageSquare, Loader2, X, MessageCircle } from "lucide-react";

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
  const [isOpen, setIsOpen] = useState(false);
  
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
    <div>
      {/* Floating Chat Widget Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 transition-all hover:scale-110"
        title={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat Popup Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-96 h-[600px] bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border dark:border-zinc-800 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b bg-emerald-600 dark:bg-emerald-700 text-white px-4 py-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <span className="font-semibold">Chat</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-1 rounded transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Teachers Sidebar */}
            <div className="w-32 border-r bg-gray-50 dark:bg-zinc-800 dark:border-zinc-700 overflow-y-auto">
              <div className="p-2 space-y-1">
                {loading ? (
                  <div className="flex justify-center p-2">
                    <Loader2 className="animate-spin h-4 w-4 text-gray-400" />
                  </div>
                ) : teachers.length === 0 ? (
                  <p className="text-xs text-center text-gray-500 mt-2">No teachers</p>
                ) : (
                  teachers.map((teacher) => (
                    <button
                      key={teacher._id}
                      onClick={() => setSelectedTeacher(teacher)}
                      className={`flex w-full items-center gap-2 rounded-lg p-2 text-xs transition-colors ${
                        selectedTeacher?._id === teacher._id
                          ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : "hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-zinc-600 flex-shrink-0 flex items-center justify-center overflow-hidden text-xs font-semibold">
                        {teacher.image ? (
                          <img src={teacher.image} alt={teacher.name} className="h-full w-full object-cover" />
                        ) : (
                          teacher.name[0]
                        )}
                      </div>
                      <span className="truncate">{teacher.name.split(" ")[0]}</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedTeacher ? (
                <>
                  {/* Chat Header */}
                  <div className="flex items-center gap-2 border-b bg-white dark:bg-zinc-800 px-3 py-2 dark:border-zinc-700">
                    <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-emerald-600 dark:text-emerald-400 overflow-hidden">
                      {selectedTeacher.image ? (
                        <img src={selectedTeacher.image} alt={selectedTeacher.name} className="h-full w-full object-cover" />
                      ) : (
                        selectedTeacher.name[0]
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{selectedTeacher.name}</p>
                      <p className="text-xs text-emerald-500">Online</p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {messages.length === 0 ? (
                      <div className="flex h-full flex-col items-center justify-center text-gray-400 text-xs">
                        <MessageSquare className="h-6 w-6 mb-1 opacity-20" />
                        <p>Start chatting!</p>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isMe = msg.sender !== selectedTeacher._id;
                        return (
                          <div
                            key={msg._id}
                            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[75%] rounded-lg px-3 py-1 text-xs shadow-sm ${
                                isMe
                                  ? "bg-emerald-600 text-white rounded-br-none"
                                  : "bg-gray-100 text-gray-800 dark:bg-zinc-700 dark:text-gray-100 rounded-bl-none"
                              }`}
                            >
                              <p>{msg.content}</p>
                              <p className={`mt-0.5 text-[9px] ${isMe ? "text-emerald-200" : "text-gray-500 dark:text-gray-400"}`}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-2 border-t bg-white dark:bg-zinc-800 dark:border-zinc-700">
                    <form onSubmit={handleSendMessage} className="flex gap-1">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Message..."
                        className="flex-1 rounded-full border border-gray-300 bg-gray-50 px-3 py-1 text-xs focus:border-emerald-500 focus:outline-none dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                      >
                        {sending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center text-gray-400 text-xs px-3">
                  <MessageSquare className="h-8 w-8 mb-2 opacity-20" />
                  <p>Select a teacher</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}