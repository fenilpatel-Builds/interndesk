import React from "react";
import {
  Building2,
  KeyRound,
  Clock,
  FileSpreadsheet,
  BookOpen,
  CheckSquare,
  Award,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function Features() {
  const features = [
    {
      icon: <Building2 className="w-6 h-6 text-blue-600" />,
      title: "Multi-Tenant Workspaces",
      description:
        "Every company, college, or training institute receives a logically isolated workspace with dedicated members, programs, and settings.",
    },
    {
      icon: <KeyRound className="w-6 h-6 text-indigo-600" />,
      title: "Organization Code Discovery",
      description:
        "Secure, system-generated codes (e.g. ORG-7K4P9X) enable fast workspace lookup with verified organization preview before joining.",
    },
    {
      icon: <Clock className="w-6 h-6 text-sky-600" />,
      title: "Attendance & Work Sessions",
      description:
        "Real-time clock-in timer, categorized breaks (lunch, personal, short break), and server-side duration calculations without discrepancies.",
    },
    {
      icon: <FileSpreadsheet className="w-6 h-6 text-emerald-600" />,
      title: "Daily Work Reports",
      description:
        "Log hourly tasks, blockers, and next steps. Complete workflow supporting Draft, Submitted, Under Review, and Approved states.",
    },
    {
      icon: <BookOpen className="w-6 h-6 text-violet-600" />,
      title: "Curated Learning Center",
      description:
        "Organization-specific learning tracks, study guides, code examples, and structured modules with individual completion tracking.",
    },
    {
      icon: <CheckSquare className="w-6 h-6 text-amber-600" />,
      title: "Assessments & MCQ Runner",
      description:
        "Timed examinations with single/multiple choice, server-side grading, pass/fail threshold enforcement, and detailed answer reviews.",
    },
    {
      icon: <Award className="w-6 h-6 text-rose-600" />,
      title: "Verifiable Documents",
      description:
        "Issue Offer Letters, Internship Letters, and Completion Certificates with tamper-proof unique IDs verifiable on public endpoints.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-teal-600" />,
      title: "Enterprise RBAC & Security",
      description:
        "Granular permission matrix across 10 roles: Super Admin, Org Admin, HR, Manager, Mentor, Employee, Intern, Student, and Auditor.",
    },
  ];

  return (
    <section id="features" className="py-20 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-extrabold tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Enterprise Feature Suite
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
            Everything Your Organization Needs to Train, Manage & Grow
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-4 font-normal">
            Designed for multinational corporations, universities, and training academies. A unified portal built for real operational efficiency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <Card
              key={idx}
              className="group border-slate-200/90 shadow-2xs hover:shadow-xl hover:shadow-blue-600/10 hover:border-blue-300 transition-all duration-300 hover:-translate-y-1.5 bg-white rounded-2xl overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="p-6 flex flex-col h-full">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-blue-50/80 group-hover:border-blue-200 transition-all duration-300 shadow-2xs">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mt-auto font-normal">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
