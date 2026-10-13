"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Building2,
  KeyRound,
  Mail,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { validateOrganizationCode } from "@/lib/multitenant/code-generator";
import { multiTenantStore } from "@/lib/multitenant/store";
import { Organization } from "@/types/multitenant";

function JoinPageContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") || "";

  const [activeTab, setActiveTab] = useState<"code" | "invite" | "search">("code");
  const [inputCode, setInputCode] = useState(initialCode);
  const [inviteToken, setInviteToken] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [matchedOrg, setMatchedOrg] = useState<Organization | null>(() => {
    if (!initialCode) return null;
    const { isValid, normalized } = validateOrganizationCode(initialCode);
    return isValid ? multiTenantStore.getOrganizationByCode(normalized) || null : null;
  });
  const [validationError, setValidationError] = useState<string | null>(() => {
    if (!initialCode) return null;
    const { isValid, normalized, error } = validateOrganizationCode(initialCode);
    if (!isValid) return error || "Invalid organization code format.";
    const found = multiTenantStore.getOrganizationByCode(normalized);
    if (!found) return `No active organization found matching code "${normalized}". Please check with your administrator.`;
    return null;
  });
  const [joinSubmitted, setJoinSubmitted] = useState(false);
  const [selectedRole, setSelectedRole] = useState("STUDENT");

  // Lookup code
  const handleVerifyCode = (codeToTest: string) => {
    setValidationError(null);
    setMatchedOrg(null);
    setJoinSubmitted(false);

    if (!codeToTest.trim()) {
      setValidationError("Please enter an Organization Code.");
      return;
    }

    const { isValid, normalized, error } = validateOrganizationCode(codeToTest);
    if (!isValid) {
      setValidationError(error || "Invalid organization code format.");
      return;
    }

    const found = multiTenantStore.getOrganizationByCode(normalized);
    if (found) {
      setMatchedOrg(found);
    } else {
      setValidationError(`No active organization found matching code "${normalized}". Please check with your administrator.`);
    }
  };

  const allOrganizations = multiTenantStore.getOrganizations();
  const filteredOrgs = allOrganizations.filter((o) =>
    o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.industry_or_category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Header */}
      <header className="w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md py-4 px-6 sm:px-12 flex items-center justify-between">
        <AnimatedLogo size="md" />
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="outline" size="sm" className="text-slate-700 rounded-xl">
              Sign In
            </Button>
          </Link>
          <Link href="/onboard/organization">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl">
              Create New Workspace
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
            <Building2 className="w-3.5 h-3.5" />
            <span>Workspace Discovery & Onboarding</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Find Your Organization
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-2 font-normal">
            Connect to your company, university, or institute workspace using your verified organization code or administrator invitation.
          </p>
        </div>

        {/* Option Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 rounded-xl bg-slate-200/80 border border-slate-300/70">
            <button
              onClick={() => { setActiveTab("code"); setMatchedOrg(null); setValidationError(null); }}
              className={`px-5 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                activeTab === "code"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 inline mr-1.5" />
              Enter Organization Code
            </button>
            <button
              onClick={() => { setActiveTab("invite"); setMatchedOrg(null); setValidationError(null); }}
              className={`px-5 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                activeTab === "invite"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Mail className="w-3.5 h-3.5 inline mr-1.5" />
              Accept Invitation
            </button>
            <button
              onClick={() => { setActiveTab("search"); setMatchedOrg(null); setValidationError(null); }}
              className={`px-5 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                activeTab === "search"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Search className="w-3.5 h-3.5 inline mr-1.5" />
              Search Public Organizations
            </button>
          </div>
        </div>

        {/* Tab 1: Enter Organization Code */}
        {activeTab === "code" && (
          <div className="space-y-6">
            <Card className="border-slate-200/90 shadow-sm bg-white rounded-2xl p-6 sm:p-8">
              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Unique Organization Code
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="e.g. ORG-7K4P9X"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-300 font-mono text-base font-bold uppercase tracking-widest focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                  <Button
                    size="lg"
                    onClick={() => handleVerifyCode(inputCode)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 rounded-xl"
                  >
                    Lookup Workspace
                  </Button>
                </div>

                {/* Helpful Examples */}
                <div className="pt-2 flex items-center gap-2 flex-wrap text-xs text-slate-500">
                  <span className="font-semibold">Quick Demo Codes:</span>
                  <button
                    onClick={() => { setInputCode("ORG-7K4P9X"); handleVerifyCode("ORG-7K4P9X"); }}
                    className="font-mono text-blue-600 hover:underline bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-bold"
                  >
                    ORG-7K4P9X (Apex Technologies)
                  </button>
                  <button
                    onClick={() => { setInputCode("ORG-M8D2QF"); handleVerifyCode("ORG-M8D2QF"); }}
                    className="font-mono text-indigo-600 hover:underline bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 font-bold"
                  >
                    ORG-M8D2QF (Westbridge Uni)
                  </button>
                  <button
                    onClick={() => { setInputCode("ORG-5T9L3B"); handleVerifyCode("ORG-5T9L3B"); }}
                    className="font-mono text-emerald-600 hover:underline bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold"
                  >
                    ORG-5T9L3B (Future Skills)
                  </button>
                </div>

                {validationError && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Matched Organization Preview Card (Section 11) */}
            {matchedOrg && !joinSubmitted && (
              <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 rounded-2xl p-6 sm:p-8 shadow-md animate-fadeIn">
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-blue-100">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-black flex items-center justify-center text-xl shadow-md">
                        {matchedOrg.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-xl font-black text-slate-900">
                            {matchedOrg.name}
                          </h2>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            Verified Workspace
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 font-mono">
                          Code: <span className="font-bold text-slate-700">{matchedOrg.code}</span> • Type: <span className="font-semibold text-slate-700">{matchedOrg.type}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* General Description */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">About Workspace</h4>
                    <p className="text-sm text-slate-700 leading-relaxed font-normal">
                      {matchedOrg.description}
                    </p>
                  </div>

                  {/* Joining Policy & Instructions */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                      Workspace Enrollment Policy
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {matchedOrg.joining_policy === "REQUEST_APPROVAL" &&
                        "This workspace requires administrator review. Submitting your join request will notify the organization administrator for access approval."}
                      {matchedOrg.joining_policy === "CODE_ONLY" &&
                        "This organization permits direct enrollment via validated code. You can proceed directly into the member workspace."}
                      {matchedOrg.joining_policy === "INVITATION_ONLY" &&
                        "This workspace requires an administrator invitation token. Please check your inbox or request an invite."}
                    </p>
                  </div>

                  {/* Role Selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Select Your Member Role
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {["STUDENT", "INTERN", "EMPLOYEE", "TRAINEE"].map((role) => (
                        <button
                          key={role}
                          onClick={() => setSelectedRole(role)}
                          className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                            selectedRole === role
                              ? "border-blue-600 bg-blue-50 text-blue-700 shadow-xs"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action CTA */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
                    <Button
                      size="lg"
                      onClick={() => setJoinSubmitted(true)}
                      className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 rounded-xl shadow-md"
                    >
                      Confirm & Request Access
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Success Confirmation Screen */}
            {joinSubmitted && matchedOrg && (
              <Card className="border-emerald-200 bg-white rounded-2xl p-8 text-center space-y-5 shadow-lg animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">
                  Request Submitted Successfully!
                </h2>
                <p className="text-sm text-slate-600 max-w-lg mx-auto font-normal">
                  Your request to join <span className="font-bold text-slate-800">{matchedOrg.name}</span> as an authorized{" "}
                  <span className="font-bold text-slate-800">{selectedRole}</span> has been logged. An administrator will review your application.
                </p>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 max-w-md mx-auto space-y-1 text-left font-mono">
                  <p>Workspace: <span className="font-bold text-slate-900">{matchedOrg.name}</span></p>
                  <p>Code: <span className="font-bold text-slate-900">{matchedOrg.code}</span></p>
                  <p>Status: <span className="font-bold text-amber-600">JOIN_REQUEST_PENDING</span></p>
                </div>

                <div className="pt-3 flex justify-center gap-3">
                  <Link href="/workspace">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 rounded-xl">
                      Enter Workspace Preview
                    </Button>
                  </Link>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Tab 2: Accept Invitation */}
        {activeTab === "invite" && (
          <Card className="border-slate-200/90 shadow-sm bg-white rounded-2xl p-6 sm:p-8 space-y-5">
            <h3 className="text-base font-bold text-slate-900">
              Redeem Workspace Invitation
            </h3>
            <p className="text-xs text-slate-600 font-normal">
              Enter the secure alphanumeric invitation token received in your official email inbox.
            </p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="e.g. inv_82f1b4a90c"
                value={inviteToken}
                onChange={(e) => setInviteToken(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 font-mono text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
              <Button
                onClick={() => handleVerifyCode("ORG-7K4P9X")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 rounded-xl"
              >
                Accept Invitation
              </Button>
            </div>
          </Card>
        )}

        {/* Tab 3: Search Public Organizations */}
        {activeTab === "search" && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search organizations by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white shadow-xs focus:ring-2 focus:ring-blue-600 focus:outline-none text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredOrgs.map((org) => (
                <Card key={org.id} className="border-slate-200 bg-white p-5 rounded-xl hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{org.name}</h4>
                      <p className="text-xs text-slate-500">{org.industry_or_category}</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {org.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 font-normal">{org.description}</p>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500">{org.type}</span>
                    <button
                      onClick={() => { setInputCode(org.code); setActiveTab("code"); handleVerifyCode(org.code); }}
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      Select Workspace <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer Note */}
      <footer className="py-6 border-t border-slate-200 text-center text-xs text-slate-500">
        InternDesk Enterprise Multi-Tenant Discovery • Zero Registration Fees
      </footer>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500 font-mono">Loading discovery portal...</div>}>
      <JoinPageContent />
    </Suspense>
  );
}
