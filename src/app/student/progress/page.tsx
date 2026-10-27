"use client";

import React from "react";
import { StudentTopbar } from "@/components/student/topbar";
import { Card } from "@/components/ui/card";
import {
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  Calendar,
} from "lucide-react";

export default function StudentProgressPage() {
  const milestones = [
    { title: "Next.js Core Architecture", completed: true, date: "Oct 12, 2026", marks: "95%" },
    { title: "PostgreSQL & Database Design", completed: true, date: "Oct 18, 2026", marks: "90%" },
    { title: "REST & Server Actions Integration", completed: true, date: "Oct 22, 2026", marks: "92%" },
    { title: "Full-Stack Capstone Submission", completed: false, date: "Target: Nov 05, 2026", marks: "Pending" },
    { title: "Final Evaluation & Viva", completed: false, date: "Target: Nov 15, 2026", marks: "Upcoming" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50">
      <StudentTopbar title="My Academic Progress" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Academic Milestones &amp; Progress
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Your cumulative curriculum roadmap and completed requirements
          </p>
        </div>

        {/* Overview Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 rounded-2xl bg-white border-slate-200/90 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block">Overall Completion</span>
            <span className="text-3xl font-black text-blue-600 mt-1 block">72%</span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">8 of 11 activities finalized</span>
          </Card>
          <Card className="p-5 rounded-2xl bg-white border-slate-200/90 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block">Average Marks</span>
            <span className="text-3xl font-black text-emerald-600 mt-1 block">91.4%</span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Top 5% of department cohort</span>
          </Card>
          <Card className="p-5 rounded-2xl bg-white border-slate-200/90 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block">Attendance Rate</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">98.2%</span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">42 verified shift punches</span>
          </Card>
        </div>

        {/* Timeline */}
        <Card className="p-6 rounded-3xl bg-white border-slate-200/90 shadow-xs space-y-6">
          <h3 className="text-base font-bold text-slate-900">Curriculum Milestones</h3>

          <div className="space-y-4">
            {milestones.map((m, idx) => (
              <div key={idx} className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    m.completed ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {m.completed ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900">{m.title}</h4>
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-md ${
                        m.completed ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {m.marks}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 mt-0.5 block">{m.date}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}
