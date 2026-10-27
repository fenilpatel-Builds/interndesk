"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Bell,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { parseClientSessionCookie } from "@/lib/auth/client-session";

interface StudentTopbarProps {
  title?: string;
  studentName?: string;
}

export function StudentTopbar({ title = "Dashboard", studentName }: StudentTopbarProps) {
  const [resolvedName, setResolvedName] = useState(
    studentName && studentName !== "Fenil Patel" ? studentName : "Priya Sharma"
  );
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const session = parseClientSessionCookie();
    if (session?.name) {
      setResolvedName(session.name);
    } else if (studentName) {
      setResolvedName(studentName);
    }

    const updateDateTime = () => {
      const now = new Date();
      setCurrentDate(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      );
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      );
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, [studentName]);

  const initials = resolvedName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "PS";

  return (
    <header className="h-18 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between shrink-0 select-none">
      {/* Left Search Bar matching Image 1 Top-Right */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search activities, students, or anything..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Right Controls: Date, Time, Notification Bell, User Avatar */}
      <div className="flex items-center gap-4">
        {/* Date Capsule */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span>{currentDate || "Tue, Oct 27, 2026"}</span>
        </div>

        {/* Live Time Capsule */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-700">
          <Clock className="w-3.5 h-3.5 text-[#E52329]" />
          <span>{currentTime || "11:20 AM"}</span>
        </div>

        {/* Notification Bell */}
        <Link
          href="/student/notifications"
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E52329]" />
        </Link>

        {/* User Avatar & Name */}
        <Link
          href="/student/settings"
          className="flex items-center gap-2.5 pl-2 border-l border-slate-200 hover:opacity-85 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0F4C81] to-blue-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
            {initials}
          </div>
          <div className="hidden lg:flex flex-col text-left leading-tight">
            <span className="text-xs font-bold text-slate-900">{resolvedName}</span>
            <span className="text-[10px] text-slate-400 font-semibold">Student</span>
          </div>
        </Link>
      </div>
    </header>
  );
}
