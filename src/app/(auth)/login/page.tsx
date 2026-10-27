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
  KeyRound,
  ExternalLink,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

// Pre-seeded Akash Technolabs Accounts with exact passwords for 1-click instant login
const AKASH_PERSONAS = [
  {
    roleLabel: "CEO / Admin",
    name: "Akash Padhiyar",
    email: "akash@akashtechnolabs.com",
    password: "Akash@2026",
    badge: "Admin Console",
    icon: Crown,
    color: "from-red-600 to-rose-700",
    border: "border-red-300 hover:border-red-500",
    bg: "bg-red-50/70 hover:bg-red-100/80",
    roleText: "text-red-700",
  },
  {
    roleLabel: "AI/ML Intern",
    name: "Fenil Patel",
    email: "fenil.patel@akashtechnolabs.com",
    password: "Fenil@2026",
    badge: "Student Portal",
    icon: GraduationCap,
    color: "from-blue-600 to-indigo-700",
    border: "border-blue-300 hover:border-blue-500",
    bg: "bg-blue-50/70 hover:bg-blue-100/80",
    roleText: "text-blue-700",
  },
  {
    roleLabel: "Cloud Intern",
    name: "Priya Sharma",
    email: "priya.sharma@akashtechnolabs.com",
    password: "Priya@2026",
    badge: "Student Portal",
    icon: GraduationCap,
    color: "from-indigo-600 to-purple-700",
    border: "border-indigo-300 hover:border-indigo-500",
    bg: "bg-indigo-50/70 hover:bg-indigo-100/80",
    roleText: "text-indigo-700",
  },
  {
    roleLabel: "Full Stack Intern",
    name: "Harshit Mehta",
    email: "harshit.mehta@akashtechnolabs.com",
    password: "Harshit@2026",
    badge: "Student Portal",
    icon: GraduationCap,
    color: "from-emerald-600 to-teal-700",
    border: "border-emerald-300 hover:border-emerald-500",
    bg: "bg-emerald-50/70 hover:bg-emerald-100/80",
    roleText: "text-emerald-700",
  },
];

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
  const [activeOtpCode, setActiveOtpCode] = useState<string | null>(null);
  const [deliveryProvider, setDeliveryProvider] = useState<string>("Resend");

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
        if (res.otpPreview) {
          setActiveOtpCode(res.otpPreview);
        }
        if (res.provider) {
          setDeliveryProvider(res.provider);
        }
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage("Failed to send OTP code via Resend. Please try again.");
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
        setSuccessMessage(`Fresh verification code dispatched via ${res.provider || "Resend"}.`);
        setResendCooldown(30);
        setOtp("");
        if (res.otpPreview) {
          setActiveOtpCode(res.otpPreview);
        }
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
      setSuccessMessage("All custom testing accounts cleared.");
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
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#080d1a] text-slate-100 overflow-x-hidden font-sans">
      {/* ================= LEFT COLUMN: AKASH TECHNOLABS BRAND SHOWCASE ================= */}
      <div className="lg:w-[54%] xl:w-[56%] relative flex flex-col justify-between p-6 sm:p-10 lg:p-12 overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800/80 bg-gradient-to-br from-[#070b16] via-[#0f172a] to-[#121c35]">
        {/* Dynamic Glow Orbs in Akash Red and Navy */}
        <div className="absolute top-0 -left-10 w-96 h-96 bg-red-600/15 rounded-full blur-[140px] pointer-events-none -z-0" />
        <div className="absolute bottom-10 right-10 w-[420px] h-[420px] bg-[#1e3264]/40 rounded-full blur-[160px] pointer-events-none -z-0" />
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-rose-500/10 rounded-full blur-[110px] pointer-events-none -z-0" />

        {/* Top Navbar Row */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/images/akash-technolabs-header-logo.png"
              alt="Akash Technolabs"
              className="h-10 sm:h-12 w-auto object-contain drop-shadow-sm bg-white/95 px-3 py-1.5 rounded-xl border border-slate-700/60"
            />
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-700 hover:border-red-500/50 bg-slate-900/90 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-all hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return Home</span>
          </Link>
        </div>

        {/* Center: Akash Technolabs Portal Identity */}
        <div className="relative z-10 my-8 space-y-6 max-w-2xl">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-950/80 text-red-300 border border-red-800/80">
              <Sparkles className="w-3.5 h-3.5 text-red-400" />
              Official Practicum &amp; Internship Platform
            </div>

            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black text-white tracking-tight leading-tight">
              Akash<span className="text-[#d32f2f]">®</span> Technolabs <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-300 to-blue-400">
                Student &amp; Intern Workspace
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Log in to manage practicum tasks, punch live attendance sessions, submit daily work reports, and access verifiable offer letters.
            </p>

            {/* Split Two-Color Accent Bar */}
            <div className="w-48 flex h-1 rounded-full overflow-hidden">
              <div className="w-[28%] bg-[#1e3264]" />
              <div className="w-[72%] bg-[#d32f2f]" />
            </div>
          </div>

          {/* 3 Core Internship Practicums */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-red-900/40 hover:border-red-500/50 transition-all space-y-2">
              <div className="w-8 h-8 rounded-xl bg-red-950 text-red-400 border border-red-800/80 flex items-center justify-center font-bold text-xs">
                AI
              </div>
              <h3 className="text-xs font-bold text-white">AI/ML &amp; Python</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Computer vision, NLP pipelines, deep learning models, and real-time production inference.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-blue-900/40 hover:border-blue-500/50 transition-all space-y-2">
              <div className="w-8 h-8 rounded-xl bg-blue-950 text-blue-400 border border-blue-800/80 flex items-center justify-center font-bold text-xs">
                FS
              </div>
              <h3 className="text-xs font-bold text-white">Full Stack Web</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Next.js, React, Node.js microservices, PostgreSQL architectures, and REST/GraphQL APIs.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-indigo-900/40 hover:border-indigo-500/50 transition-all space-y-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800/80 flex items-center justify-center font-bold text-xs">
                CL
              </div>
              <h3 className="text-xs font-bold text-white">Cloud &amp; DevOps</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                CI/CD workflows, containerization with Docker, Kubernetes clusters, and cloud security.
              </p>
            </div>
          </div>

          {/* Credential Authenticity Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-900/60 to-blue-950/40 border border-red-800/30 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-red-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Cryptographically Sealed Credentials &amp; RBAC</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Every internship offer letter and completion certificate issued by Akash Technolabs is anchored with a deterministic SHA-256 ledger fingerprint for employer verification.
            </p>
          </div>
        </div>

        {/* Bottom Contact & Verification Footer */}
        <div className="relative z-10 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-4">
          <div className="flex items-center gap-4 flex-wrap text-[11px]">
            <span>🌐 www.akashtechnolabs.com</span>
            <span>📞 +91 99786 21654</span>
            <span>📍 Ahmedabad, India</span>
          </div>
          <span className="font-mono text-[10px] text-slate-500">Akash Technolabs Portal v4.0</span>
        </div>
      </div>

      {/* ================= RIGHT COLUMN: AUTHENTICATION TERMINAL ================= */}
      <div className="lg:w-[46%] xl:w-[44%] flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-white text-slate-900 overflow-y-auto">
        <div className="space-y-6 max-w-md w-full mx-auto my-auto py-4">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                Akash Technolabs Authentication
              </span>
              <span className="text-[11px] text-slate-500 font-mono">RBAC Secured</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Sign In to Your Workspace
            </h2>
            <p className="text-xs text-slate-500">
              Access the administrative dashboard or student internship portal.
            </p>
          </div>

          {/* 1-CLICK AKASH TECHNOLABS PERSONAS (ADMIN + STUDENTS) */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#d32f2f]" />
                1-Click Demo Accounts (Admin &amp; Students)
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Click to Fill</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {AKASH_PERSONAS.map((persona) => {
                const IconComponent = persona.icon;
                return (
                  <button
                    key={persona.email}
                    type="button"
                    onClick={() => {
                      setEmail(persona.email);
                      setPassword(persona.password);
                      setErrorMessage("");
                      setSuccessMessage(`Auto-filled ${persona.name} (${persona.roleLabel}) credentials.`);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 cursor-pointer shadow-2xs ${persona.bg} ${persona.border}`}
                  >
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${persona.color} text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs`}>
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 truncate">{persona.name}</span>
                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${persona.roleText} bg-white/80 border border-slate-200 shrink-0`}>
                          {persona.roleLabel}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono truncate">{persona.email}</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">Key: <span className="font-mono font-bold text-slate-700">{persona.password}</span></p>
                    </div>
                  </button>
                );
              })}
            </div>
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
                  ? "bg-white text-[#d32f2f] shadow-xs font-black"
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
                  ? "bg-white text-[#1e3264] shadow-xs font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              Email OTP (Resend)
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
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Interactive Resend Testing Delivery Assistant Card */}
          {authMode === "OTP" && activeOtpCode && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-50 to-blue-50 border border-red-200 text-xs flex items-center justify-between gap-3 animate-in fade-in">
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-red-600" />
                  {deliveryProvider} Delivery Dispatched
                </span>
                <p className="text-xs text-slate-800 font-medium mt-0.5">
                  Code for <strong className="text-slate-900">{email}</strong>:{" "}
                  <span className="font-mono font-bold text-red-700 text-sm tracking-wider px-1.5 py-0.5 rounded bg-white border border-red-200 ml-1">
                    {activeOtpCode}
                  </span>
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => setOtp(activeOtpCode)}
                className="bg-[#1e3264] hover:bg-[#152347] text-white text-xs font-bold rounded-xl px-3 py-1 cursor-pointer shrink-0 shadow-xs"
              >
                Auto-Fill
              </Button>
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
                    placeholder="e.g. akash@akashtechnolabs.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all placeholder:text-slate-400 bg-white"
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
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all placeholder:text-slate-400 bg-white"
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
                    className="rounded border-slate-300 text-red-600 focus:ring-red-500 w-4 h-4"
                  />
                  <span className="font-medium">Stay signed in for 7 days</span>
                </label>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-[#d32f2f] hover:bg-[#b91c1c] text-white font-bold rounded-xl py-3 shadow-md hover:shadow-lg transition-all cursor-pointer"
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
                      placeholder="e.g. fenil.patel@akashtechnolabs.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all placeholder:text-slate-400 bg-white"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    A secure 6-digit numeric login code will be delivered to your inbox via Resend.
                  </p>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-[#1e3264] hover:bg-[#152347] text-white font-bold rounded-xl py-3 shadow-md cursor-pointer"
                  isLoading={isLoading}
                >
                  Send Resend Verification Code
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
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-300 text-center text-xl font-mono tracking-[0.4em] font-bold focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-400 bg-white"
                  />
                  <p className="text-[11px] text-slate-500 mt-1.5 text-center">
                    Enter the 6-digit code delivered to <strong className="text-slate-800">{email}</strong>.
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("EMAIL");
                      setActiveOtpCode(null);
                    }}
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
                        : "text-[#d32f2f] hover:text-red-800 hover:underline cursor-pointer"
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
                  className="w-full bg-[#d32f2f] hover:bg-[#b91c1c] text-white font-bold rounded-xl py-3 shadow-md cursor-pointer"
                  isLoading={isLoading}
                >
                  Verify Code &amp; Launch Portal
                </Button>
              </form>
            )
          )}
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>Need to enroll as a new student intern?</span>
          <Link
            href="/register"
            className="font-bold text-[#d32f2f] hover:text-red-800 flex items-center gap-1 group"
          >
            <span>Register Student Account</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
