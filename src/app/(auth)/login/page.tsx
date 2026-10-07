"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Mail, KeyRound, ArrowRight, ShieldCheck, CheckCircle2, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendEmailOtp, verifyEmailOtp, loginWithPassword } from "@/lib/auth/actions";

export default function LoginPage() {
  const router = useRouter();
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
      setErrorMessage("Authentication failed. Please verify your email and password.");
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
      const deviceInfo = {
        deviceLabel: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 80) : "Browser",
        browser: "Web Browser",
        os: typeof navigator !== "undefined" ? navigator.platform : "Desktop",
        ipHash: "session-client",
      };

      const res = await verifyEmailOtp(email.toLowerCase().trim(), otp.trim(), deviceInfo);
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
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/70 relative">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Main 2-Column Auth Container Matching Screen 1 */}
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left Column: Form */}
        <div className="md:col-span-7 p-8 sm:p-12 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-lg font-bold tracking-tight text-slate-900 leading-none">
                  InternDesk
                </span>
                <span className="block text-[9px] uppercase font-bold tracking-wider text-slate-400">
                  Learn • Work • Grow
                </span>
              </div>
            </Link>

            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Welcome Back!
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Login to your account to continue your internship journey.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            {authMode === "PASSWORD" ? (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="fenil@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
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
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setAuthMode("OTP")}
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    Login with OTP instead
                  </button>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                  isLoading={isLoading}
                >
                  Login
                </Button>
              </form>
            ) : (
              /* OTP Mode */
              step === "EMAIL" ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="intern@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    helperText="We'll send a 6-digit one-time code to this address."
                  />

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                    size="lg"
                    isLoading={isLoading}
                  >
                    Send OTP Code
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setAuthMode("PASSWORD")}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      ← Back to Password Login
                    </button>
                  </div>
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
                    helperText={`Check your email (${email})`}
                  />


                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                    size="lg"
                    isLoading={isLoading}
                  >
                    Verify &amp; Continue
                  </Button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setStep("EMAIL")}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                    >
                      ← Change email
                    </button>
                  </div>
                </form>
              )
            )}
          </div>

          {/* Footer note */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Don&apos;t have an account?</span>
            <Link
              href="/register"
              className="font-bold text-blue-600 hover:text-blue-800"
            >
              Register
            </Link>
          </div>
        </div>

        {/* Right Column: Blue Illustration Banner Matching Screen 1 */}
        <div className="hidden md:flex md:col-span-5 bg-gradient-to-br from-blue-50 via-indigo-50/70 to-blue-100/60 p-10 flex-col justify-between items-center text-center border-l border-slate-100">
          <div className="w-full flex justify-end">
            <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-100/80 px-2.5 py-1 rounded-full">
              SaaS Portal
            </span>
          </div>

          <div className="space-y-6 my-auto">
            {/* Visual Icon Illustration */}
            <div className="w-28 h-28 mx-auto rounded-3xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25">
              <GraduationCap className="w-16 h-16" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Learn. Work. Grow.
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                Gain real-world experience, build your skills and shape your future with InternDesk.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit SSL Encrypted Access</span>
          </div>
        </div>
      </div>
    </div>
  );
}
