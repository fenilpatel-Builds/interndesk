"use client";

import React, { useState } from "react";
import Link from "next/link";
import { KeyRound, Mail, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { sendEmailOtp } from "@/lib/auth/actions";
import { INSTITUTE_CONFIG } from "@/lib/institute/config";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isSent, setIsSent] = useState(false);
  const [resetCodePreview, setResetCodePreview] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setMessage({ text: "Please enter a valid institute email address.", type: "error" });
      return;
    }

    setIsLoading(true);
    setMessage(null);
    try {
      const res = await sendEmailOtp(email.toLowerCase().trim());
      if (res.success) {
        setIsSent(true);
        setMessage({
          text: `Recovery instructions and verification code sent to ${email}.`,
          type: "success",
        });
        if (res.otpPreview) {
          setResetCodePreview(res.otpPreview);
        }
      } else {
        setMessage({ text: res.message || "Failed to dispatch recovery email.", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error requesting recovery. Please try again.", type: "error" });
    } finally {
      setIsLoading(false);
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
              {INSTITUTE_CONFIG.name} • Account Recovery
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight mt-2.5">
              Reset Your Password
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Enter your registered institute email to receive verification instructions and regain portal access.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
          {isSent ? (
            <div className="text-center py-3 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-white">Recovery Code Dispatched</h2>
                <p className="text-xs text-slate-400">
                  We have sent a verification code to <strong className="text-slate-200">{email}</strong>.
                </p>
              </div>

              {resetCodePreview && (
                <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-slate-200 text-left">
                  <span className="font-semibold text-red-300 block mb-1">Testing Recovery Assistant:</span>
                  <span className="text-slate-400 text-[11px]">
                    Use verification code: <strong className="font-mono text-red-400 text-sm tracking-widest">{resetCodePreview}</strong>
                  </span>
                </div>
              )}

              <Link href={`/reset-password?email=${encodeURIComponent(email)}`}>
                <Button size="lg" className="w-full bg-[#d32f2f] hover:bg-[#b71c1c] text-white font-bold rounded-xl mt-2">
                  Proceed to Reset Password
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Registered Institute Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@akashtechnolabs.com"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/80 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    required
                  />
                </div>
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
                disabled={isLoading}
                isLoading={isLoading}
                size="lg"
                className="w-full bg-[#d32f2f] hover:bg-[#b71c1c] text-white font-bold rounded-xl shadow-lg shadow-red-950/50"
              >
                <KeyRound className="w-4 h-4 mr-1.5" />
                Send Recovery Instructions
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
