"use client";

import React, { useState, useEffect } from "react";
import { StudentTopbar } from "@/components/student/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  UploadCloud,
  ArrowRight,
  ExternalLink,
  Search,
  Filter,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import { InstituteActivity } from "@/types/activity";
import { parseClientSessionCookie } from "@/lib/auth/client-session";

export default function StudentActivitiesPage() {
  const [activities, setActivities] = useState<InstituteActivity[]>([]);
  const [activeTab, setActiveTab] = useState<"All" | "Ongoing" | "Upcoming" | "Closed">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Submit Modal
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<InstituteActivity | null>(null);
  const [reportContent, setReportContent] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [currentStudentName, setCurrentStudentName] = useState("Student Intern");
  const [currentStudentEmail, setCurrentStudentEmail] = useState("");
  const [currentStudentId, setCurrentStudentId] = useState("");

  useEffect(() => {
    const session = parseClientSessionCookie();
    if (session?.name) {
      setCurrentStudentName(session.name);
    }
    if (session?.email) {
      setCurrentStudentEmail(session.email);
    }
    if (session?.id) {
      setCurrentStudentId(session.id);
    }
    fetchActivities();
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

  const handleOpenSubmit = (activity: InstituteActivity) => {
    setSelectedActivity(activity);
    setReportContent("");
    setGithubUrl("");
    setLiveUrl("");
    setSubmitSuccess(null);
    setSubmitModalOpen(true);
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity || !reportContent.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/activities/${selectedActivity.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportContent: reportContent.trim(),
          attachmentUrl: githubUrl.trim() || liveUrl.trim(),
          studentId: currentStudentId || `STD-${Date.now().toString().slice(-4)}`,
          studentName: currentStudentName,
          studentEmail: currentStudentEmail || "student@akashtechnolabs.com",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitSuccess("Your work has been submitted to faculty for evaluation!");
        setTimeout(() => {
          setSubmitModalOpen(false);
          fetchActivities();
        }, 1500);
      }
    } catch {
      // Error
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredActivities = activities.filter((act) => {
    const matchesSearch =
      act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.departmentName.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "Ongoing") return matchesSearch && act.status === "PUBLISHED";
    if (activeTab === "Upcoming") return matchesSearch && act.status === "PUBLISHED";
    if (activeTab === "Closed") return matchesSearch && act.status === "CLOSED";
    return matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50">
      <StudentTopbar title="Activities & Assignments" studentName={currentStudentName} />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header matching Image 1 Middle Right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Activities &amp; Assignments
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Explore and submit your institute activities
            </p>
          </div>
        </div>

        {/* Filter Bar with Tabs, Search & Filter Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs">
          {/* Tabs: All, Ongoing, Upcoming, Closed */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            {(["All", "Ongoing", "Upcoming", "Closed"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === tab
                    ? "bg-[#0F4C81] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Bar + Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search activities..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <button className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 cursor-pointer">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Activities List Cards matching Image 1 Middle Right */}
        <div className="space-y-3.5">
          {filteredActivities.map((act) => (
            <Card
              key={act.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {act.departmentName}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Due: {act.deadline}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {act.maxScore} Marks
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{act.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 max-w-3xl">
                    {act.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Ongoing
                  </span>
                  <Button
                    onClick={() => handleOpenSubmit(act)}
                    className="bg-[#E52329] hover:bg-[#C41C22] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs cursor-pointer"
                  >
                    Submit Work
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>

      {/* "Submit Your Work" Modal matching Image 1 Middle Right */}
      {submitModalOpen && selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Submit Your Work</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedActivity.title} • {selectedActivity.departmentName}
                </p>
              </div>
              <button
                onClick={() => setSubmitModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-emerald-900">Submission Successful!</h4>
                <p className="text-xs text-emerald-700">{submitSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitWork} className="space-y-4">
                {/* Instructions overview */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                  <span className="font-bold text-slate-900 block">Instructions:</span>
                  <p>{selectedActivity.description}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Report / Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={reportContent}
                    onChange={(e) => setReportContent(e.target.value)}
                    placeholder="Write your work summary, methodology, deliverables, and key learnings..."
                    required
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      GitHub Repository URL
                    </label>
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/..."
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Live Demo URL
                    </label>
                    <input
                      type="url"
                      value={liveUrl}
                      onChange={(e) => setLiveUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 text-slate-900"
                    />
                  </div>
                </div>

                {/* Attachments drag & drop matching Image 1 */}
                <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-6 text-center space-y-2 bg-slate-50/50 cursor-pointer">
                  <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">
                    Drag and drop files here, or <span className="text-blue-600 font-bold">Choose Files</span>
                  </p>
                  <span className="text-[10px] text-slate-400 block">
                    PDF, DOC, DOCX, ZIP (Max 10MB)
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSubmitModalOpen(false)}
                    className="rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !reportContent.trim()}
                    className="bg-[#E52329] hover:bg-[#C41C22] text-white font-bold text-xs rounded-xl px-5 cursor-pointer shadow-xs"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Assignment"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
