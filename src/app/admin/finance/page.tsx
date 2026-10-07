"use client";

import React, { useState } from "react";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Download, Search, ShieldCheck } from "lucide-react";
import { formatCurrencyINR, formatDate } from "@/lib/utils";

export default function AdminFinancePage() {
  const [payments] = useState([
    {
      id: "pay1",
      student: "Aarav Sharma",
      email: "aarav@college.edu",
      orderId: "order_k29f93nfa01",
      paymentId: "pay_093kfa82110",
      amount: 1000,
      currency: "INR",
      receiptNumber: "RCPT-98214532",
      status: "VERIFIED",
      date: "2026-10-01",
    },
    {
      id: "pay2",
      student: "Priya Patel",
      email: "priya@university.edu",
      orderId: "order_k29f93nfa02",
      paymentId: "pay_093kfa82111",
      amount: 1000,
      currency: "INR",
      receiptNumber: "RCPT-98214533",
      status: "VERIFIED",
      date: "2026-10-02",
    },
    {
      id: "pay3",
      student: "Rohan Varma",
      email: "rohan@collegemail.in",
      orderId: "order_k29f93nfa03",
      paymentId: "pay_093kfa82112",
      amount: 1000,
      currency: "INR",
      receiptNumber: "RCPT-98214534",
      status: "VERIFIED",
      date: "2026-10-06",
    },
  ]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <AdminTopbar title="Payments & Receipts" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Financial Ledger & Registration Receipts
          </h2>
          <p className="text-xs text-slate-500">
            Real-time reconciliation of ₹1,000 internship fee transactions processed via Razorpay.
          </p>
        </div>

        <Card className="border-slate-200/90 shadow-xs">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Candidate</th>
                  <th className="px-4 py-3.5">Transaction ID & Order</th>
                  <th className="px-4 py-3.5">Receipt #</th>
                  <th className="px-4 py-3.5">Amount</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{p.student}</p>
                      <p className="text-[11px] text-slate-500">{p.email}</p>
                    </td>
                    <td className="px-4 py-4 font-mono">
                      <p className="font-semibold text-slate-800">{p.paymentId}</p>
                      <p className="text-[10px] text-slate-400">{p.orderId}</p>
                    </td>
                    <td className="px-4 py-4 font-mono font-bold text-blue-700">
                      {p.receiptNumber}
                    </td>
                    <td className="px-4 py-4 font-bold text-emerald-700">
                      {formatCurrencyINR(p.amount)}
                    </td>
                    <td className="px-4 py-4 text-slate-500">
                      {formatDate(p.date)}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                        onClick={() => alert(`Downloading verified receipt ${p.receiptNumber}...`)}
                      >
                        <Download className="w-3.5 h-3.5 mr-1" />
                        PDF
                      </Button>
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
