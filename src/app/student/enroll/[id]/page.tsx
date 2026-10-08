"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Lock,
  Sparkles,
  Clock,
  Award,
  Layers,
  AlertCircle,
} from "lucide-react";
import { StudentTopbar } from "@/components/student/topbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getProgramById, INTERNSHIP_PROGRAMS } from "@/lib/programs-data";
import { formatCurrencyINR } from "@/lib/utils";

function ProgramEnrollmentPaymentContent() {
  const params = useParams();
  const router = useRouter();
  const programId = params?.id as string;
  const program = getProgramById(programId) || INTERNSHIP_PROGRAMS[0];

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Enrollment ID initialized safely for prerendering
  const [enrollmentId, setEnrollmentId] = useState("ENR-748291");

  React.useEffect(() => {
    setEnrollmentId(`ENR-${Date.now().toString().slice(-6)}`);
  }, []);

  // Fee calculation (18% GST included or broken down)
  const baseFee = Math.round(program.fee / 1.18);
  const gstAmount = program.fee - baseFee;
  const finalAmount = program.fee;

  const handleProceedToPayment = async () => {
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      // 1. Simulate server order creation and payment authorization
      const simulatedPaymentId = `pay_${Date.now()}`;

      // Call server enrollment endpoint
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: `order_${Date.now()}`,
          paymentId: simulatedPaymentId,
          signature: "simulated_secure_sig",
          programId: program.id,
          enrollmentId,
          amount: finalAmount,
          formData: {
            fullName: "Fenil Patel",
            email: "fenil8918@gmail.com",
            mobile: "9876543210",
            college: "National Institute of Technology",
            university: "State Technical University",
            course: "B.Tech Computer Science",
            technology: program.title,
            duration: program.duration,
            startDate: "2026-10-08",
            category: "Academic Internship",
          },
        }),
      });

      // Navigate to success confirmation screen
      router.push(
        `/student/enroll/${program.id}/success?enrollmentId=${enrollmentId}&paymentId=${simulatedPaymentId}&amount=${finalAmount}`
      );
    } catch {
      setErrorMsg("Payment processing encountered an issue. Please retry.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      <StudentTopbar title="Program Enrollment Checkout" studentName="Fenil Patel" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Breadcrumb / Back button */}
        <div className="max-w-4xl mx-auto">
          <Link
            href="/student/programs"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to programs catalog</span>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Program Summary Card */}
          <div className="lg:col-span-7 space-y-5">
            <Card className="border-slate-200/90 shadow-sm rounded-2xl overflow-hidden bg-white">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-xs">
                    {program.skillLevel}
                  </span>
                  <span className="text-xs font-semibold text-blue-100 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {program.duration}
                  </span>
                </div>
                <CardTitle className="text-2xl font-black mt-2 text-white">
                  {program.title}
                </CardTitle>
                <CardDescription className="text-blue-100 text-xs">
                  {program.technology}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  {program.description}
                </p>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Included with Enrollment
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{program.curriculum.length} Core Modules</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Live Work Session Timer</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Weekly MCQ Assessments</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Verified Certificate &amp; Offer</span>
                    </div>
                  </div>
                </div>

                {/* Important Notice: Registration vs Enrollment (Section 31 & 32) */}
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 space-y-1">
                  <span className="font-bold flex items-center gap-1.5 text-blue-800">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Program Enrollment Fee
                  </span>
                  <p className="text-blue-900/80 leading-relaxed text-[11px]">
                    InternDesk student registration is completely free. This payment is specifically for activating the <strong>{program.title}</strong> curriculum and mentorship track.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Checkout Breakdown (Master Prompt Section 32) */}
          <div className="lg:col-span-5 space-y-5">
            <Card className="border-slate-200/90 shadow-md rounded-2xl bg-white">
              <CardHeader className="pb-4 border-b border-slate-100">
                <CardTitle className="text-lg font-bold">
                  Complete Your Program Enrollment
                </CardTitle>
                <CardDescription className="text-xs">
                  Review invoice items and authorize enrollment payment.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-5">
                {/* Reference Details */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Enrollment ID:</span>
                    <span className="font-mono font-bold text-slate-900">{enrollmentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Program:</span>
                    <span className="font-semibold text-slate-800">{program.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Duration:</span>
                    <span className="font-semibold text-slate-800">{program.duration}</span>
                  </div>
                </div>

                {/* Pricing Table */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Program Tuition:</span>
                    <span className="font-medium text-slate-900">{formatCurrencyINR(baseFee)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Applicable Taxes (18% GST):</span>
                    <span className="font-medium text-slate-900">{formatCurrencyINR(gstAmount)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-slate-900">Total Final Amount:</span>
                    <span className="text-2xl font-black text-slate-900">{formatCurrencyINR(finalAmount)}</span>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Payment CTA */}
                <div className="pt-2 space-y-3">
                  <Button
                    onClick={handleProceedToPayment}
                    size="lg"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                    isLoading={isProcessing}
                  >
                    Proceed to Payment
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>256-bit encrypted via Razorpay (UPI, NetBanking, Cards)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProgramEnrollmentPaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-slate-500">Loading checkout...</div>}>
      <ProgramEnrollmentPaymentContent />
    </Suspense>
  );
}
