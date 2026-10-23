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
  UserCheck,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  Layers,
  Trash2,
  RefreshCw,
  AlertCircle,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import {
  sendEmailOtp,
  verifyEmailOtp,
  loginWithPassword,
  getRegisteredAccountsAction,
  clearAllTestingAccountsAction,
} from "@/lib/auth/actions";

interface RegisteredAccountSummary {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId?: string;
  organizationName?: string;
  organizationType?: "CORPORATE" | "EDUCATIONAL" | "COMMUNITY";
  createdAt: string;
}

export default function LoginPage() {
  const [authMode, setAuthMode] = useState<"PASSWORD" | "OTP">("PASSWORD");
  const [step, setStep] = useState<"EMAIL" | "OTP">("EMAIL");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [resendCooldown, setResendCooldown] = useState(30);
  const [isResending, setIsResending] = useState(false);

  // Dynamic Registered Accounts from Server Store
  const [registeredAccounts, setRegisteredAccounts] = useState<RegisteredAccountSummary[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [isClearingAccounts, setIsClearingAccounts] = useState(false);

  const fetchAccounts = async () => {
    setIsLoadingAccounts(true);
    try {
      const accounts = await getRegisteredAccountsAction();
      setRegisteredAccounts(accounts || []);
    } catch {
      setRegisteredAccounts([]);
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

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
        setErrorMessage(res.message || "Invalid login credentials. Please check your email and password.");
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

  const handleClearAllTestingAccounts = async () => {
    setIsClearingAccounts(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("interndesk_custom_orgs");
        localStorage.removeItem("interndesk_custom_mems");
      }
      await clearAllTestingAccountsAction();
      setSuccessMessage("All testing accounts deleted. You can now register fresh accounts.");
      setEmail("");
      setPassword("");
      await fetchAccounts();
    } catch {
      setErrorMessage("Failed to clear testing accounts.");
    } finally {
      setIsClearingAccounts(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* ================= LEFT COLUMN: ENTERPRISE SHOWCASE ================= */}
      <div className="lg:w-[55%] xl:w-[58%] relative flex flex-col justify-between p-6 sm:p-10 lg:p-12 overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800 bg-gradient-to-br from-slate-950 via-[#0a1128] to-slate-900">
        {/* Glow Effects */}
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
            <span>Return Home</span>
          </Link>
        </div>

        {/* Center: Enterprise Pillars Overview */}
        <div className="relative z-10 my-8 space-y-6 max-w-2xl">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-950/80 text-cyan-300 border border-cyan-800">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Enterprise Workforce &amp; Academic OS
            </div>
            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black text-white tracking-tight leading-tight">
              One Unified Platform. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400">
                Built for Verification, Trust &amp; Scale.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Sign in to manage academic cohorts, company internship programs, or track your verified technical work sessions.
            </p>
          </div>

          {/* 3 Unified Pillars Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Pillar 1: Universities */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-indigo-900/50 hover:border-indigo-500/50 transition-all space-y-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white">Institutes &amp; Colleges</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Supervise student placement cohorts, verify attendance ledgers, and issue accredited endorsements.
              </p>
            </div>

            {/* Pillar 2: Companies */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-blue-900/50 hover:border-blue-500/50 transition-all space-y-2">
              <div className="w-8 h-8 rounded-xl bg-blue-950 text-blue-400 border border-blue-800 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white">Companies &amp; Startups</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Automated shift timesheets, task Kanban workflows, mentorship reviews, and tamper-proof offer letters.
              </p>
            </div>

            {/* Pillar 3: Students */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-900/50 hover:border-cyan-500/50 transition-all space-y-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white">Students &amp; Interns</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                24H live shift tracking, daily work reports, skills assessments, and verifiable credentials vault.
              </p>
            </div>
          </div>

          {/* Platform Guarantees Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-800/40 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-cyan-300 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Free Public Good Platform</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              InternDesk has zero registration fees, zero document download costs, and zero payment gateways. Complete access for every student, institute, and enterprise.
            </p>
          </div>
        </div>

        {/* Bottom Security Credentials */}
        <div className="relative z-10 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              HMAC-SHA256 Signed Sessions
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Layers className="w-4 h-4 text-cyan-400" />
              Multi-Tenant Data Isolation
            </span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">v3.5 Verified Release</span>
        </div>
      </div>

      {/* ================= RIGHT COLUMN: AUTHENTICATION TERMINAL ================= */}
      <div className="lg:w-[45%] xl:w-[42%] flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-white text-slate-900">
        <div className="space-y-6 max-w-md w-full mx-auto my-auto">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Zero-Trust Security
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Secured Session</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Sign In to InternDesk
            </h2>
            <p className="text-xs text-slate-500">
              Enter your registered credentials to launch your workspace or student dashboard.
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
                  ? "bg-white text-blue-600 shadow-xs font-black"
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
                  ? "bg-white text-blue-600 shadow-xs font-black"
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
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
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
                    placeholder="Enter your registered email"
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
                  Account Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
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
                Sign In to Portal
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
                      placeholder="Enter your registered email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-slate-400 bg-white"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    A genuine 6-digit numeric verification code will be sent to your email.
                  </p>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-3 shadow-md"
                  isLoading={isLoading}
                >
                  Send 6-Digit Code
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    6-Digit Verification Code
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

          {/* DYNAMIC REGISTERED ACCOUNTS LIST */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-600" />
                Your Registered Accounts ({registeredAccounts.length})
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchAccounts}
                  title="Refresh list"
                  className="text-slate-400 hover:text-slate-600 text-xs p-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAccounts ? "animate-spin" : ""}`} />
                </button>
                {registeredAccounts.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllTestingAccounts}
                    disabled={isClearingAccounts}
                    className="text-[10px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear Accounts</span>
                  </button>
                )}
              </div>
            </div>

            {registeredAccounts.length > 0 ? (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {registeredAccounts.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => {
                      setEmail(acc.email);
                      setErrorMessage("");
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/80 hover:border-blue-300 text-left transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="truncate pr-2">
                      <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700 truncate">
                        {acc.name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono truncate">
                        {acc.email} {acc.organizationName ? `• ${acc.organizationName}` : ""}
                      </p>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 shrink-0">
                      {acc.role === "STUDENT" ? "Student" : (acc.organizationType === "EDUCATIONAL" ? "Institute" : "Company")}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
                <p className="text-xs text-slate-600 font-medium">No registered accounts found.</p>
                <p className="text-[10px] text-slate-400">
                  Register your Institute, Company, or Student profile below to begin.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>Need a new portal or student account?</span>
          <Link
            href="/register"
            className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
          >
            <span>Register New Account (Free)</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
