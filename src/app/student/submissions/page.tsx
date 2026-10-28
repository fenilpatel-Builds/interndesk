"use client";

import React, { useState, useEffect } from "react";
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
  Sparkles,
  Inbox,
} from "lucide-react";
import Link from "next/link";
import { parseClientSessionCookie } from "@/lib/auth/client-session";
import { ActivitySubmission } from "@/types/activity";

export default function StudentSubmissionsPage() {
  const [filter, setFilter] = useState<"ALL" | "APPROVED" | "PENDING">("ALL");
  const [submissions, setSubmissions] = useState<ActivitySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("Student Intern");

  useEffect(() => {
    const session = parseClientSessionCookie();
    if (session?.name) setStudentName(session.name);

    const fetchSubmissions = async () => {
      try {
        const emailQuery = session?.email ? `?studentEmail=${encodeURIComponent(session.email)}` : "";
        const res = await fetch(`/api/activities/submissions${emailQuery}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.submissions)) {
            setSubmissions(data.submissions);
          }
        }
      } catch (err) {
        console.error("Failed to fetch student submissions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  const filtered = submissions.filter((s) => {
    if (filter === "APPROVED") return s.status === "APPROVED";
    if (filter === "PENDING") return s.status === "SUBMITTED";
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50">
      <StudentTopbar title="Submissions & Evaluations" studentName={studentName} />

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

        {/* Submissions List or Empty State */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading submissions...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center max-w-lg mx-auto shadow-2xs space-y-4 my-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-2xs">
              <Inbox className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                {filter === "ALL" ? "No submissions recorded yet" : `No ${filter.toLowerCase()} submissions found`}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                {filter === "ALL"
                  ? "You have not submitted any assignments or project practicums yet. Explore the activities tab to submit your work for faculty evaluation."
                  : `There are currently no submissions matching the ${filter.toLowerCase()} filter.`}
              </p>
            </div>
            {filter === "ALL" && (
              <Link href="/student/activities" className="inline-block pt-1">
                <Button className="bg-[#0F4C81] hover:bg-[#0C3D68] text-white font-bold text-xs rounded-xl px-5 py-2.5 shadow-xs cursor-pointer">
                  Browse Assignments
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((item) => {
              const isApproved = item.status === "APPROVED";
              const isRejected = item.status === "REJECTED";
              const submittedDateFormatted = new Date(item.submittedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <Card
                  key={item.id}
                  className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {item.departmentId || "Academic Department"}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500">{submittedDateFormatted}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{item.activityTitle}</h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-xl">
                        Score: {item.score !== undefined ? `${item.score}/100` : "In Review"}
                      </span>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                          isApproved
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : isRejected
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {isApproved ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approved
                          </>
                        ) : isRejected ? (
                          <>
                            <AlertCircle className="w-3.5 h-3.5" />
                            Needs Revision
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

                  {/* Submission Report Content */}
                  <div className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-800 block mb-1">Your Submission Summary:</span>
                    <p className="line-clamp-3">{item.reportContent}</p>
                  </div>

                  {/* Feedback quote if reviewed */}
                  {item.feedback && (
                    <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-slate-700 flex items-start gap-2.5">
                      <MessageSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900 block mb-0.5">
                          Faculty Feedback ({item.reviewerName || "Faculty Evaluator"}):
                        </span>
                        <p>{item.feedback}</p>
                      </div>
                    </div>
                  )}

                  {/* Links */}
                  {item.attachmentUrl && (
                    <div className="flex items-center gap-4 text-xs font-semibold pt-1">
                      <a
                        href={item.attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <span>View Attachment / Repository</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
