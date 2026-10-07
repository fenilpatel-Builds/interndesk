"use client";

import React from "react";
import Link from "next/link";
import { StudentTopbar } from "@/components/student/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Award, FileText, Download, ShieldCheck, CheckCircle2, Lock, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface DocumentRecord {
  id: string;
  type: "OFFER_LETTER" | "INTERNSHIP_LETTER" | "INTERNSHIP_CERTIFICATE";
  title: string;
  docNumber: string;
  status: "AVAILABLE" | "PENDING_APPROVAL" | "NOT_ELIGIBLE";
  issueDate?: string;
  description: string;
}

export default function StudentDocumentsPage() {
  const documents: DocumentRecord[] = [
    {
      id: "d1",
      type: "OFFER_LETTER",
      title: "Official Internship Offer Letter",
      docNumber: "ID-OFF-847291",
      status: "AVAILABLE",
      issueDate: "2026-10-01",
      description: "Confirms your formal selection and enrollment in the InternDesk industrial cohort.",
    },
    {
      id: "d2",
      type: "INTERNSHIP_LETTER",
      title: "Bonafide College Verification Letter",
      docNumber: "ID-INT-928174",
      status: "AVAILABLE",
      issueDate: "2026-10-02",
      description: "Official documentation of active training status for university submissions.",
    },
    {
      id: "d3",
      type: "INTERNSHIP_CERTIFICATE",
      title: "Certificate of Internship Completion",
      docNumber: "ID-CERT-000000",
      status: "PENDING_APPROVAL",
      description: "Official credential awarded upon fulfilling required attendance (80%) and passing assessments.",
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <StudentTopbar title="Official Documents & Certificates" studentName="Aarav Sharma" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Certified Credentials & Letters
          </h2>
          <p className="text-xs text-slate-500">
            Download your tamper-proof, verified documents issued by the internship organization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <Card
              key={doc.id}
              className="border-slate-200/90 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      doc.type === "INTERNSHIP_CERTIFICATE"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {doc.type === "INTERNSHIP_CERTIFICATE" ? (
                      <Award className="w-6 h-6" />
                    ) : (
                      <FileText className="w-6 h-6" />
                    )}
                  </div>
                  <StatusBadge status={doc.status} />
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {doc.description}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-[11px] font-mono text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Document #:</span>
                    <span className="font-bold text-slate-900">{doc.docNumber}</span>
                  </div>
                  {doc.issueDate && (
                    <div className="flex justify-between font-sans">
                      <span>Issued On:</span>
                      <span>{formatDate(doc.issueDate)}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-2">
                  {doc.status === "AVAILABLE" ? (
                    <>
                      <Button
                        size="sm"
                        className="w-full bg-blue-600 hover:bg-blue-700 justify-center text-xs"
                        onClick={() => alert(`Downloading verified PDF for ${doc.title}...`)}
                      >
                        <Download className="w-4 h-4 mr-1.5" />
                        Download Official PDF
                      </Button>

                      <Link href={`/verify/${doc.docNumber}`} target="_blank">
                        <button className="w-full text-center text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center justify-center gap-1 mt-1">
                          Verify Credential Authenticity
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </Link>
                    </>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-slate-100 text-slate-500 text-xs text-center flex items-center justify-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Pending Administrator Approval</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
