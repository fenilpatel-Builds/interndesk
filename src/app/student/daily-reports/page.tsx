"use client";

import React, { useState } from "react";
import { StudentTopbar } from "@/components/student/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Send, Save, CheckCircle2, MessageSquare } from "lucide-react";

interface ReportEntry {
  id: string;
  startTime: string;
  endTime: string;
  description: string;
}

export default function StudentDailyReportsPage() {
  const [reportDate, setReportDate] = useState("2026-10-07");
  const [status, setStatus] = useState<"DRAFT" | "SUBMITTED" | "REVIEWED" | "NEEDS_REVISION">("DRAFT");
  const [mentorComment, setMentorComment] = useState<string | null>(null);
  const [entries, setEntries] = useState<ReportEntry[]>([
    { id: "1", startTime: "09:00", endTime: "10:30", description: "Configured Next.js App Router and authentication layouts." },
    { id: "2", startTime: "10:30", endTime: "12:00", description: "Created PostgreSQL schema migrations for student lifecycle." },
    { id: "3", startTime: "12:00", endTime: "13:00", description: "Lunch Break & team standup." },
    { id: "4", startTime: "13:00", endTime: "16:00", description: "Implemented work sessions and live productive timer engine." },
  ]);
  const [message, setMessage] = useState<string | null>(null);

  const addEntry = () => {
    setEntries([
      ...entries,
      { id: Date.now().toString(), startTime: "16:00", endTime: "17:00", description: "" },
    ]);
  };

  const updateEntry = (id: string, field: keyof ReportEntry, val: string) => {
    setEntries(entries.map((e) => (e.id === id ? { ...e, [field]: val } : e)));
  };

  const removeEntry = (id: string) => {
    if (entries.length <= 1) return;
    setEntries(entries.filter((e) => e.id !== id));
  };

  const handleSaveDraft = () => {
    setStatus("DRAFT");
    setMessage("Daily report draft saved successfully.");
  };

  const handleSubmitReport = () => {
    setStatus("SUBMITTED");
    setMessage("Daily report officially submitted for admin review.");
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <StudentTopbar title="Daily Work Report" studentName="Aarav Sharma" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Daily Work Log & Report
            </h2>
            <p className="text-xs text-slate-500">
              Itemize your hourly tasks and accomplishments for mentor evaluation.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white font-medium focus:outline-none focus:border-blue-600"
            />
            <StatusBadge status={status} />
          </div>
        </div>

        {message && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {mentorComment && (
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
            <MessageSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Mentor Feedback:</span>
              <p className="mt-0.5">{mentorComment}</p>
            </div>
          </div>
        )}

        <Card className="border-slate-200/90 shadow-xs">
          <CardHeader className="py-4 px-6 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold">Hourly Work Breakdown</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={addEntry}
              disabled={status === "SUBMITTED" || status === "REVIEWED"}
              className="text-xs h-8"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Time Slot
            </Button>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              {entries.map((entry, index) => (
                <div
                  key={entry.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center gap-3"
                >
                  <span className="text-xs font-bold text-slate-400 w-6">#{index + 1}</span>

                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={entry.startTime}
                      onChange={(e) => updateEntry(entry.id, "startTime", e.target.value)}
                      disabled={status === "SUBMITTED" || status === "REVIEWED"}
                      className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-600"
                    />
                    <span className="text-xs text-slate-400">to</span>
                    <input
                      type="time"
                      value={entry.endTime}
                      onChange={(e) => updateEntry(entry.id, "endTime", e.target.value)}
                      disabled={status === "SUBMITTED" || status === "REVIEWED"}
                      className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      placeholder="Describe work completed during this window..."
                      value={entry.description}
                      onChange={(e) => updateEntry(entry.id, "description", e.target.value)}
                      disabled={status === "SUBMITTED" || status === "REVIEWED"}
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  {status !== "SUBMITTED" && status !== "REVIEWED" && entries.length > 1 && (
                    <button
                      onClick={() => removeEntry(entry.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      aria-label="Remove entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Total logged entries: {entries.length}
              </span>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveDraft}
                  disabled={status === "SUBMITTED" || status === "REVIEWED"}
                >
                  <Save className="w-4 h-4 mr-1.5" />
                  Save Draft
                </Button>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleSubmitReport}
                  disabled={status === "SUBMITTED" || status === "REVIEWED"}
                >
                  <Send className="w-4 h-4 mr-1.5" />
                  Submit Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
