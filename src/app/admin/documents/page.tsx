"use client";

import React, { useState, useEffect } from "react";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { CheckCircle2, Eye, FileText, Plus, Search, Sparkles } from "lucide-react";
import { DocumentStudioModal } from "@/components/documents/document-studio-modal";
import { LetterGenerateModal } from "@/components/admin/letter-generate-modal";
import { IssuedDocument, DocumentType } from "@/types/multitenant";

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState([
    {
      id: "doc-akt-offer-fenil-huntarmy",
      student: "Mr. Fenil Patel",
      type: "OFFER_LETTER",
      title: "INTERNSHIP OFFER LETTER",
      docNumber: "ID-AKT-2026-OF01",
      status: "AVAILABLE",
      eligibility: "Candidate Verified & Enrolled ✓",
      appliedAt: "2026-10-30",
      role: "AI/ML Intern",
    },
    {
      id: "doc-akt-cert-fenil",
      student: "Fenil Patel",
      type: "INTERNSHIP_CERTIFICATE",
      title: "Certificate of Internship Excellence",
      docNumber: "ID-AKT-2026-CERT01",
      status: "AVAILABLE",
      eligibility: "Attendance 98.4% • Milestones Complete ✓",
      appliedAt: "2026-10-15",
      role: "AI/ML Intern",
    },
    {
      id: "doc2",
      student: "Aarav Sharma",
      type: "OFFER_LETTER",
      title: "INTERNSHIP OFFER LETTER",
      docNumber: "ID-AKT-2026-OF03",
      status: "AVAILABLE",
      eligibility: "Registration Approved ✓",
      appliedAt: "2026-10-01",
      role: "Software Engineering Intern",
    },
    {
      id: "doc3",
      student: "Priya Sharma",
      type: "OFFER_LETTER",
      title: "INTERNSHIP OFFER LETTER",
      docNumber: "ID-AKT-2026-OF04",
      status: "AVAILABLE",
      eligibility: "Registration Approved ✓",
      appliedAt: "2026-10-02",
      role: "Full Stack Web Developer Intern",
    },
    {
      id: "doc4",
      student: "Harshit Mehta",
      type: "OFFER_LETTER",
      title: "INTERNSHIP OFFER LETTER",
      docNumber: "ID-AKT-2026-OF05",
      status: "AVAILABLE",
      eligibility: "Registration Approved ✓",
      appliedAt: "2026-10-01",
      role: "Cloud & DevOps Intern",
    },
  ]);

  const [filterType, setFilterType] = useState<"ALL" | "OFFER_LETTER" | "INTERNSHIP_CERTIFICATE">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudioDoc, setSelectedStudioDoc] = useState<IssuedDocument | null>(null);
  const [isLetterGenerateOpen, setIsLetterGenerateOpen] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/documents/list")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (active && Array.isArray(data.documents) && data.documents.length > 0) {
          const mapped = data.documents.map((d: any) => ({
            id: d.id,
            student: d.recipient_name,
            type: d.document_type === "OFFER_LETTER" ? "OFFER_LETTER" : "INTERNSHIP_CERTIFICATE",
            title: d.title,
            docNumber: d.document_number,
            status: d.status === "PENDING_APPROVAL" ? "PENDING_APPROVAL" : "AVAILABLE",
            eligibility: d.status === "ACCEPTED" ? "Digitally Accepted by Student ✓" : "Candidate Enrolled & Verified ✓",
            appliedAt: d.issued_date || "2026-10-30",
            role: d.recipient_role || "Intern",
          }));
          setDocuments(mapped);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

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
      organization_id: "org-akash-01",
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
        organization_name: "Akash Technolabs",
        organization_type: "CORPORATE",
        organization_logo: "/images/akash-technolabs-header-logo.png",
        organization_address: "202, Aarya Arcade, Above Passport Seva Kendra, Mithakhali Six Road, Navrangpura, Ahmedabad-09.",
        organization_website: "www.akashtechnolabs.com",
        contact_email: "info@akashtechnolabs.com",
        contact_phone: "+91 99786 21654",
        signatory_name: "Akash Padhiyar",
        signatory_title: "CEO",
        program_or_track: "AI & Full Stack Enterprise Practicum",
        validity: "Active / Verified",
        is_akash_template: true,
        custom_terms: "Official internship placement with 100% free learning framework and verified project credentials.",
      },
      created_at: `${doc.appliedAt}T09:00:00Z`,
    };

    setSelectedStudioDoc(studioDoc);
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
      };
      setDocuments((prev) => [formatted, ...prev.filter((d) => d.id !== formatted.id)]);
      handlePreviewDoc(formatted);
    }
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E52329]" />
              <span>Akash Technolabs • Official Credentials</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Document Generation &amp; Sign-Off Queue
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold font-mono">
                {documents.length} Total
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Generate official Akash Technolabs offer letters, approve completion credentials, and track verified documents.
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
              All Documents
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
                          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
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
                        <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                          {doc.eligibility}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge
                          status={doc.status === "AVAILABLE" ? "APPROVED" : "PENDING"}
                        />
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[11px] text-slate-500">
                        {doc.appliedAt}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePreviewDoc(doc)}
                            className="h-8 px-2.5 text-xs font-semibold rounded-lg shadow-2xs hover:bg-slate-100 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1 text-blue-600" />
                            Preview
                          </Button>
                          {doc.status === "PENDING_APPROVAL" && (
                            <Button
                              size="sm"
                              onClick={() => handleApproveCertificate(doc.id)}
                              className="h-8 px-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Approve
                            </Button>
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

      {/* Admin Letter Generate Modal (Matching User's Attached Screens) */}
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
