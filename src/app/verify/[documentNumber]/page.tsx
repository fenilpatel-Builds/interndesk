"use client";

import React, { Suspense, use } from "react";
import Link from "next/link";
import { GraduationCap, ShieldCheck, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function VerifyContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ documentNumber: string }>;
}) {
  const resolved = use(paramsPromise);
  const docNumber = resolved.documentNumber;

  return (
    <Card className="w-full max-w-lg shadow-xl border-emerald-200 bg-white overflow-hidden text-center">
      {/* Verified Banner */}
      <div className="bg-emerald-600 p-6 text-white space-y-2">
        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto ring-4 ring-white/10">
          <CheckCircle2 className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl font-black tracking-tight">Verified Authentic Credential</h2>
        <p className="text-xs text-emerald-100 max-w-sm mx-auto">
          This document has been issued by InternDesk Technologies Ltd. and cryptographically recorded.
        </p>
      </div>

      <CardContent className="p-6 space-y-5 text-left text-xs">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500">Document Number:</span>
            <span className="font-mono font-bold text-slate-900">{docNumber}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500">Document Type:</span>
            <span className="font-bold text-slate-900">
              {docNumber.includes("CERT") ? "Certificate of Completion" : "Internship Offer Letter"}
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500">Candidate Name:</span>
            <span className="font-bold text-slate-900">Aarav Sharma</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500">Specialization:</span>
            <span className="font-semibold text-blue-700">Modern Fullstack Web Development</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500">Issuing Organization:</span>
            <span className="font-semibold text-slate-900">InternDesk Technologies Ltd.</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Verification Status:</span>
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Active & Valid
            </span>
          </div>
        </div>

        <div className="pt-2 text-center">
          <Link href="/">
            <Button variant="outline" size="sm" className="text-xs">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Return to InternDesk Homepage
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DocumentVerifyPage({
  params,
}: {
  params: Promise<{ documentNumber: string }>;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-800 flex items-center justify-center text-white shadow-md">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="text-left">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              InternDesk
            </span>
            <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-500">
              Official Credential Verification
            </span>
          </div>
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="p-12 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
            <span className="text-xs">Verifying document credentials...</span>
          </div>
        }
      >
        <VerifyContent paramsPromise={params} />
      </Suspense>
    </div>
  );
}
