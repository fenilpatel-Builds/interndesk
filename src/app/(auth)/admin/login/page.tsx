"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  GraduationCap,
  Sparkles,
  Shield,
  FileCheck2,
  Sliders,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { loginWithPassword, sendEmailOtp, verifyEmailOtp } from "@/lib/auth/actions";
import { isUserAdmin } from "@/lib/auth/admin-whitelist";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState<"PASSWORD" | "OTP">("PASSWORD");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // OTP 2FA State
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [forwardedTo, setForwardedTo] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Guarantee clean fields on load (prevents browser autofill leakage of previous credentials/OTPs)
  useEffect(() => {
    setEmail("");
    setPassword("");
    setOtpDigits(["", "", "", "", "", ""]);
    setOtpSent(false);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const switchAuthMode = (mode: "PASSWORD" | "OTP") => {
    setAuthMode(mode);
    setPassword("");
    setOtpDigits(["", "", "", "", "", ""]);
    setOtpSent(false);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleAdminPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!isUserAdmin(cleanEmail)) {
      setErrorMessage(
        "Access Denied: This administrative portal is restricted exclusively to authorized administrators. Please use the student portal for intern logins."
      );
      setLoading(false);
      return;
    }

    try {
      const result = await loginWithPassword(cleanEmail, password);
      if (result.success) {
        if (result.requiresOtp) {
          setAuthMode("OTP");
          setOtpSent(true);
          setOtpDigits(["", "", "", "", "", ""]);
          if (result.forwardedTo) setForwardedTo(result.forwardedTo);
          setSuccessMessage(
            result.message || "2-Factor Authentication Code dispatched. Enter your 6-digit code below."
          );
          setResendCooldown(30);
          setTimeout(() => {
            otpInputRefs.current[0]?.focus();
          }, 150);
          return;
        }

        router.push("/admin/dashboard");
      } else {
        setErrorMessage(result.error || result.message || "Invalid administrative credentials.");
      }
    } catch {
      setErrorMessage("An unexpected authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!isUserAdmin(cleanEmail)) {
      setErrorMessage(
        "Access Denied: Verification codes are issued exclusively to verified administrators."
      );
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setOtpDigits(["", "", "", "", "", ""]);

    try {
      const res = await sendEmailOtp(cleanEmail);
      if (res.success) {
        setOtpSent(true);
        setOtpDigits(["", "", "", "", "", ""]);
        if (res.forwardedTo) setForwardedTo(res.forwardedTo);
        setSuccessMessage(res.message);
        setResendCooldown(30);
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 150);
      } else {
        setErrorMessage(res.message || "Failed to dispatch verification code.");
      }
    } catch {
      setErrorMessage("An unexpected error occurred while sending OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const cleanVal = value.replace(/[^0-9]/g, "");

    // Multi-digit paste handler
    if (cleanVal.length > 1) {
      const digitsArr = cleanVal.slice(0, 6).split("");
      const newDigits = [...otpDigits];
      for (let i = 0; i < digitsArr.length; i++) {
        if (index + i < 6) newDigits[index + i] = digitsArr[i];
      }
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

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpDigits.join("");
    if (fullOtp.length !== 6) {
      setErrorMessage("Please enter all 6 digits of the administrator verification code.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await verifyEmailOtp(cleanEmail, fullOtp);
      if (res.success) {
        setOtpDigits(["", "", "", "", "", ""]);
        setPassword("");
        router.push("/admin/dashboard");
      } else {
        setErrorMessage(res.error || res.message || "Invalid or expired admin verification code.");
        setOtpDigits(["", "", "", "", "", ""]);
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 100);
      }
    } catch {
      setErrorMessage("An unexpected verification error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-slate-50 via-white to-blue-50/40 select-none">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <AnimatedLogo size="md" showTagline={false} />

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors shadow-2xs cursor-pointer"
              >
                <GraduationCap className="w-3.5 h-3.5 text-[#0F4C81]" />
                <span>Student / Intern Portal →</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container - Dual Column Layout matching app design */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Executive Authority Copy & Badges */}
          <div className="lg:col-span-7 space-y-4 pt-1 sm:pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-[11px] font-black tracking-widest text-[#E52329] uppercase shadow-2xs">
              <ShieldAlert className="w-3.5 h-3.5 text-[#E52329]" />
              <span>ADMINISTRATOR CONSOLE GATE</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-black text-slate-900 tracking-tight leading-[1.15]">
              Akash Technolabs <br />
              <span className="text-[#E52329]">Administrative Portal</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl font-normal">
              Restricted executive gateway for authorized coordinators, faculty evaluators, and institutional administrators. Manage task allocations, review submissions, and supervise certified credentials.
            </p>

            {/* 4 Feature Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-xl bg-red-50 text-[#E52329] flex items-center justify-center mb-1.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  Whitelisted Access
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Executive Staff Only</span>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0F4C81] flex items-center justify-center mb-1.5">
                  <Lock className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  2FA Cryptographic
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Email OTP &amp; HMAC</span>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  Official Letters
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Direct PDF Issuance</span>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-1.5">
                  <Sliders className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  Live Attendance
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Real-time Punches</span>
              </div>
            </div>

            {/* Whitelist Security Notice */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5 max-w-xl">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <strong className="font-bold text-amber-950">Security Notice: </strong>
                This console is protected by zero-trust role-based authorization. Logins are strictly whitelisted to executive administrators. Unrecognized emails will be rejected automatically.
              </div>
            </div>
          </div>

          {/* Right Column: Clean White Authentication Card */}
          <div className="lg:col-span-5 w-full">
            <div className="bg-white border border-slate-200/90 shadow-xl shadow-slate-200/50 rounded-3xl p-6 sm:p-8 space-y-5">
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    Administrator Sign In
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0F4C81] border border-blue-200">
                    Lead Console
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Authenticate with administrator password or direct 2FA OTP code.
                </p>
              </div>

              {/* Mode Toggle Switcher */}
              <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => switchAuthMode("PASSWORD")}
                  className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                    authMode === "PASSWORD"
                      ? "bg-white text-slate-900 shadow-2xs font-extrabold"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Password Login
                </button>
                <button
                  type="button"
                  onClick={() => switchAuthMode("OTP")}
                  className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                    authMode === "OTP"
                      ? "bg-white text-[#0F4C81] shadow-2xs font-extrabold"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Email OTP Code
                </button>
              </div>

              {/* Feedback Alerts */}
              {errorMessage && (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}
              {successMessage && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* PASSWORD LOGIN FORM */}
              {authMode === "PASSWORD" ? (
                <form onSubmit={handleAdminPasswordLogin} autoComplete="off" className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Administrator Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="off"
                        placeholder="admin@akashtechnolabs.com"
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-500 text-slate-900 bg-white placeholder-slate-400 font-medium"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">
                        Administrator Password <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          switchAuthMode("OTP");
                          if (email.trim()) {
                            handleRequestOtp();
                          }
                        }}
                        className="text-[11px] font-bold text-[#0F4C81] hover:underline cursor-pointer"
                      >
                        Use Direct OTP →
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        placeholder="Enter administrator password"
                        className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-500 text-slate-900 bg-white placeholder-slate-400 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#E52329] hover:bg-[#C41C22] text-white font-bold py-3 rounded-xl shadow-md shadow-red-500/20 text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>{loading ? "Authenticating..." : "Authenticate & Proceed to 2FA"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>
              ) : (
                /* OTP LOGIN FORM */
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Administrator Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="off"
                        placeholder="admin@akashtechnolabs.com"
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white placeholder-slate-400 font-medium"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {!otpSent ? (
                    <Button
                      type="button"
                      onClick={handleRequestOtp}
                      disabled={loading}
                      className="w-full bg-[#0F4C81] hover:bg-[#0C3D68] text-white font-bold py-3 rounded-xl text-xs sm:text-sm cursor-pointer shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <KeyRound className="w-4 h-4" />
                      <span>{loading ? "Sending OTP..." : "Send Verification OTP to Admin Email"}</span>
                    </Button>
                  ) : (
                    <form onSubmit={handleVerifyOtp} autoComplete="off" className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2 text-center">
                          Enter 6-Digit Admin Security Code
                        </label>
                        <div className="flex items-center justify-center gap-2">
                          {otpDigits.map((digit, idx) => (
                            <input
                              key={idx}
                              ref={(el) => {
                                otpInputRefs.current[idx] = el;
                              }}
                              type="text"
                              inputMode="numeric"
                              autoComplete="off"
                              data-lpignore="true"
                              data-1p-ignore="true"
                              data-form-type="other"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpChange(idx, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                              className={`w-10 h-12 text-center text-lg font-mono font-bold rounded-xl border transition-all ${
                                digit
                                  ? "border-red-500 bg-red-50/30 text-slate-900 shadow-2xs"
                                  : "border-slate-300 bg-white text-slate-900 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={loading || otpDigits.join("").length !== 6}
                        className="w-full bg-[#E52329] hover:bg-[#C41C22] text-white font-bold py-3 rounded-xl text-xs sm:text-sm cursor-pointer shadow-md shadow-red-500/20 disabled:opacity-50"
                      >
                        {loading ? "Verifying..." : "Verify & Enter Admin Console"}
                      </Button>

                      <div className="flex items-center justify-between text-xs text-slate-500 px-1 pt-1">
                        <span className="text-[11px]">Valid 10 mins</span>
                        <button
                          type="button"
                          onClick={handleRequestOtp}
                          disabled={resendCooldown > 0 || loading}
                          className={`font-semibold cursor-pointer ${
                            resendCooldown > 0 ? "text-slate-400" : "text-[#0F4C81] hover:underline"
                          }`}
                        >
                          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Card Footer: Return to Student Login */}
              <div className="text-center mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
                Not an administrator?{" "}
                <Link
                  href="/login"
                  className="font-bold text-[#0F4C81] hover:text-[#0C3D68] hover:underline inline-flex items-center gap-1"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Go to Student Login</span>
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
              Akash Technolabs Enterprise Administrative Gateway
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-[11px] font-semibold">
            <span className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              Secure RBAC
            </span>
            <span className="flex items-center gap-1.5 hover:text-white transition-colors">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              2FA Protected
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
