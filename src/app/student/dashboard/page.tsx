"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronRight,
  FolderOpen,
  FileText,
  BarChart3,
} from "lucide-react";
import { StudentTopbar } from "@/components/student/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WorkSessionWidget } from "@/components/student/work-session-widget";
import { parseClientSessionCookie } from "@/lib/auth/client-session";

export default function StudentDashboardPage() {
  const [userName, setUserName] = useState("Priya Sharma");

  useEffect(() => {
    const session = parseClientSessionCookie();
    if (session?.name) {
      setUserName(session.name);
    }
  }, []);

  const firstName = userName.split(" ")[0] || "Priya";

  const currentHour = typeof window !== "undefined" ? new Date().getHours() : 10;
  const timeGreeting =
    currentHour < 12
      ? "Good Morning"
      : currentHour < 17
      ? "Good Afternoon"
      : "Good Evening";

  const upcomingDeadlines = [
    {
      title: "Web Development Assignment",
      due: "Due: Oct 28, 2026",
      timeLeft: "2 days left",
      priority: "High",
      priorityColor: "bg-red-50 text-red-700 border-red-200",
      href: "/student/activities",
    },
    {
      title: "Research Paper Submission",
      due: "Due: Oct 30, 2026",
      timeLeft: "4 days left",
      priority: "Medium",
      priorityColor: "bg-amber-50 text-amber-700 border-amber-200",
      href: "/student/activities",
    },
    {
      title: "Group Project Report",
      due: "Due: Nov 02, 2026",
      timeLeft: "7 days left",
      priority: "Medium",
      priorityColor: "bg-amber-50 text-amber-700 border-amber-200",
      href: "/student/activities",
    },
  ];

  const recentActivities = [
    {
      title: "You submitted Web Development Assignment",
      time: "2 hours ago",
      iconColor: "bg-emerald-100 text-emerald-700",
      icon: CheckCircle2,
    },
    {
      title: "Feedback received for Research Paper",
      time: "4 hours ago",
      iconColor: "bg-blue-100 text-blue-700",
      icon: FileText,
    },
    {
      title: "New activity posted: Data Structures",
      time: "6 hours ago",
      iconColor: "bg-purple-100 text-purple-700",
      icon: Layers,
    },
    {
      title: "Attendance marked for today",
      time: "8 hours ago",
      iconColor: "bg-emerald-100 text-emerald-700",
      icon: Clock,
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50">
      <StudentTopbar title="Dashboard" studentName={userName} />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header Greeting matching Image 1 Top-Right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {timeGreeting}, {firstName}! 👋
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Keep going! You&apos;re doing great. Here&apos;s what&apos;s happening today.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/student/activities">
              <Button size="sm" className="bg-[#E52329] hover:bg-[#C41C22] text-white font-bold rounded-xl shadow-xs text-xs">
                View Assignments
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Stat Cards Row matching Image 1 Top-Right */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Activities */}
          <Card className="p-5 rounded-2xl bg-white border-slate-200/90 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 block">Total Activities</span>
              <span className="text-3xl font-black text-slate-900 mt-1 block">8</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Layers className="w-6 h-6" />
            </div>
          </Card>

          {/* Pending Submissions */}
          <Card className="p-5 rounded-2xl bg-white border-slate-200/90 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 block">Pending Submissions</span>
              <span className="text-3xl font-black text-slate-900 mt-1 block">3</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
              <FileCheck2 className="w-6 h-6" />
            </div>
          </Card>

          {/* Approved */}
          <Card className="p-5 rounded-2xl bg-white border-slate-200/90 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 block">Approved</span>
              <span className="text-3xl font-black text-slate-900 mt-1 block">4</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </Card>

          {/* Rejected */}
          <Card className="p-5 rounded-2xl bg-white border-slate-200/90 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 block">Rejected</span>
              <span className="text-3xl font-black text-slate-900 mt-1 block">1</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <AlertCircle className="w-6 h-6" />
            </div>
          </Card>
        </div>

        {/* Two-Column Grid matching Image 1 Top-Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (7 cols): Upcoming Deadlines + Your Progress + Work Session Widget */}
          <div className="lg:col-span-7 space-y-6">
            {/* Upcoming Deadlines Card */}
            <Card className="p-5 rounded-2xl bg-white border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Upcoming Deadlines</h3>
                <Link
                  href="/student/activities"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-3">
                {upcomingDeadlines.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-300 bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 group-hover:text-blue-600 shadow-2xs">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span>{item.due}</span>
                          <span>•</span>
                          <span>{item.timeLeft}</span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${item.priorityColor}`}
                    >
                      {item.priority}
                    </span>
                  </Link>
                ))}
              </div>
            </Card>

            {/* Your Progress Card matching Image 1 */}
            <Card className="p-5 rounded-2xl bg-white border-slate-200/90 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Your Progress</h3>

              <div className="flex items-center gap-6">
                {/* Radial Progress Ring */}
                <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-blue-600"
                      strokeDasharray="72, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-sm font-black text-slate-900">72%</span>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">Completed 8 of 11 activities</span>
                    <span className="font-mono font-bold text-blue-600">72%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-600" style={{ width: "72%" }} />
                  </div>
                  <span className="text-[11px] text-slate-400 block">
                    3 activities pending evaluation from faculty supervisor
                  </span>
                </div>
              </div>
            </Card>

            {/* Seamless 1-Click Clock In/Out Widget (No face/camera!) */}
            <WorkSessionWidget />
          </div>

          {/* Right Column (5 cols): Recent Activities + Quick Actions */}
          <div className="lg:col-span-5 space-y-6">
            {/* Recent Activities Timeline matching Image 1 */}
            <Card className="p-5 rounded-2xl bg-white border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Recent Activities</h3>
                <Link
                  href="/student/activities"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-4">
                {recentActivities.map((act, idx) => {
                  const Icon = act.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${act.iconColor}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 leading-snug">
                          {act.title}
                        </p>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {act.time}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Quick Actions Card matching Image 1 */}
            <Card className="p-5 rounded-2xl bg-white border-slate-200/90 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Quick Actions</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <Link href="/student/activities">
                  <Button
                    variant="outline"
                    className="w-full text-xs font-bold border-slate-200 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50/50 py-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
                    <span>View Activities</span>
                  </Button>
                </Link>

                <Link href="/student/daily-reports">
                  <Button
                    variant="outline"
                    className="w-full text-xs font-bold border-slate-200 hover:border-amber-400 hover:text-amber-700 hover:bg-amber-50/50 py-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                    <span>Submit Report</span>
                  </Button>
                </Link>

                <Link href="/student/reports">
                  <Button
                    variant="outline"
                    className="w-full text-xs font-bold border-slate-200 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50/50 py-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>View Reports</span>
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
