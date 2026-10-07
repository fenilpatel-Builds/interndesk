"use client";

import React, { useState, useEffect } from "react";
import { StudentTopbar } from "@/components/student/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock, Calendar, CheckCircle2 } from "lucide-react";

export default function StudentAttendancePage() {
  const [currentDate] = useState("Oct 5, 2026");
  const [sessionSeconds, setSessionSeconds] = useState(16335); // 04h 32m 15s
  const [sessionState, setSessionState] = useState<"WORKING" | "ON_BREAK" | "COMPLETED">("WORKING");

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (sessionState === "WORKING") {
      timer = setInterval(() => {
        setSessionSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [sessionState]);

  const formatTimerHMS = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${hrs.toString().padStart(2, "0")}h ${mins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <StudentTopbar title="Attendance & Work Sessions" studentName="Fenil Patel" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header & Date Switcher matching Image 2 Screen 5 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Attendance &amp; Work Session
            </h2>
            <p className="text-xs text-slate-500">
              Real-time work shift monitoring and automated break calculation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white shadow-2xs text-xs font-semibold text-slate-700">
              <button className="hover:text-blue-600"><ChevronLeft className="w-3.5 h-3.5" /></button>
              <span>{currentDate}</span>
              <button className="hover:text-blue-600"><ChevronRight className="w-3.5 h-3.5" /></button>
            </div>
            <Button size="sm" variant="outline" className="text-xs font-bold rounded-xl h-8">
              Today
            </Button>
          </div>
        </div>

        {/* Top 2 Cards: Live Timer & Total Productive Hours */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Live Timer Card */}
          <div className="lg:col-span-7">
            <Card className="border-slate-200/90 shadow-xs p-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Working
              </div>

              <div>
                <div className="text-4xl sm:text-5xl font-black text-slate-900 font-mono tracking-tight">
                  {formatTimerHMS(sessionSeconds)}
                </div>
                <p className="text-xs text-slate-400 mt-1 font-medium">Since 09:02 AM</p>
              </div>

              <div className="flex items-center justify-center gap-3 w-full max-w-xs pt-2">
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                  onClick={() => setSessionState("COMPLETED")}
                  disabled={sessionState === "COMPLETED"}
                >
                  Clock Out
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50"
                  onClick={() => setSessionState(sessionState === "WORKING" ? "ON_BREAK" : "WORKING")}
                  disabled={sessionState === "COMPLETED"}
                >
                  {sessionState === "ON_BREAK" ? "Resume Work" : "Take Break"}
                </Button>
              </div>
            </Card>
          </div>

          {/* Total Productive Hours Card */}
          <div className="lg:col-span-5">
            <Card className="border-slate-200/90 shadow-xs p-6 h-full flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-600">Total Productive Hours</h3>
                <div className="text-3xl font-black text-slate-900 mt-2">6h 45m</div>
                <p className="text-xs text-slate-400 mt-0.5">Target: 8h</p>
              </div>

              <div className="space-y-2 pt-6">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>84% Complete</span>
                  <span>1h 15m remaining</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: "84%" }} />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Bottom 2 Cards: Work Session Timeline & Weekly Attendance */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Work Session Timeline */}
          <div className="lg:col-span-7">
            <Card className="border-slate-200/90 shadow-xs p-6">
              <h3 className="text-xs font-bold text-slate-800 mb-4">Work Session Timeline</h3>
              <div className="space-y-3.5 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="font-mono text-slate-500">09:00 AM - 12:30 PM</span>
                  <span className="font-bold text-slate-800">Work</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="font-mono text-slate-500">12:30 PM - 01:15 PM</span>
                  <span className="font-bold text-slate-800">Lunch Break</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="font-mono text-slate-500">01:15 PM - 05:00 PM</span>
                  <span className="font-bold text-slate-800">Work</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Weekly Attendance */}
          <div className="lg:col-span-5">
            <Card className="border-slate-200/90 shadow-xs p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800 mb-4">Weekly Attendance</h3>
                <div className="grid grid-cols-6 gap-2 text-center">
                  {[
                    { day: "Mon", status: "present" },
                    { day: "Tue", status: "present" },
                    { day: "Wed", status: "half" },
                    { day: "Thu", status: "present" },
                    { day: "Fri", status: "present" },
                    { day: "Sat", status: "absent" },
                  ].map((d) => (
                    <div key={d.day} className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-500">{d.day}</span>
                      <div className="flex justify-center">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            d.status === "present"
                              ? "bg-emerald-500"
                              : d.status === "half"
                              ? "bg-amber-500"
                              : "bg-slate-300"
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 text-[11px] font-semibold text-slate-600 pt-6 border-t border-slate-100">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Present
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Half Day
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-300" /> Absent
                </span>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
