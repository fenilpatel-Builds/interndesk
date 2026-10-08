"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  ArrowRight,
  Download,
  Calendar,
  Sparkles,
  FileCheck,
  Award,
} from "lucide-react";
import { StudentTopbar } from "@/components/student/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getProgramById, INTERNSHIP_PROGRAMS } from "@/lib/programs-data";
import { formatCurrencyINR, formatDate } from "@/lib/utils";

function EnrollmentSuccessContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const programId = params?.id as string;
  const program = getProgramById(programId) || INTERNSHIP_PROGRAMS[0];

  const enrollmentId = searchParams.get("enrollmentId") || "ENR-748291";
  const paymentId = searchParams.get("paymentId") || "pay_98214532";
  const amount = Number(searchParams.get("amount")) || program.fee;
  const studentName = "Fenil Patel";
  const currentDate = "2026-10-08T12:00:00Z";

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      <StudentTopbar title="Enrollment Confirmed" studentName={studentName} />

      <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
        <Card className="w-full max-w-lg shadow-xl border-emerald-200 bg-white rounded-3xl overflow-hidden text-center">
          <div className="bg-gradient-to-b from-emerald-50 to-white p-8 sm:p-10 space-y-6">
            {/* Large Animated Checkmark */}
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50 shadow-inner animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Enrollment Confirmed
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
                Your program enrollment fee has been verified and your internship track is now officially active.
              </p>
            </div>

            {/* Status Badge: Paid */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Status: Paid &amp; Active</span>
            </div>

            {/* Confirmation Receipt Details (Section 33) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2.5 text-left">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500">Program:</span>
                <span className="font-bold text-slate-900">{program.title}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500">Student:</span>
                <span className="font-semibold text-slate-800">{studentName}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500">Enrollment ID:</span>
                <span className="font-mono font-bold text-slate-900">{enrollmentId}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500">Payment ID:</span>
                <span className="font-mono text-slate-700">{paymentId}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-extrabold text-emerald-700">{formatCurrencyINR(amount)}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Activation Date:</span>
                <span className="font-medium text-slate-800">{formatDate(currentDate)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
              <Link href="/student/dashboard" className="flex-1">
                <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link href="/student/payments" className="flex-1">
                <Button variant="outline" size="lg" className="w-full rounded-xl font-semibold">
                  <Download className="w-4 h-4 mr-1.5" />
                  View Invoice
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
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Loading enrollment confirmation...</div>}>
      <EnrollmentSuccessContent />
    </Suspense>
  );
}
