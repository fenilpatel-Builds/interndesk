"use client";

import React, { useState } from "react";
import { StudentTopbar } from "@/components/student/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { CheckSquare, Clock, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface TaskItem {
  id: string;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE";
  dueAt: string;
  completionNotes?: string;
}

export default function StudentTasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: "t1",
      title: "Implement Supabase Auth with Row Level Security",
      description: "Write zero-trust PostgreSQL policies ensuring students can query only their own profile and records.",
      priority: "HIGH",
      status: "COMPLETED",
      dueAt: "2026-10-05",
      completionNotes: "Completed RLS migrations with policy helper functions.",
    },
    {
      id: "t2",
      title: "Build Responsive Multi-Step Registration Flow",
      description: "Capture personal, academic, and internship specialization preferences with client & server Zod validation.",
      priority: "HIGH",
      status: "COMPLETED",
      dueAt: "2026-10-06",
      completionNotes: "Created 6-step flow with ₹1,000 fee integration.",
    },
    {
      id: "t3",
      title: "Real-Time Work Session & Timer Engine",
      description: "Connect attendance timers, break switchers, and server-side duration computation.",
      priority: "URGENT",
      status: "IN_PROGRESS",
      dueAt: "2026-10-08",
    },
    {
      id: "t4",
      title: "Take Module 3 JavaScript & React Assessment",
      description: "Complete the 30-minute timed MCQ test on state management, hooks, and async rendering.",
      priority: "MEDIUM",
      status: "PENDING",
      dueAt: "2026-10-10",
    },
  ]);

  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [notes, setNotes] = useState("");

  const handleUpdateStatus = (taskId: string, newStatus: TaskItem["status"]) => {
    setTasks(
      tasks.map((t) =>
        t.id === taskId
          ? { ...t, status: newStatus, completionNotes: notes || t.completionNotes }
          : t
      )
    );
    setSelectedTask(null);
  };

  const pendingCount = tasks.filter((t) => t.status === "PENDING").length;
  const inProgressCount = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <StudentTopbar title="Assigned Tasks" studentName="Aarav Sharma" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Internship Project Tickets
            </h2>
            <p className="text-xs text-slate-500">
              Assigned project tasks decoupled from attendance shifts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
              {pendingCount} Pending
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
              {inProgressCount} In Progress
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
              {completedCount} Completed
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => (
            <Card
              key={task.id}
              className="border-slate-200/90 shadow-2xs hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    {task.title}
                  </h3>
                  <StatusBadge status={task.status} />
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {task.description}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Due: {formatDate(task.dueAt)}</span>
                  </div>
                  <span
                    className={`font-bold text-[10px] uppercase px-2 py-0.5 rounded ${
                      task.priority === "URGENT"
                        ? "bg-red-50 text-red-700"
                        : task.priority === "HIGH"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {task.priority} Priority
                  </span>
                </div>

                <div className="pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs justify-center"
                    onClick={() => {
                      setSelectedTask(task);
                      setNotes(task.completionNotes || "");
                    }}
                  >
                    View Details & Update Status
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* TASK DETAIL / UPDATE MODAL */}
      {selectedTask && (
        <Modal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          title={selectedTask.title}
          description={`Due: ${formatDate(selectedTask.dueAt)}`}
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
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              {selectedTask.status !== "IN_PROGRESS" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpdateStatus(selectedTask.id, "IN_PROGRESS")}
                >
                  Start Task (In Progress)
                </Button>
              )}
              {selectedTask.status !== "COMPLETED" && (
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => handleUpdateStatus(selectedTask.id, "COMPLETED")}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Mark as Completed
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
