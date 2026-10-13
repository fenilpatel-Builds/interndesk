"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  ArrowRight,
  Calendar,
  Sparkles,
  Award,
} from "lucide-react";
import { StudentTopbar } from "@/components/student/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getProgramById, INTERNSHIP_PROGRAMS } from "@/lib/programs-data";

function EnrollmentSuccessContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const programId = params?.id as string;
  const program = getProgramById(programId) || INTERNSHIP_PROGRAMS[0];

  const enrollmentId = searchParams.get("enrollmentId") || "ENR-748291";
  const studentName = "Sarah Chen";
  const currentDate = "2026-10-12T12:00:00Z";

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      <StudentTopbar title="Enrollment Confirmed" studentName={studentName} />

      <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
        <Card className="w-full max-w-lg shadow-xl border-emerald-200 bg-white rounded-3xl overflow-hidden text-center">
          <div className="bg-gradient-to-b from-emerald-50 to-white p-8 sm:p-10 space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50 shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Enrollment Confirmed
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto font-normal">
                Your program enrollment is registered and your internship cohort is now officially active.
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Status: Active &amp; Verified</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2.5">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                <span className="text-slate-500">Program Track:</span>
                <span className="font-bold text-slate-900">{program.title}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                <span className="text-slate-500">Enrollment ID:</span>
                <span className="font-mono font-bold text-blue-700">{enrollmentId}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Tuition &amp; Fees:</span>
                <span className="font-bold text-emerald-700">100% Free (Zero Fees)</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link href="/workspace" className="flex-1">
                <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl">
                  Go to Workspace
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}

export default function EnrollmentSuccessPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500 font-mono">Loading confirmation...</div>}>
      <EnrollmentSuccessContent />
    </Suspense>
  );
}
