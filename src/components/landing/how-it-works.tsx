"use client";

import React, { useState } from "react";
import { Building2, UserCheck } from "lucide-react";

export function HowItWorks() {
  const [activeTab, setActiveTab] = useState<"org" | "member">("org");

  const orgSteps = [
    {
      num: "01",
      title: "Select Organization Type",
      desc: "Choose from Corporate MNC, Educational Institution, Training Institute, or Internship Provider.",
      highlight: "Tailored Workspace",
    },
    {
      num: "02",
      title: "Organization Verification",
      desc: "Verify domain, website, or provide credentials for platform Super Admin approval.",
      highlight: "Verified Status",
    },
    {
      num: "03",
      title: "Unique Organization Code",
      desc: "System generates a unique Organization Code (e.g. ORG-7K4P9X) for secure member discovery.",
      highlight: "ORG-XXXXXX",
    },
    {
      num: "04",
      title: "Configure Hierarchy",
      desc: "Set up departments, teams, cohorts, working hours, and assignment workflows.",
      highlight: "Custom Hierarchy",
    },
    {
      num: "05",
      title: "Manage & Monitor",
      desc: "Review daily reports, track live attendance, conduct assessments, and issue verifiable certificates.",
      highlight: "Full Administration",
    },
  ];

  const memberSteps = [
    {
      num: "01",
      title: "Create Account",
      desc: "Sign up with your personal or work email and verify your identity using a secure OTP.",
      highlight: "Zero Signup Fee",
    },
    {
      num: "02",
      title: "Discover Your Workspace",
      desc: "Enter your Organization Code (e.g. ORG-7K4P9X) or accept an administrator invitation.",
      highlight: "Code Verification",
    },
    {
      num: "03",
      title: "Role & Profile Setup",
      desc: "Select member type (Student, Intern, Employee, Trainee) and complete your authorized profile.",
      highlight: "Role Resolution",
    },
    {
      num: "04",
      title: "Clock In & Complete Tasks",
      desc: "Track live work sessions, record lunch/short breaks, submit daily reports, and access LMS.",
      highlight: "Live Work Timer",
    },
    {
      num: "05",
      title: "Earn Official Credentials",
      desc: "Receive tamper-proof Offer Letters and Completion Certificates verifiable on public endpoints.",
      highlight: "Tamper-Proof Credential",
    },
  ];

  const currentSteps = activeTab === "org" ? orgSteps : memberSteps;

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs uppercase font-extrabold tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Unified Workflow Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
            How InternDesk Works
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-3 font-normal">
            Two distinct, friction-free onboarding journeys designed for organizations and workforce members.
          </p>

          {/* Tab Switcher */}
          <div className="mt-8 inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200">
            <button
              onClick={() => setActiveTab("org")}
              className={`px-5 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                activeTab === "org"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Building2 className="w-4 h-4 inline mr-1.5" />
              Journey A: For Organizations
            </button>
            <button
              onClick={() => setActiveTab("member")}
              className={`px-5 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                activeTab === "member"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <UserCheck className="w-4 h-4 inline mr-1.5" />
              Journey B: For Students & Interns
            </button>
          </div>
        </div>

        {/* Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {currentSteps.map((step, idx) => (
            <div
              key={idx}
              className="relative p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-black text-blue-600/40">
                    {step.num}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100/70 text-blue-800">
                    {step.highlight}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-2">
                  {step.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {step.desc}
                </p>
              </div>

              {idx < currentSteps.length - 1 && (
                <div className="hidden md:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs shadow-xs">
                    →
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
