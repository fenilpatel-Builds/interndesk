import React from "react";
import {
  GraduationCap,
  Clock,
  FileSpreadsheet,
  BookOpen,
  CheckSquare,
  Award,
  ShieldCheck,
  Bell,
  Code2,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function Features() {
  const features = [
    {
      icon: <GraduationCap className="w-6 h-6 text-[#E52329]" />,
      title: "Academic Activity Management",
      description:
        "Publish, track, and grade institute coursework, capstone projects, and coding assignments targeted by academic department and semester.",
    },
    {
      icon: <Clock className="w-6 h-6 text-[#0F4C81]" />,
      title: "1-Click Shift Attendance",
      description:
        "Friction-free clock-in and clock-out with real-time timers, break categories (Lunch, Tea, Personal), and verified digital timestamp logs.",
    },
    {
      icon: <CheckSquare className="w-6 h-6 text-emerald-600" />,
      title: "Project Submissions & Reviews",
      description:
        "Submit work with GitHub repository links, live demos, and documentation. Faculty can evaluate, score, and provide feedback.",
    },
    {
      icon: <FileSpreadsheet className="w-6 h-6 text-amber-600" />,
      title: "Daily Work & Progress Reports",
      description:
        "Structured logging of daily tasks, challenges, and milestones with Draft, Submitted, Under Review, and Approved states.",
    },
    {
      icon: <Code2 className="w-6 h-6 text-purple-600" />,
      title: "Industry Learning Modules",
      description:
        "Curated practical training in Python, AI/ML, Full-Stack Next.js, and Cloud DevOps designed for real-world software engineering.",
    },
    {
      icon: <Award className="w-6 h-6 text-rose-600" />,
      title: "Tamper-Proof Certifications",
      description:
        "Automatic generation of verifiable Offer Letters and Certificates of Completion with unique verification IDs and public ledger checks.",
    },
    {
      icon: <Bell className="w-6 h-6 text-sky-600" />,
      title: "Transactional Email Alerts",
      description:
        "Instant transactional notifications via Resend API for assignment publishing, evaluation results, approval statuses, and OTPs.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-teal-600" />,
      title: "Centralized Role-Based Governance",
      description:
        "Secure institute-level RBAC (Super Admin, Faculty, Student) protecting data integrity across departments and cohorts.",
    },
  ];

  return (
    <section id="features" className="py-20 bg-slate-50/60 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs uppercase font-extrabold tracking-wider text-[#0F4C81] bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200">
            Akash Technolabs Core Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
            Built for Academic &amp; Industry Excellence
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-3 font-normal">
            Everything students and faculty need to manage learning, assignments, attendance, evaluations, and certifications in one unified platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => (
            <Card
              key={idx}
              className="border-slate-200 bg-white hover:shadow-lg hover:border-slate-300 transition-all duration-200 rounded-2xl"
            >
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                    {feat.icon}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {feat.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
