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
  KeyRound,
  X,
  Shield,
  Lightbulb,
  Headphones,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { loginWithPassword, sendEmailOtp, verifyEmailOtp } from "@/lib/auth/actions";

export default function LoginPage() {
  const router = useRouter();

  // Role tab state: Student, Faculty, Admin
  const [selectedRole, setSelectedRole] = useState<"Student" | "Faculty" | "Admin">("Student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Email OTP Login Mode
  const [authMode, setAuthMode] = useState<"PASSWORD" | "OTP">("PASSWORD");
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [forwardedTo, setForwardedTo] = useState<string | null>(null);
  const [otpSuccessMessage, setOtpSuccessMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Watch Demo Modal
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  // Refs for 6-box OTP digits
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Role selection
  const handleRoleSelect = (role: "Student" | "Faculty" | "Admin") => {
    setSelectedRole(role);
    setErrorMessage(null);
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const result = await loginWithPassword(email.trim(), password);
      if (result.success) {
        if (result.role === "SUPER_ADMIN" || result.role === "ADMIN" || result.role === "FACULTY") {
          router.push("/admin/dashboard");
        } else {
          router.push("/student/dashboard");
        }
      } else {
        setErrorMessage(result.error || result.message || "Authentication failed. Please verify credentials.");
      }
    } catch {
      setErrorMessage("An unexpected error occurred during sign-in.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async () => {
    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid institute email address.");
      return;
    }
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await sendEmailOtp(email.trim().toLowerCase());
      if (res.success) {
        setOtpSent(true);
        if (res.forwardedTo) {
          setForwardedTo(res.forwardedTo);
        } else {
          setForwardedTo(null);
        }
        setOtpSuccessMessage(res.message || `Verification OTP dispatched to ${email}`);
        setResendCooldown(30);
        setOtpDigits(["", "", "", "", "", ""]);
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 100);
      } else {
        setErrorMessage(res.error || res.message || "Failed to dispatch email verification code.");
      }
    } catch {
      setErrorMessage("Network error while transmitting OTP. Check connection.");
    } finally {
      setLoading(false);
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

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpDigits.join("");
    if (fullOtp.length !== 6) {
      setErrorMessage("Please enter all 6 digits of the OTP code.");
      return;
    }
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await verifyEmailOtp(email.trim().toLowerCase(), fullOtp);
      if (res.success) {
        if (res.role === "SUPER_ADMIN" || res.role === "ADMIN" || res.role === "FACULTY") {
          router.push("/admin/dashboard");
        } else {
          router.push("/student/dashboard");
        }
      } else {
        setErrorMessage(res.error || res.message || "Invalid or expired OTP code.");
      }
    } catch {
      setErrorMessage("An unexpected error occurred during verification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-slate-50 via-white to-blue-50/40 select-none">
      {/* Top Header */}
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
              <Link href="/register">
                <Button
                  size="sm"
                  className="bg-[#E52329] hover:bg-[#C41C22] text-white font-bold px-4 py-1.5 sm:px-5 sm:py-2 rounded-xl shadow-xs transition-transform hover:scale-[1.02] cursor-pointer text-xs sm:text-sm"
                >
                  Get Started
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
          <div className="lg:col-span-7 space-y-3 sm:space-y-4 pt-1 sm:pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[11px] font-black tracking-widest text-sky-600 uppercase shadow-2xs">
              <span>LEARN • GROW • ACHIEVE</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-[2.6rem] font-black text-slate-900 tracking-tight leading-[1.15]">
              Institute Activity <br />
              <span className="text-[#E52329]">Management System</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl font-normal">
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
              <Link href="/register" className="w-full sm:w-auto">
                <Button
                  size="sm"
                  className="w-full sm:w-auto bg-[#E52329] hover:bg-[#C41C22] text-white font-bold px-5 py-2.5 rounded-xl shadow-md shadow-red-500/20 text-xs sm:text-sm flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] cursor-pointer"
                >
                  <span>Get Started Free</span>
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

          {/* Right Column: Exact "Welcome Back!" Login Card - Moved Up & Compacted */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-lg shadow-slate-200/50 p-4 sm:p-6 relative">
              <div className="text-center mb-3 sm:mb-4">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Welcome Back!
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                  Sign in to your account to continue
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

              {/* Feedback messages */}
              {errorMessage && (
                <div className="mb-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}
              {otpSuccessMessage && (
                <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{otpSuccessMessage}</span>
                </div>
              )}

              {/* Password Login Form */}
              {authMode === "PASSWORD" ? (
                <form onSubmit={handlePasswordLogin} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Institute Email
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
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">
                        Password
                      </label>
                      <Link
                        href="/forgot-password"
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        autoComplete="current-password"
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
                  </div>

                  <div className="flex items-center justify-between pt-0.5">
                    <label className="flex items-center gap-2 text-xs text-slate-600 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 text-[#E52329] rounded border-slate-300 focus:ring-red-500 cursor-pointer"
                      />
                      <span>Remember me</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("OTP");
                        setErrorMessage(null);
                      }}
                      className="text-xs font-bold text-slate-600 hover:text-blue-600 cursor-pointer"
                    >
                      Use Email OTP
                    </button>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#E52329] hover:bg-[#C41C22] text-white font-bold py-2.5 sm:py-3 rounded-xl shadow-md shadow-red-500/20 text-xs sm:text-sm transition-all cursor-pointer"
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              ) : (
                /* OTP Login Form */
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Institute Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@akashtechnolabs.com"
                        autoComplete="email"
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Informational Sandbox Banner if Resend Free Tier restriction applies */}
                  {forwardedTo && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/90 text-xs text-amber-900 flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-[11px] space-y-0.5">
                        <p className="font-bold">Resend Sandbox Mode:</p>
                        <p>
                          OTP dispatched to verified account: <strong className="font-mono">{forwardedTo}</strong>.
                        </p>
                      </div>
                    </div>
                  )}

                  {!otpSent ? (
                    <Button
                      type="button"
                      onClick={handleRequestOtp}
                      disabled={loading}
                      className="w-full bg-[#1E3264] hover:bg-[#152347] text-white font-bold py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm cursor-pointer shadow-md transition-all"
                    >
                      {loading ? "Sending OTP..." : "Send Verification OTP to Email"}
                    </Button>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2 text-center">
                          Enter 6-Digit OTP from Email
                        </label>
                        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
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
                              className={`w-9 h-11 sm:w-10 sm:h-12 text-center text-lg font-mono font-black rounded-xl border transition-all ${
                                digit
                                  ? "border-blue-600 bg-blue-50/40 text-blue-900 shadow-xs"
                                  : "border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={loading || otpDigits.join("").length !== 6}
                        className="w-full bg-[#E52329] hover:bg-[#C41C22] text-white font-bold py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm cursor-pointer shadow-md shadow-red-500/20 disabled:opacity-50"
                      >
                        {loading ? "Verifying..." : "Verify & Sign In"}
                      </Button>

                      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                        <span className="text-[11px]">Valid 10 mins</span>
                        <button
                          type="button"
                          onClick={handleRequestOtp}
                          disabled={resendCooldown > 0 || loading}
                          className={`font-semibold cursor-pointer ${
                            resendCooldown > 0
                              ? "text-slate-400"
                              : "text-blue-600 hover:underline"
                          }`}
                        >
                          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("PASSWORD");
                        setErrorMessage(null);
                      }}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      ← Back to Password Login
                    </button>
                  </div>
                </div>
              )}

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
                  setErrorMessage("Please use your registered email address with OTP or password to authenticate.");
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

              {/* Card Footer: Don't have an account? Register now */}
              <div className="text-center mt-3 pt-2 border-t border-slate-100 text-xs text-slate-500 font-medium">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-bold text-[#E52329] hover:underline"
                >
                  Register now
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
                  Close &amp; Continue
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
