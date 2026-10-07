"use client";

import React, { useState } from "react";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Award, FileText, CheckCircle2, Download, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";

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
    },
  ]);

  const handleApproveCertificate = (id: string) => {
    setDocuments(
      documents.map((d) => (d.id === id ? { ...d, status: "AVAILABLE" } : d))
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <AdminTopbar title="Official Documents & Certificates" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Document Generation & Sign-Off Queue
          </h2>
          <p className="text-xs text-slate-500">
            Review certificate graduation eligibility, approve completion credentials, and track issued Offer Letters.
          </p>
        </div>

        <Card className="border-slate-200/90 shadow-xs">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Candidate</th>
                  <th className="px-4 py-3.5">Document Type</th>
                  <th className="px-4 py-3.5">Document Number</th>
                  <th className="px-4 py-3.5">Criteria & Verification</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{doc.student}</td>
                    <td className="px-4 py-4 font-medium text-slate-800">{doc.title}</td>
                    <td className="px-4 py-4 font-mono text-slate-600">{doc.docNumber}</td>
                    <td className="px-4 py-4 text-emerald-700 font-semibold">{doc.eligibility}</td>
                    <td className="px-4 py-4">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {doc.status === "PENDING_APPROVAL" ? (
                        <Button
                          size="sm"
                          variant="success"
                          className="text-xs h-8"
                          onClick={() => handleApproveCertificate(doc.id)}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Approve Certificate
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-8"
                          onClick={() => alert(`Previewing official document ${doc.docNumber}...`)}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          View Document
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
