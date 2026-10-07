"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { StudentTopbar } from "@/components/student/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function StudentDashboardPage() {
  const [sessionState, setSessionState] = useState<"WORKING" | "ON_BREAK" | "COMPLETED">("WORKING");
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(16320); // 04h 32m initial
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

  const formatHoursMinutes = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    return `${hrs.toString().padStart(2, "0")}h ${mins.toString().padStart(2, "0")}m`;
  };

  const handleClockOut = () => {
    setSessionState("COMPLETED");
    setMessage("Shift clocked out. Productive hours saved to server.");
  };

  const handleTakeBreak = () => {
    if (sessionState === "WORKING") {
      setSessionState("ON_BREAK");
      setMessage("Session paused for break.");
    } else {
      setSessionState("WORKING");
      setMessage("Resumed working.");
    }
  };

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

        {message && (
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* 3 Top Stat Cards matching Image 2 Screen 4 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Work Hours */}
          <Card className="border-slate-200/90 shadow-xs p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Work Hours</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">48.5h</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">↑ 12%</div>
          </Card>

          {/* Tasks Completed */}
          <Card className="border-slate-200/90 shadow-xs p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Tasks Completed</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ListTodo className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">12</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">↑ 8%</div>
          </Card>

          {/* Attendance */}
          <Card className="border-slate-200/90 shadow-xs p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Attendance</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">92%</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">↑ 5%</div>
          </Card>
        </div>

        {/* 3 Middle Cards Grid matching Image 2 Screen 4 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Current Work Session */}
          <Card className="border-slate-200/90 shadow-xs flex flex-col justify-between p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Current Work Session</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  sessionState === "WORKING"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : sessionState === "ON_BREAK"
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-slate-100 text-slate-700 border border-slate-200"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    sessionState === "WORKING"
                      ? "bg-emerald-500 animate-pulse"
                      : sessionState === "ON_BREAK"
                      ? "bg-amber-500"
                      : "bg-slate-400"
                  }`} />
                  {sessionState === "WORKING" ? "Working" : sessionState === "ON_BREAK" ? "On Break" : "Completed"}
                </span>
              </div>

              <div>
                <div className="text-3xl font-black text-slate-900 tracking-tight">
                  {formatHoursMinutes(elapsedSeconds)}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Since 09:02 AM</p>
              </div>
            </div>

            <div className="space-y-2 pt-6">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                onClick={handleClockOut}
                disabled={sessionState === "COMPLETED"}
              >
                Clock Out
              </Button>
              <Button
                variant="outline"
                className="w-full border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50"
                onClick={handleTakeBreak}
                disabled={sessionState === "COMPLETED"}
              >
                {sessionState === "ON_BREAK" ? "Resume Work" : "Take Break"}
              </Button>
            </div>
          </Card>

          {/* Card 2: Today's Schedule Timeline */}
          <Card className="border-slate-200/90 shadow-xs p-6">
            <h3 className="text-xs font-bold text-slate-700 mb-4">Today&apos;s Schedule</h3>
            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-slate-500 font-mono text-[11px]">09:00 AM - 12:30 PM</span>
                <span className="font-bold text-slate-800">Work</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <span className="text-slate-500 font-mono text-[11px]">12:30 PM - 01:15 PM</span>
                <span className="font-bold text-slate-800">Lunch Break</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-slate-500 font-mono text-[11px]">01:15 PM - 05:00 PM</span>
                <span className="font-bold text-slate-800">Work</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                <span className="text-slate-400 font-mono text-[11px]">05:00 PM</span>
                <span className="text-slate-400 font-medium">Clock Out</span>
              </div>
            </div>
          </Card>

          {/* Card 3: Quick Actions */}
          <Card className="border-slate-200/90 shadow-xs p-6">
            <h3 className="text-xs font-bold text-slate-700 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href="/student/daily-reports"
                className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/40 text-xs font-semibold text-slate-700 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <span>Write Daily Report</span>
              </Link>

              <Link
                href="/student/learning"
                className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/40 text-xs font-semibold text-slate-700 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <span>View Study Material</span>
              </Link>

              <Link
                href="/student/assessments"
                className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/40 text-xs font-semibold text-slate-700 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Take Assessment</span>
              </Link>

              <Link
                href="/student/documents"
                className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/40 text-xs font-semibold text-slate-700 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Award className="w-3.5 h-3.5" />
                </div>
                <span>Download Certificate</span>
              </Link>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
