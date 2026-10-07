"use client";

import React, { useState } from "react";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { BarChart3, Download, Calendar, Filter, Users, Clock, Award } from "lucide-react";
import { formatTime } from "@/lib/utils";

export default function AdminReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState("2026-10");
  const [selectedTech, setSelectedTech] = useState("ALL");
  const [activeReportTab, setActiveReportTab] = useState<"ATTENDANCE" | "TASKS" | "ASSESSMENTS" | "COMPLETION">("ATTENDANCE");

  const reportData = [
    {
      student: "Aarav Sharma",
      college: "National Institute of Tech",
      tech: "Modern Fullstack Web Development",
      attendancePct: "92.4%",
      productiveHours: "78h 30m",
      dailyReportsSubmitted: 18,
      tasksCompleted: "14/16",
      assessmentAvg: "86%",
      internshipStatus: "ACTIVE",
    },
    {
      student: "Priya Patel",
      college: "Institute of Engineering & Tech",
      tech: "Python for Enterprise & Automation",
      attendancePct: "88.0%",
      productiveHours: "72h 15m",
      dailyReportsSubmitted: 16,
      tasksCompleted: "12/14",
      assessmentAvg: "90%",
      internshipStatus: "ACTIVE",
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <AdminTopbar title="Reports & Cohort Analytics" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Month-Wise Performance & Audit Reports
            </h2>
            <p className="text-xs text-slate-500">
              Filter by month, technology, and university to evaluate student productivity and graduation readiness.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="text-xs gap-1.5"
            onClick={() => alert(`Exporting report for ${selectedMonth} as CSV...`)}
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>

        {/* Filter Toolbar (Section 29) */}
        <Card className="border-slate-200/90 shadow-2xs">
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
                className="text-xs rounded-lg border border-slate-200 px-3 py-1.5 bg-white font-medium focus:outline-none focus:border-blue-600"
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
                className="text-xs rounded-lg border border-slate-200 px-3 py-1.5 bg-white font-medium focus:outline-none focus:border-blue-600"
              >
                <option value="ALL">All Specializations</option>
                <option value="Modern Fullstack Web Development">Fullstack Web Development</option>
                <option value="Python for Enterprise & Automation">Python Enterprise</option>
                <option value="Data Science & Analytics">Data Science</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Report Tabs (Section 30) */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveReportTab("ATTENDANCE")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeReportTab === "ATTENDANCE"
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Attendance & Hours
          </button>
          <button
            onClick={() => setActiveReportTab("TASKS")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeReportTab === "TASKS"
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Tasks & Daily Reports
          </button>
          <button
            onClick={() => setActiveReportTab("ASSESSMENTS")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeReportTab === "ASSESSMENTS"
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Assessments
          </button>
          <button
            onClick={() => setActiveReportTab("COMPLETION")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeReportTab === "COMPLETION"
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Completion & Certificates
          </button>
        </div>

        {/* Report Data Table */}
        <Card className="border-slate-200/90 shadow-xs">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Student</th>
                  <th className="px-4 py-3.5">College & Domain</th>
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
                {reportData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{row.student}</td>
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
                        <td className="px-4 py-4 text-blue-600 font-semibold">Reviewed & Approved</td>
                      </>
                    )}

                    {activeReportTab === "ASSESSMENTS" && (
                      <>
                        <td className="px-4 py-4 font-bold text-emerald-600">{row.assessmentAvg}</td>
                        <td className="px-4 py-4 font-semibold text-emerald-700">Passed (Min 60%)</td>
                        <td className="px-4 py-4 text-slate-600">4 / 5 Modules</td>
                      </>
                    )}

                    {activeReportTab === "COMPLETION" && (
                      <>
                        <td className="px-4 py-4">
                          <StatusBadge status={row.internshipStatus} />
                        </td>
                        <td className="px-4 py-4 font-semibold text-emerald-700">Satisfied (92%)</td>
                        <td className="px-4 py-4 font-semibold text-amber-700">Ready for Admin Sign-off</td>
                      </>
                    )}
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
