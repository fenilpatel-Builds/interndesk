"use client";

import React, { useState } from "react";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Filter,
  Search,
  Download,
  AlertTriangle,
  Users,
  Coffee,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface AttendanceRecord {
  id: string;
  student: string;
  email: string;
  program: string;
  date: string;
  clockIn: string;
  clockOut: string;
  totalDuration: string;
  breakDuration: string;
  productiveHours: string;
  status: "WORKING" | "ON_BREAK" | "COMPLETED" | "LATE";
  isLate?: boolean;
}

export default function AdminAttendancePage() {
  const [sessions, setSessions] = useState<AttendanceRecord[]>([
    {
      id: "ws1",
      student: "Fenil Patel",
      email: "fenil8918@gmail.com",
      program: "Full Stack Development Cohort",
      date: "2026-10-08",
      clockIn: "09:00 AM",
      clockOut: "-",
      totalDuration: "05h 42m",
      breakDuration: "01h 00m",
      productiveHours: "04h 42m",
      status: "WORKING",
      isLate: false,
    },
    {
      id: "ws2",
      student: "Aarav Sharma",
      email: "aarav@college.edu",
      program: "Python & AI Cohort",
      date: "2026-10-08",
      clockIn: "09:45 AM",
      clockOut: "-",
      totalDuration: "04h 15m",
      breakDuration: "30m",
      productiveHours: "03h 45m",
      status: "ON_BREAK",
      isLate: true,
    },
    {
      id: "ws3",
      student: "Priya Patel",
      email: "priya@university.edu",
      program: "Data Science Cohort",
      date: "2026-10-08",
      clockIn: "09:10 AM",
      clockOut: "05:15 PM",
      totalDuration: "08h 05m",
      breakDuration: "01h 00m",
      productiveHours: "07h 05m",
      status: "COMPLETED",
      isLate: false,
    },
    {
      id: "ws4",
      student: "Ananya Iyer",
      email: "ananya.iyer@engg.edu",
      program: "Full Stack Development Cohort",
      date: "2026-10-07",
      clockIn: "09:00 AM",
      clockOut: "05:00 PM",
      totalDuration: "08h 00m",
      breakDuration: "45m",
      productiveHours: "07h 15m",
      status: "COMPLETED",
      isLate: false,
    },
  ]);

  const [search, setSearch] = useState("");
  const [programFilter, setProgramFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [notice, setNotice] = useState<string | null>(null);

  const filtered = sessions.filter((s) => {
    const matchesSearch =
      s.student.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchesProg = programFilter === "ALL" || s.program === programFilter;
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "LATE" ? s.isLate : s.status === statusFilter);
    return matchesSearch && matchesProg && matchesStatus;
  });

  // Section 32: Export Attendance
  const handleExportAttendance = () => {
    const headers = [
      "Student Name",
      "Email",
      "Program",
      "Date",
      "Clock In",
      "Clock Out",
      "Total Time",
      "Break Duration",
      "Productive Hours",
      "Shift Status",
    ];

    const rows = filtered.map((s) => [
      `"${s.student}"`,
      `"${s.email}"`,
      `"${s.program}"`,
      s.date,
      s.clockIn,
      s.clockOut,
      s.totalDuration,
      s.breakDuration,
      s.productiveHours,
      s.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `interndesk_attendance_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setNotice(`Exported ${filtered.length} attendance shift record(s) to CSV.`);
  };

  const workingCount = sessions.filter((s) => s.status === "WORKING").length;
  const breakCount = sessions.filter((s) => s.status === "ON_BREAK").length;
  const completedCount = sessions.filter((s) => s.status === "COMPLETED").length;
  const lateCount = sessions.filter((s) => s.isLate).length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      <AdminTopbar title="Attendance & Work Sessions" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header & Export (Section 32) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Work Sessions &amp; Shift Tracking Center
            </h2>
            <p className="text-xs text-slate-500">
              Monitor live shift clock-ins, breaks, late arrivals, and total productive durations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs font-semibold gap-1.5"
              onClick={handleExportAttendance}
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              Export Attendance CSV
            </Button>
          </div>
        </div>

        {notice && (
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-800 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{notice}</span>
            </div>
            <button
              onClick={() => setNotice(null)}
              className="text-blue-500 hover:text-blue-800 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Section 32 KPI Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-slate-200 bg-white shadow-2xs p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500">
                Working Live Now
              </span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-2xl font-black text-slate-900 mt-1">{workingCount}</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Active shift timers</p>
          </Card>

          <Card className="border-slate-200 bg-white shadow-2xs p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500">
                On Break
              </span>
              <Coffee className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-slate-900 mt-1">{breakCount}</p>
            <p className="text-[11px] text-amber-600 font-semibold mt-0.5">Productive timer paused</p>
          </Card>

          <Card className="border-slate-200 bg-white shadow-2xs p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500">
                Shifts Completed
              </span>
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-black text-slate-900 mt-1">{completedCount}</p>
            <p className="text-[11px] text-blue-600 font-semibold mt-0.5">Punched out successfully</p>
          </Card>

          <Card className="border-slate-200 bg-white shadow-2xs p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500">
                Late Arrivals
              </span>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-2xl font-black text-slate-900 mt-1">{lateCount}</p>
            <p className="text-[11px] text-rose-600 font-semibold mt-0.5">Clocked in after 09:30 AM</p>
          </Card>
        </div>

        {/* Section 32: Filters Row */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 outline-none"
            >
              <option value="ALL">All Programs</option>
              <option value="Full Stack Development Cohort">Full Stack Development</option>
              <option value="Python & AI Cohort">Python &amp; AI</option>
              <option value="Data Science Cohort">Data Science</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="WORKING">Working</option>
              <option value="ON_BREAK">On Break</option>
              <option value="COMPLETED">Completed</option>
              <option value="LATE">Late Arrivals</option>
            </select>
          </div>
        </div>

        {/* Attendance Sessions Table (Section 32) */}
        <Card className="border-slate-200 bg-white rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-4 py-3.5">Program</th>
                  <th className="px-4 py-3.5">Work Date</th>
                  <th className="px-4 py-3.5">Clock In</th>
                  <th className="px-4 py-3.5">Clock Out</th>
                  <th className="px-4 py-3.5">Break Time</th>
                  <th className="px-4 py-3.5 font-bold">Productive Time</th>
                  <th className="px-5 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((sess) => (
                  <tr key={sess.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-slate-900 block">{sess.student}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{sess.email}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 font-medium">
                      {sess.program}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{formatDate(sess.date)}</td>
                    <td className="px-4 py-3.5 font-mono">
                      <span>{sess.clockIn}</span>
                      {sess.isLate && (
                        <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Late
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">
                      {sess.clockOut === "-" ? (
                        <span className="text-slate-400 italic">In progress</span>
                      ) : (
                        sess.clockOut
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 font-mono">{sess.breakDuration}</td>
                    <td className="px-4 py-3.5 font-bold font-mono text-emerald-700">
                      {sess.productiveHours}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <StatusBadge status={sess.status} />
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
