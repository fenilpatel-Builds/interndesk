"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { INSTITUTE_CONFIG } from "@/lib/institute/config";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#080d1a] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10 text-center">
        <div className="flex justify-center mb-3">
          <AnimatedLogo size="lg" />
        </div>

        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-2xl p-8 shadow-2xl space-y-5">
          <div className="w-20 h-20 rounded-full bg-red-950/60 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold tracking-widest uppercase text-red-400 bg-red-950/60 border border-red-800/60 px-3 py-1 rounded-full">
              403 • Access Forbidden
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Restricted Institute Area
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
              You do not have administrative clearance to access this department or console in {INSTITUTE_CONFIG.name}. Your role does not grant permission for this operation.
            </p>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row gap-3">
            <Link href="/student/dashboard" className="flex-1">
              <Button size="lg" className="w-full bg-[#d32f2f] hover:bg-[#b71c1c] text-white font-bold rounded-xl shadow-lg shadow-red-950/50">
                <Home className="w-4 h-4 mr-1.5" />
                Student Portal
              </Button>
            </Link>
            <Link href="/login" className="flex-1">
              <Button variant="outline" size="lg" className="w-full rounded-xl border-slate-700 text-slate-300 hover:bg-slate-800">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Switch Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
