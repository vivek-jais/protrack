"use client";

import React, { useState, useEffect } from "react";
import { ToastContainer, toast, Zoom } from "react-toastify";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Users, 
  X,
  CheckCircle2,
  Loader2,
  Briefcase,
  UserPlus,
  FolderDot
} from "lucide-react";

export default function CreateGroup() {
  const { data: session } = useSession();
  const router = useRouter();

  // Form State
  const [groupName, setGroupName] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");

  // Data State
  const [myProjects, setMyProjects] = useState<any[]>([]); 
  const [availableRoster, setAvailableRoster] = useState<any[]>([]);
  const [addedMembers, setAddedMembers] = useState<any[]>([]); 

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingRoster, setIsFetchingRoster] = useState(false);

  // 1. Fetch Enrolled Projects on Load
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`/api/project`);
        if (res.ok) {
          const data = await res.json();
          // Filter out standalone projects (ones without a classId) since they don't have class rosters
          const teamProjects = (data.projects || []).filter((p: any) => p.classId != null);
          setMyProjects(teamProjects);
          
          if (teamProjects.length > 0) {
            setSelectedProjectId(teamProjects[0]._id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch projects", error);
      }
    };
    if (session) fetchProjects();
  }, [session]);

  // 2. Fetch Available Roster when a Project is selected
  useEffect(() => {
    const fetchRoster = async () => {
      if (!selectedProjectId) {
        setAvailableRoster([]);
        return;
      }
      setIsFetchingRoster(true);
      try {
        // This new API will ONLY return students who aren't already in a group for this project
        const res = await fetch(`/api/project/${selectedProjectId}/available-students`);
        if (res.ok) {
          const data = await res.json();
          // Filter out the logged-in user so they don't see themselves
          const filteredRoster = (data.availableStudents || []).filter(
            (student: any) => student.email !== session?.user?.email
          );
          setAvailableRoster(filteredRoster);
        }
      } catch (error) {
        console.error("Roster fetch error", error);
        toast.error("Failed to load available teammates.");
      } finally {
        setIsFetchingRoster(false);
      }
    };
    
    fetchRoster();
    // Reset added members when switching projects to prevent cross-project groups
    setAddedMembers([]); 
  }, [selectedProjectId, session]);

  // 3. Member Management Handlers
  const addMemberFromRoster = (student: any) => {
    if (addedMembers.find(m => m.id === student._id)) return;
    
    setAddedMembers([...addedMembers, {
      id: student._id,
      name: student.name,
      email: student.email,
      image: student.image || `https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`,
      assignedRole: student.preferredRole || "Member"
    }]);
  };

  const removeMember = (id: string) => {
    setAddedMembers(addedMembers.filter((m) => m.id !== id));
  };

  const updateMemberRole = (id: string, newRole: string) => {
    setAddedMembers(addedMembers.map(m => m.id === id ? { ...m, assignedRole: newRole } : m));
  };

  // 4. Submit the Group
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!selectedProjectId) throw new Error("Please select a project");

      // Payload structure matched to the POST /api/project/[id]/group route we built earlier
      const newGroupPayload = {
        name: groupName,
        invitees: addedMembers.map(m => ({
          userId: m.id,
          role: m.assignedRole
        }))
      };

      const res = await fetch(`/api/project/${selectedProjectId}/group`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGroupPayload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Team formed successfully!', {
          position: "top-right",
          autoClose: 3000,
          theme: "dark",
          transition: Zoom,
        });
        setGroupName('');
        setAddedMembers([]);
        setTimeout(() => {
          router.push(`/dashboard/projects/${selectedProjectId}`); // Redirect to the project workspace
        }, 2000);
      } else {
        throw new Error(data.message || "Failed to create group");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error creating group");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 p-4 md:p-8 dark:bg-zinc-950">
      <ToastContainer />
      
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ========================================== */}
        {/* LEFT COLUMN: Group Configuration           */}
        {/* ========================================== */}
        <div className="lg:col-span-2 space-y-8 rounded-2xl bg-white p-6 md:p-8 shadow-sm border border-gray-200 dark:border-zinc-800 dark:bg-zinc-900 flex flex-col">
          
          <div className="border-b border-gray-100 pb-6 dark:border-zinc-800">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Build Project Team
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
              Select a project, choose available teammates, and assign roles.
            </p>
          </div>

          <form id="create-group-form" onSubmit={handleSubmit} className="space-y-8 flex-1">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300">
                  Select Project
                </label>
                <div className="relative">
                  <FolderDot className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    required
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-10 py-3 text-sm outline-none transition-all focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  >
                    {myProjects.length === 0 && <option value="">No projects available</option>}
                    {myProjects.map((proj) => (
                      <option key={proj._id} value={proj._id}>
                        {proj.title} ({proj.classId?.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300">
                  Team Name
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="e.g. The Code Warriors"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-10 py-3 text-sm outline-none transition-all focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300 border-b border-gray-100 dark:border-zinc-800 pb-2 block">
                Selected Team & Roles
              </label>

              <div className="space-y-3 min-h-[200px]">
                {/* Leader Card */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/30 dark:bg-emerald-900/10">
                  <div className="flex items-center gap-3 flex-1">
                    <img src={session?.user?.image || `https://api.dicebear.com/7.x/initials/svg?seed=${session?.user?.name}`} className="h-10 w-10 rounded-full border-2 border-white dark:border-zinc-800 object-cover" alt="You" />
                    <div>
                      <p className="text-sm font-bold text-emerald-900 dark:text-emerald-400">You (Team Lead)</p>
                      <p className="text-xs text-emerald-700 dark:text-emerald-500">{session?.user?.email}</p>
                    </div>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-500 hidden sm:block" />
                </div>

                {addedMembers.length === 0 && (
                  <div className="text-center py-8 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 dark:border-zinc-800 dark:bg-zinc-900/50">
                    <p className="text-sm text-gray-500 dark:text-zinc-400">No classmates added yet. Select from the available roster.</p>
                  </div>
                )}

                {/* Added Members */}
                {addedMembers.map((member) => (
                  <div key={member.id} className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex items-center gap-3 flex-1 overflow-hidden">
                      <img src={member.image} alt={member.name} className="h-10 w-10 rounded-full border-2 border-gray-50 dark:border-zinc-900 object-cover" />
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate text-sm font-bold text-gray-900 dark:text-white">{member.name}</p>
                        <p className="truncate text-xs text-gray-500 dark:text-zinc-400">{member.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
                      <select value={member.assignedRole} onChange={(e) => updateMemberRole(member.id, e.target.value)} className="w-full sm:w-40 rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-xs font-semibold outline-none focus:border-blue-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                        <option value="Member">General Member</option>
                        <option value="Frontend Developer">Frontend Developer</option>
                        <option value="Backend Developer">Backend Developer</option>
                        <option value="Full Stack Developer">Full Stack</option>
                        <option value="UI/UX Designer">UI/UX Designer</option>
                        <option value="Data Analyst">Data Analyst</option>
                      </select>
                      <button type="button" onClick={() => removeMember(member.id)} className="rounded-lg p-2 text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-colors dark:hover:bg-rose-900/20">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>

          <div className="pt-6 border-t border-gray-100 dark:border-zinc-800 mt-auto">
             <button
              form="create-group-form"
              type="submit"
              disabled={isLoading || !selectedProjectId}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-4 text-sm font-bold text-white transition-all hover:bg-gray-800 disabled:opacity-70 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
            >
              {isLoading ? <><Loader2 className="h-5 w-5 animate-spin" /> Forming Team...</> : "Form Team & Open Workspace"}
            </button>
          </div>
        </div>

        {/* ========================================== */}
        {/* RIGHT COLUMN: Available Roster Sidebar     */}
        {/* ========================================== */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-200 dark:border-zinc-800 dark:bg-zinc-900 flex flex-col h-[600px] lg:h-auto lg:max-h-[800px]">
          
          <div className="p-6 border-b border-gray-100 dark:border-zinc-800 shrink-0 bg-gray-50/50 dark:bg-zinc-900/50 rounded-t-2xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" /> Available Teammates
            </h3>
            <p className="text-xs text-gray-500 mt-1 dark:text-zinc-400">
              Only showing students who are not yet in a team for this project.
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {!selectedProjectId ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <FolderDot className="h-8 w-8 text-gray-300 mb-2 dark:text-zinc-700" />
                <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">Select a project to view available teammates.</p>
              </div>
            ) : isFetchingRoster ? (
              <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
            ) : availableRoster.length === 0 ? (
              <div className="text-center py-10 text-sm text-gray-500 dark:text-zinc-400">
                All classmates are already assigned to a team for this project!
              </div>
            ) : (
              availableRoster.map((student) => {
                const isAdded = addedMembers.some(m => m.id === student._id);

                return (
                  <div key={student._id} className={`p-4 rounded-xl border transition-all ${isAdded ? 'border-blue-200 bg-blue-50 dark:border-blue-900/30 dark:bg-blue-900/10' : 'border-gray-200 bg-white hover:border-blue-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-blue-800'}`}>
                    <div className="flex items-center gap-3">
                      <img src={student.image || `https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`} className="h-10 w-10 rounded-full border border-gray-200 dark:border-zinc-700 object-cover" alt={student.name} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate text-gray-900 dark:text-white">{student.name}</p>
                        <p className="text-xs text-gray-500 truncate dark:text-zinc-400">{student.email}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isAdded}
                      onClick={() => addMemberFromRoster(student)}
                      className={`mt-4 w-full py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 ${
                        isAdded 
                          ? 'bg-blue-600 text-white dark:bg-blue-600' 
                          : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-blue-500 dark:hover:text-blue-400'
                      }`}
                    >
                      {isAdded ? <>Selected</> : <><UserPlus className="h-3.5 w-3.5" /> Invite to Team</>}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}