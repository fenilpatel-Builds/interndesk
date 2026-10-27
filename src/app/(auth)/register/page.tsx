"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Mail,
  Lock,
  Sparkles,
  AlertCircle,
  RefreshCw,
  IdCard,
  User,
  GraduationCap,
  BookOpen,
  Calendar,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { sendEmailOtp, verifyEmailOtp, registerAccountAction } from "@/lib/auth/actions";
import { INSTITUTE_CONFIG } from "@/lib/institute/config";

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields matching Image 1 Middle Left
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [mobile, setMobile] = useState("");
  const [department, setDepartment] = useState(INSTITUTE_CONFIG.departments[0].id);
  const [course, setCourse] = useState(INSTITUTE_CONFIG.academicPrograms[0].name);
  const [semester, setSemester] = useState("Year 3 - Semester 5/6");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);

  // OTP Verification state
  const [otpCode, setOtpCode] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpPreview, setOtpPreview] = useState<string | null>(null);
  const [otpMessage, setOtpMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleNextFromStep1 = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 2) {
      errs.fullName = "Full name is required.";
    }
    if (!email.trim() || !email.includes("@")) {
      errs.email = "Please enter a valid institute email.";
    }
    if (!studentId.trim()) {
      errs.studentId = "Student Enrollment ID is required (e.g. AT2024001).";
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setCurrentStep(2);
  };

  const handleNextFromStep2 = () => {
    setErrors({});
    setCurrentStep(3);
    if (!otpVerified && !otpPreview) {
      triggerSendOtp(email);
    }
  };

  const triggerSendOtp = async (targetEmail: string) => {
    if (!targetEmail) return;
    setIsSendingOtp(true);
    setOtpMessage(null);
    try {
      const res = await sendEmailOtp(targetEmail.toLowerCase().trim());
      if (res.success) {
        setResendCooldown(30);
        setOtpMessage({ text: res.message || "OTP code dispatched.", type: "success" });
        if (res.sandboxOtp) {
          setOtpPreview(res.sandboxOtp);
          setOtpCode(res.sandboxOtp);
        }
      } else {
        setOtpMessage({ text: res.error || "Failed to dispatch verification code.", type: "error" });
      }
    } catch {
      setOtpMessage({ text: "Network error sending code.", type: "error" });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim() || otpCode.trim().length < 6) {
      setOtpMessage({ text: "Please enter the 6-digit verification code.", type: "error" });
      return;
    }
    setIsVerifyingOtp(true);
    setOtpMessage(null);
    try {
      const res = await verifyEmailOtp(email.toLowerCase().trim(), otpCode.trim());
      if (res.success) {
        setOtpVerified(true);
        setOtpMessage({ text: "Email address verified successfully!", type: "success" });
      } else {
        setOtpMessage({ text: res.error || "Invalid verification code.", type: "error" });
      }
    } catch {
      setOtpMessage({ text: "Verification failed. Please retry.", type: "error" });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setErrors({ terms: "You must accept the terms and conditions." });
      return;
    }
    if (!password || password.length < 6) {
      setErrors({ password: "Password must be at least 6 characters." });
      return;
    }
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match." });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Register account in system
      const regRes = await registerAccountAction({
        name: fullName.trim(),
        email: email.toLowerCase().trim(),
        password,
        accountType: "STUDENT",
        role: "STUDENT",
        college: INSTITUTE_CONFIG.name,
        university: "Gujarat Technological University",
        technology: department,
      });

      if (!regRes.success) {
        setErrors({ submit: regRes.error || "Registration submission failed." });
        setIsSubmitting(false);
        return;
      }

      // Submit student registration application record
      await fetch("/api/registrations/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.toLowerCase().trim(),
          studentId: studentId.trim(),
          mobile: mobile.trim() || "9978621654",
          department,
          course,
          semester,
          college: INSTITUTE_CONFIG.name,
          university: "Gujarat Technological University",
          technology: department,
          duration: "6 Months",
          startDate: new Date().toISOString().split("T")[0],
          category: "Student Activity & Capstone",
        }),
      });

      router.push("/student/dashboard");
    } catch {
      setErrors({ submit: "An unexpected error occurred during submission." });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden">
        {/* Left Panel: Deep Navy Hero matching Image 1 Middle Left */}
        <div className="lg:col-span-5 bg-[#0B192C] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden select-none">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#E52329]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-[#00A8E8]/20 rounded-full blur-3xl pointer-events-none" />

          <div>
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center">
                <img
                  src="/images/akash-at-watermark-hd.png"
                  alt="Akash Technolabs"
                  className="w-6 h-6 object-contain"
                />
              </div>
              <div className="flex items-center font-black text-sm tracking-tight leading-none">
                <span className="text-[#E52329]">Akash</span>
                <span className="text-white ml-1">Technolabs</span>
              </div>
            </div>

            {/* 3D Graduation Cap Graphic */}
            <div className="w-36 h-36 mx-auto mb-6 rounded-2xl overflow-hidden shadow-lg border border-slate-700/60 bg-slate-900/50 flex items-center justify-center">
              <img
                src="/images/graduation-cap-hero.png"
                alt="Akash Technolabs Academy"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Headlines */}
            <h2 className="text-2xl font-black text-white tracking-tight">
              Join Akash Technolabs
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed font-normal">
              Your journey towards growth and success starts here.
            </p>

            {/* 4 Checklist Bullets matching Image 1 */}
            <div className="mt-8 space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-600/30 text-sky-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span className="text-xs font-semibold text-slate-200">
                  Access latest opportunities
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-600/30 text-sky-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span className="text-xs font-semibold text-slate-200">
                  Build your skills
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-600/30 text-sky-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span className="text-xs font-semibold text-slate-200">
                  Get certified
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-600/30 text-sky-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span className="text-xs font-semibold text-slate-200">
                  Be part of a growing community
                </span>
              </div>
            </div>
          </div>

          <div className="pt-8 text-[11px] text-slate-400 font-medium">
            100% Free Registration • Zero Platform Fees
          </div>
        </div>

        {/* Right Panel: Stepper Form matching Image 1 */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Student Registration
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete all 3 steps to activate your student portal
                </p>
              </div>
              <span className="text-xs font-bold text-slate-400">Step {currentStep} of 3</span>
            </div>

            {/* Stepper Progress Tabs matching Image 1 */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  currentStep === 1
                    ? "bg-[#0F4C81] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                ① Personal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (fullName && email && studentId) setCurrentStep(2);
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  currentStep === 2
                    ? "bg-[#0F4C81] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                ② Academic
              </button>
              <button
                type="button"
                onClick={() => {
                  if (fullName && email && studentId) setCurrentStep(3);
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  currentStep === 3
                    ? "bg-[#0F4C81] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                ③ Account
              </button>
            </div>

            {/* Global Errors */}
            {errors.submit && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errors.submit}</span>
              </div>
            )}

            {/* STEP 1: PERSONAL DETAILS */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
                  />
                  {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Institute Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@akashtechnolabs.com"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Student ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="e.g. AT2024001"
                      className="w-full px-3.5 py-2.5 text-sm font-mono rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
                    />
                    {errors.studentId && <p className="text-xs text-red-500 mt-1">{errors.studentId}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Contact Mobile
                    </label>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                  <Link href="/login" className="text-xs font-semibold text-slate-500 hover:text-slate-900">
                    Already registered? Sign In
                  </Link>
                  <Button
                    type="button"
                    onClick={handleNextFromStep1}
                    className="bg-[#E52329] hover:bg-[#C41C22] text-white font-bold px-6 py-2.5 rounded-xl text-xs cursor-pointer"
                  >
                    Next: Academic Details →
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: ACADEMIC DETAILS */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
                  >
                    {INSTITUTE_CONFIG.departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Course / Program <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
                  >
                    {INSTITUTE_CONFIG.academicPrograms.map((prog) => (
                      <option key={prog.code} value={prog.name}>
                        {prog.name} ({prog.durationYears} Years)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Academic Year / Semester <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
                  >
                    <option value="Year 1 - Semester 1/2">Year 1 - Semester 1/2</option>
                    <option value="Year 2 - Semester 3/4">Year 2 - Semester 3/4</option>
                    <option value="Year 3 - Semester 5/6">Year 3 - Semester 5/6</option>
                    <option value="Year 4 - Semester 7/8">Year 4 - Semester 7/8 (Final Year)</option>
                    <option value="Postgraduate / Master Practicum">Postgraduate / Master Practicum</option>
                  </select>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    ← Back
                  </button>
                  <Button
                    type="button"
                    onClick={handleNextFromStep2}
                    className="bg-[#E52329] hover:bg-[#C41C22] text-white font-bold px-6 py-2.5 rounded-xl text-xs cursor-pointer"
                  >
                    Next: Account &amp; OTP →
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: ACCOUNT & EMAIL OTP VERIFICATION */}
            {currentStep === 3 && (
              <form onSubmit={handleFinalSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
                    />
                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      required
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
                    />
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Email OTP Verification Section */}
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-600" />
                      Email Verification OTP
                    </span>
                    {otpVerified ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">Sent to: {email}</span>
                    )}
                  </div>

                  {!otpVerified && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                          placeholder="6-Digit OTP"
                          className="flex-1 px-3 py-2 text-center text-sm font-mono font-bold tracking-widest rounded-xl border border-slate-300 bg-white text-slate-900"
                        />
                        <Button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={otpCode.length !== 6 || isVerifyingOtp}
                          size="sm"
                          className="bg-[#0F4C81] hover:bg-[#0B355A] text-white font-bold text-xs rounded-xl px-4"
                        >
                          {isVerifyingOtp ? "Checking..." : "Verify OTP"}
                        </Button>
                      </div>

                      {otpPreview && (
                        <div className="p-2.5 rounded-xl bg-white border border-blue-200 text-xs flex items-center justify-between">
                          <span className="text-slate-600 text-[11px]">
                            Testing Sandbox OTP: <strong className="font-mono text-blue-700">{otpPreview}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => setOtpCode(otpPreview)}
                            className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                          >
                            Auto-Fill
                          </button>
                        </div>
                      )}

                      {otpMessage && (
                        <p
                          className={`text-xs font-semibold ${
                            otpMessage.type === "success" ? "text-emerald-700" : "text-red-600"
                          }`}
                        >
                          {otpMessage.text}
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={() => triggerSendOtp(email)}
                        disabled={resendCooldown > 0 || isSendingOtp}
                        className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                      >
                        {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Terms checkbox matching Image 1 */}
                <div className="pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 text-[#E52329] rounded border-slate-300 focus:ring-red-500"
                    />
                    <span>I agree to the terms and conditions</span>
                  </label>
                  {errors.terms && <p className="text-xs text-red-500 mt-1">{errors.terms}</p>}
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    ← Back
                  </button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#E52329] hover:bg-[#C41C22] text-white font-bold px-8 py-3 rounded-xl text-xs cursor-pointer shadow-md shadow-red-500/20"
                  >
                    {isSubmitting ? "Creating Account..." : "Register"}
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Footer link */}
          <div className="text-center pt-6 text-xs text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-[#E52329] hover:underline">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
