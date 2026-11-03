"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Calendar,
  Building,
  ExternalLink,
  MessageSquare,
  Award,
  FileCheck2,
  Check,
  AlertCircle,
  FolderGit2,
} from "lucide-react";
import { INSTITUTE_CONFIG } from "@/lib/institute/config";
import { InstituteActivity, ActivitySubmission, ActivityCategory } from "@/types/activity";
import { formatDate } from "@/lib/utils";

function AdminActivitiesContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "SUBMISSIONS" ? "SUBMISSIONS" : "ACTIVITIES";
  const initialStatus = searchParams.get("status") || "ALL";

  const [activeTab, setActiveTab] = useState<"ACTIVITIES" | "SUBMISSIONS">(initialTab);
  const [activities, setActivities] = useState<InstituteActivity[]>([]);
  const [submissions, setSubmissions] = useState<ActivitySubmission[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);

  // Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newInstructions, setNewInstructions] = useState("");
  const [newCategory, setNewCategory] = useState<ActivityCategory>("PROJECT_PRACTICUM");
  const [newDeptId, setNewDeptId] = useState(INSTITUTE_CONFIG.departments[0].id);
  const [newDeadline, setNewDeadline] = useState("2026-11-30");
  const [newMaxScore, setNewMaxScore] = useState(100);
  const [isCreating, setIsCreating] = useState(false);

  // Review & Grade Modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<ActivitySubmission | null>(null);
  const [reviewStatus, setReviewStatus] = useState<"APPROVED" | "REJECTED" | "NEEDS_REVISION">("APPROVED");
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [reviewScore, setReviewScore] = useState(95);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchActivities();
    fetchSubmissions();
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "SUBMISSIONS") {
      setActiveTab("SUBMISSIONS");
    }
    const statusParam = searchParams.get("status");
    if (statusParam) {
      setSelectedStatus(statusParam);
    }
  }, [searchParams]);

  const fetchActivities = async () => {
    try {
      const res = await fetch("/api/activities");
      const data = await res.json();
      if (data.success && Array.isArray(data.activities)) {
        setActivities(data.activities);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const res = await fetch("/api/activities/submissions");
      const data = await res.json();
      if (data.success && Array.isArray(data.submissions)) {
        setSubmissions(data.submissions);
      }
    } catch {
      // Fallback
    }
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    setIsCreating(true);
    try {
      const dept = INSTITUTE_CONFIG.departments.find((d) => d.id === newDeptId);
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDesc.trim(),
          instructions: newInstructions.trim(),
          category: newCategory,
          departmentId: newDeptId,
          departmentName: dept?.name || "General Engineering",
          deadline: newDeadline,
          maxScore: newMaxScore,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.activity) {
        setActivities([data.activity, ...activities]);
        setCreateModalOpen(false);
        setNewTitle("");
        setNewDesc("");
        setNewInstructions("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenReviewModal = (sub: ActivitySubmission) => {
    setSelectedSub(sub);
    setReviewStatus(sub.status === "SUBMITTED" || sub.status === "UNDER_REVIEW" ? "APPROVED" : (sub.status as any));
    setReviewFeedback(sub.feedback || "Work evaluated and approved according to rubric.");
    setReviewScore(sub.score || 95);
    setReviewMessage(null);
    setReviewModalOpen(true);
  };

  const handleReviewSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;

    setIsReviewing(true);
    setReviewMessage(null);
    try {
      const res = await fetch(`/api/activities/submissions/${selectedSub.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: reviewStatus,
          feedback: reviewFeedback.trim(),
          score: reviewScore,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.submission) {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === selectedSub.id ? data.submission : s))
        );
        setReviewMessage({ text: "Submission review saved successfully!", type: "success" });
        setTimeout(() => {
          setReviewModalOpen(false);
        }, 800);
      } else {
        setReviewMessage({
          text: data.message || "Failed to submit review.",
          type: "error",
        });
      }
    } catch (err) {
      setReviewMessage({ text: "An error occurred during submission review.", type: "error" });
    } finally {
      setIsReviewing(false);
    }
  };

  // CSV Export with formula injection sanitization
  const handleExportCSV = () => {
    const sanitizeCsvValue = (val: string | number | undefined): string => {
      let str = String(val ?? "").trim();
      if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`;
      }
      return `"${str.replace(/"/g, '""')}"`;
    };

    if (activeTab === "ACTIVITIES") {
      const headers = ["Activity ID", "Title", "Department", "Category", "Deadline", "Status", "Max Score"];
      const rows = activities.map((act) => [
        sanitizeCsvValue(act.id),
        sanitizeCsvValue(act.title),
        sanitizeCsvValue(act.departmentName),
        sanitizeCsvValue(act.category),
        sanitizeCsvValue(act.deadline),
        sanitizeCsvValue(act.status),
        sanitizeCsvValue(act.maxScore),
      ]);

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", `Akash_Activities_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = ["Submission ID", "Student Name", "Student Email", "Activity Title", "Submitted At", "Status", "Score", "Feedback"];
      const rows = submissions.map((sub) => [
        sanitizeCsvValue(sub.id),
        sanitizeCsvValue(sub.studentName),
        sanitizeCsvValue(sub.studentEmail),
        sanitizeCsvValue(sub.activityTitle),
        sanitizeCsvValue(sub.submittedAt),
        sanitizeCsvValue(sub.status),
        sanitizeCsvValue(sub.score),
        sanitizeCsvValue(sub.feedback),
      ]);

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", `Akash_Submissions_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const filteredActivities = activities.filter((act) => {
    if (selectedDept !== "ALL" && act.departmentId !== selectedDept) return false;
    if (selectedStatus !== "ALL" && act.status !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return act.title.toLowerCase().includes(q) || act.description.toLowerCase().includes(q);
    }
    return true;
  });

  const filteredSubmissions = submissions.filter((sub) => {
    if (selectedStatus !== "ALL" && sub.status !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        sub.studentName.toLowerCase().includes(q) ||
        sub.studentEmail.toLowerCase().includes(q) ||
        sub.activityTitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingSubmissionsCount = submissions.filter(
    (s) => s.status === "SUBMITTED" || s.status === "UNDER_REVIEW"
  ).length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 text-slate-900">
      <AdminTopbar title="Academic Activities &amp; Submissions" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header with Title and Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold uppercase tracking-wider mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E52329]" />
              <span>Akash Technolabs • Academic Governance</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Academic Activities &amp; Student Submissions
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Create curriculum milestones, review submitted student deliverables, assign rubrics, and approve credits.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export CSV
            </Button>
            <Button
              size="sm"
              onClick={() => setCreateModalOpen(true)}
              className="bg-[#E52329] hover:bg-[#C41C22] text-white font-bold rounded-xl shadow-md shadow-red-500/20 text-xs cursor-pointer transition-transform hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Create Activity
            </Button>
          </div>
        </div>

        {/* Tab Switcher: Activities vs Student Submissions & Approvals */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => {
              setActiveTab("ACTIVITIES");
              setSelectedStatus("ALL");
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "ACTIVITIES"
                ? "bg-white text-slate-900 shadow-2xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-[#0F4C81]" />
            <span>Activities Catalog</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
              {activities.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("SUBMISSIONS");
              setSelectedStatus("ALL");
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "SUBMISSIONS"
                ? "bg-white text-slate-900 shadow-2xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5 text-[#E52329]" />
            <span>Student Submissions &amp; Approvals</span>
            {pendingSubmissionsCount > 0 ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold animate-pulse">
                {pendingSubmissionsCount} Pending
              </span>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                {submissions.length}
              </span>
            )}
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={activeTab === "ACTIVITIES" ? "Search activities..." : "Search student, email, activity..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {activeTab === "ACTIVITIES" ? (
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Departments ({INSTITUTE_CONFIG.departments.length})</option>
              {INSTITUTE_CONFIG.departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex items-center text-xs font-semibold text-slate-500 px-2">
              Viewing student submissions submitted for grading
            </div>
          )}

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            {activeTab === "ACTIVITIES" ? (
              <>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="CLOSED">Closed</option>
              </>
            ) : (
              <>
                <option value="SUBMITTED">Submitted (Pending Review)</option>
                <option value="APPROVED">Approved</option>
                <option value="NEEDS_REVISION">Needs Revision</option>
                <option value="REJECTED">Rejected</option>
              </>
            )}
          </select>
        </div>

        {/* TAB 1: ACTIVITIES TABLE */}
        {activeTab === "ACTIVITIES" && (
          <Card className="border-slate-200/90 bg-white shadow-2xs rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#0F4C81]" />
                  <span>Published Institute Activities ({filteredActivities.length})</span>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">Activity Title</th>
                    <th className="px-4 py-3.5">Department</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Deadline</th>
                    <th className="px-4 py-3.5">Max Score</th>
                    <th className="px-5 py-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredActivities.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                        No activities match the selected department or search query.
                      </td>
                    </tr>
                  ) : (
                    filteredActivities.map((act) => (
                      <tr key={act.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-5 py-4">
                          <span className="font-bold text-slate-900 text-sm block">{act.title}</span>
                          <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{act.description}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-semibold text-slate-800 block">{act.departmentName}</span>
                          <span className="text-[10px] text-slate-400">{act.courseName}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-700">
                            {act.category.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-600 font-mono text-[11px]">
                          {act.deadline}
                        </td>
                        <td className="px-4 py-4 font-bold text-blue-600 font-mono">
                          {act.maxScore} Pts
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
                            {act.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* TAB 2: STUDENT SUBMISSIONS & APPROVALS TABLE */}
        {activeTab === "SUBMISSIONS" && (
          <Card className="border-slate-200/90 bg-white shadow-2xs rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-[#E52329]" />
                  <span>Student Deliverable Submissions ({filteredSubmissions.length})</span>
                </CardTitle>
                {pendingSubmissionsCount > 0 && (
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    {pendingSubmissionsCount} Submissions Requiring Review
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">Student</th>
                    <th className="px-4 py-3.5">Activity Deliverable</th>
                    <th className="px-4 py-3.5">Submitted At</th>
                    <th className="px-4 py-3.5">Deliverable Report</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Score</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                        No submissions match the current status filter.
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-5 py-4">
                          <span className="font-bold text-slate-900 text-sm block">{sub.studentName}</span>
                          <span className="text-[11px] text-slate-500 font-mono">{sub.studentEmail}</span>
                        </td>
                        <td className="px-4 py-4 max-w-[220px]">
                          <span className="font-semibold text-slate-800 block line-clamp-1">{sub.activityTitle}</span>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {sub.activityId}</span>
                        </td>
                        <td className="px-4 py-4 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                          {formatDate(sub.submittedAt)}
                        </td>
                        <td className="px-4 py-4 max-w-[240px]">
                          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                            {sub.reportContent}
                          </p>
                          {sub.attachmentUrl && (
                            <a
                              href={sub.attachmentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline mt-1"
                            >
                              <FolderGit2 className="w-3 h-3" />
                              <span>View Repository / Attachment ↗</span>
                            </a>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {sub.status === "SUBMITTED" || sub.status === "UNDER_REVIEW" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" /> Awaiting Review
                            </span>
                          ) : sub.status === "APPROVED" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                              <XCircle className="w-3 h-3 text-red-600" /> {sub.status}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 font-bold text-slate-900 font-mono">
                          {sub.score !== undefined ? `${sub.score} / 100` : "--"}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Button
                            size="sm"
                            onClick={() => handleOpenReviewModal(sub)}
                            className="bg-[#0F4C81] hover:bg-[#0C3D68] text-white font-bold rounded-xl text-xs h-8 px-3 cursor-pointer shadow-2xs"
                          >
                            Review &amp; Grade
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </main>

      {/* REVIEW & GRADE SUBMISSION MODAL */}
      {selectedSub && (
        <Modal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title="Review & Grade Student Deliverable"
          description={`Student: ${selectedSub.studentName} (${selectedSub.studentEmail})`}
          maxWidth="md"
        >
          <form onSubmit={handleReviewSubmission} className="space-y-4 text-xs">
            {reviewMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-start gap-2 ${
                  reviewMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {reviewMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <span>{reviewMessage.text}</span>
              </div>
            )}

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-900 block text-xs">
                {selectedSub.activityTitle}
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {selectedSub.reportContent}
              </p>
              {selectedSub.attachmentUrl && (
                <div className="pt-1">
                  <a
                    href={selectedSub.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Submission Repository / Deliverable File</span>
                  </a>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Approval Decision *</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setReviewStatus("APPROVED")}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    reviewStatus === "APPROVED"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-2xs"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  ✓ Approve
                </button>
                <button
                  type="button"
                  onClick={() => setReviewStatus("NEEDS_REVISION")}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    reviewStatus === "NEEDS_REVISION"
                      ? "bg-amber-50 border-amber-500 text-amber-700 shadow-2xs"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  ↺ Needs Revision
                </button>
                <button
                  type="button"
                  onClick={() => setReviewStatus("REJECTED")}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    reviewStatus === "REJECTED"
                      ? "bg-red-50 border-red-500 text-red-700 shadow-2xs"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  ✗ Reject
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Assigned Score (0 - 100)</label>
              <Input
                type="number"
                min={0}
                max={100}
                value={reviewScore}
                onChange={(e) => setReviewScore(Number(e.target.value))}
                className="w-full text-xs font-mono font-bold"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">
                Evaluation Feedback &amp; Rubric Remarks *
              </label>
              <textarea
                rows={3}
                required
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
                placeholder="Detailed remarks on code architecture, test coverage, and documentation..."
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <Button
                variant="outline"
                type="button"
                size="sm"
                onClick={() => setReviewModalOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isReviewing}
                className="bg-[#E52329] hover:bg-[#C41C22] text-white font-bold rounded-xl text-xs px-4"
              >
                {isReviewing ? "Saving..." : "Submit Evaluation & Grade"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* CREATE ACTIVITY MODAL */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Academic Activity">
        <form onSubmit={handleCreateActivity} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Activity Title *</label>
            <Input
              placeholder="e.g. Microservices CI/CD Pipeline on AWS"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Description *</label>
            <textarea
              rows={2}
              placeholder="Provide a concise objective and scope for the student..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:border-red-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Department *</label>
              <select
                value={newDeptId}
                onChange={(e) => setNewDeptId(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white"
              >
                {INSTITUTE_CONFIG.departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Category *</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as ActivityCategory)}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white"
              >
                <option value="PROJECT_PRACTICUM">Project Practicum</option>
                <option value="RESEARCH_PAPER">Research Paper</option>
                <option value="TECHNICAL_ASSESSMENT">Technical Assessment</option>
                <option value="LAB_EXERCISE">Lab Exercise</option>
                <option value="WORKSHOP_CHALLENGE">Workshop Challenge</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Submission Deadline *</label>
              <Input
                type="date"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Max Score Points</label>
              <Input
                type="number"
                value={newMaxScore}
                onChange={(e) => setNewMaxScore(Number(e.target.value))}
                min={10}
                max={500}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Detailed Instructions &amp; Deliverables</label>
            <textarea
              rows={3}
              placeholder="1. Step-by-step deliverable guidelines..."
              value={newInstructions}
              onChange={(e) => setNewInstructions(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2.5 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating}
              className="bg-[#E52329] hover:bg-[#C41C22] text-white font-bold rounded-xl"
            >
              Publish Activity
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function AdminActivitiesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-500">Loading activities...</div>}>
      <AdminActivitiesContent />
    </Suspense>
  );
}
