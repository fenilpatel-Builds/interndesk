"use client";

import React, { useState } from "react";
import Link from "next/link";
import { StudentTopbar } from "@/components/student/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, ArrowRight, CheckCircle2, Code2, Cpu } from "lucide-react";

export default function StudentLearningCenterPage() {
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const categories = [
    { id: "ALL", label: "All" },
    { id: "PYTHON", label: "Python" },
    { id: "WEB", label: "Web Development" },
    { id: "AIML", label: "AI & ML" },
    { id: "DB", label: "Database" },
    { id: "JAVA", label: "Java" },
  ];

  const materials = [
    {
      id: "m1",
      title: "Python Fundamentals",
      category: "PYTHON",
      pages: "24 Pages",
      fileType: "PDF",
      assigned: true,
      icon: <BookOpen className="w-5 h-5 text-blue-600" />,
    },
    {
      id: "m2",
      title: "Web Development",
      category: "WEB",
      pages: "52 Pages",
      fileType: "PDF",
      assigned: true,
      icon: <Code2 className="w-5 h-5 text-indigo-600" />,
    },
    {
      id: "m3",
      title: "AI & ML Basics",
      category: "AIML",
      pages: "38 Pages",
      fileType: "PDF",
      assigned: true,
      icon: <Cpu className="w-5 h-5 text-emerald-600" />,
    },
  ];

  const filtered = selectedCategory === "ALL"
    ? materials
    : materials.filter((m) => m.category === selectedCategory);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <StudentTopbar title="Learning Center" studentName="Fenil Patel" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header matching Image 2 Screen 7 */}
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Learning Center
          </h2>
          <p className="text-xs text-slate-500">
            Access study materials and assessments assigned to you.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                selectedCategory === c.id
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Main 2-Column Content: Study Materials (Left) & Assessments (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Study Materials Grid */}
          <div className="lg:col-span-8 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Study Materials</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {filtered.map((mat) => (
                <Card
                  key={mat.id}
                  className="border-slate-200/90 shadow-xs hover:border-blue-300 transition-all p-5 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                      {mat.icon}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{mat.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{mat.fileType} • {mat.pages}</p>
                    </div>

                    <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      Assigned to You
                    </span>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4">
                    <button className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                      View Material →
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Right: Assessments Widget */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Assessments</h3>
              <Link href="/student/assessments" className="text-xs font-bold text-blue-600 hover:underline">
                View All
              </Link>
            </div>

            <Card className="border-slate-200/90 shadow-xs p-6 space-y-4">
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900">Python Fundamentals</h4>
                <p className="text-xs text-slate-500">30 Questions • 30 Minutes</p>
                <p className="text-xs text-emerald-600 font-semibold pt-1">Passing Score: 60%</p>
              </div>

              <Link href="/student/assessments" className="block pt-2">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs">
                  Start Assessment →
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
