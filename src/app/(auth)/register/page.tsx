"use client";

import React, { useState, useEffect, useRef } from "react";
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
  GraduationCap,
  Calendar,
  X,
  Shield,
  Lightbulb,
  Headphones,
  PenTool,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { sendEmailOtp, verifyEmailOtp, registerAccountAction } from "@/lib/auth/actions";
import { INSTITUTE_CONFIG } from "@/lib/institute/config";

const PRESET_COURSES = [
  "B.Tech (CSE / IT) — 4 Years",
  "B.Tech Computer Science & Engineering",
  "Bachelor of Computer Applications (BCA)",
  "Master of Computer Applications (MCA)",
  "Diploma in Computer Engineering",
  "M.Tech Software Engineering",
  "__CUSTOM__",
];

export default function RegisterPage() {
  const router = useRouter();

  // Role tab state matching Login Page
  const [selectedRole, setSelectedRole] = useState<"Student" | "Faculty" | "Admin">("Student");

  // Registration Form Fields (Department & Student ID removed per request)
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState("B.Tech (CSE / IT) — 4 Years");
  const [customCourse, setCustomCourse] = useState("");
  const [isCustomCourse, setIsCustomCourse] = useState(false);
  const [semester, setSemester] = useState("Year 3 - Semester 5/6");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Independent toggle states for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Email OTP Modal State
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [forwardedTo, setForwardedTo] = useState<string | null>(null);

  // Watch Demo Modal
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  // Dynamic step highlight based on filled sections
  const [activeStepHighlight, setActiveStepHighlight] = useState<1 | 2 | 3>(1);

  // Refs for 6-digit OTP inputs
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (password && confirmPassword) {
      setActiveStepHighlight(3);
    } else if (course) {
      setActiveStepHighlight(2);
    } else {
      setActiveStepHighlight(1);
    }
  }, [fullName, email, course, customCourse, isCustomCourse, password, confirmPassword]);

  const handleRoleSelect = (role: "Student" | "Faculty" | "Admin") => {
    setSelectedRole(role);
    setErrors({});
  };

  const handleCourseSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "__CUSTOM__") {
      setIsCustomCourse(true);
      setCustomCourse("");
    } else {
      setIsCustomCourse(false);
      setCourse(val);
    }
  };

  const effectiveCourse = isCustomCourse ? customCourse.trim() : course;

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      newErrors.fullName = "Please enter your full legal name.";
    }
    if (!email.trim() || !email.includes("@")) {
      newErrors.email = "Please enter a valid institute email address.";
    }
    if (selectedRole === "Student") {
      if (!effectiveCourse) {
        newErrors.course = "Please enter or select your course / program.";
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
      if (otpRes.forwardedTo) {
        setForwardedTo(otpRes.forwardedTo);
      } else {
        setForwardedTo(null);
      }
      setResendCooldown(30);
      setOtpDigits(["", "", "", "", "", ""]);
      setOtpError(null);

      // Open OTP verification modal
      setOtpModalOpen(true);
      setIsSubmitting(false);

      // Auto-focus first input
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch {
      // Fallback
      finalizeRegistration();
    }
  };

  // OTP 6-box inputs handling
  const handleOtpDigitChange = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, "");
    if (!cleanVal) {
      const newDigits = [...otpDigits];
      newDigits[index] = "";
      setOtpDigits(newDigits);
      return;
    }

    if (cleanVal.length > 1) {
      // Pasted multiple digits
      const digitsArr = cleanVal.slice(0, 6).split("");
      const newDigits = [...otpDigits];
      digitsArr.forEach((d, i) => {
        if (index + i < 6) {
          newDigits[index + i] = d;
        }
      });
      setOtpDigits(newDigits);
      const nextIdx = Math.min(index + digitsArr.length, 5);
      otpInputRefs.current[nextIdx]?.focus();
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);

    if (index < 5 && cleanVal) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtpAndActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpDigits.join("");
    if (fullOtp.length !== 6) {
      setOtpError("Please enter all 6 digits of the OTP code.");
      return;
    }

    setOtpLoading(true);
    setOtpError(null);

    try {
      const verifyRes = await verifyEmailOtp(email.trim().toLowerCase(), fullOtp, fullName.trim());
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
      const defaultDepartment = "Information Technology & Computer Engineering";
      const generatedStudentId = `AT${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;

      // Create user auth account
      const authResult = await registerAccountAction({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        accountType,
        role,
        college: INSTITUTE_CONFIG.name,
        university: "Gujarat Technological University",
        technology: defaultDepartment,
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
          formData: {
            fullName: fullName.trim(),
            email: email.trim().toLowerCase(),
            studentId: generatedStudentId,
            mobile: "9978621654",
            department: defaultDepartment,
            course: selectedRole === "Student" ? effectiveCourse : "Faculty Academic Track",
            semester: selectedRole === "Student" ? semester : "Faculty Staff",
            college: INSTITUTE_CONFIG.name,
            university: "Gujarat Technological University",
            technology: defaultDepartment,
            duration: "6 Months",
            startDate: new Date().toISOString().split("T")[0],
            category: selectedRole === "Student" ? "Student Activity & Capstone" : "Faculty Coordinator",
          },
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
        if (res.forwardedTo) setForwardedTo(res.forwardedTo);
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
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 bg-white shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
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
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-1.5 sm:px-5 sm:py-2 rounded-xl shadow-xs transition-transform hover:scale-[1.02] cursor-pointer text-xs sm:text-sm"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container - Compact Spacing with card moved UP (No excess blank space) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* Left Column: Hero Copy, 4 Pills, CTAs & Vector Illustration */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-3 sm:space-y-4 pt-1 sm:pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[11px] font-black tracking-widest text-sky-600 uppercase shadow-2xs">
              <span>LEARN • GROW • ACHIEVE</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-[2.6rem] font-black text-slate-900 tracking-tight leading-[1.15]">
              Institute Activity <br />
              <span className="text-[#E52329]">Management System</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal max-w-lg">
              Empowering students, faculty and administrators with a smart, secure and seamless platform for activities, submissions, learning and progress.
            </p>

            {/* 4 Feature Value Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
              <div className="p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex flex-col items-center text-center">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 leading-tight">
                  Secure Auth
                </span>
              </div>

              <div className="p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex flex-col items-center text-center">
                <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-1">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 leading-tight">
                  Real-time Alerts
                </span>
              </div>

              <div className="p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex flex-col items-center text-center">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
                  <FileCheck2 className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 leading-tight">
                  Submissions
                </span>
              </div>

              <div className="p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex flex-col items-center text-center">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 leading-tight">
                  Analytics
                </span>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
              <Link href="/login" className="w-full sm:w-auto">
                <Button
                  size="sm"
                  className="w-full sm:w-auto bg-[#E52329] hover:bg-[#C41C22] text-white font-bold px-5 py-2.5 rounded-xl shadow-md shadow-red-500/20 text-xs sm:text-sm flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] cursor-pointer"
                >
                  <span>Already Registered? Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
              <button
                type="button"
                onClick={() => setDemoModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-red-100 text-[#E52329] flex items-center justify-center">
                  <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                </div>
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Student Illustration */}
            <div className="relative pt-1 flex justify-center lg:justify-start">
              <div className="relative max-w-[230px] sm:max-w-[260px] w-full">
                <img
                  src="/images/student-hero-illustration.png"
                  alt="Akash Technolabs Student Management"
                  className="w-full h-auto object-contain select-none pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Registration Card - Moved Up & Compacted */}
          <div className="lg:col-span-7 xl:col-span-7">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-lg shadow-slate-200/50 p-4 sm:p-6 relative">
              <div className="text-center mb-3 sm:mb-4">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {selectedRole === "Student"
                    ? "Student Registration"
                    : `${selectedRole} Registration`}
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                  Create your verified profile to access the activity portal
                </p>
              </div>

              {/* Role Switcher Tabs (Student, Faculty, Admin) */}
              <div className="flex p-1 bg-slate-100 rounded-xl mb-3.5">
                {(["Student", "Faculty", "Admin"] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleSelect(role)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
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
              <div className="flex items-center justify-between relative mb-3.5 px-2">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition-colors ${
                      activeStepHighlight >= 1
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    1
                  </div>
                  <span
                    className={`text-[11px] font-bold ${
                      activeStepHighlight >= 1 ? "text-blue-700" : "text-slate-500"
                    }`}
                  >
                    Personal
                  </span>
                </div>

                <div className="flex-1 h-0.5 bg-slate-200 mx-2" />

                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition-colors ${
                      activeStepHighlight >= 2
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    2
                  </div>
                  <span
                    className={`text-[11px] font-bold ${
                      activeStepHighlight >= 2 ? "text-blue-700" : "text-slate-500"
                    }`}
                  >
                    Academic
                  </span>
                </div>

                <div className="flex-1 h-0.5 bg-slate-200 mx-2" />

                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition-colors ${
                      activeStepHighlight >= 3
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    3
                  </div>
                  <span
                    className={`text-[11px] font-bold ${
                      activeStepHighlight >= 3 ? "text-blue-700" : "text-slate-500"
                    }`}
                  >
                    Security
                  </span>
                </div>
              </div>

              {/* Feedback messages */}
              {successToast && (
                <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successToast}</span>
                </div>
              )}
              {errors.submit && (
                <div className="mb-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errors.submit}</span>
                </div>
              )}

              {/* Registration Form */}
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                {/* Row 1: Full Name & Institute Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        autoComplete="name"
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white placeholder-slate-400"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                        autoComplete="email"
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white placeholder-slate-400"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    {errors.email && (
                      <p className="text-[11px] text-red-500 font-semibold mt-0.5">{errors.email}</p>
                    )}
                  </div>
                </div>

                {/* Row 2: Course / Program with "Write Your Own" custom capability */}
                {selectedRole === "Student" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">
                          Course / Program <span className="text-red-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomCourse(!isCustomCourse);
                            if (!isCustomCourse) setCustomCourse("");
                          }}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                        >
                          <PenTool className="w-3 h-3" />
                          <span>{isCustomCourse ? "Select from list" : "Write your own"}</span>
                        </button>
                      </div>

                      {isCustomCourse ? (
                        <div className="relative">
                          <input
                            type="text"
                            value={customCourse}
                            onChange={(e) => setCustomCourse(e.target.value)}
                            placeholder="Type your Course / Degree (e.g. B.Sc IT)"
                            required
                            autoFocus
                            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-blue-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white placeholder-slate-400"
                          />
                          <GraduationCap className="w-4 h-4 text-blue-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      ) : (
                        <div className="relative">
                          <select
                            value={course}
                            onChange={handleCourseSelectChange}
                            required
                            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
                          >
                            <option value="B.Tech (CSE / IT) — 4 Years">B.Tech (CSE / IT) — 4 Years</option>
                            <option value="B.Tech Computer Science & Engineering">B.Tech Computer Science & Engineering</option>
                            <option value="Bachelor of Computer Applications (BCA)">Bachelor of Computer Applications (BCA)</option>
                            <option value="Master of Computer Applications (MCA)">Master of Computer Applications (MCA)</option>
                            <option value="Diploma in Computer Engineering">Diploma in Computer Engineering</option>
                            <option value="M.Tech Software Engineering">M.Tech Software Engineering</option>
                            <option value="__CUSTOM__">✍️ Other (Write your own course...)</option>
                          </select>
                        </div>
                      )}
                      {errors.course && (
                        <p className="text-[11px] text-red-500 font-semibold mt-0.5">{errors.course}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Academic Year / Semester <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={semester}
                          onChange={(e) => setSemester(e.target.value)}
                          required
                          className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
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
                  </div>
                )}

                {/* Row 3: Password & Confirm Password with WORKING SHOW/HIDE TOGGLES */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        className="w-full pl-3 pr-10 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white placeholder-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        onMouseDown={(e) => e.preventDefault()}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer z-10"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        required
                        autoComplete="new-password"
                        className="w-full pl-3 pr-10 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white placeholder-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        onMouseDown={(e) => e.preventDefault()}
                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer z-10"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-[11px] text-red-500 font-semibold mt-0.5">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Terms and Conditions Checkbox */}
                <div className="pt-0.5">
                  <label className="flex items-center gap-2 text-xs text-slate-600 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 text-[#E52329] rounded border-slate-300 focus:ring-red-500 cursor-pointer"
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

                {/* Register Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#E52329] hover:bg-[#C41C22] text-white font-bold py-2.5 sm:py-3 rounded-xl shadow-md shadow-red-500/20 text-xs sm:text-sm transition-all cursor-pointer"
                >
                  {isSubmitting ? "Processing Registration..." : "Create Account & Verify Email"}
                </Button>
              </form>

              {/* Divider: or continue with */}
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[11px]">
                  <span className="bg-white px-2.5 text-slate-400 font-medium">
                    or continue with
                  </span>
                </div>
              </div>

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={() => {
                  setErrors({ submit: "Please complete registration with your institute email address to link your academic record." });
                }}
                className="w-full py-2 px-3 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
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

              {/* Card Footer */}
              <div className="text-center mt-3 pt-2 border-t border-slate-100 text-xs text-slate-500 font-medium">
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

      {/* Signature Bottom Ribbon */}
      <footer className="bg-[#050914] border-t border-slate-800/90 py-3.5 px-4 sm:px-6 lg:px-8 select-none">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <Link href="/" className="hover:opacity-95 transition-opacity">
              <div className="bg-white px-3 py-1.5 rounded-xl border border-white/20 flex items-center shadow-2xs">
                <img
                  src="/images/akash-technolabs-logo-transparent.png"
                  alt="Akash Technolabs"
                  className="h-6 w-auto object-contain"
                />
              </div>
            </Link>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-400 font-medium hidden sm:inline text-xs">
              Building a smarter future through technology
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-[11px] font-semibold">
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
              className="font-mono text-slate-300 hover:text-white transition-colors text-[11px]"
            >
              www.akashtechnolabs.com
            </a>
          </div>
        </div>
      </footer>

      {/* Detailed & Polished Real Email OTP Verification Modal */}
      {otpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#E52329] flex items-center justify-center border border-red-100">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                    <span>Email Verification</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                      LIVE OTP
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500">Akash Technolabs Identity Verification</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOtpModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleVerifyOtpAndActivate} className="mt-4 space-y-4">
              {/* Instructions & Recipient */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <p>
                  A 6-digit verification security code was generated for{" "}
                  <strong className="text-slate-900 font-bold">{email}</strong>.
                </p>
                <p className="text-[11px] text-slate-500">
                  Please check your inbox and enter the code below to activate your account.
                </p>
              </div>

              {/* Informational Sandbox Banner if Resend Free Tier restriction applies */}
              {forwardedTo && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/90 text-xs text-amber-900 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-[11px]">
                    <p className="font-bold text-amber-950">
                      📬 Resend Sandbox Test Mode Notice:
                    </p>
                    <p className="leading-relaxed">
                      Because Resend is in free onboarding mode, the email was securely delivered to your registered Resend account inbox:{" "}
                      <strong className="font-mono text-amber-950 underline">{forwardedTo}</strong>.
                    </p>
                    <p className="text-[10px] text-amber-800">
                      Please check the inbox or spam folder of <strong>{forwardedTo}</strong> to view your 6-digit code!
                    </p>
                  </div>
                </div>
              )}

              {otpError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              {/* 6 Individual Interactive Digit Input Boxes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 text-center">
                  Enter 6-Digit Verification Code
                </label>
                <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className={`w-11 h-12 text-center text-xl font-mono font-black rounded-xl border transition-all ${
                        digit
                          ? "border-blue-600 bg-blue-50/40 text-blue-900 shadow-xs"
                          : "border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <Button
                type="submit"
                disabled={otpLoading || otpDigits.join("").length !== 6}
                className="w-full bg-[#E52329] hover:bg-[#C41C22] text-white font-bold py-3 rounded-xl text-xs sm:text-sm cursor-pointer shadow-md shadow-red-500/20 transition-all disabled:opacity-50"
              >
                {otpLoading ? "Verifying Code..." : "Verify & Activate Account"}
              </Button>

              {/* Resend and Timer */}
              <div className="flex items-center justify-between pt-1 text-xs px-1 text-slate-500">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Valid for 10 minutes
                </span>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || otpLoading}
                  className={`font-semibold cursor-pointer ${
                    resendCooldown > 0
                      ? "text-slate-400 cursor-not-allowed"
                      : "text-blue-600 hover:text-blue-700 hover:underline"
                  }`}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Watch Demo Modal */}
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
