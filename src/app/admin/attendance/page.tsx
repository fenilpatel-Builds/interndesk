"use client";

import React, { useState } from "react";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Clock, Filter, Search } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminAttendancePage() {
  const [sessions] = useState([
    {
      id: "ws1",
      student: "Aarav Sharma",
      date: "2026-10-07",
      clockIn: "09:00 AM",
      clockOut: "-",
      totalDuration: "05h 42m",
      breakDuration: "01h 00m",
      productiveHours: "04h 42m",
      status: "WORKING",
    },
    {
      id: "ws2",
      student: "Priya Patel",
      date: "2026-10-07",
      clockIn: "09:15 AM",
      clockOut: "-",
      totalDuration: "05h 27m",
      breakDuration: "45m",
      productiveHours: "04h 42m",
      status: "ON_BREAK",
    },
    {
      id: "ws3",
      student: "Aarav Sharma",
      date: "2026-10-06",
      clockIn: "09:00 AM",
      clockOut: "05:00 PM",
      totalDuration: "08h 00m",
      breakDuration: "01h 15m",
      productiveHours: "06h 45m",
      status: "COMPLETED",
    },
  ]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <AdminTopbar title="Attendance & Work Sessions" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Work Sessions & Shift Tracking Log
          </h2>
          <p className="text-xs text-slate-500">
            Monitor real-time clock-ins, breaks, and productive durations computed with server timestamps.
          </p>
        </div>

        <Card className="border-slate-200/90 shadow-xs">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Student</th>
                  <th className="px-4 py-3.5">Work Date</th>
                  <th className="px-4 py-3.5">Clock In</th>
                  <th className="px-4 py-3.5">Clock Out</th>
                  <th className="px-4 py-3.5">Break Time</th>
                  <th className="px-4 py-3.5">Productive Hours</th>
                  <th className="px-6 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.map((sess) => (
                  <tr key={sess.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{sess.student}</td>
                    <td className="px-4 py-4 text-slate-600">{formatDate(sess.date)}</td>
                    <td className="px-4 py-4 font-mono">{sess.clockIn}</td>
                    <td className="px-4 py-4 font-mono">{sess.clockOut}</td>
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
