"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
  const [selectedMonth, setSelectedMonth] = useState("October 2026");
  const [selectedTech, setSelectedTech] = useState("ALL");

  const registrations = [
    {
      id: "1",
      student: "Rahul Patel",
      college: "XYZ College",
      technology: "Python",
      status: "APPROVED",
      date: "Oct 6, 2026",
    },
    {
      id: "2",
      student: "Priya Sharma",
      college: "ABC College",
      technology: "Web Development",
      status: "PENDING",
      date: "Oct 5, 2026",
    },
    {
      id: "3",
      student: "Amit Kumar",
      college: "LMN College",
      technology: "Java",
      status: "APPROVED",
      date: "Oct 4, 2026",
    },
    {
      id: "4",
      student: "Neha Singh",
      college: "PQR College",
      technology: "AI & ML",
      status: "APPROVED",
      date: "Oct 3, 2026",
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <AdminTopbar title="Admin Dashboard" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header matching Image 2 Screen 9 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Good Morning, Admin
            </h2>
            <p className="text-xs text-slate-500">
              Here&apos;s what&apos;s happening across your internship program.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/admin/registrations">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs">
                Review Registrations
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Top Stat Cards matching Image 2 Screen 9 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 border-slate-200/90 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Total Students</span>
            <div className="text-2xl font-black text-slate-900 mt-1">248</div>
          </Card>

          <Card className="p-5 border-slate-200/90 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Pending Approvals</span>
            <div className="text-2xl font-black text-amber-600 mt-1">12</div>
          </Card>

          <Card className="p-5 border-slate-200/90 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Active Interns</span>
            <div className="text-2xl font-black text-blue-600 mt-1">186</div>
          </Card>

          <Card className="p-5 border-slate-200/90 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Completed Interns</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">50</div>
          </Card>
        </div>

        {/* Middle 2 Cards: Attendance Overview & Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Attendance Overview Card */}
          <div className="lg:col-span-8">
            <Card className="border-slate-200/90 shadow-xs p-6 h-full flex flex-col justify-between">
              <h3 className="text-xs font-bold text-slate-800 mb-6">Attendance Overview</h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                {/* Present */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-18 h-18 rounded-full border-4 border-emerald-500 flex flex-col items-center justify-center">
                    <span className="text-base font-black text-slate-900">164</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">Present</span>
                    <span className="text-[11px] text-emerald-600 font-semibold">86%</span>
                  </div>
                </div>

                {/* Working */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-18 h-18 rounded-full border-4 border-blue-500 flex flex-col items-center justify-center">
                    <span className="text-base font-black text-slate-900">142</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">Working</span>
                    <span className="text-[11px] text-blue-600 font-semibold">67%</span>
                  </div>
                </div>

                {/* On Break */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-18 h-18 rounded-full border-4 border-amber-500 flex flex-col items-center justify-center">
                    <span className="text-base font-black text-slate-900">18</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">On Break</span>
                    <span className="text-[11px] text-amber-600 font-semibold">7%</span>
                  </div>
                </div>

                {/* Not Checked In */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-18 h-18 rounded-full border-4 border-rose-400 flex flex-col items-center justify-center">
                    <span className="text-base font-black text-slate-900">22</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">Not Checked In</span>
                    <span className="text-[11px] text-rose-600 font-semibold">9%</span>
                  </div>
                </div>
              </div>

              <div className="pt-4" />
            </Card>
          </div>

          {/* Filters Card */}
          <div className="lg:col-span-4">
            <Card className="border-slate-200/90 shadow-xs p-6 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 mb-3">Filters</h3>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-800 border border-slate-200 rounded-lg p-2 bg-white"
                >
                  <option value="October 2026">October 2026</option>
                  <option value="September 2026">September 2026</option>
                  <option value="August 2026">August 2026</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Student</label>
                <select className="w-full text-xs font-semibold text-slate-800 border border-slate-200 rounded-lg p-2 bg-white">
                  <option>All Students</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Technology</label>
                <select
                  value={selectedTech}
                  onChange={(e) => setSelectedTech(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-800 border border-slate-200 rounded-lg p-2 bg-white"
                >
                  <option value="ALL">All Technologies</option>
                  <option value="Python">Python</option>
                  <option value="Web">Web Development</option>
                  <option value="AI">AI &amp; ML</option>
                  <option value="Java">Java</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">College</label>
                <select className="w-full text-xs font-semibold text-slate-800 border border-slate-200 rounded-lg p-2 bg-white">
                  <option>All Colleges</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">University</label>
                <select className="w-full text-xs font-semibold text-slate-800 border border-slate-200 rounded-lg p-2 bg-white">
                  <option>All Universities</option>
                </select>
              </div>
            </Card>
          </div>
        </div>

        {/* Bottom Card: Recent Registrations Table matching Image 2 Screen 9 */}
        <Card className="border-slate-200/90 shadow-xs">
          <CardHeader className="py-4 px-6 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold">Recent Registrations</CardTitle>
            <Link href="/admin/registrations" className="text-xs font-bold text-blue-600 hover:underline">
              View All
            </Link>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 font-bold">Student</th>
                  <th className="px-4 py-3 font-bold">College</th>
                  <th className="px-4 py-3 font-bold">Technology</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-6 py-3 font-bold text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-slate-900">{reg.student}</td>
                    <td className="px-4 py-3.5 text-slate-600">{reg.college}</td>
                    <td className="px-4 py-3.5 text-slate-800">{reg.technology}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        reg.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {reg.status === "APPROVED" ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right text-slate-500 font-mono text-[11px]">{reg.date}</td>
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
