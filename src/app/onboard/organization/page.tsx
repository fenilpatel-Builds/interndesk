"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, ShieldCheck, UserPlus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { INSTITUTE_CONFIG } from "@/lib/institute/config";

export default function OrganizationOnboardingPage() {
  return (
    <div className="min-h-screen bg-[#080d1a] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg space-y-6 relative z-10 text-center">
        <div className="flex justify-center mb-3">
          <AnimatedLogo size="lg" />
        </div>

        <div>
          <span className="text-[11px] font-bold tracking-widest uppercase text-red-400 bg-red-950/60 border border-red-800/60 px-3.5 py-1 rounded-full">
            {INSTITUTE_CONFIG.name} • Single Institute Edition
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-3">
            Central Institute Configuration
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md mx-auto">
            This platform is dedicated to {INSTITUTE_CONFIG.name}. Multi-tenant organization onboarding has been retired in favor of the unified single institute architecture.
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl text-left overflow-hidden">
          <CardContent className="p-6 sm:p-8 space-y-5">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Institute Name:</span>
                <span className="font-bold text-white">{INSTITUTE_CONFIG.name}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Primary Administrator:</span>
                <span className="font-semibold text-slate-200">Akash Padhiyar (CEO)</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Active Departments:</span>
                <span className="font-mono font-bold text-amber-400">{INSTITUTE_CONFIG.departments.length} Academic Departments</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Database Scope:</span>
                <span className="font-semibold text-emerald-400">Single Central Instance</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link href="/admin/dashboard" className="flex-1">
                <Button size="lg" className="w-full bg-[#d32f2f] hover:bg-[#b71c1c] text-white font-bold rounded-xl shadow-lg shadow-red-950/50">
                  <Settings className="w-4 h-4 mr-1.5" />
                  Admin Console
                </Button>
              </Link>
              <Link href="/register" className="flex-1">
                <Button variant="outline" size="lg" className="w-full rounded-xl border-slate-700 text-slate-300 hover:bg-slate-800">
                  <UserPlus className="w-4 h-4 mr-1.5" />
                  Student Registration
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
