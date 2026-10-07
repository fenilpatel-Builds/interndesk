"use client";

import React, { useState } from "react";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState([
    {
      id: "t1",
      student: "Aarav Sharma",
      title: "Implement Supabase Auth with Row Level Security",
      priority: "HIGH",
      status: "COMPLETED",
      dueAt: "2026-10-05",
    },
    {
      id: "t2",
      student: "Aarav Sharma",
      title: "Real-Time Work Session & Timer Engine",
      priority: "URGENT",
      status: "IN_PROGRESS",
      dueAt: "2026-10-08",
    },
    {
      id: "t3",
      student: "Priya Patel",
      title: "Enterprise Python ETL Pipeline with Pandas",
      priority: "MEDIUM",
      status: "IN_PROGRESS",
      dueAt: "2026-10-09",
    },
  ]);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newStudent, setNewStudent] = useState("Aarav Sharma");
  const [newPriority, setNewPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [newDue, setNewDue] = useState("2026-10-15");

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    setTasks([
      ...tasks,
      {
        id: `t_${Date.now()}`,
        student: newStudent,
        title: newTitle,
        priority: newPriority,
        status: "PENDING",
        dueAt: newDue,
      },
    ]);
    setCreateModalOpen(false);
    setNewTitle("");
    setNewDesc("");
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <AdminTopbar title="Project Task Assignment" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Internship Task & Ticket Management
            </h2>
            <p className="text-xs text-slate-500">
              Assign technical tickets to students and track delivery independently of attendance hours.
            </p>
          </div>
          <Button size="sm" onClick={() => setCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-1.5" />
            Assign New Task
          </Button>
        </div>

        <Card className="border-slate-200/90 shadow-xs">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Task Title</th>
                  <th className="px-4 py-3.5">Assigned Intern</th>
                  <th className="px-4 py-3.5">Priority</th>
                  <th className="px-4 py-3.5">Due Date</th>
                  <th className="px-6 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{task.title}</td>
                    <td className="px-4 py-4 text-blue-700 font-medium">{task.student}</td>
                    <td className="px-4 py-4">
                      <span className="font-bold text-[10px] uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-500">{formatDate(task.dueAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <StatusBadge status={task.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>

      {/* ASSIGN TASK MODAL */}
      {createModalOpen && (
        <Modal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="Assign Project Ticket"
          maxWidth="md"
        >
          <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
            <Input
              label="Task Title"
              placeholder="e.g. Implement webhook signature verification"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700">Detailed Description</label>
              <textarea
                rows={3}
                placeholder="Specific requirements, expected deliverables..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">Assign To</label>
                <select
                  value={newStudent}
                  onChange={(e) => setNewStudent(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs focus:outline-none focus:border-blue-600"
                >
                  <option value="Aarav Sharma">Aarav Sharma (Web Dev)</option>
                  <option value="Priya Patel">Priya Patel (Python)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as "LOW" | "MEDIUM" | "HIGH" | "URGENT")}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs focus:outline-none focus:border-blue-600"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            <Input
              label="Due Date"
              type="date"
              value={newDue}
              onChange={(e) => setNewDue(e.target.value)}
              required
            />

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Button variant="outline" size="sm" type="button" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" type="submit" className="bg-blue-600 hover:bg-blue-700">
                Create & Assign
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
