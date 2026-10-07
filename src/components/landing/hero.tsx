import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileCheck2,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section id="hero" className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-50/60 via-indigo-50/30 to-transparent -z-10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 border border-blue-200/80 text-blue-800 text-xs font-semibold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Official Enterprise Internship Platform</span>
              <span className="w-1 h-1 rounded-full bg-blue-400" />
              <span className="text-blue-600 font-bold">2026 Cohort</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Your Internship Journey,{" "}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 bg-clip-text text-transparent">
                Simplified.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Register, learn, work, track your progress, complete assessments,
              and get your internship documents — all in one place.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 text-base font-semibold">
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <a href="#features" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full text-base font-semibold border-slate-300 hover:bg-slate-100">
                  Explore Platform
                </Button>
              </a>
            </div>

            {/* Trust highlights */}
            <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-medium text-slate-600">Admin Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-xs font-medium text-slate-600">Real-Time Hours</span>
              </div>
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-xs font-medium text-slate-600">Verified Certificates</span>
              </div>
            </div>
          </div>

          {/* Right Column: Realistic Interactive Dashboard Preview Mockup */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl bg-slate-900 p-3 shadow-2xl ring-1 ring-slate-800/80 max-w-md mx-auto">
              {/* Window Controls */}
              <div className="flex items-center justify-between pb-3 px-2 border-b border-slate-800">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="text-[11px] font-mono text-slate-400 font-medium">
                  intern.desk/student/dashboard
                </div>
                <div className="w-3" />
              </div>

              {/* Mockup Dashboard Content */}
              <div className="bg-slate-950 p-4 rounded-xl space-y-4 text-slate-100">
                {/* Header preview */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Good Morning,</span>
                    <h4 className="text-sm font-bold text-white">Aarav Sharma</h4>
                  </div>
                  <Badge variant="success" className="bg-emerald-950 text-emerald-300 border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                    Active Session
                  </Badge>
                </div>

                {/* Live Timer Card */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      Live Productive Session
                    </span>
                    <span className="font-mono text-blue-400 font-semibold">Today: 05:42:18</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div className="text-2xl font-mono font-bold text-white tracking-wider">
                      02:45:10
                    </div>
                    <div className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                      Productive
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button className="text-xs py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 font-medium text-white transition-colors">
                      Clock Out
                    </button>
                    <button className="text-xs py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 font-medium text-slate-300 border border-slate-700 transition-colors">
                      Take Break
                    </button>
                  </div>
                </div>

                {/* Progress Mini Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">
                      Attendance
                    </span>
                    <div className="text-base font-bold text-white mt-0.5">88.5%</div>
                    <span className="text-[10px] text-emerald-400">Required: 80% ✓</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">
                      Tasks
                    </span>
                    <div className="text-base font-bold text-white mt-0.5">14 / 16</div>
                    <span className="text-[10px] text-blue-400">2 In Review</span>
                  </div>
                </div>

                {/* Quick tasks */}
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-300">
                    Next Milestones
                  </span>
                  <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800 text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Daily Work Report
                    </span>
                    <span className="text-[10px] text-emerald-400">Submitted</span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1 text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                      Module 3 Assessment
                    </span>
                    <span className="text-[10px] text-amber-400">Due Friday</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating verification badge */}
            <div className="hidden sm:flex absolute -bottom-5 -left-6 bg-white p-3 rounded-xl shadow-xl border border-slate-200 items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Certificate Eligible</p>
                <p className="text-[10px] text-slate-500">Verified by Internship Admin</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
