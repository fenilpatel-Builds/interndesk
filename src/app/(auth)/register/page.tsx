"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Bell,
  FileCheck2,
  TrendingUp,
  Play,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  User,
  Building,
  GraduationCap,
  Calendar,
  IdCard,
  X,
  Shield,
  Lightbulb,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { sendEmailOtp, verifyEmailOtp, registerAccountAction } from "@/lib/auth/actions";
import { INSTITUTE_CONFIG } from "@/lib/institute/config";

export default function RegisterPage() {
  const router = useRouter();

  // Role tab state matching Login Page
  const [selectedRole, setSelectedRole] = useState<"Student" | "Faculty" | "Admin">("Student");

  // Registration Form Fields
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
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Watch Demo Modal
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  // Dynamic step highlight based on filled sections
  const [activeStepHighlight, setActiveStepHighlight] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (password && confirmPassword) {
      setActiveStepHighlight(3);
    } else if (department && course) {
      setActiveStepHighlight(2);
    } else {
      setActiveStepHighlight(1);
    }
  }, [fullName, email, studentId, department, course, password, confirmPassword]);

  const handleRoleSelect = (role: "Student" | "Faculty" | "Admin") => {
    setSelectedRole(role);
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
      newErrors.studentId = selectedRole === "Student" 
        ? "Student ID / Enrollment number is required." 
        : "Employee ID is required.";
    }
    if (!department) {
      newErrors.department = "Please select your department.";
    }
    if (selectedRole === "Student") {
      if (!course) {
        newErrors.course = "Please select your course or program.";
      }
      if (!semester) {
        newErrors.semester = "Please select your academic year or semester.";
      }
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
      // 1. Dispatch real Email OTP verification code via Resend
      const otpRes = await sendEmailOtp(email.trim().toLowerCase());
      if (!otpRes.success) {
        setErrors({ submit: otpRes.message || "Failed to dispatch verification email. Please check your address." });
        setIsSubmitting(false);
        return;
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
      await finalizeRegistration();
    }
  };

  const finalizeRegistration = async () => {
    setIsSubmitting(true);
    try {
      const accountType = selectedRole === "Student" ? "STUDENT" : "INSTITUTE";
      const role = selectedRole === "Student" ? "STUDENT" : "ORG_ADMIN";

      // Create user auth account
      const authResult = await registerAccountAction({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        accountType,
        role,
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
          course: selectedRole === "Student" ? course : "Faculty Academic Track",
          semester: selectedRole === "Student" ? semester : "Faculty Staff",
          college: INSTITUTE_CONFIG.name,
          university: "Gujarat Technological University",
          technology: department,
          duration: "6 Months",
          startDate: new Date().toISOString().split("T")[0],
          category: selectedRole === "Student" ? "Student Activity & Capstone" : "Faculty Coordinator",
        }),
      });

      setSuccessToast("Registration successful! Redirecting to dashboard...");
      setOtpModalOpen(false);

      setTimeout(() => {
        if (selectedRole === "Student") {
          router.push("/student/dashboard");
        } else {
          router.push("/admin/dashboard");
        }
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
        setResendCooldown(30);
      } else {
        setOtpError(res.message || "Failed to resend code.");
      }
    } catch {
      setOtpError("Network error resending OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-slate-50 via-white to-blue-50/40 select-none">
      {/* Top Header matching Login Page */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            <AnimatedLogo size="md" showTagline={false} />

            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-[#E52329] transition-colors">
                Home
              </Link>
              <Link href="/#features" className="text-sm font-semibold text-slate-600 hover:text-[#E52329] transition-colors">
                Features
              </Link>
              <Link href="/#about" className="text-sm font-semibold text-slate-600 hover:text-[#E52329] transition-colors">
                About
              </Link>
              <Link href="/#contact" className="text-sm font-semibold text-slate-600 hover:text-[#E52329] transition-colors">
                Contact
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button
                  size="sm"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2 rounded-xl shadow-xs transition-transform hover:scale-[1.02] cursor-pointer"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container matching Login Page Structure */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start lg:items-center">
          {/* Left Column: Hero Copy, 4 Pills, CTAs & Vector Illustration matching Login Page */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-xs font-black tracking-widest text-sky-600 uppercase shadow-2xs">
              <span>LEARN • GROW • ACHIEVE</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-black text-slate-900 tracking-tight leading-[1.15]">
              Institute Activity <br />
              <span className="text-[#E52329]">Management System</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Empowering students, faculty and administrators with a smart, secure and seamless platform for activities, submissions, learning and progress.
            </p>

            {/* 4 Feature Value Pills matching Login Page */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5">
                  <Lock className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 leading-tight">
                  Secure Authentication
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-1.5">
                  <Bell className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 leading-tight">
                  Real-time Notifications
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 leading-tight">
                  Easy Submissions
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-1.5">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 leading-tight">
                  Progress Tracking
                </span>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-2">
              <Link href="/login" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-[#E52329] hover:bg-[#C41C22] text-white font-bold px-7 py-6 rounded-xl shadow-md shadow-red-500/20 text-sm flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] cursor-pointer"
                >
                  <span>Already Registered? Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <button
                type="button"
                onClick={() => setDemoModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-red-100 text-[#E52329] flex items-center justify-center">
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </div>
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Student Illustration matching Login Page */}
            <div className="relative pt-4 flex justify-center lg:justify-start">
              <div className="relative max-w-md w-full">
                <img
                  src="/images/student-hero-illustration.png"
                  alt="Akash Technolabs Student Management"
                  className="w-full h-auto object-contain drop-shadow-lg"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Complete Registration Card matching Login Page Aesthetic */}
          <div className="lg:col-span-7 xl:col-span-7">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/60 p-6 sm:p-8 relative">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {selectedRole === "Student"
                    ? "Student Registration"
                    : `${selectedRole} Registration`}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Create your verified profile to access the activity portal
                </p>
              </div>

              {/* Role Switcher Tabs (Student, Faculty, Admin) matching Login Page */}
              <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
                {(["Student", "Faculty", "Admin"] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleSelect(role)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      selectedRole === role
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>

              {/* Stepper Progress Bar: ① Personal  ② Academic  ③ Security */}
              <div className="flex items-center justify-between relative mb-6 px-2">
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
                    Security
                  </span>
                </div>
              </div>

              {/* Feedback messages */}
              {successToast && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successToast}</span>
                </div>
              )}
              {errors.submit && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errors.submit}</span>
                </div>
              )}

              {/* Registration Form */}
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {/* Row 1: Full Name & Institute Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Legal Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                        required
                        autoComplete="off"
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white placeholder-slate-400"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    {errors.fullName && (
                      <p className="text-[11px] text-red-500 font-semibold mt-0.5">{errors.fullName}</p>
                    )}
                  </div>

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
                        autoComplete="off"
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white placeholder-slate-400"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    {errors.email && (
                      <p className="text-[11px] text-red-500 font-semibold mt-0.5">{errors.email}</p>
                    )}
                  </div>
                </div>

                {/* Row 2: Student ID & Department */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {selectedRole === "Student" ? "Student ID / Enrollment" : "Employee / Staff ID"}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        placeholder={selectedRole === "Student" ? "e.g. AT2024001" : "e.g. EMP202401"}
                        required
                        autoComplete="off"
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white placeholder-slate-400"
                      />
                      <IdCard className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    {errors.studentId && (
                      <p className="text-[11px] text-red-500 font-semibold mt-0.5">{errors.studentId}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
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
                </div>

                {/* Row 3: Course & Semester (For Students) */}
                {selectedRole === "Student" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Course / Program <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
                      >
                        <option value="B.Tech (CSE / IT)">B.Tech (CSE / IT) — 4 Years</option>
                        <option value="B.Tech Computer Science">B.Tech Computer Science</option>
                        <option value="Diploma in Computer Engineering">Diploma in Computer Engineering</option>
                        <option value="M.Tech Software Engineering">M.Tech Software Engineering</option>
                        <option value="Master of Computer Applications (MCA)">Master of Computer Applications (MCA)</option>
                        <option value="Bachelor of Computer Applications (BCA)">Bachelor of Computer Applications (BCA)</option>
                      </select>
                      {errors.course && (
                        <p className="text-[11px] text-red-500 font-semibold mt-0.5">{errors.course}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Academic Year / Semester <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
                      >
                        <option value="Year 1 - Semester 1/2">Year 1 - Semester 1 & 2</option>
                        <option value="Year 2 - Semester 3/4">Year 2 - Semester 3 & 4</option>
                        <option value="Year 3 - Semester 5/6">Year 3 - Semester 5 & 6</option>
                        <option value="Year 4 - Semester 7/8">Year 4 - Semester 7 & 8 (Final Capstone)</option>
                      </select>
                      {errors.semester && (
                        <p className="text-[11px] text-red-500 font-semibold mt-0.5">{errors.semester}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Row 4: Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create strong password"
                        required
                        autoComplete="new-password"
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white placeholder-slate-400"
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
                      placeholder="Re-enter password"
                      required
                      autoComplete="new-password"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white placeholder-slate-400"
                    />
                    {errors.confirmPassword && (
                      <p className="text-[11px] text-red-500 font-semibold mt-0.5">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Terms and Conditions Checkbox */}
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

                {/* Register Button matching Login Page Red Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#E52329] hover:bg-[#C41C22] text-white font-bold py-3.5 rounded-xl shadow-md shadow-red-500/20 text-sm transition-all cursor-pointer"
                >
                  {isSubmitting ? "Processing Registration..." : "Create Account & Verify Email"}
                </Button>
              </form>

              {/* Divider: or continue with */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-slate-400 font-medium">
                    or continue with
                  </span>
                </div>
              </div>

              {/* Google Sign In Button matching Login Page */}
              <button
                type="button"
                onClick={() => {
                  setErrors({ submit: "Please complete registration with your institute email address to link your academic record." });
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Card Footer: Already have an account? Sign In */}
              <div className="text-center mt-5 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-bold text-[#E52329] hover:underline"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Signature Bottom Ribbon matching Login Page */}
      <footer className="bg-[#050914] border-t border-slate-800/90 py-4 px-4 sm:px-6 lg:px-8 select-none">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-black text-sm text-white">
              <span className="text-[#E52329]">Akash</span>
              <span>Technolabs</span>
            </div>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-400 font-medium hidden sm:inline">
              Building a smarter future through technology
            </span>
          </div>

          <div className="flex items-center gap-5 text-slate-400 text-[11px] font-semibold">
            <span className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              Secure
            </span>
            <span className="flex items-center gap-1.5 hover:text-white transition-colors">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Reliable
            </span>
            <span className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              Innovative
            </span>
            <span className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Headphones className="w-3.5 h-3.5 text-red-400" />
              Support
            </span>
          </div>

          <div>
            <a
              href="https://akashtechnolabs.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-slate-300 hover:text-white transition-colors"
            >
              www.akashtechnolabs.com
            </a>
          </div>
        </div>
      </footer>

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
                <strong className="text-slate-900">{email}</strong> via Resend. Enter it below to activate your account.
              </p>

              {otpError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  6-Digit Verification Code (from your Email)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 6-digit OTP"
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

              <div className="text-center pt-2 text-xs">
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
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Watch Demo Modal matching Login Page */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-[#E52329] flex items-center justify-center">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Akash Technolabs Portal Tour
                  </h3>
                  <p className="text-xs text-slate-500">Student &amp; Faculty Activity Management</p>
                </div>
              </div>
              <button
                onClick={() => setDemoModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video bg-gradient-to-br from-slate-900 to-[#0F4C81] rounded-2xl flex flex-col items-center justify-center text-white p-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h4 className="text-lg font-bold">Interactive Platform Walkthrough</h4>
              <p className="text-xs text-slate-200 max-w-md">
                Experience the 1-click attendance clock-in, academic assignment submissions with live GitHub review, and student performance analytics.
              </p>
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={() => setDemoModalOpen(false)}
                  className="bg-[#E52329] hover:bg-[#C41C22] text-white font-bold rounded-xl text-xs"
                >
                  Close &amp; Continue Registration
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
