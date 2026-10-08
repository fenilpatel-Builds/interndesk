"use client";

import React, { useState, useEffect } from "react";
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  Filter,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { formatDate } from "@/lib/utils";

interface RegistrationItem {
  id: string;
  application_number: string;
  status: string;
  submitted_at: string;
  student_profiles?: {
    id: string;
    college: string;
    university: string;
    course: string;
    technology: string;
    profiles?: {
      full_name: string;
      email: string;
      mobile: string;
    };
  };
}

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReg, setSelectedReg] = useState<RegistrationItem | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/registrations/list")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load"))))
      .then((data) => {
        if (active) {
          setRegistrations(data.registrations || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleApprove = async (reg: RegistrationItem) => {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/registrations/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: reg.id,
          studentId: reg.student_profiles?.id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: "Registration approved successfully!", type: "success" });
        setRegistrations((prev) =>
          prev.map((r) => (r.id === reg.id ? { ...r, status: "APPROVED" } : r))
        );
        setSelectedReg(null);
      } else {
        setMessage({ text: data.error || "Approval failed.", type: "error" });
      }
    } catch {
      setMessage({ text: "An error occurred during approval.", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim() || rejectReason.length < 5) {
      alert("Please provide a rejection reason (minimum 5 characters).");
      return;
    }

    if (!selectedReg) return;

    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/registrations/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: selectedReg.id,
          studentId: selectedReg.student_profiles?.id,
          reason: rejectReason.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: "Registration rejected.", type: "success" });
        setRegistrations((prev) =>
          prev.map((r) => (r.id === selectedReg.id ? { ...r, status: "REJECTED" } : r))
        );
        setRejectModalOpen(false);
        setSelectedReg(null);
        setRejectReason("");
      } else {
        setMessage({ text: data.error || "Rejection failed.", type: "error" });
      }
    } catch {
      setMessage({ text: "An error occurred during rejection.", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRegistrations = registrations.filter((r) => {
    const matchesStatus =
      statusFilter === "ALL" || r.status === statusFilter;
    const query = searchQuery.toLowerCase();
    const name = r.student_profiles?.profiles?.full_name?.toLowerCase() || "";
    const email = r.student_profiles?.profiles?.email?.toLowerCase() || "";
    const appNum = r.application_number?.toLowerCase() || "";
    const matchesSearch = name.includes(query) || email.includes(query) || appNum.includes(query);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <AdminTopbar title="Registration Applications" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header with quick stats & actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Candidate Applications & Approvals
            </h2>
            <p className="text-xs text-slate-500">
              Review verified applicants, validate academic background, and issue Offer Letters.
            </p>
          </div>
        </div>

        {message && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-semibold ${
              message.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Filters */}
        <Card className="border-slate-200/90 shadow-2xs">
          <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by name, email, or app #..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-200 text-xs py-1.5 px-3 bg-white focus:outline-none focus:border-blue-600"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING_ADMIN_APPROVAL">Pending Approval</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-slate-200/90 shadow-xs">
          <CardContent className="p-0 overflow-x-auto">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-xs">Loading registration applications...</span>
              </div>
            ) : filteredRegistrations.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                No registrations found matching the selected criteria.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Candidate</th>
                    <th className="px-4 py-3.5">College & Tech</th>
                    <th className="px-4 py-3.5">Application Number</th>
                    <th className="px-4 py-3.5">Submitted On</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRegistrations.map((reg) => {
                    const student = reg.student_profiles;
                    const profile = student?.profiles;
                    return (
                      <tr key={reg.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{profile?.full_name || "Applicant"}</p>
                          <p className="text-[11px] text-slate-500">{profile?.email} • {profile?.mobile}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-medium text-slate-800">{student?.technology || "Web Development"}</p>
                          <p className="text-[11px] text-slate-500">{student?.college} ({student?.course})</p>
                        </td>
                        <td className="px-4 py-4 font-mono text-slate-700">
                          {reg.application_number}
                        </td>
                        <td className="px-4 py-4 text-slate-500">
                          {formatDate(reg.submitted_at)}
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={reg.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-8 gap-1.5"
                            onClick={() => setSelectedReg(reg)}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Review
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </main>

      {/* REVIEW STUDENT MODAL (Section 49) */}
      {selectedReg && (
        <Modal
          isOpen={!!selectedReg}
          onClose={() => setSelectedReg(null)}
          title={`Review Application: ${selectedReg.application_number}`}
          maxWidth="lg"
        >
          <div className="space-y-5 text-xs text-slate-700">
            {/* Section 1: Personal */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900">
                1. Personal Details
              </h4>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div><span className="text-slate-400">Name:</span> <p className="font-semibold text-slate-900">{selectedReg.student_profiles?.profiles?.full_name}</p></div>
                <div><span className="text-slate-400">Email:</span> <p className="font-semibold text-slate-900">{selectedReg.student_profiles?.profiles?.email}</p></div>
                <div><span className="text-slate-400">Mobile:</span> <p className="font-semibold text-slate-900">{selectedReg.student_profiles?.profiles?.mobile}</p></div>
                <div><span className="text-slate-400">Status:</span> <StatusBadge status={selectedReg.status} /></div>
              </div>
            </div>

            {/* Section 2: Academic */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900">
                2. Academic Background
              </h4>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div><span className="text-slate-400">College:</span> <p className="font-semibold text-slate-900">{selectedReg.student_profiles?.college}</p></div>
                <div><span className="text-slate-400">University:</span> <p className="font-semibold text-slate-900">{selectedReg.student_profiles?.university}</p></div>
                <div><span className="text-slate-400">Degree:</span> <p className="font-semibold text-slate-900">{selectedReg.student_profiles?.course}</p></div>
                <div><span className="text-slate-400">Domain:</span> <p className="font-semibold text-blue-700">{selectedReg.student_profiles?.technology}</p></div>
              </div>
            </div>

            {/* Section 3: Registration Status */}
            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-blue-800">
                  3. Registration Mode
                </h4>
                <span className="text-blue-700 font-bold">100% Free Registration ✓</span>
              </div>
              <p className="text-[11px] text-blue-700">
                Student verified via 6-digit email OTP. Program enrollment fees apply upon cohort selection.
              </p>
            </div>

            {/* Actions (Section 15) */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <Button
                variant="danger"
                size="sm"
                onClick={() => setRejectModalOpen(true)}
                disabled={actionLoading || selectedReg.status === "REJECTED"}
              >
                <XCircle className="w-4 h-4 mr-1.5" />
                Reject
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedReg(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handleApprove(selectedReg)}
                  isLoading={actionLoading}
                  disabled={selectedReg.status === "APPROVED"}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Approve Student
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* REJECT CONFIRMATION MODAL WITH REQUIRED REASON (Section 49) */}
      {rejectModalOpen && (
        <Modal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title="Reject Registration"
          description="A reason is required so the student can be notified accordingly."
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="State the reason (e.g., Incomplete eligibility criteria, prerequisite mismatch)..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectModalOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleReject}
                isLoading={actionLoading}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
