"use client";

import React, { useState, useEffect } from "react";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  CheckCircle2,
  Eye,
  FileText,
  Plus,
  Search,
  Sparkles,
  Download,
  Clock,
  X,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { DocumentStudioModal } from "@/components/documents/document-studio-modal";
import { LetterGenerateModal } from "@/components/admin/letter-generate-modal";
import { IssuedDocument, DocumentType } from "@/types/multitenant";
import {
  downloadAkashOfferLetterPdf,
  isFemaleCandidate,
  deriveTrackTechnology,
} from "@/lib/documents/akash-pdf-generator";

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);

  const [filterType, setFilterType] = useState<
    "ALL" | "PENDING" | "OFFER_LETTER" | "INTERNSHIP_CERTIFICATE"
  >("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudioDoc, setSelectedStudioDoc] = useState<IssuedDocument | null>(null);
  const [isLetterGenerateOpen, setIsLetterGenerateOpen] = useState(false);

  // Admin Approval Modal State
  const [selectedPendingDoc, setSelectedPendingDoc] = useState<any | null>(null);
  const [approvalTech, setApprovalTech] = useState("");
  const [approvalStartDate, setApprovalStartDate] = useState("");
  const [approvalEndDate, setApprovalEndDate] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [approvalError, setApprovalError] = useState<string | null>(null);

  const fetchDocs = () => {
    fetch("/api/admin/documents/list")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (Array.isArray(data.documents)) {
          const mapped = data.documents.map((d: any) => ({
            id: d.id,
            student: d.recipient_name,
            type: d.document_type === "OFFER_LETTER" ? "OFFER_LETTER" : "INTERNSHIP_CERTIFICATE",
            title: d.title,
            docNumber: d.document_number,
            status: d.status === "PENDING_APPROVAL" ? "PENDING_APPROVAL" : "AVAILABLE",
            eligibility:
              d.status === "PENDING_APPROVAL"
                ? "Awaiting Admin Verification & Approval"
                : d.status === "ACCEPTED"
                ? "Digitally Accepted by Student ✓"
                : "Candidate Enrolled & Verified ✓",
            appliedAt: d.issued_date || "2026-10-30",
            role: d.recipient_role || "Intern",
            rawDoc: d,
          }));
          setDocuments(mapped);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const openApprovalModal = (doc: any) => {
    setSelectedPendingDoc(doc);
    const raw = doc.rawDoc;
    setApprovalTech(
      raw?.template_data?.technology || doc.role?.replace(/Intern/i, "").trim() || "PHP / Laravel"
    );
    setApprovalStartDate(raw?.template_data?.commencement_date || "3rd July 2026");
    setApprovalEndDate(raw?.template_data?.continue_until_date || "30th April 2027");
    setApprovalError(null);
  };

  const handleConfirmApprove = async () => {
    if (!selectedPendingDoc) return;
    setIsApproving(true);
    setApprovalError(null);
    try {
      const res = await fetch("/api/admin/documents/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: selectedPendingDoc.id,
          adminName: "Akash Padhiyar",
          technology: approvalTech,
          commencementDate: approvalStartDate,
          continueUntilDate: approvalEndDate,
        }),
      });
      const data = await res.json();
      if (data.success && data.document) {
        setDocuments((prev) =>
          prev.map((d) =>
            d.id === selectedPendingDoc.id
              ? {
                  ...d,
                  status: "AVAILABLE",
                  role: `${approvalTech} Intern`,
                  eligibility: "Candidate Verified & Officially Approved ✓",
                  rawDoc: data.document,
                }
              : d
          )
        );
        setSelectedPendingDoc(null);
      } else {
        setApprovalError(data.error || "Failed to approve document.");
      }
    } catch {
      setApprovalError("Network error while approving document.");
    } finally {
      setIsApproving(false);
    }
  };

  const handleRejectDoc = async (id: string) => {
    if (!confirm("Are you sure you want to reject and remove this offer letter request?")) return;
    try {
      const res = await fetch("/api/admin/documents/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: id }),
      });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
      } else {
        alert("Could not reject document request.");
      }
    } catch {
      alert("Network error while rejecting document request.");
    }
  };

  const handlePreviewDoc = (doc: (typeof documents)[0]) => {
    const docType: DocumentType =
      doc.type === "OFFER_LETTER" ? "OFFER_LETTER" : "COMPLETION_CERTIFICATE";

    const rawDocData = (doc as any).rawDoc;
    const isFemale = isFemaleCandidate(doc.student, rawDocData?.template_data?.salutation);
    const cleanTech = deriveTrackTechnology(
      doc.role,
      rawDocData?.template_data?.technology ||
        (rawDocData?.template_data?.program_or_track &&
        !rawDocData?.template_data?.program_or_track.includes("Enterprise Practicum")
          ? rawDocData?.template_data?.program_or_track
          : "")
    );

    const studioDoc: IssuedDocument = {
      id: doc.id,
      organization_id: "org-akash-01",
      member_id: `usr-${doc.student.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
      document_number: doc.docNumber,
      document_type: docType,
      title: doc.title,
      recipient_name: doc.student,
      recipient_role: doc.role,
      issued_date: doc.appliedAt,
      status: doc.status === "PENDING_APPROVAL" ? "PENDING_APPROVAL" : "ISSUED",
      verification_code: `VRF-${doc.docNumber.replace(/[^a-zA-Z0-9]/g, "").slice(-8)}`,
      template_data: {
        organization_name: "Akash Technolabs",
        organization_type: "CORPORATE",
        organization_logo: "/images/akash-technolabs-header-logo.png",
        organization_address:
          "202, Aarya Arcade, Above Passport Seva Kendra, Mithakhali Six Road, Navrangpura, Ahmedabad-09.",
        organization_website: "www.akashtechnolabs.com",
        contact_email: "info@akashtechnolabs.com",
        contact_phone: "+91 99786 21654",
        signatory_name: "Akash Padhiyar",
        signatory_title: "CEO",
        salutation: isFemale ? "Ms." : "Mr.",
        student_name: doc.student.replace(/^(Mr\.|Ms\.)\s*/i, "").trim(),
        program_or_track: `${cleanTech} technology`,
        technology: cleanTech,
        commencement_date: rawDocData?.template_data?.commencement_date || "3rd July 2026",
        continue_until_date: rawDocData?.template_data?.continue_until_date || "30th April 2027",
        validity: doc.status === "PENDING_APPROVAL" ? "Pending Admin Approval" : "Active / Verified",
        is_akash_template: true,
        custom_terms:
          "Official internship placement with 100% free learning framework and verified project credentials.",
      },
      created_at: `${doc.appliedAt}T09:00:00Z`,
    };

    setSelectedStudioDoc(studioDoc);
  };

  const handleDirectDownloadDoc = async (doc: any) => {
    if (doc.type === "OFFER_LETTER") {
      const isFemale = isFemaleCandidate(doc.student, doc.rawDoc?.template_data?.salutation);
      const cleanTech = deriveTrackTechnology(
        doc.role,
        doc.rawDoc?.template_data?.technology ||
          (doc.rawDoc?.template_data?.program_or_track &&
          !doc.rawDoc?.template_data?.program_or_track.includes("Enterprise Practicum")
            ? doc.rawDoc?.template_data?.program_or_track
            : "")
      );
      await downloadAkashOfferLetterPdf({
        salutation: isFemale ? "Ms." : "Mr.",
        studentName: doc.student,
        internshipPosition: doc.role,
        technology: cleanTech,
        commencementDate: doc.rawDoc?.template_data?.commencement_date || "3rd July 2026",
        continueUntilDate: doc.rawDoc?.template_data?.continue_until_date || "30th April 2027",
        letterDate: doc.appliedAt,
        title: doc.title,
        customDescription: doc.rawDoc?.description_content,
        isCustomEdited: !!doc.rawDoc?.description_content,
        templateType: doc.rawDoc?.template_type,
      });
    } else {
      handlePreviewDoc(doc);
    }
  };

  const handleLetterGenerated = (newDoc: any) => {
    if (newDoc) {
      const formatted = {
        id: newDoc.id,
        student: newDoc.recipient_name,
        type: "OFFER_LETTER" as const,
        title: newDoc.title,
        docNumber: newDoc.document_number,
        status: "AVAILABLE",
        eligibility: "Generated via Akash Admin Dispatch ✓",
        appliedAt: newDoc.issued_date,
        role: newDoc.recipient_role,
        rawDoc: newDoc,
      };
      setDocuments((prev) => [formatted, ...prev.filter((d) => d.id !== formatted.id)]);
      handlePreviewDoc(formatted);
    }
  };

  const pendingDocs = documents.filter((d) => d.status === "PENDING_APPROVAL");

  const filteredDocs = documents.filter((d) => {
    let matchesType = true;
    if (filterType === "PENDING") {
      matchesType = d.status === "PENDING_APPROVAL";
    } else if (filterType === "OFFER_LETTER") {
      matchesType = d.type === "OFFER_LETTER";
    } else if (filterType === "INTERNSHIP_CERTIFICATE") {
      matchesType = d.type === "INTERNSHIP_CERTIFICATE";
    }

    const matchesSearch =
      d.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.docNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <AdminTopbar title="Official Documents & Certificates" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E52329]" />
              <span>Akash Technolabs • Official Credentials</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Document Generation &amp; Sign-Off Queue
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold font-mono">
                {documents.length} Total
              </span>
              {pendingDocs.length > 0 && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-600" />
                  {pendingDocs.length} Pending Approval
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500">
              Generate official Akash Technolabs offer letters, verify candidate requests, and release signed credentials.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setIsLetterGenerateOpen(true)}
              className="bg-[#E52329] hover:bg-[#C41C22] text-white font-bold rounded-xl shadow-md shadow-red-500/20 text-xs flex items-center gap-1.5 transition-transform hover:scale-[1.02] cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Letter Generate</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsLetterGenerateOpen(true)}
              className="text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Issue New Offer Letter</span>
            </Button>
          </div>
        </div>

        {/* Pending Approval Callout Banner */}
        {pendingDocs.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <span>{pendingDocs.length} Candidate Letter Request{pendingDocs.length > 1 ? "s" : ""} Awaiting Review</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-extrabold uppercase">
                    Action Required
                  </span>
                </h4>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Enrolled students have requested their official internship appointment letters. Verify their tracks and dates below to release official credentials.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => setFilterType("PENDING")}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl h-8 px-3 shadow-xs cursor-pointer self-start sm:self-auto shrink-0"
            >
              Filter Pending Queue
            </Button>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search candidate, document #, or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setFilterType("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterType === "ALL"
                  ? "bg-blue-600 text-white font-bold shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Documents ({documents.length})
            </button>
            <button
              onClick={() => setFilterType("PENDING")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                filterType === "PENDING"
                  ? "bg-amber-600 text-white font-bold shadow-2xs"
                  : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Pending Approvals ({pendingDocs.length})</span>
            </button>
            <button
              onClick={() => setFilterType("OFFER_LETTER")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterType === "OFFER_LETTER"
                  ? "bg-blue-600 text-white font-bold shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Offer Letters
            </button>
            <button
              onClick={() => setFilterType("INTERNSHIP_CERTIFICATE")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterType === "INTERNSHIP_CERTIFICATE"
                  ? "bg-blue-600 text-white font-bold shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Certificates
            </button>
          </div>
        </div>

        {/* Documents Table */}
        <Card className="border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 font-bold">Document</th>
                  <th className="px-4 py-3 font-bold">Candidate / Role</th>
                  <th className="px-4 py-3 font-bold">Eligibility &amp; Verification</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 font-bold">Issue Date</th>
                  <th className="px-6 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      No documents found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`p-2 rounded-lg shrink-0 ${
                              doc.status === "PENDING_APPROVAL"
                                ? "bg-amber-50 text-amber-600"
                                : "bg-blue-50 text-blue-600"
                            }`}
                          >
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{doc.title}</span>
                            <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                              {doc.docNumber}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-slate-900 block">{doc.student}</span>
                        <span className="text-[11px] text-slate-500 block">{doc.role}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        {doc.status === "PENDING_APPROVAL" ? (
                          <span className="text-[11px] text-amber-800 font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1 w-max">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Awaiting Admin Approval
                          </span>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                            {doc.eligibility}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {doc.status === "PENDING_APPROVAL" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            PENDING APPROVAL
                          </span>
                        ) : (
                          <StatusBadge status="APPROVED" />
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[11px] text-slate-500">
                        {doc.appliedAt}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {doc.status === "PENDING_APPROVAL" ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => openApprovalModal(doc)}
                                className="h-8 px-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Verify &amp; Approve</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePreviewDoc(doc)}
                                className="h-8 px-2 text-xs font-semibold rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer"
                                title="Preview draft template"
                              >
                                <Eye className="w-3.5 h-3.5 text-blue-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectDoc(doc.id)}
                                className="h-8 px-2 text-xs font-semibold text-red-600 border-red-200 hover:bg-red-50 rounded-lg cursor-pointer"
                                title="Reject request"
                              >
                                <X className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePreviewDoc(doc)}
                                className="h-8 px-2.5 text-xs font-semibold rounded-lg shadow-2xs hover:bg-slate-100 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 mr-1 text-blue-600" />
                                Preview
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleDirectDownloadDoc(doc)}
                                className="h-8 px-2.5 text-xs font-bold bg-[#0F4C81] hover:bg-[#0C3D68] text-white rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer"
                                title="Direct download official PDF"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download PDF</span>
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>

      {/* Admin Letter Generate Modal */}
      <LetterGenerateModal
        isOpen={isLetterGenerateOpen}
        onClose={() => setIsLetterGenerateOpen(false)}
        onSuccess={handleLetterGenerated}
      />

      {/* Admin Verification & Approval Modal */}
      {selectedPendingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    Verify &amp; Approve Internship Letter
                  </h3>
                  <p className="text-xs text-slate-500">
                    Akash Technolabs Administration Sign-Off
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPendingDoc(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Candidate:</span>
                <span className="font-bold text-slate-900">{selectedPendingDoc.student}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Email:</span>
                <span className="font-mono text-slate-700">
                  {selectedPendingDoc.rawDoc?.recipient_email || selectedPendingDoc.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Document #:</span>
                <span className="font-mono text-blue-600 font-bold">{selectedPendingDoc.docNumber}</span>
              </div>
            </div>

            {approvalError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {approvalError}
              </div>
            )}

            <div className="space-y-3 pt-1">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Technology / Track *
                </label>
                <input
                  type="text"
                  value={approvalTech}
                  onChange={(e) => setApprovalTech(e.target.value)}
                  placeholder="e.g. PHP / Laravel, AI & Machine Learning"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Commencement Date *
                  </label>
                  <input
                    type="text"
                    value={approvalStartDate}
                    onChange={(e) => setApprovalStartDate(e.target.value)}
                    placeholder="e.g. 3rd July 2026"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Continue Until Date *
                  </label>
                  <input
                    type="text"
                    value={approvalEndDate}
                    onChange={(e) => setApprovalEndDate(e.target.value)}
                    placeholder="e.g. 30th April 2027"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-[11px] text-emerald-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-emerald-950">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Official Endorsement &amp; Letterhead Release
                </p>
                <p className="text-[10.5px] leading-relaxed text-emerald-800">
                  Signatory: <strong>Akash Padhiyar (CEO, Akash Technolabs)</strong>. Upon confirmation, the letter status will become <strong>APPROVED &amp; ISSUED</strong>, and the student will immediately be able to preview and download the official signed PDF in their portal.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPendingDoc(null)}
                disabled={isApproving}
                className="rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmApprove}
                disabled={isApproving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs px-5 shadow-xs cursor-pointer flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isApproving ? "Approving & Issuing..." : "Confirm & Officially Issue Letter"}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Letter Generate Modal */}
      <LetterGenerateModal
        isOpen={isLetterGenerateOpen}
        onClose={() => setIsLetterGenerateOpen(false)}
        onSuccess={handleLetterGenerated}
      />

      {/* Live Document Studio Modal */}
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
