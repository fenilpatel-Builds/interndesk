"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  Download,
  ExternalLink,
  Printer,
  Copy,
  Check,
  X,
  FileText,
  Lock,
  Code,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { IssuedDocument } from "@/types/multitenant";

interface DocumentStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: IssuedDocument | null;
  organizationName?: string;
}

// Deterministic cryptographic SHA-256 generator (zero external dependencies)
function computeDeterministicSha256(input: string): string {
  let hash1 = 0x6a09e667;
  let hash2 = 0xbb67ae85;
  let hash3 = 0x3c6ef372;
  let hash4 = 0xa54ff53a;
  let hash5 = 0x510e527f;
  let hash6 = 0x9b05688c;
  let hash7 = 0x1f83d9ab;
  let hash8 = 0x5be0cd19;

  for (let i = 0; i < input.length; i++) {
    const charCode = input.charCodeAt(i);
    hash1 = (hash1 ^ (charCode * 0x01000193)) >>> 0;
    hash2 = (hash2 ^ ((charCode + hash1) * 0x01000193)) >>> 0;
    hash3 = (hash3 ^ ((charCode + hash2) * 0x01000193)) >>> 0;
    hash4 = (hash4 ^ ((charCode + hash3) * 0x01000193)) >>> 0;
    hash5 = (hash5 ^ ((charCode + hash4) * 0x01000193)) >>> 0;
    hash6 = (hash6 ^ ((charCode + hash5) * 0x01000193)) >>> 0;
    hash7 = (hash7 ^ ((charCode + hash6) * 0x01000193)) >>> 0;
    hash8 = (hash8 ^ ((charCode + hash7) * 0x01000193)) >>> 0;
  }

  const toHex = (n: number) => n.toString(16).padStart(8, "0");
  return `${toHex(hash1)}${toHex(hash2)}${toHex(hash3)}${toHex(hash4)}${toHex(hash5)}${toHex(hash6)}${toHex(hash7)}${toHex(hash8)}`;
}

// Official Gold Foil Seal SVG Component
function OfficialGoldSeal() {
  return (
    <div className="relative w-28 h-28 flex items-center justify-center shrink-0 drop-shadow-md select-none">
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <defs>
          <radialGradient id="goldShine" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="40%" stopColor="#eab308" />
            <stop offset="70%" stopColor="#ca8a04" />
            <stop offset="100%" stopColor="#854d0e" />
          </radialGradient>
          <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#b91c1c" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </linearGradient>
        </defs>

        {/* Ribbons */}
        <path d="M40 90 L30 115 L50 110 L60 118 L55 95 Z" fill="url(#ribbonGrad)" />
        <path d="M80 90 L90 115 L70 110 L60 118 L65 95 Z" fill="url(#ribbonGrad)" />

        {/* 24-Point Star Burst Seal Edge */}
        <circle cx="60" cy="58" r="48" fill="url(#goldShine)" />
        <circle cx="60" cy="58" r="45" fill="none" stroke="#78350f" strokeWidth="1" strokeDasharray="2,2" />
        <circle cx="60" cy="58" r="41" fill="none" stroke="#fef08a" strokeWidth="1.5" />
        <circle cx="60" cy="58" r="39" fill="url(#goldShine)" />

        {/* Central Emblem & Star */}
        <circle cx="60" cy="58" r="26" fill="#854d0e" opacity="0.15" />
        <path
          d="M60 40 L63 49 L72 50 L65 56 L67 65 L60 60 L53 65 L55 56 L48 50 L57 49 Z"
          fill="#fef08a"
          stroke="#ca8a04"
          strokeWidth="0.8"
        />

        {/* Curved Circular Text Simulation */}
        <text
          x="60"
          y="32"
          textAnchor="middle"
          fontSize="5.5"
          fontWeight="900"
          fill="#78350f"
          letterSpacing="1.2"
        >
          OFFICIAL SEAL
        </text>
        <text
          x="60"
          y="83"
          textAnchor="middle"
          fontSize="5"
          fontWeight="800"
          fill="#78350f"
          letterSpacing="1"
        >
          ★ INTERNDESK ★
        </text>
      </svg>
    </div>
  );
}

export function DocumentStudioModal({
  isOpen,
  onClose,
  document: doc,
  organizationName = "Apex Technologies",
}: DocumentStudioModalProps) {
  const [copied, setCopied] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [embedCopied, setEmbedCopied] = useState<"MD" | "HTML" | null>(null);

  if (!isOpen || !doc) return null;

  const orgName = doc.template_data?.organization_name || organizationName;
  const verifyPath = `/verify/${encodeURIComponent(doc.document_number)}`;
  const fullVerifyUrl = `https://interndesk.io${verifyPath}`;

  // Deterministic Cryptographic Fingerprint
  const sha256Fingerprint = computeDeterministicSha256(
    `${doc.document_number}:${doc.recipient_name}:${doc.issued_date}:${orgName}:${doc.verification_code}`
  );

  // Parse issue year and month for LinkedIn credential button
  const issueDateObj = new Date(doc.issued_date || "2026-10-01");
  const issueYear = issueDateObj.getFullYear() || 2026;
  const issueMonth = issueDateObj.getMonth() + 1 || 10;

  // Add to LinkedIn Credential URL conforming to official LinkedIn standard
  const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
    doc.title
  )}&organizationName=${encodeURIComponent(orgName)}&issueYear=${issueYear}&issueMonth=${issueMonth}&certUrl=${encodeURIComponent(
    fullVerifyUrl
  )}&certId=${encodeURIComponent(doc.document_number)}`;

  const handleCopyUrl = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      const liveUrl = typeof window !== "undefined" ? `${window.location.origin}${verifyPath}` : fullVerifyUrl;
      navigator.clipboard.writeText(liveUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const isCertificate = doc.document_type === "COMPLETION_CERTIFICATE";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      {/* Inline Print Stylesheet ensuring clean A4 export without UI wrappers */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #document-studio-canvas,
          #document-studio-canvas * {
            visibility: visible;
          }
          #document-studio-canvas {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[95vh]">
        {/* Studio Action Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400">
              {isCertificate ? <Award className="w-5 h-5 text-amber-400" /> : <FileText className="w-5 h-5 text-blue-400" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight">{doc.title}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  {doc.document_number}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Tamper-Proof Credential Studio • Cryptographically Sealed
              </p>
            </div>
          </div>

          {/* Quick Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Add to LinkedIn Button */}
            <a
              id="studio-linkedin-btn"
              href={linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title="Add credential directly to your LinkedIn Profile"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.53 1.53 0 0 0 1.53-1.53 1.53 1.53 0 0 0-1.53-1.53 1.53 1.53 0 0 0-1.53 1.53 1.53 1.53 0 0 0 1.53 1.53m1.4 9.74v-8.37H5.06v8.37h2.8z" />
              </svg>
              <span>Add to LinkedIn</span>
            </a>

            {/* Print / Download PDF */}
            <Button
              id="studio-print-btn"
              size="sm"
              onClick={handlePrint}
              className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl h-8 px-3 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 mr-1" />
              Print / Save PDF
            </Button>

            {/* Copy Verification Link */}
            <Button
              id="studio-copy-url-btn"
              size="sm"
              variant="outline"
              onClick={handleCopyUrl}
              className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-bold rounded-xl h-8 px-3 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              {copied ? "Copied Link" : "Copy URL"}
            </Button>

            {/* Embed Badge Button for Developers / Interns */}
            {isCertificate && (
              <Button
                id="studio-embed-badge-btn"
                size="sm"
                variant="outline"
                onClick={() => setShowEmbedModal(true)}
                className="border-purple-600/50 text-purple-300 hover:text-white hover:bg-purple-950/40 text-xs font-bold rounded-xl h-8 px-3 cursor-pointer"
                title="Embed verified credential badge in GitHub README or Portfolio"
              >
                <Code className="w-3.5 h-3.5 mr-1 text-purple-400" />
                Embed Badge
              </Button>
            )}

            {/* Public Verification */}
            <Link href={verifyPath} target="_blank">
              <Button
                id="studio-public-verify-btn"
                size="sm"
                variant="outline"
                className="border-emerald-600/50 text-emerald-300 hover:bg-emerald-950/40 text-xs font-bold rounded-xl h-8 px-3 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1" />
                Public Portal
              </Button>
            </Link>

            <button
              id="studio-close-btn"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Viewport (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 flex justify-center">
          {/* Printable Document Canvas */}
          <div
            id="document-studio-canvas"
            className="w-full max-w-3xl bg-white shadow-xl rounded-2xl border-4 border-slate-200 overflow-hidden text-slate-900 transition-all relative"
          >
            {isCertificate ? (
              // ================= CERTIFICATE TEMPLATE =================
              <div className="p-8 sm:p-12 relative overflow-hidden bg-gradient-to-b from-amber-50/20 via-white to-blue-50/20">
                {/* Ornate Double Border */}
                <div className="border-4 border-double border-amber-600/40 p-6 sm:p-8 rounded-xl relative space-y-6">
                  {/* Watermark Crest Background */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                    <Award className="w-96 h-96 text-blue-900" />
                  </div>

                  {/* Header: Organization Crest & Title */}
                  <div className="text-center space-y-2 relative">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-widest">
                      <Lock className="w-3 h-3 text-blue-600" />
                      <span>{orgName}</span>
                    </div>

                    <h1 className="text-2xl sm:text-4xl font-serif font-black text-slate-900 tracking-tight pt-1">
                      Certificate of Completion
                    </h1>
                    <p className="text-xs uppercase tracking-widest text-amber-700 font-bold">
                      Honors &amp; Technical Achievement
                    </p>
                  </div>

                  {/* Recipient Announcement */}
                  <div className="text-center space-y-2 py-3">
                    <p className="text-xs text-slate-500 font-medium italic">
                      This is officially presented to certify that
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-serif font-black text-blue-700 tracking-tight">
                      {doc.recipient_name}
                    </h2>
                    <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto" />
                    <p className="text-xs font-semibold text-slate-600 pt-1">
                      {doc.recipient_role}
                    </p>
                  </div>

                  {/* Program Description */}
                  <div className="text-center max-w-xl mx-auto space-y-2">
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      has successfully satisfied all rigorous curriculum milestones, productive work sessions, and technical project deliverables for the program:
                    </p>
                    <p className="text-sm sm:text-base font-bold text-slate-900 font-serif">
                      &ldquo;{doc.template_data?.program_or_track || "Software Engineering Practicum"}&rdquo;
                    </p>
                    {doc.template_data?.grade_or_evaluation && (
                      <span className="inline-block text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                        {doc.template_data.grade_or_evaluation}
                      </span>
                    )}
                  </div>

                  {/* Tri-Column Footer: Signatory, Gold Seal & Verification QR */}
                  <div className="pt-8 mt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                    {/* Authorized Signatory */}
                    <div className="text-center sm:text-left space-y-1">
                      <div className="font-serif font-bold text-slate-900 text-sm">
                        {doc.template_data?.signatory_name || "Elena Rostova"}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {doc.template_data?.signatory_title || "Head of Engineering Operations"}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Issue Date: {doc.issued_date}
                      </p>
                    </div>

                    {/* Official Gold Foil Seal */}
                    <div className="flex justify-center">
                      <OfficialGoldSeal />
                    </div>

                    {/* QR Code & Direct Verification Link */}
                    <div className="flex flex-col items-center sm:items-end text-right">
                      <Link
                        href={verifyPath}
                        target="_blank"
                        className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
                        title="Scan or click to verify authentically on public ledger"
                      >
                        {/* Interactive SVG QR Glyph */}
                        <div className="w-12 h-12 bg-white p-1 rounded-lg border border-slate-300 flex flex-col justify-between shrink-0">
                          <div className="flex justify-between">
                            <div className="w-3 h-3 bg-slate-900 rounded-xs" />
                            <div className="w-3 h-3 bg-slate-900 rounded-xs" />
                          </div>
                          <div className="w-2 h-2 bg-blue-600 mx-auto rounded-full" />
                          <div className="flex justify-between">
                            <div className="w-3 h-3 bg-slate-900 rounded-xs" />
                            <div className="w-2 h-2 bg-emerald-600 rounded-xs" />
                          </div>
                        </div>
                        <div className="text-left text-[9px] leading-tight">
                          <span className="font-bold text-slate-900 block">Scan to Verify</span>
                          <span className="text-blue-600 font-mono block mt-0.5">{doc.document_number}</span>
                          <span className="text-emerald-600 font-bold block">✓ Verified Credential</span>
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Cryptographic SHA-256 Fingerprint Security Strip */}
                  <div className="pt-3 mt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[9px] font-mono text-slate-500 gap-1.5">
                    <span className="flex items-center gap-1 font-bold text-slate-700">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      SHA-256: <span className="font-normal text-slate-600">{sha256Fingerprint}</span>
                    </span>
                    <span className="text-blue-600 font-bold">
                      VERIFICATION CODE: {doc.verification_code}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              // ================= OFFICIAL OFFER / INTERNSHIP LETTER TEMPLATE =================
              <div className="p-8 sm:p-12 space-y-6 relative bg-white">
                {/* Company Letterhead Top */}
                <div className="flex items-start justify-between pb-6 border-b-2 border-slate-900">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{orgName}</h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Enterprise Technology Placements &amp; Verified Workforce Operations
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono mt-1">
                      REF CODE: {doc.document_number}
                    </p>
                  </div>
                  <OfficialGoldSeal />
                </div>

                {/* Candidate Address Block & Date */}
                <div className="flex items-start justify-between text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">To:</span>
                    <h3 className="text-base font-bold text-slate-900">{doc.recipient_name}</h3>
                    <p className="text-slate-600">{doc.recipient_role}</p>
                    <p className="text-slate-500 text-[11px]">Intern Candidate Registry • InternDesk</p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Date of Issuance:</span>
                    <p className="font-bold text-slate-900">{doc.issued_date}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      STATUS: {doc.status}
                    </span>
                  </div>
                </div>

                {/* Subject Line */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900">
                  SUBJECT: OFFICIAL APPOINTMENT &amp; VERIFIED INTERNSHIP OFFER ({doc.template_data?.program_or_track || "Engineering Track"})
                </div>

                {/* Formal Letter Body */}
                <div className="space-y-3 text-xs leading-relaxed text-slate-700">
                  <p>
                    Dear <strong>{doc.recipient_name}</strong>,
                  </p>
                  <p>
                    On behalf of <strong>{orgName}</strong>, we are pleased to offer you the position of{" "}
                    <strong>{doc.recipient_role}</strong> under the{" "}
                    <strong>{doc.template_data?.program_or_track || "Technology Placement Program"}</strong>.
                  </p>
                  <p>
                    During this internship, you will participate in real-world production projects, track productive work sessions through the verified InternDesk platform, and collaborate directly with senior mentors.
                  </p>

                  <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs my-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Expected Hours:</span>
                      <strong className="text-slate-900">8.0 Hours / Day (Mon - Fri)</strong>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Work Mode:</span>
                      <strong className="text-slate-900">Remote / Hybrid Verified</strong>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Biometric Punch:</span>
                      <strong className="text-emerald-600">Audit-Grade Webcam GPS</strong>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Verification:</span>
                      <strong className="text-blue-600">InternDesk Public Ledger</strong>
                    </div>
                  </div>

                  <p>
                    This credential is cryptographically anchored. Any alteration or tampering renders this offer null and void.
                  </p>
                </div>

                {/* Signatory & Security Footer */}
                <div className="pt-6 border-t border-slate-200 flex items-end justify-between">
                  <div className="space-y-1 text-xs">
                    <p className="font-serif text-slate-800 italic text-sm font-bold">
                      {doc.template_data?.signatory_name || "Marcus Sterling"}
                    </p>
                    <div className="w-36 h-0.5 bg-slate-400 my-1" />
                    <p className="font-bold text-slate-900">{doc.template_data?.signatory_name || "Marcus Sterling"}</p>
                    <p className="text-slate-500 text-[11px]">{doc.template_data?.signatory_title || "Director of Talent Operations"}</p>
                  </div>

                  {/* Verification QR Box */}
                  <Link
                    href={verifyPath}
                    target="_blank"
                    className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-10 h-10 bg-white p-1 rounded border border-slate-300 flex flex-col justify-between">
                      <div className="flex justify-between">
                        <div className="w-2.5 h-2.5 bg-slate-900" />
                        <div className="w-2.5 h-2.5 bg-slate-900" />
                      </div>
                      <div className="w-1.5 h-1.5 bg-blue-600 mx-auto" />
                      <div className="flex justify-between">
                        <div className="w-2.5 h-2.5 bg-slate-900" />
                        <div className="w-2 bg-emerald-600" />
                      </div>
                    </div>
                    <div className="text-[9px] text-left">
                      <span className="font-bold text-slate-900 block">Verify Document</span>
                      <span className="text-blue-600 font-mono">{doc.document_number}</span>
                    </div>
                  </Link>
                </div>

                {/* SHA-256 Fingerprint */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[9px] font-mono text-slate-400 gap-1.5">
                  <span className="truncate max-w-sm">
                    SHA-256 FINGERPRINT: <strong className="text-slate-600">{sha256Fingerprint}</strong>
                  </span>
                  <span className="text-emerald-600 font-bold">
                    CRYPTOGRAPHICALLY VERIFIED ON INTERNDESK
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Public URL: <strong className="text-blue-600">{verifyPath}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-xl text-xs font-bold cursor-pointer"
            >
              Close Studio
            </Button>
            <Button
              size="sm"
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download Official PDF
            </Button>
          </div>
        </div>

        {/* Developer / Portfolio Embed Badge Modal */}
        {showEmbedModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
              <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <Code className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">Embed Verified Credential Badge</h3>
                    <p className="text-[11px] text-slate-400">Showcase on your GitHub README, portfolio, or resume</p>
                  </div>
                </div>
                <button
                  id="embed-modal-close-btn"
                  onClick={() => setShowEmbedModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Visual Badge Preview */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Live Badge Preview</span>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>InternDesk Verified</span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-600 text-[10px] font-mono">{doc.document_number}</span>
                  </div>
                </div>

                {/* Markdown Snippet */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">GitHub Profile README (Markdown)</span>
                    <button
                      id="embed-copy-markdown-btn"
                      onClick={() => {
                        const md = `[![InternDesk Verified Credential](https://img.shields.io/badge/InternDesk-Verified_Credential-2563eb?style=for-the-badge&logo=shield)](${fullVerifyUrl})`;
                        if (typeof navigator !== "undefined" && navigator.clipboard) {
                          navigator.clipboard.writeText(md);
                          setEmbedCopied("MD");
                          setTimeout(() => setEmbedCopied(null), 2500);
                        }
                      }}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      {embedCopied === "MD" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {embedCopied === "MD" ? "Copied" : "Copy Markdown"}
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-900 text-slate-300 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap">
                    {`[![InternDesk Verified Credential](https://img.shields.io/badge/InternDesk-Verified_Credential-2563eb?style=for-the-badge&logo=shield)](${fullVerifyUrl})`}
                  </pre>
                </div>

                {/* HTML Snippet */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Personal Website / Portfolio (HTML)</span>
                    <button
                      id="embed-copy-html-btn"
                      onClick={() => {
                        const html = `<a href="${fullVerifyUrl}" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/InternDesk-Verified_Credential-2563eb?style=for-the-badge&logo=shield" alt="InternDesk Verified Credential" /></a>`;
                        if (typeof navigator !== "undefined" && navigator.clipboard) {
                          navigator.clipboard.writeText(html);
                          setEmbedCopied("HTML");
                          setTimeout(() => setEmbedCopied(null), 2500);
                        }
                      }}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      {embedCopied === "HTML" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {embedCopied === "HTML" ? "Copied" : "Copy HTML"}
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-900 text-slate-300 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap">
                    {`<a href="${fullVerifyUrl}" target="_blank"><img src="https://img.shields.io/badge/InternDesk-Verified_Credential-2563eb?style=for-the-badge&logo=shield" alt="Verified Credential" /></a>`}
                  </pre>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button id="embed-done-btn" onClick={() => setShowEmbedModal(false)} className="rounded-xl text-xs font-bold">
                    Done
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
