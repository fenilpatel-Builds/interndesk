import React from "react";
import {
  UserCheck,
  ShieldCheck,
  Clock,
  FileSpreadsheet,
  BookOpen,
  CheckSquare,
  Award,
  CreditCard,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function Features() {
  const features = [
    {
      icon: <UserCheck className="w-6 h-6 text-blue-600" />,
      title: "Easy Registration",
      description:
        "Guided multi-step onboarding capturing personal, academic, and technology preferences with instant application tracking.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-indigo-600" />,
      title: "Admin Verification",
      description:
        "Rigorous verification system ensuring only eligible, payment-verified candidates receive approved access to the portal.",
    },
    {
      icon: <Clock className="w-6 h-6 text-sky-600" />,
      title: "Attendance & Work Tracking",
      description:
        "Live productive session timers, granular break logging (lunch, water, personal), and server-computed durations.",
    },
    {
      icon: <FileSpreadsheet className="w-6 h-6 text-emerald-600" />,
      title: "Daily Work Reports",
      description:
        "Log hourly tasks and achievements. Transparent review statuses (Draft, Submitted, Reviewed, Needs Revision) with mentor remarks.",
    },
    {
      icon: <BookOpen className="w-6 h-6 text-violet-600" />,
      title: "Learning Center",
      description:
        "Curated domain roadmaps (Python, Java, Web, AI/ML, Data Science) with secure, protected study materials.",
    },
    {
      icon: <CheckSquare className="w-6 h-6 text-amber-600" />,
      title: "Online Assessments",
      description:
        "Timed MCQ examinations with anti-tamper server-side scoring, instant pass/fail evaluation, and detailed analytics.",
    },
    {
      icon: <Award className="w-6 h-6 text-rose-600" />,
      title: "Certificates & Letters",
      description:
        "Official Offer Letters, Internship Letters, and verified completion Certificates generated directly to PDF upon admin sign-off.",
    },
    {
      icon: <CreditCard className="w-6 h-6 text-teal-600" />,
      title: "Program Enrollment & Payments",
      description:
        "Free student registration with secure program fee enrollment via Razorpay, cryptographic signature validation, and instant tax invoices.",
    },
  ];

  return (
    <section id="features" className="py-20 bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            End-To-End Infrastructure
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Everything You Need for a Certified Internship
          </h2>
          <p className="text-base text-slate-600">
            Engineered as a complete SaaS ecosystem for modern tech organizations, mentors, and aspiring student engineers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, index) => (
            <Card
              key={index}
              className="card-elevation-hover border-slate-200/80 hover:border-blue-300 transition-all rounded-xl"
            >
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
