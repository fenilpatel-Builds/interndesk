"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, GraduationCap, ShieldCheck, UserPlus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { INSTITUTE_CONFIG } from "@/lib/institute/config";

function JoinPageContent() {
  return (
    <div className="min-h-screen bg-[#080d1a] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl space-y-6 relative z-10 text-center">
        <div className="flex justify-center mb-3">
          <AnimatedLogo size="lg" />
        </div>

        <div>
          <span className="text-[11px] font-bold tracking-widest uppercase text-red-400 bg-red-950/60 border border-red-800/60 px-3.5 py-1 rounded-full">
            {INSTITUTE_CONFIG.name} • Single Institute Edition
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-3">
            Join Student &amp; Intern Cohorts
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md mx-auto">
            Organization codes are not required. All student registrations and activities connect directly to the central {INSTITUTE_CONFIG.name} academic database.
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl text-left overflow-hidden">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-800/60 text-red-400 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{INSTITUTE_CONFIG.name}</h3>
                  <p className="text-xs text-slate-400">{INSTITUTE_CONFIG.tagline}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Central Student Roster</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Zero Registration Fees</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified Email OTP Auth</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Official Offer Letters</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Available Academic Departments</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {INSTITUTE_CONFIG.departments.map((dept) => (
                  <div key={dept.id} className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/60 text-slate-300">
                    <span className="font-semibold text-white block">{dept.name}</span>
                    <span className="text-[10px] text-slate-500">{dept.headOfDepartment}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link href="/register" className="flex-1">
                <Button size="lg" className="w-full bg-[#d32f2f] hover:bg-[#b71c1c] text-white font-bold rounded-xl shadow-lg shadow-red-950/50">
                  <UserPlus className="w-4 h-4 mr-1.5" />
                  Register as Student
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link href="/login" className="flex-1">
                <Button variant="outline" size="lg" className="w-full rounded-xl border-slate-700 text-slate-300 hover:bg-slate-800">
                  <LogIn className="w-4 h-4 mr-1.5" />
                  Sign In to Portal
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080d1a]" />}>
      <JoinPageContent />
    </Suspense>
  );
}
