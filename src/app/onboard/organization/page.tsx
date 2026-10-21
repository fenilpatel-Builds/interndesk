"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  GraduationCap,
  Laptop,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Sparkles,
  Users,
  Settings,
  FolderTree,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { OrganizationType } from "@/types/multitenant";
import { multiTenantStore } from "@/lib/multitenant/store";

export default function OrganizationOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [copiedCode, setCopiedCode] = useState(false);

  // Form State
  const [orgType, setOrgType] = useState<OrganizationType>("CORPORATE");
  const [name, setName] = useState("");
  const [officialEmail, setOfficialEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [country, setCountry] = useState("India");
  const [size, setSize] = useState("50-200");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");

  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [verificationMethod, setVerificationMethod] = useState("OFFICIAL_DOMAIN");
  const [verificationNotes, setVerificationNotes] = useState("");

  // Generated Result
  const [createdWorkspace, setCreatedWorkspace] = useState<{
    id: string;
    name: string;
    code: string;
  } | null>(null);

  const orgTypeOptions: { type: OrganizationType; title: string; desc: string; icon: React.ReactNode }[] = [
    {
      type: "CORPORATE",
      title: "Company / MNC",
      desc: "For corporate enterprises managing employees, interns, departments, and project deliverables.",
      icon: <Building2 className="w-6 h-6 text-blue-600" />,
    },
    {
      type: "EDUCATIONAL",
      title: "College / University",
      desc: "For higher education institutes tracking students, faculty supervisors, batches, and academic internships.",
      icon: <GraduationCap className="w-6 h-6 text-indigo-600" />,
    },
    {
      type: "TRAINING",
      title: "Training Institute",
      desc: "For developer bootcamps and vocational centers managing learners, study modules, and assessments.",
      icon: <Laptop className="w-6 h-6 text-emerald-600" />,
    },
    {
      type: "INTERNSHIP_PROVIDER",
      title: "Internship Provider",
      desc: "For talent placement organizations issuing verified work reports and completion letters.",
      icon: <Briefcase className="w-6 h-6 text-amber-600" />,
    },
  ];

  const handleCreateWorkspace = () => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `workspace-${Date.now()}`;
    const newOrg = multiTenantStore.createOrganization({
      name: name || "Enterprise Workspace",
      slug,
      type: orgType,
      official_email: officialEmail || "admin@workspace.com",
      contact_number: contactNumber,
      website,
      country,
      size,
      industry_or_category: industry || "Technology & Engineering",
      description: description || "Corporate enterprise workforce and internship workspace.",
      joining_policy: "REQUEST_APPROVAL",
      allowed_email_domains: officialEmail.includes("@") ? [`@${officialEmail.split("@")[1]}`] : [],
      settings: {
        workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        expectedDailyHours: 8,
        gracePeriodMinutes: 15,
        allowedBreakMinutes: 60,
        timeZone: "Asia/Kolkata",
        dateFormat: "DD/MM/YYYY",
        primaryColor: "#2563EB",
        requireReportReview: true,
        autoApproveAttendance: false,
      },
    });

    // Create administrator membership
    multiTenantStore.addMembership({
      organization_id: newOrg.id,
      user_id: `usr-${Date.now()}`,
      role: "ORG_ADMIN",
      member_type: "ADMIN",
      status: "ACTIVE",
      job_title: "Workspace Administrator",
      user_full_name: adminName || "Workspace Admin",
      user_email: adminEmail || officialEmail,
      joined_at: new Date().toISOString(),
    });

    setCreatedWorkspace({
      id: newOrg.id,
      name: newOrg.name,
      code: newOrg.code,
    });
    setCurrentStep(5);
  };

  const copyCodeToClipboard = () => {
    if (createdWorkspace?.code) {
      navigator.clipboard.writeText(createdWorkspace.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Header */}
      <header className="w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md py-4 px-6 sm:px-12 flex items-center justify-between">
        <AnimatedLogo size="md" />
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-slate-600">
            Exit to Home
          </Button>
        </Link>
      </header>

      {/* Main Form Container */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-xl mx-auto relative">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex flex-col items-center z-10">
                <div
                  className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs transition-all ${
                    currentStep === step
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-4 ring-blue-100"
                      : currentStep > step
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {currentStep > step ? <Check className="w-4 h-4" /> : step}
                </div>
                <span className="text-[10px] font-semibold text-slate-500 mt-1 hidden sm:block">
                  {step === 1 && "Type"}
                  {step === 2 && "Org Details"}
                  {step === 3 && "Admin Profile"}
                  {step === 4 && "Verification"}
                  {step === 5 && "Ready"}
                </span>
              </div>
            ))}
            {/* Connecting Bar */}
            <div className="absolute top-4.5 left-4 right-4 h-0.5 bg-slate-200 -z-0" />
          </div>
        </div>

        {/* Step 1: Choose Organization Type */}
        {currentStep === 1 && (
          <Card className="border-slate-200 bg-white p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Step 1 of 5</span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Choose Organization Type</h2>
              <p className="text-xs text-slate-600 font-normal">
                Select the organizational category that matches your workspace workflow.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {orgTypeOptions.map((opt) => (
                <div
                  key={opt.type}
                  onClick={() => setOrgType(opt.type)}
                  className={`p-5 rounded-xl border cursor-pointer transition-all ${
                    orgType === opt.type
                      ? "border-blue-600 bg-blue-50/50 shadow-xs ring-2 ring-blue-200"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center mb-3">
                    {opt.icon}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{opt.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed font-normal">{opt.desc}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-end">
              <Button onClick={() => setCurrentStep(2)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 rounded-xl">
                Continue to Organization Info
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Organization Information */}
        {currentStep === 2 && (
          <Card className="border-slate-200 bg-white p-6 sm:p-8 rounded-2xl shadow-sm space-y-5">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Step 2 of 5</span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Organization Information</h2>
              <p className="text-xs text-slate-600 font-normal">
                Enter your company, institute, or university official details.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold uppercase text-slate-700">Legal Organization Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Global Technologies Inc."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-700">Official Work Email *</label>
                <input
                  type="email"
                  placeholder="contact@company.com"
                  value={officialEmail}
                  onChange={(e) => setOfficialEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-700">Contact Number</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-700">Industry or Domain *</label>
                <input
                  type="text"
                  placeholder="e.g. Enterprise Cloud Computing"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-700">Country</label>
                <input
                  type="text"
                  placeholder="e.g. India"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-700">Organization Size</label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                >
                  <option value="1-20">1-20 Members</option>
                  <option value="20-50">20-50 Members</option>
                  <option value="50-200">50-200 Members</option>
                  <option value="200-1000">200-1000 Members</option>
                  <option value="1000+">1000+ Members</option>
                </select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold uppercase text-slate-700">Official Website</label>
                <input
                  type="url"
                  placeholder="https://company.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold uppercase text-slate-700">Brief Description</label>
                <textarea
                  rows={2}
                  placeholder="Explain your organization's mission or internship focus..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(1)} className="rounded-xl">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={() => setCurrentStep(3)}
                disabled={!name || !officialEmail}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 rounded-xl"
              >
                Continue to Admin Account
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Admin Account */}
        {currentStep === 3 && (
          <Card className="border-slate-200 bg-white p-6 sm:p-8 rounded-2xl shadow-sm space-y-5">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Step 3 of 5</span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create Administrator Profile</h2>
              <p className="text-xs text-slate-600 font-normal">
                This administrator will receive primary ownership of the organization workspace.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-700">Administrator Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Elena Rostova"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-700">Work Email Address *</label>
                <input
                  type="email"
                  placeholder="admin@company.com"
                  value={adminEmail || officialEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-700">Admin Password *</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(2)} className="rounded-xl">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={() => setCurrentStep(4)}
                disabled={!adminName}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 rounded-xl"
              >
                Continue to Verification
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 4: Organization Verification */}
        {currentStep === 4 && (
          <Card className="border-slate-200 bg-white p-6 sm:p-8 rounded-2xl shadow-sm space-y-5">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Step 4 of 5</span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Organization Verification</h2>
              <p className="text-xs text-slate-600 font-normal">
                To prevent unauthorized or fraudulent workspaces, provide verification evidence for review.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-700">Verification Method</label>
                <div className="space-y-2">
                  {[
                    { id: "OFFICIAL_DOMAIN", label: "Official Corporate Domain Matching Email", sub: "Automatic verification if work email matches official domain." },
                    { id: "WEBSITE_VERIFICATION", label: "Corporate / Institutional Website Link", sub: "Direct listing on official college or company domain." },
                    { id: "MANUAL_SUPERADMIN", label: "Manual Platform Super Admin Review", sub: "Platform administrators review public registrations and accreditation." },
                  ].map((m) => (
                    <label
                      key={m.id}
                      className={`flex items-start p-3.5 rounded-xl border cursor-pointer ${
                        verificationMethod === m.id ? "border-blue-600 bg-blue-50/50" : "border-slate-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="method"
                        checked={verificationMethod === m.id}
                        onChange={() => setVerificationMethod(m.id)}
                        className="mt-0.5 mr-3"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">{m.label}</p>
                        <p className="text-[11px] text-slate-500">{m.sub}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-700">Supporting Verification Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Registered in Delaware #829104, official registrar link..."
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(3)} className="rounded-xl">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleCreateWorkspace}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 rounded-xl shadow-md"
              >
                Create Workspace & Generate Code
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 5: Workspace Created with Setup Checklist */}
        {currentStep === 5 && createdWorkspace && (
          <Card className="border-emerald-200 bg-white p-6 sm:p-10 rounded-2xl shadow-xl space-y-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2 shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Workspace Created Successfully
              </span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight pt-1">
                {createdWorkspace.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto font-normal">
                Your enterprise workspace has been established with full logical tenant isolation and default operational permissions.
              </p>
            </div>

            {/* Unique Organization Code Card (Section 6) */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-center space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                Your System-Generated Organization Code
              </span>
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl font-mono font-black tracking-widest text-blue-900 bg-white px-5 py-2 rounded-xl border border-blue-300 shadow-xs">
                  {createdWorkspace.code}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyCodeToClipboard}
                  className="rounded-xl border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-600 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                  {copiedCode ? "Copied" : "Copy Code"}
                </Button>
              </div>
              <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                Share this code with your interns, students, and employees. They can enter it at <span className="font-semibold text-slate-700">/join</span> to discover and join your workspace.
              </p>
            </div>

            {/* Workspace Setup Checklist */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Workspace Setup Checklist
              </h4>
              <div className="space-y-2">
                {[
                  { title: "Configure Departments & Teams", desc: "Create organizational structure and assign team leads.", icon: <FolderTree className="w-4 h-4 text-blue-600" /> },
                  { title: "Define Internship or Training Programs", desc: "Set curriculum, durations, and capacity thresholds.", icon: <Sparkles className="w-4 h-4 text-indigo-600" /> },
                  { title: "Invite Initial Members", desc: "Send invitations to supervisors, mentors, and intern cohorts.", icon: <Users className="w-4 h-4 text-emerald-600" /> },
                  { title: "Establish Working Hours & Attendance Rules", desc: "Set shift expectations, grace periods, and break policies.", icon: <Settings className="w-4 h-4 text-amber-600" /> },
                ].map((item, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{item.title}</p>
                      <p className="text-[11px] text-slate-500 font-normal">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action CTA */}
            <div className="pt-4 flex justify-center">
              <Link href="/workspace">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-9 rounded-xl shadow-lg">
                  Enter Organization Workspace
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </main>

      <footer className="py-6 border-t border-slate-200 text-center text-xs text-slate-500">
        InternDesk Multi-Tenant Onboarding • Zero Setup or Registration Fees
      </footer>
    </div>
  );
}
