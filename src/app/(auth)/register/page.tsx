"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Building,
  User,
  FileCheck,
  Mail,
  Lock,
  Sparkles,
  AlertCircle,
  RefreshCw,
  IdCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { sendEmailOtp, verifyEmailOtp, registerAccountAction } from "@/lib/auth/actions";
import { INSTITUTE_CONFIG } from "@/lib/institute/config";
import type { RegistrationFormData } from "@/validations/registration";

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [studentPassword, setStudentPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpMessage, setOtpMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [otpPreview, setOtpPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<RegistrationFormData>({
    fullName: "",
    email: "",
    studentId: "",
    mobile: "",
    dateOfBirth: "",
    address: "",
    department: INSTITUTE_CONFIG.departments[0].id,
    course: INSTITUTE_CONFIG.academicPrograms[0].name,
    semester: "Semester 6 (Final Year)",
    college: INSTITUTE_CONFIG.name,
    university: "Gujarat Technological University",
    technology: "Modern Fullstack Web Development",
    duration: "6 Months",
    startDate: "2026-07-01",
    category: "Academic Internship & Project Practicum",
  });

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
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

  // STEP 1 VALIDATION
  const handleNextFromStep1 = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      errs.fullName = "Please enter your legal full name.";
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      errs.email = "Please enter a valid email address.";
    }
    if (!formData.studentId.trim() || formData.studentId.trim().length < 3) {
      errs.studentId = "Student ID / Enrollment Number is required.";
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

  // STEP 2 VALIDATION
  const handleNextFromStep2 = () => {
    const errs: Record<string, string> = {};
    if (!formData.department.trim()) {
      errs.department = "Please select your academic department.";
    }
    if (!formData.course.trim()) {
      errs.course = "Please select your academic degree or program.";
    }
    if (!formData.technology.trim()) {
      errs.technology = "Please choose your technical specialization domain.";
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

  // STEP 3: SEND OTP
  const triggerSendOtp = async (email: string) => {
    setIsSendingOtp(true);
    setOtpMessage(null);
    try {
      const res = await sendEmailOtp(email.toLowerCase().trim());
      if (res.success) {
        setResendCooldown(30);
        setOtpMessage({ text: res.message, type: "success" });
        if (res.otpPreview) {
          setOtpPreview(res.otpPreview);
        }
      } else {
        setOtpMessage({ text: res.message || "Failed to dispatch email verification code.", type: "error" });
      }
    } catch {
      setOtpMessage({ text: "Network error sending code. Please try again.", type: "error" });
    } finally {
      setIsSendingOtp(false);
    }
  };

  // STEP 3: VERIFY OTP
  const handleVerifyOtp = async () => {
    if (!otpCode.trim() || !/^\d{6}$/.test(otpCode.trim())) {
      setOtpMessage({ text: "Please enter the complete 6-digit numeric verification code.", type: "error" });
      return;
    }
    setIsVerifyingOtp(true);
    setOtpMessage(null);
    try {
      const res = await verifyEmailOtp(formData.email.toLowerCase().trim(), otpCode.trim());
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

  // STEP 4: SUBMIT REGISTRATION
  const handleSubmitRegistration = async () => {
    if (!studentPassword || studentPassword.length < 6) {
      setErrors({ password: "Password must be at least 6 characters long." });
      return;
    }
    if (studentPassword !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match." });
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    try {
      // 1. Register credentials on server
      await registerAccountAction({
        name: formData.fullName.trim(),
        email: formData.email.toLowerCase().trim(),
        password: studentPassword,
        accountType: "STUDENT",
        role: "STUDENT",
        college: formData.college,
        university: formData.university,
        technology: formData.technology,
      });

      // 2. Submit application record
      const res = await fetch("/api/registrations/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit registration.");
      }

      const appNum = data.applicationNumber || `ID-AKT-${Date.now().toString().slice(-6)}`;

      // Redirect to pending approval screen
      window.location.href = `/pending-approval?app=${encodeURIComponent(appNum)}&email=${encodeURIComponent(formData.email)}`;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission failed. Please try again.";
      setErrors({ submission: msg });
      setIsSubmitting(false);
    }
  };

  const stepsList = [
    { num: 1, label: "Basic Info", icon: <User className="w-4 h-4" /> },
    { num: 2, label: "Department", icon: <Building className="w-4 h-4" /> },
    { num: 3, label: "Verify Email", icon: <Mail className="w-4 h-4" /> },
    { num: 4, label: "Password & Review", icon: <FileCheck className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#080d1a] py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="max-w-2xl mx-auto text-center mb-8 relative z-10">
        <div className="flex justify-center mb-3">
          <AnimatedLogo size="lg" />
        </div>

        <span className="text-[11px] font-bold tracking-widest uppercase text-red-400 bg-red-950/60 border border-red-800/60 px-3.5 py-1 rounded-full">
          {INSTITUTE_CONFIG.name} • Single Institute Edition
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-3">
          Student Activity &amp; Project Registration
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-md mx-auto">
          Create your verified student profile to access assigned academic activities, track daily project tasks, and log attendance.
        </p>

        <div className="mt-3.5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Registration is 100% Free • No Course Fees • Central Institute Database</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Step Progress Indicators */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {stepsList.map((step, idx) => (
              <React.Fragment key={step.num}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs transition-all shadow-md ${
                      currentStep === step.num
                        ? "bg-[#d32f2f] text-white ring-4 ring-red-900/40"
                        : currentStep > step.num
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-900 text-slate-500 border border-slate-800"
                    }`}
                  >
                    {currentStep > step.num ? <CheckCircle2 className="w-5 h-5" /> : step.icon}
                  </div>
                  <span
                    className={`text-[11px] font-semibold mt-1.5 hidden sm:block ${
                      currentStep === step.num
                        ? "text-white"
                        : currentStep > step.num
                        ? "text-emerald-400"
                        : "text-slate-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < stepsList.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2.5 transition-all ${
                      currentStep > step.num ? "bg-emerald-500" : "bg-slate-800"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* STEP 1: PERSONAL & IDENTIFICATION */}
        {currentStep === 1 && (
          <Card className="shadow-2xl border-slate-800 bg-slate-900/90 backdrop-blur-xl rounded-2xl text-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-white">Step 1 — Student Identification</CardTitle>
                  <CardDescription className="text-slate-400 text-xs">
                    Enter your legal personal details and official student enrollment number.
                  </CardDescription>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-red-950/60 border border-red-800/60 text-red-400">
                  Step 1 of 4
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Full Legal Name <span className="text-red-400">*</span>
                </label>
                <Input
                  placeholder="e.g. Fenil Patel"
                  value={formData.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  error={errors.fullName}
                  className="bg-slate-950/80 border-slate-700 text-white placeholder-slate-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Institute Email Address <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="student@akashtechnolabs.com"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    error={errors.email}
                    className="bg-slate-950/80 border-slate-700 text-white placeholder-slate-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <IdCard className="w-3.5 h-3.5 text-red-400" />
                    <span>Student ID / Roll No <span className="text-red-400">*</span></span>
                  </label>
                  <Input
                    placeholder="e.g. AKT-2026-081"
                    value={formData.studentId}
                    onChange={(e) => updateField("studentId", e.target.value)}
                    error={errors.studentId}
                    className="bg-slate-950/80 border-slate-700 text-white placeholder-slate-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Mobile Number <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={formData.mobile}
                    onChange={(e) => updateField("mobile", e.target.value)}
                    error={errors.mobile}
                    className="bg-slate-950/80 border-slate-700 text-white placeholder-slate-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Date of Birth</label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateField("dateOfBirth", e.target.value)}
                    className="bg-slate-950/80 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-800">
                <Link href="/login" className="text-xs font-semibold text-slate-400 hover:text-red-400 transition">
                  Already registered? Sign In
                </Link>
                <Button
                  onClick={handleNextFromStep1}
                  size="lg"
                  className="bg-[#d32f2f] hover:bg-[#b71c1c] text-white font-semibold px-6 rounded-xl shadow-lg shadow-red-950/50"
                >
                  Next: Department &amp; Program
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 2: DEPARTMENT & PROGRAM */}
        {currentStep === 2 && (
          <Card className="shadow-2xl border-slate-800 bg-slate-900/90 backdrop-blur-xl rounded-2xl text-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-white">Step 2 — Department &amp; Academic Program</CardTitle>
                  <CardDescription className="text-slate-400 text-xs">
                    Select your academic department, degree course, and technology specialization track.
                  </CardDescription>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-red-950/60 border border-red-800/60 text-red-400">
                  Step 2 of 4
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Academic Department <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => updateField("department", e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                >
                  {INSTITUTE_CONFIG.departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code}) — {dept.headOfDepartment}
                    </option>
                  ))}
                </select>
                {errors.department && <p className="text-xs text-red-400 mt-1">{errors.department}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Academic Program / Degree <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.course}
                  onChange={(e) => updateField("course", e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                >
                  {INSTITUTE_CONFIG.academicPrograms.map((prog) => (
                    <option key={prog.id} value={prog.name}>
                      {prog.name} ({prog.code})
                    </option>
                  ))}
                </select>
                {errors.course && <p className="text-xs text-red-400 mt-1">{errors.course}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Primary Technology Specialization <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.technology}
                    onChange={(e) => updateField("technology", e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  >
                    <option value="Modern Fullstack Web Development">Full Stack Web (Next.js, Node.js, TypeScript)</option>
                    <option value="Python for Enterprise & Automation">Python &amp; AI Engineering (Python, FastAPI, PyTorch)</option>
                    <option value="Applied AI & Machine Learning">Machine Learning &amp; Applied AI</option>
                    <option value="Cloud Computing & DevOps">Cloud &amp; DevOps Engineering (Docker, AWS, CI/CD)</option>
                    <option value="Data Science & Analytics">Data Science &amp; Business Intelligence</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Current Semester / Year</label>
                  <Input
                    placeholder="e.g. Semester 6 (Final Year)"
                    value={formData.semester}
                    onChange={(e) => updateField("semester", e.target.value)}
                    className="bg-slate-950/80 border-slate-700 text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-800">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="rounded-xl border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Back
                </Button>
                <Button
                  onClick={handleNextFromStep2}
                  size="lg"
                  className="bg-[#d32f2f] hover:bg-[#b71c1c] text-white font-semibold px-6 rounded-xl shadow-lg shadow-red-950/50"
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
          <Card className="shadow-2xl border-slate-800 bg-slate-900/90 backdrop-blur-xl rounded-2xl text-white">
            <CardHeader className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-800/60 text-red-400 flex items-center justify-center mx-auto mb-2">
                <Mail className="w-6 h-6" />
              </div>
              <CardTitle className="text-lg font-bold text-white">Step 3 — Email Verification</CardTitle>
              <CardDescription className="text-slate-400 text-xs">
                Enter the 6-digit verification code sent to <strong className="text-white">{formData.email}</strong>.
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
                  className="w-full text-center text-3xl font-mono tracking-widest py-3 border border-slate-700 bg-slate-950/80 text-white rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/20 outline-none"
                  autoFocus
                />
                <span className="text-xs text-slate-400 block">Enter 6 numeric digits</span>
              </div>

              {otpPreview && (
                <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-red-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-red-400" />
                      Resend Dispatch Assistant ({INSTITUTE_CONFIG.name})
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Verification code: <span className="font-mono font-bold text-red-400 tracking-wider text-sm">{otpPreview}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpCode(otpPreview);
                      if (otpMessage?.type === "error") setOtpMessage(null);
                    }}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#d32f2f] hover:bg-[#b71c1c] text-white shadow-xs transition"
                  >
                    Auto-fill
                  </button>
                </div>
              )}

              {otpMessage && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    otpMessage.type === "success"
                      ? "bg-emerald-950/40 border border-emerald-800/60 text-emerald-300"
                      : "bg-red-950/40 border border-red-800/60 text-red-300"
                  }`}
                >
                  {otpMessage.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
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
                      ? "text-slate-600 cursor-not-allowed"
                      : "text-red-400 hover:text-red-300 hover:underline"
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSendingOtp ? "animate-spin" : ""}`} />
                  {isSendingOtp
                    ? "Sending OTP..."
                    : resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : "Resend Verification Code"}
                </button>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-800">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  className="rounded-xl border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Back
                </Button>
                <Button
                  onClick={handleVerifyOtp}
                  size="lg"
                  disabled={otpCode.length !== 6 || isVerifyingOtp}
                  className="bg-[#d32f2f] hover:bg-[#b71c1c] text-white font-semibold px-6 rounded-xl shadow-lg shadow-red-950/50"
                  isLoading={isVerifyingOtp}
                >
                  Verify Code
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 4: PASSWORD & APPLICATION REVIEW */}
        {currentStep === 4 && (
          <Card className="shadow-2xl border-slate-800 bg-slate-900/90 backdrop-blur-xl rounded-2xl text-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-white">Step 4 — Set Password &amp; Submit</CardTitle>
                  <CardDescription className="text-slate-400 text-xs">
                    Create your account password and review your academic profile.
                  </CardDescription>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
                  Step 4 of 4
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Create Account Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <Input
                      type="password"
                      placeholder="At least 6 characters"
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      error={errors.password}
                      className="bg-slate-950/80 border-slate-700 text-white pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <Input
                      type="password"
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      error={errors.confirmPassword}
                      className="bg-slate-950/80 border-slate-700 text-white pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Review summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1 text-xs">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Student Profile</span>
                  <p className="text-sm font-bold text-white">{formData.fullName}</p>
                  <p className="text-xs text-slate-300">{formData.email}</p>
                  <p className="text-xs text-amber-400 font-mono">ID: {formData.studentId}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1 text-xs">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Department &amp; Track</span>
                  <p className="text-sm font-bold text-white">{formData.course}</p>
                  <p className="text-xs text-red-400 font-semibold">{formData.technology}</p>
                  <p className="text-xs text-slate-400">{formData.semester}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>100% Free Institute Registration</span>
                </div>
                <p className="text-emerald-400/80 leading-relaxed text-[11px]">
                  Submitting your student profile incurs zero fees. Your application will be reviewed by {INSTITUTE_CONFIG.name} administrators.
                </p>
              </div>

              {errors.submission && (
                <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300 font-medium">
                  {errors.submission}
                </div>
              )}

              <div className="pt-4 flex items-center justify-between border-t border-slate-800">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  disabled={isSubmitting}
                  className="rounded-xl border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Back
                </Button>
                <Button
                  onClick={handleSubmitRegistration}
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 rounded-xl shadow-lg shadow-emerald-950/50"
                  isLoading={isSubmitting}
                >
                  Submit Registration
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
