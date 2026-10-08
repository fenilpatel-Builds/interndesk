"use client";

import React, { useState } from "react";
import Link from "next/link";
import { StudentTopbar } from "@/components/student/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  FileText,
  Video,
  FileSpreadsheet,
  Link2,
  Presentation,
  ArrowRight,
  CheckCircle2,
  Download,
  ExternalLink,
  Sparkles,
  Layers,
  Search,
} from "lucide-react";

export default function StudentLearningCenterPage() {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Categories conforming strictly to Section 23
  const categories = [
    { id: "ALL", label: "All" },
    { id: "WEB", label: "Web Development" },
    { id: "PYTHON", label: "Python" },
    { id: "AI", label: "AI" },
    { id: "ML", label: "Machine Learning" },
    { id: "DATA", label: "Data Science" },
    { id: "CLOUD", label: "Cloud" },
    { id: "DB", label: "Database" },
    { id: "OTHER", label: "Other" },
  ];

  // Materials with PDF, Video, Documents, Presentations, Links
  const materials = [
    {
      id: "m1",
      title: "Next.js 16 App Router & Server Components",
      category: "WEB",
      format: "PDF",
      size: "4.8 MB • 32 Pages",
      icon: <FileText className="w-5 h-5 text-blue-600" />,
      url: "#",
      description: "Comprehensive guide to React Server Components, server actions, caching, and stream hydration.",
    },
    {
      id: "m2",
      title: "Building High-Throughput APIs with FastAPI",
      category: "PYTHON",
      format: "Video",
      size: "45 Mins • 1080p HD",
      icon: <Video className="w-5 h-5 text-rose-600" />,
      url: "#",
      description: "Hands-on video walkthrough on async route handlers, Pydantic v2 schemas, and dependency injection.",
    },
    {
      id: "m3",
      title: "Generative AI & LLM Embeddings Architecture",
      category: "AI",
      format: "Presentations",
      size: "24 Slides • Keynote",
      icon: <Presentation className="w-5 h-5 text-indigo-600" />,
      url: "#",
      description: "Executive deck explaining vector search, ChromaDB indexing, RAG pipelines, and prompt engineering.",
    },
    {
      id: "m4",
      title: "PostgreSQL Advanced Indexing & Query Tuning",
      category: "DB",
      format: "Documents",
      size: "18 Pages • Markdown",
      icon: <BookOpen className="w-5 h-5 text-emerald-600" />,
      url: "#",
      description: "In-depth reference on B-Tree, GIN, GiST indexes, EXPLAIN ANALYZE execution plan breakdown.",
    },
    {
      id: "m5",
      title: "Docker Multi-Stage Builds & Container Security",
      category: "CLOUD",
      format: "PDF",
      size: "3.2 MB • 20 Pages",
      icon: <FileText className="w-5 h-5 text-cyan-600" />,
      url: "#",
      description: "Best practices for shrinking container sizes, multi-stage compilation, and least-privilege users.",
    },
    {
      id: "m6",
      title: "Data Science Pipelines with Pandas & Polars",
      category: "DATA",
      format: "Links",
      size: "Interactive Repository",
      icon: <Link2 className="w-5 h-5 text-amber-600" />,
      url: "https://github.com",
      description: "Curated Jupyter Notebooks covering dataset cleaning, transformations, and statistical summaries.",
    },
    {
      id: "m7",
      title: "Supervised Learning & Gradient Boosting with XGBoost",
      category: "ML",
      format: "Video",
      size: "52 Mins • Workshop",
      icon: <Video className="w-5 h-5 text-rose-600" />,
      url: "#",
      description: "Feature selection techniques, hyperparameter tuning with Optuna, and ROC-AUC curve evaluation.",
    },
  ];

  const filtered = materials.filter((m) => {
    const matchesCategory = selectedCategory === "ALL" || m.category === selectedCategory;
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      <StudentTopbar title="Learning Center" studentName="Fenil Patel" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1.5 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-200" />
              <span>Program Study Materials</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Curriculum Resource Library
            </h2>
            <p className="text-xs sm:text-sm text-blue-100">
              High-definition study guides, code repositories, video workshops, and architectures allocated to your cohort.
            </p>
          </div>
          <Link href="/student/assessments">
            <Button className="bg-white text-blue-950 hover:bg-blue-50 font-bold rounded-xl shadow-xs text-xs px-5">
              Take MCQ Assessments
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-blue-700" />
            </Button>
          </Link>
        </div>

        {/* Search & Category Filter (Section 23) */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
              />
            </div>
            <span className="text-xs text-slate-500 font-semibold">
              Showing {filtered.length} Allocated Resources
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  selectedCategory === c.id
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((mat) => (
            <Card
              key={mat.id}
              className="border-slate-200/90 shadow-2xs hover:border-blue-300 transition-all duration-200 rounded-2xl bg-white p-5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    {mat.icon}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {mat.format}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{mat.title}</h4>
                  <span className="text-[11px] text-slate-400 font-medium">{mat.size}</span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {mat.description}
                </p>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Allocated to Cohort
                </span>

                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs rounded-lg h-8 px-3 border-slate-200 hover:bg-blue-50 hover:text-blue-600"
                  onClick={() => alert(`Opening ${mat.title} (${mat.format})`)}
                >
                  {mat.format === "Links" ? (
                    <>
                      Open Link <ExternalLink className="w-3 h-3 ml-1" />
                    </>
                  ) : mat.format === "Video" ? (
                    <>
                      Watch Video <Video className="w-3 h-3 ml-1" />
                    </>
                  ) : (
                    <>
                      Download <Download className="w-3 h-3 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
