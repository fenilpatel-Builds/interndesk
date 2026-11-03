"use client";

import React, { useState, useEffect, useCallback } from "react";
import { StudentTopbar } from "@/components/student/topbar";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  Kanban,
  List,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  Trash2,
  Users,
  User,
  Sliders,
  Check,
  Percent,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { parseClientSessionCookie } from "@/lib/auth/client-session";

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE";
  dueAt: string;
  technology: string;
  assignedToEmail: string;
  assignedToName: string;
  isGroupTask: boolean;
  groupId?: string;
  groupName?: string;
  groupMembers?: string[];
  progress: number; // 0 to 100%
  completionNotes?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

const FALLBACK_TASKS: TaskItem[] = [
  {
    id: "tsk-akt-01",
    title: "Implement Supabase Auth with Row Level Security",
    description: "Write zero-trust PostgreSQL policies ensuring students can query only their own profile and records.",
    priority: "HIGH",
    status: "COMPLETED",
    dueAt: "2026-11-10",
    technology: "PostgreSQL & RLS",
    assignedToEmail: "huntarmy001@gmail.com",
    assignedToName: "Fenil Patel",
    isGroupTask: false,
    progress: 100,
    completionNotes: "Completed RLS migrations with policy helper functions.",
    createdBy: "Akash Padhiyar (CEO)",
  },
  {
    id: "tsk-akt-02",
    title: "Build Responsive Multi-Step Registration Flow",
    description: "Capture personal, academic, and internship specialization preferences with client & server Zod validation.",
    priority: "HIGH",
    status: "IN_PROGRESS",
    dueAt: "2026-11-15",
    technology: "Next.js & Zod",
    assignedToEmail: "huntarmy001@gmail.com",
    assignedToName: "Fenil Patel",
    isGroupTask: false,
    progress: 75,
    completionNotes: "Created 4-step registration flow with email OTP verification.",
    createdBy: "Akash Padhiyar (CEO)",
  },
  {
    id: "tsk-akt-04",
    title: "Full-Stack Enterprise Practicum Capstone — Group Project",
    description: "Collaborative project to architect a microservices-based activity system with live attendance clocking, encrypted tokens, and public cryptographic credentials.",
    priority: "URGENT",
    status: "IN_PROGRESS",
    dueAt: "2026-11-25",
    technology: "Next.js 16, TypeScript & Postgres",
    assignedToEmail: "huntarmy001@gmail.com",
    assignedToName: "Fenil Patel",
    isGroupTask: true,
    groupName: "Alpha Enterprise Architecture Squad",
    groupMembers: [
      "huntarmy001@gmail.com",
      "fenil.patel@akashtechnolabs.com",
      "student@akashtechnolabs.com",
    ],
    progress: 60,
    completionNotes: "Architecture diagrams drafted and API contracts established.",
    createdBy: "Akash Padhiyar (CEO)",
  },
];

export default function StudentTasksPage() {
  const [viewMode, setViewMode] = useState<"BOARD" | "LIST">("BOARD");
  const [scopeFilter, setScopeFilter] = useState<"ALL" | "PRIVATE" | "GROUP">("ALL");
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("Me (Intern)");
  const [loading, setLoading] = useState(true);

  // Detail & Update Modal State
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [sliderProgress, setSliderProgress] = useState(0);
  const [notes, setNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);

  // Create Task Modal State (Client notes/milestones)
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<TaskItem["priority"]>("MEDIUM");
  const [newStatus, setNewStatus] = useState<TaskItem["status"]>("PENDING");
  const [newDue, setNewDue] = useState("2026-11-20");
  const [newTech, setNewTech] = useState("Full Stack Web");

  const loadTasks = useCallback(async (email?: string) => {
    try {
      const query = email ? `?email=${encodeURIComponent(email)}` : "";
      const res = await fetch(`/api/tasks${query}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.tasks)) {
          setTasks(data.tasks);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Fallback
    }

    // Local storage fallback if offline
    if (typeof window !== "undefined") {
      try {
        const key = email ? `interndesk_student_tasks_${email}` : "interndesk_student_tasks_fallback";
        const stored = localStorage.getItem(key);
        if (stored) {
          setTasks(JSON.parse(stored));
          setLoading(false);
          return;
        }
      } catch {}
    }

    setTasks(FALLBACK_TASKS);
    setLoading(false);
  }, []);

  useEffect(() => {
    const session = parseClientSessionCookie();
    if (session?.email) {
      setUserEmail(session.email);
      if (session.name) setUserName(session.name);
      loadTasks(session.email);
    } else {
      loadTasks();
    }
  }, [loadTasks]);

  // Handle live progress and status updating via PATCH /api/tasks/[id]
  const handleUpdateTaskProgress = async (
    taskId: string,
    newProgress: number,
    forcedStatus?: TaskItem["status"],
    customNotes?: string
  ) => {
    setIsUpdatingProgress(true);
    const targetStatus =
      forcedStatus ||
      (newProgress >= 100
        ? "COMPLETED"
        : newProgress > 0
        ? "IN_PROGRESS"
        : "PENDING");

    // Optimistically update state
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              progress: newProgress,
              status: targetStatus,
              completionNotes: customNotes !== undefined ? customNotes : t.completionNotes,
            }
          : t
      )
    );

    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask((prev) =>
        prev
          ? {
              ...prev,
              progress: newProgress,
              status: targetStatus,
              completionNotes: customNotes !== undefined ? customNotes : prev.completionNotes,
            }
          : null
      );
    }

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          progress: newProgress,
          status: targetStatus,
          completionNotes: customNotes !== undefined ? customNotes : notes,
        }),
      });
    } catch (err) {
      console.error("Failed to update task progress on server:", err);
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  const handleOpenDetailModal = (task: TaskItem) => {
    setSelectedTask(task);
    setSliderProgress(task.progress || 0);
    setNotes(task.completionNotes || "");
  };

  // Local helper to create a student personal milestone/ticket
  const handleCreatePersonalTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: TaskItem = {
      id: `task-local-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim() || "Internship deliverable note.",
      priority: newPriority,
      status: newStatus,
      dueAt: newDue,
      technology: newTech,
      assignedToEmail: userEmail || "intern@akashtechnolabs.com",
      assignedToName: userName || "Me (Intern)",
      isGroupTask: false,
      progress: newStatus === "COMPLETED" ? 100 : newStatus === "IN_PROGRESS" ? 50 : 0,
      createdBy: `${userName} (Self-Assigned)`,
    };

    const updated = [newTask, ...tasks];
    setTasks(updated);
    if (typeof window !== "undefined") {
      try {
        const key = userEmail ? `interndesk_student_tasks_${userEmail}` : "interndesk_student_tasks_fallback";
        localStorage.setItem(key, JSON.stringify(updated));
      } catch {}
    }

    setIsNewTaskOpen(false);
    setNewTitle("");
    setNewDesc("");
    setNewStatus("PENDING");
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.technology.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.groupName && t.groupName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPriority = priorityFilter === "ALL" || t.priority === priorityFilter;

    const matchesScope =
      scopeFilter === "ALL" ||
      (scopeFilter === "PRIVATE" && !t.isGroupTask) ||
      (scopeFilter === "GROUP" && t.isGroupTask);

    return matchesSearch && matchesPriority && matchesScope;
  });

  const privateTasksCount = tasks.filter((t) => !t.isGroupTask).length;
  const groupTasksCount = tasks.filter((t) => t.isGroupTask).length;

  const columns: { id: TaskItem["status"]; title: string; color: string }[] = [
    { id: "PENDING", title: "Pending", color: "bg-slate-100 text-slate-700" },
    { id: "IN_PROGRESS", title: "In Progress", color: "bg-blue-50 text-blue-700" },
    { id: "COMPLETED", title: "Completed", color: "bg-emerald-50 text-emerald-700" },
    { id: "OVERDUE", title: "Overdue", color: "bg-red-50 text-red-700" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      <StudentTopbar title="Task Management" studentName={userName} />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header with Switcher and New Task Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Internship Task Board
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold font-mono">
                {tasks.length} Assigned ({filteredTasks.length} Visible)
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Assigned individual milestones and group project deliverables by Akash Technolabs supervisors.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              onClick={() => setIsNewTaskOpen(true)}
              className="bg-[#E52329] hover:bg-[#C41C22] text-white font-bold rounded-xl shadow-md shadow-red-500/20 flex items-center gap-1.5 transition-transform hover:scale-[1.02] cursor-pointer text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Personal Note / Milestone</span>
            </Button>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <button
                onClick={() => setViewMode("BOARD")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "BOARD"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Kanban className="w-3.5 h-3.5 text-[#E52329]" />
                <span>Kanban</span>
              </button>
              <button
                onClick={() => setViewMode("LIST")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "LIST"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <List className="w-3.5 h-3.5 text-[#0B192C]" />
                <span>List</span>
              </button>
            </div>
          </div>
        </div>

        {/* Scope Filter Tabs: All, Private Tasks (Me Only), Group Projects */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 flex-wrap">
          <button
            onClick={() => setScopeFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              scopeFilter === "ALL"
                ? "bg-white text-slate-900 shadow-2xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>All Tasks</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
              {tasks.length}
            </span>
          </button>

          <button
            onClick={() => setScopeFilter("PRIVATE")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              scopeFilter === "PRIVATE"
                ? "bg-white text-emerald-700 shadow-2xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <User className="w-3.5 h-3.5 text-emerald-600" />
            <span>My Private Tasks</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 font-bold">
              {privateTasksCount}
            </span>
          </button>

          <button
            onClick={() => setScopeFilter("GROUP")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              scopeFilter === "GROUP"
                ? "bg-white text-blue-700 shadow-2xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>Group Projects</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 font-bold">
              {groupTasksCount}
            </span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tasks, technology, group..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        {/* KANBAN BOARD VIEW */}
        {viewMode === "BOARD" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {columns.map((col) => {
              const colTasks = filteredTasks.filter((t) => t.status === col.id);
              return (
                <div
                  key={col.id}
                  className="bg-slate-100/70 p-3.5 rounded-2xl border border-slate-200/80 space-y-3"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        {col.title}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 shadow-2xs font-mono">
                        {colTasks.length}
                      </span>
                    </div>
                  </div>

                  {/* Column Body */}
                  <div className="space-y-3">
                    {colTasks.map((task) => (
                      <Card
                        key={task.id}
                        onClick={() => handleOpenDetailModal(task)}
                        className="border-slate-200/90 shadow-2xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer rounded-xl bg-white p-4 space-y-3"
                      >
                        {/* Scope Indicator Badge: Private vs Group */}
                        <div className="flex items-center justify-between gap-1.5">
                          {task.isGroupTask ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/80">
                              <Users className="w-3 h-3 text-blue-600" />
                              <span>Group: {task.groupName || "Team Alpha"}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                              <User className="w-3 h-3 text-emerald-600" />
                              <span>Private Task (Me Only)</span>
                            </span>
                          )}

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
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-slate-900 leading-snug">
                            {task.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                            {task.description}
                          </p>
                        </div>

                        {/* Interactive Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                            <span className="flex items-center gap-1">
                              <span>Progress</span>
                              <span className="text-[9px] font-mono font-bold text-slate-600">
                                ({task.progress}%)
                              </span>
                            </span>
                            <span>Due: {formatDate(task.dueAt)}</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
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

                        {/* Quick Progress Snapper (25%, 50%, 75%, 100%) */}
                        <div
                          className="flex items-center gap-1 pt-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {[25, 50, 75, 100].map((pct) => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => handleUpdateTaskProgress(task.id, pct)}
                              className={`flex-1 py-0.5 rounded text-[9px] font-bold font-mono transition-colors cursor-pointer border ${
                                task.progress >= pct
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                              }`}
                              title={`Set progress to ${pct}%`}
                            >
                              {pct}%
                            </button>
                          ))}
                        </div>

                        {/* Card Footer: Tech Stack & Creator */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                          <span className="px-1.5 py-0.5 rounded bg-slate-50 text-slate-600 font-semibold truncate max-w-[140px]">
                            {task.technology}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {task.createdBy ? task.createdBy.split(" ")[0] : "Supervisor"}
                          </span>
                        </div>
                      </Card>
                    ))}

                    {/* Column Empty Dropzone */}
                    {colTasks.length === 0 && (
                      <div className="p-6 text-center border-2 border-dashed border-slate-200/90 rounded-xl bg-white/50 space-y-2">
                        <p className="text-xs font-semibold text-slate-400">
                          No {col.title.toLowerCase()} tasks
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* LIST VIEW */}
        {viewMode === "LIST" &&
          (filteredTasks.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-200/90 p-12 text-center max-w-lg mx-auto shadow-2xs space-y-4 my-8">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">No tasks in this view</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                  Tasks assigned by your coordinator will appear here once allocated.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTasks.map((task) => (
                <Card
                  key={task.id}
                  className="border-slate-200/90 shadow-2xs hover:border-blue-300 transition-all rounded-2xl bg-white p-5 flex flex-col justify-between cursor-pointer space-y-3"
                  onClick={() => handleOpenDetailModal(task)}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {task.isGroupTask ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            <Users className="w-3 h-3 text-blue-600" />
                            <span>Group: {task.groupName || "Team"}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <User className="w-3 h-3 text-emerald-600" />
                            <span>Private Task</span>
                          </span>
                        )}
                        <StatusBadge status={task.status} />
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-500">
                        {task.progress}% Done
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                        {task.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1">
                        {task.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                        {task.technology}
                      </span>
                      <span>Due: {formatDate(task.dueAt)}</span>
                    </div>
                  </div>

                  {/* Progress Slider Bar */}
                  <div className="space-y-1 pt-2 border-t border-slate-100">
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
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
                </Card>
              ))}
            </div>
          ))}
      </main>

      {/* DETAIL & INTERACTIVE PROGRESS MODAL */}
      {selectedTask && (
        <Modal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          title={selectedTask.title}
          description={`Assigned to: ${selectedTask.assignedToName} • Due: ${formatDate(selectedTask.dueAt)}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            {/* Task Scope Banner */}
            {selectedTask.isGroupTask ? (
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200/90 text-blue-900 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Group Project: {selectedTask.groupName || "Team Alpha"}</span>
                </div>
                <p className="text-[11px] text-blue-700">
                  Shared collaborative project. Progress updates are synced live across all group members.
                </p>
                {Array.isArray(selectedTask.groupMembers) && selectedTask.groupMembers.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {selectedTask.groupMembers.map((m) => (
                      <span
                        key={m}
                        className="px-2 py-0.5 rounded bg-white text-blue-800 font-mono text-[10px] border border-blue-200"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/90 text-emerald-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>Individual Private Task (Strictly Visible to You &amp; Admin)</span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  This task is strictly assigned to {selectedTask.assignedToName} ({selectedTask.assignedToEmail}). Other interns cannot see or access this task.
                </p>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed">
              {selectedTask.description}
            </div>

            {/* Interactive Progress Slider */}
            <div className="space-y-2 p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-blue-600" />
                  <span>Update Work Completion Percentage</span>
                </label>
                <span className="text-sm font-black font-mono text-blue-600">
                  {sliderProgress}%
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={sliderProgress}
                onChange={(e) => setSliderProgress(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />

              <div className="flex items-center justify-between gap-1 pt-1">
                {[0, 25, 50, 75, 100].map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setSliderProgress(step)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-colors cursor-pointer border ${
                      sliderProgress === step
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {step}%
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700">
                Completion Notes / Solution Link
              </label>
              <textarea
                rows={3}
                placeholder="Add pull request link, deployment URL, or sprint notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  onClick={() =>
                    handleUpdateTaskProgress(
                      selectedTask.id,
                      sliderProgress,
                      sliderProgress >= 100 ? "COMPLETED" : "IN_PROGRESS",
                      notes
                    )
                  }
                  disabled={isUpdatingProgress}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  {isUpdatingProgress ? "Syncing..." : "Save Progress & Status"}
                </Button>
                {selectedTask.status !== "COMPLETED" && (
                  <Button
                    size="sm"
                    onClick={() => handleUpdateTaskProgress(selectedTask.id, 100, "COMPLETED", notes)}
                    disabled={isUpdatingProgress}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Mark 100% Done
                  </Button>
                )}
              </div>

              <Button variant="outline" size="sm" onClick={() => setSelectedTask(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* CREATE PERSONAL NOTE / MILESTONE MODAL */}
      <Modal
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
        title="Create Personal Note / Milestone"
        description="Add a work task or deliverable note to your personal board."
        maxWidth="md"
      >
        <form onSubmit={handleCreatePersonalTask} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Build GraphQL API endpoint for analytics"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Description &amp; Acceptance Criteria
            </label>
            <textarea
              rows={3}
              placeholder="Describe deliverables, requirements, test criteria..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as TaskItem["status"])}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:outline-none focus:border-blue-600 bg-white"
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as TaskItem["priority"])}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:outline-none focus:border-blue-600 bg-white"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                value={newDue}
                onChange={(e) => setNewDue(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsNewTaskOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-[#E52329] hover:bg-[#C41C22] text-white font-bold rounded-xl shadow-md shadow-red-500/20 cursor-pointer"
            >
              Add to Board
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
