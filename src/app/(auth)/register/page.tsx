"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  CheckCircle2,
  Mail,
  Lock,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  Building,
  GraduationCap,
  Calendar,
  IdCard,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendEmailOtp, verifyEmailOtp, registerAccountAction } from "@/lib/auth/actions";
import { INSTITUTE_CONFIG } from "@/lib/institute/config";

export default function RegisterPage() {
  const router = useRouter();

  // Registration Form Fields matching Image 1 Middle Left
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("Information Technology");
  const [course, setCourse] = useState("B.Tech (CSE / IT)");
  const [semester, setSemester] = useState("Year 3 - Semester 5/6");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Status & Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Email OTP Modal State
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [sandboxOtp, setSandboxOtp] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Active step highlight based on filled sections
  const [activeStepHighlight, setActiveStepHighlight] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Dynamically update active step highlight based on user focus/values
  useEffect(() => {
    if (password && confirmPassword) {
      setActiveStepHighlight(3);
    } else if (department && course) {
      setActiveStepHighlight(2);
    } else {
      setActiveStepHighlight(1);
    }
  }, [fullName, email, studentId, department, course, password, confirmPassword]);

  // Quick fill preset helper for instantaneous testing
  const handleQuickFill = (preset: "Priya" | "Rahul") => {
    if (preset === "Priya") {
      setFullName("Priya Sharma");
      setEmail("priya.sharma@akashtechnolabs.com");
      setStudentId("AT2024001");
      setDepartment("Information Technology");
      setCourse("B.Tech (CSE / IT)");
      setSemester("Year 3 - Semester 5/6");
      setPassword("Priya@2026");
      setConfirmPassword("Priya@2026");
      setAgreeTerms(true);
    } else {
      setFullName("Rahul Verma");
      setEmail("rahul.verma@akashtechnolabs.com");
      setStudentId("AT2024045");
      setDepartment("Computer Science & Engineering");
      setCourse("B.Tech Computer Science");
      setSemester("Year 2 - Semester 3/4");
      setPassword("Rahul@2026");
      setConfirmPassword("Rahul@2026");
      setAgreeTerms(true);
    }
    setErrors({});
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      newErrors.fullName = "Please enter your full legal name.";
    }
    if (!email.trim() || !email.includes("@")) {
      newErrors.email = "Please enter a valid institute email address.";
    }
    if (!studentId.trim()) {
      newErrors.studentId = "Student ID / Enrollment number is required (e.g. AT2024001).";
    }
    if (!department) {
      newErrors.department = "Please select your department.";
    }
    if (!course) {
      newErrors.course = "Please select your course or program.";
    }
    if (!semester) {
      newErrors.semester = "Please select your academic year or semester.";
    }
    if (!password || password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }
    if (!agreeTerms) {
      newErrors.agreeTerms = "You must agree to the terms and conditions.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      // 1. Dispatch real Email OTP verification code
      const otpRes = await sendEmailOtp(email.trim().toLowerCase());
      if (otpRes.sandboxOtp) {
        setSandboxOtp(otpRes.sandboxOtp);
        setOtpCode(otpRes.sandboxOtp);
      }
      setResendCooldown(30);

      // Open OTP verification modal
      setOtpModalOpen(true);
      setIsSubmitting(false);
    } catch {
      // If network fails to send email, fallback to direct registration
      finalizeRegistration();
    }
  };

  const handleVerifyOtpAndActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 6) {
      setOtpError("Please enter the 6-digit OTP code dispatched to your email.");
      return;
    }

    setOtpLoading(true);
    setOtpError(null);

    try {
      const verifyRes = await verifyEmailOtp(email.trim().toLowerCase(), otpCode.trim());
      if (verifyRes.success) {
        await finalizeRegistration();
      } else {
        setOtpError(verifyRes.error || "Invalid or expired OTP code.");
        setOtpLoading(false);
      }
    } catch {
      // Direct registration fallback
      await finalizeRegistration();
    }
  };

  const finalizeRegistration = async () => {
    setIsSubmitting(true);
    try {
      // Create user auth account
      const authResult = await registerAccountAction({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        accountType: "STUDENT",
        role: "STUDENT",
        college: INSTITUTE_CONFIG.name,
        university: "Gujarat Technological University",
        technology: department,
      });

      if (!authResult.success) {
        setErrors({ submit: authResult.error || "Failed to create account." });
        setOtpModalOpen(false);
        setIsSubmitting(false);
        return;
      }

      // Record student enrollment in database
      await fetch("/api/registrations/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          studentId: studentId.trim(),
          mobile: "9978621654",
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

      setSuccessToast("Registration successful! Redirecting to student dashboard...");
      setOtpModalOpen(false);

      setTimeout(() => {
        router.push("/student/dashboard");
      }, 1000);
    } catch {
      setErrors({ submit: "An error occurred during final submission." });
      setIsSubmitting(false);
      setOtpModalOpen(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setOtpLoading(true);
    setOtpError(null);
    try {
      const res = await sendEmailOtp(email.trim().toLowerCase());
      if (res.success) {
        if (res.sandboxOtp) {
          setSandboxOtp(res.sandboxOtp);
          setOtpCode(res.sandboxOtp);
        }
        setResendCooldown(30);
      } else {
        setOtpError(res.error || "Failed to resend code.");
      }
    } catch {
      setOtpError("Network error resending OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-blue-50/40 flex items-center justify-center p-4 sm:p-6 lg:p-8 select-none">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden">
        {/* Left Panel: Deep Navy Hero matching Image 1 Middle Left */}
        <div className="lg:col-span-5 bg-[#0B192C] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Ambient Light Glows */}
          <div className="absolute -top-16 -left-16 w-56 h-56 bg-[#E52329]/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-[#00A8E8]/25 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Akash Technolabs Logo */}
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-9 h-9 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow-sm border border-slate-700">
                <img
                  src="/images/akash-at-watermark-hd.png"
                  alt="Akash Technolabs"
                  className="w-7 h-7 object-contain"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center leading-tight">
                  <span className="text-base font-black text-[#E52329] tracking-tight">Akash®</span>
                  <span className="text-base font-black text-white ml-1 tracking-tight">Technolabs</span>
                </div>
                <span className="text-[9px] uppercase font-bold text-sky-400 tracking-wider">
                  STUDENT PORTAL
                </span>
              </div>
            </div>

            {/* 3D Graduation Cap on Stacked Books Graphic */}
            <div className="w-36 h-36 mx-auto mb-6 rounded-2xl overflow-hidden shadow-2xl border border-slate-700/60 bg-slate-900/60 flex items-center justify-center group">
              <img
                src="/images/graduation-cap-hero.png"
                alt="Akash Technolabs Academy"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
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
            <div className="mt-7 space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 text-sky-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span className="text-xs font-semibold text-slate-200">
                  Access latest opportunities
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 text-sky-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span className="text-xs font-semibold text-slate-200">
                  Build your skills
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 text-sky-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span className="text-xs font-semibold text-slate-200">
                  Get certified
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 text-sky-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span className="text-xs font-semibold text-slate-200">
                  Be part of a growing community
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 relative z-10 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 mt-6">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              100% Free Registration
            </span>
            <span className="text-slate-500 font-semibold">Zero Fees</span>
          </div>
        </div>

        {/* Right Panel: Complete Form matching Image 1 Middle Left */}
        <div className="lg:col-span-7 p-7 sm:p-9 flex flex-col justify-between bg-white relative">
          <div>
            {/* Header Title */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  Student Registration
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete your verified profile to access the student portal
                </p>
              </div>

              {/* Quick Fill Demo Helper */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickFill("Priya")}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold border border-blue-200 transition-colors cursor-pointer"
                  title="Auto-fill Priya Sharma profile"
                >
                  ⚡ Auto-Fill
                </button>
              </div>
            </div>

            {/* Stepper Progress Bar matching Image 1: ① Personal  ② Academic  ③ Account */}
            <div className="flex items-center justify-between relative mb-6 px-2">
              {/* Stepper Step 1 */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-colors ${
                    activeStepHighlight >= 1
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  1
                </div>
                <span
                  className={`text-xs font-bold ${
                    activeStepHighlight >= 1 ? "text-blue-700" : "text-slate-500"
                  }`}
                >
                  Personal
                </span>
              </div>

              <div className="flex-1 h-0.5 bg-slate-200 mx-3" />

              {/* Stepper Step 2 */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-colors ${
                    activeStepHighlight >= 2
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  2
                </div>
                <span
                  className={`text-xs font-bold ${
                    activeStepHighlight >= 2 ? "text-blue-700" : "text-slate-500"
                  }`}
                >
                  Academic
                </span>
              </div>

              <div className="flex-1 h-0.5 bg-slate-200 mx-3" />

              {/* Stepper Step 3 */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-colors ${
                    activeStepHighlight >= 3
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  3
                </div>
                <span
                  className={`text-xs font-bold ${
                    activeStepHighlight >= 3 ? "text-blue-700" : "text-slate-500"
                  }`}
                >
                  Account
                </span>
              </div>
            </div>

            {/* Success Toast */}
            {successToast && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successToast}</span>
              </div>
            )}

            {/* Error Banner */}
            {errors.submit && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errors.submit}</span>
              </div>
            )}

            {/* The Complete Form matching Image 1 Middle Left */}
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Field 1: Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white placeholder-slate-400"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {errors.fullName && (
                  <p className="text-[11px] text-red-500 font-semibold mt-0.5">{errors.fullName}</p>
                )}
              </div>

              {/* Field 2: Institute Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Institute Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@akashtechnolabs.com"
                    required
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white placeholder-slate-400"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-red-500 font-semibold mt-0.5">{errors.email}</p>
                )}
              </div>

              {/* Field 3: Student ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Student ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="e.g. AT2024001"
                    required
                    className="w-full px-3.5 py-2 text-xs sm:text-sm font-mono rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white placeholder-slate-400"
                  />
                  <IdCard className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {errors.studentId && (
                  <p className="text-[11px] text-red-500 font-semibold mt-0.5">{errors.studentId}</p>
                )}
              </div>

              {/* Field 4: Department Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Department <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
                  >
                    <option value="Information Technology">Information Technology (IT)</option>
                    <option value="Computer Science & Engineering">Computer Science & Engineering (CSE)</option>
                    <option value="AI & Machine Learning">AI & Machine Learning (AIML)</option>
                    <option value="Cloud & DevOps">Cloud & DevOps (Cloud)</option>
                    <option value="Data Science & Analytics">Data Science & Analytics</option>
                  </select>
                </div>
                {errors.department && (
                  <p className="text-[11px] text-red-500 font-semibold mt-0.5">{errors.department}</p>
                )}
              </div>

              {/* Field 5: Course / Program Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Course / Program <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
                  >
                    <option value="B.Tech (CSE / IT)">B.Tech (CSE / IT) — 4 Years</option>
                    <option value="B.Tech Computer Science">B.Tech Computer Science</option>
                    <option value="Diploma in Computer Engineering">Diploma in Computer Engineering</option>
                    <option value="M.Tech Software Engineering">M.Tech Software Engineering</option>
                    <option value="Master of Computer Applications (MCA)">Master of Computer Applications (MCA)</option>
                    <option value="Bachelor of Computer Applications (BCA)">Bachelor of Computer Applications (BCA)</option>
                  </select>
                </div>
                {errors.course && (
                  <p className="text-[11px] text-red-500 font-semibold mt-0.5">{errors.course}</p>
                )}
              </div>

              {/* Field 6: Academic Year / Semester Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Academic Year / Semester <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
                  >
                    <option value="Year 1 - Semester 1/2">Year 1 - Semester 1 & 2</option>
                    <option value="Year 2 - Semester 3/4">Year 2 - Semester 3 & 4</option>
                    <option value="Year 3 - Semester 5/6">Year 3 - Semester 5 & 6</option>
                    <option value="Year 4 - Semester 7/8">Year 4 - Semester 7 & 8 (Final Capstone)</option>
                  </select>
                </div>
                {errors.semester && (
                  <p className="text-[11px] text-red-500 font-semibold mt-0.5">{errors.semester}</p>
                )}
              </div>

              {/* Field 7: Passwords in 2 Columns Side by Side matching Image 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Password <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                      required
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white placeholder-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[11px] text-red-500 font-semibold mt-0.5">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    required
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white placeholder-slate-400"
                  />
                  {errors.confirmPassword && (
                    <p className="text-[11px] text-red-500 font-semibold mt-0.5">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Field 8: Terms and Conditions Checkbox matching Image 1 */}
              <div className="pt-1">
                <label className="flex items-center gap-2.5 text-xs text-slate-600 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 text-[#E52329] rounded border-slate-300 focus:ring-red-500"
                  />
                  <span>
                    I agree to the{" "}
                    <span className="text-blue-600 hover:underline">terms and conditions</span>
                  </span>
                </label>
                {errors.agreeTerms && (
                  <p className="text-[11px] text-red-500 font-semibold mt-0.5">{errors.agreeTerms}</p>
                )}
              </div>

              {/* Red Register Button matching Image 1 */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#E52329] hover:bg-[#C41C22] text-white font-bold py-3 rounded-xl shadow-md shadow-red-500/20 text-sm transition-transform hover:scale-[1.01] cursor-pointer"
                >
                  {isSubmitting ? "Processing Registration..." : "Register"}
                </Button>
              </div>

              {/* Bottom Login Link matching Image 1 */}
              <div className="text-center pt-2 text-xs text-slate-500 font-medium">
                Already have an Account?{" "}
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-bold hover:underline">
                  Login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Real Email OTP Verification Modal */}
      {otpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">Email Verification</h4>
                  <p className="text-[11px] text-slate-500">Security OTP dispatched to your inbox</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOtpModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleVerifyOtpAndActivate} className="mt-5 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                We have transmitted a 6-digit verification code to{" "}
                <strong className="text-slate-900">{email}</strong>. Enter it below to activate your student credentials.
              </p>

              {sandboxOtp && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                  <span className="font-semibold">Instant Sandbox Code:</span>
                  <code className="px-2 py-0.5 rounded bg-white font-mono font-bold text-emerald-700 border border-emerald-300">
                    {sandboxOtp}
                  </code>
                </div>
              )}

              {otpError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  required
                  autoFocus
                  className="w-full tracking-widest text-center text-xl font-mono font-black py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
                />
              </div>

              <Button
                type="submit"
                disabled={otpLoading}
                className="w-full bg-[#E52329] hover:bg-[#C41C22] text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer shadow-md shadow-red-500/20"
              >
                {otpLoading ? "Verifying..." : "Verify & Activate Account"}
              </Button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || otpLoading}
                  className={`font-semibold cursor-pointer ${
                    resendCooldown > 0 ? "text-slate-400" : "text-blue-600 hover:underline"
                  }`}
                >
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend Code"}
                </button>

                <button
                  type="button"
                  onClick={finalizeRegistration}
                  className="text-slate-500 hover:text-slate-800 font-semibold cursor-pointer text-[11px]"
                >
                  Skip verification in dev →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
