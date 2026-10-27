"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Clock, ShieldCheck, Mail, Phone, MapPin, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { INSTITUTE_CONFIG } from "@/lib/institute/config";

export default function PendingApprovalPage() {
  const searchParams = useSearchParams();
  const applicationNumber = searchParams.get("app") || "ID-AKT-2026";
  const studentEmail = searchParams.get("email") || "";

  return (
    <div className="min-h-screen bg-[#080d1a] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg space-y-6 relative z-10">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <AnimatedLogo size="lg" />
          </div>
          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-amber-400 bg-amber-950/60 border border-amber-800/60 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              Application Status: Under Review
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2.5">
              Registration Under Institute Verification
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
              Your student registration has been successfully received by {INSTITUTE_CONFIG.name}. An administrator is verifying your academic credentials.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Institute:</span>
              <span className="font-bold text-white">{INSTITUTE_CONFIG.name}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Application Number:</span>
              <span className="font-mono font-bold text-amber-400 text-sm">{applicationNumber}</span>
            </div>
            {studentEmail && (
              <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Registered Email:</span>
                <span className="font-medium text-slate-200">{studentEmail}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">Estimated Review Time:</span>
              <span className="font-semibold text-emerald-400">12 - 24 Working Hours</span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">What Happens Next?</h3>
            <ul className="text-xs text-slate-300 space-y-2.5">
              <li className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Our academic coordinator will confirm your enrollment records and student identification.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>You will receive an official notification email via Resend once your account is activated.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <ArrowRight className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>Upon approval, sign in to view assigned technical activities, submit project work, and log attendance.</span>
              </li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">Need Urgent Assistance?</p>
            <p className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>Coordinator Helpline: {INSTITUTE_CONFIG.phone}</span>
            </p>
            <p className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{INSTITUTE_CONFIG.address.city}, {INSTITUTE_CONFIG.address.state}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link href="/login" className="flex-1">
              <Button size="lg" className="w-full bg-[#d32f2f] hover:bg-[#b71c1c] text-white font-bold rounded-xl shadow-lg shadow-red-950/50">
                Go to Sign In
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.location.reload()}
              className="rounded-xl border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />
              Check Status
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
