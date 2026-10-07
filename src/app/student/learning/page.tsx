"use client";

import React, { useState } from "react";
import { StudentTopbar } from "@/components/student/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Download, Lock, CheckCircle2, Search } from "lucide-react";

interface MaterialItem {
  id: string;
  title: string;
  description: string;
  category: string;
  fileType: string;
  fileSize: string;
  isCompleted?: boolean;
}

export default function StudentLearningCenterPage() {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const materials: MaterialItem[] = [
    {
      id: "m1",
      title: "Module 1: Next.js App Router Architecture & Server Actions",
      description: "Master modern routing, server components, data fetching caches, and layout streaming.",
      category: "Web Development",
      fileType: "PDF Guide",
      fileSize: "2.4 MB",
      isCompleted: true,
    },
    {
      id: "m2",
      title: "Module 2: Supabase PostgreSQL & Row Level Security Deep Dive",
      description: "Writing zero-trust RLS policies, PostgreSQL triggers, composite indexing, and role definitions.",
      category: "Web Development",
      fileType: "PDF Manual",
      fileSize: "3.8 MB",
      isCompleted: true,
    },
    {
      id: "m3",
      title: "Module 3: Secure Payment Gateways & Cryptographic Webhooks",
      description: "Architecting HMAC-SHA256 signature verification and tamper-proof financial transaction workflows.",
      category: "Web Development",
      fileType: "Reference Guide",
      fileSize: "1.9 MB",
      isCompleted: false,
    },
    {
      id: "m4",
      title: "Module 4: Enterprise State Machines & Production Deployment",
      description: "Testing business logic, zero-downtime deployment pipelines, and session security hardening.",
      category: "Web Development",
      fileType: "Coursebook",
      fileSize: "4.1 MB",
      isCompleted: false,
    },
  ];

  const categories = ["ALL", "Web Development", "Python", "Data Science", "AI / ML", "Java"];

  const filteredMaterials = materials.filter((m) => {
    const matchesCat = selectedCategory === "ALL" || m.category === selectedCategory;
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <StudentTopbar title="Learning Center" studentName="Aarav Sharma" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Curriculum & Study Materials
            </h2>
            <p className="text-xs text-slate-500">
              Assigned enterprise courseware for your internship specialization track.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assigned materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === c
                    ? "bg-blue-600 text-white"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Material Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMaterials.map((mat) => (
            <Card
              key={mat.id}
              className="border-slate-200/90 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {mat.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1.5 leading-snug">
                      {mat.title}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {mat.description}
                </p>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>{mat.fileType} • {mat.fileSize}</span>
                  {mat.isCompleted && (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Completed
                    </span>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs justify-center"
                  onClick={() => alert(`Accessing signed URL for ${mat.title}...`)}
                >
                  <Download className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                  Download Protected Material
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
