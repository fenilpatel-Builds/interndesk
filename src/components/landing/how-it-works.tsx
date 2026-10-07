import React from "react";
import { CheckCircle2 } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Register & Pay Fee",
      desc: "Complete your personal and academic profile, choose your internship technology, and pay the ₹1,000 fee securely via Razorpay.",
      badge: "Step 1",
    },
    {
      step: "02",
      title: "Admin Review & Approval",
      desc: "Administrators verify your eligibility and application details. You receive your active portal access and official Offer Letter.",
      badge: "Step 2",
    },
    {
      step: "03",
      title: "Daily Work & Attendance",
      desc: "Clock in daily, track live productive hours, record breaks, and submit itemized daily work reports with mentor feedback.",
      badge: "Step 3",
    },
    {
      step: "04",
      title: "Learn, Tasks & Assessments",
      desc: "Access specialized study materials, finish assigned project tickets, and take timed MCQ assessments with instant scoring.",
      badge: "Step 4",
    },
    {
      step: "05",
      title: "Graduate & Get Certified",
      desc: "Complete your required attendance and assessments to unlock your official, verifiable Internship Certificate.",
      badge: "Step 5",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            The Student Lifecycle
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How InternDesk Works
          </h2>
          <p className="text-base text-slate-600">
            A seamless, guided path from day one of registration to certified completion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
          {steps.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black text-blue-600/30">
                    {item.step}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-blue-600">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                <span>Trackable Stage</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
