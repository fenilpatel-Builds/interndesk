"use client";

import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Lock,
  ArrowRight,
  Mail,
  RefreshCw,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedLogo } from "@/components/ui/animated-logo";

export default function StudentStatusPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <AnimatedLogo size="lg" />
      </div>

      <Card className="w-full max-w-lg shadow-xl border-slate-200/90 rounded-2xl bg-white overflow-hidden">
        {/* Top Status Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 text-white text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-xs mb-1">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>Verification In Progress</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Application Under Review</h2>
          <p className="text-xs text-blue-100 max-w-sm mx-auto">
            Your free registration has been received and your email is verified. The administration team is reviewing your profile.
          </p>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Progress Steps (Section 14 & 56) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Application Milestones
              </h4>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Free Registration
              </span>
            </div>

            {/* Step 1: Free Registration Submitted */}
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

            {/* Step 2: Email OTP Verified */}
            <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-bold text-slate-900">Email Address Verified</h5>
                  <span className="text-[11px] font-semibold text-emerald-600">Verified ✓</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  6-Digit OTP securely verified through encrypted authentication channel.
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
                  <h5 className="text-sm font-bold text-amber-900">Admin Review Pending</h5>
                  <span className="text-[11px] font-semibold text-amber-700">In Review ●</span>
                </div>
                <p className="text-xs text-amber-800/80 mt-0.5">
                  Administrator is verifying your student information and preparing your account.
                </p>
              </div>
            </div>

            {/* Step 4: Program Enrollment & Portal Access */}
            <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-50/70 border border-slate-100 opacity-60">
              <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-bold text-slate-700">Browse Programs &amp; Portal</h5>
                  <span className="text-[11px] font-semibold text-slate-500">Unlocks on Approval</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upon admin approval, log in to browse programs, enroll, and unlock your work sessions and learning center.
                </p>
              </div>
            </div>
          </div>

          {/* Info callout */}
          <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200/80 text-xs text-blue-900 flex items-start gap-3">
            <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">What happens after approval?</span>
              You will receive an email confirmation. Then sign in at the login screen to choose your program, start your work sessions, and track your attendance.
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 justify-center rounded-xl font-semibold"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />
              Check Status Again
            </Button>
            <Link href="/login" className="flex-1">
              <Button className="w-full justify-center bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold">
                Sign In
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
