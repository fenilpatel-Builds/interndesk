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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { loginWithPassword, sendEmailOtp, verifyEmailOtp } from "@/lib/auth/actions";
import { isUserAdmin } from "@/lib/auth/admin-whitelist";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("fenil8160@gmail.com");
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

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleAdminPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!isUserAdmin(cleanEmail)) {
      setErrorMessage(
        "Access Denied: This administrative portal is restricted exclusively to authorized administrators (fenil8160@gmail.com). Please use the student portal for intern logins."
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
        "Access Denied: OTP codes can only be requested for verified administrators (fenil8160@gmail.com)."
      );
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await sendEmailOtp(cleanEmail);
      if (res.success) {
        setOtpSent(true);
        if (res.forwardedTo) setForwardedTo(res.forwardedTo);
        setSuccessMessage(res.message || `Admin verification code dispatched to ${cleanEmail}`);
        setResendCooldown(30);
        setOtpDigits(["", "", "", "", "", ""]);
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 150);
      } else {
        setErrorMessage(res.error || res.message || "Failed to dispatch admin verification OTP.");
      }
    } catch {
      setErrorMessage("Network error during admin OTP dispatch.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpDigitChange = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, "");
    if (!cleanVal) {
      const newDigits = [...otpDigits];
      newDigits[index] = "";
      setOtpDigits(newDigits);
      return;
    }

    if (cleanVal.length > 1) {
      const digitsArr = cleanVal.slice(0, 6).split("");
      const newDigits = [...otpDigits];
      digitsArr.forEach((d, i) => {
        if (index + i < 6) newDigits[index + i] = d;
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
        router.push("/admin/dashboard");
      } else {
        setErrorMessage(res.error || res.message || "Invalid or expired admin verification code.");
      }
    } catch {
      setErrorMessage("An unexpected verification error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060b14] flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden text-slate-100">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#E52329]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#0F4C81]/25 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Strip */}
      <header className="max-w-7xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-800/80 z-10">
        <AnimatedLogo size="md" />
        <Link
          href="/login"
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <GraduationCap className="w-4 h-4 text-blue-400" />
          <span>Student / Intern Portal →</span>
        </Link>
      </header>

      {/* Center Auth Card */}
      <div className="w-full max-w-md mx-auto my-auto relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/40 text-[11px] font-bold text-red-400 uppercase tracking-widest">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Administrator Console Gate</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Akash Technolabs Admin
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Authorized administration, offer letter generation, and academic governance
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 space-y-5">
          {/* Security Banner */}
          <div className="p-3 rounded-2xl bg-blue-950/50 border border-blue-800/50 flex items-start gap-2.5 text-xs text-blue-200">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">2-Factor Authentication Required</p>
              <p className="text-[11px] text-blue-300/80 mt-0.5">
                Restricted to whitelisted administrators (fenil8160@gmail.com).
              </p>
            </div>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-red-950/70 border border-red-800 text-xs font-semibold text-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="p-3 rounded-2xl bg-emerald-950/70 border border-emerald-800 text-xs font-semibold text-emerald-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Password Mode Form */}
          {authMode === "PASSWORD" ? (
            <form onSubmit={handleAdminPasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Administrator Email *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="fenil8160@gmail.com"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-700 bg-slate-800/90 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-red-500 font-medium"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Administrator Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("OTP");
                      handleRequestOtp();
                    }}
                    className="text-[11px] font-bold text-blue-400 hover:text-blue-300 cursor-pointer"
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
                    placeholder="Enter administrator password"
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-700 bg-slate-800/90 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-red-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#E52329] hover:bg-[#C41C22] text-white font-bold py-3 rounded-xl shadow-lg shadow-red-950/60 text-xs sm:text-sm cursor-pointer transition-transform hover:scale-[1.01]"
              >
                {loading ? "Authenticating Admin..." : "Authenticate & Proceed to 2FA →"}
              </Button>
            </form>
          ) : (
            /* 6-Digit 2FA OTP Mode Form */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-300">
                    Admin 2FA Verification Code
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("PASSWORD");
                      setErrorMessage(null);
                    }}
                    className="text-[11px] font-bold text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    ← Password Mode
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  Enter the 6-digit cryptographic security code dispatched to <strong className="text-white">{email}</strong>.
                </p>

                {forwardedTo && (
                  <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-amber-300 mb-3 font-mono">
                    {forwardedTo}
                  </div>
                )}

                {/* 6 Individual Code Boxes */}
                <div className="flex items-center justify-between gap-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-11 sm:w-12 h-12 sm:h-14 text-center text-lg sm:text-xl font-mono font-black rounded-xl border border-slate-700 bg-slate-800/90 text-white focus:outline-hidden focus:ring-2 focus:ring-red-500 shadow-inner"
                    />
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#E52329] hover:bg-[#C41C22] text-white font-bold py-3 rounded-xl shadow-lg shadow-red-950/60 text-xs sm:text-sm cursor-pointer"
              >
                {loading ? "Verifying..." : "Verify OTP & Enter Console"}
              </Button>

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-slate-400">Didn&apos;t receive code?</span>
                <button
                  type="button"
                  disabled={resendCooldown > 0 || loading}
                  onClick={handleRequestOtp}
                  className="font-bold text-blue-400 hover:text-blue-300 disabled:opacity-50 cursor-pointer"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                </button>
              </div>
            </form>
          )}

          <div className="pt-2 text-center border-t border-slate-800">
            <Link
              href="/login"
              className="text-xs text-slate-400 hover:text-white font-medium inline-flex items-center gap-1 transition-colors"
            >
              <span>Not an administrator?</span>
              <span className="text-blue-400 font-bold underline">Go to Student Login</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-[11px] text-slate-500 max-w-7xl mx-auto w-full pt-6 border-t border-slate-800/80">
        © 2026 Akash Technolabs Private Limited. Dedicated Administrative Console. All rights reserved.
      </footer>
    </div>
  );
}
