"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import { Loader2, ArrowLeft, BarChart3, PieChart, TrendingUp } from "lucide-react";
import Link from "next/link";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';

const CHART_COLORS = {
  submitted: '#10b981',
  missing: '#ef4444',
  average: '#6366f1',
  max: '#94a3b8',
  activity: '#3b82f6'
};

export default function TeacherGraphs() {
  const params = useParams();
  const projectId = params.id;

  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // States to hold our crunched chart data
  const [participationData, setParticipationData] = useState<any[]>([]);
  const [scoresData, setScoresData] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [teamCount, setTeamCount] = useState(0);

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
        setTeamCount(totalGroups);

        // ==========================================
        // 🧠 DATA CRUNCHING ENGINE
        // ==========================================
        const partData: any[] = [];
        const scoreData: any[] = [];

        const activityMap: { [key: string]: { name: string; "Files Uploaded": number } } = {};
        groups.forEach((g: any) => {
          activityMap[g._id] = { name: g.name || `Team ${g._id?.slice(-4)}`, "Files Uploaded": 0 };
        });

        projectInfo.stages?.forEach((stage: any, idx: number) => {
          const stageName = stage.stageName || `Stage ${idx + 1}`;
          const submissions = stage.submissions || [];

          const submittedCount = submissions.length;
          const missingCount = Math.max(0, totalGroups - submittedCount);

          partData.push({
            name: stageName,
            Submitted: submittedCount,
            Missing: missingCount
          });

          let totalScore = 0;
          let gradedCount = 0;

          submissions.forEach((submission: any) => {
            if (submission.groupId && activityMap[submission.groupId]) {
              activityMap[submission.groupId]["Files Uploaded"] += (submission.documents?.length || 0);
            }

            if (submission.status === 'evaluated' && submission.evaluation) {
              totalScore += submission.evaluation.marksAwarded || 0;
              gradedCount += 1;
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

  const totalSubmitted = useMemo(() => participationData.reduce((sum, item) => sum + (item.Submitted || 0), 0), [participationData]);
  const totalMissing = useMemo(() => participationData.reduce((sum, item) => sum + (item.Missing || 0), 0), [participationData]);
  const totalFilesUploaded = useMemo(() => activityData.reduce((sum, item) => sum + (item["Files Uploaded"] || 0), 0), [activityData]);
  const averageScore = useMemo(() => {
    if (!scoresData.length) return 0;
    return Number((scoresData.reduce((sum, item) => sum + (item["Average Score"] || 0), 0) / scoresData.length).toFixed(1));
  }, [scoresData]);
  const submissionRate = useMemo(() => {
    const total = totalSubmitted + totalMissing;
    return total > 0 ? Math.round((totalSubmitted / total) * 100) : 0;
  }, [totalSubmitted, totalMissing]);
  const submissionPieData = useMemo(() => [
    { name: 'Submitted', value: totalSubmitted, fill: CHART_COLORS.submitted },
    { name: 'Missing', value: totalMissing, fill: CHART_COLORS.missing }
  ], [totalSubmitted, totalMissing]);

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950"><Loader2 className="animate-spin text-blue-600 h-8 w-8" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 dark:bg-zinc-950">
      <ToastContainer position="top-right" theme="colored" />

      <div className="bg-white border-b border-gray-200 dark:bg-zinc-900 dark:border-zinc-800 py-6">
        <div className="max-w-[95%] mx-auto px-4">
          <Link href="/projects" className="flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 mb-4 dark:text-zinc-400">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Project Performance Dashboard</h1>
              <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">Visual insights for {project?.title}</p>
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

      <div className="max-w-[95%] mx-auto px-4 mt-8 animate-in fade-in duration-200">
        <div className="grid gap-4 xl:grid-cols-[1.6fr,1fr]">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-zinc-400">Teams</p>
              <p className="mt-4 text-4xl font-extrabold text-zinc-900 dark:text-white">{teamCount}</p>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Active groups contributing to this project.</p>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-zinc-400">Average Score</p>
              <p className="mt-4 text-4xl font-extrabold text-zinc-900 dark:text-white">{averageScore}</p>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Average performance across evaluated stages.</p>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-zinc-400">Submission Rate</p>
              <p className="mt-4 text-4xl font-extrabold text-zinc-900 dark:text-white">{submissionRate}%</p>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Completed stage submissions compared to expected.</p>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-zinc-400">Files Uploaded</p>
              <p className="mt-4 text-4xl font-extrabold text-zinc-900 dark:text-white">{totalFilesUploaded}</p>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Total evidence files submitted by teams.</p>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Submission Coverage</h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Submitted versus missing stage reports.</p>
              </div>
            </div>
            <div className="mt-8 h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={submissionPieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={4}
                    label={(entry: any) => `${entry.name}: ${Math.round((entry.percent ?? 0) * 100)}%`}
                  >
                    {submissionPieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 10px 30px rgb(15 23 42 / 0.12)' }} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.4fr,1fr] mt-8">
          <div className="space-y-8">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Stage Progress</h2>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Submitted and missing stage submissions by stage.</p>
                </div>
              </div>
              <div className="mt-6 h-[85] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={participationData} margin={{ top: 10, right: 16, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip cursor={{ fill: 'rgba(15,23,42,0.05)' }} contentStyle={{ borderRadius: 14, border: 'none', boxShadow: '0 10px 30px rgb(15 23 42 / 0.12)' }} />
                    <Legend iconType="circle" />
                    <Bar dataKey="Submitted" stackId="a" fill={CHART_COLORS.submitted} radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Missing" stackId="a" fill={CHART_COLORS.missing} radius={[0, 0, 6, 6]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Score Trend</h2>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Average score compared to stage targets.</p>
                </div>
              </div>
              <div className="mt-6 h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={scoresData} margin={{ top: 10, right: 24, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip cursor={{ stroke: '#e5e7eb', strokeWidth: 2 }} contentStyle={{ borderRadius: 14, border: 'none', boxShadow: '0 10px 30px rgb(15 23 42 / 0.12)' }} />
                    <Legend iconType="circle" />
                    <Line type="monotone" dataKey="Average Score" stroke={CHART_COLORS.average} strokeWidth={3} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="Max Marks" stroke={CHART_COLORS.max} strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Team File Activity</h2>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Evidence uploads per team, ranked by volume.</p>
                </div>
              </div>
              <div className="mt-6 h-[130] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={activityData} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} interval={0} angle={-25} textAnchor="end" />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip cursor={{ fill: 'rgba(15,23,42,0.05)' }} contentStyle={{ borderRadius: 14, border: 'none', boxShadow: '0 10px 30px rgb(15 23 42 / 0.12)' }} />
                    <Bar dataKey="Files Uploaded" fill={CHART_COLORS.activity} radius={[6, 6, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}