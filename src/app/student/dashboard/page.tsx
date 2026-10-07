"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  Coffee,
  Play,
  CheckCircle2,
  FileSpreadsheet,
  BookOpen,
  Award,
  FileText,
  AlertCircle,
  TrendingUp,
  ListTodo,
} from "lucide-react";
import { StudentTopbar } from "@/components/student/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/utils";

export default function StudentDashboardPage() {
  const [sessionState, setSessionState] = useState<"NOT_STARTED" | "WORKING" | "ON_BREAK" | "COMPLETED">("NOT_STARTED");
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [breakType, setBreakType] = useState<string>("LUNCH");
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Timer loop when WORKING
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (sessionState === "WORKING") {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sessionState]);

  const handleClockIn = async () => {
    setIsActionLoading(true);
    setMessage(null);
    try {
      const now = new Date();
      setClockInTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      setSessionState("WORKING");
      setElapsedSeconds(0);
      setMessage("Clocked in successfully. Happy working!");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleTakeBreak = async () => {
    setIsActionLoading(true);
    setMessage(null);
    try {
      setSessionState("ON_BREAK");
      setMessage(`Break (${breakType}) started.`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleResume = async () => {
    setIsActionLoading(true);
    setMessage(null);
    try {
      setSessionState("WORKING");
      setMessage("Work resumed. Timer continuing.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    setIsActionLoading(true);
    setMessage(null);
    try {
      setSessionState("COMPLETED");
      setMessage("Clocked out successfully. Don't forget to submit your Daily Report!");
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <StudentTopbar title="Student Internship Dashboard" studentName="Aarav Sharma" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header Greeting (Section 15) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Good Morning, Aarav
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Domain: <span className="font-semibold text-blue-700">Modern Fullstack Web Development</span> • Batch 2026
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/student/daily-reports">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 font-semibold shadow-xs">
                <FileSpreadsheet className="w-4 h-4 mr-1.5" />
                Submit Daily Report
              </Button>
            </Link>
          </div>
        </div>

        {message && (
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Top KPI Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Today's Status"
            value={
              sessionState === "WORKING"
                ? "Working"
                : sessionState === "ON_BREAK"
                ? "On Break"
                : sessionState === "COMPLETED"
                ? "Clocked Out"
                : "Not Started"
            }
            subtitle={clockInTime ? `In at ${clockInTime}` : "Pending clock-in"}
            icon={<Clock className="w-5 h-5 text-blue-600" />}
          />
          <StatCard
            title="Work Hours Today"
            value={formatTime(elapsedSeconds)}
            subtitle="Server verified duration"
            icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          />
          <StatCard
            title="Attendance"
            value="92.4%"
            subtitle="Requirement: Min 80% ✓"
            icon={<CheckCircle2 className="w-5 h-5 text-indigo-600" />}
          />
          <StatCard
            title="Tasks Completed"
            value="14 / 16"
            subtitle="2 tickets pending review"
            icon={<ListTodo className="w-5 h-5 text-amber-600" />}
          />
        </div>

        {/* MAIN WORK SESSION ENGINE CARD (Section 15 & 16) */}
        <Card className="border-slate-200/90 shadow-xs">
          <CardHeader className="py-4 px-6 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Today&apos;s Active Work Session</CardTitle>
              <p className="text-xs text-slate-500">Live productive tracker with break management</p>
            </div>
            <StatusBadge status={sessionState} />
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Timer & State Actions */}
              <div className="lg:col-span-7 space-y-5">
                <div className="p-6 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
                      Live Productive Timer
                    </span>
                    <div className="text-4xl sm:text-5xl font-mono font-bold tracking-widest text-white mt-1">
                      {formatTime(elapsedSeconds)}
                    </div>
                    <span className="text-[11px] text-blue-400 mt-1 block">
                      {sessionState === "WORKING"
                        ? "● Session actively recording productive time"
                        : sessionState === "ON_BREAK"
                        ? "⏸ Paused for break"
                        : sessionState === "COMPLETED"
                        ? "✓ Session finished for today"
                        : "Ready to start today's shift"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 w-full sm:w-auto">
                    {sessionState === "NOT_STARTED" && (
                      <Button
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700 font-bold px-8 shadow-md"
                        onClick={handleClockIn}
                        isLoading={isActionLoading}
                      >
                        <Play className="w-5 h-5 mr-2" />
                        Clock In
                      </Button>
                    )}

                    {sessionState === "WORKING" && (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <select
                            value={breakType}
                            onChange={(e) => setBreakType(e.target.value)}
                            className="bg-slate-800 text-white text-xs border border-slate-700 rounded-lg px-2.5 py-2 focus:outline-none"
                          >
                            <option value="LUNCH">Lunch Break</option>
                            <option value="TEA">Tea Break</option>
                            <option value="WATER">Water Break</option>
                            <option value="PERSONAL">Personal</option>
                          </select>
                          <Button
                            variant="secondary"
                            size="md"
                            className="font-semibold text-xs"
                            onClick={handleTakeBreak}
                            isLoading={isActionLoading}
                          >
                            <Coffee className="w-4 h-4 mr-1.5" />
                            Take Break
                          </Button>
                        </div>
                        <Button
                          variant="danger"
                          size="md"
                          className="font-semibold text-xs"
                          onClick={handleClockOut}
                          isLoading={isActionLoading}
                        >
                          Clock Out Shift
                        </Button>
                      </div>
                    )}

                    {sessionState === "ON_BREAK" && (
                      <Button
                        size="lg"
                        className="bg-emerald-600 hover:bg-emerald-700 font-bold px-8"
                        onClick={handleResume}
                        isLoading={isActionLoading}
                      >
                        <Play className="w-4 h-4 mr-1.5" />
                        Resume Work
                      </Button>
                    )}

                    {sessionState === "COMPLETED" && (
                      <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
                        Shift Complete for Today
                      </div>
                    )}
                  </div>
                </div>

                {/* Session Timeline */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Session Sequence
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-600 overflow-x-auto py-1">
                    <span className={`px-2.5 py-1 rounded-md font-semibold border ${clockInTime ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                      1. Clock In {clockInTime && `(${clockInTime})`}
                    </span>
                    <span>→</span>
                    <span className={`px-2.5 py-1 rounded-md font-semibold border ${sessionState === "WORKING" || sessionState === "ON_BREAK" || sessionState === "COMPLETED" ? "bg-blue-50 text-blue-800 border-blue-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                      2. Work
                    </span>
                    <span>→</span>
                    <span className={`px-2.5 py-1 rounded-md font-semibold border ${sessionState === "ON_BREAK" ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                      3. Break
                    </span>
                    <span>→</span>
                    <span className={`px-2.5 py-1 rounded-md font-semibold border ${sessionState === "COMPLETED" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                      4. Clock Out
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Quick Actions (Section 15) */}
              <div className="lg:col-span-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Quick Actions
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/student/daily-reports">
                    <div className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-slate-50 transition-all text-left space-y-1 group">
                      <FileSpreadsheet className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-bold text-slate-900">Daily Report</p>
                      <p className="text-[10px] text-slate-500">Record hourly logs</p>
                    </div>
                  </Link>

                  <Link href="/student/learning">
                    <div className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 bg-white hover:bg-slate-50 transition-all text-left space-y-1 group">
                      <BookOpen className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-bold text-slate-900">Study Materials</p>
                      <p className="text-[10px] text-slate-500">Course curriculum</p>
                    </div>
                  </Link>

                  <Link href="/student/assessments">
                    <div className="p-3.5 rounded-xl border border-slate-200 hover:border-amber-400 bg-white hover:bg-slate-50 transition-all text-left space-y-1 group">
                      <Award className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-bold text-slate-900">Assessments</p>
                      <p className="text-[10px] text-slate-500">MCQ examinations</p>
                    </div>
                  </Link>

                  <Link href="/student/documents">
                    <div className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-400 bg-white hover:bg-slate-50 transition-all text-left space-y-1 group">
                      <FileText className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-bold text-slate-900">Documents</p>
                      <p className="text-[10px] text-slate-500">Offer & Certificate</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Internship Progress Tracker (Section 51) */}
        <Card className="border-slate-200/90 shadow-xs">
          <CardHeader className="py-4 px-6 border-b border-slate-100">
            <CardTitle className="text-base font-bold">Internship Graduation Roadmap</CardTitle>
            <p className="text-xs text-slate-500">Requirements necessary to unlock your verified Certificate of Completion</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
                <span className="text-[11px] font-bold text-slate-900 block">Registration</span>
                <span className="text-[10px] text-emerald-700 font-semibold">Completed ✓</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
                <span className="text-[11px] font-bold text-slate-900 block">Payment Fee</span>
                <span className="text-[10px] text-emerald-700 font-semibold">₹1,000 Verified ✓</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
                <span className="text-[11px] font-bold text-slate-900 block">Admin Sign-off</span>
                <span className="text-[10px] text-emerald-700 font-semibold">Approved ✓</span>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
                <div className="text-sm font-black text-blue-700">92%</div>
                <span className="text-[11px] font-bold text-slate-900 block">Attendance</span>
                <span className="text-[10px] text-blue-700 font-semibold">Target: 80% ✓</span>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
                <div className="text-sm font-black text-blue-700">14 / 16</div>
                <span className="text-[11px] font-bold text-slate-900 block">Assigned Tasks</span>
                <span className="text-[10px] text-blue-700 font-semibold">In Progress</span>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
                <div className="text-sm font-black text-blue-700">4 / 5</div>
                <span className="text-[11px] font-bold text-slate-900 block">Assessments</span>
                <span className="text-[10px] text-blue-700 font-semibold">Passed (Avg 86%)</span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                <Award className="w-5 h-5 text-amber-600 mx-auto" />
                <span className="text-[11px] font-bold text-slate-900 block">Certificate</span>
                <span className="text-[10px] text-amber-700 font-semibold">Pending Approval</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
