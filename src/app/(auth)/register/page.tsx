"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Building,
  Building2,
  User,
  FileCheck,
  Mail,
  Clock,
  Sparkles,
  AlertCircle,
  RefreshCw,
  GraduationCap,
  Landmark,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { sendEmailOtp, verifyEmailOtp, registerOrganizationSession } from "@/lib/auth/actions";
import { multiTenantStore } from "@/lib/multitenant/store";
import type { JoiningPolicy } from "@/types/multitenant";
import type { RegistrationFormData } from "@/validations/registration";

export default function RegisterPage() {
  // Top-level account type switcher: Student, Company, Institute
  const [accountType, setAccountType] = useState<"STUDENT" | "COMPANY" | "INSTITUTE">("STUDENT");

  // STUDENT REGISTRATION STATE
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpMessage, setOtpMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [applicationSuccessData, setApplicationSuccessData] = useState<{
    applicationNumber: string;
    studentName: string;
    email: string;
    technology: string;
  } | null>(null);

  const [formData, setFormData] = useState<RegistrationFormData>({
    fullName: "",
    email: "",
    mobile: "",
    dateOfBirth: "",
    address: "",
    college: "",
    university: "",
    course: "B.Tech Computer Science",
    semester: "Final Year",
    technology: "Modern Fullstack Web Development",
    duration: "3 Months",
    startDate: "2026-10-08",
    category: "Academic Internship",
  });

  // COMPANY REGISTRATION STATE
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyIndustry, setCompanyIndustry] = useState("Software & IT Services");
  const [companySize, setCompanySize] = useState("11-50 Employees");
  const [companyAdminName, setCompanyAdminName] = useState("");
  const [companyAdminPassword, setCompanyAdminPassword] = useState("");
  const [companyPolicy, setCompanyPolicy] = useState<JoiningPolicy>("REQUEST_APPROVAL");
  const [companyAgreed, setCompanyAgreed] = useState(true);
  const [companyErrors, setCompanyErrors] = useState<Record<string, string>>({});
  const [isCompanySubmitting, setIsCompanySubmitting] = useState(false);
  const [companySuccess, setCompanySuccess] = useState<{ id: string; name: string; code: string } | null>(null);
  const [companyCodeCopied, setCompanyCodeCopied] = useState(false);

  // INSTITUTE REGISTRATION STATE
  const [instituteName, setInstituteName] = useState("");
  const [instituteEmail, setInstituteEmail] = useState("");
  const [institutePhone, setInstitutePhone] = useState("");
  const [instituteWebsite, setInstituteWebsite] = useState("");
  const [instituteCategory, setInstituteCategory] = useState("Autonomous Engineering College");
  const [instituteCapacity, setInstituteCapacity] = useState("1,000 - 5,000 Students");
  const [instituteAdminName, setInstituteAdminName] = useState("");
  const [instituteAdminPassword, setInstituteAdminPassword] = useState("");
  const [instituteAccreditation, setInstituteAccreditation] = useState("");
  const [instituteAgreed, setInstituteAgreed] = useState(true);
  const [instituteErrors, setInstituteErrors] = useState<Record<string, string>>({});
  const [isInstituteSubmitting, setIsInstituteSubmitting] = useState(false);
  const [instituteSuccess, setInstituteSuccess] = useState<{ id: string; name: string; code: string } | null>(null);
  const [instituteCodeCopied, setInstituteCodeCopied] = useState(false);

  // Handle Resend Cooldown Countdown for Student OTP
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const updateField = (field: keyof RegistrationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // STUDENT STEP 1 VALIDATION (Basic Information)
  const handleNextFromStep1 = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      errs.fullName = "Full legal name is required (at least 2 characters).";
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      errs.email = "Please enter a valid email address.";
    }
    if (!formData.mobile.trim() || !/^\d{10}$/.test(formData.mobile.trim())) {
      errs.mobile = "Please enter a valid 10-digit mobile number.";
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setCurrentStep(2);
  };

  // STUDENT STEP 2 VALIDATION (Academic Information)
  const handleNextFromStep2 = () => {
    const errs: Record<string, string> = {};
    if (!formData.college.trim()) {
      errs.college = "College/Institute name is required.";
    }
    if (!formData.university.trim()) {
      errs.university = "Affiliated University is required.";
    }
    if (!formData.technology) {
      errs.technology = "Please select your primary technology domain.";
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});

    if (!otpVerified) {
      triggerSendOtp(formData.email);
    }
    setCurrentStep(3);
  };

  // STUDENT STEP 3: OTP SEND / RESEND
  const triggerSendOtp = async (email: string) => {
    setIsSendingOtp(true);
    setOtpMessage(null);
    try {
      const res = await sendEmailOtp(email);
      if (res.success) {
        setResendCooldown(30);
        setOtpMessage({ text: res.message, type: "success" });
      } else {
        setOtpMessage({ text: res.message || "Failed to dispatch email verification code.", type: "error" });
      }
    } catch {
      setOtpMessage({ text: "Network error sending code. Please try again.", type: "error" });
    } finally {
      setIsSendingOtp(false);
    }
  };

  // STUDENT STEP 3: OTP VERIFICATION
  const handleVerifyOtp = async () => {
    if (!otpCode.trim() || !/^\d{6}$/.test(otpCode.trim())) {
      setOtpMessage({ text: "Please enter the complete 6-digit numeric verification code.", type: "error" });
      return;
    }
    setIsVerifyingOtp(true);
    setOtpMessage(null);
    try {
      const res = await verifyEmailOtp(formData.email, otpCode.trim());
      if (res.success) {
        setOtpVerified(true);
        setOtpMessage({ text: "Email address verified successfully!", type: "success" });
        setTimeout(() => {
          setCurrentStep(4);
        }, 600);
      } else {
        setOtpMessage({ text: res.message || "Invalid verification code. Please check your inbox.", type: "error" });
      }
    } catch {
      setOtpMessage({ text: "Verification failed. Please retry.", type: "error" });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // STUDENT STEP 4: SUBMIT FREE REGISTRATION
  const handleSubmitRegistration = async () => {
    setIsSubmitting(true);
    setErrors({});
    try {
      const res = await fetch("/api/registrations/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit registration.");
      }

      setApplicationSuccessData({
        applicationNumber: data.applicationNumber || `ID-APP-${Date.now().toString().slice(-6)}`,
        studentName: formData.fullName,
        email: formData.email,
        technology: formData.technology,
      });
      setCurrentStep(5);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission failed. Please try again.";
      setErrors({ submission: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  // COMPANY SUBMIT HANDLER
  const handleRegisterCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!companyName.trim() || companyName.trim().length < 2) {
      errs.companyName = "Company / Corporate name is required.";
    }
    if (!companyEmail.trim() || !companyEmail.includes("@")) {
      errs.companyEmail = "Official corporate work email is required.";
    }
    if (!companyAdminName.trim() || companyAdminName.trim().length < 2) {
      errs.companyAdminName = "Administrator full name is required.";
    }
    if (!companyAdminPassword || companyAdminPassword.length < 6) {
      errs.companyAdminPassword = "Password must be at least 6 characters.";
    }
    if (!companyAgreed) {
      errs.companyAgreed = "Please agree to the enterprise compliance policy.";
    }

    if (Object.keys(errs).length > 0) {
      setCompanyErrors(errs);
      return;
    }
    setCompanyErrors({});
    setIsCompanySubmitting(true);

    try {
      const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `corp-${Date.now()}`;
      const newOrg = multiTenantStore.createOrganization({
        name: companyName.trim(),
        slug,
        type: "CORPORATE",
        official_email: companyEmail.trim(),
        contact_number: companyPhone.trim(),
        website: companyWebsite.trim(),
        country: "India",
        size: companySize,
        industry_or_category: companyIndustry,
        description: `${companyName} Corporate Internship and Workforce Management Workspace.`,
        joining_policy: companyPolicy,
        allowed_email_domains: companyEmail.includes("@") ? [`@${companyEmail.split("@")[1]}`] : [],
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
          requireDocumentApproval: true,
        },
      });

      const userId = `usr-${Date.now()}`;
      multiTenantStore.addMembership({
        organization_id: newOrg.id,
        user_id: userId,
        role: "ORG_ADMIN",
        member_type: "ADMIN",
        status: "ACTIVE",
        job_title: "Corporate Workspace Administrator",
        user_full_name: companyAdminName.trim(),
        user_email: companyEmail.trim(),
        joined_at: new Date().toISOString(),
      });

      await registerOrganizationSession({
        userId,
        name: companyAdminName.trim(),
        email: companyEmail.trim(),
        role: "ORG_ADMIN",
        orgId: newOrg.id,
      });

      setCompanySuccess({
        id: newOrg.id,
        name: newOrg.name,
        code: newOrg.code,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to register company workspace.";
      setCompanyErrors({ submission: msg });
    } finally {
      setIsCompanySubmitting(false);
    }
  };

  // INSTITUTE SUBMIT HANDLER
  const handleRegisterInstitute = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!instituteName.trim() || instituteName.trim().length < 2) {
      errs.instituteName = "Institution / University legal name is required.";
    }
    if (!instituteEmail.trim() || !instituteEmail.includes("@")) {
      errs.instituteEmail = "Official academic email address is required.";
    }
    if (!instituteAdminName.trim() || instituteAdminName.trim().length < 2) {
      errs.instituteAdminName = "Dean / Coordinator full name is required.";
    }
    if (!instituteAdminPassword || instituteAdminPassword.length < 6) {
      errs.instituteAdminPassword = "Password must be at least 6 characters.";
    }
    if (!instituteAgreed) {
      errs.instituteAgreed = "Please confirm authorization for this institution.";
    }

    if (Object.keys(errs).length > 0) {
      setInstituteErrors(errs);
      return;
    }
    setInstituteErrors({});
    setIsInstituteSubmitting(true);

    try {
      const slug = instituteName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `inst-${Date.now()}`;
      const newOrg = multiTenantStore.createOrganization({
        name: instituteName.trim(),
        slug,
        type: "EDUCATIONAL",
        official_email: instituteEmail.trim(),
        contact_number: institutePhone.trim(),
        website: instituteWebsite.trim(),
        country: "India",
        size: instituteCapacity,
        industry_or_category: instituteCategory,
        description: `${instituteName} Academic Internship Portal & Accreditation Ledger.`,
        joining_policy: "REQUEST_APPROVAL",
        allowed_email_domains: instituteEmail.includes("@") ? [`@${instituteEmail.split("@")[1]}`] : [],
        settings: {
          workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          expectedDailyHours: 8,
          gracePeriodMinutes: 15,
          allowedBreakMinutes: 60,
          timeZone: "Asia/Kolkata",
          dateFormat: "DD/MM/YYYY",
          primaryColor: "#4F46E5",
          requireReportReview: true,
          autoApproveAttendance: false,
          requireDocumentApproval: true,
        },
      });

      const userId = `usr-${Date.now()}`;
      multiTenantStore.addMembership({
        organization_id: newOrg.id,
        user_id: userId,
        role: "ORG_ADMIN",
        member_type: "ADMIN",
        status: "ACTIVE",
        job_title: "Academic Internship Coordinator / Dean",
        user_full_name: instituteAdminName.trim(),
        user_email: instituteEmail.trim(),
        joined_at: new Date().toISOString(),
      });

      await registerOrganizationSession({
        userId,
        name: instituteAdminName.trim(),
        email: instituteEmail.trim(),
        role: "ORG_ADMIN",
        orgId: newOrg.id,
      });

      setInstituteSuccess({
        id: newOrg.id,
        name: newOrg.name,
        code: newOrg.code,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to register educational institute.";
      setInstituteErrors({ submission: msg });
    } finally {
      setIsInstituteSubmitting(false);
    }
  };

  const stepsList = [
    { num: 1, label: "Basic Info", icon: <User className="w-4 h-4" /> },
    { num: 2, label: "Academic Info", icon: <Building className="w-4 h-4" /> },
    { num: 3, label: "Email OTP", icon: <Mail className="w-4 h-4" /> },
    { num: 4, label: "Review", icon: <FileCheck className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-white to-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="max-w-3xl mx-auto text-center mb-8">
        <div className="flex justify-center mb-3">
          <AnimatedLogo size="lg" />
        </div>

        {/* Dynamic Title based on selected account type */}
        {accountType === "STUDENT" && (
          <>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Student Free Registration
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
              Create your account for free to connect with mentors, learning tracks, and official internship cohorts.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Registration is 100% Free • No Credit Card Required</span>
            </div>
          </>
        )}

        {accountType === "COMPANY" && (
          <>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Register Company / Corporate Workspace
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
              Set up your enterprise workspace to recruit interns, manage department projects, track daily work sessions, and issue verified credentials.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold shadow-2xs">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Instant Workspace Creation • Multi-Tenant Enterprise Tier</span>
            </div>
          </>
        )}

        {accountType === "INSTITUTE" && (
          <>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Register Institute / University Portal
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
              Register your higher education institute to supervise student batches, track academic progress, and manage accreditation ledgers.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold shadow-2xs">
              <Landmark className="w-3.5 h-3.5 text-indigo-600" />
              <span>NAAC &amp; NBA Compliant • Academic Cohort Governance</span>
            </div>
          </>
        )}
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Account Type Selector (Student, Company, Institute) */}
        <div className="mb-8">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5 block text-center">
            Select Your Account Category
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Card 1: Student */}
            <button
              type="button"
              onClick={() => setAccountType("STUDENT")}
              className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                accountType === "STUDENT"
                  ? "bg-blue-50/70 border-blue-600 shadow-md ring-2 ring-blue-100"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    accountType === "STUDENT" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Free
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Student / Intern</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Apply for cohorts &amp; skill tracks</p>
              </div>
            </button>

            {/* Card 2: Company */}
            <button
              type="button"
              onClick={() => setAccountType("COMPANY")}
              className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                accountType === "COMPANY"
                  ? "bg-blue-50/70 border-blue-600 shadow-md ring-2 ring-blue-100"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    accountType === "COMPANY" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  Corporate
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Company / Corporate</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Hire, track &amp; manage interns</p>
              </div>
            </button>

            {/* Card 3: Institute */}
            <button
              type="button"
              onClick={() => setAccountType("INSTITUTE")}
              className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                accountType === "INSTITUTE"
                  ? "bg-blue-50/70 border-blue-600 shadow-md ring-2 ring-blue-100"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    accountType === "INSTITUTE" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Landmark className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  Academic
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Institute / University</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Supervise batches &amp; credits</p>
              </div>
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* VIEW 1: STUDENT REGISTRATION FLOW                                   */}
        {/* ------------------------------------------------------------------ */}
        {accountType === "STUDENT" && (
          <div className="space-y-6">
            {/* Step Progress Tracker */}
            {currentStep <= 4 && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                <div className="grid grid-cols-4 gap-2">
                  {stepsList.map((s) => {
                    const isCurrent = currentStep === s.num;
                    const isPassed = currentStep > s.num;
                    return (
                      <div key={s.num} className="flex flex-col items-center text-center">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                            isCurrent
                              ? "bg-blue-600 text-white ring-4 ring-blue-100 shadow-xs"
                              : isPassed
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {isPassed ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                        </div>
                        <span
                          className={`text-[11px] font-semibold mt-1.5 hidden sm:block ${
                            isCurrent ? "text-blue-600" : isPassed ? "text-emerald-700" : "text-slate-400"
                          }`}
                        >
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 1: BASIC INFORMATION */}
            {currentStep === 1 && (
              <Card className="shadow-md border-slate-200/90 rounded-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold">Step 1 — Basic Information</CardTitle>
                      <CardDescription>Provide your primary legal contact details.</CardDescription>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700">
                      Step 1 of 4
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    label="Full Legal Name"
                    placeholder="e.g. Aarav Sharma"
                    value={formData.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    error={errors.fullName}
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Email Address (OTP will be sent here)"
                      type="email"
                      placeholder="aarav@college.edu"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      error={errors.email}
                      required
                    />
                    <Input
                      label="10-Digit Mobile Number"
                      placeholder="9876543210"
                      maxLength={10}
                      value={formData.mobile}
                      onChange={(e) => updateField("mobile", e.target.value)}
                      error={errors.mobile}
                      required
                    />
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <Link href="/login" className="text-xs font-semibold text-slate-500 hover:text-blue-600">
                      Already registered? Sign In
                    </Link>
                    <Button
                      onClick={handleNextFromStep1}
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 font-semibold px-6 rounded-xl"
                    >
                      Next: Academic Info
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* STEP 2: ACADEMIC INFORMATION */}
            {currentStep === 2 && (
              <Card className="shadow-md border-slate-200/90 rounded-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold">Step 2 — Academic Information</CardTitle>
                      <CardDescription>
                        Specify your college, university, and desired technology specialization.
                      </CardDescription>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700">
                      Step 2 of 4
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="College / Institute Name"
                      placeholder="e.g. National Institute of Technology"
                      value={formData.college}
                      onChange={(e) => updateField("college", e.target.value)}
                      error={errors.college}
                      required
                    />
                    <Input
                      label="Affiliated University"
                      placeholder="e.g. State Technical University"
                      value={formData.university}
                      onChange={(e) => updateField("university", e.target.value)}
                      error={errors.university}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700">
                      Primary Technology Domain <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.technology}
                      onChange={(e) => updateField("technology", e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                    >
                      <option value="Modern Fullstack Web Development">
                        Full Stack Web Development (Next.js, Node.js, SQL)
                      </option>
                      <option value="Python for Enterprise & Automation">
                        Python &amp; AI Engineering (Python, FastAPI, PyTorch)
                      </option>
                      <option value="Data Science & Analytics">Data Science &amp; Analytics (Pandas, PowerBI, SQL)</option>
                      <option value="Applied AI & Machine Learning">
                        Machine Learning &amp; Applied AI (Scikit-Learn, MLOps)
                      </option>
                      <option value="Enterprise Java Development">
                        Cloud &amp; DevOps Engineering (Docker, AWS, CI/CD)
                      </option>
                      <option value="Database Development">Database Architecture &amp; SQL (PostgreSQL, Redis)</option>
                    </select>
                    {errors.technology && <p className="text-xs text-red-600 mt-1">{errors.technology}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Course / Degree"
                      placeholder="e.g. B.Tech Computer Science"
                      value={formData.course}
                      onChange={(e) => updateField("course", e.target.value)}
                    />
                    <Input
                      label="Current Semester / Year"
                      placeholder="e.g. Final Year / 6th Semester"
                      value={formData.semester}
                      onChange={(e) => updateField("semester", e.target.value)}
                    />
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(1)} className="rounded-xl">
                      <ArrowLeft className="w-4 h-4 mr-1.5" />
                      Back
                    </Button>
                    <Button
                      onClick={handleNextFromStep2}
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 font-semibold px-6 rounded-xl"
                    >
                      Next: Verify Email
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* STEP 3: EMAIL OTP VERIFICATION */}
            {currentStep === 3 && (
              <Card className="shadow-md border-slate-200/90 rounded-2xl">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                    <Mail className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-lg font-bold">Step 3 — Email Verification</CardTitle>
                  <CardDescription>
                    Enter the 6-digit verification code sent to <strong className="text-slate-800">{formData.email}</strong>.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="max-w-xs mx-auto space-y-2 text-center">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="• • • • • •"
                      value={otpCode}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/\D/g, "");
                        setOtpCode(clean);
                        if (otpMessage?.type === "error") setOtpMessage(null);
                      }}
                      className="w-full text-center text-3xl font-mono tracking-widest py-3 border-2 border-slate-200 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                      autoFocus
                    />
                    <span className="text-xs text-slate-500 block">Enter 6 numeric digits</span>
                  </div>

                  {otpMessage && (
                    <div
                      className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                        otpMessage.type === "success"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {otpMessage.type === "success" ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      )}
                      <span>{otpMessage.text}</span>
                    </div>
                  )}

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => triggerSendOtp(formData.email)}
                      disabled={resendCooldown > 0 || isSendingOtp}
                      className={`text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                        resendCooldown > 0 || isSendingOtp
                          ? "text-slate-400 cursor-not-allowed"
                          : "text-blue-600 hover:text-blue-800 hover:underline"
                      }`}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSendingOtp ? "animate-spin" : ""}`} />
                      {isSendingOtp
                        ? "Sending OTP..."
                        : resendCooldown > 0
                        ? `Resend code in ${resendCooldown}s`
                        : "Resend OTP Code"}
                    </button>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(2)} className="rounded-xl">
                      <ArrowLeft className="w-4 h-4 mr-1.5" />
                      Back
                    </Button>
                    <Button
                      onClick={handleVerifyOtp}
                      size="lg"
                      disabled={otpCode.length !== 6 || isVerifyingOtp}
                      className="bg-blue-600 hover:bg-blue-700 font-semibold px-6 rounded-xl"
                      isLoading={isVerifyingOtp}
                    >
                      Verify Code
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* STEP 4: REVIEW APPLICATION */}
            {currentStep === 4 && (
              <Card className="shadow-md border-slate-200/90 rounded-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold">Step 4 — Review Your Application</CardTitle>
                      <CardDescription>Review your information before submitting for verification.</CardDescription>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700">
                      Step 4 of 4
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Candidate Profile</span>
                      <p className="text-sm font-bold text-slate-900">{formData.fullName}</p>
                      <p className="text-xs text-slate-600">{formData.email}</p>
                      <p className="text-xs text-slate-600 font-mono">+91 {formData.mobile}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Academic Institution</span>
                      <p className="text-sm font-bold text-slate-900">{formData.college}</p>
                      <p className="text-xs text-slate-600">{formData.university}</p>
                      <p className="text-xs text-slate-600">
                        {formData.course} • {formData.semester}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Chosen Technology Track</span>
                    <p className="text-sm font-bold text-blue-900">{formData.technology}</p>
                    <p className="text-xs text-slate-500">
                      Academic cohort with live work sessions, daily progress tracking, and verified certificates.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-xs space-y-1 text-blue-950">
                    <div className="flex items-center gap-2 font-bold text-blue-800">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>Registration is completely FREE</span>
                    </div>
                    <p className="text-blue-900/80 leading-relaxed">
                      Submitting your student registration carries no fee. Program enrollment fees apply only after your application has been verified.
                    </p>
                  </div>

                  {errors.submission && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                      {errors.submission}
                    </div>
                  )}

                  <div className="pt-4 flex items-center justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(2)} disabled={isSubmitting} className="rounded-xl">
                      <ArrowLeft className="w-4 h-4 mr-1.5" />
                      Back
                    </Button>
                    <Button
                      onClick={handleSubmitRegistration}
                      size="lg"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 rounded-xl shadow-xs"
                      isLoading={isSubmitting}
                    >
                      Submit Registration
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* STEP 5: STUDENT REGISTRATION SUCCESS SCREEN */}
            {currentStep === 5 && applicationSuccessData && (
              <Card className="shadow-xl border-emerald-200 bg-white rounded-2xl text-center overflow-hidden">
                <div className="bg-gradient-to-b from-emerald-50 to-white p-8 sm:p-10 space-y-6">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50 shadow-inner animate-bounce">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      Registration Submitted Successfully
                    </h2>
                    <p className="text-sm text-slate-600 max-w-md mx-auto">
                      Your registration has been submitted and is awaiting administrator verification.
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                    <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                    <span>Status: Pending Approval</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-xs space-y-2 text-left">
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span className="text-slate-500">Application Number:</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">{applicationSuccessData.applicationNumber}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span className="text-slate-500">Student Name:</span>
                      <span className="font-semibold text-slate-800">{applicationSuccessData.studentName}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span className="text-slate-500">Registered Email:</span>
                      <span className="font-semibold text-slate-800">{applicationSuccessData.email}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-500">Domain:</span>
                      <span className="font-semibold text-blue-700">{applicationSuccessData.technology}</span>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
                    <Link href="/student/dashboard">
                      <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold">
                        Enter Student Portal
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Button>
                    </Link>
                    <Link href="/student/status">
                      <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-xl font-semibold">
                        Track Status
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* VIEW 2: COMPANY / CORPORATE REGISTRATION FLOW                      */}
        {/* ------------------------------------------------------------------ */}
        {accountType === "COMPANY" && (
          <div className="space-y-6">
            {!companySuccess ? (
              <Card className="shadow-md border-slate-200/90 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <span>Company Workspace Registration</span>
                  </CardTitle>
                  <CardDescription>
                    Fill in your organization details to provision an isolated corporate workspace with recruitment and supervision tools.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegisterCompany} className="space-y-5">
                    {/* Organization Basic Details */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pb-2">
                        1. Corporate Entity Details
                      </h3>

                      <Input
                        label="Company Legal Name"
                        placeholder="e.g. Apex Technologies Inc."
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        error={companyErrors.companyName}
                        required
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Official Corporate Work Email"
                          type="email"
                          placeholder="hr@apextech.com"
                          value={companyEmail}
                          onChange={(e) => setCompanyEmail(e.target.value)}
                          error={companyErrors.companyEmail}
                          required
                        />
                        <Input
                          label="Contact Phone Number"
                          placeholder="+91 98765 43210"
                          value={companyPhone}
                          onChange={(e) => setCompanyPhone(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Input
                          label="Corporate Website URL"
                          placeholder="https://apextech.com"
                          value={companyWebsite}
                          onChange={(e) => setCompanyWebsite(e.target.value)}
                        />

                        <div className="space-y-1.5">
                          <label className="block text-sm font-medium text-slate-700">Industry Domain</label>
                          <select
                            value={companyIndustry}
                            onChange={(e) => setCompanyIndustry(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                          >
                            <option value="Software & IT Services">Software &amp; IT Services</option>
                            <option value="Fintech & Banking">Fintech &amp; Banking</option>
                            <option value="Healthcare & Biotech">Healthcare &amp; Biotech</option>
                            <option value="Manufacturing & Hardware">Manufacturing &amp; Hardware</option>
                            <option value="E-Commerce & Logistics">E-Commerce &amp; Logistics</option>
                            <option value="Consulting & Digital Marketing">Consulting &amp; Digital Marketing</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-sm font-medium text-slate-700">Company Size</label>
                          <select
                            value={companySize}
                            onChange={(e) => setCompanySize(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                          >
                            <option value="1-10 Employees">1-10 Employees (Startup)</option>
                            <option value="11-50 Employees">11-50 Employees (Growing)</option>
                            <option value="51-200 Employees">51-200 Employees (Mid-Market)</option>
                            <option value="201-1000 Employees">201-1,000 Employees (Scaleup)</option>
                            <option value="1000+ Enterprise">1,000+ Employees (Enterprise)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Primary Admin Credentials */}
                    <div className="space-y-4 pt-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pb-2">
                        2. Corporate Administrator Credentials
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Administrator Full Name"
                          placeholder="e.g. Vikram Malhotra"
                          value={companyAdminName}
                          onChange={(e) => setCompanyAdminName(e.target.value)}
                          error={companyErrors.companyAdminName}
                          required
                        />
                        <Input
                          label="Account Password"
                          type="password"
                          placeholder="••••••••"
                          value={companyAdminPassword}
                          onChange={(e) => setCompanyAdminPassword(e.target.value)}
                          error={companyErrors.companyAdminPassword}
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-slate-700">Intern Joining Governance Policy</label>
                        <select
                          value={companyPolicy}
                          onChange={(e) => setCompanyPolicy(e.target.value as JoiningPolicy)}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                        >
                          <option value="REQUEST_APPROVAL">Request Approval (Admin reviews candidate before entry)</option>
                          <option value="INVITATION_ONLY">Invitation Only (Members enter strictly via workspace code / invite link)</option>
                          <option value="OPEN_VERIFIED">Verified Domain Auto-Join (Anyone with company email is verified)</option>
                        </select>
                      </div>
                    </div>

                    {/* Terms Checkbox */}
                    <div className="pt-2">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={companyAgreed}
                          onChange={(e) => setCompanyAgreed(e.target.checked)}
                          className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs text-slate-600 leading-relaxed">
                          I certify that I am an authorized representative of this company and agree to the{" "}
                          <span className="text-blue-600 font-semibold hover:underline">Enterprise Workspace Terms</span> and{" "}
                          <span className="text-blue-600 font-semibold hover:underline">Data Protection Policy</span>.
                        </span>
                      </label>
                      {companyErrors.companyAgreed && (
                        <p className="text-xs text-red-600 mt-1">{companyErrors.companyAgreed}</p>
                      )}
                    </div>

                    {companyErrors.submission && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                        {companyErrors.submission}
                      </div>
                    )}

                    <div className="pt-4 flex items-center justify-between">
                      <Link href="/login" className="text-xs font-semibold text-slate-500 hover:text-blue-600">
                        Already have a corporate workspace? Sign In
                      </Link>
                      <Button
                        type="submit"
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700 font-bold px-8 rounded-xl shadow-xs"
                        isLoading={isCompanySubmitting}
                      >
                        Create Corporate Workspace
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              /* COMPANY SUCCESS CONFIRMATION */
              <Card className="shadow-xl border-blue-200 bg-white rounded-2xl text-center overflow-hidden">
                <div className="bg-gradient-to-b from-blue-50 to-white p-8 sm:p-10 space-y-6">
                  <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto ring-8 ring-blue-50 shadow-inner">
                    <Building2 className="w-10 h-10" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      Corporate Workspace Provisioned!
                    </h2>
                    <p className="text-sm text-slate-600 max-w-md mx-auto">
                      Your enterprise workspace has been created with administrator privileges and zero data leakage isolation.
                    </p>
                  </div>

                  {/* Workspace Code Pill */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto space-y-3 text-left">
                    <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                      <span className="text-xs text-slate-500 font-semibold">Workspace Name:</span>
                      <span className="text-xs font-bold text-slate-900">{companySuccess.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                      <span className="text-xs text-slate-500 font-semibold">Your Role:</span>
                      <span className="text-xs font-bold text-blue-700">Workspace Administrator (ORG_ADMIN)</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <div>
                        <span className="text-xs text-slate-500 font-semibold block">Unique Workspace Code:</span>
                        <span className="text-[11px] text-slate-400">Share this code with interns to join</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-black text-blue-900 bg-blue-100 px-3 py-1 rounded-lg border border-blue-300">
                          {companySuccess.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(companySuccess.code);
                            setCompanyCodeCopied(true);
                            setTimeout(() => setCompanyCodeCopied(false), 2000);
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600 text-xs flex items-center gap-1"
                        >
                          {companyCodeCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{companyCodeCopied ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
                    <Link href="/workspace">
                      <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 rounded-xl font-bold px-8 shadow-xs">
                        Open Corporate Workspace
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* VIEW 3: INSTITUTE / UNIVERSITY REGISTRATION FLOW                  */}
        {/* ------------------------------------------------------------------ */}
        {accountType === "INSTITUTE" && (
          <div className="space-y-6">
            {!instituteSuccess ? (
              <Card className="shadow-md border-slate-200/90 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-indigo-600" />
                    <span>Institute / University Portal Registration</span>
                  </CardTitle>
                  <CardDescription>
                    Register your educational institution to supervise academic cohorts, track verified hours, and audit accreditation documents.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegisterInstitute} className="space-y-5">
                    {/* Academic Institution Details */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pb-2">
                        1. Higher Education Institution Details
                      </h3>

                      <Input
                        label="Institution Legal Name"
                        placeholder="e.g. Westbridge Institute of Technology"
                        value={instituteName}
                        onChange={(e) => setInstituteName(e.target.value)}
                        error={instituteErrors.instituteName}
                        required
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Official Academic Email (.edu / .ac.in preferred)"
                          type="email"
                          placeholder="dean@westbridge.edu"
                          value={instituteEmail}
                          onChange={(e) => setInstituteEmail(e.target.value)}
                          error={instituteErrors.instituteEmail}
                          required
                        />
                        <Input
                          label="Placement Cell Contact Number"
                          placeholder="+91 98765 43210"
                          value={institutePhone}
                          onChange={(e) => setInstitutePhone(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Input
                          label="Institution Official Website"
                          placeholder="https://westbridge.edu"
                          value={instituteWebsite}
                          onChange={(e) => setInstituteWebsite(e.target.value)}
                        />

                        <div className="space-y-1.5">
                          <label className="block text-sm font-medium text-slate-700">Institution Category</label>
                          <select
                            value={instituteCategory}
                            onChange={(e) => setInstituteCategory(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
                          >
                            <option value="State / Central University">State / Central University</option>
                            <option value="Autonomous Engineering College">Autonomous Engineering College</option>
                            <option value="Polytechnic / Vocational Institute">Polytechnic / Vocational Institute</option>
                            <option value="Deemed-to-be University">Deemed-to-be University</option>
                            <option value="Affiliated Degree College">Affiliated Degree College</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-sm font-medium text-slate-700">Student Capacity</label>
                          <select
                            value={instituteCapacity}
                            onChange={(e) => setInstituteCapacity(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
                          >
                            <option value="Up to 1,000 Students">Up to 1,000 Students</option>
                            <option value="1,000 - 5,000 Students">1,000 - 5,000 Students</option>
                            <option value="5,000 - 15,000 Students">5,000 - 15,000 Students</option>
                            <option value="15,000+ Students">15,000+ Students</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Coordinator Credentials */}
                    <div className="space-y-4 pt-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pb-2">
                        2. Placement Cell Head / Coordinator Credentials
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Coordinator / Dean Full Name"
                          placeholder="e.g. Dr. David Kumar"
                          value={instituteAdminName}
                          onChange={(e) => setInstituteAdminName(e.target.value)}
                          error={instituteErrors.instituteAdminName}
                          required
                        />
                        <Input
                          label="Portal Password"
                          type="password"
                          placeholder="••••••••"
                          value={instituteAdminPassword}
                          onChange={(e) => setInstituteAdminPassword(e.target.value)}
                          error={instituteErrors.instituteAdminPassword}
                          required
                        />
                      </div>

                      <Input
                        label="Accreditation Details (NAAC / NBA / NIRF) - Optional"
                        placeholder="e.g. NAAC Grade A++, NBA Tier 1 Accredited"
                        value={instituteAccreditation}
                        onChange={(e) => setInstituteAccreditation(e.target.value)}
                      />
                    </div>

                    {/* Terms Checkbox */}
                    <div className="pt-2">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={instituteAgreed}
                          onChange={(e) => setInstituteAgreed(e.target.checked)}
                          className="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-xs text-slate-600 leading-relaxed">
                          I certify that I am authorized by this educational institution to administer internship cohorts, verify academic credits, and audit digital records.
                        </span>
                      </label>
                      {instituteErrors.instituteAgreed && (
                        <p className="text-xs text-red-600 mt-1">{instituteErrors.instituteAgreed}</p>
                      )}
                    </div>

                    {instituteErrors.submission && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                        {instituteErrors.submission}
                      </div>
                    )}

                    <div className="pt-4 flex items-center justify-between">
                      <Link href="/login" className="text-xs font-semibold text-slate-500 hover:text-indigo-600">
                        Already have an institutional portal? Sign In
                      </Link>
                      <Button
                        type="submit"
                        size="lg"
                        className="bg-indigo-600 hover:bg-indigo-700 font-bold px-8 rounded-xl shadow-xs"
                        isLoading={isInstituteSubmitting}
                      >
                        Create Institute Portal
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              /* INSTITUTE SUCCESS CONFIRMATION */
              <Card className="shadow-xl border-indigo-200 bg-white rounded-2xl text-center overflow-hidden">
                <div className="bg-gradient-to-b from-indigo-50 to-white p-8 sm:p-10 space-y-6">
                  <div className="w-20 h-20 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto ring-8 ring-indigo-50 shadow-inner">
                    <Landmark className="w-10 h-10" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      Institute Portal Activated!
                    </h2>
                    <p className="text-sm text-slate-600 max-w-md mx-auto">
                      Your university/college portal is active. You can now invite faculty supervisors, onboard student cohorts, and generate accreditation ledgers.
                    </p>
                  </div>

                  {/* Institution Details Pill */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto space-y-3 text-left">
                    <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                      <span className="text-xs text-slate-500 font-semibold">Institution Name:</span>
                      <span className="text-xs font-bold text-slate-900">{instituteSuccess.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                      <span className="text-xs text-slate-500 font-semibold">Your Role:</span>
                      <span className="text-xs font-bold text-indigo-700">Dean / Coordinator (ORG_ADMIN)</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <div>
                        <span className="text-xs text-slate-500 font-semibold block">University Code:</span>
                        <span className="text-[11px] text-slate-400">Share with students to join your academic cohort</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-black text-indigo-900 bg-indigo-100 px-3 py-1 rounded-lg border border-indigo-300">
                          {instituteSuccess.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(instituteSuccess.code);
                            setInstituteCodeCopied(true);
                            setTimeout(() => setInstituteCodeCopied(false), 2000);
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600 text-xs flex items-center gap-1"
                        >
                          {instituteCodeCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{instituteCodeCopied ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
                    <Link href="/workspace">
                      <Button size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold px-8 shadow-xs">
                        Open Institute Workspace
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
