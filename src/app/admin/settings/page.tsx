"use client";

import React, { useState } from "react";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings, Shield, Building, Mail, CheckCircle2, Lock } from "lucide-react";

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);

  // Settings State
  const [orgName, setOrgName] = useState("InternDesk Technologies Ltd.");
  const [orgAddress, setOrgAddress] = useState("Cyber City Innovation Hub, Bengaluru, Karnataka, 560100");
  const [orgEmail, setOrgEmail] = useState("admin@interndesk.local");
  const [feeInr, setFeeInr] = useState("1000");
  const [minAttendancePct, setMinAttendancePct] = useState("80");
  const [emailOnApproval, setEmailOnApproval] = useState(true);
  const [emailOnPayment, setEmailOnPayment] = useState(true);
  const [sessionTimeoutMin, setSessionTimeoutMin] = useState("60");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <AdminTopbar title="System Configuration & Settings" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Organization & System Policy Configuration
          </h2>
          <p className="text-xs text-slate-500">
            Configure enterprise rules, attendance thresholds, document signatories, and notification toggles.
          </p>
        </div>

        {saved && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Settings updated and saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
          {/* Organization Info */}
          <Card className="border-slate-200/90 shadow-xs">
            <CardHeader className="py-4 px-6 border-b border-slate-100 flex flex-row items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" />
              <CardTitle className="text-base font-bold">Organization & Legal Entity</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Organization Legal Name"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  required
                />
                <Input
                  label="Official Support Email"
                  type="email"
                  value={orgEmail}
                  onChange={(e) => setOrgEmail(e.target.value)}
                  required
                />
              </div>
              <Input
                label="Registered Headquarters Address"
                value={orgAddress}
                onChange={(e) => setOrgAddress(e.target.value)}
                required
              />
            </CardContent>
          </Card>

          {/* Internship Rules & Fee */}
          <Card className="border-slate-200/90 shadow-xs">
            <CardHeader className="py-4 px-6 border-b border-slate-100 flex flex-row items-center gap-2">
              <Settings className="w-4 h-4 text-indigo-600" />
              <CardTitle className="text-base font-bold">Internship Graduation Rules</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Registration Fee (INR ₹)"
                  type="number"
                  value={feeInr}
                  onChange={(e) => setFeeInr(e.target.value)}
                  helperText="Fixed registration fee processed via Razorpay."
                  required
                />
                <Input
                  label="Minimum Attendance Percentage (%)"
                  type="number"
                  min={50}
                  max={100}
                  value={minAttendancePct}
                  onChange={(e) => setMinAttendancePct(e.target.value)}
                  helperText="Required attendance threshold for certificate generation."
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification & Security */}
          <Card className="border-slate-200/90 shadow-xs">
            <CardHeader className="py-4 px-6 border-b border-slate-100 flex flex-row items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <CardTitle className="text-base font-bold">Automated Notifications & Security Policy</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs">
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailOnApproval}
                    onChange={(e) => setEmailOnApproval(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">Email student upon Admin Approval</span>
                    <span className="text-slate-500">Send an automated onboarding welcome email with Offer Letter link.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailOnPayment}
                    onChange={(e) => setEmailOnPayment(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">Email student upon Payment Verification</span>
                    <span className="text-slate-500">Deliver immediate digital receipt and payment confirmation.</span>
                  </div>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Session Idle Timeout (Minutes)"
                  type="number"
                  value={sessionTimeoutMin}
                  onChange={(e) => setSessionTimeoutMin(e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-2">
            <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700 font-semibold px-8">
              Save Configuration Changes
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
