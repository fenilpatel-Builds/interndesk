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
  Filter,
} from "lucide-react";
import { WorkSessionWidget } from "@/components/student/work-session-widget";
import { useWorkTimer } from "@/hooks/use-work-timer";

export default function StudentAttendancePage() {
  const [currentDate] = useState("Today, Oct 8, 2026");
  const [activeFilter, setActiveFilter] = useState<"TODAY" | "WEEK" | "MONTH" | "CUSTOM">("WEEK");

  const {
    hoursStr,
    minutesStr,
    secondsStr,
    progressPercent,
    timeline,
  } = useWorkTimer();

  // Full attendance history records matching Section 20
  const attendanceHistory = [
    {
      date: "Oct 8, 2026",
      clockIn: "09:00 AM",
      breaks: "2 (Lunch, Coffee)",
      clockOut: "In Progress",
      productiveHours: `${hoursStr}h ${minutesStr}m`,
      breakTime: "00h 45m",
      status: "IN_PROGRESS",
    },
    {
      date: "Oct 7, 2026",
      clockIn: "08:58 AM",
      breaks: "1 (Lunch)",
      clockOut: "05:15 PM",
      productiveHours: "07h 45m",
      breakTime: "00h 32m",
      status: "PRESENT",
    },
    {
      date: "Oct 6, 2026",
      clockIn: "09:05 AM",
      breaks: "2 (Coffee, Personal)",
      clockOut: "05:30 PM",
      productiveHours: "08h 10m",
      breakTime: "00h 25m",
      status: "PRESENT",
    },
    {
      date: "Oct 5, 2026",
      clockIn: "09:00 AM",
      breaks: "1 (Lunch)",
      clockOut: "05:00 PM",
      productiveHours: "08h 00m",
      breakTime: "00h 30m",
      status: "PRESENT",
    },
    {
      date: "Oct 4, 2026",
      clockIn: "09:12 AM",
      breaks: "2 (Lunch, Coffee)",
      clockOut: "05:40 PM",
      productiveHours: "08h 05m",
      breakTime: "00h 38m",
      status: "PRESENT",
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      <StudentTopbar title="Attendance & Work Sessions" studentName="Fenil Patel" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header & Date Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Attendance &amp; Live Work Sessions
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Audited Shifts
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Accurate hour tracking with dynamic break computation and certified attendance logging.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white shadow-2xs text-xs font-semibold text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>{currentDate}</span>
            </div>
          </div>
        </div>

        {/* Top 2 Cards: Live Timer & Total Productive Hours */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Live Timer Card with Full Interactive Controls */}
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

                {/* Circular / Linear Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600">Daily Completion</span>
                    <span className="text-blue-600">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Status footer banner */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Server-Validated Time</span>
                </div>
                <span className="text-slate-400 font-mono text-[11px]">Timezone: Asia/Kolkata</span>
              </div>
            </Card>
          </div>
        </div>

        {/* SECTION 20: ATTENDANCE HISTORY TABLE WITH FILTERS */}
        <Card className="border border-slate-200/90 shadow-xs bg-white rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Attendance History &amp; Work Shifts
              </h3>
              <p className="text-xs text-slate-500">
                Itemized shift records with clock-in, breaks, clock-out, and net productive hours.
              </p>
            </div>

            {/* Filter Pills: Today, Week, Month, Custom Date (Section 20) */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              {(["TODAY", "WEEK", "MONTH", "CUSTOM"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeFilter === f
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {f === "TODAY" ? "Today" : f === "WEEK" ? "Week" : f === "MONTH" ? "Month" : "Custom Date"}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-4">Clock In</th>
                  <th className="py-3 px-4">Breaks</th>
                  <th className="py-3 px-4">Clock Out</th>
                  <th className="py-3 px-4">Productive Hours</th>
                  <th className="py-3 px-4">Break Time</th>
                  <th className="py-3 px-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceHistory.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-900">{row.date}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">{row.clockIn}</td>
                    <td className="py-3.5 px-4 text-slate-600">{row.breaks}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">{row.clockOut}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">{row.productiveHours}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{row.breakTime}</td>
                    <td className="py-3.5 px-5 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          row.status === "PRESENT"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200 animate-pulse"
                        }`}
                      >
                        {row.status === "PRESENT" ? "Present ✓" : "In Progress •"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}
