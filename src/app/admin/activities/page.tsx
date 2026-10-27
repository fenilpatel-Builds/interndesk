"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { INSTITUTE_CONFIG } from "@/lib/institute/config";
import { InstituteActivity, ActivitySubmission, ActivityCategory } from "@/types/activity";

export default function AdminActivitiesPage() {
  const [activeTab, setActiveTab] = useState<"ACTIVITIES" | "SUBMISSIONS">("ACTIVITIES");
  const [activities, setActivities] = useState<InstituteActivity[]>([]);
  const [submissions, setSubmissions] = useState<ActivitySubmission[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

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

  // Review Modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<ActivitySubmission | null>(null);
  const [reviewStatus, setReviewStatus] = useState<"APPROVED" | "REJECTED" | "NEEDS_REVISION">("APPROVED");
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [reviewScore, setReviewScore] = useState(90);
  const [isReviewing, setIsReviewing] = useState(false);

  useEffect(() => {
    fetchActivities();
    fetchSubmissions();
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await fetch("/api/activities");
      const data = await res.json();
      if (data.success && data.activities) {
        setActivities(data.activities);
      }
    } catch {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      // In-memory / store initial data
      const res = await fetch("/api/activities");
      // Load sample or fetch
    } catch {}
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

  const handleReviewSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;

    setIsReviewing(true);
    try {
      const res = await fetch(`/api/activities/submissions/${selectedSub.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: reviewStatus,
          feedback: reviewFeedback,
          score: reviewScore,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.submission) {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === selectedSub.id ? data.submission : s))
        );
        setReviewModalOpen(false);
        setSelectedSub(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsReviewing(false);
    }
  };

  // CSV Export with formula injection sanitization
  const handleExportCSV = () => {
    const sanitizeCsvValue = (val: string | number | undefined): string => {
      let str = String(val ?? "").trim();
      // Neutralize spreadsheet formula injection characters (=, +, -, @, \t, \r)
      if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`;
      }
      return `"${str.replace(/"/g, '""')}"`;
    };

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
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Akash_Technolabs_Activities_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950 text-slate-100">
      <AdminTopbar title={`${INSTITUTE_CONFIG.name} — Student Activity Management`} />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header with Title and Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/60 text-red-400 text-xs font-bold mb-2">
              <span>{INSTITUTE_CONFIG.name} • Single Institute Edition</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Academic Activities &amp; Submissions
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Create student activities, specify deadlines and evaluation rubrics, review submitted student reports, and assign scores.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="rounded-xl border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800 text-xs font-semibold"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export CSV
            </Button>
            <Button
              size="sm"
              onClick={() => setCreateModalOpen(true)}
              className="bg-[#d32f2f] hover:bg-[#b71c1c] text-white font-bold rounded-xl shadow-md shadow-red-950/40 text-xs"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Create Activity
            </Button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Departments ({INSTITUTE_CONFIG.departments.length})</option>
            {INSTITUTE_CONFIG.departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        {/* Activities Table Card */}
        <Card className="border-slate-800 bg-slate-900/90 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-800 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-400" />
                <span>Published Institute Activities ({filteredActivities.length})</span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-bold border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Activity Title</th>
                  <th className="px-4 py-3.5">Department</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Deadline</th>
                  <th className="px-4 py-3.5">Max Score</th>
                  <th className="px-5 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredActivities.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500 text-xs">
                      No activities match the selected department or search query.
                    </td>
                  </tr>
                ) : (
                  filteredActivities.map((act) => (
                    <tr key={act.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-5 py-4">
                        <span className="font-bold text-white text-sm block">{act.title}</span>
                        <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{act.description}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-semibold text-slate-200 block">{act.departmentName}</span>
                        <span className="text-[10px] text-slate-500">{act.courseName}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-semibold text-slate-300">
                          {act.category.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-300 font-mono text-[11px]">
                        {act.deadline}
                      </td>
                      <td className="px-4 py-4 font-bold text-amber-400 font-mono">
                        {act.maxScore} Pts
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
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
      </main>

      {/* CREATE ACTIVITY MODAL */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Academic Activity">
        <form onSubmit={handleCreateActivity} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Activity Title *</label>
            <Input
              placeholder="e.g. Microservices CI/CD Pipeline on AWS"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Description *</label>
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
              <label className="text-xs font-semibold text-slate-700">Department *</label>
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
              <label className="text-xs font-semibold text-slate-700">Category *</label>
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
              <label className="text-xs font-semibold text-slate-700">Submission Deadline *</label>
              <Input
                type="date"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Max Score Points</label>
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
            <label className="text-xs font-semibold text-slate-700">Detailed Instructions &amp; Deliverables</label>
            <textarea
              rows={3}
              placeholder="1. Step-by-step deliverable guidelines..."
              value={newInstructions}
              onChange={(e) => setNewInstructions(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2.5">
            <Button variant="outline" type="button" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating}
              isLoading={isCreating}
              className="bg-[#d32f2f] hover:bg-[#b71c1c] text-white font-bold rounded-xl"
            >
              Publish Activity
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
