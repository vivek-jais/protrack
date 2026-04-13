"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  MoreVertical,
  Calendar,
  Clock,
  ArrowRight,
  Users,
  ExternalLink,
  Plus,
  TrendingUp,
  Loader2,
  CheckCircle2,
  BookOpen,
  X,
  Search
} from "lucide-react";
import { redirect } from "next/navigation";

export default function StudentDashboard() {
  const { data: session } = useSession();

  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classCode, setClassCode] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [previewClass, setPreviewClass] = useState<any>(null);
  const [modalError, setModalError] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  //@ts-ignore
  if (session?.user?.role === "teacher") {
    alert("Unauthorized Access");
    redirect("/teacherDashboard");
  }

  /* ---------------- Fetch Classes ---------------- */
  const fetchClasses = async () => {
    try {
      if (!session?.user?.id) return;

      const res = await fetch(`/api/user/classes/${session.user.id}`);
      if (res.ok) {
        const data = await res.json();
        setClasses(data.classes || []);
      }
    } catch (error) {
      console.error("Failed to load classes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchClasses();
  }, [session]);

  /* ---------------- Join Class ---------------- */
  const handleSearchClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classCode.trim()) return;

    setIsSearching(true);
    setModalError("");
    setPreviewClass(null);

    try {
      const res = await fetch(`/api/class/${classCode.trim()}/join`);
      const data = await res.json();

      if (res.ok) setPreviewClass(data.class);
      else setModalError(data.message || "Class not found.");
    } catch {
      setModalError("Failed to search.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleJoinClass = async () => {
    if (!previewClass) return;

    setIsJoining(true);
    setModalError("");

    try {
      const res = await fetch("/api/class/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId: previewClass._id })
      });

      if (res.ok) {
        setIsModalOpen(false);
        setClassCode("");
        setPreviewClass(null);
        fetchClasses();
      } else {
        const data = await res.json();
        setModalError(data.message || "Failed to join.");
      }
    } catch {
      setModalError("Error joining class.");
    } finally {
      setIsJoining(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setClassCode("");
    setPreviewClass(null);
    setModalError("");
  };

  /* ---------------- Stats ---------------- */
  const stats = [
    { label: "Active Projects", value: classes.length, icon: Users },
    { label: "Pending Reviews", value: "5", icon: Clock },
    { label: "Completed", value: "12", icon: CheckCircle2 },
    { label: "GPA", value: "3.8", icon: TrendingUp }
  ];

  /* ---------------- Loading ---------------- */
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="mx-auto w-[96%] max-w-[1400px] space-y-10 py-8">

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">

            {!previewClass ? (
              <form onSubmit={handleSearchClass}>
                <input
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value)}
                  placeholder="Enter class code"
                  className="w-full border p-2 rounded mb-3"
                />
                <button className="w-full bg-black text-white py-2 rounded">
                  {isSearching ? "Searching..." : "Find Class"}
                </button>
              </form>
            ) : (
              <div>
                <h3 className="font-bold">{previewClass.name}</h3>
                <p>{previewClass.code}</p>

                <div className="flex gap-3 mt-4">
                  <button onClick={() => setPreviewClass(null)}>
                    Cancel
                  </button>
                  <button onClick={handleJoinClass}>
                    {isJoining ? "Joining..." : "Join"}
                  </button>
                </div>
              </div>
            )}

            {modalError && <p className="text-red-500 mt-2">{modalError}</p>}

            <button onClick={closeModal} className="mt-4 text-sm">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Welcome, {session?.user?.name || "Student"}
        </h1>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-black text-white px-4 py-2 rounded"
        >
          <Plus className="inline w-4 h-4 mr-1" />
          Join Class
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="border p-4 rounded">
            <s.icon className="mb-2" />
            <p>{s.label}</p>
            <h3 className="font-bold">{s.value}</h3>
          </div>
        ))}
      </div>

      {/* Classes */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Your Classes</h2>

        {classes.length === 0 ? (
          <p>No classes joined.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {classes.map((c) => (
              <div key={c._id} className="border p-4 rounded">
                <h3 className="font-bold">{c.name}</h3>
                <p className="text-sm text-gray-500">{c.code}</p>

                <Link
                  href={`/dashboard/class/${c._id}`}
                  className="text-blue-600 text-sm mt-2 inline-block"
                >
                  Enter →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}