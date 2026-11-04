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
  Share2,
  Copy,
  Check,
  Code,
  X,
} from "lucide-react";
import { DocumentStudioModal } from "@/components/documents/document-studio-modal";
import { IssuedDocument } from "@/types/multitenant";
import { multiTenantStore } from "@/lib/multitenant/store";
import {
  downloadAkashOfferLetterPdf,
  isFemaleCandidate,
  deriveTrackTechnology,
} from "@/lib/documents/akash-pdf-generator";

const STUDENT_DOCUMENTS: IssuedDocument[] = [];

function formatDateOrdinal(isoDate: string): string {
  if (!isoDate) return "";
  try {
    const parts = isoDate.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const suffix =
        day === 1 || day === 21 || day === 31
          ? "st"
          : day === 2 || day === 22
          ? "nd"
          : day === 3 || day === 23
          ? "rd"
          : "th";
      return `${day}${suffix} ${months[monthIdx]} ${year}`;
    }
    return isoDate;
  } catch {
    return isoDate;
  }
}

import { parseClientSessionCookie } from "@/lib/auth/client-session";

export default function StudentDocumentsPage() {
  const [activeTab, setActiveTab] = useState<"ALL" | "OFFER" | "INTERN" | "CERT" | "TRANSCRIPT">("ALL");
  const [selectedStudioDoc, setSelectedStudioDoc] = useState<IssuedDocument | null>(null);
  const [sharingDoc, setSharingDoc] = useState<IssuedDocument | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState(() => parseClientSessionCookie());
  const [studentName, setStudentName] = useState(() => parseClientSessionCookie()?.name || "Fenil Patel");
  const [apiDocs, setApiDocs] = useState<IssuedDocument[]>([]);
  const [internshipRequestStatus, setInternshipRequestStatus] = useState<{
    hasRequested: boolean;
    canRequest: boolean;
    isApproved: boolean;
    letter: IssuedDocument | null;
  } | null>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestMessage, setRequestMessage] = useState<string | null>(null);

  // Form states for Student Offer Letter Request
  const [selectedTrack, setSelectedTrack] = useState("PHP / Laravel Web Development");
  const [customTrack, setCustomTrack] = useState("");
  const [startDate, setStartDate] = useState("2026-07-03");
  const [endDate, setEndDate] = useState("2027-04-30");
  const [salutation, setSalutation] = useState<"Mr." | "Ms.">("Mr.");
  const [purpose, setPurpose] = useState("Academic Practicum & Degree Verification");

  React.useEffect(() => {
    const session = parseClientSessionCookie();
    if (session) {
      setCurrentUser(session);
      if (session.name) setStudentName(session.name);
    }

    let active = true;
    fetch("/api/student/documents")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load"))))
      .then((data) => {
        if (active && Array.isArray(data.documents)) {
          setApiDocs(data.documents);
        }
      })
      .catch(() => {});

    // Check one-time internship letter status
    fetch("/api/student/documents/internship-letter")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load letter status"))))
      .then((data) => {
        if (active && data) {
          const doc = data.document || data.letter || null;
          const isAppr =
            !!data.isApproved ||
            (doc ? doc.status === "ISSUED" || doc.approval_status === "APPROVED" : false);
          setInternshipRequestStatus({
            hasRequested: !!data.hasRequested,
            canRequest: !data.hasRequested,
            isApproved: isAppr,
            letter: doc,
          });
          if (doc) {
            setApiDocs((prev) => {
              if (prev.some((d) => d.id === doc.id || d.document_number === doc.document_number)) {
                return prev.map((d) =>
                  d.id === doc.id || d.document_number === doc.document_number ? doc : d
                );
              }
              return [doc, ...prev];
            });
          }
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const baseDocs = apiDocs.length > 0 ? apiDocs : STUDENT_DOCUMENTS;
  const docsList = baseDocs.map((doc) => {
    let name = studentName || doc.recipient_name;
    if (doc.recipient_name?.startsWith("Mr.") && !name.startsWith("Mr.")) {
      name = `Mr. ${name}`;
    } else if (doc.recipient_name?.startsWith("Ms.") && !name.startsWith("Ms.")) {
      name = `Ms. ${name}`;
    }
    return {
      ...doc,
      recipient_name: name,
    };
  });

  const filteredDocs = docsList.filter((doc) => {
    if (activeTab === "OFFER")
      return doc.document_type === "OFFER_LETTER" || doc.title.toLowerCase().includes("offer");
    if (activeTab === "INTERN")
      return doc.document_type === "INTERNSHIP_LETTER" || doc.title.toLowerCase().includes("internship");
    if (activeTab === "CERT") return doc.document_type === "COMPLETION_CERTIFICATE";
    if (activeTab === "TRANSCRIPT") return doc.document_type === "PERFORMANCE_TRANSCRIPT";
    return true;
  });

  const certificateDoc = docsList.find((d) => d.document_type === "COMPLETION_CERTIFICATE" && d.status === "ISSUED") || docsList[0];

  // LinkedIn Add-to-Profile URL for the certificate
  const certLinkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
    certificateDoc?.title || "Certificate of Internship Excellence"
  )}&organizationName=${encodeURIComponent("Akash Technolabs")}&issueYear=2026&issueMonth=10&certUrl=${encodeURIComponent(
    `https://interndesk.io/verify/${certificateDoc?.document_number || "ID-AKT-2026-CERT01"}`
  )}&certId=${encodeURIComponent(certificateDoc?.document_number || "ID-AKT-2026-CERT01")}`;

  const approvedCount = docsList.filter((d) => d.status === "ISSUED").length;
  const pendingCount = docsList.filter((d) => d.status === "PENDING_APPROVAL").length;

  const handleConfirmInternshipLetterRequest = async () => {
    setIsRequesting(true);
    setRequestMessage(null);
    try {
      const chosenTrack =
        selectedTrack === "OTHER" ? customTrack.trim() || "Information Technology" : selectedTrack;
      const formattedStart = formatDateOrdinal(startDate) || "3rd July 2026";
      const formattedEnd = formatDateOrdinal(endDate) || "30th April 2027";

      const res = await fetch("/api/student/documents/internship-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentEmail: currentUser?.email,
          studentName: studentName,
          salutation,
          technology: chosenTrack,
          commencementDate: formattedStart,
          continueUntilDate: formattedEnd,
          purpose,
        }),
      });
      const data = await res.json();
      if (data.success && data.document) {
        const isAppr =
          data.document.status === "ISSUED" || data.document.approval_status === "APPROVED";
        setInternshipRequestStatus({
          hasRequested: true,
          canRequest: false,
          isApproved: isAppr,
          letter: data.document,
        });
        setApiDocs((prev) => [data.document, ...prev.filter((d) => d.id !== data.document.id)]);
        setShowRequestDialog(false);
      } else {
        setRequestMessage(data.error || "Failed to submit internship letter request");
      }
    } catch {
      setRequestMessage("Network error requesting internship letter.");
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDirectStudentDownload = async (doc: IssuedDocument) => {
    if (doc.document_type === "OFFER_LETTER" || doc.document_type === "INTERNSHIP_LETTER") {
      const isFemale = isFemaleCandidate(doc.recipient_name, (doc.template_data as any)?.salutation);
      const cleanTech = deriveTrackTechnology(
        doc.recipient_role,
        (doc.template_data as any)?.technology || doc.template_data?.program_or_track
      );
      await downloadAkashOfferLetterPdf({
        salutation: isFemale ? "Ms." : "Mr.",
        studentName: doc.recipient_name,
        internshipPosition: doc.recipient_role,
        technology: cleanTech,
        commencementDate: (doc.template_data as any)?.commencement_date || "3rd July 2026",
        continueUntilDate: (doc.template_data as any)?.continue_until_date || "30th April 2027",
        letterDate: doc.issued_date,
        title: doc.document_type === "INTERNSHIP_LETTER" ? "INTERNSHIP APPOINTMENT LETTER" : doc.title,
      });
    } else {
      setSelectedStudioDoc(doc);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      <StudentTopbar title="Documents & Credentials" studentName={studentName} />

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
              <span className="text-xs font-bold text-slate-900 truncate">Akash Technolabs</span>
              <GraduationCap className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-[10px] text-indigo-700 font-medium">Enterprise Verified</p>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 flex-wrap">
          {[
            { id: "ALL", label: "All Documents" },
            { id: "OFFER", label: "Offer Letter" },
            { id: "INTERN", label: "Internship Letter" },
            { id: "CERT", label: "Certificates" },
            { id: "TRANSCRIPT", label: "Performance Transcripts" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "ALL" | "OFFER" | "INTERN" | "CERT" | "TRANSCRIPT")}
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

        {/* One-Time Official Internship Letter Request Banner */}
        {(activeTab === "ALL" || activeTab === "INTERN" || activeTab === "OFFER") && (
          <div
            className={`p-4 sm:p-5 rounded-2xl border text-white shadow-md relative overflow-hidden ${
              internshipRequestStatus?.hasRequested && !internshipRequestStatus?.isApproved
                ? "border-amber-800 bg-gradient-to-r from-slate-900 via-[#1C180B] to-[#3B2C0D]"
                : internshipRequestStatus?.hasRequested && internshipRequestStatus?.isApproved
                ? "border-emerald-800 bg-gradient-to-r from-slate-900 via-[#0B231A] to-[#0A3D28]"
                : "border-slate-800 bg-gradient-to-r from-slate-900 via-[#0B192C] to-[#0F4C81]"
            }`}
          >
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-60 h-60 bg-[#E52329]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  {internshipRequestStatus?.hasRequested && !internshipRequestStatus?.isApproved ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      Pending Admin Approval
                    </span>
                  ) : internshipRequestStatus?.hasRequested && internshipRequestStatus?.isApproved ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Approved &amp; Issued
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-red-500/20 text-red-200 border border-red-500/30">
                      Official Appointment Letter
                    </span>
                  )}
                  <span className="text-[11px] text-slate-300 font-semibold">
                    • Strictly 1 Issuance Per Student
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                  Akash Technolabs Official Internship Offer Letter
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {internshipRequestStatus?.hasRequested && !internshipRequestStatus?.isApproved ? (
                    <>
                      Your internship letter request has been submitted for{" "}
                      <strong className="text-amber-300">
                        {(internshipRequestStatus.letter?.template_data as any)?.technology ||
                          internshipRequestStatus.letter?.recipient_role ||
                          "your selected track"}
                      </strong>{" "}
                      ({((internshipRequestStatus.letter?.template_data as any)?.commencement_date || "Start")} to{" "}
                      {((internshipRequestStatus.letter?.template_data as any)?.continue_until_date || "End")}).
                      The signed letterhead will be unlocked for preview and download immediately once approved by Akash Technolabs Admin.
                    </>
                  ) : internshipRequestStatus?.hasRequested && internshipRequestStatus?.isApproved ? (
                    <>
                      Your official internship appointment letter was verified and approved by CEO Akash Padhiyar on{" "}
                      <strong className="text-emerald-300">{internshipRequestStatus.letter?.issued_date || "record"}</strong>.
                      Under institutional policy, each intern can obtain this letter exactly once.
                    </>
                  ) : (
                    "Request your certified appointment and enrollment letter endorsed by CEO Akash Padhiyar. You can select your technical field and commencement dates. This official document is permitted exactly one time per enrolled student."
                  )}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2 w-full md:w-auto">
                {internshipRequestStatus?.hasRequested && !internshipRequestStatus?.isApproved ? (
                  <div className="px-3.5 py-2 rounded-xl bg-amber-500/20 text-amber-200 border border-amber-500/40 text-xs font-bold flex items-center gap-2 shadow-xs">
                    <Lock className="w-4 h-4 text-amber-300" />
                    <span>Awaiting Admin Verification</span>
                  </div>
                ) : internshipRequestStatus?.hasRequested && internshipRequestStatus?.isApproved ? (
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <Button
                      size="sm"
                      onClick={() =>
                        internshipRequestStatus.letter &&
                        handleDirectStudentDownload(internshipRequestStatus.letter)
                      }
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl h-9 px-4 shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Letter (PDF)</span>
                    </Button>
                    <div className="px-3 py-1.5 rounded-xl bg-white/10 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>1-Time Limit Used</span>
                    </div>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setShowRequestDialog(true)}
                    className="bg-[#E52329] hover:bg-[#C41C22] text-white font-bold text-xs rounded-xl h-9 px-5 shadow-md shadow-red-500/20 transition-transform hover:scale-[1.02] cursor-pointer flex items-center gap-2 w-full md:w-auto justify-center"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Request Internship Letter (1-Time)</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

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
            {filteredDocs.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-slate-200/90 p-12 text-center shadow-2xs space-y-4 my-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-2xs">
                  <Award className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">No documents issued yet</h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                    Your official offer letters, internship certificates, and verified skill transcripts will appear here once approved by Akash Technolabs administration.
                  </p>
                </div>
                <Link href="/student/activities" className="inline-block pt-1">
                  <Button className="bg-[#0F4C81] hover:bg-[#0C3D68] text-white font-bold text-xs rounded-xl px-5 py-2.5 shadow-xs cursor-pointer">
                    View Academic Activities
                  </Button>
                </Link>
              </div>
            ) : (
              filteredDocs.map((doc) => (
                <Card
                key={doc.id}
                className="border-slate-200/90 shadow-xs p-4 flex items-center justify-between bg-white hover:border-blue-200 transition-all rounded-2xl"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      doc.document_type === "PERFORMANCE_TRANSCRIPT"
                        ? "bg-indigo-50 text-indigo-600 border border-indigo-200"
                        : doc.document_type === "COMPLETION_CERTIFICATE"
                        ? "bg-amber-50 text-amber-600 border border-amber-200"
                        : "bg-blue-50 text-blue-600 border border-blue-200"
                    }`}
                  >
                    {doc.document_type === "PERFORMANCE_TRANSCRIPT" ? (
                      <GraduationCap className="w-5 h-5" />
                    ) : doc.document_type === "COMPLETION_CERTIFICATE" ? (
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
                        {doc.document_type === "PERFORMANCE_TRANSCRIPT" ? "View Dossier" : "Preview"}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDirectStudentDownload(doc)}
                        className={`${
                          doc.document_type === "PERFORMANCE_TRANSCRIPT"
                            ? "bg-indigo-600 hover:bg-indigo-700"
                            : "bg-blue-600 hover:bg-blue-700"
                        } text-white text-xs h-8 px-3 rounded-xl font-bold cursor-pointer shadow-2xs`}
                      >
                        <Download className="w-3 h-3 mr-1" /> PDF
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSharingDoc(doc)}
                        className="text-xs h-8 px-2.5 rounded-xl border-slate-300 hover:bg-slate-50 font-bold cursor-pointer text-slate-700"
                        title="Share & embed verified badge"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            )))}
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
                  <img
                    src="/images/akash-technolabs-header-logo.png"
                    alt="Akash Technolabs"
                    className="h-7 w-auto object-contain"
                  />
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-serif font-black text-slate-900 tracking-wide">
                    Certificate of Internship Excellence
                  </h4>
                  <p className="text-[11px] text-slate-500 italic">This officially certifies that</p>
                </div>

                <div className="py-1">
                  <h3 className="text-2xl font-serif font-black text-blue-700 tracking-tight">
                    {studentName && studentName !== "Student Intern" ? studentName : (certificateDoc?.recipient_name || "Certified Intern")}
                  </h3>
                  <div className="w-28 h-0.5 bg-[#E52329] mx-auto mt-1" />
                </div>

                <p className="text-[11px] text-slate-600 max-w-sm mx-auto leading-relaxed">
                  has successfully completed all milestones for the <strong className="text-slate-800">AI &amp; Full Stack Enterprise Internship</strong> from October 1, 2026 to October 31, 2026.
                </p>

                {/* Footer Stamp, QR Code & Signatory */}
                <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between text-left">
                  <div className="text-[10px] text-slate-500">
                    <div className="font-serif text-sm text-slate-900 font-bold">Akash Padhiyar</div>
                    <p className="text-[9px] text-slate-500 font-semibold">CEO • Akash Technolabs</p>
                    <span className="font-mono text-[9px] text-blue-600 block mt-0.5">
                      ID: {certificateDoc?.document_number || "ID-AKT-2026-CERT01"}
                    </span>
                  </div>

                  {/* QR Code Block linking to /verify/[id] */}
                  <Link
                    href={`/verify/${certificateDoc?.document_number || "ID-AKT-2026-0701"}`}
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

                {/* Add to LinkedIn & Share Embed Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a
                    href={certLinkedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.53 1.53 0 0 0 1.53-1.53 1.53 1.53 0 0 0-1.53-1.53 1.53 1.53 0 0 0-1.53 1.53 1.53 1.53 0 0 0 1.53 1.53m1.4 9.74v-8.37H5.06v8.37h2.8z" />
                    </svg>
                    <span>LinkedIn</span>
                  </a>

                  <Button
                    id="share-embed-btn"
                    onClick={() => setSharingDoc(certificateDoc)}
                    variant="outline"
                    className="w-full border-slate-300 text-slate-700 hover:bg-slate-100 font-bold rounded-xl py-2.5 cursor-pointer text-xs flex items-center justify-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5 text-blue-600" />
                    Share &amp; Embed Badge
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Share & Embed Credential Studio Modal */}
      {sharingDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl flex flex-col overflow-hidden animate-scaleUp">
            {/* Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight">Share &amp; Embed Credential</h3>
                  <p className="text-xs text-blue-100 font-mono">
                    ID: {sharingDoc.document_number}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSharingDoc(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {/* Live Badge Preview Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
                  Live Verified SVG Badge Preview
                </span>
                
                {/* Visual badge card */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      ID
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-900">InternDesk Verified</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono">{sharingDoc.document_number}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    AUTHENTIC
                  </span>
                </div>
              </div>

              {/* Embed Code Snippets */}
              <div className="space-y-3">
                {/* Markdown for GitHub */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Code className="w-3.5 h-3.5 text-indigo-600" />
                      GitHub Markdown Badge
                    </span>
                    <button
                      onClick={() => {
                        const snippet = `[![InternDesk Verified](https://img.shields.io/badge/InternDesk-${encodeURIComponent(sharingDoc.title)}-2563EB?logo=checkmarx&logoColor=white)](https://interndesk.io/verify/${sharingDoc.document_number})`;
                        navigator.clipboard.writeText(snippet);
                        setCopiedType("markdown");
                        setTimeout(() => setCopiedType(null), 2000);
                      }}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1"
                    >
                      {copiedType === "markdown" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedType === "markdown" ? "Copied!" : "Copy Markdown"}
                    </button>
                  </div>
                  <pre className="p-2.5 rounded-xl bg-slate-900 text-slate-200 text-[10px] font-mono overflow-x-auto whitespace-pre-wrap break-all">
                    {`[![InternDesk Verified](https://img.shields.io/badge/InternDesk-${encodeURIComponent(sharingDoc.title)}-2563EB?logo=checkmarx)](https://interndesk.io/verify/${sharingDoc.document_number})`}
                  </pre>
                </div>

                {/* HTML Embed for Portfolio */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Code className="w-3.5 h-3.5 text-blue-600" />
                      HTML Web Embed
                    </span>
                    <button
                      onClick={() => {
                        const snippet = `<a href="https://interndesk.io/verify/${sharingDoc.document_number}" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/InternDesk-Verified%20Credential-2563EB?logo=checkmarx&logoColor=white" alt="InternDesk Verified Credential" /></a>`;
                        navigator.clipboard.writeText(snippet);
                        setCopiedType("html");
                        setTimeout(() => setCopiedType(null), 2000);
                      }}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1"
                    >
                      {copiedType === "html" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedType === "html" ? "Copied!" : "Copy HTML"}
                    </button>
                  </div>
                  <pre className="p-2.5 rounded-xl bg-slate-900 text-slate-200 text-[10px] font-mono overflow-x-auto whitespace-pre-wrap break-all">
                    {`<a href="https://interndesk.io/verify/${sharingDoc.document_number}" target="_blank"><img src="https://img.shields.io/badge/InternDesk-Verified-2563EB" alt="Verified" /></a>`}
                  </pre>
                </div>

                {/* Direct Verification URL */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Public Verification Link
                    </span>
                    <button
                      onClick={() => {
                        const url = typeof window !== "undefined" ? `${window.location.origin}/verify/${sharingDoc.document_number}` : `https://interndesk.io/verify/${sharingDoc.document_number}`;
                        navigator.clipboard.writeText(url);
                        setCopiedType("link");
                        setTimeout(() => setCopiedType(null), 2000);
                      }}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1"
                    >
                      {copiedType === "link" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedType === "link" ? "Copied!" : "Copy Link"}
                    </button>
                  </div>
                  <p className="p-2 rounded-xl bg-slate-100 text-slate-700 text-[11px] font-mono">
                    https://interndesk.io/verify/{sharingDoc.document_number}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">
                SHA-256 Immutable Digital Credential
              </span>
              <Button
                onClick={() => setSharingDoc(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ONE-TIME INTERNSHIP LETTER REQUEST MODAL */}
      {showRequestDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-red-50 text-[#E52329] border border-red-100 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    Request Official Internship Offer Letter
                  </h3>
                  <p className="text-xs text-slate-500">
                    Akash Technolabs • Single-Issuance Credential
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowRequestDialog(false);
                  setRequestMessage(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Customize your technical track and placement dates below. Your request will be routed directly to Akash Technolabs administration for verification. Once approved, your official letterhead PDF will unlock for instant download.
            </p>

            {requestMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {requestMessage}
              </div>
            )}

            <div className="space-y-3.5 pt-1">
              {/* Salutation & Candidate Name */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Salutation *
                  </label>
                  <select
                    value={salutation}
                    onChange={(e) => setSalutation(e.target.value as "Mr." | "Ms.")}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="Mr.">Mr.</option>
                    <option value="Ms.">Ms.</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Student / Candidate Name
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    readOnly
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-100 text-slate-700 font-semibold cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Technical Track / Field Selection */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Technology Track / Field *
                </label>
                <select
                  value={selectedTrack}
                  onChange={(e) => setSelectedTrack(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="PHP / Laravel Web Development">PHP / Laravel Web Development</option>
                  <option value="AI & Machine Learning Engineering">AI &amp; Machine Learning Engineering</option>
                  <option value="Full-Stack Web Development (Next.js & React)">Full-Stack Web Development (Next.js &amp; React)</option>
                  <option value="Python & Data Science">Python &amp; Data Science</option>
                  <option value="Cloud Computing & DevOps">Cloud Computing &amp; DevOps</option>
                  <option value="Software Quality Assurance (QA) & Testing">Software Quality Assurance (QA) &amp; Testing</option>
                  <option value="Cybersecurity & Systems Engineering">Cybersecurity &amp; Systems Engineering</option>
                  <option value="Mobile App Development (Flutter / Android)">Mobile App Development (Flutter / Android)</option>
                  <option value="OTHER">Other / Custom Technology...</option>
                </select>

                {selectedTrack === "OTHER" && (
                  <input
                    type="text"
                    placeholder="Enter custom technology (e.g. Java Microservices)"
                    value={customTrack}
                    onChange={(e) => setCustomTrack(e.target.value)}
                    className="mt-2 w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                )}
              </div>

              {/* Dates: Commencement & Continue Until */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Starting Date (Commencement) *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">
                    Official: {formatDateOrdinal(startDate)}
                  </p>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Ending Date (Continue Until) *
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">
                    Official: {formatDateOrdinal(endDate)}
                  </p>
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Practicum / Verification Purpose
                </label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Academic Practicum & Degree Verification"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Institutional Notice Box */}
              <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-800">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Administrative Verification &amp; Single-Issuance</span>
                </div>
                <p className="text-[10.5px] leading-relaxed text-amber-800/90">
                  This letter is strictly restricted to <strong>1 issuance per student</strong>. Upon submission, it will be placed in the Admin Verification Queue. The official letterhead and PDF download will unlock as soon as Akash Technolabs Admin accepts the request.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowRequestDialog(false);
                  setRequestMessage(null);
                }}
                disabled={isRequesting}
                className="rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmInternshipLetterRequest}
                disabled={isRequesting}
                className="bg-[#E52329] hover:bg-[#C41C22] text-white font-bold rounded-xl text-xs px-5 shadow-md shadow-red-500/20 cursor-pointer"
              >
                {isRequesting ? "Submitting for Admin Approval..." : "Submit Request to Admin (1-Time)"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Rich Document Studio Modal */}
      {selectedStudioDoc && (
        <DocumentStudioModal
          isOpen={!!selectedStudioDoc}
          onClose={() => setSelectedStudioDoc(null)}
          document={selectedStudioDoc}
          organizationName="Akash Technolabs"
        />
      )}
    </div>
  );
}
