"use client";

import React, { useState } from "react";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { CheckCircle2, Eye, FileText, Plus, Search } from "lucide-react";
import { DocumentStudioModal } from "@/components/documents/document-studio-modal";
import { IssuedDocument, DocumentType } from "@/types/multitenant";

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState([
    {
      id: "doc1",
      student: "Aarav Sharma",
      type: "INTERNSHIP_CERTIFICATE",
      title: "Certificate of Internship Completion",
      docNumber: "ID-CERT-2026-001",
      status: "PENDING_APPROVAL",
      eligibility: "Attendance 92% • Tasks 14/16 • Exams Passed ✓",
      appliedAt: "2026-10-06",
      role: "Software Engineering Intern",
    },
    {
      id: "doc2",
      student: "Aarav Sharma",
      type: "OFFER_LETTER",
      title: "Internship Offer Letter",
      docNumber: "ID-OFF-847291",
      status: "AVAILABLE",
      eligibility: "Registration Approved ✓",
      appliedAt: "2026-10-01",
      role: "Software Engineering Intern",
    },
    {
      id: "doc3",
      student: "Priya Patel",
      type: "OFFER_LETTER",
      title: "Internship Offer Letter",
      docNumber: "ID-OFF-847292",
      status: "AVAILABLE",
      eligibility: "Registration Approved ✓",
      appliedAt: "2026-10-02",
      role: "AI & Full Stack Intern",
    },
    {
      id: "doc4",
      student: "Fenil Patel",
      type: "OFFER_LETTER",
      title: "Official Internship Offer Letter",
      docNumber: "ID-OFFER-2026-4412",
      status: "AVAILABLE",
      eligibility: "Candidate Accepted & Verified ✓",
      appliedAt: "2026-10-01",
      role: "Full Stack Software Engineering Intern",
    },
  ]);

  const [filterType, setFilterType] = useState<"ALL" | "OFFER_LETTER" | "INTERNSHIP_CERTIFICATE">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudioDoc, setSelectedStudioDoc] = useState<IssuedDocument | null>(null);

  const handleApproveCertificate = (id: string) => {
    setDocuments(
      documents.map((d) => (d.id === id ? { ...d, status: "AVAILABLE" } : d))
    );
  };

  const handlePreviewDoc = (doc: (typeof documents)[0]) => {
    const docType: DocumentType =
      doc.type === "OFFER_LETTER" ? "OFFER_LETTER" : "COMPLETION_CERTIFICATE";

    const studioDoc: IssuedDocument = {
      id: doc.id,
      organization_id: "org-apex-01",
      member_id: `usr-${doc.student.toLowerCase().replace(/\s+/g, "-")}`,
      document_number: doc.docNumber,
      document_type: docType,
      title: doc.title,
      recipient_name: doc.student,
      recipient_role: doc.role,
      issued_date: doc.appliedAt,
      status: doc.status === "PENDING_APPROVAL" ? "PENDING_APPROVAL" : "ISSUED",
      verification_code: `VRF-${doc.docNumber.replace(/[^a-zA-Z0-9]/g, "").slice(-8)}`,
      template_data: {
        organization_name: "Apex Technologies",
        organization_type: "CORPORATE",
        signatory_name: "Elena Rostova",
        signatory_title: "Head of Engineering Operations",
        program_or_track: "Cloud Architecture & Full Stack Practicum",
        validity: "Active / Verified",
        custom_terms: "Official internship placement with 100% free learning framework and verified project credentials.",
      },
      created_at: `${doc.appliedAt}T09:00:00Z`,
    };

    setSelectedStudioDoc(studioDoc);
  };

  const filteredDocs = documents.filter((d) => {
    const matchesType = filterType === "ALL" || d.type === filterType;
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
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Document Generation &amp; Sign-Off Queue
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold font-mono">
                {documents.length} Total
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Review candidate offer letters, approve completion credentials, and track cryptographically verified documents.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => {
                const newId = `doc-${Date.now()}`;
                const newDocNumber = `ID-OFF-${Math.floor(100000 + Math.random() * 900000)}`;
                const newDoc = {
                  id: newId,
                  student: "Candidate Applicant",
                  type: "OFFER_LETTER",
                  title: "Official Internship Offer Letter",
                  docNumber: newDocNumber,
                  status: "AVAILABLE",
                  eligibility: "Generated via Admin Dispatch ✓",
                  appliedAt: "2026-10-23",
                  role: "Software Engineering Intern",
                };
                setDocuments([newDoc, ...documents]);
                handlePreviewDoc(newDoc);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Issue New Offer Letter</span>
            </Button>
          </div>
        </div>

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

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterType("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterType === "ALL"
                  ? "bg-blue-600 text-white font-bold shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All ({documents.length})
            </button>
            <button
              onClick={() => setFilterType("OFFER_LETTER")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterType === "OFFER_LETTER"
                  ? "bg-blue-600 text-white font-bold shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Offer Letters ({documents.filter((d) => d.type === "OFFER_LETTER").length})
            </button>
            <button
              onClick={() => setFilterType("INTERNSHIP_CERTIFICATE")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterType === "INTERNSHIP_CERTIFICATE"
                  ? "bg-blue-600 text-white font-bold shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Certificates ({documents.filter((d) => d.type === "INTERNSHIP_CERTIFICATE").length})
            </button>
          </div>
        </div>

        <Card className="border-slate-200/90 shadow-xs">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Candidate</th>
                  <th className="px-4 py-3.5">Document Type</th>
                  <th className="px-4 py-3.5">Document Number</th>
                  <th className="px-4 py-3.5">Criteria &amp; Verification</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{doc.student}</td>
                    <td className="px-4 py-4 font-medium text-slate-800 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                      <span>{doc.title}</span>
                    </td>
                    <td className="px-4 py-4 font-mono text-slate-600">{doc.docNumber}</td>
                    <td className="px-4 py-4 text-emerald-700 font-semibold">{doc.eligibility}</td>
                    <td className="px-4 py-4">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {doc.status === "PENDING_APPROVAL" && (
                          <Button
                            size="sm"
                            variant="success"
                            className="text-xs h-8"
                            onClick={() => handleApproveCertificate(doc.id)}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            Approve
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-8"
                          onClick={() => handlePreviewDoc(doc)}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          View Document
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredDocs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-xs text-slate-400">
                      No documents match your query or filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>

      {/* Live Document Studio Modal */}
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
