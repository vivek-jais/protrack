"use client";

import React, { useState, useEffect } from "react";
import { ToastContainer, toast, Zoom } from "react-toastify";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Users, 
  Search,
  X,
  CheckCircle2,
  Loader2,
  School
} from "lucide-react";

export default function CreateGroup() {
  const { data: session } = useSession();
  const router = useRouter();

  // Form State
  const [groupName, setGroupName] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [searchEmail, setSearchEmail] = useState("");

  // Data State
  const [myClasses, setMyClasses] = useState<any[]>([]); // Classes user is enrolled in
  const [addedMembers, setAddedMembers] = useState<any[]>([]); // Students added to group

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // 1. Fetch Enrolled Classes on Load
  useEffect(() => {
    const fetchClasses = async () => {
      // @ts-ignore
      if (session?.user?.id) {
        // @ts-ignore
        const res = await fetch(`/api/user/classes/${session?.user?.id}`);
        if (res.ok) {
          const data = await res.json();
          setMyClasses(data.classes);
          setSelectedClassId(data.classes[0]._id)
        }
      }
    };
    fetchClasses();
  }, [session]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEmail) return;
    if (session?.user?.email === searchEmail) {
      alert("You are already in the group!");
      return;
    }

    setIsSearching(true);

    try {
      const res = await fetch(`/api/user/search?email=${searchEmail}`);

      if (res.ok) {
        const user = await res.json();

        const newMember = {
          id: user._id, // This is now a real ObjectId like "697512fd..."
          name: user.name,
          email: user.email,
          image: user.image || "",
        };

        // Check for duplicates
        if (addedMembers.find((m) => m.email === newMember.email)) {
          alert("Member already added!");
        } else {
          setAddedMembers([...addedMembers, newMember]);
          setSearchEmail("");
        }
      } else {
        alert("User not found. Ask them to sign up first!");
      }
    } catch (error) {
      console.error("Search error:", error);
      alert("Error searching for user");
    } finally {
      setIsSearching(false);
    }
  };

  const removeMember = (id: string) => {
    setAddedMembers(addedMembers.filter((m) => m.id !== id));
  };

  // 3. Submit the Group
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!selectedClassId) throw new Error("Please select a class");
      if (addedMembers.length === 0) throw new Error("Add at least one member");

      const newGroup = {
        name: groupName,
        classId: selectedClassId,
        // Map UI members to just their IDs for the DB
        selectedMemberIds: addedMembers.map(m => m.id)
      };

      const res = await fetch(`/api/class/${selectedClassId}/group/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGroup),
      });

      if (res.ok) {
        toast.success('Yeah Group created Successfully', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Zoom,
        });
        setGroupName('')
        setAddedMembers([])
        setTimeout(() => {
          router.push("/dashboard");
        }, 5000);
      } else {
        alert("Failed to create group");
      }
    } catch (error) {
      console.error(error);
      alert("Error creating group");
    } finally {
      setIsLoading(false);
    }
  };

  return (

    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-zinc-950">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Zoom}
      />
      <div className="w-full max-w-2xl space-y-8 rounded-2xl bg-white p-8 shadow-xl dark:bg-zinc-900">

        {/* Header */}
        <div className="border-b border-gray-100 pb-6 dark:border-zinc-800">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create New Group
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
            Form a team to track your project progress together.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* 1. Select Class */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
              Select Class
            </label>
            <div className="relative">
              <School className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                required
                className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-10 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
              >
                <option value="">-- Choose a Class --</option>
                {myClasses.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name} ({cls.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Group Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
              Group Name
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. The Code Warriors"
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-10 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
              />
            </div>
          </div>

          {/* 3. Add Members */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
              Add Team Members
            </label>

            {/* Search Input */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="Enter student email..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-10 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
                />
              </div>
              <button
                type="button"
                onClick={handleAddMember}
                disabled={isSearching || !searchEmail}
                className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-hover hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900"
              >
                {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : "Add"}
              </button>
            </div>

            {/* Members List */}
            {addedMembers.length > 0 && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {/* You (Leader) - Always visible */}
                <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/30 dark:bg-emerald-900/10">
                  <img
                    src={session?.user?.image || ""}
                    className="h-8 w-8 rounded-full"
                    alt="You"
                  />
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-semibold text-emerald-900 dark:text-emerald-200">You (Group Head)</p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>

                {/* Added Members */}
                {addedMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="h-8 w-8 rounded-full"
                    />
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-200">
                        {member.name}
                      </p>
                      <p className="truncate text-xs text-gray-500 dark:text-zinc-400">
                        {member.email}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMember(member.id)}
                      className="rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 py-4 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Create Group Project"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}