"use client";

import React, { useState } from "react";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Award, Plus, Clock, Users, HelpCircle } from "lucide-react";

export default function AdminAssessmentsPage() {
  const [assessments] = useState([
    {
      id: "as1",
      title: "Module 1 Evaluation: Core Architecture",
      subject: "Modern Fullstack Web Development",
      questionsCount: 15,
      duration: "30 Mins",
      passRate: "60%",
      attemptsCount: 24,
      status: "PUBLISHED",
    },
    {
      id: "as2",
      title: "Module 2 Evaluation: Database & RLS",
      subject: "Modern Fullstack Web Development",
      questionsCount: 20,
      duration: "40 Mins",
      passRate: "70%",
      attemptsCount: 18,
      status: "PUBLISHED",
    },
    {
      id: "as3",
      title: "Module 3 Evaluation: Security & Architecture",
      subject: "Modern Fullstack Web Development",
      questionsCount: 3,
      duration: "5 Mins",
      passRate: "60%",
      attemptsCount: 12,
      status: "PUBLISHED",
    },
  ]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <AdminTopbar title="Assessments & Question Bank" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Assessments & Examination Engine
            </h2>
            <p className="text-xs text-slate-500">
              Build MCQ evaluations, define pass criteria, and review candidate grading reports.
            </p>
          </div>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-1.5" />
            Create Assessment
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {assessments.map((exam) => (
            <Card key={exam.id} className="border-slate-200/90 shadow-xs flex flex-col justify-between">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <StatusBadge status={exam.status} />
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {exam.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{exam.subject}</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600 grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span>{exam.questionsCount} Questions</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{exam.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{exam.attemptsCount} Attempts</span>
                  </div>
                  <div className="font-semibold text-emerald-700">
                    Pass: {exam.passRate}
                  </div>
                </div>

                <Button size="sm" variant="outline" className="w-full text-xs justify-center">
                  Question Bank & Submissions →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
