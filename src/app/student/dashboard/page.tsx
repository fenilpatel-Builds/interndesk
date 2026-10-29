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
import { InstituteActivity, ActivitySubmission } from "@/types/activity";

export default function StudentDashboardPage() {
  const [userName, setUserName] = useState("Student Intern");
  const [userEmail, setUserEmail] = useState("");
  const [greeting, setGreeting] = useState("Good Morning");
  const [activities, setActivities] = useState<InstituteActivity[]>([]);
  const [submissions, setSubmissions] = useState<ActivitySubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = parseClientSessionCookie();
    if (session?.name) {
      setUserName(session.name);
    }
    if (session?.email) {
      setUserEmail(session.email);
    }

    // Authoritative user name resolution from server session
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user?.name) {
          setUserName(data.user.name);
          if (data.user.email) setUserEmail(data.user.email);
        }
      })
      .catch(() => {});

    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good Morning");
    } else if (hour < 17) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }

    // Fetch activities and student-scoped submissions
    const loadDashboardData = async () => {
      try {
        const emailQuery = session?.email ? `?studentEmail=${encodeURIComponent(session.email)}` : "";
        const [actRes, subRes] = await Promise.all([
          fetch("/api/activities"),
          fetch(`/api/activities/submissions${emailQuery}`),
        ]);

        if (actRes.ok) {
          const actData = await actRes.json();
          if (actData.success && Array.isArray(actData.activities)) {
            setActivities(actData.activities);
          }
        }

        if (subRes.ok) {
          const subData = await subRes.json();
          if (subData.success && Array.isArray(subData.submissions)) {
            setSubmissions(subData.submissions);
          }
        }
      } catch (err) {
        console.error("Failed to load student dashboard metrics:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const firstName = userName.split(" ")[0] || "Intern";

  // Dynamic calculations based strictly on logged-in student's records (0 for new registrations)
  const studentActivitiesCount = submissions.length;
  const pendingSubmissionsCount = submissions.filter((s) => s.status === "SUBMITTED").length;
  const approvedSubmissionsCount = submissions.filter((s) => s.status === "APPROVED").length;
  const rejectedSubmissionsCount = submissions.filter(
    (s) => s.status === "REJECTED" || s.status === "NEEDS_REVISION"
  ).length;

  const progressPercent = studentActivitiesCount > 0
    ? Math.min(100, Math.round((approvedSubmissionsCount / studentActivitiesCount) * 100))
    : 0;

  // Upcoming deadlines mapped from actual institute published activities
  const upcomingDeadlines = activities
    .filter((act) => act.status === "PUBLISHED")
    .slice(0, 3)
    .map((act) => {
      const deadlineDate = new Date(act.deadline);
      const diffDays = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      const timeLeft = diffDays > 0 ? `${diffDays} days left` : diffDays === 0 ? "Due today" : "Past due";
      const priority = diffDays <= 2 ? "High" : diffDays <= 7 ? "Medium" : "Normal";
      const priorityColor =
        diffDays <= 2
          ? "bg-red-50 text-red-700 border-red-200"
          : diffDays <= 7
          ? "bg-amber-50 text-amber-700 border-amber-200"
          : "bg-blue-50 text-blue-700 border-blue-200";

      return {
        id: act.id,
        title: act.title,
        due: `Due: ${act.deadline}`,
        timeLeft,
        priority,
        priorityColor,
        href: "/student/activities",
      };
    });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50">
      <StudentTopbar title="Dashboard" studentName={userName} />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E52329]" />
              <span>Learn • Grow • Achieve</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight" suppressHydrationWarning>
              {greeting}, {firstName}! 👋
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Keep going! Here is your real-time academic progress and daily activity status.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/student/activities">
              <Button size="sm" className="bg-[#E52329] hover:bg-[#C41C22] text-white font-bold rounded-xl shadow-md shadow-red-500/20 text-xs px-4 py-2 transition-transform hover:scale-[1.02]">
                View Assignments
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Dynamic Stat Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* My Activities */}
          <Card className="p-5 rounded-2xl bg-white border-slate-200/90 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 block">My Activities</span>
              <span className="text-3xl font-black text-slate-900 mt-1 block">
                {loading ? "-" : studentActivitiesCount}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Layers className="w-6 h-6" />
            </div>
          </Card>

          {/* Pending Submissions */}
          <Card className="p-5 rounded-2xl bg-white border-slate-200/90 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 block">Pending Submissions</span>
              <span className="text-3xl font-black text-slate-900 mt-1 block">
                {loading ? "-" : pendingSubmissionsCount}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
              <FileCheck2 className="w-6 h-6" />
            </div>
          </Card>

          {/* Approved */}
          <Card className="p-5 rounded-2xl bg-white border-slate-200/90 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 block">Approved</span>
              <span className="text-3xl font-black text-slate-900 mt-1 block">
                {loading ? "-" : approvedSubmissionsCount}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </Card>

          {/* Rejected */}
          <Card className="p-5 rounded-2xl bg-white border-slate-200/90 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 block">Rejected / Revision</span>
              <span className="text-3xl font-black text-slate-900 mt-1 block">
                {loading ? "-" : rejectedSubmissionsCount}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <AlertCircle className="w-6 h-6" />
            </div>
          </Card>
        </div>

        {/* Two-Column Grid */}
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

              {upcomingDeadlines.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-slate-200 text-center bg-slate-50/50">
                  <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">No active deadlines scheduled</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">All assignments are up to date.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingDeadlines.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-300 bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 group-hover:text-blue-600 shadow-2xs">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
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
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border shrink-0 ${item.priorityColor}`}
                      >
                        {item.priority}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </Card>

            {/* Dynamic Progress Card */}
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
                      className="text-blue-600 transition-all duration-500"
                      strokeDasharray={`${progressPercent}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-sm font-black text-slate-900">{progressPercent}%</span>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">
                      Completed {approvedSubmissionsCount} of {studentActivitiesCount} activities
                    </span>
                    <span className="font-mono font-bold text-blue-600">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#E52329] to-[#0B192C] transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 block">
                    {pendingSubmissionsCount > 0
                      ? `${pendingSubmissionsCount} activities pending evaluation from faculty supervisor`
                      : studentActivitiesCount > 0 && approvedSubmissionsCount === 0
                      ? "Get started by selecting an activity and submitting your deliverables"
                      : "Start your first activity to track your progress"}
                  </span>
                </div>
              </div>
            </Card>

            {/* Work Session Widget */}
            <WorkSessionWidget />
          </div>

          {/* Right Column (5 cols): Recent Activities + Quick Actions */}
          <div className="lg:col-span-5 space-y-6">
            {/* Recent Activities Timeline */}
            <Card className="p-5 rounded-2xl bg-white border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Recent Activities</h3>
                <Link
                  href="/student/submissions"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  View All
                </Link>
              </div>

              {submissions.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-slate-200 text-center bg-slate-50/50">
                  <Sparkles className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">No submissions yet</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Your completed assignments, submissions, and grades will appear here once submitted.
                  </p>
                  <Link href="/student/activities" className="inline-block mt-3">
                    <Button size="sm" variant="outline" className="text-xs font-bold rounded-xl border-slate-300">
                      Browse Assignments
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.slice(0, 4).map((sub) => {
                    const isApproved = sub.status === "APPROVED";
                    const isRejected = sub.status === "REJECTED";
                    const Icon = isApproved ? CheckCircle2 : isRejected ? AlertCircle : Clock;
                    const iconColor = isApproved
                      ? "bg-emerald-100 text-emerald-700"
                      : isRejected
                      ? "bg-rose-100 text-rose-700"
                      : "bg-blue-100 text-blue-700";

                    return (
                      <div key={sub.id} className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${iconColor}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 leading-snug truncate">
                            {sub.activityTitle}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                              {sub.status}
                            </span>
                            {sub.score !== undefined && (
                              <span className="text-[10px] font-mono font-bold text-emerald-600">
                                Score: {sub.score}/100
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Quick Actions Card */}
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
