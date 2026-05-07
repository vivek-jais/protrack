"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Bell, Clock, Megaphone, CheckCircle2, FileText, Video, Link as LinkIcon, Check } from "lucide-react";
import { pusherClient } from "@/lib/pusherClient";

export default function NotificationBell({ classIds = [] }: { classIds?: string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [lastReadId, setLastReadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchRealNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/student/announcements");
      if (res.ok) {
        const data = await res.json();
        const fetchedAnnouncements = (data.announcements || []).slice();
        fetchedAnnouncements.sort((a: any, b: any) => {
          const aDate = new Date(a.createdAt).getTime();
          const bDate = new Date(b.createdAt).getTime();
          return bDate - aDate;
        });
        setNotifications(fetchedAnnouncements);

        if (fetchedAnnouncements.length > 0) {
          const latestMessageId = fetchedAnnouncements[0]._id;
          const storedLastReadId = typeof window !== "undefined" ? localStorage.getItem("lastReadNotificationId") : null;
          setLastReadId(storedLastReadId);
          setHasUnread(latestMessageId !== storedLastReadId);
        } else {
          setLastReadId(null);
          setHasUnread(false);
        }
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  // 1. Initial Fetch on page load
  useEffect(() => {
    fetchRealNotifications();
  }, []);

  // 2. 🔥 REAL-TIME PUSHER LISTENER (With SSR Safeguards)
  useEffect(() => {
    const client = pusherClient;
    if (!client || classIds.length === 0) return;

    classIds.forEach((classId) => {
      const channelName = `class-${classId}`;
      const channel = client.channel(channelName) || client.subscribe(channelName);

      channel.bind("new-announcement", () => {
        setHasUnread(true);
        fetchRealNotifications();
      });
    });

    return () => {
      if (!client) return;
      classIds.forEach((classId) => {
        client.unsubscribe(`class-${classId}`);
      });
    };
  }, [classIds]);

  // 3. Close dropdown if user clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = useMemo(() => {
    if (!notifications.length) return 0;
    if (!lastReadId) return notifications.length;
    const index = notifications.findIndex((notification) => notification._id === lastReadId);
    return index === -1 ? notifications.length : index;
  }, [notifications, lastReadId]);

  // Mark as read and save to LocalStorage
  const markAllAsRead = () => {
    setHasUnread(false);
    if (notifications.length > 0) {
      const latestId = notifications[0]._id;
      localStorage.setItem("lastReadNotificationId", latestId);
      setLastReadId(latestId);
    }
  };

  // Safe toggle function
  const handleToggleDropdown = () => {
    if (!isOpen) {
      markAllAsRead();
    }
    setIsOpen((prev) => !prev);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="h-4 w-4 text-red-500" />;
      case "note": return <FileText className="h-4 w-4 text-blue-500" />;
      case "link": return <LinkIcon className="h-4 w-4 text-purple-500" />;
      case "project": return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      default: return <Megaphone className="h-4 w-4 text-emerald-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;
    
    if (diffInHours < 24) return "Today";
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* THE BELL BUTTON */}
      <button 
        onClick={handleToggleDropdown}
        className="relative rounded-full p-2.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        aria-label="Toggle notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white ring-2 ring-white dark:ring-zinc-950">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* THE DROPDOWN PANEL */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 overflow-hidden origin-top-right animate-in fade-in slide-in-from-top-2">
          
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Notifications</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {notifications.length} total • {unreadCount} new
              </p>
            </div>
            {hasUnread && notifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-100 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-zinc-500 dark:text-zinc-400 text-sm">
                <Bell className="h-8 w-8 mx-auto mb-2 text-zinc-300 dark:text-zinc-700" />
                Loading notifications...
              </div>
            ) : (
              <>
                {!hasUnread && notifications.length > 0 && (
                  <div className="px-4 py-3 bg-emerald-50 dark:bg-emerald-900/10 border-b border-emerald-100 dark:border-emerald-900/20 flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
                    <Check className="h-4 w-4" /> All caught up. You have no new notifications.
                  </div>
                )}

                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-zinc-500 dark:text-zinc-400 text-sm">
                    <Bell className="h-8 w-8 mx-auto mb-2 text-zinc-300 dark:text-zinc-700" />
                    Your inbox is empty.
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {notifications.map((notification) => (
                      <div key={notification._id} className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer opacity-80 hover:opacity-100">
                        <div className="flex gap-3">
                          <div className="mt-0.5 shrink-0">
                            {getIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-0.5">
                              <h4 className="text-sm truncate pr-2 font-semibold text-zinc-900 dark:text-white">
                                {notification.title}
                              </h4>
                              <span className="text-[10px] font-medium text-zinc-400 whitespace-nowrap flex items-center gap-1 shrink-0">
                                <Clock className="h-2.5 w-2.5" /> {formatTime(notification.createdAt)}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-500 mb-1">
                              {notification.classId?.name || "Class"}
                            </p>
                            <p className="text-xs line-clamp-2 text-zinc-600 dark:text-zinc-400">
                              {notification.content || "Click to view attached material."}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}