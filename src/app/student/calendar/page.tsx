"use client";

import React, { useState } from "react";
import { StudentTopbar } from "@/components/student/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Award,
  Video,
  Flag,
  Coffee,
  Filter,
  Plus,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  title: string;
  category: "TASK" | "ASSESSMENT" | "MEETING" | "MILESTONE" | "HOLIDAY";
  date: string; // YYYY-MM-DD
  time?: string;
  description: string;
  locationOrLink?: string;
}

export default function StudentCalendarPage() {
  const [viewMode, setViewMode] = useState<"MONTH" | "WEEK" | "DAY">("MONTH");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activeDate, setActiveDate] = useState(new Date(2026, 9, 8)); // Oct 8, 2026
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const events: CalendarEvent[] = [
    {
      id: "ev1",
      title: "Daily Standup & Cohort Sync",
      category: "MEETING",
      date: "2026-10-08",
      time: "10:00 AM – 10:30 AM",
      description: "Daily review of assigned tasks, unblocking bottlenecks with mentor.",
      locationOrLink: "Google Meet • meet.google.com/xyz-intern",
    },
    {
      id: "ev2",
      title: "TypeScript & React MCQ Assessment",
      category: "ASSESSMENT",
      date: "2026-10-08",
      time: "02:00 PM – 03:00 PM",
      description: "Mid-cohort evaluation covering Next.js App Router, SSR, and hooks.",
      locationOrLink: "InternDesk Assessment Portal",
    },
    {
      id: "ev3",
      title: "Daily Shift Report Due",
      category: "TASK",
      date: "2026-10-08",
      time: "05:30 PM",
      description: "Submit daily work synopsis and time blocks before punch-out.",
    },
    {
      id: "ev4",
      title: "Database Indexing & PostgreSQL Task Due",
      category: "TASK",
      date: "2026-10-10",
      time: "11:59 PM",
      description: "Submit schema migration scripts and ER diagram for capstone.",
    },
    {
      id: "ev5",
      title: "Cohort Mid-Term Milestone Review",
      category: "MILESTONE",
      date: "2026-10-12",
      time: "04:00 PM",
      description: "Evaluation of 50% internship completion and certificate progress.",
    },
    {
      id: "ev6",
      title: "Diwali Festive Cohort Holiday",
      category: "HOLIDAY",
      date: "2026-10-15",
      description: "Platform off-day. No mandatory clock-in required.",
    },
    {
      id: "ev7",
      title: "Cloud & Docker Deployment Workshop",
      category: "MEETING",
      date: "2026-10-17",
      time: "11:00 AM – 01:00 PM",
      description: "Live mentor session on containerizing Next.js and Postgres.",
      locationOrLink: "Zoom Live Stream",
    },
  ];

  const filteredEvents = events.filter((ev) =>
    selectedCategory === "ALL" ? true : ev.category === selectedCategory
  );

  const getCategoryColor = (cat: CalendarEvent["category"]) => {
    switch (cat) {
      case "MEETING":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "ASSESSMENT":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "TASK":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "MILESTONE":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "HOLIDAY":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getCategoryBadge = (cat: CalendarEvent["category"]) => {
    switch (cat) {
      case "MEETING":
        return <Video className="w-3.5 h-3.5 text-emerald-600" />;
      case "ASSESSMENT":
        return <Award className="w-3.5 h-3.5 text-purple-600" />;
      case "TASK":
        return <Clock className="w-3.5 h-3.5 text-blue-600" />;
      case "MILESTONE":
        return <Flag className="w-3.5 h-3.5 text-amber-600" />;
      case "HOLIDAY":
        return <Coffee className="w-3.5 h-3.5 text-rose-600" />;
    }
  };

  // Calendar generation for Oct 2026 (31 days, starts on Thursday Oct 1)
  const daysInMonth = 31;
  const startDayOffset = 4; // Thursday = index 4 (0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu)
  const calendarCells = [];
  for (let i = 0; i < startDayOffset; i++) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(day);
  }

  const handlePrevMonth = () => {
    setActiveDate(new Date(activeDate.getFullYear(), activeDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setActiveDate(new Date(activeDate.getFullYear(), activeDate.getMonth() + 1, 1));
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      <StudentTopbar title="Internship Calendar & Milestones" studentName="Fenil Patel" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header & Controls (Section 54) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Internship Schedule &amp; Milestones
            </h2>
            <p className="text-xs text-slate-500">
              Track project deadlines, live mentor sessions, MCQ assessments, and cohort holidays.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher: Month, Week, Day */}
            <div className="bg-slate-200/80 p-0.5 rounded-xl flex items-center">
              {(["MONTH", "WEEK", "DAY"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === mode
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {mode === "MONTH" ? "Month" : mode === "WEEK" ? "Week" : "Day"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filter bar & Month Navigator */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-slate-900">
              October 2026
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Cohort Week 2
            </span>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            {["ALL", "TASK", "ASSESSMENT", "MEETING", "MILESTONE", "HOLIDAY"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat === "ALL"
                  ? "All Events"
                  : cat === "TASK"
                  ? "Tasks"
                  : cat === "ASSESSMENT"
                  ? "Exams"
                  : cat === "MEETING"
                  ? "Meetings"
                  : cat === "MILESTONE"
                  ? "Milestones"
                  : "Holidays"}
              </button>
            ))}
          </div>
        </div>

        {/* View Mode: MONTH */}
        {viewMode === "MONTH" && (
          <Card className="border-slate-200 bg-white shadow-xs rounded-2xl overflow-hidden">
            <CardContent className="p-4">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 pb-3 border-b border-slate-100">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* Month Grid */}
              <div className="grid grid-cols-7 gap-2 pt-3">
                {calendarCells.map((day, idx) => {
                  if (day === null) {
                    return (
                      <div
                        key={`empty-${idx}`}
                        className="min-h-[90px] p-2 rounded-xl bg-slate-50/50 border border-transparent"
                      />
                    );
                  }

                  const dateStr = `2026-10-${day.toString().padStart(2, "0")}`;
                  const dayEvents = filteredEvents.filter((e) => e.date === dateStr);
                  const isToday = day === 8;

                  return (
                    <div
                      key={`day-${day}`}
                      className={`min-h-[90px] p-2 rounded-xl border flex flex-col justify-between transition-all ${
                        isToday
                          ? "border-blue-600 bg-blue-50/20 shadow-2xs ring-1 ring-blue-600"
                          : "border-slate-200/80 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold ${
                            isToday
                              ? "w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-black"
                              : "text-slate-800"
                          }`}
                        >
                          {day}
                        </span>
                        {dayEvents.length > 0 && (
                          <span className="text-[9px] font-bold text-slate-400">
                            {dayEvents.length} event{dayEvents.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 mt-1 flex-1 overflow-hidden">
                        {dayEvents.slice(0, 2).map((ev) => (
                          <button
                            key={ev.id}
                            onClick={() => setSelectedEvent(ev)}
                            className={`w-full text-left p-1 rounded text-[10px] font-semibold border truncate block transition-transform hover:scale-[1.02] ${getCategoryColor(
                              ev.category
                            )}`}
                            title={ev.title}
                          >
                            {ev.title}
                          </button>
                        ))}
                        {dayEvents.length > 2 && (
                          <span className="text-[9px] text-slate-400 font-bold block">
                            +{dayEvents.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* View Mode: WEEK */}
        {viewMode === "WEEK" && (
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs font-semibold text-blue-900 flex items-center justify-between">
              <span>Showing Cohort Schedule: Oct 04 – Oct 10, 2026</span>
              <span className="text-[11px] font-bold text-blue-700 bg-white px-2.5 py-0.5 rounded-lg border border-blue-200">
                Current Week
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {[
                { name: "Sun, Oct 04", date: "2026-10-04" },
                { name: "Mon, Oct 05", date: "2026-10-05" },
                { name: "Tue, Oct 06", date: "2026-10-06" },
                { name: "Wed, Oct 07", date: "2026-10-07" },
                { name: "Thu, Oct 08 (Today)", date: "2026-10-08" },
                { name: "Fri, Oct 09", date: "2026-10-09" },
                { name: "Sat, Oct 10", date: "2026-10-10" },
              ].map((day) => {
                const dayEvents = filteredEvents.filter((e) => e.date === day.date);
                const isToday = day.date === "2026-10-08";

                return (
                  <Card
                    key={day.date}
                    className={`border ${
                      isToday
                        ? "border-blue-600 bg-blue-50/30 ring-1 ring-blue-600"
                        : "border-slate-200 bg-white"
                    } shadow-2xs rounded-xl p-3`}
                  >
                    <p className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2 mb-2">
                      {day.name}
                    </p>
                    {dayEvents.length === 0 ? (
                      <p className="text-[10px] text-slate-400 italic py-2">No scheduled items</p>
                    ) : (
                      <div className="space-y-1.5">
                        {dayEvents.map((ev) => (
                          <div
                            key={ev.id}
                            onClick={() => setSelectedEvent(ev)}
                            className={`p-2 rounded-lg border cursor-pointer hover:shadow-xs transition-all ${getCategoryColor(
                              ev.category
                            )}`}
                          >
                            <p className="text-[11px] font-bold line-clamp-1">{ev.title}</p>
                            {ev.time && (
                              <p className="text-[10px] opacity-80 mt-0.5">{ev.time}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* View Mode: DAY */}
        {viewMode === "DAY" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-4">
              <Card className="border-slate-200 bg-white rounded-2xl shadow-xs overflow-hidden">
                <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold">
                      Today&apos;s Timeline — Thursday, Oct 08, 2026
                    </CardTitle>
                    <p className="text-xs text-slate-500">Live work shifts, meetings, and deadlines</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    Shift Active
                  </span>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  {[
                    {
                      time: "09:00 AM",
                      title: "Morning Shift Clock In",
                      desc: "Start timer on Student Dashboard & verify attendance.",
                      done: true,
                    },
                    {
                      time: "10:00 AM",
                      title: "Daily Standup & Cohort Sync",
                      desc: "Team unblocking session with batch mentor via Google Meet.",
                      done: true,
                    },
                    {
                      time: "01:00 PM",
                      title: "Lunch Break Window",
                      desc: "Pause work session timer for lunch break.",
                      done: false,
                    },
                    {
                      time: "02:00 PM",
                      title: "TypeScript & React MCQ Assessment",
                      desc: "60-minute automated evaluation. Passing score: 70%.",
                      done: false,
                    },
                    {
                      time: "05:00 PM",
                      title: "Daily Shift Report Submission",
                      desc: "Document completed milestones and time logs.",
                      done: false,
                    },
                    {
                      time: "05:30 PM",
                      title: "End Shift Clock Out",
                      desc: "Confirm minimum productive duration of 04h 00m.",
                      done: false,
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4 text-xs">
                      <span className="font-mono font-bold text-slate-500 w-20 shrink-0 pt-0.5">
                        {item.time}
                      </span>
                      <div
                        className={`w-3 h-3 rounded-full mt-1 shrink-0 ${
                          item.done ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                      />
                      <div className="flex-1 p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-slate-900">{item.title}</p>
                          {item.done && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                              Completed ✓
                            </span>
                          )}
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-4 space-y-4">
              <Card className="border-slate-200 bg-white rounded-2xl shadow-xs p-5 space-y-3">
                <span className="text-xs font-bold text-slate-900 block">
                  Upcoming Cohort Milestones
                </span>
                <div className="space-y-2.5 text-xs">
                  {events
                    .filter((e) => e.date > "2026-10-08")
                    .map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => setSelectedEvent(ev)}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 cursor-pointer transition-colors space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{ev.title}</span>
                          {getCategoryBadge(ev.category)}
                        </div>
                        <p className="text-[11px] text-slate-500">Date: {formatDate(ev.date)}</p>
                      </div>
                    ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Selected Event Modal */}
        {selectedEvent && (
          <Modal
            isOpen={!!selectedEvent}
            onClose={() => setSelectedEvent(null)}
            title={selectedEvent.title}
            description={`Scheduled for ${formatDate(selectedEvent.date)}`}
            maxWidth="md"
          >
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${getCategoryColor(
                    selectedEvent.category
                  )}`}
                >
                  {selectedEvent.category}
                </span>
                {selectedEvent.time && (
                  <span className="text-slate-500 font-mono font-semibold">
                    {selectedEvent.time}
                  </span>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Event Details
                </span>
                <p className="text-slate-800 leading-relaxed">{selectedEvent.description}</p>
              </div>

              {selectedEvent.locationOrLink && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-medium">
                  <span className="text-[10px] uppercase font-bold text-blue-700 block">
                    Access / Meeting URL
                  </span>
                  <p className="font-mono text-xs mt-0.5">{selectedEvent.locationOrLink}</p>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => setSelectedEvent(null)}>
                  Close
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </main>
    </div>
  );
}
