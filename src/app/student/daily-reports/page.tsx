"use client";

import React, { useState } from "react";
import { StudentTopbar } from "@/components/student/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  FileCheck,
  Save,
  Send,
  AlertCircle,
} from "lucide-react";

interface ReportSlot {
  id: string;
  timeSlot: string;
  description: string;
}

export default function StudentDailyReportsPage() {
  const [reportDate] = useState("Oct 8, 2026");
  const [reportStatus, setReportStatus] = useState<"DRAFT" | "SUBMITTED">("DRAFT");
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Default slots matching Section 21
  const [slots, setSlots] = useState<ReportSlot[]>([
    { id: "1", timeSlot: "09:00 – 10:00", description: "Worked on authentication module and Resend OTP delivery." },
    { id: "2", timeSlot: "10:00 – 11:00", description: "Implemented API integration and database schema migrations." },
    { id: "3", timeSlot: "11:00 – 11:15", description: "Coffee & Refreshment Break." },
    { id: "4", timeSlot: "11:15 – 12:00", description: "Testing and debugging work session timer precision." },
    { id: "5", timeSlot: "12:00 – 01:00", description: "Lunch Break" },
    { id: "6", timeSlot: "01:00 – 03:00", description: "Engineered programs marketplace and configurable fee checkout." },
  ]);

  const updateSlotDescription = (id: string, val: string) => {
    setSlots(slots.map((s) => (s.id === id ? { ...s, description: val } : s)));
  };

  const updateSlotTime = (id: string, val: string) => {
    setSlots(slots.map((s) => (s.id === id ? { ...s, timeSlot: val } : s)));
  };

  const handleAddSlot = () => {
    const newSlot: ReportSlot = {
      id: `slot_${Date.now()}`,
      timeSlot: "03:00 – 04:00",
      description: "",
    };
    setSlots([...slots, newSlot]);
  };

  const handleDeleteSlot = (id: string) => {
    if (slots.length <= 1) return;
    setSlots(slots.filter((s) => s.id !== id));
  };

  const handleSaveDraft = () => {
    setReportStatus("DRAFT");
    setFeedbackMsg("Report draft saved locally.");
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleSubmitReport = () => {
    setReportStatus("SUBMITTED");
    setFeedbackMsg("Daily work report submitted successfully to supervisor!");
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      <StudentTopbar title="Daily Work Report" studentName="Fenil Patel" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header (Section 21) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Daily Work Report
            </h2>
            <p className="text-xs text-slate-500">
              Itemize work blocks, time distribution, and tasks accomplished today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white shadow-2xs text-xs font-semibold text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>{reportDate}</span>
            </div>

            <Button
              onClick={handleAddSlot}
              size="sm"
              variant="outline"
              className="rounded-xl text-xs font-semibold bg-white"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Time Slot
            </Button>
          </div>
        </div>

        {feedbackMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Work Report Slots Card */}
        <Card className="border-slate-200/90 shadow-xs bg-white rounded-2xl overflow-hidden">
          <CardHeader className="py-4 px-6 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold">Timeline Activity Breakdown</CardTitle>
              <p className="text-xs text-slate-500">Itemized chronological activity log</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                reportStatus === "SUBMITTED"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              {reportStatus === "SUBMITTED" ? "Submitted ✓" : "Draft Status"}
            </span>
          </CardHeader>

          <CardContent className="p-6 space-y-3">
            {slots.map((slot, index) => (
              <div
                key={slot.id}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="w-48 shrink-0 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={slot.timeSlot}
                    onChange={(e) => updateSlotTime(slot.id, e.target.value)}
                    className="w-full text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="flex-1 w-full">
                  <input
                    type="text"
                    value={slot.description}
                    onChange={(e) => updateSlotDescription(slot.id, e.target.value)}
                    className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600"
                    placeholder="Describe tasks completed or break taken..."
                  />
                </div>

                <button
                  onClick={() => handleDeleteSlot(slot.id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded-lg"
                  title="Delete slot"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Bottom Actions: Save Draft & Submit Report (Section 21) */}
            <div className="pt-6 mt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 text-xs text-slate-500">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Total Recorded Slots: {slots.length}</span>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveDraft}
                  className="w-full sm:w-auto text-xs font-semibold rounded-xl"
                >
                  <Save className="w-3.5 h-3.5 mr-1" />
                  Save Draft
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmitReport}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 rounded-xl shadow-xs text-xs"
                >
                  <Send className="w-3.5 h-3.5 mr-1" />
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
