"use client";

import React, { useState, useEffect } from "react";
import { StudentTopbar } from "@/components/student/topbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  UploadCloud,
  Award,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { INSTITUTE_CONFIG } from "@/lib/institute/config";
import { InstituteActivity, ActivitySubmission } from "@/types/activity";

export default function StudentActivitiesPage() {
  const [activities, setActivities] = useState<InstituteActivity[]>([]);
  const [submissions, setSubmissions] = useState<ActivitySubmission[]>([]);
  const [loading, setLoading] = useState(true);

  // Submit Modal
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<InstituteActivity | null>(null);
  const [reportContent, setReportContent] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  useEffect(() => {
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
    setAttachmentUrl("");
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
          attachmentUrl: attachmentUrl.trim(),
          studentId: "AKT-2026-001",
          studentName: "Fenil Patel",
          studentEmail: "fenil.patel@akashtechnolabs.com",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.submission) {
        setSubmissions([data.submission, ...submissions]);
        setSubmitSuccess("Your activity report has been submitted for faculty review!");
        setTimeout(() => {
          setSubmitModalOpen(false);
          setSelectedActivity(null);
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950 text-slate-100">
      <StudentTopbar title="Assigned Academic Activities" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header Banner */}
        <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-[#0e162d] to-[#1a0b12] border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="text-[11px] font-bold tracking-widest uppercase text-red-400 bg-red-950/60 border border-red-800/60 px-3 py-1 rounded-full">
              {INSTITUTE_CONFIG.name} • Academic Practicum
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Assigned Technical Activities
            </h1>
            <p className="text-xs text-slate-400 max-w-lg">
              Review published activity briefs, complete required project deliverables, and submit detailed reports before deadlines to earn certified practicum credits.
            </p>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <span className="font-bold text-white block">Active Practicum</span>
              <span className="text-[11px] text-slate-400">{activities.length} Available Activities</span>
            </div>
          </div>
        </div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activities.map((act) => {
            const isSub = submissions.find((s) => s.activityId === act.id);

            return (
              <Card
                key={act.id}
                className="border-slate-800 bg-slate-900/90 shadow-xl rounded-2xl flex flex-col justify-between hover:border-slate-700 transition"
              >
                <CardHeader className="space-y-2 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {act.category.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {act.maxScore} Points
                    </span>
                  </div>
                  <CardTitle className="text-base font-bold text-white leading-snug">
                    {act.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400 line-clamp-2">
                    {act.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Department:</span>
                      <span className="font-semibold text-slate-200">{act.departmentName}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Deadline:</span>
                      <span className="font-mono text-red-400 font-semibold">{act.deadline}</span>
                    </div>
                  </div>

                  {isSub && (
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Work Submitted</span>
                      </div>
                      <span className="font-bold text-emerald-400">{isSub.status}</span>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Status: {act.status}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleOpenSubmit(act)}
                      className="bg-[#d32f2f] hover:bg-[#b71c1c] text-white font-bold rounded-xl text-xs shadow-md shadow-red-950/40"
                    >
                      <UploadCloud className="w-3.5 h-3.5 mr-1.5" />
                      {isSub ? "Resubmit Work" : "Submit Work"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>

      {/* SUBMISSION MODAL */}
      <Modal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        title={selectedActivity ? `Submit Work: ${selectedActivity.title}` : "Activity Submission"}
      >
        {selectedActivity && (
          <form onSubmit={handleSubmitWork} className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Instructions</span>
              <p className="text-slate-700 whitespace-pre-line leading-relaxed">{selectedActivity.instructions}</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Detailed Report / Solution Summary *</label>
              <textarea
                rows={4}
                placeholder="Describe your technical implementation, methodology, test results, and conclusions..."
                value={reportContent}
                onChange={(e) => setReportContent(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:border-red-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">GitHub Repository / Live Demo URL</label>
              <Input
                type="url"
                placeholder="https://github.com/username/project-repo"
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
              />
            </div>

            {submitSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{submitSuccess}</span>
              </div>
            )}

            <div className="pt-3 flex justify-end gap-2.5">
              <Button variant="outline" type="button" onClick={() => setSubmitModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !reportContent.trim()}
                isLoading={isSubmitting}
                className="bg-[#d32f2f] hover:bg-[#b71c1c] text-white font-bold rounded-xl"
              >
                Confirm Submission
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
