"use client";

import React, { useState } from "react";
import { StudentTopbar } from "@/components/student/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Clock, Calendar, CheckCircle2, TrendingUp } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function StudentAttendancePage() {
  const [sessions] = useState([
    {
      id: "s1",
      date: "2026-10-07",
      clockIn: "09:00 AM",
      clockOut: "-",
      totalDuration: "05h 42m",
      breakDuration: "01h 00m",
      productiveHours: "04h 42m",
      status: "WORKING",
    },
    {
      id: "s2",
      date: "2026-10-06",
      clockIn: "09:00 AM",
      clockOut: "05:00 PM",
      totalDuration: "08h 00m",
      breakDuration: "01h 15m",
      productiveHours: "06h 45m",
      status: "COMPLETED",
    },
    {
      id: "s3",
      date: "2026-10-05",
      clockIn: "09:00 AM",
      clockOut: "05:15 PM",
      totalDuration: "08h 15m",
      breakDuration: "01h 00m",
      productiveHours: "07h 15m",
      status: "COMPLETED",
    },
    {
      id: "s4",
      date: "2026-10-04",
      clockIn: "09:05 AM",
      clockOut: "05:00 PM",
      totalDuration: "07h 55m",
      breakDuration: "01h 10m",
      productiveHours: "06h 45m",
      status: "COMPLETED",
    },
  ]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <StudentTopbar title="Attendance & Work Sessions" studentName="Aarav Sharma" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              My Attendance & Productivity History
            </h2>
            <p className="text-xs text-slate-500">
              Verified daily work sessions calculated with official server timestamps.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
              Current Attendance Rate: 92.4% (Threshold: 80%) ✓
            </span>
          </div>
        </div>

        <Card className="border-slate-200/90 shadow-xs">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Work Date</th>
                  <th className="px-4 py-3.5">Clock In</th>
                  <th className="px-4 py-3.5">Clock Out</th>
                  <th className="px-4 py-3.5">Total Duration</th>
                  <th className="px-4 py-3.5">Break Time</th>
                  <th className="px-4 py-3.5">Productive Hours</th>
                  <th className="px-6 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.map((sess) => (
                  <tr key={sess.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {formatDate(sess.date)}
                    </td>
                    <td className="px-4 py-4 font-mono">{sess.clockIn}</td>
                    <td className="px-4 py-4 font-mono">{sess.clockOut}</td>
                    <td className="px-4 py-4 text-slate-600">{sess.totalDuration}</td>
                    <td className="px-4 py-4 text-slate-500">{sess.breakDuration}</td>
                    <td className="px-4 py-4 font-bold text-emerald-700">{sess.productiveHours}</td>
                    <td className="px-6 py-4 text-right">
                      <StatusBadge status={sess.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
