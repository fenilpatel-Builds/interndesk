"use client";

import React, { useState } from "react";
import { StudentTopbar } from "@/components/student/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { INSTITUTE_CONFIG } from "@/lib/institute/config";

export default function StudentReportsPage() {
  const [dateRange, setDateRange] = useState("Oct 01, 2026 - Oct 27, 2026");
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [selectedActivity, setSelectedActivity] = useState("All Activities");

  // Formula-Injection Safe CSV Export
  const handleExportCSV = () => {
    const sanitize = (val: string | number) => {
      const str = String(val);
      if (/^[=+\-@\t\r]/.test(str)) {
        return `'${str}`;
      }
      return `"${str.replace(/"/g, '""')}"`;
    };

    const headers = ["Activity Title", "Department", "Submission Date", "Score", "Status", "Reviewer Remarks"];
    const rows = [
      ["Web Development Assignment", "Computer Science", "2026-10-25", "92/100", "Approved", "Clean architecture and modular React components."],
      ["Research Paper Submission", "Information Technology", "2026-10-24", "88/100", "Approved", "Thorough literature review and analysis."],
      ["Data Structures Quiz", "Computer Science", "2026-10-22", "95/100", "Approved", "Excellent algorithmic performance."],
      ["UI/UX Design Project", "Computer Science", "2026-10-20", "Pending", "In Review", "Under faculty supervisor review."],
      ["Cloud Infrastructure Lab", "Cloud & DevOps", "2026-10-18", "65/100", "Rejected", "Need to include Docker Compose configuration."],
    ];

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

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50">
      <StudentTopbar title="Reports & Analytics" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header matching Image 1 Bottom Reports */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Reports</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Generate and export reports for deeper insights
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700">
              {dateRange}
            </span>
          </div>
        </div>

        {/* 4 Metric Summary Cards matching Image 1 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 rounded-2xl bg-white border-slate-200/90 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block">Total Students</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">245</span>
          </Card>
          <Card className="p-5 rounded-2xl bg-white border-slate-200/90 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block">Assignments</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">32</span>
          </Card>
          <Card className="p-5 rounded-2xl bg-white border-slate-200/90 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block">Approved</span>
            <span className="text-3xl font-black text-emerald-600 mt-1 block">28</span>
          </Card>
          <Card className="p-5 rounded-2xl bg-white border-slate-200/90 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block">Rejected</span>
            <span className="text-3xl font-black text-rose-600 mt-1 block">4</span>
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
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
              >
                <option value="All Departments">All Departments</option>
                {INSTITUTE_CONFIG.departments.map((d) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Activity</label>
              <select
                value={selectedActivity}
                onChange={(e) => setSelectedActivity(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
              >
                <option value="All Activities">All Activities</option>
                <option value="Web Development Assignment">Web Development Assignment</option>
                <option value="Research Paper Submission">Research Paper Submission</option>
                <option value="Data Structures Quiz">Data Structures Quiz</option>
              </select>
            </div>

            <Button className="bg-[#0F4C81] hover:bg-[#0B355A] text-white font-bold text-xs py-2 rounded-xl">
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

        {/* Donut Chart matching Image 1 Bottom Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-6 p-6 rounded-2xl bg-white border-slate-200/90 shadow-xs space-y-6">
            <h3 className="text-sm font-bold text-slate-900">Submission Status Breakdown</h3>

            <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
              {/* Donut SVG Ring */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#EF4444" strokeWidth="16" strokeDasharray="251.2" strokeDashoffset="0" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F59E0B" strokeWidth="16" strokeDasharray="251.2" strokeDashoffset="25.1" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10B981" strokeWidth="16" strokeDasharray="251.2" strokeDashoffset="70.3" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-black text-slate-900">72%</span>
                  <span className="text-[10px] font-bold text-slate-400">APPROVED</span>
                </div>
              </div>

              {/* Legend with percentages matching Image 1 */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-slate-700">Approved</span>
                  <span className="text-xs font-mono font-bold text-emerald-700 ml-auto">72%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-xs font-semibold text-slate-700">Pending</span>
                  <span className="text-xs font-mono font-bold text-amber-700 ml-auto">18%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-xs font-semibold text-slate-700">Rejected</span>
                  <span className="text-xs font-mono font-bold text-rose-700 ml-auto">10%</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Department Breakdown */}
          <Card className="lg:col-span-6 p-6 rounded-2xl bg-white border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Department-Wise Activity Progress</h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Computer Science &amp; Engineering</span>
                  <span className="font-mono font-bold text-blue-600">88%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: "88%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Information Technology</span>
                  <span className="font-mono font-bold text-indigo-600">76%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-indigo-600" style={{ width: "76%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>AI &amp; Machine Learning</span>
                  <span className="font-mono font-bold text-purple-600">82%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-purple-600" style={{ width: "82%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Cloud &amp; DevOps</span>
                  <span className="font-mono font-bold text-teal-600">70%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-teal-600" style={{ width: "70%" }} />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
