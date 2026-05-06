"use client";

import React, { useState } from "react";
import { 
  User, Bell, Shield, Palette, Save, 
  Moon, Sun, Monitor, Sliders, Eye, Zap
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("workflow"); // Defaulting to the new tab for you to see!
  const [isSaving, setIsSaving] = useState(false);

  // 1. Profile State
  const [profileData, setProfileData] = useState({
    name: session?.user?.name || "Pranshu Singla",
    bio: "",
  });

  // 2. Appearance State
  const [theme, setTheme] = useState("system");

  // 🔥 3. THE NEW UNIQUE STATE: Workflow & Privacy
  // All of this gets saved via ONE single API call as a JSON object!
  const [workflowSettings, setWorkflowSettings] = useState({
    focusMode: false,          // Auto-collapses sidebars
    defaultView: "list",       // 'list' or 'grid' for projects
    showOnlineStatus: true,    // Let teammates see if you are active
    dailyDigest: true,         // One summary email per day instead of instant alerts
  });

  const handleSaveWorkflow = async () => {
    setIsSaving(true);
    try {
      // Example of the single isolated API call
      const res = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: workflowSettings }),
      });

      if (res.ok) toast.success("Workflow preferences saved!");
      else toast.error("Failed to save preferences.");
    } catch (error) {
      toast.error("An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Public Profile", icon: User },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "workflow", label: "Workflow & Privacy", icon: Sliders }, // NEW TAB
    { id: "security", label: "Security & Access", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 dark:bg-zinc-950">
      <ToastContainer />
      
      <div className="bg-white border-b border-gray-200 dark:bg-zinc-900 dark:border-zinc-800 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Settings</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
            Manage your account settings and preferences.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 shrink-0">
            <nav className="flex flex-col gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive 
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" 
                        : "text-gray-600 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"}`} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 space-y-6">
            
            {/* --- PROFILE SETTINGS (Truncated for brevity) --- */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 dark:bg-zinc-900 dark:border-zinc-800 animate-in fade-in">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Public Profile</h2>
                <input 
                  type="text" 
                  value={profileData.name} 
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
                />
              </div>
            )}

            {/* --- APPEARANCE SETTINGS (Truncated for brevity) --- */}
            {activeTab === "appearance" && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 dark:bg-zinc-900 dark:border-zinc-800 animate-in fade-in">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Appearance</h2>
                <div className="flex gap-4">
                  {/* Theme buttons here */}
                  <button className="p-4 border rounded-xl hover:border-emerald-500 text-sm font-bold dark:text-white dark:border-zinc-700">Light</button>
                  <button className="p-4 border rounded-xl hover:border-emerald-500 text-sm font-bold dark:text-white dark:border-zinc-700">Dark</button>
                </div>
              </div>
            )}

            {/* 🔥 --- THE NEW WORKFLOW & PRIVACY SETTINGS --- 🔥 */}
            {activeTab === "workflow" && (
              <div className="animate-in fade-in duration-300">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 dark:border-zinc-800">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Workflow & Privacy</h2>
                    <p className="text-sm text-gray-500 mt-1 dark:text-zinc-400">Customize how you interact with ProTrack and what others see.</p>
                  </div>
                  
                  <div className="p-0 divide-y divide-gray-100 dark:divide-zinc-800">
                    
                    {/* Toggle: Focus Mode */}
                    <div className="p-6 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg dark:bg-blue-900/20 dark:text-blue-400"><Zap className="h-5 w-5"/></div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">Focus Mode</p>
                          <p className="text-sm text-gray-500 dark:text-zinc-400">Automatically collapse sidebars when viewing project stages.</p>
                        </div>
                      </div>
                      <button onClick={() => setWorkflowSettings({...workflowSettings, focusMode: !workflowSettings.focusMode})} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${workflowSettings.focusMode ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-zinc-700'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${workflowSettings.focusMode ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    {/* Toggle: Online Status */}
                    <div className="p-6 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg dark:bg-purple-900/20 dark:text-purple-400"><Eye className="h-5 w-5"/></div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">Show Online Status</p>
                          <p className="text-sm text-gray-500 dark:text-zinc-400">Let your teammates know when you are actively using ProTrack.</p>
                        </div>
                      </div>
                      <button onClick={() => setWorkflowSettings({...workflowSettings, showOnlineStatus: !workflowSettings.showOnlineStatus})} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${workflowSettings.showOnlineStatus ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-zinc-700'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${workflowSettings.showOnlineStatus ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    {/* Dropdown: Default View */}
                    <div className="p-6 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg dark:bg-orange-900/20 dark:text-orange-400"><Sliders className="h-5 w-5"/></div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">Default Project View</p>
                          <p className="text-sm text-gray-500 dark:text-zinc-400">Choose how projects are displayed when you open them.</p>
                        </div>
                      </div>
                      <select 
                        value={workflowSettings.defaultView}
                        onChange={(e) => setWorkflowSettings({...workflowSettings, defaultView: e.target.value})}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 p-2.5 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white outline-none font-medium cursor-pointer"
                      >
                        <option value="list">List View</option>
                        <option value="grid">Grid View</option>
                      </select>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* Global Save Button (Only show on Workflow tab for this example) */}
            {activeTab === "workflow" && (
              <div className="flex justify-end pt-4 animate-in slide-in-from-bottom-4 duration-300">
                <button 
                  onClick={handleSaveWorkflow}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-md hover:bg-emerald-700 transition-all disabled:opacity-70"
                >
                  {isSaving ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> : <><Save className="h-5 w-5" /> Save Preferences</>}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}