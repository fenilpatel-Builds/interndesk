"use client";

import React, { useState } from "react";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  ShieldCheck,
  CreditCard,
  BookOpen,
  Award,
  FileText,
  Activity,
  Layers,
  User,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface StudentRecord {
  id: string;
  name: string;
  email: string;
  college: string;
  university: string;
  technology: string;
  program: string;
  enrollmentId: string;
  paymentStatus: "VERIFIED" | "PENDING" | "FREE_REGISTRATION";
  attendancePct: number;
  tasksCompleted: string;
  status: "ACTIVE" | "PENDING_APPROVAL" | "COMPLETED" | "SUSPENDED";
  joinedDate: string;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentRecord[]>([
    {
      id: "s1",
      name: "Fenil Patel",
      email: "fenil8918@gmail.com",
      college: "National Institute of Technology",
      university: "State Technical University",
      technology: "Full Stack Web Development",
      program: "Full Stack Development Cohort",
      enrollmentId: "ENR-748291",
      paymentStatus: "VERIFIED",
      attendancePct: 94.2,
      tasksCompleted: "5/7",
      status: "ACTIVE",
      joinedDate: "2026-10-01",
    },
    {
      id: "s2",
      name: "Aarav Sharma",
      email: "aarav@college.edu",
      college: "National Institute of Technology",
      university: "State Tech Univ",
      technology: "Python & AI Engineering",
      program: "Python & AI Cohort",
      enrollmentId: "ENR-982134",
      paymentStatus: "VERIFIED",
      attendancePct: 92.4,
      tasksCompleted: "14/16",
      status: "ACTIVE",
      joinedDate: "2026-10-01",
    },
    {
      id: "s3",
      name: "Priya Patel",
      email: "priya@university.edu",
      college: "Institute of Engineering & Tech",
      university: "Tech Univ West",
      technology: "Data Science & Analytics",
      program: "Data Science Cohort",
      enrollmentId: "ENR-654321",
      paymentStatus: "VERIFIED",
      attendancePct: 88.0,
      tasksCompleted: "12/14",
      status: "ACTIVE",
      joinedDate: "2026-10-02",
    },
    {
      id: "s4",
      name: "Rohan Varma",
      email: "rohan@collegemail.in",
      college: "City Science College",
      university: "Central University",
      technology: "Cloud & DevOps",
      program: "Cloud & DevOps Track",
      enrollmentId: "ENR-112233",
      paymentStatus: "FREE_REGISTRATION",
      attendancePct: 0.0,
      tasksCompleted: "0/0",
      status: "PENDING_APPROVAL",
      joinedDate: "2026-10-06",
    },
  ]);

  const [search, setSearch] = useState("");
  const [filterTech, setFilterTech] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [detailTab, setDetailTab] = useState<string>("Overview");

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.college.toLowerCase().includes(search.toLowerCase()) ||
      s.university.toLowerCase().includes(search.toLowerCase());
    const matchesTech = filterTech === "ALL" || s.technology.includes(filterTech);
    const matchesStatus = filterStatus === "ALL" || s.status === filterStatus;
    return matchesSearch && matchesTech && matchesStatus;
  });

  // 12 Tabs matching Section 29
  const detailTabs = [
    "Overview",
    "Registration",
    "Enrollment",
    "Attendance",
    "Work Sessions",
    "Tasks",
    "Daily Reports",
    "Learning",
    "Assessments",
    "Documents",
    "Payments",
    "Activity",
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      <AdminTopbar title="Student Management" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header (Section 28) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Student Directory &amp; Cohort Management
            </h2>
            <p className="text-xs text-slate-500">
              Manage student registrations, program enrollments, shift logs, and certifications.
            </p>
          </div>

          <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
            {filtered.length} Students Listed
          </span>
        </div>

        {/* Filters & Search Row (Section 28: Search students...) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={filterTech}
              onChange={(e) => setFilterTech(e.target.value)}
              className="text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 outline-none"
            >
              <option value="ALL">All Technologies</option>
              <option value="Full Stack">Full Stack</option>
              <option value="Python">Python &amp; AI</option>
              <option value="Data Science">Data Science</option>
              <option value="Cloud">Cloud &amp; DevOps</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {/* Professional Table (Section 28 Columns: Student, College, University, Technology, Program, Enrollment, Payment, Attendance, Tasks, Status, Actions) */}
        <Card className="border-slate-200 bg-white rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-3">College</th>
                  <th className="py-3 px-3">University</th>
                  <th className="py-3 px-3">Technology</th>
                  <th className="py-3 px-3">Program</th>
                  <th className="py-3 px-3">Enrollment</th>
                  <th className="py-3 px-3">Payment</th>
                  <th className="py-3 px-3 text-center">Attendance</th>
                  <th className="py-3 px-3 text-center">Tasks</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{s.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{s.email}</span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 font-medium max-w-[140px] truncate" title={s.college}>
                      {s.college}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 max-w-[130px] truncate" title={s.university}>
                      {s.university}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">
                        {s.technology}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-800">{s.program}</td>
                    <td className="py-3.5 px-3 font-mono font-semibold text-slate-600">{s.enrollmentId}</td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.paymentStatus === "VERIFIED"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {s.paymentStatus === "VERIFIED" ? "Paid ✓" : "Free Reg"}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-slate-900">
                      {s.attendancePct}%
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-slate-700 font-semibold">
                      {s.tasksCompleted}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs rounded-lg h-7 px-2.5"
                        onClick={() => setSelectedStudent(s)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>

      {/* SECTION 29: ADMIN STUDENT DETAIL PROFILE WITH 12 TABS */}
      {selectedStudent && (
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title={`Student Profile — ${selectedStudent.name}`}
          description={`${selectedStudent.email} • Joined: ${formatDate(selectedStudent.joinedDate)}`}
          maxWidth="xl"
        >
          <div className="space-y-4">
            {/* 12 Tabs Navigation Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200">
              {detailTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDetailTab(tab)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    detailTab === tab
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            {detailTab === "Overview" && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Academic Institute</span>
                    <p className="font-bold text-slate-900">{selectedStudent.college}</p>
                    <p className="text-slate-500">{selectedStudent.university}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Enrolled Program</span>
                    <p className="font-bold text-blue-900">{selectedStudent.program}</p>
                    <p className="text-slate-500">ID: {selectedStudent.enrollmentId}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                    <span className="text-[10px] uppercase font-bold text-blue-800">Attendance</span>
                    <p className="text-lg font-black text-blue-900 mt-0.5">{selectedStudent.attendancePct}%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-[10px] uppercase font-bold text-emerald-800">Tasks</span>
                    <p className="text-lg font-black text-emerald-900 mt-0.5">{selectedStudent.tasksCompleted}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
                    <span className="text-[10px] uppercase font-bold text-indigo-800">Avg MCQ</span>
                    <p className="text-lg font-black text-indigo-900 mt-0.5">86%</p>
                  </div>
                </div>
              </div>
            )}

            {detailTab === "Registration" && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Registration Details</span>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div><strong>Full Name:</strong> {selectedStudent.name}</div>
                  <div><strong>Email:</strong> {selectedStudent.email}</div>
                  <div><strong>Registration Fee:</strong> ₹0 (Free Registration)</div>
                  <div><strong>Status:</strong> {selectedStudent.status}</div>
                </div>
              </div>
            )}

            {detailTab === "Enrollment" && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Cohort Enrollment</span>
                <p><strong>Enrolled Program:</strong> {selectedStudent.program}</p>
                <p><strong>Enrollment ID:</strong> {selectedStudent.enrollmentId}</p>
                <p><strong>Activation Status:</strong> Active Cohort</p>
              </div>
            )}

            {detailTab === "Payments" && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Payment Audit</span>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span>Program Fee Payment:</span>
                  <span className="font-bold text-emerald-700">Verified via Razorpay ✓</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Receipt ID:</span>
                  <span className="font-mono text-slate-700">RCPT-98214532</span>
                </div>
              </div>
            )}

            {!["Overview", "Registration", "Enrollment", "Payments"].includes(detailTab) && (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                Displaying detailed records for <strong>{detailTab}</strong> module.
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setSelectedStudent(null)}>
                Close Profile
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
