"use client";

import React, { useState } from "react";
import { StudentTopbar } from "@/components/student/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2, Clock } from "lucide-react";

interface ReportSlot {
  id: string;
  timeSlot: string;
  description: string;
}

export default function StudentDailyReportsPage() {
  const [reportDate] = useState("Oct 5, 2026");
  const [isSubmitted, setIsSubmitted] = useState(true);
  const [slots, setSlots] = useState<ReportSlot[]>([
    { id: "1", timeSlot: "09:00 AM - 10:00 AM", description: "Worked on UI design for dashboard" },
    { id: "2", timeSlot: "10:00 AM - 11:00 AM", description: "Fixed bugs in attendance module" },
    { id: "3", timeSlot: "11:00 AM - 12:00 PM", description: "Developed API for student registration" },
    { id: "4", timeSlot: "12:00 PM - 01:00 PM", description: "Lunch Break" },
    { id: "5", timeSlot: "01:00 PM - 02:00 PM", description: "Worked on payment integration" },
  ]);

  const updateSlotDescription = (id: string, val: string) => {
    setSlots(slots.map((s) => (s.id === id ? { ...s, description: val } : s)));
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <StudentTopbar title="Daily Work Report" studentName="Fenil Patel" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header & Date Badge matching Image 2 Screen 6 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Daily Work Report
            </h2>
            <p className="text-xs text-slate-500">
              Record what you worked on throughout the day.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white shadow-2xs text-xs font-semibold text-slate-700">
            <span>{reportDate}</span>
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* Work Report Slots Card */}
        <Card className="border-slate-200/90 shadow-xs">
          <CardContent className="p-6 space-y-3">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="w-44 shrink-0 font-mono text-xs font-bold text-slate-700 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>{slot.timeSlot}</span>
                </div>

                <div className="flex-1 w-full">
                  <input
                    type="text"
                    value={slot.description}
                    onChange={(e) => updateSlotDescription(slot.id, e.target.value)}
                    className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-200/90 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600"
                    placeholder="Describe tasks completed..."
                  />
                </div>
              </div>
            ))}

            {/* Bottom Status & Save Action */}
            <div className="pt-6 mt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Report Submitted
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Last saved 01:45 PM</span>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <Button
                  size="sm"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 rounded-xl shadow-xs"
                  onClick={() => setIsSubmitted(true)}
                >
                  Save Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
