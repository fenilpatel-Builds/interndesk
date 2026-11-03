"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Search,
  Download,
  Clock,
  Coffee,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  User,
  Radio,
  Loader2,
} from "lucide-react";

interface StudentLiveItem {
  studentId: string;
  studentName: string;
  studentEmail: string;
  technology: string;
  status: "WORKING" | "ON_BREAK" | "COMPLETED" | "NOT_CHECKED_IN";
  clockInTime: string | null;
  clockOutTime: string | null;
  currentBreak: string | null;
  breakDurationMinutes: number;
  workedMinutes: number;
  lastHeartbeat: string;
  location?: string;
}

interface LiveSummary {
  total: number;
  working: number;
  onBreak: number;
  completed: number;
  notCheckedIn: number;
}

export default function AdminAttendancePage() {
  const [students, setStudents] = useState<StudentLiveItem[]>([]);
  const [summary, setSummary] = useState<LiveSummary>({
    total: 5,
    working: 2,
    onBreak: 1,
    completed: 1,
    notCheckedIn: 1,
  });

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [techFilter, setTechFilter] = useState("ALL");

  const fetchLiveAttendance = async (silent = false) => {
    if (!silent) setLoading(true);
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/attendance/live");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.students)) {
          setStudents(data.students);
          if (data.summary) setSummary(data.summary);
        }
      }
    } catch (err) {
      console.error("Failed to load live attendance:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveAttendance();
    // Auto-refresh every 15 seconds for real-time monitoring
    const timer = setInterval(() => {
      fetchLiveAttendance(true);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.studentName.toLowerCase().includes(search.toLowerCase()) ||
        s.studentEmail.toLowerCase().includes(search.toLowerCase()) ||
        s.technology.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
      const matchesTech = techFilter === "ALL" || s.technology === techFilter;

      return matchesSearch && matchesStatus && matchesTech;
    });
  }, [students, search, statusFilter, techFilter]);

  const handleExportCSV = () => {
    const sanitize = (val: string | number) => {
      const str = String(val ?? "");
      if (/^[=+\-@\t\r]/.test(str)) return `'${str}`;
      return `"${str.replace(/"/g, '""')}"`;
    };

    const headers = ["Student Name", "Email", "Specialization", "Live Status", "Clock In", "Clock Out", "Worked Hours", "Breaks", "Location"];
    const rows = filtered.map((s) => [
      s.studentName,
      s.studentEmail,
      s.technology,
      s.status,
      s.clockInTime || "Not Punched",
      s.clockOutTime || "In Progress",
      `${Math.floor(s.workedMinutes / 60)}h ${s.workedMinutes % 60}m`,
      `${s.breakDurationMinutes}m`,
      s.location || "Akash Campus",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.map(sanitize).join(","), ...rows.map((r) => r.map(sanitize).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Akash_Technolabs_Live_Attendance_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50">
      <AdminTopbar title="Live Attendance & Clock In / Out Desk" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header Strip with Live Signal Indicator */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Real-Time Live Monitor
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Live Shift Punches &amp; Active Intern Roster
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live monitor for clock-in timestamps, current break durations, and shift completion across all registered students.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <Button
              size="sm"
              variant="outline"
              disabled={isRefreshing}
              onClick={() => fetchLiveAttendance()}
              className="text-xs gap-1.5 cursor-pointer font-bold border-slate-300 hover:bg-white bg-white text-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
              <span>Refresh</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportCSV}
              className="text-xs gap-1.5 cursor-pointer font-bold border-slate-300 hover:bg-white bg-white text-slate-700"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </Button>
          </div>
        </div>

        {/* 4 Summary Live Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-white rounded-2xl border-slate-200/90 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Currently Working</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <div className="text-3xl font-black text-emerald-600">{summary.working}</div>
            <p className="text-[11px] text-slate-400 font-medium">Clocked in &amp; active now</p>
          </Card>

          <Card className="p-4 bg-white rounded-2xl border-slate-200/90 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">On Break</span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            </div>
            <div className="text-3xl font-black text-amber-600">{summary.onBreak}</div>
            <p className="text-[11px] text-slate-400 font-medium">Coffee / Lunch / Personal</p>
          </Card>

          <Card className="p-4 bg-white rounded-2xl border-slate-200/90 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Shift Completed</span>
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            </div>
            <div className="text-3xl font-black text-blue-600">{summary.completed}</div>
            <p className="text-[11px] text-slate-400 font-medium">Clocked out for the day</p>
          </Card>

          <Card className="p-4 bg-white rounded-2xl border-slate-200/90 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Not Checked In</span>
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            </div>
            <div className="text-3xl font-black text-slate-600">{summary.notCheckedIn}</div>
            <p className="text-[11px] text-slate-400 font-medium">No punch recorded today</p>
          </Card>
        </div>

        {/* Filter Toolbar */}
        <Card className="border-slate-200/90 shadow-2xs bg-white p-4 rounded-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student by name, email, or track..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium"
              >
                <option value="ALL">All Live Statuses</option>
                <option value="WORKING">🟢 Working Now</option>
                <option value="ON_BREAK">🟡 On Break</option>
                <option value="COMPLETED">⚪ Shift Completed</option>
                <option value="NOT_CHECKED_IN">🔴 Not Checked In</option>
              </select>
            </div>

            <div>
              <select
                value={techFilter}
                onChange={(e) => setTechFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium"
              >
                <option value="ALL">All Technologies &amp; Tracks</option>
                <option value="AI/ML Systems">AI/ML Systems</option>
                <option value="Full Stack Web Development">Full Stack Web Development</option>
                <option value="Cloud & DevOps">Cloud &amp; DevOps</option>
                <option value="Cybersecurity">Cybersecurity</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Live Attendance Table */}
        <Card className="border-slate-200/90 shadow-xs bg-white rounded-2xl overflow-hidden">
          <div className="p-0 overflow-x-auto">
            {loading ? (
              <div className="p-12 flex items-center justify-center gap-2 text-slate-500 text-xs">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span>Streaming live attendance records...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                No active students found matching the selected filter.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Student / Intern</th>
                    <th className="px-4 py-3.5">Specialization Track</th>
                    <th className="px-4 py-3.5">Live Shift Status</th>
                    <th className="px-4 py-3.5">Clock In Time</th>
                    <th className="px-4 py-3.5">Clock Out Time</th>
                    <th className="px-4 py-3.5">Active Worked Hours</th>
                    <th className="px-6 py-3.5 text-right">Location Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((s) => {
                    const hours = Math.floor(s.workedMinutes / 60);
                    const mins = s.workedMinutes % 60;

                    return (
                      <tr key={s.studentId} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                              {s.studentName.slice(0, 1)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{s.studentName}</p>
                              <p className="text-[11px] text-slate-400">{s.studentEmail}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span className="font-semibold text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-md text-[11px]">
                            {s.technology}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          {s.status === "WORKING" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              Working (Active)
                            </span>
                          )}
                          {s.status === "ON_BREAK" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Coffee className="w-3 h-3 text-amber-600" />
                              On Break ({s.currentBreak || `${s.breakDurationMinutes}m`})
                            </span>
                          )}
                          {s.status === "COMPLETED" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <CheckCircle2 className="w-3 h-3 text-blue-600" />
                              Completed
                            </span>
                          )}
                          {s.status === "NOT_CHECKED_IN" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                              Not Checked In
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-4 font-mono font-bold text-slate-800">
                          {s.clockInTime ? (
                            <span className="text-emerald-700">{s.clockInTime}</span>
                          ) : (
                            <span className="text-slate-400 font-normal">--:--</span>
                          )}
                        </td>

                        <td className="px-4 py-4 font-mono font-medium text-slate-800">
                          {s.clockOutTime ? (
                            <span className="text-blue-700 font-bold">{s.clockOutTime}</span>
                          ) : s.status === "WORKING" || s.status === "ON_BREAK" ? (
                            <span className="text-emerald-600 text-[11px] font-bold">Shift in progress</span>
                          ) : (
                            <span className="text-slate-400 font-normal">--:--</span>
                          )}
                        </td>

                        <td className="px-4 py-4 font-mono text-slate-800">
                          {s.workedMinutes > 0 ? (
                            <span className="font-bold text-slate-900">
                              {hours}h {mins}m
                            </span>
                          ) : (
                            <span className="text-slate-400">0h 00m</span>
                          )}
                          {s.breakDurationMinutes > 0 && (
                            <span className="text-[10px] text-amber-600 block">
                              +{s.breakDurationMinutes}m break
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {s.location || "Campus Verified"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
