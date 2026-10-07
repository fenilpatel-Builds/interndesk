"use client";

import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Lock,
  ArrowRight,
  GraduationCap,
  Mail,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function StudentStatusPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-800 flex items-center justify-center text-white shadow-md">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="text-left">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              InternDesk
            </span>
            <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-500">
              Learn • Work • Grow
            </span>
          </div>
        </Link>
      </div>

      <Card className="w-full max-w-lg shadow-xl border-slate-200/90 rounded-2xl bg-white overflow-hidden">
        {/* Top Status Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-xs mb-1">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>Verification In Progress</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Application Under Review</h2>
          <p className="text-xs text-blue-100 max-w-sm mx-auto">
            Your registration has been received and verified. The administration team is currently reviewing your documents.
          </p>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Progress Steps (Section 50) */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Application Milestones
            </h4>

            {/* Step 1: Registration */}
            <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-bold text-slate-900">Registration Submitted</h5>
                  <span className="text-[11px] font-semibold text-emerald-600">Completed ✓</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Personal, college, and technology specialization details registered.
                </p>
              </div>
            </div>

            {/* Step 2: Payment */}
            <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-bold text-slate-900">Registration Fee Verified</h5>
                  <span className="text-[11px] font-semibold text-emerald-600">Verified ₹1,000 ✓</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official Razorpay payment confirmed & receipt generated.
                </p>
              </div>
            </div>

            {/* Step 3: Admin Review */}
            <div className="flex items-start gap-3.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80">
              <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-bold text-amber-900">Admin Verification Pending</h5>
                  <span className="text-[11px] font-semibold text-amber-700">In Review ●</span>
                </div>
                <p className="text-xs text-amber-800/80 mt-0.5">
                  Reviewing academic credentials, project track, and mentor assignment.
                </p>
              </div>
            </div>

            {/* Step 4: Portal Access */}
            <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-50/70 border border-slate-100 opacity-60">
              <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-bold text-slate-700">Full Portal Access</h5>
                  <span className="text-[11px] font-semibold text-slate-500">Locked</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Attendance timers, daily reports, learning center & assessments will unlock once approved.
                </p>
              </div>
            </div>
          </div>

          {/* Info callout */}
          <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200/80 text-xs text-blue-900 flex items-start gap-3">
            <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">What happens next?</span>
              You will receive an automated email notification as soon as your internship account is approved by the admin.
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 justify-center"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />
              Check Status Again
            </Button>
            <Link href="/" className="flex-1">
              <Button className="w-full justify-center bg-blue-600 hover:bg-blue-700">
                Return to Home
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
