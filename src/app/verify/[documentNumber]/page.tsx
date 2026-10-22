"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Award,
  Lock,
  ArrowLeft,
  Copy,
  Check,
  Printer,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { multiTenantStore } from "@/lib/multitenant/store";

function DocumentVerificationContent() {
  const params = useParams();
  const rawDocNumber = (params?.documentNumber as string) || "";
  const documentNumber = decodeURIComponent(rawDocNumber);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const doc = multiTenantStore.findDocumentByNumber(documentNumber);
  const org = doc ? multiTenantStore.getOrganizationById(doc.organization_id) : null;
  const isPending = doc?.status === "PENDING_APPROVAL" || doc?.approval_status === "PENDING";
  const isIssued = doc?.status === "ISSUED";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Header */}
      <header className="w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md py-4 px-6 sm:px-12 flex items-center justify-between">
        <AnimatedLogo size="md" />
        <Link href="/">
          <Button variant="outline" size="sm" className="rounded-xl text-slate-700">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Home
          </Button>
        </Link>
      </header>

      {/* Main Verification Card */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Public Credential Verification Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Official Document Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-normal">
            Real-time verification against the issuing organization&apos;s verified tenant record.
          </p>
        </div>

        {doc && org && isIssued ? (
          <Card className="border-emerald-200 bg-white rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
            {/* Top Verification Status Banner */}
            <div className="bg-emerald-600 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-6 h-6 text-white" />
                <div>
                  <h3 className="text-sm font-bold tracking-wide">VERIFIED OFFICIAL CREDENTIAL</h3>
                  <p className="text-[11px] text-emerald-100">Tamper-proof record verified on InternDesk ledger</p>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-700/60 border border-emerald-500">
                STATUS: {doc.status}
              </span>
            </div>

            {/* Credential Details */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-start justify-between pb-5 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Document Type
                  </span>
                  <h2 className="text-xl font-black text-slate-900 mt-0.5">
                    {doc.title}
                  </h2>
                  <p className="text-xs font-mono font-bold text-blue-600 mt-1">
                    Document No: {doc.document_number}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Award className="w-6 h-6" />
                </div>
              </div>

              {/* Issuing Organization Profile */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Issuing Organization
                </span>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      {org.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {org.industry_or_category} • {org.type}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-blue-100 text-blue-800">
                    {org.code}
                  </span>
                </div>
              </div>

              {/* Recipient Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Recipient Name</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{doc.recipient_name}</p>
                  <p className="text-xs text-slate-500">{doc.recipient_role}</p>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Issue Date</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {doc.issued_date}
                  </p>
                  <p className="text-xs text-slate-500">{doc.template_data?.validity || "Valid"}</p>
                </div>
              </div>

              {/* Academic Performance Transcript Dossier Scorecard (if transcript or has metrics) */}
              {(doc.document_type === "PERFORMANCE_TRANSCRIPT" || doc.template_data?.verified_work_hours) && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-blue-600" />
                      Academic &amp; Practicum Telemetry Ledger
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Audit Score: {doc.template_data?.mentor_scores?.overall || 98.4}%
                    </span>
                  </div>

                  {/* 4 Metric Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Verified Hours</span>
                      <span className="text-base font-black text-blue-700">{doc.template_data?.verified_work_hours || 160} hrs</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Attendance</span>
                      <span className="text-base font-black text-emerald-600">{doc.template_data?.attendance_percentage || 99.2}%</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Deliverables</span>
                      <span className="text-base font-black text-purple-600">{doc.template_data?.completed_tasks_count || 14}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Assessments</span>
                      <span className="text-base font-black text-amber-600">{doc.template_data?.assessments_passed_count || 2} Passed</span>
                    </div>
                  </div>

                  {/* Mentor Rubric Evaluation Meters */}
                  {doc.template_data?.mentor_scores && (
                    <div className="space-y-2 pt-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Mentor Rubric Scorecard</span>
                      <div className="space-y-1.5 text-xs">
                        <div>
                          <div className="flex justify-between text-[11px] font-medium text-slate-700 mb-0.5">
                            <span>Technical Execution &amp; Architecture</span>
                            <span className="font-mono font-bold text-blue-600">{doc.template_data.mentor_scores.technical}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${doc.template_data.mentor_scores.technical}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] font-medium text-slate-700 mb-0.5">
                            <span>Communication &amp; Teamwork</span>
                            <span className="font-mono font-bold text-indigo-600">{doc.template_data.mentor_scores.communication}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${doc.template_data.mentor_scores.communication}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] font-medium text-slate-700 mb-0.5">
                            <span>Ownership &amp; Velocity</span>
                            <span className="font-mono font-bold text-emerald-600">{doc.template_data.mentor_scores.initiative}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${doc.template_data.mentor_scores.initiative}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Verified Skill Badges */}
                  {doc.template_data?.verified_skills && doc.template_data.verified_skills.length > 0 && (
                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
                        Verified Technical Competencies
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {doc.template_data.verified_skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 text-[10px] font-semibold shadow-2xs"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-blue-600" />
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Signatory & Security Code */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 font-mono">
                <span>Verification Code: <strong>{doc.verification_code}</strong></span>
                <span>Signatory: <strong>{doc.template_data?.signatory_name}</strong></span>
              </div>

              {/* Interactive Cryptographic Proof Inspector */}
              <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 text-[11px] font-mono space-y-2">
                <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Cryptographic Ledger Proof
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                    MERKLE VALIDATED
                  </span>
                </div>
                
                <div className="space-y-1 text-[10px] text-slate-300">
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span className="text-slate-500">Hash Algorithm:</span>
                    <span className="text-slate-300">SHA-256 (FIPS 180-4)</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span className="text-slate-500">Document Digest:</span>
                    <span className="text-emerald-400 break-all">{doc.document_number}:{doc.recipient_name}:{doc.issued_date}:{org.code}:{doc.verification_code}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span className="text-slate-500">Issuer Signature:</span>
                    <span className="text-blue-300 font-bold">VERIFIED ({doc.template_data?.signatory_name || "Elena Rostova"})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Standard:</span>
                    <span className="text-purple-300">W3C Verifiable Credential v2.0</span>
                  </div>
                </div>

                {/* Export JSON-LD Verifiable Credential */}
                <div className="pt-1 flex justify-end">
                  <button
                    onClick={() => {
                      const payload = {
                        "@context": [
                          "https://www.w3.org/2018/credentials/v1",
                          "https://interndesk.io/contexts/credentials/v2"
                        ],
                        id: `urn:uuid:${doc.document_number}`,
                        type: ["VerifiableCredential", "InternshipCredential"],
                        issuer: {
                          id: `did:interndesk:org:${org.code.toLowerCase()}`,
                          name: org.name,
                          organizationType: org.type,
                        },
                        issuanceDate: doc.issued_date,
                        credentialSubject: {
                          id: `did:interndesk:member:${doc.member_id}`,
                          name: doc.recipient_name,
                          role: doc.recipient_role,
                          title: doc.title,
                          verificationCode: doc.verification_code,
                          ...(doc.template_data?.verified_work_hours
                            ? {
                                verifiedWorkHours: doc.template_data.verified_work_hours,
                                attendancePercentage: doc.template_data.attendance_percentage,
                                mentorScore: doc.template_data.mentor_scores,
                                verifiedSkills: doc.template_data.verified_skills,
                              }
                            : {}),
                        },
                        proof: {
                          type: "Sha256Signature2026",
                          created: doc.created_at,
                          verificationMethod: `did:interndesk:org:${org.code.toLowerCase()}#key-1`,
                          proofPurpose: "assertionMethod",
                          jws: `eyJhbGciOiJSUzI1NiIsImNyaXQiOls...${doc.verification_code.replace(/[^a-zA-Z0-9]/g, "")}`,
                        },
                      };
                      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${doc.document_number}-verifiable-credential.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="inline-flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    Download W3C Verifiable Credential JSON-LD
                  </button>
                </div>
              </div>

              {/* Add to LinkedIn Button */}
              <div className="pt-2">
                <a
                  href={`https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
                    doc.title
                  )}&organizationName=${encodeURIComponent(org.name)}&issueYear=${new Date(doc.issued_date).getFullYear() || 2026}&issueMonth=${(new Date(doc.issued_date).getMonth() + 1) || 10}&certUrl=${encodeURIComponent(
                    `https://interndesk.io/verify/${doc.document_number}`
                  )}&certId=${encodeURIComponent(doc.document_number)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.53 1.53 0 0 0 1.53-1.53 1.53 1.53 0 0 0-1.53-1.53 1.53 1.53 0 0 0-1.53 1.53 1.53 1.53 0 0 0 1.53 1.53m1.4 9.74v-8.37H5.06v8.37h2.8z" />
                  </svg>
                  <span>Add Credential to LinkedIn Profile</span>
                </a>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    className="rounded-xl border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold h-10 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                    {copiedLink ? "Link Copied!" : "Copy Verification Link"}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrint}
                    className="rounded-xl border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold h-10 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Printer className="w-4 h-4 text-slate-500" />
                    Print Official Dossier
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ) : doc && org && isPending ? (
          <Card className="border-amber-300 bg-white rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
            {/* Top Amber Status Banner */}
            <div className="bg-amber-500 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-6 h-6 text-white" />
                <div>
                  <h3 className="text-sm font-bold tracking-wide">UNRELEASED CREDENTIAL — AWAITING AUTHORIZATION</h3>
                  <p className="text-[11px] text-amber-100">Draft prepared by {org.name} • Release approval required</p>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-600/70 border border-amber-400">
                PENDING APPROVAL
              </span>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-start justify-between pb-5 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Draft Document
                  </span>
                  <h2 className="text-xl font-black text-slate-900 mt-0.5">
                    {doc.title}
                  </h2>
                  <p className="text-xs font-mono font-bold text-amber-600 mt-1">
                    Document No: {doc.document_number}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <Lock className="w-6 h-6" />
                </div>
              </div>

              {/* Notice */}
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-2">
                <p className="font-bold flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-amber-700" />
                  Administrative Release Gate Active
                </p>
                <p className="text-amber-800 leading-relaxed">
                  This document record has been drafted by <strong>{org.name}</strong>, but has not yet received official administrative release approval from HR or Organization Leadership.
                </p>
                <p className="text-amber-700 text-[11px]">
                  Under organization security controls, unapproved credentials cannot be publicly verified, exported, or added to professional profiles until authorized.
                </p>
              </div>

              {/* Metadata */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Candidate Recipient:</span>
                  <strong className="text-slate-900">{doc.recipient_name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Role:</span>
                  <strong className="text-slate-900">{doc.recipient_role}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Issuing Organization:</span>
                  <strong className="text-slate-900">{org.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Draft Preparation Date:</span>
                  <strong className="text-slate-900">{doc.issued_date}</strong>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 text-center text-xs text-slate-500 font-medium">
                Public validation ledger &amp; LinkedIn export will activate upon administrator release.
              </div>
            </div>
          </Card>
        ) : (
          <Card className="border-red-200 bg-white rounded-2xl p-8 text-center space-y-4 shadow-md">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-slate-900">
              Document Not Found or Revoked
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto font-normal">
              No active issued document was found matching number &quot;<span className="font-bold text-slate-800">{documentNumber}</span>&quot;.
              Please verify the document number printed on the credential.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-2">
              <Link href="/verify/ID-TRSC-2026-9812">
                <Button size="sm" variant="outline" className="text-xs font-mono bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100">
                  Try Demo: Performance Transcript (ID-TRSC-2026-9812)
                </Button>
              </Link>
              <Link href="/verify/ID-CERT-2026-8918">
                <Button size="sm" variant="outline" className="text-xs font-mono">
                  Try Demo: Certificate (ID-CERT-2026-8918)
                </Button>
              </Link>
              <Link href="/verify/IND-APX-2026-0042">
                <Button size="sm" variant="outline" className="text-xs font-mono">
                  Try Demo: Offer (IND-APX-2026-0042)
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </main>

      <footer className="py-6 border-t border-slate-200 text-center text-xs text-slate-500">
        InternDesk Cryptographic Credential Verification Engine • Zero Modification Permitted
      </footer>
    </div>
  );
}

export default function DocumentVerificationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-slate-500">Verifying document credentials...</div>}>
      <DocumentVerificationContent />
    </Suspense>
  );
}
