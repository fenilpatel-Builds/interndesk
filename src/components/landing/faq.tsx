"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Are there any registration or course fees on InternDesk?",
      a: "No! InternDesk operates with strictly zero registration fees, zero course fees, and zero payment systems. Organizations host their internal programs, and learners or employees participate without any payment gateways or checkout pages.",
    },
    {
      q: "Can a user belong to multiple organizations simultaneously?",
      a: "Yes. For example, a student can belong to their university workspace and concurrently be an intern in a corporate partner's workspace. The built-in Organization Switcher allows seamless switching while maintaining strict data and permission isolation.",
    },
    {
      q: "What is an Organization Code?",
      a: "An Organization Code (e.g. ORG-7K4P9X) is a unique, system-generated identifier assigned to every verified workspace. Authorized members enter this code to discover their workspace and request joining under their assigned role.",
    },
    {
      q: "How does organization verification work?",
      a: "To ensure enterprise security, every new workspace undergoes identity verification via official corporate email domains, website verification, or manual Platform Super Admin review before full administrative privileges are unlocked.",
    },
    {
      q: "How are certificates and documents verified by third parties?",
      a: "Documents generated on InternDesk (such as Internship Offer Letters and Completion Certificates) include a tamper-proof document number and unique verification code. Third parties can verify their validity instantly on our public verification endpoint without logging in.",
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
          <p className="text-sm text-slate-600 font-normal">
            Everything you need to know about InternDesk multi-tenancy, workspaces, and zero-fee access.
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
                      "w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-4",
                      isOpen && "rotate-180 text-blue-600"
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 bg-slate-50/50 font-normal">
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
