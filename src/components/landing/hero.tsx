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
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section id="hero" className="relative pt-8 pb-16 md:pt-14 md:pb-24 overflow-hidden bg-gradient-to-b from-blue-50/40 via-white to-slate-50/50">
      {/* Background glow highlights */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-6xl h-80 bg-blue-100/50 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column */}
          <div className="lg:col-span-5 space-y-5 text-center lg:text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/70 text-blue-700 text-xs font-semibold shadow-2xs">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>Internship Management Platform</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Your Internship <br className="hidden sm:inline" />
              <span className="text-blue-600">Journey, Simplified.</span>
            </h1>

            {/* Copy */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal">
              Register, learn, work, track your progress, complete assessments, and get your internship documents — all in one place.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 rounded-xl shadow-sm shadow-blue-500/25">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <a href="#features" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full text-slate-700 font-semibold border-slate-300 hover:bg-slate-50 px-6 rounded-xl">
                  Explore Platform
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>

            {/* Social Proof */}
            <div className="pt-6 flex items-center justify-center lg:justify-start gap-3.5">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                  RS
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                  FP
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                  AS
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-amber-600 text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                  PP
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-rose-600 text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                  NK
                </div>
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-800">Trusted by students &amp; institutions</p>
                <p className="text-[11px] font-bold text-blue-600">500+ Students</p>
              </div>
            </div>
          </div>

          {/* Right Column: High-Fidelity Dashboard Mockup with Floating Badges */}
          <div className="lg:col-span-7 relative">
            {/* Top Right Floating Badge */}
            <div className="hidden sm:flex absolute -top-4 right-4 z-20 bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-2xl shadow-lg border border-slate-100 items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Track Your Progress</p>
              </div>
            </div>

            {/* Bottom Left Floating Badge */}
            <div className="hidden sm:flex absolute -bottom-4 left-6 z-20 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-lg border border-slate-100 items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs font-bold text-slate-800">Learn &amp; Improve</p>
            </div>

            {/* Bottom Right Floating Badge */}
            <div className="hidden sm:flex absolute -bottom-4 right-6 z-20 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-lg border border-slate-100 items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Award className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs font-bold text-slate-800">Get Certified</p>
            </div>

            {/* Main Interactive SaaS Frame */}
            <div className="bg-white rounded-3xl p-4 shadow-xl border border-slate-200/90 text-slate-800">
              <div className="flex gap-4">
                {/* Mini Left Sidebar */}
                <div className="hidden md:flex flex-col w-40 shrink-0 border-r border-slate-100 pr-3 space-y-4">
                  <div className="flex items-center gap-2 pt-1">
                    <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white">
                      <GraduationCap className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 tracking-tight">InternDesk</span>
                  </div>

                  <div className="space-y-1 text-[11px] font-semibold text-slate-600">
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 font-bold">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      Dashboard
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-50">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Attendance
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-50">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Work Sessions
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-50">
                      <FileText className="w-3 h-3 text-slate-400" />
                      Daily Reports
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-50">
                      <BookOpen className="w-3 h-3 text-slate-400" />
                      Learning Center
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-50">
                      <CheckCircle2 className="w-3 h-3 text-slate-400" />
                      Assessments
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-50">
                      <Award className="w-3 h-3 text-slate-400" />
                      Documents
                    </div>
                  </div>
                </div>

                {/* Mini Main Panel */}
                <div className="flex-1 space-y-3.5">
                  {/* Top Bar inside mockup */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        Good Morning, Student <span>👋</span>
                      </h4>
                      <p className="text-[10px] text-slate-500">Here&apos;s your internship progress for today.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center border border-blue-200">
                        RS
                      </div>
                      <div className="hidden sm:block text-right">
                        <p className="text-[11px] font-bold text-slate-800 leading-none">Rahul Sharma</p>
                        <p className="text-[9px] text-slate-400">Student</p>
                      </div>
                    </div>
                  </div>

                  {/* 3 Metric Cards */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-medium">Work Hours</span>
                        <Clock className="w-3 h-3 text-blue-600" />
                      </div>
                      <div className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">48.5h</div>
                      <span className="text-[9px] text-emerald-600 font-semibold">↑ 12%</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-medium">Tasks Completed</span>
                        <CheckCircle2 className="w-3 h-3 text-blue-600" />
                      </div>
                      <div className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">12</div>
                      <span className="text-[9px] text-emerald-600 font-semibold">↑ 8%</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-medium">Attendance</span>
                        <TrendingUp className="w-3 h-3 text-blue-600" />
                      </div>
                      <div className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">92%</div>
                      <span className="text-[9px] text-emerald-600 font-semibold">↑ 5%</span>
                    </div>
                  </div>

                  {/* 3 Mini Cards Grid: Work Session, Today's Schedule, Quick Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    {/* Current Work Session */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                      <p className="text-[10px] font-bold text-slate-700">Current Work Session</p>
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[9px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Working
                      </div>
                      <div>
                        <div className="text-base font-black text-slate-900 tracking-tight">04h 32m</div>
                        <p className="text-[9px] text-slate-400">Since 09:02 AM</p>
                      </div>
                      <div className="flex flex-col gap-1 pt-1">
                        <button className="w-full py-1 rounded-md bg-blue-600 text-white font-bold text-[10px]">
                          Clock Out
                        </button>
                        <button className="w-full py-1 rounded-md border border-slate-200 text-slate-700 font-bold text-[10px] hover:bg-slate-100">
                          Take Break
                        </button>
                      </div>
                    </div>

                    {/* Today's Schedule */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                      <p className="text-[10px] font-bold text-slate-700">Today&apos;s Schedule</p>
                      <div className="space-y-1.5 text-[9px] text-slate-600 pt-0.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>09:00 AM - 12:30 PM <strong className="text-slate-800">Work</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>12:30 PM - 01:15 PM <strong className="text-slate-800">Lunch Break</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>01:15 PM - 05:00 PM <strong className="text-slate-800">Work</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          <span>05:00 PM Clock Out</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                      <p className="text-[10px] font-bold text-slate-700">Quick Actions</p>
                      <div className="space-y-1 pt-0.5">
                        <div className="p-1 rounded bg-white border border-slate-200/80 flex items-center gap-1.5 text-[9px] font-medium text-slate-700">
                          <FileText className="w-2.5 h-2.5 text-blue-600" />
                          Write Daily Report
                        </div>
                        <div className="p-1 rounded bg-white border border-slate-200/80 flex items-center gap-1.5 text-[9px] font-medium text-slate-700">
                          <BookOpen className="w-2.5 h-2.5 text-blue-600" />
                          View Study Material
                        </div>
                        <div className="p-1 rounded bg-white border border-slate-200/80 flex items-center gap-1.5 text-[9px] font-medium text-slate-700">
                          <CheckCircle2 className="w-2.5 h-2.5 text-blue-600" />
                          Take Assessment
                        </div>
                        <div className="p-1 rounded bg-white border border-slate-200/80 flex items-center gap-1.5 text-[9px] font-medium text-slate-700">
                          <Award className="w-2.5 h-2.5 text-blue-600" />
                          Download Certificate
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Bottom Feature Cards Matching Image 1 */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Easy Registration */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
              <UserPlus className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Easy Registration</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Register and submit your internship application online.
            </p>
          </div>

          {/* Card 2: Admin Verification */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Admin Verification</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Applications are reviewed and approved before access is granted.
            </p>
          </div>

          {/* Card 3: Attendance & Work Tracking */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Attendance &amp; Work Tracking</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Clock in, track work hours, manage breaks, and clock out.
            </p>
          </div>

          {/* Card 4: Certificates & Letters */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Certificates &amp; Letters</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Generate and download your internship documents digitally.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
