"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Clock,
  TrendingUp,
  CheckCircle2,
  FileSpreadsheet,
  BookOpen,
  Award,
  ListTodo,
  FileText,
  UserCheck,
  Sparkles,
  Zap,
  ShieldCheck,
  Check,
  ArrowRight,
  Coffee,
  Calendar,
} from "lucide-react";
import { StudentTopbar } from "@/components/student/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WorkSessionWidget } from "@/components/student/work-session-widget";
import { useWorkTimer } from "@/hooks/use-work-timer";

export default function StudentDashboardPage() {
  const [message] = useState<string | null>(null);
  const { status, hoursStr, minutesStr, secondsStr } = useWorkTimer();

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <StudentTopbar title="Dashboard" studentName="Fenil Patel" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header Greeting matching Image 2 Screen 4 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Good Morning, Fenil <span>👋</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Here&apos;s your internship progress for today.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/student/daily-reports">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs">
                <FileSpreadsheet className="w-4 h-4 mr-1.5" />
                Submit Daily Report
              </Button>
            </Link>
          </div>
        </div>

        {/* SECTION 87: SMART DASHBOARD LOGIC - Contextual Action Priority Banner */}
        {status === "IDLE" ? (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-500/10 border border-blue-200/80 text-xs font-semibold text-blue-900 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-blue-950">Action Required: Start Your Work Session</span>
                <p className="text-[11px] text-blue-700/80 mt-0.5 font-normal">
                  You haven&apos;t clocked in yet today. Click &quot;Clock In &amp; Start Work Session&quot; below to record certified attendance.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 shrink-0">
              Shift Pending
            </span>
          </div>
        ) : status === "WORKING" ? (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border border-emerald-200/80 text-xs font-semibold text-emerald-900 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <div>
                <span className="font-bold text-emerald-950">Live Shift Active ({hoursStr}:{minutesStr}:{secondsStr})</span>
                <p className="text-[11px] text-emerald-700/80 mt-0.5 font-normal">
                  Your work hours are actively logging to the database. Remember to take a break if stepping away.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
              Audit Active
            </span>
          </div>
        ) : status === "ON_BREAK" ? (
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs font-semibold text-amber-900 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <Coffee className="w-5 h-5 text-amber-600 animate-bounce shrink-0" />
              <div>
                <span className="font-bold text-amber-950">Shift Paused for Rest</span>
                <p className="text-[11px] text-amber-700 mt-0.5 font-normal">
                  Work timer is frozen. Click &quot;Resume Work Session&quot; below when you return to your desk.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 shrink-0">
              On Break
            </span>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs font-semibold text-blue-900 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <span className="font-bold text-blue-950">Today&apos;s Work Shift Audited &amp; Saved</span>
                <p className="text-[11px] text-blue-700 mt-0.5 font-normal">
                  Great job! You logged {hoursStr}h {minutesStr}m today. Start another shift whenever you are ready.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 shrink-0">
              Completed
            </span>
          </div>
        )}

        {message && (
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* 6 Main Statistics conforming strictly to Section 17 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5">
          {/* 1. Internship Progress */}
          <Card className="border-slate-200/90 shadow-2xs p-4 bg-white rounded-2xl h-[112px] flex flex-col justify-between hover:border-blue-200 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Internship Progress
              </span>
              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
            </div>
            <div>
              <div className="text-2xl font-black text-blue-600 font-mono leading-none">72%</div>
            </div>
            <div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: "72%" }} />
              </div>
              <span className="text-[10px] text-slate-500 font-semibold block mt-1">Week 8 of 12</span>
            </div>
          </Card>

          {/* 2. Attendance */}
          <Card className="border-slate-200/90 shadow-2xs p-4 bg-white rounded-2xl h-[112px] flex flex-col justify-between hover:border-emerald-200 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Attendance
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-600 font-mono leading-none">94%</div>
            </div>
            <div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: "94%" }} />
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold block mt-1 truncate">Eligible for Cert ✓</span>
            </div>
          </Card>

          {/* 3. Productive Hours */}
          <Card className="border-slate-200/90 shadow-2xs p-4 bg-white rounded-2xl h-[112px] flex flex-col justify-between hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Productive Hours
              </span>
              <span className="w-2 h-2 rounded-full bg-slate-900 shrink-0" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 font-mono leading-none">48.5h</div>
            </div>
            <div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-slate-900 h-full rounded-full transition-all duration-500" style={{ width: "85%" }} />
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold block mt-1">↑ 12% this week</span>
            </div>
          </Card>

          {/* 4. Tasks */}
          <Card className="border-slate-200/90 shadow-2xs p-4 bg-white rounded-2xl h-[112px] flex flex-col justify-between hover:border-blue-200 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Tasks Completed
              </span>
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 font-mono leading-none">5 / 7</div>
            </div>
            <div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: "71%" }} />
              </div>
              <span className="text-[10px] text-blue-600 font-semibold block mt-1">71% sprint rate</span>
            </div>
          </Card>

          {/* 5. Assessments */}
          <Card className="border-slate-200/90 shadow-2xs p-4 bg-white rounded-2xl h-[112px] flex flex-col justify-between hover:border-indigo-200 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Avg Assessment
              </span>
              <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
            </div>
            <div>
              <div className="text-2xl font-black text-indigo-600 font-mono leading-none">86%</div>
            </div>
            <div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: "86%" }} />
              </div>
              <span className="text-[10px] text-indigo-600 font-semibold block mt-1">Passed 4 tests</span>
            </div>
          </Card>

          {/* 6. Learning Progress */}
          <Card className="border-slate-200/90 shadow-2xs p-4 bg-white rounded-2xl h-[112px] flex flex-col justify-between hover:border-teal-200 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Learning Progress
              </span>
              <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
            </div>
            <div>
              <div className="text-2xl font-black text-teal-600 font-mono leading-none">8 / 12</div>
            </div>
            <div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-teal-500 h-full rounded-full transition-all duration-500" style={{ width: "67%" }} />
              </div>
              <span className="text-[10px] text-teal-600 font-semibold block mt-1">Modules done</span>
            </div>
          </Card>
        </div>

        {/* Golden Ratio 12-Column Layout: Work Session Centerpiece + Schedule & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Work Session Centerpiece (spans 7 cols on lg, 8 on xl) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            <WorkSessionWidget className="h-full" compact={false} />
          </div>

          {/* Right Column: Today's Schedule & Quick Actions (spans 5 cols on lg, 4 on xl) */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
            {/* Card 1: Today's Schedule Timeline */}
            <Card className="border-slate-200/90 shadow-xs p-5 sm:p-6 rounded-2xl bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  Today&apos;s Schedule
                </h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Active Shift
                </span>
              </div>
              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-bold text-slate-800">Morning Shift</span>
                  </div>
                  <span className="text-slate-500 font-mono text-[11px]">09:00 AM - 12:30 PM</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 border border-amber-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    <span className="font-bold text-amber-900">Lunch Break</span>
                  </div>
                  <span className="text-amber-700 font-mono text-[11px]">12:30 PM - 01:15 PM</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-bold text-slate-800">Afternoon Shift</span>
                  </div>
                  <span className="text-slate-500 font-mono text-[11px]">01:15 PM - 05:00 PM</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/60 border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                    <span className="font-medium text-slate-500">Clock Out</span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">05:00 PM</span>
                </div>
              </div>
            </Card>

            {/* Card 2: Quick Actions (Section 18) */}
            <Card className="border-slate-200/90 shadow-xs p-5 sm:p-6 rounded-2xl bg-white">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <Link
                  href="/student/daily-reports"
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/40 text-xs font-semibold text-slate-700 transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate">Daily Report</span>
                </Link>

                <Link
                  href="/student/tasks"
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/40 text-xs font-semibold text-slate-700 transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <ListTodo className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate">My Tasks</span>
                </Link>

                <Link
                  href="/student/learning"
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/40 text-xs font-semibold text-slate-700 transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate">Learning</span>
                </Link>

                <Link
                  href="/student/assessments"
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/40 text-xs font-semibold text-slate-700 transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate">Assessments</span>
                </Link>

                <Link
                  href="/student/calendar"
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/40 text-xs font-semibold text-slate-700 transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate">Calendar</span>
                </Link>

                <Link
                  href="/student/documents"
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/40 text-xs font-semibold text-slate-700 transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Award className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate">Documents</span>
                </Link>
              </div>
            </Card>
          </div>
        </div>

        {/* Section 22: Active Tasks Sprint Preview */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <ListTodo className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Active Tasks &amp; Sprint Goals</h3>
                <p className="text-xs text-slate-500">Track pending and in-progress assignments with real-time completion status.</p>
              </div>
            </div>
            <Link href="/student/tasks">
              <Button variant="outline" size="sm" className="text-xs font-bold text-blue-600 border-blue-200 hover:bg-blue-50">
                View All Tasks →
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-blue-200 transition-all">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  IN PROGRESS
                </span>
                <span className="text-[11px] font-mono text-slate-500">Due Today</span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 line-clamp-1">Build Dynamic Break System &amp; Shift Timer</h4>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">Next.js 16 • React 19 • State Management</p>
              <div className="mt-3">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold mb-1">
                  <span>Progress</span>
                  <span className="font-mono text-blue-600">80%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: "80%" }} />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-blue-200 transition-all">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  PENDING
                </span>
                <span className="text-[11px] font-mono text-slate-500">Due Tomorrow</span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 line-clamp-1">MCQ Assessment &amp; Automated Evaluation</h4>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">Python Fundamentals • Data Structures</p>
              <div className="mt-3">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold mb-1">
                  <span>Progress</span>
                  <span className="font-mono text-slate-500">0%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-slate-400 h-full rounded-full" style={{ width: "0%" }} />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-emerald-200 transition-all">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  COMPLETED
                </span>
                <span className="text-[11px] font-mono text-emerald-600">Audited ✓</span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 line-clamp-1">Free Multi-Step Registration &amp; Email OTP</h4>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">Resend API • Auth • Profile Schema</p>
              <div className="mt-3">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold mb-1">
                  <span>Progress</span>
                  <span className="font-mono text-emerald-600">100%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: "100%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTIONS 88 & 89: INTERNSHIP COMPLETION LOGIC & CERTIFICATE ELIGIBILITY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Certificate Eligibility Progress Card */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    Internship Completion Checklist
                  </h3>
                  <p className="text-xs text-slate-500">
                    Fulfill cohort requirements to unlock your verified credential and recommendation letter.
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-indigo-600 font-mono leading-none">92%</span>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  Eligibility Met
                </span>
              </div>
            </div>

            {/* Checklist conforming strictly to Section 88 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800">Required Attendance</span>
                    <span className="block text-[10px] text-slate-500">94% achieved (80% min)</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Pass</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800">Learning Modules</span>
                    <span className="block text-[10px] text-slate-500">8 of 12 completed</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Pass</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800">Assigned Tasks</span>
                    <span className="block text-[10px] text-slate-500">5 of 7 tasks finished</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Pass</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800">Daily Work Reports</span>
                    <span className="block text-[10px] text-slate-500">Audited &amp; signed off</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Pass</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800">MCQ Assessments</span>
                    <span className="block text-[10px] text-slate-500">86% avg score (75% min)</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Pass</span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-950">Certificate Sign-off</span>
                    <span className="block text-[10px] text-amber-700">Administrator review pending</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">Review</span>
              </div>
            </div>
          </div>

          {/* Section 95: Onboarding Quick-Start Guide */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Cohort Onboarding Roadmap</h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Step 3 of 5
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">✓</div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-emerald-950 block truncate">1. Free Registration &amp; Email OTP</span>
                  <span className="text-[10px] text-emerald-700">Zero fee submission verified</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">✓</div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-emerald-950 block truncate">2. Administrator Verification</span>
                  <span className="text-[10px] text-emerald-700">Account approved by Admin</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">✓</div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-emerald-950 block truncate">3. Program Selection &amp; Enrollment</span>
                  <span className="text-[10px] text-emerald-700">Full Stack Web Development active</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-blue-50/70 border border-blue-200">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">4</div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-blue-950 block truncate">4. Active Shift Hours &amp; Daily Reports</span>
                  <span className="text-[10px] text-blue-700">Clock in, take breaks, and submit reports</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-5 h-5 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">5</div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-700 block truncate">5. Certificate Claim &amp; Public Verification</span>
                  <span className="text-[10px] text-slate-400">Download cryptographically signed PDF</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
