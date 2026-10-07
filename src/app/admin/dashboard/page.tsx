"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  Award,
  TrendingUp,
} from "lucide-react";
import { AdminTopbar } from "@/components/admin/topbar";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { formatCurrencyINR, formatDate } from "@/lib/utils";

interface DashboardRegItem {
  id: string;
  application_number: string;
  status: string;
  submitted_at: string;
  student_profiles?: {
    college?: string;
    technology?: string;
    profiles?: {
      full_name?: string;
      email?: string;
      mobile?: string;
    };
  };
}

interface DashboardPayItem {
  id: string;
  amount: number;
  order_id: string;
  payment_id: string;
  status: string;
  created_at: string;
  student_profiles?: {
    profiles?: {
      full_name?: string;
    };
  };
}

interface DashboardStats {
  totalStudents: number;
  pendingApprovals: number;
  activeInterns: number;
  completedInternships: number;
  workingCount: number;
  breakCount: number;
  completedTodayCount: number;
  recentRegistrations: DashboardRegItem[];
  recentPayments: DashboardPayItem[];
}

export default function AdminDashboardPage() {
  const [, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 3,
    pendingApprovals: 1,
    activeInterns: 2,
    completedInternships: 0,
    workingCount: 1,
    breakCount: 1,
    completedTodayCount: 0,
    recentRegistrations: [
      {
        id: "r1",
        application_number: "ID-APP-847291",
        status: "PENDING_ADMIN_APPROVAL",
        submitted_at: "2026-10-06T12:00:00Z",
        student_profiles: {
          college: "National Institute of Technology",
          technology: "Modern Fullstack Web Development",
          profiles: {
            full_name: "Rohan Varma",
            email: "rohan@collegemail.in",
            mobile: "9876543212",
          },
        },
      },
      {
        id: "r2",
        application_number: "ID-APP-847290",
        status: "APPROVED",
        submitted_at: "2026-10-02T10:00:00Z",
        student_profiles: {
          college: "Institute of Engineering & Tech",
          technology: "Python for Enterprise & Automation",
          profiles: {
            full_name: "Priya Patel",
            email: "priya@university.edu",
            mobile: "9876543211",
          },
        },
      },
    ],
    recentPayments: [
      {
        id: "p1",
        amount: 1000,
        order_id: "order_k29f93nfa01",
        payment_id: "pay_093kfa82110",
        status: "VERIFIED",
        created_at: "2026-10-06T12:05:00Z",
        student_profiles: {
          profiles: {
            full_name: "Rohan Varma",
          },
        },
      },
    ],
  });

  useEffect(() => {
    // Attempt live fetch if DB is connected
    const loadStats = async () => {
      try {
        const res = await fetch("/api/admin/registrations/list");
        if (res.ok) {
          const data = await res.json();
          if (data.registrations && data.registrations.length > 0) {
            const regs = data.registrations as DashboardRegItem[];
            const pending = regs.filter((r) => r.status === "PENDING_ADMIN_APPROVAL").length;
            const approved = regs.filter((r) => r.status === "APPROVED" || r.status === "ACTIVE").length;
            setStats((prev) => ({
              ...prev,
              totalStudents: regs.length,
              pendingApprovals: pending,
              activeInterns: approved,
              recentRegistrations: regs.slice(0, 5),
            }));
          }
        }
      } catch {
        // Retain initial seeded stats
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const todayStr = "2026-10-07";

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <AdminTopbar title="Overview Dashboard" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Good Morning, Administrator
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live operational overview of student cohorts, attendance, and approvals.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/registrations">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-xs font-semibold">
                <UserCheck className="w-4 h-4 mr-1.5" />
                Review Registrations ({stats.pendingApprovals})
              </Button>
            </Link>
          </div>
        </div>

        {/* Primary Metrics Grid (Section 27) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            subtitle="Registered in system"
            icon={<Users className="w-5 h-5 text-blue-600" />}
          />
          <StatCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            subtitle="Paid ₹1,000 & awaiting sign-off"
            icon={<UserCheck className="w-5 h-5 text-amber-600" />}
            className={stats.pendingApprovals > 0 ? "border-amber-200 bg-amber-50/20" : ""}
          />
          <StatCard
            title="Active Interns"
            value={stats.activeInterns}
            subtitle="Working on curriculum"
            icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          />
          <StatCard
            title="Completed"
            value={stats.completedInternships}
            subtitle="Graduated & certified"
            icon={<Award className="w-5 h-5 text-indigo-600" />}
          />
        </div>

        {/* Attendance Today Overview Card (Section 27) */}
        <Card className="border-slate-200/90 shadow-xs">
          <CardHeader className="py-4 px-6 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Today&apos;s Attendance Real-Time Status</CardTitle>
              <p className="text-xs text-slate-500">Live work sessions recorded for {todayStr}</p>
            </div>
            <Link href="/admin/attendance" className="text-xs font-semibold text-blue-600 hover:underline">
              View Work Log →
            </Link>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                Currently Working
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">{stats.workingCount}</div>
              <span className="text-[10px] text-blue-600">Productive timer running</span>
            </div>
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                On Break
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">{stats.breakCount}</div>
              <span className="text-[10px] text-amber-600">Lunch / Personal / Water</span>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                Clocked Out Today
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">{stats.completedTodayCount}</div>
              <span className="text-[10px] text-emerald-600">Shift finished</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Not Checked In
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {Math.max(0, stats.activeInterns - (stats.workingCount + stats.breakCount))}
              </div>
              <span className="text-[10px] text-slate-500">Pending clock-in</span>
            </div>
          </CardContent>
        </Card>

        {/* Two-Column: Recent Registrations & Recent Payments */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Recent Registrations Table */}
          <div className="lg:col-span-8">
            <Card className="border-slate-200/90 shadow-xs h-full flex flex-col">
              <CardHeader className="py-4 px-6 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Recent Internship Applications</CardTitle>
                  <p className="text-xs text-slate-500">Candidates with verified fee submission</p>
                </div>
                <Link href="/admin/registrations" className="text-xs font-semibold text-blue-600 hover:underline">
                  All Registrations →
                </Link>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3.5">Candidate</th>
                      <th className="px-4 py-3.5">College & Tech</th>
                      <th className="px-4 py-3.5">Application #</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.recentRegistrations.map((reg: DashboardRegItem) => {
                      const student = reg.student_profiles;
                      const profile = student?.profiles;
                      return (
                        <tr key={reg.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-6 py-3.5">
                            <p className="font-bold text-slate-900">{profile?.full_name || "Applicant"}</p>
                            <p className="text-[11px] text-slate-500">{profile?.email || "-"}</p>
                          </td>
                          <td className="px-4 py-3.5">
                            <p className="font-medium text-slate-800">{student?.technology || "Web Dev"}</p>
                            <p className="text-[11px] text-slate-500">{student?.college || "-"}</p>
                          </td>
                          <td className="px-4 py-3.5 font-mono text-slate-600">
                            {reg.application_number}
                          </td>
                          <td className="px-4 py-3.5">
                            <StatusBadge status={reg.status} />
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            <Link href="/admin/registrations">
                              <Button size="sm" variant="outline" className="text-xs py-1 h-7">
                                Review
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          {/* Recent Payments Feed */}
          <div className="lg:col-span-4">
            <Card className="border-slate-200/90 shadow-xs h-full flex flex-col">
              <CardHeader className="py-4 px-6 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Recent Payments</CardTitle>
                  <p className="text-xs text-slate-500">Verified ₹1,000 transactions</p>
                </div>
                <Link href="/admin/finance" className="text-xs font-semibold text-blue-600 hover:underline">
                  All Receipts →
                </Link>
              </CardHeader>
              <CardContent className="p-4 space-y-3 flex-1 overflow-y-auto">
                {stats.recentPayments.map((pay: DashboardPayItem) => (
                  <div
                    key={pay.id}
                    className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-900">
                        {pay.student_profiles?.profiles?.full_name || "Student"}
                      </p>
                      <p className="text-[11px] font-mono text-slate-500">{pay.order_id}</p>
                      <p className="text-[10px] text-slate-400">{formatDate(pay.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-700 text-sm">
                        {formatCurrencyINR(pay.amount)}
                      </span>
                      <div className="mt-0.5">
                        <StatusBadge status={pay.status} />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
