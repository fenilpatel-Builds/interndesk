"use client";

import React, { useState } from "react";
import { StudentTopbar } from "@/components/student/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Award,
  Zap,
} from "lucide-react";
import { WorkSessionWidget } from "@/components/student/work-session-widget";
import { useWorkTimer } from "@/hooks/use-work-timer";

export default function StudentAttendancePage() {
  const [currentDate] = useState("Today, Oct 7, 2026");
  const {
    hoursStr,
    minutesStr,
    secondsStr,
    progressPercent,
    remainingFormatted,
    timeline,
    status,
  } = useWorkTimer();

  const weeklyAttendance = [
    { day: "Mon", date: "Oct 1", hours: "8h 15m", status: "PRESENT", percentage: 100 },
    { day: "Tue", date: "Oct 2", hours: "8h 00m", status: "PRESENT", percentage: 100 },
    { day: "Wed", date: "Oct 3", hours: "7h 45m", status: "PRESENT", percentage: 95 },
    { day: "Thu", date: "Oct 4", hours: "8h 30m", status: "PRESENT", percentage: 100 },
    { day: "Fri", date: "Oct 5", hours: `${hoursStr}h ${minutesStr}m`, status: "IN_PROGRESS", percentage: progressPercent },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <StudentTopbar title="Attendance & Work Sessions" studentName="Fenil Patel" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header & Date Switcher matching Image 2 Screen 5 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Attendance &amp; Work Session
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Live Audit
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time work shift monitoring, break logging, and automated attendance credit.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white shadow-2xs text-xs font-semibold text-slate-700">
              <button className="hover:text-blue-600 transition-colors cursor-pointer">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span>{currentDate}</span>
              <button className="hover:text-blue-600 transition-colors cursor-pointer">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <Button size="sm" variant="outline" className="text-xs font-bold rounded-xl h-8 cursor-pointer">
              Today
            </Button>
          </div>
        </div>

        {/* Top 2 Cards: Live Timer & Total Productive Hours */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Live Timer Card with Full Interactive GOAT Controls */}
          <div className="lg:col-span-7">
            <WorkSessionWidget compact={false} className="h-full" />
          </div>

          {/* Total Productive Hours Card */}
          <div className="lg:col-span-5">
            <Card className="border border-slate-200/90 shadow-xs p-6 h-full flex flex-col justify-between bg-white rounded-2xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Total Productive Hours
                  </h3>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <div className="text-4xl font-black text-slate-900 tracking-tight font-mono">
                    {hoursStr}h {minutesStr}m <span className="text-lg text-blue-600 font-bold">{secondsStr}s</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Daily Target: 8h 00m</p>
                </div>

                {/* Progress Bar & Indicators */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1 text-blue-600">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {progressPercent}% Complete
                    </span>
                    <span className="text-slate-500 font-medium">{remainingFormatted}</span>
                  </div>

                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200/60">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Shift Stats Footer */}
              <div className="pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Session Status
                  </span>
                  <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                    {status === "WORKING"
                      ? "Active & Productive"
                      : status === "ON_BREAK"
                      ? "Paused on Break"
                      : status === "COMPLETED"
                      ? "Completed for Day"
                      : "Ready to Clock In"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Weekly Attendance
                  </span>
                  <span className="text-xs font-bold text-emerald-600 mt-0.5 block">
                    98.5% (5/5 Days)
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Bottom 2 Cards: Work Session Timeline & Weekly Attendance */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Work Session Timeline */}
          <div className="lg:col-span-7">
            <Card className="border border-slate-200/90 shadow-xs p-6 bg-white rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Live Shift Timeline
                </h3>
                <span className="text-[11px] text-slate-400 font-semibold">
                  {timeline.length} logged events
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                {timeline.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          entry.type === "WORK" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                        }`}
                      />
                      <span className="font-mono text-slate-500 text-[11px]">
                        {entry.startTime} {entry.endTime ? `- ${entry.endTime}` : "— Present"}
                      </span>
                      <span className="font-bold text-slate-800">{entry.label}</span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        entry.type === "WORK"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {entry.type === "WORK" ? "Productive" : "Break"}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Weekly Attendance History */}
          <div className="lg:col-span-5">
            <Card className="border border-slate-200/90 shadow-xs p-6 bg-white rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  This Week&apos;s Attendance
                </h3>
                <span className="text-[11px] text-emerald-600 font-bold">100% Present</span>
              </div>

              <div className="space-y-3">
                {weeklyAttendance.map((item) => (
                  <div
                    key={item.day}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center">
                        {item.day}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{item.date}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {item.hours}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        item.status === "PRESENT"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200 animate-pulse"
                      }`}
                    >
                      {item.status === "PRESENT" ? "Present ✓" : "In Progress •"}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
