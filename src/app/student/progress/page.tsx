"use client";

import React, { useState, useEffect } from "react";
import { StudentTopbar } from "@/components/student/topbar";
import { Card } from "@/components/ui/card";
import {
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  Award,
  Sparkles,
} from "lucide-react";
import { parseClientSessionCookie } from "@/lib/auth/client-session";

interface MilestoneItem {
  id: string;
  title: string;
  completed: boolean;
  date: string;
  marks: string;
  category?: string;
}

interface ProgressData {
  overallCompletionPct: number;
  overallCompletionText: string;
  averageMarks: string;
  averageMarksSubtext: string;
  attendanceRate: string;
  attendanceSubtext: string;
  milestones: MilestoneItem[];
}

export default function StudentProgressPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ProgressData>({
    overallCompletionPct: 25,
    overallCompletionText: "1 of 4 activities finalized",
    averageMarks: "98.0%",
    averageMarksSubtext: "Based on verified evaluations",
    attendanceRate: "98.4%",
    attendanceSubtext: "42 verified shift punches",
    milestones: [
      {
        id: "act-1",
        title: "Full-Stack Enterprise Portal with Next.js 16 & Server Actions",
        completed: true,
        date: "Oct 22, 2026",
        marks: "98%",
      },
      {
        id: "act-2",
        title: "Convolutional Neural Network (CNN) Model for Image Classification",
        completed: false,
        date: "Submitted: Oct 25",
        marks: "In Review",
      },
      {
        id: "act-3",
        title: "Containerized Microservices CI/CD Pipeline on AWS ECS",
        completed: false,
        date: "Target: 2026-11-25",
        marks: "Pending",
      },
      {
        id: "act-4",
        title: "PostgreSQL Database Query Optimization & Indexing Benchmark",
        completed: false,
        date: "Target: 2026-11-30",
        marks: "Pending",
      },
    ],
  });

  useEffect(() => {
    const session = parseClientSessionCookie();
    const queryEmail = session?.email ? `?email=${encodeURIComponent(session.email)}` : "";

    let active = true;
    fetch(`/api/student/progress${queryEmail}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load progress"))))
      .then((resData) => {
        if (active && resData.success) {
          setData(resData);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch dynamic student progress:", err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50">
      <StudentTopbar title="My Academic Progress" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Academic Milestones &amp; Progress
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Your cumulative curriculum roadmap and verified completed requirements
          </p>
        </div>

        {/* Overview Bar - Real Dynamic Numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 rounded-2xl bg-white border-slate-200/90 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block">Overall Completion</span>
            <span className="text-3xl font-black text-blue-600 mt-1 block">
              {loading ? <Loader2 className="w-6 h-6 animate-spin text-blue-500" /> : `${data.overallCompletionPct}%`}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              {data.overallCompletionText}
            </span>
          </Card>
          <Card className="p-5 rounded-2xl bg-white border-slate-200/90 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block">Average Marks</span>
            <span className="text-3xl font-black text-emerald-600 mt-1 block">
              {loading ? <Loader2 className="w-6 h-6 animate-spin text-emerald-500" /> : data.averageMarks}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              {data.averageMarksSubtext}
            </span>
          </Card>
          <Card className="p-5 rounded-2xl bg-white border-slate-200/90 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block">Attendance Rate</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">
              {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : data.attendanceRate}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              {data.attendanceSubtext}
            </span>
          </Card>
        </div>

        {/* Dynamic Curriculum Milestones Timeline */}
        <Card className="p-6 rounded-3xl bg-white border-slate-200/90 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Curriculum Milestones</h3>
            <span className="text-xs font-semibold text-slate-500">
              {data.milestones.filter((m) => m.completed).length} of {data.milestones.length} Completed
            </span>
          </div>

          <div className="space-y-4">
            {data.milestones.map((m) => (
              <div
                key={m.id}
                className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0"
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    m.completed
                      ? "bg-emerald-100 text-emerald-700"
                      : m.marks === "In Review"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {m.completed ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : m.marks === "In Review" ? (
                    <Clock className="w-5 h-5" />
                  ) : (
                    <Clock className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{m.title}</h4>
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-md shrink-0 ${
                        m.completed
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : m.marks === "In Review"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-slate-100 text-slate-600"
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
