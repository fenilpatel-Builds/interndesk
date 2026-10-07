"use client";

import React from "react";
import { Bell, Clock, ShieldCheck, Coffee } from "lucide-react";
import Link from "next/link";
import { useWorkTimer } from "@/hooks/use-work-timer";

interface StudentTopbarProps {
  title: string;
  studentName?: string;
}

export function StudentTopbar({ title, studentName = "Student Intern" }: StudentTopbarProps) {
  const { status, hoursStr, minutesStr, secondsStr } = useWorkTimer();

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h1>
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Verified Cohort</span>
        </div>

        {/* Live Ticking Shift Indicator in Header */}
        {status === "WORKING" && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold shadow-2xs animate-in fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>
              {hoursStr}:{minutesStr}:{secondsStr}
            </span>
          </div>
        )}

        {status === "ON_BREAK" && (
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold shadow-2xs">
            <Coffee className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
            <span>On Break</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Quick Report Action */}
        <Link href="/student/daily-reports" className="hidden sm:inline-flex">
          <button className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors cursor-pointer">
            + Daily Report
          </button>
        </Link>

        {/* Notifications */}
        <button
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 relative cursor-pointer"
          aria-label="View notifications"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* Student Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
            {studentName.charAt(0)}
          </div>
          <div className="hidden sm:block text-left leading-tight">
            <span className="block text-xs font-bold text-slate-900">{studentName}</span>
            <span className="block text-[10px] text-emerald-600 font-semibold">Active Intern</span>
          </div>
        </div>
      </div>
    </header>
  );
}
