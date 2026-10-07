"use client";

import React, { useState } from "react";
import { StudentTopbar } from "@/components/student/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, FileText, Download, CheckCircle2, ShieldCheck, GraduationCap } from "lucide-react";

export default function StudentDocumentsPage() {
  const [activeTab, setActiveTab] = useState<"ALL" | "OFFER" | "INTERN" | "CERT">("ALL");

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <StudentTopbar title="Documents" studentName="Fenil Patel" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header matching Image 2 Screen 8 */}
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Documents
          </h2>
          <p className="text-xs text-slate-500">
            Access your internship documents and certificates.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          {[
            { id: "ALL", label: "All Documents" },
            { id: "OFFER", label: "Offer Letter" },
            { id: "INTERN", label: "Internship Letter" },
            { id: "CERT", label: "Certificate" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "ALL" | "OFFER" | "INTERN" | "CERT")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-50 text-blue-600 font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 2-Column Layout: Documents List (Left) & Certificate Preview (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Documents List */}
          <div className="lg:col-span-6 space-y-3">
            {/* Offer Letter */}
            <Card className="border-slate-200/90 shadow-xs p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Offer Letter</h4>
                  <p className="text-[11px] text-slate-500">Generated on Oct 1, 2026</p>
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3 h-3" /> Approved
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="text-xs h-8 px-3">
                  Preview
                </Button>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-3">
                  <Download className="w-3 h-3 mr-1" /> Download PDF
                </Button>
              </div>
            </Card>

            {/* Internship Letter */}
            <Card className="border-slate-200/90 shadow-xs p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Internship Letter</h4>
                  <p className="text-[11px] text-slate-500">Generated on Oct 3, 2026</p>
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3 h-3" /> Approved
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="text-xs h-8 px-3">
                  Preview
                </Button>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-3">
                  <Download className="w-3 h-3 mr-1" /> Download PDF
                </Button>
              </div>
            </Card>

            {/* Internship Certificate (Pending) */}
            <Card className="border-slate-200/90 shadow-xs p-4 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Internship Certificate</h4>
                  <p className="text-[11px] text-slate-500">Will be available after admin approval</p>
                  <span className="inline-block mt-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Pending
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="text-xs h-8 px-3">
                  Preview
                </Button>
                <Button size="sm" disabled className="text-xs h-8 px-3 opacity-60">
                  Download PDF
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Column: Certificate Preview Card */}
          <div className="lg:col-span-6 space-y-3">
            <h3 className="text-xs font-bold text-slate-700">Certificate Preview</h3>

            <Card className="border-2 border-slate-200 shadow-md p-8 text-center bg-white relative overflow-hidden">
              {/* Decorative border */}
              <div className="border border-blue-900/30 p-6 rounded-xl space-y-4 relative">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-black text-slate-900 tracking-tight">InternDesk</span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-serif font-bold text-slate-900 tracking-wide">
                    Certificate of Internship
                  </h4>
                  <p className="text-[11px] text-slate-500 italic">This is to certify that</p>
                </div>

                <div className="py-1">
                  <h3 className="text-xl font-bold text-blue-700 tracking-tight">
                    Fenil Patel
                  </h3>
                  <div className="w-24 h-0.5 bg-blue-600 mx-auto mt-1" />
                </div>

                <p className="text-[11px] text-slate-600 max-w-sm mx-auto leading-relaxed">
                  has successfully completed the internship program at <strong className="text-slate-800">InternDesk</strong> from October 1, 2026 to October 31, 2026.
                </p>

                {/* Footer Stamp & Signatory */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-left">
                  <div className="text-[10px] text-slate-500">
                    <div className="font-script text-sm text-slate-800 font-bold">Authorized Signatory</div>
                    <p className="text-[9px] text-slate-400">Head of Operations</p>
                  </div>

                  <div className="w-12 h-12 rounded-full border-2 border-amber-500 bg-amber-50/60 flex items-center justify-center text-amber-700">
                    <Award className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Download Action */}
              <div className="pt-4">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
