"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  FileText,
  UserPlus,
  BookOpen,
  Award,
  Calendar,
  CheckCircle2,
  FileCheck2,
  Sparkles,
  Layers,
  Activity,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section id="hero" className="relative pt-8 pb-16 md:pt-14 md:pb-24 overflow-hidden bg-gradient-to-b from-blue-50/40 via-white to-slate-50/50">
      {/* Background glow highlights & ambient nodes */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -top-10 right-10 w-72 h-72 bg-indigo-100/40 rounded-full blur-2xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Hero Copy & Actions (Section 8) */}
          <div className="lg:col-span-5 space-y-5 text-center lg:text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold shadow-2xs">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Free Student Registration • Official 2026 Cohort</span>
            </div>

            {/* Main Headline (Section 8) */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.3rem] font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Your Internship <br className="hidden sm:inline" />
              <span className="text-blue-600">Journey, Simplified.</span>
            </h1>

            {/* Supporting Text (Section 8) */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal">
              Manage your internship, attendance, tasks, learning, assessments, and certificates from one powerful platform.
            </p>

            {/* Primary & Secondary CTAs (Section 8: Register Free & Explore Programs) */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <Link href="/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 rounded-xl shadow-md shadow-blue-500/20"
                >
                  Register Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/programs" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full text-slate-700 font-semibold border-slate-300 hover:bg-slate-50 px-6 rounded-xl"
                >
                  Explore Programs
                  <ArrowRight className="w-4 h-4 ml-2 text-slate-400" />
                </Button>
              </Link>
            </div>

            {/* Trust Indicator */}
            <div className="pt-4 flex items-center justify-center lg:justify-start gap-3.5">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                  FP
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                  AS
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                  PP
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-amber-600 text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                  NK
                </div>
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-800">Trusted by 500+ student interns</p>
                <p className="text-[11px] font-bold text-emerald-600">Zero Registration Fee • 100% Free Signup</p>
              </div>
            </div>
          </div>

          {/* Right Column: Floating 3D-Style SaaS Dashboard Composition (Section 9) */}
          <div className="lg:col-span-7 relative">
            {/* FLOATING CARD 1: Work Session 03:42:18 (Top Right) */}
            <div className="hidden sm:flex absolute -top-5 right-2 z-30 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-slate-200/80 items-center gap-3 animate-pulse" style={{ animationDuration: "4s" }}>
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Clock className="w-5 h-5 animate-spin" style={{ animationDuration: "12s" }} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Work Session
                </span>
                <p className="text-sm font-mono font-black text-slate-900 tracking-wider">
                  03:42:18
                </p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
            </div>

            {/* FLOATING CARD 2: Today's Tasks 5 / 7 Completed (Top Left) */}
            <div className="hidden sm:flex absolute -top-6 -left-4 z-30 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-lg border border-slate-200/80 items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckSquare className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Today&apos;s Tasks
                </span>
                <p className="text-xs font-bold text-slate-900">5 / 7 Completed</p>
              </div>
            </div>

            {/* FLOATING CARD 3: Assessment 86% (Bottom Left) */}
            <div className="hidden sm:flex absolute -bottom-4 -left-3 z-30 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-slate-200/80 items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Assessment Score
                </span>
                <p className="text-sm font-black text-indigo-700">86%</p>
              </div>
            </div>

            {/* FLOATING CARD 4: Attendance 94% (Bottom Right) */}
            <div className="hidden sm:flex absolute -bottom-5 right-6 z-30 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-slate-200/80 items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Attendance
                </span>
                <p className="text-sm font-black text-emerald-700">94%</p>
              </div>
            </div>

            {/* MAIN DASHBOARD CONTAINER (SaaS Mockup) */}
            <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden">
              {/* Window Header */}
              <div className="h-10 bg-slate-900 px-4 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-mono text-slate-400 ml-2">app.interndesk.com/student/dashboard</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  LIVE SESSION
                </span>
              </div>

              {/* Dashboard Internal Mockup Content */}
              <div className="p-6 bg-slate-50/70 space-y-5">
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Good Morning, Student 👋</h3>
                    <p className="text-xs text-slate-500">Cohort: Full Stack Web Development (Active)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Approved Intern ✓
                    </span>
                  </div>
                </div>

                {/* 3 Metric Cards with Progress Rings */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Metric 1: Internship Progress 72% */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-center space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Internship Progress
                    </span>
                    <div className="text-xl font-black text-blue-600">72%</div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: "72%" }} />
                    </div>
                  </div>

                  {/* Metric 2: Today Tasks */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-center space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Tasks Completed
                    </span>
                    <div className="text-xl font-black text-slate-900">5 / 7</div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: "71%" }} />
                    </div>
                  </div>

                  {/* Metric 3: Weekly Assessment */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-center space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Avg Assessment
                    </span>
                    <div className="text-xl font-black text-indigo-600">86%</div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: "86%" }} />
                    </div>
                  </div>
                </div>

                {/* Dynamic Work Session Preview Banner inside Dashboard */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between shadow-sm">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
                        Live Tracking Session
                      </span>
                    </div>
                    <p className="text-2xl font-mono font-black tracking-wider">03:42:18</p>
                    <p className="text-[11px] text-blue-100">Target: 8h 00m • Status: Working</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-white/20 text-xs font-semibold backdrop-blur-xs">
                      Take Break
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-white text-blue-900 text-xs font-bold shadow-xs">
                      Clock Out
                    </span>
                  </div>
                </div>

                {/* Daily Work Log Timeline Snippet */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Recent Daily Work Timeline</span>
                    <span className="text-[10px] font-normal text-slate-400">Today</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] text-slate-600">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400">09:00 - 10:30</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      <span className="font-medium text-slate-800">Implemented OAuth 2.0 Auth Module</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400">10:30 - 12:00</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      <span className="font-medium text-slate-800">Optimized PostgreSQL Indexing &amp; Queries</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
