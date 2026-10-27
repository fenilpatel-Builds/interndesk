"use client";
import React, { useState } from "react";
import {
  Clock,
  Play,
  Square,
  Coffee,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  RotateCcw,
  Utensils,
  Smile,
  Droplets,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useWorkTimer } from "@/hooks/use-work-timer";

interface WorkSessionWidgetProps {
  compact?: boolean;
  className?: string;
}

export function WorkSessionWidget({ compact = false, className = "" }: WorkSessionWidgetProps) {
  const {
    status,
    todayDateFormatted,
    live24hClock,
    hoursStr,
    minutesStr,
    secondsStr,
    breakFormatted,
    clockInTime,
    progressPercent,
    remainingFormatted,
    breakType,
    clockIn,
    takeBreak,
    resumeWork,
    clockOut,
    resetSession,
  } = useWorkTimer();

  const [showBreakMenu, setShowBreakMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // SVG Radial Ring Metrics
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // Hourly bars for visual productivity graph
  const hourlySlots = [
    { hour: "9A", status: "DONE", fill: 100 },
    { hour: "10A", status: "DONE", fill: 100 },
    { hour: "11A", status: "DONE", fill: 100 },
    { hour: "12P", status: "BREAK", fill: 50 },
    { hour: "1P", status: "DONE", fill: 100 },
    { hour: "2P", status: "CURRENT", fill: progressPercent > 60 ? 80 : 40 },
    { hour: "3P", status: "PENDING", fill: 0 },
    { hour: "4P", status: "PENDING", fill: 0 },
  ];

  return (
    <Card
      className={`relative overflow-hidden border border-slate-200/90 shadow-xs bg-white rounded-2xl transition-all ${className}`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Decorative top accent gradient */}
      <div
        className={`h-1.5 w-full transition-colors duration-500 ${
          status === "WORKING"
            ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600"
            : status === "ON_BREAK"
            ? "bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500"
            : status === "COMPLETED"
            ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500"
            : "bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200"
        }`}
      />

      <div className="p-6 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                Akash Technolabs Shift Tracker
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-500">{todayDateFormatted}</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight mt-0.5 flex items-center gap-2">
              Daily Attendance Session
              {status === "WORKING" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100/80 text-emerald-800 border border-emerald-300/60 shadow-2xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  ACTIVE SHIFT
                </span>
              )}
              {status === "ON_BREAK" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300/60 shadow-2xs">
                  <Coffee className="w-3 h-3 text-amber-600 animate-pulse" />
                  ON BREAK ({breakType})
                </span>
              )}
              {status === "COMPLETED" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300/60 shadow-2xs">
                  <CheckCircle2 className="w-3 h-3 text-blue-600" />
                  SHIFT FINISHED
                </span>
              )}
              {status === "IDLE" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  NOT STARTED
                </span>
              )}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>24H: {live24hClock}</span>
            </div>
            {clockInTime && (
              <div className="px-3 py-1 rounded-xl bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-800">
                Punched In: <span className="font-mono font-bold">{clockInTime}</span>
              </div>
            )}
          </div>
        </div>

        {/* Central Radial Progress & Digital Ticker */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-slate-50/70 p-6 rounded-2xl border border-slate-200/80">
          {/* Radial Ring */}
          <div className="md:col-span-4 flex flex-col items-center justify-center">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring Track */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="#e2e8f0"
                  strokeWidth="8"
                />
                {/* Active Animated Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke={
                    status === "WORKING"
                      ? "#10b981"
                      : status === "ON_BREAK"
                      ? "#f59e0b"
                      : status === "COMPLETED"
                      ? "#2563eb"
                      : "#94a3b8"
                  }
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-slate-900 tracking-tight leading-none">
                  {progressPercent}%
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                  8H GOAL
                </span>
              </div>
            </div>
          </div>

          {/* Large Digital Clock Ticker & Shift Meta */}
          <div className="md:col-span-8 space-y-3 text-center md:text-left">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                Productive Work Time Logged
              </span>
              <div className="flex items-baseline justify-center md:justify-start gap-1.5 font-mono font-black text-4xl sm:text-5xl text-slate-900 tracking-tight mt-0.5">
                <span className="bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
                  {hoursStr}
                </span>
                <span className="text-slate-400 animate-pulse">:</span>
                <span className="bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
                  {minutesStr}
                </span>
                <span className="text-slate-400 animate-pulse">:</span>
                <span className="bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs text-blue-600">
                  {secondsStr}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1 text-xs text-slate-600 font-medium">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                <span>{remainingFormatted}</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1.5">
                <Coffee className="w-3.5 h-3.5 text-amber-600" />
                <span>Total Breaks: <strong className="font-mono">{breakFormatted}</strong></span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">1-Click Instant Punch</span>
              </span>
            </div>
          </div>
        </div>

        {/* Hourly Productivity Progress Bar */}
        {!compact && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Shift Timeline Overview
              </span>
              <span className="font-mono text-slate-500 font-semibold">
                Daily Requirement: 8 Hours
              </span>
            </div>

            <div className="grid grid-cols-8 gap-1.5">
              {hourlySlots.map((slot, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        slot.status === "DONE"
                          ? "bg-emerald-500"
                          : slot.status === "BREAK"
                          ? "bg-amber-400"
                          : slot.status === "CURRENT"
                          ? "bg-blue-600 animate-pulse"
                          : "bg-transparent"
                      }`}
                      style={{ width: `${slot.fill}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {slot.hour}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Action Buttons */}
        <div className="space-y-3 pt-1">
          {status === "IDLE" ? (
            <div className="space-y-2">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/25 py-6 transition-all duration-200 hover:scale-[1.01] cursor-pointer"
                onClick={() => {
                  clockIn();
                  showToast("Work session started! Live timer is actively recording your hours.");
                }}
              >
                <Play className="w-5 h-5 mr-2 fill-current" />
                Clock In &amp; Start Work Session
              </Button>
              <p className="text-center text-[11px] text-slate-400 font-medium">
                Click above to start your shift. Real-time timer logs productive hours with verified digital timestamps.
              </p>
            </div>
          ) : status === "WORKING" ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="w-full border-amber-300 hover:border-amber-400 text-amber-900 bg-amber-50/60 hover:bg-amber-100/70 font-bold rounded-xl py-5 transition-all cursor-pointer"
                  onClick={() => setShowBreakMenu(!showBreakMenu)}
                >
                  <Coffee className="w-4 h-4 mr-2 text-amber-600" />
                  Take a Break {showBreakMenu ? "▲" : "▼"}
                </Button>

                <Button
                  className="w-full bg-[#E52329] hover:bg-[#C41C22] text-white font-bold rounded-xl shadow-xs py-5 transition-all cursor-pointer"
                  onClick={() => {
                    clockOut();
                    showToast("Clocked out successfully! Total productive hours saved to database.");
                  }}
                >
                  <Square className="w-4 h-4 mr-2 fill-current" />
                  Clock Out (End Shift)
                </Button>
              </div>

              {/* Break Options Drawer / Menu */}
              {showBreakMenu && (
                <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <Coffee className="w-3.5 h-3.5 text-amber-600" />
                      Select Break Type
                    </span>
                    <button
                      onClick={() => setShowBreakMenu(false)}
                      className="text-amber-700 hover:text-amber-900 text-xs font-bold cursor-pointer"
                    >
                      ✕ Close
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-amber-300 bg-white hover:bg-amber-100 text-amber-950 font-bold text-xs rounded-lg cursor-pointer"
                      onClick={() => {
                        takeBreak("LUNCH");
                        setShowBreakMenu(false);
                        showToast("On Lunch Break. Shift timer paused.");
                      }}
                    >
                      <Utensils className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                      Lunch
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="border-amber-300 bg-white hover:bg-amber-100 text-amber-950 font-bold text-xs rounded-lg cursor-pointer"
                      onClick={() => {
                        takeBreak("COFFEE");
                        setShowBreakMenu(false);
                        showToast("On Coffee/Tea Break. Shift timer paused.");
                      }}
                    >
                      <Coffee className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                      Coffee / Tea
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="border-amber-300 bg-white hover:bg-amber-100 text-amber-950 font-bold text-xs rounded-lg cursor-pointer"
                      onClick={() => {
                        takeBreak("WATER");
                        setShowBreakMenu(false);
                        showToast("On Hydration/Water Break. Shift timer paused.");
                      }}
                    >
                      <Droplets className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                      Water
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="border-amber-300 bg-white hover:bg-amber-100 text-amber-950 font-bold text-xs rounded-lg cursor-pointer"
                      onClick={() => {
                        takeBreak("PERSONAL");
                        setShowBreakMenu(false);
                        showToast("On Personal Break. Shift timer paused.");
                      }}
                    >
                      <Smile className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                      Personal
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : status === "ON_BREAK" ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-amber-600 animate-bounce" />
                  <span>
                    Currently on <strong>{breakType}</strong> break ({breakFormatted}). Timer is paused.
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  PAUSED
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  size="lg"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-500/20 py-5 transition-all cursor-pointer"
                  onClick={() => {
                    resumeWork();
                    showToast("Work session resumed! Timer is active again.");
                  }}
                >
                  <Play className="w-4 h-4 mr-2 fill-current" />
                  Resume Work Session
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-slate-300 hover:border-red-300 text-slate-700 hover:text-red-700 font-bold rounded-xl hover:bg-red-50/50 py-5 transition-all cursor-pointer"
                  onClick={() => {
                    clockOut();
                    showToast("Clocked out from break. Today's shift logged.");
                  }}
                >
                  <Square className="w-4 h-4 mr-2 text-slate-500" />
                  End Shift &amp; Clock Out
                </Button>
              </div>
            </div>
          ) : (
            /* COMPLETED */
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Today&apos;s shift successfully completed and logged!</span>
                </div>
                <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-md">
                  {hoursStr}h {minutesStr}m logged
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 py-5 transition-all cursor-pointer"
                  onClick={() => {
                    clockIn();
                    showToast("New shift started! Timer is now actively logging.");
                  }}
                >
                  <Play className="w-4 h-4 mr-2 fill-current" />
                  Start New Work Shift
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-slate-300 hover:border-slate-400 text-slate-700 font-bold rounded-xl py-5 transition-all cursor-pointer"
                  onClick={() => {
                    resetSession();
                    showToast("Session reset to initial 00:00:00 state.");
                  }}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset to 00:00:00
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
