"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  GraduationCap,
  Clock,
  Award,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Users,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Calendar,
  Briefcase,
  Layers,
} from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getProgramById, INTERNSHIP_PROGRAMS } from "@/lib/programs-data";
import { formatCurrencyINR } from "@/lib/utils";

function ProgramDetailContent() {
  const params = useParams();
  const router = useRouter();
  const programId = params?.id as string;
  const program = getProgramById(programId) || INTERNSHIP_PROGRAMS[0];

  const [expandedModule, setExpandedModule] = useState<number | null>(0);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Back button */}
          <div>
            <Link
              href="/programs"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to all programs</span>
            </Link>
          </div>

          {/* Program Hero Header (Section 12) */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-radial from-blue-100/60 to-transparent blur-3xl pointer-events-none -z-0" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
              <div className="lg:col-span-8 space-y-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                    {program.skillLevel}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                    {program.duration}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Official Internship Track
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {program.title}
                </h1>
                <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
                  {program.description}
                </p>

                {/* Tech Badges */}
                <div className="pt-2 flex flex-wrap gap-2">
                  {program.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Enrollment Pricing Card */}
              <div className="lg:col-span-4 bg-gradient-to-br from-blue-50/80 via-white to-slate-50 p-6 rounded-2xl border border-blue-200/80 shadow-md space-y-5">
                <div>
                  <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider block">
                    Program Enrollment Fee
                  </span>
                  <div className="text-3xl font-black text-slate-900 mt-1">
                    {formatCurrencyINR(program.fee)}
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Configured by administration • One-time program fee
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600 border-t border-slate-200/60 pt-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Live daily work timer &amp; session logger</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Curated study materials &amp; repositories</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>MCQ assessments &amp; capstone grading</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Verifiable PDF Certificate &amp; Offer Letter</span>
                  </div>
                </div>

                <Link href={`/student/enroll/${program.id}`} className="block">
                  <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm">
                    Enroll Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>

                <p className="text-[11px] text-slate-500 text-center">
                  Free student registration required. If not registered,{" "}
                  <Link href="/register" className="text-blue-600 font-semibold underline">
                    register free here
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>

          {/* Section: What You'll Learn (Section 12) */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span>What You&apos;ll Learn &amp; Master</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {program.learningOutcomes.map((outcome, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start gap-3 shadow-2xs"
                >
                  <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    {idx + 1}
                  </div>
                  <span className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                    {outcome}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Curriculum (Expandable Modules) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span>Internship Curriculum &amp; Timeline</span>
              </h2>
              <span className="text-xs text-slate-500 font-semibold">
                {program.curriculum.length} Core Modules
              </span>
            </div>

            <div className="space-y-3">
              {program.curriculum.map((mod, index) => {
                const isOpen = expandedModule === index;
                return (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs transition-all"
                  >
                    <button
                      onClick={() => setExpandedModule(isOpen ? null : index)}
                      className="w-full p-5 text-left flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                          {mod.week}
                        </span>
                        <span className="text-sm font-bold text-slate-900">
                          {mod.title}
                        </span>
                      </div>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 border-t border-slate-100 bg-slate-50/50">
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                          {mod.topics.map((t, tidx) => (
                            <li key={tidx} className="flex items-center gap-2 text-xs text-slate-600">
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>{t}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Certificate Guarantee */}
          <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-xs">
                <Award className="w-4 h-4 text-blue-200" />
                <span>Certified Credentials</span>
              </div>
              <h3 className="text-2xl font-black tracking-tight">
                Earn an Official Verifiable Certificate
              </h3>
              <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
                Every successful graduate receives an enterprise-grade cryptographic completion certificate with instant QR code verification.
              </p>
            </div>

            <Link href={`/student/enroll/${program.id}`}>
              <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 font-bold px-8 rounded-xl shadow-lg whitespace-nowrap">
                Enroll in Program
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ProgramDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-slate-500">Loading program details...</div>}>
      <ProgramDetailContent />
    </Suspense>
  );
}
