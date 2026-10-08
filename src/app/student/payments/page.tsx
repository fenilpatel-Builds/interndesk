"use client";

import React, { useState } from "react";
import { StudentTopbar } from "@/components/student/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Download, CheckCircle2, ShieldCheck, FileText, Sparkles, AlertCircle } from "lucide-react";
import { formatCurrencyINR, formatDate } from "@/lib/utils";

export default function StudentPaymentsPage() {
  const [downloading, setDownloading] = useState(false);

  const enrollmentPayments = [
    {
      id: "pay_1",
      programName: "Full Stack Web Development",
      receiptNumber: "RCPT-98214532",
      enrollmentId: "ENR-748291",
      amount: 4999,
      baseAmount: 4236,
      gstAmount: 763,
      currency: "INR",
      gateway: "Razorpay (UPI / NetBanking)",
      orderId: "order_k29f93nfa01",
      paymentId: "pay_093kfa82110",
      status: "VERIFIED",
      verifiedAt: "2026-10-01T10:30:00Z",
      studentName: "Fenil Patel",
      email: "fenil8918@gmail.com",
      orgName: "InternDesk Technologies Ltd.",
    },
  ];

  const handleDownloadInvoice = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert("Invoice RCPT-98214532 generated and downloaded successfully.");
    }, 800);
  };

  const primaryPayment = enrollmentPayments[0];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      <StudentTopbar title="Program Payments & Receipts" studentName="Fenil Patel" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Program Enrollment Payments &amp; Receipts
          </h2>
          <p className="text-xs text-slate-500">
            Official cryptographic records of your course enrollment fees and tax invoices.
          </p>
        </div>

        {/* Note banner */}
        <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Registration is Free:</strong> Student account registration carries ₹0 fee. Payments are solely associated with program enrollments.
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Receipt View Card */}
          <div className="lg:col-span-8">
            <Card className="border-slate-200/90 shadow-xs bg-white rounded-2xl overflow-hidden">
              <CardHeader className="py-4 px-6 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Official Program Invoice</CardTitle>
                  <p className="text-xs text-slate-500">Tax Invoice &amp; Enrollment Confirmation</p>
                </div>
                <StatusBadge status={primaryPayment.status} />
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Receipt Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 text-xs">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{primaryPayment.orgName}</h3>
                    <p className="text-slate-500">Cyber City Innovation Hub, Bengaluru, KA</p>
                    <p className="text-slate-500 font-mono mt-0.5">GSTIN: 29AABCU9603R1ZM</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-slate-400 block text-[10px] uppercase">Receipt No:</span>
                    <span className="font-mono font-bold text-slate-900">{primaryPayment.receiptNumber}</span>
                    <span className="block text-slate-400 text-[10px] mt-0.5">
                      {formatDate(primaryPayment.verifiedAt)}
                    </span>
                  </div>
                </div>

                {/* Candidate & Transaction Details */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Billed To</span>
                    <p className="font-bold text-slate-900">{primaryPayment.studentName}</p>
                    <p className="text-slate-500">{primaryPayment.email}</p>
                    <p className="text-slate-500 font-mono">Enrollment #: {primaryPayment.enrollmentId}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Gateway Verification</span>
                    <p className="font-medium text-slate-900">{primaryPayment.gateway}</p>
                    <p className="font-mono text-slate-500 text-[11px]">Txn ID: {primaryPayment.paymentId}</p>
                    <p className="font-mono text-slate-400 text-[10px]">Order: {primaryPayment.orderId}</p>
                  </div>
                </div>

                {/* Line Items */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                      <tr>
                        <th className="py-2.5 px-4 text-left font-bold">Program Description</th>
                        <th className="py-2.5 px-4 text-center font-bold">Qty</th>
                        <th className="py-2.5 px-4 text-right font-bold">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">{primaryPayment.programName}</span>
                          <span className="text-slate-400 text-[11px]">
                            12-Week Certified Internship Track &amp; Capstone
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-slate-600">1</td>
                        <td className="py-3 px-4 text-right font-medium text-slate-900">
                          {formatCurrencyINR(primaryPayment.baseAmount)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={2} className="py-2 px-4 text-right text-slate-500 font-medium">
                          Integrated GST (18%)
                        </td>
                        <td className="py-2 px-4 text-right font-medium text-slate-700">
                          {formatCurrencyINR(primaryPayment.gstAmount)}
                        </td>
                      </tr>
                      <tr className="bg-slate-50/80 font-bold">
                        <td colSpan={2} className="py-3 px-4 text-right text-slate-900">
                          Total Amount Paid:
                        </td>
                        <td className="py-3 px-4 text-right text-base text-emerald-700 font-black">
                          {formatCurrencyINR(primaryPayment.amount)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Cryptographically verified &amp; signed</span>
                  </div>

                  <Button
                    onClick={handleDownloadInvoice}
                    isLoading={downloading}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
                  >
                    <Download className="w-4 h-4 mr-1.5" />
                    Download PDF Invoice
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Policies & Verification */}
          <div className="lg:col-span-4 space-y-5">
            <Card className="border-slate-200/90 shadow-xs bg-white rounded-2xl">
              <CardHeader className="py-4 px-6 border-b border-slate-100">
                <CardTitle className="text-sm font-bold">Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4 text-xs text-slate-600">
                <div className="space-y-1.5">
                  <span className="font-bold text-slate-800 block">Registration vs Programs</span>
                  <p className="leading-relaxed">
                    Student registration is always 100% free. Program enrollment fees provide access to live mentors, curriculum repositories, daily work logs, and accredited certification.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-1.5">
                  <span className="font-bold text-slate-800 block">Invoice Tax Compliance</span>
                  <p className="leading-relaxed">
                    All transactions include an official GST invoice generated automatically upon payment authorization.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-1.5">
                  <span className="font-bold text-slate-800 block">Need Help?</span>
                  <p className="leading-relaxed">
                    For billing inquiries or receipt verification, contact billing@interndesk.com.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
