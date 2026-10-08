"use client";

import React, { useState } from "react";
import { StudentTopbar } from "@/components/student/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  CheckSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  User,
  Cpu,
  Layers,
  Kanban,
  List,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface TaskItem {
  id: string;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE";
  dueAt: string;
  assignedTo: string;
  technology: string;
  progress: number;
  completionNotes?: string;
}

export default function StudentTasksPage() {
  const [viewMode, setViewMode] = useState<"BOARD" | "LIST">("BOARD");

  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: "t1",
      title: "Implement Supabase Auth with Row Level Security",
      description: "Write zero-trust PostgreSQL policies ensuring students can query only their own profile and records.",
      priority: "HIGH",
      status: "COMPLETED",
      dueAt: "2026-10-05",
      assignedTo: "Fenil Patel",
      technology: "PostgreSQL & RLS",
      progress: 100,
      completionNotes: "Completed RLS migrations with policy helper functions.",
    },
    {
      id: "t2",
      title: "Build Responsive Multi-Step Registration Flow",
      description: "Capture personal, academic, and internship specialization preferences with client & server Zod validation.",
      priority: "HIGH",
      status: "COMPLETED",
      dueAt: "2026-10-06",
      assignedTo: "Fenil Patel",
      technology: "Next.js & Zod",
      progress: 100,
      completionNotes: "Created 4-step free registration flow with email OTP verification.",
    },
    {
      id: "t3",
      title: "Real-Time Work Session & Timer Engine",
      description: "Connect attendance timers, break switchers, and server-side duration computation.",
      priority: "URGENT",
      status: "IN_PROGRESS",
      dueAt: "2026-10-10",
      assignedTo: "Fenil Patel",
      technology: "TypeScript & Web Audio",
      progress: 75,
    },
    {
      id: "t4",
      title: "Take Module 3 JavaScript & React Assessment",
      description: "Complete the 30-minute timed MCQ test on state management, hooks, and async rendering.",
      priority: "MEDIUM",
      status: "PENDING",
      dueAt: "2026-10-12",
      assignedTo: "Fenil Patel",
      technology: "React & Next.js",
      progress: 0,
    },
    {
      id: "t5",
      title: "Submit Daily Work Log for Capstone Milestone",
      description: "Itemize work blocks, time distribution, and push commits to GitHub.",
      priority: "LOW",
      status: "OVERDUE",
      dueAt: "2026-10-04",
      assignedTo: "Fenil Patel",
      technology: "Git & Documentation",
      progress: 40,
    },
  ]);

  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [notes, setNotes] = useState("");

  const handleUpdateStatus = (taskId: string, newStatus: TaskItem["status"]) => {
    setTasks(
      tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: newStatus,
              progress: newStatus === "COMPLETED" ? 100 : newStatus === "IN_PROGRESS" ? 60 : 0,
              completionNotes: notes || t.completionNotes,
            }
          : t
      )
    );
    setSelectedTask(null);
  };

  const columns: { id: TaskItem["status"]; title: string; color: string }[] = [
    { id: "PENDING", title: "Pending", color: "bg-slate-100 text-slate-700" },
    { id: "IN_PROGRESS", title: "In Progress", color: "bg-blue-50 text-blue-700" },
    { id: "COMPLETED", title: "Completed", color: "bg-emerald-50 text-emerald-700" },
    { id: "OVERDUE", title: "Overdue", color: "bg-red-50 text-red-700" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      <StudentTopbar title="Task Management" studentName="Fenil Patel" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header with Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Internship Task Board
            </h2>
            <p className="text-xs text-slate-500">
              Manage your project deliverables, sprint tickets, and track individual completion progress.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode("BOARD")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "BOARD"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban Board</span>
            </button>
            <button
              onClick={() => setViewMode("LIST")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "LIST"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
          </div>
        </div>

        {/* KANBAN BOARD VIEW (Section 22) */}
        {viewMode === "BOARD" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {columns.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.id);
              return (
                <div
                  key={col.id}
                  className="bg-slate-100/70 p-3.5 rounded-2xl border border-slate-200/80 space-y-3"
                >
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      {col.title}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 shadow-2xs">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {colTasks.map((task) => (
                      <Card
                        key={task.id}
                        onClick={() => {
                          setSelectedTask(task);
                          setNotes(task.completionNotes || "");
                        }}
                        className="border-slate-200/90 shadow-2xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer rounded-xl bg-white p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                              task.priority === "URGENT"
                                ? "bg-red-50 text-red-700"
                                : task.priority === "HIGH"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {task.priority}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {formatDate(task.dueAt)}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-slate-900 leading-snug">
                            {task.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                            {task.description}
                          </p>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                            <span>Progress</span>
                            <span>{task.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                task.status === "COMPLETED"
                                  ? "bg-emerald-500"
                                  : task.status === "OVERDUE"
                                  ? "bg-red-500"
                                  : "bg-blue-600"
                              }`}
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Card Footer: Assigned & Tech */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                          <span className="px-1.5 py-0.5 rounded bg-slate-50 text-slate-600">
                            {task.technology}
                          </span>
                          <span>{task.assignedTo}</span>
                        </div>
                      </Card>
                    ))}

                    {colTasks.length === 0 && (
                      <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                        No tasks in {col.title}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* LIST VIEW */}
        {viewMode === "LIST" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task) => (
              <Card
                key={task.id}
                className="border-slate-200/90 shadow-2xs hover:border-blue-300 transition-all rounded-2xl bg-white p-5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                      {task.title}
                    </h3>
                    <StatusBadge status={task.status} />
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {task.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                      {task.technology}
                    </span>
                    <span>Due: {formatDate(task.dueAt)}</span>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">
                    Progress: {task.progress}%
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs rounded-xl"
                    onClick={() => {
                      setSelectedTask(task);
                      setNotes(task.completionNotes || "");
                    }}
                  >
                    Update Status
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* DETAIL / UPDATE MODAL */}
      {selectedTask && (
        <Modal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          title={selectedTask.title}
          description={`Assigned to: ${selectedTask.assignedTo} • Due: ${formatDate(selectedTask.dueAt)}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed">
              {selectedTask.description}
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700">
                Completion Notes / Solution Link
              </label>
              <textarea
                rows={3}
                placeholder="Add pull request link, deployment URL, or notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpdateStatus(selectedTask.id, "IN_PROGRESS")}
                  disabled={selectedTask.status === "IN_PROGRESS"}
                >
                  Mark In Progress
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleUpdateStatus(selectedTask.id, "COMPLETED")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={selectedTask.status === "COMPLETED"}
                >
                  Mark Completed
                </Button>
              </div>

              <Button variant="outline" size="sm" onClick={() => setSelectedTask(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
