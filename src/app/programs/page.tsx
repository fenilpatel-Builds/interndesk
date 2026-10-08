"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Clock,
  Award,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Users,
  Search,
  Filter,
  Sparkles,
  Layers,
} from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { INTERNSHIP_PROGRAMS, type InternshipProgram } from "@/lib/programs-data";
import { formatCurrencyINR } from "@/lib/utils";

export default function ProgramsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");

  const filteredPrograms = INTERNSHIP_PROGRAMS.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.technology.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === "ALL" || p.skillLevel === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Header Banner */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Official 2026 Cohorts</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Explore Internship <span className="text-blue-600">Programs</span>
            </h1>
            <p className="text-base text-slate-600 leading-relaxed font-normal">
              Industry-crafted internship cohorts with live daily work sessions, hands-on enterprise projects, mentor code reviews, and verified completion credentials.
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search programs by technology or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Filter Level:</span>
              <div className="flex items-center gap-1.5">
                {["ALL", "Beginner", "Intermediate", "Advanced"].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedLevel(lvl)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      selectedLevel === lvl
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Program Cards Grid (Section 11) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((program) => (
              <Card
                key={program.id}
                className="group flex flex-col justify-between border-slate-200/90 hover:border-blue-300 transition-all duration-300 shadow-xs hover:shadow-lg rounded-2xl overflow-hidden bg-white"
              >
                <div>
                  {/* Card Header Top */}
                  <div className="p-6 pb-4 border-b border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700">
                        {program.skillLevel}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{program.duration}</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {program.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {program.technology}
                    </p>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 pt-4 space-y-4">
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {program.shortDescription}
                    </p>

                    {/* Tech Badges */}
                    <div className="flex flex-wrap gap-1.5">
                      {program.techStack.slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                      {program.techStack.length > 4 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-400 text-[10px]">
                          +{program.techStack.length - 4}
                        </span>
                      )}
                    </div>

                    {/* Features list */}
                    <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Daily live work timer &amp; session logging</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>MCQ assessments &amp; capstone review</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Official Certificate &amp; Offer Letter</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Program Fee & Enrollment CTA */}
                <div className="p-6 pt-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Program Fee
                    </span>
                    <span className="text-xl font-extrabold text-slate-900">
                      {formatCurrencyINR(program.fee)}
                    </span>
                  </div>

                  <Link href={`/programs/${program.slug}`}>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs px-4 shadow-xs">
                      View Details
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          {filteredPrograms.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
              <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No programs match your search</h3>
              <p className="text-xs text-slate-500 mt-1">Try modifying your keyword or level filter.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
