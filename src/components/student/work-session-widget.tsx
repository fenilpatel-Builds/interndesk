"use client";

import React, { useState } from "react";
import {
  Clock,
  Play,
  Pause,
  Square,
  Coffee,
  CheckCircle2,
  Sparkles,
  Zap,
  TrendingUp,
  RotateCcw,
  Utensils,
  Smile,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useWorkTimer, BreakCategory } from "@/hooks/use-work-timer";

interface WorkSessionWidgetProps {
  compact?: boolean;
  className?: string;
}

export function WorkSessionWidget({ compact = false, className = "" }: WorkSessionWidgetProps) {
  const {
    status,
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
      className={`border border-slate-200/90 shadow-sm rounded-2xl bg-white overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-4 py-2.5 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/80 hover:text-white text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      <div className="p-5 sm:p-6 space-y-6">
        {/* Top Status Header Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 tracking-tight block">
                Current Work Session
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {status === "WORKING"
                  ? `Active Shift • Since ${clockInTime}`
                  : status === "ON_BREAK"
                  ? `Paused for ${breakType.toLowerCase()} break`
                  : status === "COMPLETED"
                  ? "Shift finished today"
                  : "Ready to begin"}
              </span>
            </div>
          </div>

          {/* Live Status Pill */}
          <div className="flex items-center gap-1.5">
            {status === "WORKING" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/90 shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                LIVE WORKING
              </span>
            ) : status === "ON_BREAK" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/90 shadow-2xs">
                <Coffee className="w-3.5 h-3.5 animate-bounce text-amber-600" />
                ON BREAK ({breakFormatted})
              </span>
            ) : status === "COMPLETED" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                COMPLETED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                OFFLINE
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Counter Hero & Radial Progress Gauge */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
          {/* Digital Flip Counter Cards */}
          <div className="flex-1 flex flex-col items-center md:items-start justify-center space-y-2.5 min-w-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Elapsed Productive Time
            </span>

            {/* 3 Digital Monospace Flip Blocks */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* Hours Box */}
              <div className="flex flex-col items-center">
                <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight transition-transform duration-200 hover:scale-105">
                  {hoursStr}
                </div>
                <span className="text-[9px] uppercase font-bold text-slate-400 mt-1">
                  Hours
                </span>
              </div>

              {/* Animated Blinking Colon */}
              <div className="text-2xl sm:text-3xl font-black text-blue-600 pb-3.5 animate-pulse select-none">
                :
              </div>

              {/* Minutes Box */}
              <div className="flex flex-col items-center">
                <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight transition-transform duration-200 hover:scale-105">
                  {minutesStr}
                </div>
                <span className="text-[9px] uppercase font-bold text-slate-400 mt-1">
                  Minutes
                </span>
              </div>

              {/* Animated Blinking Colon */}
              <div className="text-2xl sm:text-3xl font-black text-blue-600 pb-3.5 animate-pulse select-none">
                :
              </div>

              {/* Seconds Box with Glowing Border Accent */}
              <div className="flex flex-col items-center">
                <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 flex items-center justify-center text-2xl sm:text-3xl font-black font-mono tracking-tight transition-transform duration-200 hover:scale-105 ring-4 ring-blue-100">
                  {secondsStr}
                </div>
                <span className="text-[9px] uppercase font-bold text-blue-600 mt-1 font-semibold">
                  Seconds
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 font-medium pt-0.5">
              {remainingFormatted} to hit your 8h target
            </p>
          </div>

          {/* Radial SVG Circular Progress Gauge */}
          <div className="shrink-0 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-200/90 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 90 90">
                {/* Track */}
                <circle
                  cx="45"
                  cy="45"
                  r={radius}
                  className="stroke-slate-200"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Animated Gradient Stroke */}
                <circle
                  cx="45"
                  cy="45"
                  r={radius}
                  stroke="url(#blueGradient)"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />
                <defs>
                  <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Center Metrics */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-slate-900 tracking-tight leading-none">
                  {progressPercent}%
                </span>
                <span className="text-[8px] font-bold text-slate-400 uppercase mt-1 tracking-wider whitespace-nowrap">
                  Of 8h Target
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Hourly Activity Visualizer (Mini-Heatmap) */}
        {!compact && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                Hourly Activity Distribution
              </span>
              <span className="text-[11px] font-semibold text-emerald-600">
                98.4% Efficiency
              </span>
            </div>

            <div className="grid grid-cols-8 gap-2 pt-1">
              {hourlySlots.map((slot) => (
                <div key={slot.hour} className="flex flex-col items-center gap-1">
                  <div className="w-full h-8 bg-slate-100 rounded-md overflow-hidden flex flex-col justify-end p-0.5">
                    <div
                      className={`w-full rounded-sm transition-all duration-500 ${
                        slot.status === "DONE"
                          ? "bg-blue-600"
                          : slot.status === "BREAK"
                          ? "bg-amber-400"
                          : slot.status === "CURRENT"
                          ? "bg-emerald-500 animate-pulse"
                          : "bg-transparent"
                      }`}
                      style={{ height: `${slot.fill}%` }}
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
        <div className="space-y-3 pt-2">
          {status === "IDLE" ? (
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 py-6 transition-all duration-200 hover:scale-[1.01]"
              onClick={() => {
                clockIn();
                showToast("Shift started! Timer is now actively logging your work.");
              }}
            >
              <Play className="w-5 h-5 mr-2 fill-current" />
              Clock In &amp; Start Work Session
            </Button>
          ) : status === "WORKING" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="w-full border-slate-300 hover:border-amber-300 text-slate-700 hover:text-amber-700 font-bold rounded-xl hover:bg-amber-50/50 py-5 transition-all"
                onClick={() => setShowBreakMenu(!showBreakMenu)}
              >
                <Coffee className="w-4 h-4 mr-2 text-amber-600" />
                Take a Break
              </Button>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs py-5 transition-all"
                onClick={() => {
                  clockOut();
                  showToast("Clocked out successfully! Total productive hours saved to database.");
                }}
              >
                <Square className="w-4 h-4 mr-2 fill-current" />
                Clock Out
              </Button>
            </div>
          ) : status === "ON_BREAK" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-500/20 py-5 transition-all"
                onClick={() => {
                  resumeWork();
                  showToast("Resumed working! Active session timer resumed.");
                }}
              >
                <Play className="w-4 h-4 mr-2 fill-current" />
                Resume Work Session
              </Button>

              <Button
                variant="outline"
                className="w-full border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 py-5"
                onClick={() => {
                  clockOut();
                  showToast("Clocked out from break. Today's shift logged.");
                }}
              >
                <Square className="w-4 h-4 mr-2 text-slate-500" />
                End Shift
              </Button>
            </div>
          ) : (
            /* COMPLETED */
            <div className="flex items-center gap-3">
              <div className="flex-1 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Today&apos;s shift successfully completed and audited!</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-500 hover:text-slate-800 text-xs font-bold"
                onClick={() => {
                  resetSession();
                  showToast("Session reset. You can start a new shift anytime.");
                }}
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Reset
              </Button>
            </div>
          )}

          {/* Break Options Drawer / Menu */}
          {showBreakMenu && status === "WORKING" && (
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Coffee className="w-3.5 h-3.5 text-amber-600" />
                  Select Break Category
                </span>
                <button
                  onClick={() => setShowBreakMenu(false)}
                  className="text-amber-700 hover:text-amber-900 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    takeBreak("COFFEE");
                    setShowBreakMenu(false);
                    showToast("Coffee break started. Enjoy your refreshment!");
                  }}
                  className="p-2.5 rounded-lg bg-white border border-amber-200 text-center hover:bg-amber-100/50 transition-colors"
                >
                  <Coffee className="w-4 h-4 mx-auto text-amber-600 mb-1" />
                  <span className="block text-xs font-bold text-amber-900">Coffee</span>
                  <span className="block text-[10px] text-amber-700 font-medium">15 mins</span>
                </button>

                <button
                  onClick={() => {
                    takeBreak("LUNCH");
                    setShowBreakMenu(false);
                    showToast("Lunch break started. Session paused.");
                  }}
                  className="p-2.5 rounded-lg bg-white border border-amber-200 text-center hover:bg-amber-100/50 transition-colors"
                >
                  <Utensils className="w-4 h-4 mx-auto text-amber-600 mb-1" />
                  <span className="block text-xs font-bold text-amber-900">Lunch</span>
                  <span className="block text-[10px] text-amber-700 font-medium">45 mins</span>
                </button>

                <button
                  onClick={() => {
                    takeBreak("PERSONAL");
                    setShowBreakMenu(false);
                    showToast("Short rest pause started.");
                  }}
                  className="p-2.5 rounded-lg bg-white border border-amber-200 text-center hover:bg-amber-100/50 transition-colors"
                >
                  <Smile className="w-4 h-4 mx-auto text-amber-600 mb-1" />
                  <span className="block text-xs font-bold text-amber-900">Stretch</span>
                  <span className="block text-[10px] text-amber-700 font-medium">10 mins</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
