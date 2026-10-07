"use client";

import React from "react";
import { StudentTopbar } from "@/components/student/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Download, CheckCircle2, ShieldCheck, FileText } from "lucide-react";
import { formatCurrencyINR, formatDate } from "@/lib/utils";

export default function StudentPaymentsPage() {
  const paymentDetails = {
    receiptNumber: "RCPT-98214532",
    applicationNumber: "ID-APP-847291",
    amount: 1000,
    currency: "INR",
    gateway: "Razorpay (UPI / NetBanking)",
    orderId: "order_k29f93nfa01",
    paymentId: "pay_093kfa82110",
    status: "VERIFIED",
    verifiedAt: "2026-10-01T10:30:00Z",
    studentName: "Aarav Sharma",
    email: "aarav@college.edu",
    orgName: "InternDesk Technologies Ltd.",
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <StudentTopbar title="Payments & Receipts" studentName="Aarav Sharma" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Registration Fee & Official Receipts
          </h2>
          <p className="text-xs text-slate-500">
            Official cryptographic records of your ₹1,000 internship fee payment.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Receipt View Card */}
          <div className="lg:col-span-8">
            <Card className="border-slate-200/90 shadow-xs">
              <CardHeader className="py-4 px-6 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Official Payment Receipt</CardTitle>
                  <p className="text-xs text-slate-500">Tax Invoice & Registration Confirmation</p>
                </div>
                <StatusBadge status={paymentDetails.status} />
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Receipt Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 text-xs">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{paymentDetails.orgName}</h3>
                    <p className="text-slate-500">Cyber City Innovation Hub, Bengaluru, KA</p>
                    <p className="text-slate-500 font-mono mt-0.5">GSTIN: 29AABCU9603R1ZM</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-slate-400 block text-[10px] uppercase">Receipt No:</span>
                    <span className="font-mono font-bold text-slate-900">{paymentDetails.receiptNumber}</span>
                    <span className="block text-slate-400 text-[10px] mt-0.5">{formatDate(paymentDetails.verifiedAt)}</span>
                  </div>
                </div>

                {/* Candidate & Transaction Details */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Billed To</span>
                    <p className="font-bold text-slate-900">{paymentDetails.studentName}</p>
                    <p className="text-slate-500">{paymentDetails.email}</p>
                    <p className="text-slate-500 font-mono">App #: {paymentDetails.applicationNumber}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Gateway Verification</span>
                    <p className="font-medium text-slate-900">{paymentDetails.gateway}</p>
                    <p className="font-mono text-slate-500 text-[11px]">Txn ID: {paymentDetails.paymentId}</p>
                    <p className="font-mono text-slate-500 text-[11px]">Order: {paymentDetails.orderId}</p>
                  </div>
                </div>

                {/* Fee Breakdown */}
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <div className="bg-slate-50 p-3 font-semibold text-slate-600 flex justify-between border-b border-slate-200">
                    <span>Description</span>
                    <span>Amount</span>
                  </div>
                  <div className="p-3.5 flex justify-between border-b border-slate-100">
                    <div>
                      <p className="font-bold text-slate-900">Internship Enrollment & Verification Fee</p>
                      <p className="text-slate-500 text-[11px]">Includes training access, MCQ assessment evaluation & document certification.</p>
                    </div>
                    <span className="font-bold text-slate-900">{formatCurrencyINR(paymentDetails.amount)}</span>
                  </div>
                  <div className="p-3.5 bg-slate-50/70 flex justify-between font-bold text-sm text-slate-900">
                    <span>Total Paid (INR):</span>
                    <span className="text-emerald-700">{formatCurrencyINR(paymentDetails.amount)}</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 font-semibold"
                    onClick={() => alert(`Downloading verified PDF receipt ${paymentDetails.receiptNumber}...`)}
                  >
                    <Download className="w-4 h-4 mr-1.5" />
                    Download PDF Receipt
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security & Verification Callout */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="border-emerald-200 bg-emerald-50/40 shadow-xs">
              <CardContent className="p-5 space-y-3 text-xs text-emerald-900">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-emerald-950">
                  Cryptographically Verified
                </h4>
                <p className="leading-relaxed text-emerald-800">
                  This transaction has been authenticated via Razorpay HMAC-SHA256 signature validation and logged into the immutable audit database.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
