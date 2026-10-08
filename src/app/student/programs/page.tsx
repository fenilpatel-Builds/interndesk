"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Search,
  Clock,
  Award,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Layers,
  GraduationCap,
} from "lucide-react";
import { StudentTopbar } from "@/components/student/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { INTERNSHIP_PROGRAMS, type InternshipProgram } from "@/lib/programs-data";
import { formatCurrencyINR } from "@/lib/utils";

export default function StudentProgramsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("ALL");

  const filteredPrograms = INTERNSHIP_PROGRAMS.filter((p) => {
    const matches =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.technology.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === "ALL" || p.skillLevel === selectedFilter;
    return matches && matchesFilter;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <StudentTopbar title="Browse Programs" studentName="Fenil Patel" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xs">
          <div className="max-w-2xl space-y-2 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-200" />
              <span>Internship Programs Marketplace</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Select Your Specialization Cohort
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Enroll in a verified program to activate your daily work timer, access curated repositories, submit assessments, and graduate with industry certification.
            </p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search programs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Level:</span>
            {["ALL", "Beginner", "Intermediate", "Advanced"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedFilter(lvl)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedFilter === lvl
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((program) => (
            <Card
              key={program.id}
              className="flex flex-col justify-between border-slate-200/90 hover:border-blue-300 transition-all shadow-xs hover:shadow-md rounded-2xl overflow-hidden bg-white"
            >
              <div>
                <div className="p-5 pb-3 border-b border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700">
                      {program.skillLevel}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {program.duration}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{program.title}</h3>
                  <p className="text-xs text-slate-500 font-medium">{program.technology}</p>
                </div>

                <div className="p-5 pt-3 space-y-3">
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {program.shortDescription}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {program.techStack.slice(0, 3).map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px]">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{program.curriculum.length} Core Curriculum Modules</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Cryptographic Completion Certificate</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Enrollment Fee
                  </span>
                  <span className="text-lg font-black text-slate-900">
                    {formatCurrencyINR(program.fee)}
                  </span>
                </div>

                <Link href={`/student/enroll/${program.id}`}>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs">
                    Enroll
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
