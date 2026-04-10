"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import { Loader2, ArrowLeft, BarChart3, PieChart, TrendingUp } from "lucide-react";
import Link from "next/link";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, LineChart, Line 
} from 'recharts';

export default function TeacherGraphs() {
  const params = useParams();
  const projectId = params.id;

  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // States to hold our crunched chart data
  const [participationData, setParticipationData] = useState<any[]>([]);
  const [scoresData, setScoresData] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);

  useEffect(() => {
    const fetchAndProcessData = async () => {
      try {
        // 1. Fetch Project Details (Contains the stages and submissions)
        const projRes = await fetch(`/api/project/${projectId}`);
        const projData = await projRes.json();
        const projectInfo = projData.project;
        setProject(projectInfo);

        // 2. Fetch All Groups (To know how many teams exist)
        const allGroupsRes = await fetch(`/api/project/${projectId}/all-groups`);
        const allGroupsData = await allGroupsRes.json();
        const groups = allGroupsData.groups || [];
        const totalGroups = groups.length;

        // ==========================================
        // 🧠 DATA CRUNCHING ENGINE
        // ==========================================
        let partData: any[] = [];
        let scoreData: any[] = [];
        
        // Dictionary to track files uploaded per team
        let activityMap: { [key: string]: { name: string, "Files Uploaded": number } } = {};
        groups.forEach((g: any) => {
          activityMap[g._id] = { name: g.name, "Files Uploaded": 0 };
        });

        projectInfo.stages?.forEach((stage: any, idx: number) => {
          const stageName = `Stage ${idx + 1}`;
          const submissions = stage.submissions || [];
          
          // Metric 1: Participation
          const submittedCount = submissions.length;
          const missingCount = totalGroups - submittedCount;
          partData.push({
            name: stageName,
            Submitted: submittedCount,
            Missing: missingCount
          });

          // Metric 2 & 3: Scores and Activity
          let totalScore = 0;
          let gradedCount = 0;

          submissions.forEach((sub: any) => {
            // Track total files uploaded by this group
            if (activityMap[sub.groupId]) {
              activityMap[sub.groupId]["Files Uploaded"] += (sub.documents?.length || 0);
            }

            // Track scores
            if (sub.status === 'evaluated' && sub.evaluation) {
              totalScore += sub.evaluation.marksAwarded;
              gradedCount++;
            }
          });

          const avgScore = gradedCount > 0 ? Number((totalScore / gradedCount).toFixed(1)) : 0;
          scoreData.push({
            name: stageName,
            "Average Score": avgScore,
            "Max Marks": stage.maxMarks || 10
          });
        });

        setParticipationData(partData);
        setScoresData(scoreData);
        setActivityData(Object.values(activityMap));

      } catch (err) {
        toast.error("Failed to generate analytics.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndProcessData();
  }, [projectId]);

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950"><Loader2 className="animate-spin text-blue-600 h-8 w-8" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 dark:bg-zinc-950">
      <ToastContainer />

      {/* HEADER & TABS */}
      <div className="bg-white border-b border-gray-200 dark:bg-zinc-900 dark:border-zinc-800 py-6">
        <div className="max-w-[95%] mx-auto px-4">
          <Link href="/projects" className="flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 mb-4 dark:text-zinc-400">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Analytics Engine</h1>
              <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">Real-time data insights for {project?.title}</p>
            </div>
            
            <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl">
              <Link href={`/teacherDashboard/project/${projectId}/workspace`} className="px-6 py-2.5 text-sm font-bold rounded-lg transition-all text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white">
                Evaluation Matrix
              </Link>
              <div className="px-6 py-2.5 text-sm font-bold rounded-lg transition-all bg-white text-blue-600 shadow-sm dark:bg-zinc-950 dark:text-white cursor-default">
                Graphical Analysis
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS CONTAINER */}
      <div className="max-w-[95%] mx-auto px-4 mt-8 animate-in fade-in duration-200">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Chart 1: Participation */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
              <PieChart className="h-5 w-5 text-blue-500" /> Stage Participation (Submitted vs Missing)
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={participationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} allowDecimals={false} />
                  <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Legend iconType="circle" />
                  <Bar dataKey="Submitted" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="Missing" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Average Scores */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-indigo-500" /> Average Score Trend
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scoresData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <Tooltip cursor={{stroke: '#e5e7eb', strokeWidth: 2}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Legend iconType="circle" />
                  <Line type="monotone" dataKey="Average Score" stroke="#6366f1" strokeWidth={3} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Max Marks" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Team Activity */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 lg:col-span-2">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
              <BarChart3 className="h-5 w-5 text-emerald-500" /> Total Files Uploaded per Team
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} allowDecimals={false} />
                  <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="Files Uploaded" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}