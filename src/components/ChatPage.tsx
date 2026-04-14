"use client";

import { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, Loader2, X, MessageCircle, MoreVertical, Phone, Video, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type UserType = {
  _id: string;
  name: string;
  email: string;
  image?: string;
  lastActive?: string;
};

type Message = {
  _id: string;
  sender: string;
  content: string;
  createdAt: string;
};

export default function ChatPage() {
  const [teachers, setTeachers] = useState<UserType[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<UserType | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Ref for auto-scrolling to bottom
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper to check if online (active in last 2 minutes)
  const isOnline = (lastActive?: string) => {
    if (!lastActive) return false;
    const date = new Date(lastActive);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / 1000 / 60;
    return diffInMinutes < 2;
  };

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
        console.error("Failed to load users", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTeachers();
  }, []); // Run once on mount

  // 2. Poll for Messages (Every 3 seconds) AND Refresh User Status
  useEffect(() => {
    if (!isOpen) return;

    const fetchMessagesAndUsers = async () => {
      // Refresh Users for Online Status
      try {
        const resUsers = await fetch("/api/chat/users");
        if (resUsers.ok) {
          const data = await resUsers.json();
          setTeachers(data);
        }
      } catch (error) {
        console.error("Failed to refresh users", error);
      }

      if (selectedTeacher) {
        try {
          const res = await fetch(`/api/chat/messages?userId=${selectedTeacher._id}`);
          if (res.ok) {
            const data = await res.json();
            setMessages(data);
          }
        } catch (error) {
          console.error("Error fetching messages", error);
        }
      }
    };

    // Initial fetch
    fetchMessagesAndUsers();

    // Poll every 3 seconds
    const interval = setInterval(fetchMessagesAndUsers, 3000);

    return () => clearInterval(interval);
  }, [selectedTeacher, isOpen]);

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
    <>
      {/* Floating Chat Widget Button - Only visible when closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 hover:scale-105 transition-all duration-300"
          title="Open chat"
        >
          <MessageCircle className="h-7 w-7" />
          {/* Optional: Add notification dot here if needed */}
        </button>
      )}

      {/* Side Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Side Drawer Container */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] bg-white dark:bg-zinc-900 shadow-2xl transform transition-transform duration-300 ease-out border-l dark:border-zinc-800 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >

        {/* TOP HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-zinc-800 bg-white dark:bg-zinc-900">
          {selectedTeacher ? (
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedTeacher(null)} className="mr-1 hover:bg-gray-100 p-1 rounded-full dark:hover:bg-zinc-800">
                <X className="h-5 w-5 text-gray-500" />
              </button>
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-zinc-700 overflow-hidden">
                  {selectedTeacher.image ? (
                    <img src={selectedTeacher.image} alt={selectedTeacher.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-lg font-semibold text-gray-500">
                      {selectedTeacher.name[0]}
                    </div>
                  )}
                </div>
                {isOnline(selectedTeacher.lastActive) && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-zinc-900"></span>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{selectedTeacher.name}</h3>
                <p className="text-xs text-gray-500">
                  {isOnline(selectedTeacher.lastActive) ? (
                    <span className="text-green-500 font-medium">Active now</span>
                  ) : (
                    selectedTeacher.lastActive ? `Active ${formatDistanceToNow(new Date(selectedTeacher.lastActive))} ago` : 'Offline'
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Messages</h2>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-emerald-900 dark:text-emerald-300">
                {teachers.length} Contacts
              </span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <button onClick={() => setIsOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full dark:hover:bg-zinc-800 transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 overflow-hidden relative">
          {!selectedTeacher ? (
            // LIST OF USERS
            <div className="h-full overflow-y-auto px-2">
              <div className="p-4">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                  />
                </div>

                {loading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="animate-spin h-8 w-8 text-emerald-500" />
                  </div>
                ) : teachers.length === 0 ? (
                  <div className="text-center text-gray-500 mt-10">
                    <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p>No contacts found</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {teachers.map((teacher) => (
                      <button
                        key={teacher._id}
                        onClick={() => setSelectedTeacher(teacher)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-all duration-200 group"
                      >
                        <div className="relative">
                          <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center text-lg font-semibold text-gray-600 dark:text-gray-300 overflow-hidden ring-2 ring-transparent group-hover:ring-emerald-100 dark:group-hover:ring-emerald-900 transition-all">
                            {teacher.image ? (
                              <img src={teacher.image} alt={teacher.name} className="h-full w-full object-cover" />
                            ) : (
                              teacher.name[0]
                            )}
                          </div>
                          {isOnline(teacher.lastActive) && (
                            <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white dark:border-zinc-900"></span>
                          )}
                        </div>

                        <div className="flex-1 text-left">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{teacher.name}</h4>
                          <p className="text-xs text-gray-500 truncate dark:text-gray-400">
                            {isOnline(teacher.lastActive) ? 'Online' : 'Offline'}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // CHAT MESSAGES AREA
            <div className="flex flex-col h-full bg-gray-50/50 dark:bg-zinc-900/50">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-50">
                    <MessageSquare className="h-16 w-16 text-gray-300 mb-3" />
                    <p className="text-gray-500 text-sm">No messages yet. Start the conversation!</p>
                    <p className="text-gray-400 text-xs mt-1">Say hello to {selectedTeacher.name}</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.sender !== selectedTeacher._id;
                    const showAvatar = !isMe && (idx === 0 || messages[idx - 1].sender !== selectedTeacher._id);

                    return (
                      <div key={msg._id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                        {!isMe && (
                          <div className="w-8 mr-2 flex-shrink-0">
                            {showAvatar && (
                              <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
                                {selectedTeacher.image ? (
                                  <img src={selectedTeacher.image} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-xs font-bold">{selectedTeacher.name[0]}</div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        <div className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm text-sm ${isMe
                          ? 'bg-emerald-600 text-white rounded-br-none'
                          : 'bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-zinc-700'
                          }`}>
                          <p>{msg.content}</p>
                          <p className={`text-[10px] mt-1 text-right w-full ${isMe ? 'text-emerald-200' : 'text-gray-400'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* MESSAGE INPUT */}
              <div className="p-4 bg-white dark:bg-zinc-900 border-t dark:border-zinc-800">
                <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                  <button type="button" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full py-2.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-zinc-800 transition-all text-sm dark:text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="h-10 w-10 flex items-center justify-center rounded-full bg-emerald-600 text-white shadow-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 ml-0.5" />}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}