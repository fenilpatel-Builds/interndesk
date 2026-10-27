"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, CheckCircle2, AlertCircle, RefreshCw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { sendEmailOtp, verifyEmailOtp } from "@/lib/auth/actions";
import { INSTITUTE_CONFIG } from "@/lib/institute/config";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [otpCode, setOtpCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSendCode = async () => {
    if (!email || !email.includes("@")) {
      setMessage({ text: "Please provide a valid institute email address.", type: "error" });
      return;
    }
    setIsResending(true);
    setMessage(null);
    try {
      const res = await sendEmailOtp(email.toLowerCase().trim());
      if (res.success) {
        setResendCooldown(30);
        setMessage({ text: res.message, type: "success" });
      } else {
        setMessage({ text: res.message || "Failed to dispatch verification code.", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error sending code. Please try again.", type: "error" });
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setMessage({ text: "Please enter your email address.", type: "error" });
      return;
    }
    const cleanOtp = otpCode.trim();
    if (!cleanOtp || cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      setMessage({ text: "Please enter the complete 6-digit numeric verification code.", type: "error" });
      return;
    }

    setIsVerifying(true);
    setMessage(null);
    try {
      const res = await verifyEmailOtp(email.toLowerCase().trim(), cleanOtp);
      if (res.success) {
        setIsSuccess(true);
        setMessage({ text: "Email address verified successfully!", type: "success" });
        setTimeout(() => {
          window.location.href = res.redirectTo || "/student/dashboard";
        }, 1200);
      } else {
        setMessage({ text: res.message || "Invalid or expired verification code.", type: "error" });
      }
    } catch {
      setMessage({ text: "Verification failed. Please retry.", type: "error" });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080d1a] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <AnimatedLogo size="lg" />
          </div>
          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-red-400 bg-red-950/60 border border-red-800/60 px-3 py-1 rounded-full">
              {INSTITUTE_CONFIG.name} • Email Verification
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight mt-2.5">
              Verify Your Email Address
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Confirm your identity to access institute activities, submit project assignments, and receive feedback.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
          {isSuccess ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-inner animate-pulse">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-white">Email Verified!</h2>
              <p className="text-xs text-slate-400">
                Your email has been confirmed. Redirecting to your dashboard...
              </p>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Institute Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@akashtechnolabs.com"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">6-Digit Verification Code</label>
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={resendCooldown > 0 || isResending}
                    className="text-[11px] font-semibold text-red-400 hover:text-red-300 inline-flex items-center gap-1 disabled:text-slate-600 transition"
                  >
                    <RefreshCw className={`w-3 h-3 ${isResending ? "animate-spin" : ""}`} />
                    {isResending ? "Sending..." : resendCooldown > 0 ? `Resend (${resendCooldown}s)` : "Get Code"}
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-center text-2xl font-mono tracking-widest py-3 border border-slate-700 bg-slate-950/80 text-white rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none"
                />
              </div>



              {message && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    message.type === "success"
                      ? "bg-emerald-950/40 border border-emerald-800/60 text-emerald-300"
                      : "bg-red-950/40 border border-red-800/60 text-red-300"
                  }`}
                >
                  {message.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  )}
                  <span>{message.text}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={otpCode.length !== 6 || isVerifying}
                isLoading={isVerifying}
                size="lg"
                className="w-full bg-[#d32f2f] hover:bg-[#b71c1c] text-white font-bold rounded-xl shadow-lg shadow-red-950/50"
              >
                Verify &amp; Enter Portal
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>
          )}

          <div className="pt-2 text-center border-t border-slate-800/80">
            <Link href="/login" className="text-xs font-semibold text-slate-400 hover:text-red-400 transition">
              ← Return to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
