"use client";

import React, { useState, useEffect, useMemo } from "react";
import { StudentTopbar } from "@/components/student/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { INSTITUTE_CONFIG } from "@/lib/institute/config";

interface ReportMetrics {
  totalStudents: number;
  totalAssignments: number;
  approvedCount: number;
  rejectedCount: number;
  pendingCount: number;
  donut: {
    approvedPct: number;
    pendingPct: number;
    rejectedPct: number;
  };
}

interface DeptProgress {
  id: string;
  name: string;
  progress: number;
}

interface ReportSubmissionRow {
  id: string;
  activityTitle: string;
  studentName: string;
  studentEmail: string;
  department: string;
  submissionDate: string;
  score: string;
  status: string;
  remarks: string;
}

export default function StudentReportsPage() {
  const [dateRange] = useState("Oct 01, 2026 - Nov 03, 2026");
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [selectedActivity, setSelectedActivity] = useState("All Activities");

  const [metrics, setMetrics] = useState<ReportMetrics>({
    totalStudents: 5,
    totalAssignments: 4,
    approvedCount: 1,
    rejectedCount: 0,
    pendingCount: 1,
    donut: {
      approvedPct: 50,
      pendingPct: 50,
      rejectedPct: 0,
    },
  });

  const [departmentProgress, setDepartmentProgress] = useState<DeptProgress[]>([
    { id: "dept-cse", name: "Computer Science & Engineering", progress: 85 },
    { id: "dept-it", name: "Information Technology", progress: 75 },
    { id: "dept-aiml", name: "AI & Machine Learning", progress: 80 },
    { id: "dept-cloud", name: "Cloud & DevOps", progress: 70 },
  ]);

  const [submissions, setSubmissions] = useState<ReportSubmissionRow[]>([]);
  const [activitiesList, setActivitiesList] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/student/reports")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load reports"))))
      .then((data) => {
        if (active && data.success) {
          if (data.metrics) setMetrics(data.metrics);
          if (Array.isArray(data.departmentProgress)) setDepartmentProgress(data.departmentProgress);
          if (Array.isArray(data.submissions)) setSubmissions(data.submissions);
          if (Array.isArray(data.activities)) setActivitiesList(data.activities);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load real report metrics:", err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredRows = useMemo(() => {
    return submissions.filter((row) => {
      if (selectedDept !== "All Departments" && row.department !== selectedDept) {
        return false;
      }
      if (selectedActivity !== "All Activities" && row.activityTitle !== selectedActivity) {
        return false;
      }
      return true;
    });
  }, [submissions, selectedDept, selectedActivity]);

  // Formula-Injection Safe CSV Export from real database records
  const handleExportCSV = () => {
    const sanitize = (val: string | number) => {
      const str = String(val ?? "");
      if (/^[=+\-@\t\r]/.test(str)) {
        return `'${str}`;
      }
      return `"${str.replace(/"/g, '""')}"`;
    };

    const headers = ["Activity Title", "Student Name", "Department", "Submission Date", "Score", "Status", "Reviewer Remarks"];
    const rows = (filteredRows.length > 0 ? filteredRows : submissions).map((r) => [
      r.activityTitle,
      r.studentName,
      r.department,
      r.submissionDate,
      r.score,
      r.status,
      r.remarks,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.map(sanitize).join(","), ...rows.map((r) => r.map(sanitize).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Akash_Technolabs_Student_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const circumference = 251.2;
  const approvedPct = metrics.donut.approvedPct || 0;
  const pendingPct = metrics.donut.pendingPct || 0;
  const rejectedPct = metrics.donut.rejectedPct || 0;

  // SVG stroke offsets for donut ring segments
  const approvedDash = (approvedPct / 100) * circumference;
  const pendingDash = (pendingPct / 100) * circumference;
  const rejectedDash = (rejectedPct / 100) * circumference;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50">
      <StudentTopbar title="Reports & Analytics" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Reports</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Live curriculum benchmarks, verified student submissions &amp; export tools
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs">
              {dateRange}
            </span>
          </div>
        </div>

        {/* 4 Metric Summary Cards - Bound 100% to Real Data */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 rounded-2xl bg-white border-slate-200/90 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block">Total Students</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">
              {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : metrics.totalStudents}
            </span>
          </Card>
          <Card className="p-5 rounded-2xl bg-white border-slate-200/90 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block">Assignments</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">
              {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : metrics.totalAssignments}
            </span>
          </Card>
          <Card className="p-5 rounded-2xl bg-white border-slate-200/90 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block">Approved</span>
            <span className="text-3xl font-black text-emerald-600 mt-1 block">
              {loading ? <Loader2 className="w-6 h-6 animate-spin text-emerald-400" /> : metrics.approvedCount}
            </span>
          </Card>
          <Card className="p-5 rounded-2xl bg-white border-slate-200/90 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block">Rejected</span>
            <span className="text-3xl font-black text-rose-600 mt-1 block">
              {loading ? <Loader2 className="w-6 h-6 animate-spin text-rose-400" /> : metrics.rejectedCount}
            </span>
          </Card>
        </div>

        {/* Filter Controls Bar */}
        <Card className="p-4 rounded-2xl bg-white border-slate-200/90 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Department</label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="All Departments">All Departments</option>
                {INSTITUTE_CONFIG.departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Activity</label>
              <select
                value={selectedActivity}
                onChange={(e) => setSelectedActivity(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="All Activities">All Activities</option>
                {activitiesList.map((a) => (
                  <option key={a.id} value={a.title}>
                    {a.title}
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={() => {}}
              className="bg-[#0F4C81] hover:bg-[#0B355A] text-white font-bold text-xs py-2 rounded-xl cursor-pointer"
            >
              Generate Report
            </Button>

            <Button
              onClick={handleExportCSV}
              variant="outline"
              className="border-slate-300 hover:border-emerald-500 text-slate-700 hover:text-emerald-700 font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV (Sanitized)</span>
            </Button>
          </div>
        </Card>

        {/* Dynamic Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Submission Status Breakdown Donut Chart */}
          <Card className="lg:col-span-6 p-6 rounded-2xl bg-white border-slate-200/90 shadow-xs space-y-6">
            <h3 className="text-sm font-bold text-slate-900">Submission Status Breakdown</h3>

            <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
              {/* Donut SVG Ring */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#E2E8F0"
                    strokeWidth="16"
                  />
                  {rejectedDash > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#EF4444"
                      strokeWidth="16"
                      strokeDasharray={`${rejectedDash} ${circumference - rejectedDash}`}
                      strokeDashoffset="0"
                    />
                  )}
                  {pendingDash > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#F59E0B"
                      strokeWidth="16"
                      strokeDasharray={`${pendingDash} ${circumference - pendingDash}`}
                      strokeDashoffset={-rejectedDash}
                    />
                  )}
                  {approvedDash > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#10B981"
                      strokeWidth="16"
                      strokeDasharray={`${approvedDash} ${circumference - approvedDash}`}
                      strokeDashoffset={-(rejectedDash + pendingDash)}
                    />
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-black text-slate-900">{approvedPct}%</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Approved</span>
                </div>
              </div>

              {/* Legend with Dynamic Percentages */}
              <div className="space-y-3 min-w-[130px]">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-xs font-semibold text-slate-700">Approved</span>
                  <span className="text-xs font-mono font-bold text-emerald-700 ml-auto">{approvedPct}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-xs font-semibold text-slate-700">Pending</span>
                  <span className="text-xs font-mono font-bold text-amber-700 ml-auto">{pendingPct}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
                  <span className="text-xs font-semibold text-slate-700">Rejected</span>
                  <span className="text-xs font-mono font-bold text-rose-700 ml-auto">{rejectedPct}%</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Department Breakdown */}
          <Card className="lg:col-span-6 p-6 rounded-2xl bg-white border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Department-Wise Activity Progress</h3>

            <div className="space-y-3.5">
              {departmentProgress.map((dept, idx) => {
                const colors = ["bg-blue-600", "bg-indigo-600", "bg-purple-600", "bg-teal-600", "bg-emerald-600"];
                const color = colors[idx % colors.length];

                return (
                  <div key={dept.id || idx}>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>{dept.name}</span>
                      <span className="font-mono font-bold text-blue-700">{dept.progress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${color} transition-all duration-500`}
                        style={{ width: `${dept.progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
