"use client";

import React, { useState } from "react";
import Link from "next/link";
import { StudentTopbar } from "@/components/student/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Award,
  FileText,
  Download,
  CheckCircle2,
  ShieldCheck,
  GraduationCap,
  Eye,
  Lock,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { DocumentStudioModal } from "@/components/documents/document-studio-modal";
import { IssuedDocument } from "@/types/multitenant";
import { multiTenantStore } from "@/lib/multitenant/store";

const STUDENT_DOCUMENTS: IssuedDocument[] = [
  {
    id: "doc-offer",
    organization_id: "org-apex-01",
    member_id: "usr-student-fenil",
    document_number: "ID-OFFER-2026-4412",
    document_type: "OFFER_LETTER",
    title: "Official Internship Offer Letter",
    recipient_name: "Fenil Patel",
    recipient_role: "Software Engineering Intern",
    issued_date: "2026-10-01",
    status: "ISSUED",
    verification_code: "VRF-APX-4412-OFR",
    template_data: {
      organization_name: "Apex Technologies",
      organization_type: "CORPORATE",
      signatory_name: "Marcus Sterling",
      signatory_title: "Director of Talent & Mentorship",
      program_or_track: "Cloud Backend & Next.js Architecture",
      validity: "Active / Verified",
    },
    created_at: "2026-10-01T09:00:00Z",
  },
  {
    id: "doc-intern",
    organization_id: "org-apex-01",
    member_id: "usr-student-fenil",
    document_number: "ID-INTR-2026-5591",
    document_type: "INTERNSHIP_LETTER",
    title: "Internship Appointment & Enrollment Letter",
    recipient_name: "Fenil Patel",
    recipient_role: "Full Stack Software Engineering Intern",
    issued_date: "2026-10-03",
    status: "ISSUED",
    verification_code: "VRF-APX-5591-INT",
    template_data: {
      organization_name: "Apex Technologies",
      organization_type: "CORPORATE",
      signatory_name: "Elena Rostova",
      signatory_title: "Head of Engineering Operations",
      program_or_track: "Enterprise Cloud Architecture Track",
      validity: "Active / Verified",
    },
    created_at: "2026-10-03T11:00:00Z",
  },
  {
    id: "doc-cert",
    organization_id: "org-apex-01",
    member_id: "usr-student-fenil",
    document_number: "ID-CERT-2026-8918",
    document_type: "COMPLETION_CERTIFICATE",
    title: "Certificate of Internship Excellence",
    recipient_name: "Fenil Patel",
    recipient_role: "Full Stack Software Engineering Intern",
    issued_date: "2026-10-15",
    status: "ISSUED",
    verification_code: "VRF-APX-8918-EXC",
    template_data: {
      organization_name: "Apex Technologies",
      organization_type: "CORPORATE",
      signatory_name: "Elena Rostova",
      signatory_title: "Head of Engineering Operations",
      program_or_track: "Full Stack Cloud Platform Internship",
      grade_or_evaluation: "Grade: Outstanding (98.4% Efficiency)",
      validity: "Verified Permanent Credential",
    },
    created_at: "2026-10-15T12:00:00Z",
  },
];

export default function StudentDocumentsPage() {
  const [activeTab, setActiveTab] = useState<"ALL" | "OFFER" | "INTERN" | "CERT">("ALL");
  const [selectedStudioDoc, setSelectedStudioDoc] = useState<IssuedDocument | null>(null);

  const storeDocs = multiTenantStore.getIssuedDocuments("org-apex-01", "usr-student-fenil");
  const docsList = storeDocs.length > 0 ? storeDocs : STUDENT_DOCUMENTS;

  const filteredDocs = docsList.filter((doc) => {
    if (activeTab === "OFFER") return doc.document_type === "OFFER_LETTER";
    if (activeTab === "INTERN") return doc.document_type === "INTERNSHIP_LETTER";
    if (activeTab === "CERT") return doc.document_type === "COMPLETION_CERTIFICATE";
    return true;
  });

  const certificateDoc = docsList.find((d) => d.document_type === "COMPLETION_CERTIFICATE" && d.status === "ISSUED") || docsList[0];

  // LinkedIn Add-to-Profile URL for the certificate
  const certLinkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
    certificateDoc?.title || "Certificate of Internship Excellence"
  )}&organizationName=${encodeURIComponent("Apex Technologies")}&issueYear=2026&issueMonth=10&certUrl=${encodeURIComponent(
    `https://interndesk.io/verify/${certificateDoc?.document_number || "ID-CERT-2026-8918"}`
  )}&certId=${encodeURIComponent(certificateDoc?.document_number || "ID-CERT-2026-8918")}`;

  const approvedCount = docsList.filter((d) => d.status === "ISSUED").length;
  const pendingCount = docsList.filter((d) => d.status === "PENDING_APPROVAL").length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      <StudentTopbar title="Documents & Credentials" studentName="Fenil Patel" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header & Portfolio Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Documents &amp; Tamper-Proof Portfolio
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                SHA-256 Ledger
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Access, verify, and export your accredited offer letters and tamper-proof internship certificates.
            </p>
          </div>

          <Button
            id="launch-certificate-studio-btn"
            size="sm"
            onClick={() => setSelectedStudioDoc(certificateDoc)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs h-9 px-4 cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <Eye className="w-3.5 h-3.5 mr-1.5" />
            Launch Certificate Studio
          </Button>
        </div>

        {/* Quick Portfolio Stats Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 bg-white rounded-2xl border-slate-200 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Issued Credentials</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-slate-900">{approvedCount}</span>
              <Award className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-[10px] text-emerald-700 font-medium">Publicly verifiable</p>
          </Card>

          <Card className="p-4 bg-white rounded-2xl border-slate-200 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Awaiting Release</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-amber-600">{pendingCount}</span>
              <Lock className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-[10px] text-amber-700 font-medium">Pending HR approval</p>
          </Card>

          <Card className="p-4 bg-white rounded-2xl border-slate-200 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Verification Node</span>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-blue-600">SHA-256</span>
              <ShieldCheck className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Crockford Base32</p>
          </Card>

          <Card className="p-4 bg-white rounded-2xl border-slate-200 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Issuer Authority</span>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 truncate">Apex Tech</span>
              <GraduationCap className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-[10px] text-indigo-700 font-medium">Enterprise Verified</p>
          </Card>
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
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? "bg-white text-blue-600 font-extrabold shadow-2xs border border-slate-200"
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
            {docsList.some((d) => d.status === "PENDING_APPROVAL") && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900">
                  <p className="font-bold">Administrative Release Gate Active</p>
                  <p className="text-amber-700 text-[11px] mt-0.5">
                    Credentials marked as &ldquo;Awaiting HR Release Approval&rdquo; have been drafted by your organization and will unlock automatically once approved by your coordinator.
                  </p>
                </div>
              </div>
            )}

            {filteredDocs.map((doc) => (
              <Card
                key={doc.id}
                className="border-slate-200/90 shadow-xs p-4 flex items-center justify-between bg-white hover:border-blue-200 transition-all rounded-2xl"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      doc.document_type === "COMPLETION_CERTIFICATE"
                        ? "bg-amber-50 text-amber-600 border border-amber-200"
                        : "bg-blue-50 text-blue-600 border border-blue-200"
                    }`}
                  >
                    {doc.document_type === "COMPLETION_CERTIFICATE" ? (
                      <Award className="w-5 h-5" />
                    ) : (
                      <FileText className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{doc.title}</h4>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">{doc.document_number}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {doc.status === "PENDING_APPROVAL" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" /> Awaiting HR Release Approval
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80">
                          <CheckCircle2 className="w-3 h-3" /> Approved &amp; Issued
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">Issued {doc.issued_date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {doc.status === "PENDING_APPROVAL" ? (
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      Locked
                    </span>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedStudioDoc(doc)}
                        className="text-xs h-8 px-3 rounded-xl border-slate-300 hover:bg-slate-50 font-bold cursor-pointer"
                      >
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setSelectedStudioDoc(doc)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-3 rounded-xl font-bold cursor-pointer shadow-2xs"
                      >
                        <Download className="w-3 h-3 mr-1" /> PDF
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Right Column: Certificate Preview Card */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Live Certificate Preview &amp; Verification
              </h3>
              <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Seal Intact
              </span>
            </div>

            <Card className="border-2 border-slate-200 shadow-md p-8 text-center bg-white relative overflow-hidden rounded-2xl">
              {/* Decorative border */}
              <div className="border-2 border-dashed border-blue-900/30 p-6 rounded-xl space-y-4 relative bg-gradient-to-b from-blue-50/20 via-white to-amber-50/20">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-black text-slate-900 tracking-tight">Apex Technologies</span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-serif font-black text-slate-900 tracking-wide">
                    Certificate of Internship Excellence
                  </h4>
                  <p className="text-[11px] text-slate-500 italic">This officially certifies that</p>
                </div>

                <div className="py-1">
                  <h3 className="text-2xl font-serif font-black text-blue-700 tracking-tight">
                    Fenil Patel
                  </h3>
                  <div className="w-28 h-0.5 bg-blue-600 mx-auto mt-1" />
                </div>

                <p className="text-[11px] text-slate-600 max-w-sm mx-auto leading-relaxed">
                  has successfully completed all milestones for the <strong className="text-slate-800">Full Stack Cloud Platform Internship</strong> from October 1, 2026 to October 31, 2026.
                </p>

                {/* Footer Stamp, QR Code & Signatory */}
                <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between text-left">
                  <div className="text-[10px] text-slate-500">
                    <div className="font-serif text-sm text-slate-900 font-bold">Elena Rostova</div>
                    <p className="text-[9px] text-slate-400">Head of Operations • Apex Technologies</p>
                    <span className="font-mono text-[9px] text-blue-600 block mt-0.5">
                      ID: ID-CERT-2026-8918
                    </span>
                  </div>

                  {/* QR Code Block linking to /verify/[id] */}
                  <Link
                    href="/verify/ID-CERT-2026-8918"
                    className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
                    title="Scan or click to verify authentically on public ledger"
                  >
                    <div className="w-9 h-9 bg-white p-1 rounded border border-slate-300 flex flex-col justify-between shrink-0">
                      <div className="flex justify-between">
                        <div className="w-2 h-2 bg-slate-900" />
                        <div className="w-2 h-2 bg-slate-900" />
                      </div>
                      <div className="w-1.5 h-1.5 bg-blue-600 mx-auto rounded-full" />
                      <div className="flex justify-between">
                        <div className="w-2 h-2 bg-slate-900" />
                        <div className="w-1.5 h-1.5 bg-emerald-600" />
                      </div>
                    </div>
                    <div className="text-[9px] leading-tight text-slate-600">
                      <span className="font-bold text-slate-900 block">Scan to Verify</span>
                      <span className="text-emerald-600 font-semibold">Valid Credential</span>
                    </div>
                  </Link>

                  <div className="w-11 h-11 rounded-full border-2 border-amber-500 bg-amber-50/70 flex items-center justify-center text-amber-700 shrink-0 shadow-2xs">
                    <Award className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Action Buttons: Studio Modal, Download & Add to LinkedIn */}
              <div className="pt-4 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    id="open-pdf-studio-btn"
                    onClick={() => setSelectedStudioDoc(certificateDoc)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs py-5 cursor-pointer text-xs"
                  >
                    <Download className="w-4 h-4 mr-1.5" />
                    Open PDF Studio
                  </Button>
                  <Link href="/verify/ID-CERT-2026-8918" target="_blank" className="w-full">
                    <Button
                      id="verify-publicly-btn"
                      variant="outline"
                      className="w-full border-slate-300 text-slate-700 font-bold rounded-xl py-5 hover:bg-slate-50 cursor-pointer text-xs"
                    >
                      <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-600" />
                      Verify Publicly
                    </Button>
                  </Link>
                </div>

                {/* Add to LinkedIn Button */}
                <a
                  href={certLinkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.53 1.53 0 0 0 1.53-1.53 1.53 1.53 0 0 0-1.53-1.53 1.53 1.53 0 0 0-1.53 1.53 1.53 1.53 0 0 0 1.53 1.53m1.4 9.74v-8.37H5.06v8.37h2.8z" />
                  </svg>
                  <span>Add Certificate to LinkedIn Profile</span>
                </a>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Rich Document Studio Modal */}
      {selectedStudioDoc && (
        <DocumentStudioModal
          isOpen={!!selectedStudioDoc}
          onClose={() => setSelectedStudioDoc(null)}
          document={selectedStudioDoc}
          organizationName="Apex Technologies"
        />
      )}
    </div>
  );
}
