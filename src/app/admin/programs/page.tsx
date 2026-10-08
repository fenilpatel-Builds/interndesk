"use client";

import React, { useState } from "react";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Search,
} from "lucide-react";
import { INTERNSHIP_PROGRAMS, type InternshipProgram } from "@/lib/programs-data";
import { formatCurrencyINR } from "@/lib/utils";

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<InternshipProgram[]>(INTERNSHIP_PROGRAMS);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<InternshipProgram | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    technology: "",
    duration: "12 Weeks",
    skillLevel: "Intermediate" as "Beginner" | "Intermediate" | "Advanced",
    fee: 4999,
    shortDescription: "",
    description: "",
  });

  const handleOpenCreate = () => {
    setEditingProgram(null);
    setFormData({
      title: "",
      technology: "",
      duration: "12 Weeks",
      skillLevel: "Intermediate",
      fee: 4999,
      shortDescription: "",
      description: "",
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (p: InternshipProgram) => {
    setEditingProgram(p);
    setFormData({
      title: p.title,
      technology: p.technology,
      duration: p.duration,
      skillLevel: p.skillLevel,
      fee: p.fee,
      shortDescription: p.shortDescription,
      description: p.description,
    });
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingProgram) {
      setPrograms((prev) =>
        prev.map((p) =>
          p.id === editingProgram.id
            ? {
                ...p,
                title: formData.title,
                technology: formData.technology,
                duration: formData.duration,
                skillLevel: formData.skillLevel,
                fee: Number(formData.fee),
                shortDescription: formData.shortDescription,
                description: formData.description,
              }
            : p
        )
      );
    } else {
      const newProg: InternshipProgram = {
        id: `prog_${Date.now()}`,
        slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        title: formData.title,
        technology: formData.technology,
        duration: formData.duration,
        skillLevel: formData.skillLevel,
        fee: Number(formData.fee),
        shortDescription: formData.shortDescription,
        description: formData.description,
        certificateIncluded: true,
        totalEnrolled: 0,
        rating: 5.0,
        techStack: formData.technology.split(",").map((s) => s.trim()),
        mentor: { name: "Fenil Patel", role: "Head of Engineering", avatar: "FP" },
        learningOutcomes: ["Full syllabus modules and live internship mentoring."],
        curriculum: [{ week: "Weeks 1–4", title: "Core Modules", topics: ["Introduction & Architecture"] }],
      };
      setPrograms([newProg, ...programs]);
    }
    setModalOpen(false);
  };

  const filtered = programs.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.technology.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      <AdminTopbar title="Program Management" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Internship Programs &amp; Configurable Fees
            </h2>
            <p className="text-xs text-slate-500">
              Configure curriculum tracks, enrollment pricing, and cohort durations.
            </p>
          </div>

          <Button
            onClick={handleOpenCreate}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Create Program
          </Button>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search programs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
            />
          </div>

          <span className="text-xs text-slate-500 font-semibold">
            {filtered.length} Programs Configured
          </span>
        </div>

        {/* Table / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <Card key={p.id} className="border-slate-200 bg-white rounded-2xl shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    {p.skillLevel}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{p.title}</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-extrabold text-emerald-700">
                    {formatCurrencyINR(p.fee)}
                  </span>
                  <span className="text-[10px] text-slate-400 block">{p.duration}</span>
                </div>
              </div>

              <div className="p-5 space-y-3 text-xs text-slate-600">
                <p className="line-clamp-2 leading-relaxed">{p.shortDescription}</p>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px]">
                  <span className="text-slate-400 block">Tech Domain:</span>
                  <span className="font-semibold text-slate-800">{p.technology}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">
                  {p.totalEnrolled} active interns
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEdit(p)}
                  className="text-xs rounded-lg"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1" />
                  Edit Fee &amp; Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProgram ? "Edit Program Details" : "Create New Program"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Program Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Applied Machine Learning"
            required
          />

          <Input
            label="Technology Stack"
            value={formData.technology}
            onChange={(e) => setFormData({ ...formData, technology: e.target.value })}
            placeholder="e.g. Python, PyTorch, Docker"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Configurable Program Fee (INR)
              </label>
              <input
                type="number"
                min={0}
                step={100}
                value={formData.fee}
                onChange={(e) => setFormData({ ...formData, fee: Number(e.target.value) })}
                className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Duration</label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 bg-white"
              >
                <option value="6 Weeks">6 Weeks</option>
                <option value="8 Weeks">8 Weeks</option>
                <option value="10 Weeks">10 Weeks</option>
                <option value="12 Weeks">12 Weeks</option>
                <option value="16 Weeks">16 Weeks</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Short Description</label>
            <textarea
              rows={2}
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Brief summary shown on cards"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
              Save Program
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
