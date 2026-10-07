"use client";

import React, { useState } from "react";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Search } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface StudentRecord {
  id: string;
  name: string;
  email: string;
  college: string;
  university: string;
  technology: string;
  regStatus: string;
  payStatus: string;
  attendancePct: number;
  tasksCompleted: string;
  joinedDate: string;
  isSuspended?: boolean;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentRecord[]>([
    {
      id: "s1",
      name: "Aarav Sharma",
      email: "aarav@college.edu",
      college: "National Institute of Technology",
      university: "State Tech Univ",
      technology: "Modern Fullstack Web Development",
      regStatus: "ACTIVE",
      payStatus: "VERIFIED",
      attendancePct: 92.4,
      tasksCompleted: "14/16",
      joinedDate: "2026-10-01",
      isSuspended: false,
    },
    {
      id: "s2",
      name: "Priya Patel",
      email: "priya@university.edu",
      college: "Institute of Engineering & Tech",
      university: "Tech Univ West",
      technology: "Python for Enterprise & Automation",
      regStatus: "ACTIVE",
      payStatus: "VERIFIED",
      attendancePct: 88.0,
      tasksCompleted: "12/14",
      joinedDate: "2026-10-02",
      isSuspended: false,
    },
    {
      id: "s3",
      name: "Rohan Varma",
      email: "rohan@collegemail.in",
      college: "City Science College",
      university: "Central University",
      technology: "Data Science & Analytics",
      regStatus: "PENDING_ADMIN_APPROVAL",
      payStatus: "VERIFIED",
      attendancePct: 0.0,
      tasksCompleted: "0/0",
      joinedDate: "2026-10-06",
      isSuspended: false,
    },
  ]);

  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [confirmSuspendOpen, setConfirmSuspendOpen] = useState(false);

  const handleToggleSuspend = (studentId: string) => {
    setStudents(
      students.map((s) =>
        s.id === studentId ? { ...s, isSuspended: !s.isSuspended } : s
      )
    );
    setConfirmSuspendOpen(false);
    setSelectedStudent(null);
  };

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.technology.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <AdminTopbar title="All Enrolled Students" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Student Directory & Life Cycle Management
            </h2>
            <p className="text-xs text-slate-500">
              Manage student cohorts, attendance performance, task allocations, and credentials.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <Card className="border-slate-200/90 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by student name, email, or domain..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-600"
              />
            </div>
            <div className="text-xs font-semibold text-slate-500">
              Showing {filtered.length} of {students.length} students
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-slate-200/90 shadow-xs">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Student</th>
                  <th className="px-4 py-3.5">College & Domain</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Attendance</th>
                  <th className="px-4 py-3.5">Tasks</th>
                  <th className="px-4 py-3.5">Joined Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{s.name}</p>
                      <p className="text-[11px] text-slate-500">{s.email}</p>
                      {s.isSuspended && (
                        <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                          Suspended
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-blue-700">{s.technology}</p>
                      <p className="text-[11px] text-slate-500">{s.college}</p>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={s.regStatus} />
                    </td>
                    <td className="px-4 py-4 font-bold text-slate-900">
                      {s.attendancePct > 0 ? `${s.attendancePct}%` : "-"}
                    </td>
                    <td className="px-4 py-4 font-mono text-slate-700">
                      {s.tasksCompleted}
                    </td>
                    <td className="px-4 py-4 text-slate-500">
                      {formatDate(s.joinedDate)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7"
                          onClick={() => {
                            setSelectedStudent(s);
                            setConfirmSuspendOpen(true);
                          }}
                        >
                          {s.isSuspended ? "Reactivate" : "Suspend"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>

      {/* CONFIRM SUSPEND MODAL (Section 28) */}
      {confirmSuspendOpen && selectedStudent && (
        <Modal
          isOpen={confirmSuspendOpen}
          onClose={() => setConfirmSuspendOpen(false)}
          title={selectedStudent.isSuspended ? "Reactivate Student Account" : "Suspend Student Account"}
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 leading-relaxed">
              Are you sure you want to {selectedStudent.isSuspended ? "reactivate" : "suspend"}{" "}
              <strong className="text-slate-900">{selectedStudent.name}</strong>? Suspended students cannot log work hours, submit reports, or take assessments.
            </p>
            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setConfirmSuspendOpen(false)}>
                Cancel
              </Button>
              <Button
                variant={selectedStudent.isSuspended ? "success" : "danger"}
                size="sm"
                onClick={() => handleToggleSuspend(selectedStudent.id)}
              >
                Confirm {selectedStudent.isSuspended ? "Reactivation" : "Suspension"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
