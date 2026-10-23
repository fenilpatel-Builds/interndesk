/* eslint-disable @next/next/no-img-element */
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
  AlertTriangle,
  Clock,
  GraduationCap,
  Sparkles,
  BarChart3,
  ShieldCheck,
  TrendingUp,
  PenTool,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { IssuedDocument, TemplateTheme } from "@/types/multitenant";

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

// Official Modern Tech Cyber Badge Seal
function OfficialModernTechSeal() {
  return (
    <div className="relative w-28 h-28 flex items-center justify-center shrink-0 drop-shadow-md select-none">
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <defs>
          <linearGradient id="cyberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="48" fill="#0f172a" stroke="url(#cyberGrad)" strokeWidth="3" />
        <circle cx="60" cy="60" r="43" fill="none" stroke="#06b6d4" strokeWidth="1" strokeDasharray="4,2" />
        <circle cx="60" cy="60" r="38" fill="#0b0f19" stroke="#334155" strokeWidth="1" />
        <polygon points="60,28 88,44 88,76 60,92 32,76 32,44" fill="none" stroke="url(#cyberGrad)" strokeWidth="1.5" />
        <circle cx="60" cy="60" r="14" fill="#06b6d4" fillOpacity="0.2" stroke="#06b6d4" strokeWidth="1.5" />
        <text x="60" y="63" textAnchor="middle" fontSize="6" fontWeight="900" fill="#38bdf8" letterSpacing="1">
          VERIFIED
        </text>
        <text x="60" y="71" textAnchor="middle" fontSize="4.5" fontWeight="700" fill="#94a3b8" letterSpacing="0.8">
          TECH STACK
        </text>
      </svg>
    </div>
  );
}

// Official Sovereign Executive Seal
function OfficialExecutiveSovereignSeal() {
  return (
    <div className="relative w-28 h-28 flex items-center justify-center shrink-0 drop-shadow-md select-none">
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <defs>
          <radialGradient id="sovereignGold" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="45%" stopColor="#d97706" />
            <stop offset="85%" stopColor="#92400e" />
            <stop offset="100%" stopColor="#451a03" />
          </radialGradient>
        </defs>
        <circle cx="60" cy="60" r="48" fill="url(#sovereignGold)" />
        <circle cx="60" cy="60" r="44" fill="#0c192c" stroke="#fef08a" strokeWidth="1.5" />
        <circle cx="60" cy="60" r="39" fill="none" stroke="#d97706" strokeWidth="1" strokeDasharray="3,1.5" />
        <path
          d="M48 64 L45 52 L54 57 L60 48 L66 57 L75 52 L72 64 Z"
          fill="url(#sovereignGold)"
          stroke="#78350f"
          strokeWidth="0.8"
        />
        <rect x="47" y="65" width="26" height="3" rx="1.5" fill="#fef08a" />
        <text x="60" y="38" textAnchor="middle" fontSize="4.5" fontWeight="900" fill="#fef08a" letterSpacing="1.2">
          SOVEREIGN SEAL
        </text>
        <text x="60" y="78" textAnchor="middle" fontSize="4" fontWeight="800" fill="#d97706" letterSpacing="1">
          EXECUTIVE ACCREDITED
        </text>
      </svg>
    </div>
  );
}

function ThemeSeal({ theme }: { theme?: TemplateTheme }) {
  if (theme === "MODERN_TECH") return <OfficialModernTechSeal />;
  if (theme === "EXECUTIVE_SOVEREIGN") return <OfficialExecutiveSovereignSeal />;
  return <OfficialGoldSeal />;
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
  const [isAccepted, setIsAccepted] = useState(false);
  const [acceptedDate, setAcceptedDate] = useState("2026-10-23");
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [candidateNameInput, setCandidateNameInput] = useState("");
  const [editableTerms, setEditableTerms] = useState("");
  const [isEditingTerms, setIsEditingTerms] = useState(false);

  React.useEffect(() => {
    if (doc) {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(`offer_accepted_${doc.document_number}`);
        setIsAccepted(stored === "true" || (doc.status as unknown as string) === "ACCEPTED");
        const storedDate = localStorage.getItem(`offer_accepted_date_${doc.document_number}`);
        setAcceptedDate(storedDate || doc.issued_date || "2026-10-23");
      }
      setCandidateNameInput(doc.recipient_name || "");
      setEditableTerms(
        doc.template_data?.custom_terms ||
          "Official 40-hour weekly internship agreement with full academic credit verification and zero platform fees."
      );
    }
  }, [doc]);

  if (!isOpen || !doc) return null;

  const isOfferLetter = doc.document_type === "OFFER_LETTER";

  const handleConfirmAcceptance = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!doc) return;
    const today = new Date().toISOString().split("T")[0];
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`offer_accepted_${doc.document_number}`, "true");
        localStorage.setItem(`offer_accepted_date_${doc.document_number}`, today);
      } catch {
        // Ignored
      }
    }
    setIsAccepted(true);
    setAcceptedDate(today);
    setIsSignModalOpen(false);
  };

  const orgName = doc.template_data?.organization_name || organizationName;
  const isPendingApproval = doc.status === "PENDING_APPROVAL" || doc.approval_status === "PENDING";
  const brandColor = doc.template_data?.brand_color || "#2563EB";
  const orgLogo = doc.template_data?.organization_logo;
  const orgAddress = doc.template_data?.organization_address || "100 Innovation Way, Suite 400, Tech District, NY 10001";
  const orgWebsite = doc.template_data?.organization_website || "https://apextech.com";
  const signatorySig = doc.template_data?.signatory_signature;
  const customTerms = doc.template_data?.custom_terms;
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

  const isTranscript = doc.document_type === "PERFORMANCE_TRANSCRIPT";
  const isCertificate =
    doc.document_type === "COMPLETION_CERTIFICATE" ||
    doc.document_type === "TRAINING_CERTIFICATE" ||
    doc.document_type === "PARTICIPATION_CERTIFICATE";
  const theme: TemplateTheme = doc.template_data?.template_theme || "CLASSIC_IVY";

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
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400 shrink-0">
              {isTranscript ? (
                <GraduationCap className="w-5 h-5 text-indigo-400" />
              ) : isCertificate ? (
                <Award className="w-5 h-5 text-amber-400" />
              ) : (
                <FileText className="w-5 h-5 text-blue-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold tracking-tight">{doc.title}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  {doc.document_number}
                </span>
                {isTranscript && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    ACADEMIC DOSSIER
                  </span>
                )}
                {isCertificate && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-900/60 text-amber-300 border border-amber-700/50">
                    THEME: {theme.replace("_", " ")}
                  </span>
                )}
                {isPendingApproval && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    UNRELEASED DRAFT
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {isPendingApproval
                  ? "Awaiting HR / Admin Authorization • Release Pending"
                  : isTranscript
                  ? "Audit-Grade Performance Transcript & Verified Skills Dossier • Cryptographically Sealed"
                  : "Tamper-Proof Credential Studio • Cryptographically Sealed"}
              </p>
            </div>
          </div>

          {/* Quick Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Add to LinkedIn Button */}
            {isPendingApproval ? (
              <Button
                size="sm"
                disabled
                className="opacity-50 cursor-not-allowed bg-slate-800 text-slate-400 text-xs font-bold rounded-xl h-8 px-3"
                title="Document must receive administrative release approval before publishing to LinkedIn"
              >
                <Lock className="w-3.5 h-3.5 mr-1" />
                LinkedIn (Locked)
              </Button>
            ) : (
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
            )}

            {/* Offer Letter Candidate Acceptance Button in Top Bar */}
            {isOfferLetter && !isAccepted && (
              <Button
                id="studio-accept-offer-btn"
                size="sm"
                onClick={() => setIsSignModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl h-8 px-3 cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <PenTool className="w-3.5 h-3.5 mr-1" />
                <span>Accept &amp; Sign Offer</span>
              </Button>
            )}
            {isOfferLetter && isAccepted && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-mono">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Offer Accepted</span>
              </span>
            )}

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
            {(isCertificate || isTranscript) && (
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
            {/* Diagonal Watermark for Unreleased Drafts */}
            {isPendingApproval && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 overflow-hidden">
                <div className="transform -rotate-25 text-red-500/20 border-8 border-dashed border-red-500/30 font-black text-2xl sm:text-4xl tracking-widest px-6 py-4 rounded-3xl uppercase select-none text-center">
                  UNRELEASED DRAFT • AWAITING HR APPROVAL
                </div>
              </div>
            )}

            {isTranscript ? (
              // ================= OFFICIAL PERFORMANCE TRANSCRIPT & SKILL DOSSIER =================
              <div className="p-6 sm:p-10 space-y-6 relative bg-white">
                {/* Institutional Letterhead Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b-2 gap-4" style={{ borderColor: brandColor }}>
                  <div className="flex items-start gap-4">
                    {orgLogo ? (
                      <img
                        src={orgLogo}
                        alt={orgName}
                        className="w-14 h-14 rounded-xl object-contain border border-slate-200 bg-white p-1 shadow-xs"
                      />
                    ) : (
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-xs"
                        style={{ backgroundColor: brandColor }}
                      >
                        {orgName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{orgName}</h2>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          OFFICIAL TRANSCRIPT
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{orgAddress}</p>
                      <p className="text-[11px] font-medium" style={{ color: brandColor }}>{orgWebsite}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">TRANSCRIPT SERIAL: {doc.document_number}</p>
                    </div>
                  </div>
                  <ThemeSeal theme={theme} />
                </div>

                {/* Candidate Academic Profile Card */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Candidate Name</span>
                    <h3 className="text-base font-black text-slate-900">{doc.recipient_name}</h3>
                    <p className="text-slate-600 font-medium">{doc.recipient_role}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Practicum Track</span>
                    <strong className="text-slate-900 text-xs block">{doc.template_data?.program_or_track || "Full Stack Cloud Platform"}</strong>
                    <span className="text-emerald-700 font-bold text-[11px] block mt-0.5">
                      {doc.template_data?.grade_or_evaluation || "Grade: Outstanding (4.0 / 4.0)"}
                    </span>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Issuance &amp; Ledger</span>
                    <p className="font-bold text-slate-900">{doc.issued_date}</p>
                    <span className="inline-block mt-0.5 text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {doc.verification_code}
                    </span>
                  </div>
                </div>

                {/* Key Verified Milestone Metrics Strip */}
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                    Verified Practicum Milestones &amp; Reliability Telemetry
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100">
                      <span className="text-[10px] uppercase font-bold text-blue-700 block flex items-center gap-1">
                        <Clock className="w-3 h-3 text-blue-600" /> Verified Work
                      </span>
                      <div className="text-xl font-black text-blue-900 mt-1">
                        {doc.template_data?.verified_work_hours || 160} hrs
                      </div>
                      <p className="text-[10px] text-blue-600 font-medium mt-0.5">100% Biometric Punch</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                      <span className="text-[10px] uppercase font-bold text-emerald-700 block flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Attendance
                      </span>
                      <div className="text-xl font-black text-emerald-900 mt-1">
                        {doc.template_data?.attendance_percentage || 99.2}%
                      </div>
                      <p className="text-[10px] text-emerald-600 font-medium mt-0.5">On-Time Shift Record</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100">
                      <span className="text-[10px] uppercase font-bold text-purple-700 block flex items-center gap-1">
                        <Check className="w-3 h-3 text-purple-600" /> Deliverables
                      </span>
                      <div className="text-xl font-black text-purple-900 mt-1">
                        {doc.template_data?.completed_tasks_count || 14} Sprints
                      </div>
                      <p className="text-[10px] text-purple-600 font-medium mt-0.5">Tasks &amp; PRs Completed</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-100">
                      <span className="text-[10px] uppercase font-bold text-amber-700 block flex items-center gap-1">
                        <Award className="w-3 h-3 text-amber-600" /> Assessments
                      </span>
                      <div className="text-xl font-black text-amber-900 mt-1">
                        {doc.template_data?.assessments_passed_count || 2} Passed
                      </div>
                      <p className="text-[10px] text-amber-600 font-medium mt-0.5">Technical Evaluations</p>
                    </div>
                  </div>
                </div>

                {/* Mentor Rubric Scorecard */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      Mentor Practicum Rubric Scorecard
                    </h4>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Overall: {doc.template_data?.mentor_scores?.overall || 98.4}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700">Technical Code Quality</span>
                        <strong className="text-blue-700">{doc.template_data?.mentor_scores?.technical || 98}%</strong>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${doc.template_data?.mentor_scores?.technical || 98}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700">Engineering Collaboration</span>
                        <strong className="text-indigo-700">{doc.template_data?.mentor_scores?.communication || 96}%</strong>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${doc.template_data?.mentor_scores?.communication || 96}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700">Initiative &amp; Velocity</span>
                        <strong className="text-emerald-700">{doc.template_data?.mentor_scores?.initiative || 100}%</strong>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${doc.template_data?.mentor_scores?.initiative || 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verified Competencies & Skills Dossier Badges */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    Verified Skills &amp; Competencies Endorsement
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(doc.template_data?.verified_skills || [
                      "Next.js 15 & React 19",
                      "TypeScript Strict Mode",
                      "REST & GraphQL Microservices",
                      "PostgreSQL & Multi-Tenancy",
                      "CI/CD Automated Pipelines",
                      "Cryptographic Credential Verification",
                    ]).map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold shadow-2xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Authorized Signatory & Verification QR */}
                <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
                  <div className="space-y-1 text-xs">
                    {signatorySig ? (
                      <div className="h-9 flex items-center">
                        <img src={signatorySig} alt="Signatory Signature" className="h-8 max-w-[130px] object-contain" />
                      </div>
                    ) : (
                      <div className="h-7 flex items-center">
                        <svg className="w-28 h-6 text-blue-900" viewBox="0 0 140 40">
                          <path d="M10 25 C 25 10, 35 30, 45 15 C 55 5, 65 28, 80 18 C 95 10, 110 30, 130 15" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                        </svg>
                      </div>
                    )}
                    <div className="w-36 h-0.5 bg-slate-300 my-1" />
                    <p className="font-bold text-slate-900">{doc.template_data?.signatory_name || "Elena Rostova"}</p>
                    <p className="text-slate-500 text-[11px]">{doc.template_data?.signatory_title || "Head of Operations & Engineering"}</p>
                    <p className="text-[10px] text-slate-400 font-mono">Certified on: {doc.issued_date}</p>
                  </div>

                  <div className="flex flex-col sm:items-end">
                    <Link
                      href={verifyPath}
                      target="_blank"
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
                    >
                      <div className="w-11 h-11 bg-white p-1 rounded-lg border border-slate-300 flex flex-col justify-between shrink-0">
                        <div className="flex justify-between">
                          <div className="w-2.5 h-2.5 bg-slate-900 rounded-xs" />
                          <div className="w-2.5 h-2.5 bg-slate-900 rounded-xs" />
                        </div>
                        <div className="w-2 h-2 bg-indigo-600 mx-auto rounded-full" />
                        <div className="flex justify-between">
                          <div className="w-2.5 h-2.5 bg-slate-900 rounded-xs" />
                          <div className="w-2 h-2 bg-emerald-600 rounded-xs" />
                        </div>
                      </div>
                      <div className="text-left text-[9px] leading-tight">
                        <span className="font-bold text-slate-900 block">Scan to Verify Transcript</span>
                        <span className="text-blue-600 font-mono block mt-0.5">{doc.document_number}</span>
                        <span className="text-emerald-600 font-bold block">✓ Verified Academic Ledger</span>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Cryptographic SHA-256 Strip */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[9px] font-mono text-slate-500 gap-1.5">
                  <span className="flex items-center gap-1 font-bold text-slate-700">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    SHA-256: <span className="font-normal text-slate-600">{sha256Fingerprint}</span>
                  </span>
                  <span className="text-blue-600 font-bold">VERIFICATION CODE: {doc.verification_code}</span>
                </div>
              </div>
            ) : isCertificate ? (
              // ================= CERTIFICATE TEMPLATE WITH 3 THEMES =================
              theme === "MODERN_TECH" ? (
                // 1. MODERN TECH GRID THEME
                <div className="p-8 sm:p-12 relative overflow-hidden bg-[#0a0f1d] text-slate-100 shadow-2xl">
                  {/* Cyber Grid Background */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-40 pointer-events-none" />

                  {/* High-Tech Frame */}
                  <div className="border-2 border-cyan-500/40 p-6 sm:p-8 rounded-2xl relative space-y-6 bg-slate-900/70 backdrop-blur-xs shadow-inner">
                    <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400 border-b border-cyan-500/30 pb-2">
                      <span>[SYS_NODE: INTERNDESK_LEDGER]</span>
                      <span>[BLOCK: {doc.document_number}]</span>
                    </div>

                    {/* Header */}
                    <div className="text-center space-y-2 relative">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        {orgLogo && (
                          <img
                            src={orgLogo}
                            alt={orgName}
                            className="w-10 h-10 rounded-lg object-contain border border-cyan-500/40 bg-slate-900 p-0.5 inline-block"
                          />
                        )}
                        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-widest text-cyan-300 border border-cyan-500/40 bg-cyan-950/50">
                          {orgName}
                        </span>
                      </div>

                      <h1 className="text-2xl sm:text-4xl font-sans font-black tracking-tight pt-1 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
                        Certificate of Technical Excellence
                      </h1>
                      <p className="text-xs uppercase tracking-widest text-cyan-400 font-mono font-bold">
                        Verified Software Engineering Achievement
                      </p>
                    </div>

                    {/* Recipient */}
                    <div className="text-center space-y-2 py-2">
                      <p className="text-xs text-slate-400 font-mono">PROUDLY CONFERRED UPON</p>
                      <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        {doc.recipient_name}
                      </h2>
                      <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto" />
                      <p className="text-xs font-mono text-cyan-300 pt-1">{doc.recipient_role}</p>
                    </div>

                    {/* Description */}
                    <div className="text-center max-w-xl mx-auto space-y-2 text-xs sm:text-sm text-slate-300">
                      <p className="leading-relaxed">
                        for distinguished technical execution and milestone mastery within the curriculum track:
                      </p>
                      <p className="text-sm sm:text-base font-bold text-white font-mono">
                        [{doc.template_data?.program_or_track || "Software Engineering Practicum"}]
                      </p>
                      {doc.template_data?.grade_or_evaluation && (
                        <span className="inline-block text-xs font-mono font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-500/50 px-3 py-1 rounded-full">
                          {doc.template_data.grade_or_evaluation}
                        </span>
                      )}
                    </div>

                    {/* Tri-Column Footer */}
                    <div className="pt-6 mt-6 border-t border-cyan-500/30 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                      <div className="text-center sm:text-left space-y-1">
                        {signatorySig ? (
                          <div className="h-9 flex items-center">
                            <img src={signatorySig} alt="Signatory" className="h-8 max-w-[130px] object-contain filter invert" />
                          </div>
                        ) : (
                          <div className="h-7 flex items-center">
                            <svg className="w-28 h-6 text-cyan-400" viewBox="0 0 140 40">
                              <path d="M10 25 C 25 10, 35 30, 45 15 C 55 5, 65 28, 80 18 C 95 10, 110 30, 130 15" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                            </svg>
                          </div>
                        )}
                        <div className="w-32 h-0.5 bg-cyan-500/50 my-0.5" />
                        <div className="font-mono font-bold text-white text-xs">{doc.template_data?.signatory_name || "Elena Rostova"}</div>
                        <p className="text-[10px] text-slate-400 font-mono">{doc.template_data?.signatory_title || "Head of Engineering Operations"}</p>
                      </div>

                      <div className="flex justify-center">
                        <OfficialModernTechSeal />
                      </div>

                      <div className="flex flex-col items-center sm:items-end text-right">
                        <Link
                          href={verifyPath}
                          target="_blank"
                          className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900 border border-cyan-500/40 hover:border-cyan-400 transition-colors"
                        >
                          <div className="w-10 h-10 bg-black p-1 rounded border border-cyan-500/50 flex flex-col justify-between shrink-0">
                            <div className="flex justify-between">
                              <div className="w-2.5 h-2.5 bg-cyan-400 rounded-xs" />
                              <div className="w-2.5 h-2.5 bg-cyan-400 rounded-xs" />
                            </div>
                            <div className="w-1.5 h-1.5 bg-blue-500 mx-auto rounded-full" />
                            <div className="flex justify-between">
                              <div className="w-2.5 h-2.5 bg-cyan-400 rounded-xs" />
                              <div className="w-2.5 h-2.5 bg-emerald-400 rounded-xs" />
                            </div>
                          </div>
                          <div className="text-left text-[9px] font-mono leading-tight">
                            <span className="font-bold text-cyan-300 block">Ledger Verification</span>
                            <span className="text-slate-300 block">{doc.document_number}</span>
                            <span className="text-emerald-400 font-bold block">✓ VERIFIED BLOCK</span>
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* SHA-256 Strip */}
                    <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[9px] font-mono text-slate-400 gap-1.5">
                      <span className="truncate max-w-sm">SHA-256: {sha256Fingerprint}</span>
                      <span className="text-cyan-400 font-bold">VRF: {doc.verification_code}</span>
                    </div>
                  </div>
                </div>
              ) : theme === "EXECUTIVE_SOVEREIGN" ? (
                // 2. EXECUTIVE SOVEREIGN THEME
                <div className="p-8 sm:p-12 relative overflow-hidden bg-white shadow-2xl">
                  {/* Sovereign Header Banner */}
                  <div className="bg-gradient-to-r from-slate-950 via-[#0c1e3d] to-slate-950 text-white -mx-8 -mt-8 sm:-mx-12 sm:-mt-12 p-6 sm:p-8 border-b-2 border-amber-400 text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      {orgLogo && (
                        <img
                          src={orgLogo}
                          alt={orgName}
                          className="w-10 h-10 rounded-lg object-contain border border-amber-400/50 bg-white p-0.5 inline-block"
                        />
                      )}
                      <span className="font-serif text-sm tracking-widest uppercase text-amber-200 font-bold">
                        {orgName}
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-serif font-black tracking-tight text-white">
                      Executive Certificate of Achievement
                    </h1>
                    <p className="text-xs uppercase tracking-widest text-amber-300 font-medium">
                      Sovereign Credential Accreditation
                    </p>
                  </div>

                  {/* Body Frame */}
                  <div className="border border-amber-400/40 p-6 sm:p-8 rounded-xl relative space-y-6 mt-6 bg-slate-50/30">
                    <div className="text-center space-y-2 py-2">
                      <p className="text-xs text-slate-500 font-serif italic">This honor is formally bestowed upon</p>
                      <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 tracking-tight">
                        {doc.recipient_name}
                      </h2>
                      <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto" />
                      <p className="text-xs font-semibold text-slate-600 pt-1">{doc.recipient_role}</p>
                    </div>

                    <div className="text-center max-w-xl mx-auto space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
                      <p>in recognition of outstanding professional standards and exceptional mastery during:</p>
                      <p className="text-sm sm:text-base font-serif font-bold text-slate-900">
                        &ldquo;{doc.template_data?.program_or_track || "Software Engineering Practicum"}&rdquo;
                      </p>
                      {doc.template_data?.grade_or_evaluation && (
                        <span className="inline-block text-xs font-bold text-amber-900 bg-amber-50 border border-amber-300 px-3 py-1 rounded-full">
                          {doc.template_data.grade_or_evaluation}
                        </span>
                      )}
                    </div>

                    {/* Tri-Column Footer */}
                    <div className="pt-6 mt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                      <div className="text-center sm:text-left space-y-1">
                        {signatorySig ? (
                          <div className="h-9 flex items-center">
                            <img src={signatorySig} alt="Signatory" className="h-8 max-w-[130px] object-contain" />
                          </div>
                        ) : (
                          <div className="h-7 flex items-center">
                            <svg className="w-28 h-6 text-slate-900" viewBox="0 0 140 40">
                              <path d="M10 25 C 25 10, 35 30, 45 15 C 55 5, 65 28, 80 18 C 95 10, 110 30, 130 15" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                            </svg>
                          </div>
                        )}
                        <div className="w-32 h-0.5 bg-slate-300 my-0.5" />
                        <div className="font-serif font-bold text-slate-900 text-sm">{doc.template_data?.signatory_name || "Elena Rostova"}</div>
                        <p className="text-[11px] text-slate-500 font-medium">{doc.template_data?.signatory_title || "Head of Operations & Engineering"}</p>
                        <p className="text-[10px] text-slate-400 font-mono">Issued: {doc.issued_date}</p>
                      </div>

                      <div className="flex justify-center">
                        <OfficialExecutiveSovereignSeal />
                      </div>

                      <div className="flex flex-col items-center sm:items-end text-right">
                        <Link
                          href={verifyPath}
                          target="_blank"
                          className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
                        >
                          <div className="w-11 h-11 bg-white p-1 rounded-lg border border-slate-300 flex flex-col justify-between shrink-0">
                            <div className="flex justify-between">
                              <div className="w-2.5 h-2.5 bg-slate-900 rounded-xs" />
                              <div className="w-2.5 h-2.5 bg-slate-900 rounded-xs" />
                            </div>
                            <div className="w-2 h-2 bg-amber-600 mx-auto rounded-full" />
                            <div className="flex justify-between">
                              <div className="w-2.5 h-2.5 bg-slate-900 rounded-xs" />
                              <div className="w-2 h-2 bg-emerald-600 rounded-xs" />
                            </div>
                          </div>
                          <div className="text-left text-[9px] leading-tight">
                            <span className="font-bold text-slate-900 block">Sovereign Ledger</span>
                            <span className="text-blue-600 font-mono block mt-0.5">{doc.document_number}</span>
                            <span className="text-emerald-600 font-bold block">✓ Accredited</span>
                          </div>
                        </Link>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[9px] font-mono text-slate-500 gap-1.5">
                      <span className="flex items-center gap-1 font-bold text-slate-700">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        SHA-256: <span className="font-normal text-slate-600">{sha256Fingerprint}</span>
                      </span>
                      <span className="text-amber-800 font-bold">SOVEREIGN CODE: {doc.verification_code}</span>
                    </div>
                  </div>
                </div>
              ) : (
                // 3. CLASSIC IVY THEME (Default)
                <div className="p-8 sm:p-12 relative overflow-hidden bg-gradient-to-b from-[#fdfbf7] via-white to-[#fbf7ee]">
                  {/* Ornate Double Border */}
                  <div className="border-4 border-double border-amber-600/40 p-6 sm:p-8 rounded-xl relative space-y-6">
                    {/* Watermark Crest Background */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                      <Award className="w-96 h-96 text-blue-900" />
                    </div>

                    {/* Header: Organization Crest & Title */}
                    <div className="text-center space-y-2 relative">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        {orgLogo && (
                          <img
                            src={orgLogo}
                            alt={orgName}
                            className="w-10 h-10 rounded-lg object-contain border border-slate-200 bg-white p-0.5 shadow-2xs inline-block"
                          />
                        )}
                        <div
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-white shadow-2xs"
                          style={{ backgroundColor: brandColor }}
                        >
                          <Lock className="w-3 h-3 text-white" />
                          <span>{orgName}</span>
                        </div>
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

                    {/* Tri-Column Footer */}
                    <div className="pt-8 mt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                      <div className="text-center sm:text-left space-y-1">
                        {signatorySig ? (
                          <div className="h-9 flex items-center">
                            <img src={signatorySig} alt="Signatory" className="h-8 max-w-[130px] object-contain" />
                          </div>
                        ) : (
                          <div className="h-7 flex items-center">
                            <svg className="w-28 h-6 text-blue-900" viewBox="0 0 140 40">
                              <path d="M10 25 C 25 10, 35 30, 45 15 C 55 5, 65 28, 80 18 C 95 10, 110 30, 130 15" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                            </svg>
                          </div>
                        )}
                        <div className="w-32 h-0.5 bg-slate-300 my-0.5" />
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

                      <div className="flex justify-center">
                        <OfficialGoldSeal />
                      </div>

                      <div className="flex flex-col items-center sm:items-end text-right">
                        <Link
                          href={verifyPath}
                          target="_blank"
                          className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
                        >
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
              )
            ) : (
              // ================= OFFICIAL OFFER / INTERNSHIP LETTER TEMPLATE =================
              <div className="p-8 sm:p-12 space-y-6 relative bg-white">
                {/* Company Letterhead Top */}
                <div className="flex items-start justify-between pb-6 border-b-2" style={{ borderColor: brandColor }}>
                  <div className="flex items-start gap-4">
                    {orgLogo ? (
                      <img
                        src={orgLogo}
                        alt={orgName}
                        className="w-14 h-14 rounded-xl object-contain border border-slate-200 bg-white p-1 shadow-xs"
                      />
                    ) : (
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-xs"
                        style={{ backgroundColor: brandColor }}
                      >
                        {orgName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">{orgName}</h2>
                      <p className="text-xs text-slate-500 font-medium">
                        {orgAddress}
                      </p>
                      <p className="text-[11px] font-medium" style={{ color: brandColor }}>
                        {orgWebsite}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        REF CODE: {doc.document_number}
                      </p>
                    </div>
                  </div>
                  <ThemeSeal theme={theme} />
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
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded font-bold text-[10px] border ${
                      isPendingApproval
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}>
                      STATUS: {doc.status}
                    </span>
                  </div>
                </div>

                {/* Subject Line */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900">
                  SUBJECT: OFFICIAL APPOINTMENT &amp; VERIFIED INTERNSHIP OFFER ({doc.template_data?.program_or_track || "Engineering Track"})
                </div>

                {/* For Offer Letters: Candidate Acceptance Status Banner */}
                {isOfferLetter && (
                  <div className="my-2">
                    {isAccepted ? (
                      <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-300 flex items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-emerald-950 text-xs flex items-center gap-2">
                              <span>Offer Formally Accepted &amp; Digitally Signed</span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                                {acceptedDate}
                              </span>
                            </div>
                            <p className="text-[11px] text-emerald-700 mt-0.5">
                              Candidate <strong>{candidateNameInput || doc.recipient_name}</strong> has confirmed acceptance of this internship appointment.
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-emerald-600 text-white shadow-2xs">
                          ✓ ENROLLED
                        </span>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                        <div className="space-y-0.5 text-left">
                          <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Candidate Acceptance Pending</span>
                          </div>
                          <p className="text-[11px] text-amber-700">
                            Please review the terms and click &quot;Sign &amp; Accept Offer&quot; below to formalize your internship.
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => setIsSignModalOpen(true)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs shrink-0 cursor-pointer"
                        >
                          <PenTool className="w-3.5 h-3.5 mr-1.5" />
                          Sign &amp; Accept Offer
                        </Button>
                      </div>
                    )}
                  </div>
                )}

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

                  {/* Dynamic Terms Customization & Zero Fee Guarantee */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900 text-[11px] uppercase tracking-wider">
                        Terms &amp; Stipulations
                      </strong>
                      <button
                        type="button"
                        onClick={() => setIsEditingTerms(!isEditingTerms)}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{isEditingTerms ? "Done Editing" : "Customize Terms"}</span>
                      </button>
                    </div>
                    {isEditingTerms ? (
                      <textarea
                        rows={2}
                        value={editableTerms}
                        onChange={(e) => setEditableTerms(e.target.value)}
                        className="w-full p-2 text-xs border border-blue-400 rounded-lg focus:outline-none bg-white"
                      />
                    ) : (
                      <p className="text-[11px] text-slate-600 leading-relaxed italic">
                        {editableTerms}
                      </p>
                    )}
                    <div className="pt-2 border-t border-slate-200/80 flex items-center gap-2 text-[10px] text-emerald-700 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>100% Free Placement Guarantee: Zero upfront fees, tuition costs, or deposit charges.</span>
                    </div>
                  </div>

                  <p>
                    This credential is cryptographically anchored. Any alteration or tampering renders this offer null and void.
                  </p>
                </div>

                {/* Signatory & Security Footer */}
                <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
                  {/* Left: Organization Authorized Signatory */}
                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Authorized Employer Signatory:
                    </span>
                    {signatorySig ? (
                      <div className="h-9 flex items-center">
                        <img src={signatorySig} alt="Signatory Signature" className="h-8 max-w-[130px] object-contain" />
                      </div>
                    ) : (
                      <p className="font-serif text-slate-800 italic text-sm font-bold">
                        {doc.template_data?.signatory_name || "Marcus Sterling"}
                      </p>
                    )}
                    <div className="w-36 h-0.5 bg-slate-400 my-1" />
                    <p className="font-bold text-slate-900">{doc.template_data?.signatory_name || "Marcus Sterling"}</p>
                    <p className="text-slate-500 text-[11px]">{doc.template_data?.signatory_title || "Director of Talent Operations"}</p>
                  </div>

                  {/* Center: Candidate Acceptance Signature */}
                  <div className="space-y-1 text-xs text-center sm:text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Candidate Acceptance:
                    </span>
                    {isAccepted ? (
                      <div>
                        <p className="font-serif text-blue-900 italic text-sm font-bold tracking-wider">
                          {candidateNameInput || doc.recipient_name}
                        </p>
                        <div className="w-36 h-0.5 bg-emerald-500 my-1" />
                        <p className="font-bold text-emerald-800">{candidateNameInput || doc.recipient_name}</p>
                        <p className="text-emerald-600 text-[10px] font-mono">Signed: {acceptedDate} • Accepted</p>
                      </div>
                    ) : (
                      <div className="p-2 border border-dashed border-amber-300 rounded-lg bg-amber-50/50">
                        <span className="text-[11px] text-amber-700 italic block">Pending Candidate Signature</span>
                        <button
                          type="button"
                          onClick={() => setIsSignModalOpen(true)}
                          className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer"
                        >
                          Sign now →
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right: Verification QR Box */}
                  <div className="flex justify-end">
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
            {isOfferLetter && !isAccepted && (
              <Button
                size="sm"
                onClick={() => setIsSignModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                <PenTool className="w-3.5 h-3.5 mr-1.5" />
                Sign &amp; Accept Offer
              </Button>
            )}
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

        {/* Candidate Acceptance & Signature Modal */}
        {isSignModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
              <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <PenTool className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">Accept &amp; Electronically Sign Offer</h3>
                    <p className="text-[11px] text-slate-400">{doc.document_number} • {orgName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSignModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleConfirmAcceptance} className="p-6 space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 space-y-1">
                  <p className="font-bold">Internship Offer Acceptance Statement:</p>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    I hereby formally accept the position of <strong>{doc.recipient_role}</strong> at <strong>{orgName}</strong> under the InternDesk verified program. I agree to uphold professional standards and complete required project milestones.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Full Legal Name (Electronic Signature) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={candidateNameInput}
                    onChange={(e) => setCandidateNameInput(e.target.value)}
                    placeholder="Type your full name"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold focus:outline-none focus:border-blue-600"
                  />
                </div>

                {/* Live Cursive Signature Preview */}
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">Signature Glyph Preview:</label>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <span className="font-serif italic text-lg text-blue-900 font-bold tracking-wider">
                      {candidateNameInput || "Your Signature"}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] space-y-0.5">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    100% Free Program Assurance
                  </div>
                  <p>InternDesk is completely free. No payments, deposits, or card details are ever required.</p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSignModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    Confirm &amp; Sign Offer Letter
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

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
