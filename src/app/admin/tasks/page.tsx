"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  Plus,
  Users,
  User,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Filter,
  Layers,
  Calendar,
  AlertTriangle,
  Loader2,
  Trash2,
} from "lucide-react";
import { TaskItem } from "@/lib/tasks/task-store";

interface StudentOption {
  id: string;
  name: string;
  email: string;
  technology: string;
}

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [activeTab, setActiveTab] = useState<"ALL" | "INDIVIDUAL" | "GROUP">("ALL");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Create Task Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskItem["priority"]>("MEDIUM");
  const [dueAt, setDueAt] = useState("2026-11-25");
  const [technology, setTechnology] = useState("AI & Full Stack");
  const [assignmentType, setAssignmentType] = useState<"INDIVIDUAL" | "GROUP">("INDIVIDUAL");

  // Individual selection
  const [selectedStudentEmail, setSelectedStudentEmail] = useState("");

  // Group selection
  const [groupName, setGroupName] = useState("Akash Capstone Project Group");
  const [selectedGroupEmails, setSelectedGroupEmails] = useState<string[]>([]);

  const fetchTasksAndStudents = async () => {
    setLoading(true);
    try {
      const [tasksRes, studentsRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/admin/students"),
      ]);

      if (tasksRes.ok) {
        const tData = await tasksRes.json();
        if (tData.success && Array.isArray(tData.tasks)) {
          setTasks(tData.tasks);
        }
      }

      if (studentsRes.ok) {
        const sData = await studentsRes.json();
        if (Array.isArray(sData.students)) {
          setStudents(sData.students);
          if (sData.students.length > 0) {
            setSelectedStudentEmail(sData.students[0].email);
            setSelectedGroupEmails(sData.students.slice(0, 2).map((s: any) => s.email));
          }
        }
      }
    } catch (err) {
      console.error("Failed to load tasks and students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksAndStudents();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError("Task Title is required.");
      return;
    }

    const assignedStudent = students.find((s) => s.email === selectedStudentEmail);
    const assignedName = assignedStudent?.name || selectedStudentEmail.split("@")[0] || "Student Intern";

    if (assignmentType === "GROUP" && selectedGroupEmails.length === 0) {
      setFormError("Please select at least one student for the group project.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          priority,
          dueAt,
          technology,
          assignedToEmail: assignmentType === "GROUP" ? selectedGroupEmails[0] : selectedStudentEmail,
          assignedToName: assignmentType === "GROUP" ? `${groupName} (Team Lead: ${assignedName})` : assignedName,
          isGroupTask: assignmentType === "GROUP",
          groupName: assignmentType === "GROUP" ? groupName : undefined,
          groupMembers: assignmentType === "GROUP" ? selectedGroupEmails : undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.task) {
          setTasks([data.task, ...tasks]);
          setCreateModalOpen(false);
          setTitle("");
          setDescription("");
        }
      } else {
        const errData = await res.json();
        setFormError(errData.error || "Failed to create task");
      }
    } catch {
      setFormError("Network error while creating task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleGroupMember = (email: string) => {
    if (selectedGroupEmails.includes(email)) {
      setSelectedGroupEmails(selectedGroupEmails.filter((e) => e !== email));
    } else {
      setSelectedGroupEmails([...selectedGroupEmails, email]);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (activeTab === "INDIVIDUAL" && t.isGroupTask) return false;
      if (activeTab === "GROUP" && !t.isGroupTask) return false;

      if (statusFilter !== "ALL" && t.status !== statusFilter) return false;

      if (search) {
        const q = search.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.assignedToName.toLowerCase().includes(q) ||
          t.assignedToEmail.toLowerCase().includes(q) ||
          (t.groupName && t.groupName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [tasks, activeTab, statusFilter, search]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50">
      <AdminTopbar title="Project Task Assignment & Group Tracker" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3 text-[#E52329]" />
              <span>Private &amp; Group Delegation</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Internship Task &amp; Group Project Management
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Assign targeted technical tasks to individual students or collaborative groups with private visibility and live completion progress.
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            className="bg-[#E52329] hover:bg-[#C41C22] text-white font-bold rounded-xl text-xs px-4 py-2 cursor-pointer shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Assign New Task</span>
          </Button>
        </div>

        {/* Tab Switcher & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            {[
              { id: "ALL", label: `All Tasks (${tasks.length})` },
              { id: "INDIVIDUAL", label: `Individual (${tasks.filter((t) => !t.isGroupTask).length})` },
              { id: "GROUP", label: `Group Projects (${tasks.filter((t) => t.isGroupTask).length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-white text-blue-700 shadow-2xs border border-slate-200 font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tasks, students or groups..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {/* Tasks Table */}
        <Card className="border-slate-200/90 shadow-xs bg-white rounded-2xl overflow-hidden">
          <CardContent className="p-0 overflow-x-auto">
            {loading ? (
              <div className="p-12 flex items-center justify-center gap-2 text-slate-500 text-xs">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span>Loading task records...</span>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                No tasks found matching the selected filter.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Task Details</th>
                    <th className="px-4 py-3.5">Assignment &amp; Scoping</th>
                    <th className="px-4 py-3.5">Completion Progress</th>
                    <th className="px-4 py-3.5">Priority</th>
                    <th className="px-4 py-3.5">Due Date</th>
                    <th className="px-6 py-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTasks.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900 text-sm">{t.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 max-w-sm">
                          {t.description}
                        </p>
                        <span className="inline-block mt-1 text-[10px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {t.technology}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        {t.isGroupTask ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              <Users className="w-3 h-3 text-purple-600" />
                              <span>Group Project: {t.groupName}</span>
                            </span>
                            <p className="text-[10px] text-slate-400 pl-1">
                              {t.groupMembers?.length || 2} Collaborators enrolled
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <User className="w-3 h-3 text-blue-600" />
                              <span>Private: {t.assignedToName}</span>
                            </span>
                            <p className="text-[10px] text-slate-400 pl-1">{t.assignedToEmail}</p>
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4 min-w-[150px]">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-slate-700">{t.progress}% Complete</span>
                            <span className={t.progress === 100 ? "text-emerald-600" : "text-blue-600"}>
                              {t.progress === 100 ? "Finished ✓" : "In Flight"}
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                t.progress === 100 ? "bg-emerald-500" : "bg-blue-600"
                              }`}
                              style={{ width: `${t.progress}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            t.priority === "URGENT"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : t.priority === "HIGH"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>

                      <td className="px-4 py-4 font-mono text-[11px] font-semibold text-slate-700">
                        {t.dueAt}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            t.status === "COMPLETED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : t.status === "IN_PROGRESS"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {t.status === "COMPLETED" ? "Completed" : t.status === "IN_PROGRESS" ? "In Progress" : "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Modal: Assign New Task */}
        {createModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[#E52329]" />
                  <span>Assign New Task or Group Project</span>
                </h3>
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreateTask} className="space-y-4">
                {/* Assignment Type Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Assignment Mode *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAssignmentType("INDIVIDUAL")}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        assignmentType === "INDIVIDUAL"
                          ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <User className="w-4 h-4 text-blue-600 mb-1" />
                      <p className="text-xs font-bold text-slate-900">Individual Student</p>
                      <p className="text-[10px] text-slate-500">Private to selected person only</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAssignmentType("GROUP")}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        assignmentType === "GROUP"
                          ? "border-purple-600 bg-purple-50/60 ring-2 ring-purple-500/20"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <Users className="w-4 h-4 text-purple-600 mb-1" />
                      <p className="text-xs font-bold text-slate-900">Group Project / Team</p>
                      <p className="text-[10px] text-slate-500">Shared among group collaborators</p>
                    </button>
                  </div>
                </div>

                {/* Individual Student Dropdown */}
                {assignmentType === "INDIVIDUAL" ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Assign to Student / Employee *
                    </label>
                    <select
                      value={selectedStudentEmail}
                      onChange={(e) => setSelectedStudentEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      {students.map((s) => (
                        <option key={s.id} value={s.email}>
                          {s.name} ({s.email}) — {s.technology}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400 mt-1">
                      🔒 Only this student will see this task in their personal dashboard.
                    </p>
                  </div>
                ) : (
                  /* Group Selection */
                  <div className="space-y-3 p-3 rounded-2xl bg-purple-50/50 border border-purple-200">
                    <div>
                      <label className="block text-xs font-bold text-purple-900 mb-1">
                        Group Project / Team Name *
                      </label>
                      <input
                        type="text"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="e.g. AI & Full-Stack Capstone Team"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-purple-300 bg-white focus:ring-2 focus:ring-purple-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-purple-900 mb-1">
                        Select Group Collaborators ({selectedGroupEmails.length} Selected)
                      </label>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 bg-white rounded-xl border border-purple-200">
                        {students.map((s) => (
                          <label
                            key={s.id}
                            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-purple-50/60 cursor-pointer text-xs"
                          >
                            <input
                              type="checkbox"
                              checked={selectedGroupEmails.includes(s.email)}
                              onChange={() => toggleGroupMember(s.email)}
                              className="w-3.5 h-3.5 text-purple-600 rounded cursor-pointer"
                            />
                            <span className="font-bold text-slate-800">{s.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({s.email})</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Task Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Implement Supabase Auth with Row Level Security"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description &amp; Requirements</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide specific technical instructions and acceptance criteria..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium"
                  />
                </div>

                {/* Due Date & Priority */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Due Date *</label>
                    <input
                      type="date"
                      required
                      value={dueAt}
                      onChange={(e) => setDueAt(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium cursor-pointer"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateModalOpen(false)}
                    className="text-xs px-4 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#E52329] hover:bg-[#C41C22] text-white font-bold text-xs px-5 rounded-xl cursor-pointer"
                  >
                    {isSubmitting ? "Assigning..." : "Assign Task →"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
