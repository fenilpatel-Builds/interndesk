"use client";

import React, { useState } from "react";
import { StudentTopbar } from "@/components/student/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  HelpCircle,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Clock,
  ShieldCheck,
  FileQuestion,
  LifeBuoy,
} from "lucide-react";

interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  createdAt: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
}

export default function StudentSupportPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketCategory, setTicketCategory] = useState("GENERAL");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketSuccess, setTicketSuccess] = useState(false);

  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: "TICK-8901",
      subject: "Verification of Program Enrollment Payment",
      category: "Enrollment & Payment",
      status: "RESOLVED",
      createdAt: "Oct 7, 2026",
      priority: "HIGH",
    },
    {
      id: "TICK-8902",
      subject: "Certificate ID QR Code Preview",
      category: "Certificates",
      status: "IN_PROGRESS",
      createdAt: "Oct 8, 2026",
      priority: "MEDIUM",
    },
  ]);

  const faqs = [
    {
      q: "Is registration free?",
      a: "Yes. Registration is 100% free with zero signup charges or card inputs. Program enrollment fees apply only after admin verification when you choose and enroll in a specific course.",
    },
    {
      q: "What is Productive Time and how is it calculated?",
      a: "Productive Time represents your net active working hours. It is computed in real time by taking your total elapsed shift duration and subtracting any pauses recorded during breaks (Lunch, Coffee, Water, Personal).",
    },
    {
      q: "How does the Live Work Timer and break system work?",
      a: "Click 'Clock In' when beginning your workday. When you need a break, click 'Take a Break' and select a category. The timer freezes while you rest and automatically resumes when you click 'Resume'. Clock out at the end of your shift to audit your hours.",
    },
    {
      q: "How do I receive and verify my internship certificate?",
      a: "Once you achieve required attendance (80%+), complete assigned tasks, and pass MCQ assessments, admin audits and approves your certificate. The certificate includes a cryptographic verification ID and QR code verifiable by employers at /verify/[id].",
    },
  ];

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;

    const newTicket: SupportTicket = {
      id: `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: ticketSubject,
      category: ticketCategory,
      status: "OPEN",
      createdAt: "Just now",
      priority: "MEDIUM",
    };

    setTickets([newTicket, ...tickets]);
    setTicketSubject("");
    setTicketMessage("");
    setTicketSuccess(true);
    setTimeout(() => setTicketSuccess(false), 5000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      <StudentTopbar title="Help & Support Desk" studentName="Fenil Patel" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <LifeBuoy className="w-5 h-5 text-blue-600" />
              Student Support Desk &amp; Knowledge Base
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Find answers to common questions or submit support tickets directly to administrators.
            </p>
          </div>
        </div>

        {/* 2-Column Split: FAQs on Left, Ticket Creator on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Frequently Asked Questions */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="border border-slate-200/90 shadow-xs p-6 bg-white rounded-2xl space-y-4">
              <div className="flex items-center gap-2">
                <FileQuestion className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Frequently Asked Questions
                </h3>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="border border-slate-200/80 rounded-xl overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                      className="w-full flex items-center justify-between p-3.5 text-left bg-slate-50/70 hover:bg-slate-100/70 text-xs font-bold text-slate-800 transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-500 transition-transform ${
                          activeFaq === idx ? "rotate-180 text-blue-600" : ""
                        }`}
                      />
                    </button>
                    {activeFaq === idx && (
                      <div className="p-3.5 bg-white text-xs text-slate-600 border-t border-slate-200/80 leading-relaxed animate-in fade-in">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Active Tickets Table */}
            <Card className="border border-slate-200/90 shadow-xs p-6 bg-white rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  Your Support Tickets
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">
                  {tickets.length} total tickets
                </span>
              </div>

              <div className="space-y-2.5">
                {tickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{t.id}</span>
                        <span className="font-semibold text-slate-800">{t.subject}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {t.category} • Created {t.createdAt}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        t.status === "RESOLVED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : t.status === "IN_PROGRESS"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column: Ticket Creation Form */}
          <div className="lg:col-span-5">
            <Card className="border border-slate-200/90 shadow-xs p-6 bg-white rounded-2xl space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Open a New Support Ticket
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Can&apos;t find what you need in the FAQs? Submit a ticket and our administrative team will assist you within 24 hours.
              </p>

              {ticketSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Ticket submitted successfully! Ticket ID logged.</span>
                </div>
              )}

              <form onSubmit={handleSubmitTicket} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:border-blue-600"
                  >
                    <option value="GENERAL">General Inquiries</option>
                    <option value="ATTENDANCE">Attendance &amp; Live Timer</option>
                    <option value="LEARNING">Learning Materials &amp; Subjects</option>
                    <option value="ENROLLMENT">Program Enrollment &amp; Payments</option>
                    <option value="CERTIFICATES">Certificates &amp; Verification</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="Brief summary of your query"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-medium focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Detailed Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Describe your issue or request in detail..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-medium focus:outline-none focus:border-blue-600"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs py-5 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Support Ticket
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
