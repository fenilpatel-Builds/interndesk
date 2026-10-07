"use client";

import React, { useState } from "react";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { FileSpreadsheet, Eye, MessageSquare, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface DailyReportEntry {
  time: string;
  desc: string;
}

interface DailyReportItem {
  id: string;
  student: string;
  date: string;
  status: string;
  entries: DailyReportEntry[];
  comment: string;
}

export default function AdminDailyReportsPage() {
  const [reports, setReports] = useState<DailyReportItem[]>([
    {
      id: "dr1",
      student: "Aarav Sharma",
      date: "2026-10-07",
      status: "SUBMITTED",
      entries: [
        { time: "09:00 - 10:30", desc: "Configured Next.js App Router and authentication layouts." },
        { time: "10:30 - 12:00", desc: "Created PostgreSQL schema migrations for student lifecycle." },
        { time: "12:00 - 13:00", desc: "Lunch Break & team standup." },
        { time: "13:00 - 16:00", desc: "Implemented work sessions and live productive timer engine." },
      ],
      comment: "",
    },
    {
      id: "dr2",
      student: "Priya Patel",
      date: "2026-10-07",
      status: "SUBMITTED",
      entries: [
        { time: "09:15 - 12:00", desc: "Built Python data processing pipelines with Pandas." },
        { time: "13:00 - 17:00", desc: "Automated report extraction and unit test suite." },
      ],
      comment: "",
    },
  ]);

  const [selectedReport, setSelectedReport] = useState<DailyReportItem | null>(null);
  const [mentorComment, setMentorComment] = useState("");

  const handleReview = (status: "REVIEWED" | "NEEDS_REVISION") => {
    if (!selectedReport) return;
    setReports(
      reports.map((r) =>
        r.id === selectedReport.id ? { ...r, status, comment: mentorComment } : r
      )
    );
    setSelectedReport(null);
    setMentorComment("");
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <AdminTopbar title="Daily Work Reports" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Daily Work Log Submissions
          </h2>
          <p className="text-xs text-slate-500">
            Review itemized daily work reports and provide feedback to interns.
          </p>
        </div>

        <Card className="border-slate-200/90 shadow-xs">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Student</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Total Entries</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{rep.student}</td>
                    <td className="px-4 py-4 text-slate-600">{formatDate(rep.date)}</td>
                    <td className="px-4 py-4">{rep.entries.length} time entries</td>
                    <td className="px-4 py-4">
                      <StatusBadge status={rep.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8"
                        onClick={() => {
                          setSelectedReport(rep);
                          setMentorComment(rep.comment || "");
                        }}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>

      {selectedReport && (
        <Modal
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          title={`Daily Report: ${selectedReport.student} (${formatDate(selectedReport.date)})`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Work Breakdown
              </h4>
              {selectedReport.entries.map((ent: { time: string; desc: string }, i: number) => (
                <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <span className="font-mono font-bold text-blue-700 w-28 shrink-0">{ent.time}</span>
                  <span className="text-slate-800">{ent.desc}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="block font-semibold text-slate-700">
                Mentor Comment / Feedback
              </label>
              <textarea
                rows={3}
                placeholder="Add mentor feedback or guidance..."
                value={mentorComment}
                onChange={(e) => setMentorComment(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReview("NEEDS_REVISION")}
              >
                Request Revision
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={() => handleReview("REVIEWED")}
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Approve & Mark Reviewed
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
