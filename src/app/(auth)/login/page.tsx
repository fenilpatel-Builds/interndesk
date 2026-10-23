"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  Building2,
  Shield,
  Briefcase,
  UserCheck,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { sendEmailOtp, verifyEmailOtp, loginWithPassword } from "@/lib/auth/actions";

interface PersonaConfig {
  id: string;
  roleName: string;
  personName: string;
  organization: string;
  email: string;
  password: string;
  icon: React.ReactNode;
  badge: string;
  tagline: string;
  quote: string;
  duties: string[];
}

const PERSONAS: PersonaConfig[] = [
  {
    id: "ceo",
    roleName: "Company Owner / CEO",
    personName: "Elena Rostova",
    organization: "Apex Technologies",
    email: "admin@apextech.com",
    password: "apex123",
    icon: <Building2 className="w-4 h-4 text-blue-400" />,
    badge: "Enterprise Workspace",
    tagline: "Total Organizational Purview & Governance",
    quote:
      "InternDesk allows us to manage 500+ engineering interns with automated biometric timesheets, cryptographic document issuance, and zero fee overhead.",
    duties: [
      "Department & Team Structure Management",
      "Executive Analytics & Performance KPIs",
      "Batch Document & Offer Letter Issuance",
      "Organization Branding & Security Settings",
    ],
  },
  {
    id: "dean",
    roleName: "University Dean & Director",
    personName: "Prof. David Kumar",
    organization: "Westbridge University",
    email: "admin@westbridge.edu",
    password: "wbu123",
    icon: <GraduationCap className="w-4 h-4 text-indigo-400" />,
    badge: "Higher Education",
    tagline: "Academic Practicum & Placement Supervision",
    quote:
      "Our students complete accredited software internships with verified attendance ledgers that seamlessly bridge academia and industry.",
    duties: [
      "Capstone Cohort & Curriculum Tracking",
      "Student Placement Verification",
      "Academic Grade & Report Endorsements",
      "Institutional Policy Compliance",
    ],
  },
  {
    id: "superadmin",
    roleName: "Platform Super Admin",
    personName: "Security Administrator",
    organization: "InternDesk Global HQ",
    email: "superadmin@interndesk.com",
    password: "superadmin123",
    icon: <Shield className="w-4 h-4 text-red-400" />,
    badge: "Platform Control",
    tagline: "Zero-Trust Security & Multi-Tenant Oversight",
    quote:
      "Cryptographically tamper-proof sessions and strict tenant query isolation protect sensitive workforce data across all client organizations.",
    duties: [
      "Cross-Tenant Health & Safety Auditing",
      "Organization Code Rotation & Approvals",
      "Zero-Trust Access Control (RBAC)",
      "System Uptime & Incident Response",
    ],
  },
  {
    id: "mentor",
    roleName: "Engineering Lead & Mentor",
    personName: "Marcus Sterling",
    organization: "Apex Technologies",
    email: "marcus@apextech.com",
    password: "apex123",
    icon: <Briefcase className="w-4 h-4 text-emerald-400" />,
    badge: "Mentorship & Sprint",
    tagline: "Daily Sprint & Task Collaboration",
    quote:
      "Reviewing daily reports and unblocking interns takes minutes, with real-time GitHub branch links and milestone scoring.",
    duties: [
      "Sprint Task Creation & Assignee Tracking",
      "Daily Work Report Code Reviews",
      "Weekly Technical Mentorship Evaluations",
      "Attendance & Leave Request Approvals",
    ],
  },
  {
    id: "student",
    roleName: "Software Engineering Intern",
    personName: "Fenil Patel",
    organization: "Apex Technologies",
    email: "fenil8918@gmail.com",
    password: "password123",
    icon: <UserCheck className="w-4 h-4 text-cyan-400" />,
    badge: "Student Portal",
    tagline: "Live 24h Work Sessions & Skill Credentials",
    quote:
      "I clock in for my shifts, tackle sprint tasks, pass technical assessments, and download verified offer letters and certificates.",
    duties: [
      "24-Hour Daily Shift Tracking & Breaks",
      "Task Kanban Board & Deliverable Submissions",
      "Online LMS Modules & Timed MCQ Exams",
      "Official Offer Letter & Certificate Vault",
    ],
  },
];

export default function LoginPage() {
  const [authMode, setAuthMode] = useState<"PASSWORD" | "OTP">("PASSWORD");
  const [activePersona, setActivePersona] = useState<PersonaConfig>(PERSONAS[0]);
  const [step, setStep] = useState<"EMAIL" | "OTP">("EMAIL");
  const [email, setEmail] = useState("admin@apextech.com");
  const [password, setPassword] = useState("apex123");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [resendCooldown, setResendCooldown] = useState(30);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "OTP" && resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, resendCooldown]);

  const selectPersona = (p: PersonaConfig) => {
    setActivePersona(p);
    setEmail(p.email);
    setPassword(p.password);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your account password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginWithPassword(email.toLowerCase().trim(), password);
      if (res.success && res.redirectTo) {
        setSuccessMessage(res.message);
        window.location.href = res.redirectTo;
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage("Authentication failed. Please verify your credentials and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await sendEmailOtp(email.toLowerCase().trim());
      if (res.success) {
        setSuccessMessage(res.message);
        setStep("OTP");
        setResendCooldown(30);
        setOtp("");
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage("Failed to send OTP code via Supabase Auth. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const res = await sendEmailOtp(email.toLowerCase().trim());
      if (res.success) {
        setSuccessMessage("A fresh 6-digit verification code has been dispatched via Supabase Auth.");
        setResendCooldown(30);
        setOtp("");
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage("Failed to resend verification code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      setErrorMessage("Please enter the complete 6-digit numeric OTP code sent to your email.");
      return;
    }

    setIsLoading(true);
    try {
      const deviceInfo = {
        deviceLabel: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 80) : "Browser",
        browser: "Web Browser",
        os: typeof navigator !== "undefined" ? navigator.platform : "Desktop",
        ipHash: "session-client",
      };

      const res = await verifyEmailOtp(email.toLowerCase().trim(), cleanOtp, deviceInfo);
      if (res.success && res.redirectTo) {
        setSuccessMessage(res.message);
        window.location.href = res.redirectTo;
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage("An unexpected verification error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* ================= LEFT COLUMN: DYNAMIC ENTERPRISE SHOWCASE (58% desktop) ================= */}
      <div className="lg:w-[58%] xl:w-[60%] relative flex flex-col justify-between p-6 sm:p-10 lg:p-12 overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800 bg-gradient-to-br from-slate-950 via-[#0a1128] to-slate-900">
        {/* Futuristic Ambient Glow Orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none -z-0" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none -z-0" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none -z-0" />

        {/* Top Navbar Row */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AnimatedLogo size="md" />
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-950/80 text-blue-300 border border-blue-800/80 shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Multi-Tenant Architecture
            </span>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 hover:border-slate-500 bg-slate-900/80 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Landing</span>
          </Link>
        </div>

        {/* Center: Dynamic Multi-Persona Interactive Showcase */}
        <div className="relative z-10 my-8 space-y-8 max-w-2xl">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-950/80 text-cyan-300 border border-cyan-800">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Enterprise Role-Based Access
            </div>
            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black text-white tracking-tight leading-tight">
              One Unified Platform. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400">
                Tailored for Every Stakeholder.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Select an account persona below to preview how InternDesk adapts dynamically to your organizational workflow.
            </p>
          </div>

          {/* Interactive Persona Tabs */}
          <div className="space-y-3">
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Select Role Persona (Auto-Fills Login):
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PERSONAS.map((p) => {
                const isActive = activePersona.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => selectPersona(p)}
                    className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                      isActive
                        ? "bg-blue-950/70 border-blue-500 shadow-lg shadow-blue-500/20 ring-1 ring-blue-500"
                        : "bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
                        {p.icon}
                      </div>
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white truncate">{p.roleName}</p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">{p.personName}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Persona Spotlight Card */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-600/30 border border-blue-400/40 text-blue-300">
                  {activePersona.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{activePersona.roleName}</h3>
                  <p className="text-xs text-cyan-300 font-mono">
                    {activePersona.personName} • {activePersona.organization}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                {activePersona.badge}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed border-l-2 border-blue-500 pl-3">
              &ldquo;{activePersona.quote}&rdquo;
            </p>

            <div className="pt-2 border-t border-slate-800">
              <p className="text-[10px] uppercase font-mono font-bold text-slate-400 mb-2">
                Core Responsibilities &amp; Capabilities:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activePersona.duties.map((duty, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{duty}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Trust Indicators */}
        <div className="relative z-10 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              HMAC-SHA256 Signed Tokens
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Layers className="w-4 h-4 text-cyan-400" />
              100% Free • No Payment Gateways
            </span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">v3.4 Enterprise Ready</span>
        </div>
      </div>

      {/* ================= RIGHT COLUMN: AUTHENTICATION TERMINAL (42% desktop) ================= */}
      <div className="lg:w-[42%] xl:w-[40%] flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-white text-slate-900">
        <div className="space-y-6 max-w-md w-full mx-auto my-auto">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Supabase Auth Protected
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Secured Session</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Sign In to Your Workspace
            </h2>
            <p className="text-xs text-slate-500">
              Authenticate into your corporate, academic, or student portal.
            </p>
          </div>

          {/* Auth Method Segmented Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1 border border-slate-200/80">
            <button
              type="button"
              onClick={() => {
                setAuthMode("PASSWORD");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === "PASSWORD"
                  ? "bg-white text-blue-600 shadow-sm font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              Password Login
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("OTP");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === "OTP"
                  ? "bg-white text-blue-600 shadow-sm font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              Email 6-Digit OTP
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium leading-relaxed flex items-start gap-2 animate-in fade-in">
              <span className="text-red-500 text-base leading-none">⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Password Authentication Form */}
          {authMode === "PASSWORD" ? (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="user@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-slate-400 bg-white"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-slate-400 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="font-medium">Stay signed in for 7 days</span>
                </label>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-3 shadow-md hover:shadow-lg transition-all"
                isLoading={isLoading}
              >
                Sign In with Supabase
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          ) : (
            /* OTP Authentication Flow */
            step === "EMAIL" ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="user@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-slate-400 bg-white"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Supabase Auth will dispatch a genuine 6-digit one-time passcode to your inbox.
                  </p>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-3 shadow-md"
                  isLoading={isLoading}
                >
                  Send 6-Digit Code via Supabase
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    6-Digit Supabase Verification Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="••••••"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-300 text-center text-xl font-mono tracking-[0.4em] font-bold focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-400 bg-white"
                  />
                  <p className="text-[11px] text-slate-500 mt-1.5 text-center">
                    Enter the code sent to <strong className="text-slate-800">{email}</strong>.
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setStep("EMAIL")}
                    className="font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    ← Change email
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || isResending}
                    className={`font-bold transition-colors ${
                      resendCooldown > 0 || isResending
                        ? "text-slate-400 cursor-not-allowed"
                        : "text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    }`}
                  >
                    {isResending
                      ? "Sending..."
                      : resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : "Resend Code"}
                  </button>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-3 shadow-md"
                  isLoading={isLoading}
                >
                  Verify Code &amp; Launch Portal
                </Button>
              </form>
            )
          )}

          {/* Quick Persona Fill Pills (Section 28) */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 text-center">
              Quick One-Click Demo Personas
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => selectPersona(PERSONAS[0])}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold text-[11px] text-left transition-colors cursor-pointer"
              >
                🏢 Apex Org Admin
              </button>
              <button
                type="button"
                onClick={() => selectPersona(PERSONAS[4])}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold text-[11px] text-left transition-colors cursor-pointer"
              >
                🎓 Student Intern (Fenil)
              </button>
              <button
                type="button"
                onClick={() => selectPersona(PERSONAS[1])}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold text-[11px] text-left transition-colors cursor-pointer"
              >
                🏛️ Westbridge University
              </button>
              <button
                type="button"
                onClick={() => selectPersona(PERSONAS[2])}
                className="p-2 rounded-xl border border-red-200 bg-red-50/70 hover:bg-red-100 text-red-700 font-semibold text-[11px] text-left transition-colors cursor-pointer"
              >
                🛡️ Platform Super Admin
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>New organization or student?</span>
          <Link
            href="/register"
            className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
          >
            <span>Register Now (100% Free)</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
