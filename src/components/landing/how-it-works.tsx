"use client";

import React from "react";
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  BookOpen,
  CreditCard,
  Clock,
  Award,
  FileText,
} from "lucide-react";

export function HowItWorks() {
  // Master Prompt Section 10: 10-step connected journey
  const steps = [
    {
      num: "01",
      title: "Register Free",
      desc: "Complete your basic profile without any registration charges. 100% free signup.",
      highlight: "Free Signup",
    },
    {
      num: "02",
      title: "Verify Email",
      desc: "Verify your email address instantly using a secure 6-digit numeric OTP code.",
      highlight: "Email OTP",
    },
    {
      num: "03",
      title: "Get Approved",
      desc: "Administrators review your student background and approve your portal access.",
      highlight: "Admin Verified",
    },
    {
      num: "04",
      title: "Choose Program",
      desc: "Browse industry cohorts in Fullstack, Python & AI, DevOps, Data Science, and more.",
      highlight: "Marketplace",
    },
    {
      num: "05",
      title: "Enroll",
      desc: "Request enrollment in your chosen cohort with duration and technology specialization.",
      highlight: "Cohort Lock",
    },
    {
      num: "06",
      title: "Pay Program Fee",
      desc: "Pay the admin-configured program fee via 256-bit secure Razorpay gateway.",
      highlight: "Program Fee",
    },
    {
      num: "07",
      title: "Learn & Work",
      desc: "Clock in daily, track live sessions, take breaks, and submit daily work logs.",
      highlight: "Live Work Timer",
    },
    {
      num: "08",
      title: "Complete Assessments",
      desc: "Solve weekly timed MCQ assessments and capstone coding milestones.",
      highlight: "MCQ Engine",
    },
    {
      num: "09",
      title: "Complete Internship",
      desc: "Satisfy attendance criteria, project benchmarks, and mentor sign-offs.",
      highlight: "Completion",
    },
    {
      num: "10",
      title: "Receive Documents",
      desc: "Download your official cryptographically verified Certificate & Completion Letters.",
      highlight: "Verified PDF",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-slate-50 border-b border-slate-200/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>End-to-End Progression</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How InternDesk Works
          </h2>
          <p className="text-base text-slate-600">
            A clear, 10-stage journey connecting free student onboarding to certified industry completion.
          </p>
        </div>

        {/* 10-Step Connected Grid (Section 10) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 relative">
          {steps.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs relative flex flex-col justify-between hover:shadow-md hover:border-blue-300 transition-all duration-300 group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-black text-blue-600/25 group-hover:text-blue-600/60 transition-colors">
                    {item.num}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                    {item.highlight}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  {item.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                <span>Stage {idx + 1} of 10</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </div>
            </div>
          ))}
        </div>

        {/* Timeline Summary Banner */}
        <div className="mt-12 p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                100% Free Registration Guarantee
              </h4>
              <p className="text-xs text-slate-500">
                Zero fees at signup. Program fees apply only when you choose and enroll in a specific course cohort.
              </p>
            </div>
          </div>
          <a
            href="/register"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs shrink-0"
          >
            <span>Register Free Now</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
