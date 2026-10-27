"use client";

import React, { useState } from "react";
import { StudentTopbar } from "@/components/student/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Award,
  Calendar,
} from "lucide-react";
import Link from "next/link";

export default function StudentSubmissionsPage() {
  const [filter, setFilter] = useState<"ALL" | "APPROVED" | "PENDING">("ALL");

  const submissions = [
    {
      id: "sub-1",
      activityTitle: "Web Development Assignment",
      department: "Computer Science",
      submittedAt: "Oct 25, 2026, 04:30 PM",
      status: "APPROVED",
      score: "92/100",
      feedback: "Exceptional Next.js App Router implementation with clean UI states.",
      github: "https://github.com/akash-technolabs/student-project",
      demo: "https://student-preview.akashtechnolabs.com",
    },
    {
      id: "sub-2",
      activityTitle: "Research Paper Submission",
      department: "Information Technology",
      submittedAt: "Oct 24, 2026, 11:15 AM",
      status: "APPROVED",
      score: "88/100",
      feedback: "Comprehensive comparative analysis of relational vs NoSQL architectures.",
      github: "https://github.com/akash-technolabs/research-paper",
    },
    {
      id: "sub-3",
      activityTitle: "UI/UX Design Project",
      department: "Design & CSE",
      submittedAt: "Oct 26, 2026, 02:45 PM",
      status: "PENDING",
      score: "In Review",
      feedback: "Awaiting faculty supervisor evaluation.",
      demo: "https://figma.com/file/sample-preview",
    },
  ];

  const filtered = submissions.filter((s) => {
    if (filter === "APPROVED") return s.status === "APPROVED";
    if (filter === "PENDING") return s.status === "PENDING";
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50">
      <StudentTopbar title="Submissions & Evaluations" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              My Submissions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Track evaluation grades, scores, and faculty supervisor feedback
            </p>
          </div>
          <Link href="/student/activities">
            <Button size="sm" className="bg-[#E52329] hover:bg-[#C41C22] text-white font-bold rounded-xl text-xs">
              Submit New Assignment
            </Button>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200/90 rounded-2xl w-fit shadow-xs">
          {(["ALL", "APPROVED", "PENDING"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                filter === f
                  ? "bg-[#0F4C81] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {f === "ALL" ? "All Submissions" : f === "APPROVED" ? "Approved" : "In Review"}
            </button>
          ))}
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          {filtered.map((item) => (
            <Card
              key={item.id}
              className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {item.department}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">{item.submittedAt}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{item.activityTitle}</h3>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-xl">
                    Score: {item.score}
                  </span>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                      item.status === "APPROVED"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {item.status === "APPROVED" ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approved
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        Under Review
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Feedback quote */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
                <MessageSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block mb-0.5">Faculty Feedback:</span>
                  <p>{item.feedback}</p>
                </div>
              </div>

              {/* Links */}
              <div className="flex items-center gap-4 text-xs font-semibold pt-1">
                {item.github && (
                  <a
                    href={item.github}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <span>View Repository</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {item.demo && (
                  <a
                    href={item.demo}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-600 hover:underline flex items-center gap-1"
                  >
                    <span>Live Preview</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
