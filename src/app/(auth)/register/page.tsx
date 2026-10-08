"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Building,
  User,
  FileCheck,
  ShieldCheck,
  Mail,
  Clock,
  Sparkles,
  AlertCircle,
  RefreshCw,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { sendEmailOtp, verifyEmailOtp } from "@/lib/auth/actions";
import type { RegistrationFormData } from "@/validations/registration";

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
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

  // Handle Resend Cooldown Countdown
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

  // STEP 1 VALIDATION (Basic Information)
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

  // STEP 2 VALIDATION (Academic Information)
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

    // Automatically trigger OTP send when moving to Step 3 if not yet verified
    if (!otpVerified) {
      triggerSendOtp(formData.email);
    }
    setCurrentStep(3);
  };

  // STEP 3: OTP SEND / RESEND
  const triggerSendOtp = async (email: string) => {
    setIsSendingOtp(true);
    setOtpMessage(null);
    try {
      const res = await sendEmailOtp(email);
      if (res.success) {
        setOtpSent(true);
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

  // STEP 3: OTP VERIFICATION
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
          setCurrentStep(4); // Advance to Review
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

  // STEP 4: SUBMIT FREE REGISTRATION (No Payment!)
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
      setCurrentStep(5); // Success Screen
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission failed. Please try again.";
      setErrors({ submission: msg });
    } finally {
      setIsSubmitting(false);
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
      <div className="max-w-2xl mx-auto text-center mb-8">
        <div className="flex justify-center mb-3">
          <AnimatedLogo size="lg" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Student Free Registration
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
          Create your account for free to connect with mentors, learning tracks, and official internship cohorts.
        </p>

        {/* Highlight Banner: 100% Free Registration */}
        <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Registration is 100% Free • No Credit Card Required</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Step Progress Tracker */}
        {currentStep <= 4 && (
          <div className="mb-8 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
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
                  <CardDescription>
                    Provide your primary legal contact details.
                  </CardDescription>
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
                <Button onClick={handleNextFromStep1} size="lg" className="bg-blue-600 hover:bg-blue-700 font-semibold px-6 rounded-xl">
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
                  <option value="Modern Fullstack Web Development">Full Stack Web Development (Next.js, Node.js, SQL)</option>
                  <option value="Python for Enterprise & Automation">Python &amp; AI Engineering (Python, FastAPI, PyTorch)</option>
                  <option value="Data Science & Analytics">Data Science &amp; Analytics (Pandas, PowerBI, SQL)</option>
                  <option value="Applied AI & Machine Learning">Machine Learning &amp; Applied AI (Scikit-Learn, MLOps)</option>
                  <option value="Enterprise Java Development">Cloud &amp; DevOps Engineering (Docker, AWS, CI/CD)</option>
                  <option value="Database Development">Database Architecture &amp; SQL (PostgreSQL, Redis)</option>
                </select>
                {errors.technology && (
                  <p className="text-xs text-red-600 mt-1">{errors.technology}</p>
                )}
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
                <Button onClick={handleNextFromStep2} size="lg" className="bg-blue-600 hover:bg-blue-700 font-semibold px-6 rounded-xl">
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
              {/* OTP Input Field */}
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
                <span className="text-xs text-slate-500 block">
                  Enter 6 numeric digits
                </span>
              </div>

              {/* Status Message */}
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

              {/* Resend OTP Button */}
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
                  <CardDescription>
                    Review your information before submitting for administrator verification.
                  </CardDescription>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700">
                  Step 4 of 4
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                    Candidate Profile
                  </span>
                  <p className="text-sm font-bold text-slate-900">{formData.fullName}</p>
                  <p className="text-xs text-slate-600">{formData.email}</p>
                  <p className="text-xs text-slate-600 font-mono">+91 {formData.mobile}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                    Academic Institution
                  </span>
                  <p className="text-sm font-bold text-slate-900">{formData.college}</p>
                  <p className="text-xs text-slate-600">{formData.university}</p>
                  <p className="text-xs text-slate-600">{formData.course} • {formData.semester}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  Chosen Technology Track
                </span>
                <p className="text-sm font-bold text-blue-900">{formData.technology}</p>
                <p className="text-xs text-slate-500">
                  Academic cohort with live work sessions, daily progress tracking, and verified certificates.
                </p>
              </div>

              {/* CRITICAL BUSINESS NOTICE (Section 13) */}
              <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-xs space-y-1 text-blue-950">
                <div className="flex items-center gap-2 font-bold text-blue-800">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Registration is completely FREE</span>
                </div>
                <p className="text-blue-900/80 leading-relaxed">
                  Submitting your student registration carries no fee. Program enrollment fees apply only after your application has been verified and approved by the administration team.
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

        {/* STEP 5: REGISTRATION SUCCESS SCREEN (Master Prompt Section 14) */}
        {currentStep === 5 && applicationSuccessData && (
          <Card className="shadow-xl border-emerald-200 bg-white rounded-2xl text-center overflow-hidden">
            <div className="bg-gradient-to-b from-emerald-50 to-white p-8 sm:p-10 space-y-6">
              {/* Large Animated Checkmark */}
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

              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                <span>Status: Pending Approval</span>
              </div>

              {/* Application Details Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-xs space-y-2 text-left">
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Application Number:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {applicationSuccessData.applicationNumber}
                  </span>
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

              {/* Timeline (Section 14) */}
              <div className="max-w-md mx-auto pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3 text-left">
                  Verification Lifecycle
                </span>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                    <span className="text-[10px] font-bold text-emerald-700 block">Submitted</span>
                    <span className="text-xs text-emerald-600 font-bold">Done ✓</span>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-50 border border-amber-200">
                    <span className="text-[10px] font-bold text-amber-800 block">Under Review</span>
                    <span className="text-xs text-amber-600 font-bold">Active ●</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 block">Approved</span>
                    <span className="text-xs text-slate-400">Next</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 block">Login Ready</span>
                    <span className="text-xs text-slate-400">Final</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
                <Link href="/student/status">
                  <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold">
                    Track Application Status
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-xl font-semibold">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
