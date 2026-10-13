"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Award,
  FileText,
  Lock,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { multiTenantStore } from "@/lib/multitenant/store";

function DocumentVerificationContent() {
  const params = useParams();
  const rawDocNumber = (params?.documentNumber as string) || "";
  const documentNumber = decodeURIComponent(rawDocNumber);

  const doc = multiTenantStore.verifyDocumentByNumber(documentNumber);
  const org = doc ? multiTenantStore.getOrganizationById(doc.organization_id) : null;

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

        {doc && org ? (
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

              {/* Signatory & Security Code */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 font-mono">
                <span>Verification Code: <strong>{doc.verification_code}</strong></span>
                <span>Signatory: <strong>{doc.template_data?.signatory_name}</strong></span>
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
            <div className="pt-2 flex justify-center gap-2">
              <Link href="/verify/IND-APX-2026-0042">
                <Button size="sm" variant="outline" className="text-xs font-mono">
                  Try Demo: IND-APX-2026-0042
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
