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
  User,
  Download,
  CheckSquare,
  Square,
  Bell,
  UserX,
  FileSpreadsheet,
  Calendar,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface StudentRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
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
      phone: "+91 98765 43210",
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
      phone: "+91 98220 11223",
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
      phone: "+91 98330 44556",
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
      phone: "+91 98440 77889",
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
    {
      id: "s5",
      name: "Ananya Iyer",
      email: "ananya.iyer@engg.edu",
      phone: "+91 98550 99001",
      college: "Vellore Tech Academy",
      university: "Southern Technical University",
      technology: "Full Stack Web Development",
      program: "Full Stack Development Cohort",
      enrollmentId: "ENR-883319",
      paymentStatus: "VERIFIED",
      attendancePct: 96.5,
      tasksCompleted: "7/7",
      status: "COMPLETED",
      joinedDate: "2026-09-15",
    },
  ]);

  const [search, setSearch] = useState("");
  const [filterTech, setFilterTech] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [detailTab, setDetailTab] = useState<string>("Overview");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

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

  const allFilteredSelected = filtered.length > 0 && filtered.every((s) => selectedIds.includes(s.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((s) => s.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Section 64: Bulk Actions
  const handleBulkApprove = () => {
    setStudents((prev) =>
      prev.map((s) => (selectedIds.includes(s.id) ? { ...s, status: "ACTIVE" } : s))
    );
    setActionNotice(`Successfully approved ${selectedIds.length} student account(s).`);
    setSelectedIds([]);
  };

  const handleBulkSuspend = () => {
    setStudents((prev) =>
      prev.map((s) => (selectedIds.includes(s.id) ? { ...s, status: "SUSPENDED" } : s))
    );
    setActionNotice(`Marked ${selectedIds.length} student(s) as suspended.`);
    setSelectedIds([]);
  };

  // Section 62: Report Export (CSV)
  const handleExportCSV = (recordsToExport: StudentRecord[]) => {
    const headers = [
      "Student ID",
      "Full Name",
      "Email Address",
      "Phone",
      "College / Institute",
      "University",
      "Technology Track",
      "Enrolled Program",
      "Enrollment ID",
      "Payment Status",
      "Attendance %",
      "Tasks Completed",
      "Account Status",
      "Joined Date",
    ];

    const rows = recordsToExport.map((s) => [
      s.id,
      `"${s.name}"`,
      `"${s.email}"`,
      `"${s.phone}"`,
      `"${s.college}"`,
      `"${s.university}"`,
      `"${s.technology}"`,
      `"${s.program}"`,
      s.enrollmentId,
      s.paymentStatus,
      s.attendancePct,
      `"${s.tasksCompleted}"`,
      s.status,
      s.joinedDate,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `interndesk_students_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setActionNotice(`Exported ${recordsToExport.length} student record(s) to CSV.`);
  };

  // Export JSON
  const handleExportJSON = (recordsToExport: StudentRecord[]) => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(recordsToExport, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `interndesk_students_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setActionNotice(`Exported ${recordsToExport.length} student record(s) to JSON.`);
  };

  // Section 29: 12 Profile Tabs
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

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs font-semibold gap-1.5"
              onClick={() => handleExportCSV(filtered)}
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              Export All CSV
            </Button>
            <span className="text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
              {filtered.length} Students Listed
            </span>
          </div>
        </div>

        {/* Action Notice Toast */}
        {actionNotice && (
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-800 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{actionNotice}</span>
            </div>
            <button
              onClick={() => setActionNotice(null)}
              className="text-blue-500 hover:text-blue-800 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filters & Search Row (Section 28) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, college, university..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all"
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
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>

        {/* Section 64: Bulk Actions Bar (renders when >= 1 student is selected) */}
        {selectedIds.length > 0 && (
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-3 px-4 rounded-xl shadow-md flex flex-wrap items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center font-bold text-[10px]">
                {selectedIds.length}
              </span>
              <span>Selected for Bulk Management</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="bg-emerald-600 hover:bg-emerald-500 text-white border-transparent text-xs h-7 px-2.5 gap-1"
                onClick={handleBulkApprove}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Approve ({selectedIds.length})
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="bg-amber-600 hover:bg-amber-500 text-white border-transparent text-xs h-7 px-2.5 gap-1"
                onClick={handleBulkSuspend}
              >
                <UserX className="w-3.5 h-3.5" />
                Suspend ({selectedIds.length})
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs h-7 px-2.5 gap-1"
                onClick={() =>
                  handleExportCSV(students.filter((s) => selectedIds.includes(s.id)))
                }
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs h-7 px-2.5 gap-1"
                onClick={() =>
                  handleExportJSON(students.filter((s) => selectedIds.includes(s.id)))
                }
              >
                Export JSON
              </Button>

              <button
                onClick={() => setSelectedIds([])}
                className="text-xs text-blue-200 hover:text-white underline ml-2"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Section 28 & 64: Professional Student Table with Multi-Row Selection */}
        <Card className="border-slate-200 bg-white rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">
                    <button
                      onClick={toggleSelectAll}
                      className="text-slate-400 hover:text-slate-700 transition-colors"
                      title={allFilteredSelected ? "Deselect All" : "Select All"}
                    >
                      {allFilteredSelected ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-3">Student</th>
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
                {filtered.map((s) => {
                  const isChecked = selectedIds.includes(s.id);
                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isChecked ? "bg-blue-50/30" : ""
                      }`}
                    >
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => toggleSelectOne(s.id)}
                          className="text-slate-400 hover:text-slate-700 transition-colors"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-slate-900 block">{s.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{s.email}</span>
                      </td>
                      <td
                        className="py-3.5 px-3 text-slate-700 font-medium max-w-[140px] truncate"
                        title={s.college}
                      >
                        {s.college}
                      </td>
                      <td
                        className="py-3.5 px-3 text-slate-600 max-w-[130px] truncate"
                        title={s.university}
                      >
                        {s.university}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">
                          {s.technology}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-medium text-slate-800">{s.program}</td>
                      <td className="py-3.5 px-3 font-mono font-semibold text-slate-600">
                        {s.enrollmentId}
                      </td>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </main>

      {/* SECTION 29: ADMIN STUDENT DETAIL PROFILE WITH COMPLETE 12 TABS */}
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
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
              {detailTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDetailTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    detailTab === tab
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* TAB 1: OVERVIEW */}
            {detailTab === "Overview" && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">
                      Academic Institute
                    </span>
                    <p className="font-bold text-slate-900">{selectedStudent.college}</p>
                    <p className="text-slate-500">{selectedStudent.university}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">
                      Enrolled Program
                    </span>
                    <p className="font-bold text-blue-900">{selectedStudent.program}</p>
                    <p className="text-slate-500">ID: {selectedStudent.enrollmentId}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200">
                    <span className="text-[10px] uppercase font-bold text-blue-800">
                      Attendance Compliance
                    </span>
                    <p className="text-xl font-black text-blue-900 mt-1">
                      {selectedStudent.attendancePct}%
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-[10px] uppercase font-bold text-emerald-800">
                      Tasks Completed
                    </span>
                    <p className="text-xl font-black text-emerald-900 mt-1">
                      {selectedStudent.tasksCompleted}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200">
                    <span className="text-[10px] uppercase font-bold text-indigo-800">
                      MCQ Assessment Avg
                    </span>
                    <p className="text-xl font-black text-indigo-900 mt-1">88.5%</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="font-bold text-slate-900">Certificate Eligibility: 92%</p>
                      <p className="text-[11px] text-slate-500">
                        Meets attendance and assessment thresholds. Awaiting final capstone sign-off.
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={selectedStudent.status} />
                </div>
              </div>
            )}

            {/* TAB 2: REGISTRATION */}
            {detailTab === "Registration" && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500">
                    Registration Lifecycle Audit
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Email OTP Verified ✓
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Full Legal Name</span>
                    <span className="font-bold">{selectedStudent.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Contact Email</span>
                    <span className="font-mono">{selectedStudent.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Mobile Number</span>
                    <span className="font-mono">{selectedStudent.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Registration Fee</span>
                    <span className="font-bold text-emerald-700">₹0 (100% Free Registration)</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: ENROLLMENT */}
            {detailTab === "Enrollment" && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Cohort &amp; Curriculum Enrollment
                </span>
                <div className="grid grid-cols-2 gap-3 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Cohort Name</span>
                    <span className="font-bold text-blue-900">{selectedStudent.program}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Enrollment UID</span>
                    <span className="font-mono font-bold">{selectedStudent.enrollmentId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Specialization</span>
                    <span>{selectedStudent.technology}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Cohort Supervisor</span>
                    <span>Admin Evaluator Team</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: ATTENDANCE */}
            {detailTab === "Attendance" && (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-blue-800 uppercase">
                      Cohort Attendance Compliance
                    </span>
                    <p className="text-lg font-black text-blue-900">{selectedStudent.attendancePct}%</p>
                  </div>
                  <span className="text-xs font-bold text-blue-700 bg-white px-3 py-1.5 rounded-lg border border-blue-200">
                    22 / 24 Days Logged
                  </span>
                </div>
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Clock In</th>
                        <th className="p-2.5">Clock Out</th>
                        <th className="p-2.5 text-right">Productive</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-2.5 font-medium">Today</td>
                        <td className="p-2.5 font-mono">09:00 AM</td>
                        <td className="p-2.5 font-mono">05:15 PM</td>
                        <td className="p-2.5 font-bold text-emerald-700 text-right">07h 15m</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">Yesterday</td>
                        <td className="p-2.5 font-mono">09:05 AM</td>
                        <td className="p-2.5 font-mono">05:00 PM</td>
                        <td className="p-2.5 font-bold text-emerald-700 text-right">06h 45m</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: WORK SESSIONS */}
            {detailTab === "Work Sessions" && (
              <div className="space-y-3 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Logged Shift Sessions &amp; Breaks
                </span>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Shift #104 — Oct 07, 2026</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Completed
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-slate-600">
                    <div>Gross Time: <strong className="text-slate-900">08h 15m</strong></div>
                    <div>Break Time: <strong className="text-slate-900">01h 00m</strong></div>
                    <div>Productive: <strong className="text-emerald-700">07h 15m</strong></div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: TASKS */}
            {detailTab === "Tasks" && (
              <div className="space-y-2 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Assigned Project Milestones ({selectedStudent.tasksCompleted})
                </span>
                <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">REST API Architecture &amp; Next.js SSR</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Completed</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">Due Oct 05 • Verified by Admin Evaluator</p>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">Database Normalization &amp; Postgres Migrations</span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">In Progress</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">Due Oct 12 • Priority: High</p>
                </div>
              </div>
            )}

            {/* TAB 7: DAILY REPORTS */}
            {detailTab === "Daily Reports" && (
              <div className="space-y-3 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Submitted Shift Reports &amp; Activity Logs
                </span>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">Oct 07, 2026 Daily Report</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Approved</span>
                  </div>
                  <p className="text-slate-600">
                    &quot;Completed full test suite for authentication flows and integrated Web Audio API chimes for work timer.&quot;
                  </p>
                  <p className="text-[11px] text-slate-400">Time Blocks: 10:00–13:00 (Auth), 14:00–18:00 (Web Audio)</p>
                </div>
              </div>
            )}

            {/* TAB 8: LEARNING */}
            {detailTab === "Learning" && (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">Curriculum Progress: 68%</span>
                    <span className="text-slate-500 text-[11px]">17 / 25 Modules</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "68%" }} />
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-white flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900">Module 4: PostgreSQL Indexes &amp; Foreign Keys</p>
                    <p className="text-slate-500 text-[11px]">Completed yesterday • 100% Score</p>
                  </div>
                  <span className="text-emerald-600 font-bold text-xs">✓ Done</span>
                </div>
              </div>
            )}

            {/* TAB 9: ASSESSMENTS */}
            {detailTab === "Assessments" && (
              <div className="space-y-3 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  MCQ Assessments &amp; Exam Results
                </span>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">TypeScript &amp; React Advanced Exam</span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">94% PASSED</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-slate-600 text-[11px]">
                    <div>Correct: <strong className="text-emerald-700">47/50</strong></div>
                    <div>Duration: <strong className="text-slate-900">32 mins</strong></div>
                    <div>Attempts: <strong className="text-slate-900">1 of 3</strong></div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 10: DOCUMENTS */}
            {detailTab === "Documents" && (
              <div className="space-y-2 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Official Letters &amp; Credentials
                </span>
                <div className="p-3 rounded-xl border border-slate-200 bg-white flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900">Internship Offer &amp; Acceptance Letter</p>
                    <p className="text-slate-500 text-[11px]">Issued: Oct 01, 2026 • Ref: OFR-2026-8918</p>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs h-7 px-2.5">
                    Download PDF
                  </Button>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-white flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900">Certificate of Completion (QR Verified)</p>
                    <p className="text-slate-500 text-[11px]">ID-CERT-2026-8918 • QR Verification Ready</p>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs h-7 px-2.5">
                    View Cert
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 11: PAYMENTS */}
            {detailTab === "Payments" && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500">
                    Program Enrollment Payment Audit
                  </span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                    Verified ✓
                  </span>
                </div>
                <div className="space-y-1.5 text-slate-700">
                  <div className="flex justify-between">
                    <span>Registration Charge:</span>
                    <span className="font-bold text-emerald-700">₹0.00 (Free Registration)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Program Enrollment Fee:</span>
                    <span className="font-bold text-slate-900">₹4,999.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gateway Reference:</span>
                    <span className="font-mono text-slate-600">pay_razorpay_98214532</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Receipt ID:</span>
                    <span className="font-mono text-slate-600">RCPT-ENR-748291</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 12: ACTIVITY */}
            {detailTab === "Activity" && (
              <div className="space-y-2 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Security &amp; Account Audit Trail
                </span>
                <div className="space-y-1.5 text-slate-600">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between">
                    <span>Clock-in recorded via Web Audio shift timer</span>
                    <span className="text-slate-400 text-[11px]">Today, 09:00 AM</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between">
                    <span>Daily report submitted for review</span>
                    <span className="text-slate-400 text-[11px]">Yesterday, 05:20 PM</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between">
                    <span>Program enrollment fee payment verified</span>
                    <span className="text-slate-400 text-[11px]">Oct 01, 2026</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between">
                    <span>Free registration approved by Administrator</span>
                    <span className="text-slate-400 text-[11px]">Oct 01, 2026</span>
                  </div>
                </div>
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
