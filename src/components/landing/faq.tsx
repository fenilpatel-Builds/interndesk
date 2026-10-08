"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Is student registration on InternDesk free?",
      a: "Yes! Registration on InternDesk is 100% free with zero signup charges. You can complete your profile, verify your email with a 6-digit OTP, and submit your application for administrator verification completely free of charge. Course enrollment fees apply only after approval when you choose a specific program.",
    },
    {
      q: "When can I access the student dashboard and programs?",
      a: "Students gain access to the student portal once their registration application is reviewed and approved by an administrator. After logging in, you can browse available program tracks, enroll, and activate your live work sessions.",
    },
    {
      q: "How is daily attendance tracked?",
      a: "You clock in when starting your day and clock out when concluding. You can also log granular breaks (e.g., lunch, water, personal). Productive hours are computed strictly on the server using trusted server timestamps.",
    },
    {
      q: "How do I get my Offer Letter and Certificate?",
      a: "Your Offer Letter is made available as soon as your registration is approved. Your final Internship Certificate is unlocked once you fulfill the required attendance threshold, submit daily work reports, and pass your assessments, followed by final admin sign-off.",
    },
    {
      q: "Can I take assessments multiple times?",
      a: "Each assessment has a configured maximum number of attempts and time limit set by the administrator. Retakes are subject to organization policy.",
    },
  ];

  return (
    <section id="faq" className="py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Got Questions?
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-600">
            Everything you need to know about the InternDesk program and portal.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-xl overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-slate-50/80 transition-colors"
                >
                  <span className="text-sm font-semibold text-slate-900">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-slate-500 transition-transform duration-200 shrink-0 ml-4",
                      isOpen && "rotate-180 text-blue-600"
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
