"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Mail, KeyRound, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { sendEmailOtp, verifyEmailOtp } from "@/lib/auth/actions";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"EMAIL" | "OTP">("EMAIL");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage("Failed to send OTP code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!otp || otp.trim().length < 6) {
      setErrorMessage("Please enter the 6-digit OTP code sent to your email.");
      return;
    }

    setIsLoading(true);
    try {
      // Collect device metadata for session tracking
      const deviceInfo = {
        deviceLabel: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 80) : "Browser",
        browser: "Web Browser",
        os: typeof navigator !== "undefined" ? navigator.platform : "Desktop",
        ipHash: "session-client",
      };

      const res = await verifyEmailOtp(email.toLowerCase().trim(), otp.trim(), deviceInfo);
      if (res.success && res.redirectTo) {
        setSuccessMessage(res.message);
        router.push(res.redirectTo);
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
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 relative">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Brand Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="text-left">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              InternDesk
            </span>
            <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-500">
              Learn • Work • Grow
            </span>
          </div>
        </Link>
      </div>

      <Card className="w-full max-w-md shadow-lg border-slate-200/90 rounded-2xl bg-white">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl font-bold text-slate-900">
            {step === "EMAIL" ? "Sign in to your account" : "Enter Verification Code"}
          </CardTitle>
          <CardDescription>
            {step === "EMAIL"
              ? "Access your internship dashboard or administration console via secure Email OTP."
              : `We sent a 6-digit code to ${email}`}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          {errorMessage && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {step === "EMAIL" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="intern@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                helperText="We'll send a one-time passcode to this email."
              />

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 font-semibold"
                size="lg"
                isLoading={isLoading}
              >
                Send One-Time Code
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <Input
                label="6-Digit Verification Code"
                type="text"
                placeholder="123456"
                maxLength={8}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                disabled={isLoading}
                helperText="Check your spam/junk folder if you don't see it in 1 minute."
              />

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 font-semibold"
                size="lg"
                isLoading={isLoading}
              >
                Verify & Continue
                <KeyRound className="w-4 h-4 ml-1.5" />
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep("EMAIL");
                    setOtp("");
                    setErrorMessage("");
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  ← Use a different email
                </button>
              </div>
            </form>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>New candidate?</span>
            <Link
              href="/register"
              className="font-semibold text-blue-600 hover:text-blue-800"
            >
              Register for Internship →
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Trust banner */}
      <div className="mt-8 flex items-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>Secured by Supabase Auth with Row Level Security</span>
      </div>
    </div>
  );
}
