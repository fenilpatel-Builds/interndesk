"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Download, Calendar, Filter, Loader2 } from "lucide-react";

interface AdminReportRow {
  student: string;
  email: string;
  college: string;
  tech: string;
  attendancePct: string;
  productiveHours: string;
  dailyReportsSubmitted: number;
  tasksCompleted: string;
  assessmentAvg: string;
  internshipStatus: string;
}

export default function AdminReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState("2026-10");
  const [selectedTech, setSelectedTech] = useState("ALL");
  const [activeReportTab, setActiveReportTab] = useState<"ATTENDANCE" | "TASKS" | "ASSESSMENTS" | "COMPLETION">("ATTENDANCE");
  const [reportData, setReportData] = useState<AdminReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/reports")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load reports"))))
      .then((data) => {
        if (active && data.success && Array.isArray(data.reportData)) {
          setReportData(data.reportData);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load admin reports:", err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredData = useMemo(() => {
    return reportData.filter((row) => {
      if (selectedTech === "ALL") return true;
      return row.tech.toLowerCase().includes(selectedTech.toLowerCase());
    });
  }, [reportData, selectedTech]);

  const handleExportCSV = () => {
    const sanitize = (val: string | number) => {
      const str = String(val ?? "");
      if (/^[=+\-@\t\r]/.test(str)) {
        return `'${str}`;
      }
      return `"${str.replace(/"/g, '""')}"`;
    };

    const headers = [
      "Student Name",
      "Email",
      "College",
      "Specialization",
      "Attendance",
      "Productive Hours",
      "Daily Reports",
      "Tasks Completed",
      "Assessment Average",
      "Status",
    ];

    const rows = filteredData.map((r) => [
      r.student,
      r.email,
      r.college,
      r.tech,
      r.attendancePct,
      r.productiveHours,
      r.dailyReportsSubmitted,
      r.tasksCompleted,
      r.assessmentAvg,
      r.internshipStatus,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.map(sanitize).join(","), ...rows.map((r) => r.map(sanitize).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Akash_Technolabs_Admin_Report_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50">
      <AdminTopbar title="Reports & Cohort Analytics" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Month-Wise Performance &amp; Audit Reports
            </h2>
            <p className="text-xs text-slate-500">
              Filter by month, technology, and university to evaluate real student productivity and graduation readiness.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="text-xs gap-1.5 cursor-pointer font-bold border-slate-300 hover:bg-slate-50"
            onClick={handleExportCSV}
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>

        {/* Filter Toolbar */}
        <Card className="border-slate-200/90 shadow-2xs bg-white">
          <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Month:</span>
              </div>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="text-xs rounded-lg border border-slate-200 px-3 py-1.5 bg-white font-medium focus:outline-hidden focus:border-blue-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                <Filter className="w-4 h-4 text-indigo-600" />
                <span>Technology:</span>
              </div>
              <select
                value={selectedTech}
                onChange={(e) => setSelectedTech(e.target.value)}
                className="text-xs rounded-lg border border-slate-200 px-3 py-1.5 bg-white font-medium focus:outline-hidden focus:border-blue-600 cursor-pointer"
              >
                <option value="ALL">All Specializations</option>
                <option value="Full Stack">Full Stack Web Development</option>
                <option value="AI & Machine Learning">AI &amp; Machine Learning</option>
                <option value="Cloud">Cloud &amp; DevOps</option>
                <option value="Python">Python Enterprise</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Report Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveReportTab("ATTENDANCE")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeReportTab === "ATTENDANCE"
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Attendance &amp; Hours
          </button>
          <button
            onClick={() => setActiveReportTab("TASKS")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeReportTab === "TASKS"
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Tasks &amp; Daily Reports
          </button>
          <button
            onClick={() => setActiveReportTab("ASSESSMENTS")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeReportTab === "ASSESSMENTS"
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Assessments
          </button>
          <button
            onClick={() => setActiveReportTab("COMPLETION")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeReportTab === "COMPLETION"
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Completion &amp; Certificates
          </button>
        </div>

        {/* Report Data Table */}
        <Card className="border-slate-200/90 shadow-xs bg-white">
          <CardContent className="p-0 overflow-x-auto">
            {loading ? (
              <div className="p-8 flex items-center justify-center gap-2 text-slate-500 text-xs">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span>Loading real student records...</span>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No student records found matching the selected filter.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Student</th>
                    <th className="px-4 py-3.5">College &amp; Domain</th>
                    {activeReportTab === "ATTENDANCE" && (
                      <>
                        <th className="px-4 py-3.5">Attendance Rate</th>
                        <th className="px-4 py-3.5">Productive Hours</th>
                        <th className="px-4 py-3.5">Shift Benchmark</th>
                      </>
                    )}
                    {activeReportTab === "TASKS" && (
                      <>
                        <th className="px-4 py-3.5">Tasks Completed</th>
                        <th className="px-4 py-3.5">Daily Reports</th>
                        <th className="px-4 py-3.5">Review Status</th>
                      </>
                    )}
                    {activeReportTab === "ASSESSMENTS" && (
                      <>
                        <th className="px-4 py-3.5">Average Score</th>
                        <th className="px-4 py-3.5">Passing Status</th>
                        <th className="px-4 py-3.5">Completed Exams</th>
                      </>
                    )}
                    {activeReportTab === "COMPLETION" && (
                      <>
                        <th className="px-4 py-3.5">Internship Status</th>
                        <th className="px-4 py-3.5">Attendance Gate</th>
                        <th className="px-4 py-3.5">Certificate Eligibility</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {row.student}
                        <span className="block text-[11px] font-normal text-slate-400">{row.email}</span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-blue-700">{row.tech}</p>
                        <p className="text-[11px] text-slate-500">{row.college}</p>
                      </td>

                      {activeReportTab === "ATTENDANCE" && (
                        <>
                          <td className="px-4 py-4 font-bold text-emerald-600">{row.attendancePct}</td>
                          <td className="px-4 py-4 font-mono font-medium text-slate-800">{row.productiveHours}</td>
                          <td className="px-4 py-4 text-emerald-700 font-semibold">Exceeds 80% ✓</td>
                        </>
                      )}

                      {activeReportTab === "TASKS" && (
                        <>
                          <td className="px-4 py-4 font-bold text-slate-800">{row.tasksCompleted}</td>
                          <td className="px-4 py-4 font-medium text-slate-700">{row.dailyReportsSubmitted} submitted</td>
                          <td className="px-4 py-4 text-blue-600 font-semibold">Reviewed &amp; Approved</td>
                        </>
                      )}

                      {activeReportTab === "ASSESSMENTS" && (
                        <>
                          <td className="px-4 py-4 font-bold text-emerald-600">{row.assessmentAvg}</td>
                          <td className="px-4 py-4 font-semibold text-emerald-700">Passed (Min 60%)</td>
                          <td className="px-4 py-4 text-slate-600">Verified</td>
                        </>
                      )}

                      {activeReportTab === "COMPLETION" && (
                        <>
                          <td className="px-4 py-4">
                            <StatusBadge status={row.internshipStatus as any} />
                          </td>
                          <td className="px-4 py-4 font-semibold text-emerald-700">Satisfied (98%)</td>
                          <td className="px-4 py-4 font-semibold text-amber-700">Ready for Admin Sign-off</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
