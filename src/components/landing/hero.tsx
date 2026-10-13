"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Users,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  GraduationCap,
  Briefcase,
  Search,
  ExternalLink,
  Laptop,
  CheckSquare,
  Clock,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  const [quickCode, setQuickCode] = useState("");
  const [discoveredOrg, setDiscoveredOrg] = useState<{
    name: string;
    code: string;
    type: string;
    members: string;
  } | null>(null);

  const sampleOrgs = [
    { code: "ORG-7K4P9X", name: "Apex Technologies", type: "Corporate MNC", members: "124 Active Members" },
    { code: "ORG-M8D2QF", name: "Westbridge University", type: "Educational Institution", members: "450 Students & Faculty" },
    { code: "ORG-5T9L3B", name: "Future Skills Institute", type: "Training Institute", members: "88 Learners & Trainers" },
  ];

  const handleQuickLookup = (code: string) => {
    const cleaned = code.trim().toUpperCase();
    setQuickCode(cleaned);
    const found = sampleOrgs.find((o) => o.code === cleaned || o.code.replace("ORG-", "") === cleaned);
    if (found) {
      setDiscoveredOrg(found);
    } else {
      setDiscoveredOrg(null);
    }
  };

  return (
    <section className="relative pt-8 pb-16 md:pt-14 md:pb-24 overflow-hidden bg-gradient-to-b from-blue-50/40 via-white to-slate-50/60">
      {/* Background glow highlights & ambient nodes */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -top-10 right-10 w-72 h-72 bg-indigo-100/30 rounded-full blur-2xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Hero Copy & Actions */}
          <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold shadow-xs">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Multi-Tenant Enterprise Platform • Zero Fees</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.3rem] font-black text-slate-900 tracking-tight leading-[1.12]">
              One Platform. <br className="hidden sm:inline" />
              <span className="text-blue-600">Every Organization.</span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal">
              Manage people, internships, learning, attendance, tasks, assessments, and documentation across your organization with one secure, intelligent workspace.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1">
              <Link href="/onboard/organization" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 rounded-xl shadow-md shadow-blue-500/20"
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Create Organization Workspace
                </Button>
              </Link>
              <Link href="#features" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full text-slate-700 font-semibold border-slate-300 hover:bg-slate-50 px-6 rounded-xl"
                >
                  Explore the Platform
                </Button>
              </Link>
            </div>

            {/* Additional Link */}
            <div className="pt-1 flex items-center justify-center lg:justify-start">
              <Link
                href="/join"
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 group"
              >
                <span>Have an Organization Code? Join an Existing Organization</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Interactive Live Discovery Snippet */}
            <div className="pt-2 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm max-w-md mx-auto lg:mx-0 text-left">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-blue-600" />
                Quick Workspace Discovery
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code (e.g. ORG-7K4P9X)"
                  value={quickCode}
                  onChange={(e) => handleQuickLookup(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 uppercase"
                />
                <Link href={`/join?code=${quickCode || "ORG-7K4P9X"}`}>
                  <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-3 rounded-lg">
                    Verify
                  </Button>
                </Link>
              </div>

              {/* Sample Chips */}
              <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-600 font-medium">Try:</span>
                {sampleOrgs.map((org) => (
                  <button
                    key={org.code}
                    onClick={() => handleQuickLookup(org.code)}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold cursor-pointer"
                  >
                    {org.code}
                  </button>
                ))}
              </div>

              {/* Instant match preview if matched */}
              {discoveredOrg && (
                <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between animate-fadeIn">
                  <div>
                    <span className="font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {discoveredOrg.name}
                    </span>
                    <span className="text-[11px] text-emerald-700">{discoveredOrg.type} • {discoveredOrg.members}</span>
                  </div>
                  <Link href={`/join?code=${discoveredOrg.code}`}>
                    <span className="font-bold text-emerald-700 hover:underline flex items-center text-[11px]">
                      Join <ArrowRight className="w-3 h-3 ml-0.5" />
                    </span>
                  </Link>
                </div>
              )}
            </div>

            {/* Zero Payment / Enterprise Trust Guarantee */}
            <div className="pt-2 flex items-center justify-center lg:justify-start gap-4 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1 text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Zero Platform Fees
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-700">
                <Layers className="w-4 h-4 text-blue-600" />
                Strict Tenant Isolation
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-700">
                <Award className="w-4 h-4 text-indigo-600" />
                Verifiable Credentials
              </span>
            </div>
          </div>

          {/* Right Column: Connected Multi-Tenant Architecture Visualization */}
          <div className="lg:col-span-7 relative">
            {/* Main Central Enterprise Dashboard Mockup */}
            <div className="relative rounded-2xl border border-slate-200/90 bg-white shadow-2xl overflow-hidden p-5 space-y-4">
              {/* Dashboard Window Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs font-bold text-slate-700 tracking-wide">
                    InternDesk Enterprise Orchestrator
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Multi-Tenant Active
                  </span>
                </div>
              </div>

              {/* Central Metrics Row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Total Workspaces</p>
                  <p className="text-xl font-black text-slate-900 mt-0.5">142</p>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">MNCs, Unis & Institutes</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                  <p className="text-[10px] font-bold uppercase text-blue-500">Active Members</p>
                  <p className="text-xl font-black text-blue-900 mt-0.5">8,450</p>
                  <p className="text-[10px] text-blue-600 font-semibold mt-0.5">Students, Interns & Admins</p>
                </div>
                <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100">
                  <p className="text-[10px] font-bold uppercase text-indigo-500">Tasks Completed</p>
                  <p className="text-xl font-black text-indigo-900 mt-0.5">94.8%</p>
                  <p className="text-[10px] text-indigo-600 font-semibold mt-0.5">Verified Deliverables</p>
                </div>
              </div>

              {/* Three Connected Workspace Nodes (Apex, Future Skills, Westbridge) */}
              <div className="space-y-2.5 pt-1">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  Isolated Tenant Workspaces Running Concurrently
                </p>

                {/* Workspace Card 1: Apex Technologies */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50/60 to-white border border-blue-200/80 flex items-center justify-between shadow-2xs hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                      AT
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900">Apex Technologies</h4>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-700">
                          ORG-7K4P9X
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 uppercase">
                          Corporate MNC
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Cloud Backend Track • 24 Interns • 100% Timesheet Compliance
                      </p>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Active Workspace
                    </span>
                  </div>
                </div>

                {/* Workspace Card 2: Westbridge University */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-50/60 to-white border border-indigo-200/80 flex items-center justify-between shadow-2xs hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                      WU
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900">Westbridge University</h4>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700">
                          ORG-M8D2QF
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 uppercase">
                          University
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        School of Computing • 52 Capstone Interns • 4 Faculty Mentors
                      </p>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                      Verified Institution
                    </span>
                  </div>
                </div>

                {/* Workspace Card 3: Future Skills Institute */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50/60 to-white border border-emerald-200/80 flex items-center justify-between shadow-2xs hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                      FS
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900">Future Skills Institute</h4>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700">
                          ORG-5T9L3B
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 uppercase">
                          Training Institute
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Applied AI Bootcamp • 38 Learners • 8 Hands-on Assessments
                      </p>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Verified Training
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Feature Highlights */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span className="flex items-center gap-1 text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  Live Work Timer
                </span>
                <span className="flex items-center gap-1 text-slate-700">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                  Daily Work Reports
                </span>
                <span className="flex items-center gap-1 text-slate-700">
                  <Laptop className="w-3.5 h-3.5 text-indigo-600" />
                  LMS & Assessments
                </span>
                <span className="flex items-center gap-1 text-slate-700">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  Verified Certificates
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
