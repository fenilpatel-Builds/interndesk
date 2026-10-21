"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { INTERNSHIP_PROGRAMS, getProgramById } from "@/lib/programs-data";

function StudentEnrollContent() {
  const params = useParams();
  const programId = params?.id as string;
  const program = getProgramById(programId) || INTERNSHIP_PROGRAMS[0];

  const [isProcessing, setIsProcessing] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  const handleEnrollFree = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setEnrolled(true);
    }, 600);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6 px-4">
      <Link href="/programs">
        <Button variant="ghost" size="sm" className="text-slate-600">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Programs
        </Button>
      </Link>

      {!enrolled ? (
        <Card className="border-slate-200 bg-white rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              100% Free Program Enrollment
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
              Enroll in {program.title}
            </h1>
            <p className="text-xs text-slate-500 font-normal">
              Zero registration fee. Directly enroll in your industry internship cohort.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold">Duration</p>
              <p className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                {program.duration}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold">Level</p>
              <p className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                {program.skillLevel}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <h4 className="font-bold text-slate-900">What&apos;s Included:</h4>
            <ul className="space-y-1.5 pl-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Live attendance clock and break management</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Daily work reports with mentor feedback reviews</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Timed technical assessments and auto-grading</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Official Offer Letter and verifiable Certificate</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Free Enrollment Guaranteed</span>
            </div>
            <Button
              onClick={handleEnrollFree}
              isLoading={isProcessing}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 rounded-xl shadow-md"
            >
              Confirm Enrollment
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="border-emerald-200 bg-white rounded-2xl p-8 text-center space-y-4 shadow-lg animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            Enrolled Successfully!
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto font-normal">
            You are officially enrolled in <span className="font-bold text-slate-800">{program.title}</span>. You can now track your attendance and start daily work sessions.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link href="/workspace">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 rounded-xl">
                Open Workspace
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}

export default function StudentEnrollPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto py-12 text-center text-xs text-slate-500">Loading enrollment details...</div>}>
      <StudentEnrollContent />
    </Suspense>
  );
}
