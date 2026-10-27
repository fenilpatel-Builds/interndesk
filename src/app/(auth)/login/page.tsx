"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { loginWithPassword, sendEmailOtp, verifyEmailOtp } from "@/lib/auth/actions";

export default function LoginPage() {
  const router = useRouter();

  // Role tab state: Student, Faculty, Admin matching Image 1
  const [selectedRole, setSelectedRole] = useState<"Student" | "Faculty" | "Admin">("Student");
  const [email, setEmail] = useState("priya.sharma@akashtechnolabs.com");
  const [password, setPassword] = useState("Priya@2026");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Email OTP Login Mode
  const [authMode, setAuthMode] = useState<"PASSWORD" | "OTP">("PASSWORD");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [sandboxOtp, setSandboxOtp] = useState<string | null>(null);
  const [otpSuccessMessage, setOtpSuccessMessage] = useState<string | null>(null);

  // Watch Demo Modal
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  // Quick preset account selection
  const handleRoleSelect = (role: "Student" | "Faculty" | "Admin") => {
    setSelectedRole(role);
    setErrorMessage(null);
    if (role === "Student") {
      setEmail("priya.sharma@akashtechnolabs.com");
      setPassword("Priya@2026");
    } else if (role === "Faculty") {
      setEmail("akash@akashtechnolabs.com");
      setPassword("Akash@2026");
    } else {
      setEmail("akash@akashtechnolabs.com");
      setPassword("Akash@2026");
    }
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
        if (res.sandboxOtp || res.otpPreview) {
          const code = res.sandboxOtp || res.otpPreview || "";
          setSandboxOtp(code);
          setOtpCode(code);
        }
        setOtpSuccessMessage(res.message || `Verification OTP sent to ${email}`);
      } else {
        setErrorMessage(res.error || res.message || "Failed to dispatch email verification code.");
      }
    } catch {
      setErrorMessage("Network error while transmitting OTP. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setErrorMessage("Please enter the 6-digit OTP code.");
      return;
    }
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await verifyEmailOtp(email.trim().toLowerCase(), otpCode.trim());
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
      {/* Top Header matching Image 1 */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
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
                  className="bg-[#E52329] hover:bg-[#C41C22] text-white font-bold px-5 py-2 rounded-xl shadow-xs transition-transform hover:scale-[1.02] cursor-pointer"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container matching Image 1 Top Left */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Hero Copy, 4 Pills, CTAs & Vector Illustration */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-xs font-black tracking-widest text-sky-600 uppercase shadow-2xs">
              <span>LEARN • GROW • ACHIEVE</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-black text-slate-900 tracking-tight leading-[1.15]">
              Institute Activity <br />
              <span className="text-[#E52329]">Management System</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl font-normal">
              Empowering students, faculty and administrators with a smart, secure and seamless platform for activities, submissions, learning and progress.
            </p>

            {/* 4 Feature Value Pills matching Image 1 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5">
                  <Lock className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 leading-tight">
                  Secure Authentication
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-1.5">
                  <Bell className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 leading-tight">
                  Real-time Notifications
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 leading-tight">
                  Easy Submissions
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-1.5">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 leading-tight">
                  Progress Tracking
                </span>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-2">
              <Link href="/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-[#E52329] hover:bg-[#C41C22] text-white font-bold px-7 py-6 rounded-xl shadow-md shadow-red-500/20 text-sm flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] cursor-pointer"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <button
                type="button"
                onClick={() => setDemoModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-red-100 text-[#E52329] flex items-center justify-center">
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </div>
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Student Illustration */}
            <div className="relative pt-4 flex justify-center lg:justify-start">
              <div className="relative max-w-md w-full">
                <img
                  src="/images/student-hero-illustration.png"
                  alt="Akash Technolabs Student Management"
                  className="w-full h-auto object-contain drop-shadow-lg"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Exact "Welcome Back!" Login Card matching Image 1 */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/60 p-6 sm:p-8 relative">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Welcome Back!
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Sign in to your account to continue
                </p>
              </div>

              {/* Role Switcher Tabs (Student, Faculty, Admin) */}
              <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
                {(["Student", "Faculty", "Admin"] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleSelect(role)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
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
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}
              {otpSuccessMessage && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{otpSuccessMessage}</span>
                </div>
              )}

              {/* Password Login Form */}
              {authMode === "PASSWORD" ? (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
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
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 bg-white placeholder-slate-400"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">
                        Password
                      </label>
                      <Link
                        href="/forgot-password"
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
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
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 bg-white placeholder-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 text-xs text-slate-600 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 text-[#E52329] rounded border-slate-300 focus:ring-red-500"
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
                    className="w-full bg-[#E52329] hover:bg-[#C41C22] text-white font-bold py-3 rounded-xl shadow-md shadow-red-500/20 text-sm transition-all cursor-pointer"
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              ) : (
                /* OTP Login Form */
                <div className="space-y-4">
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
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {!otpSent ? (
                    <Button
                      type="button"
                      onClick={handleRequestOtp}
                      disabled={loading}
                      className="w-full bg-[#0F4C81] hover:bg-[#0B355A] text-white font-bold py-3 rounded-xl text-sm cursor-pointer"
                    >
                      {loading ? "Sending OTP..." : "Send Verification OTP to Email"}
                    </Button>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-slate-700">
                            6-Digit Security OTP
                          </label>
                          {sandboxOtp && (
                            <button
                              type="button"
                              onClick={() => setOtpCode(sandboxOtp)}
                              className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition-colors cursor-pointer"
                              title="Click to auto-fill sandbox OTP"
                            >
                              Sandbox Code: {sandboxOtp} (click to fill)
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                          placeholder="123456"
                          required
                          className="w-full tracking-widest text-center text-lg font-mono font-bold py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#E52329] hover:bg-[#C41C22] text-white font-bold py-3 rounded-xl text-sm cursor-pointer"
                      >
                        {loading ? "Verifying..." : "Verify & Sign In"}
                      </Button>

                      <div className="text-center">
                        <button
                          type="button"
                          onClick={handleRequestOtp}
                          disabled={loading}
                          className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                        >
                          Resend Verification Code
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
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-slate-400 font-medium">
                    or continue with
                  </span>
                </div>
              </div>

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={() => {
                  setEmail("priya.sharma@akashtechnolabs.com");
                  setPassword("Priya@2026");
                  handlePasswordLogin({ preventDefault: () => {} } as React.FormEvent);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
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

              {/* Instant Persona Quick Login Drawer */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2 text-center">
                  Quick Testing Accounts (Click to Fill)
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole("Student");
                      setEmail("priya.sharma@akashtechnolabs.com");
                      setPassword("Priya@2026");
                    }}
                    className="p-1.5 rounded-lg border border-slate-200 hover:border-blue-400 bg-slate-50 text-left cursor-pointer"
                  >
                    <span className="block text-[11px] font-bold text-slate-800 truncate">Priya (IT)</span>
                    <span className="block text-[9px] text-blue-600 font-semibold">Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole("Student");
                      setEmail("fenil.patel@akashtechnolabs.com");
                      setPassword("Fenil@2026");
                    }}
                    className="p-1.5 rounded-lg border border-slate-200 hover:border-blue-400 bg-slate-50 text-left cursor-pointer"
                  >
                    <span className="block text-[11px] font-bold text-slate-800 truncate">Fenil (CSE)</span>
                    <span className="block text-[9px] text-blue-600 font-semibold">Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole("Admin");
                      setEmail("akash@akashtechnolabs.com");
                      setPassword("Akash@2026");
                    }}
                    className="p-1.5 rounded-lg border border-red-200 hover:border-red-400 bg-red-50/60 text-left cursor-pointer"
                  >
                    <span className="block text-[11px] font-bold text-slate-800 truncate">Akash P.</span>
                    <span className="block text-[9px] text-red-600 font-semibold">Admin</span>
                  </button>
                </div>
              </div>

              {/* Card Footer: Don't have an account? Register now */}
              <div className="text-center mt-5 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
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

      {/* Signature Bottom Ribbon matching Image 1 */}
      <footer className="bg-[#050914] border-t border-slate-800/90 py-4 px-4 sm:px-6 lg:px-8 select-none">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-black text-sm text-white">
              <span className="text-[#E52329]">Akash</span>
              <span>Technolabs</span>
            </div>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-400 font-medium hidden sm:inline">
              Building a smarter future through technology
            </span>
          </div>

          <div className="flex items-center gap-5 text-slate-400 text-[11px] font-semibold">
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
              className="font-mono text-slate-300 hover:text-white transition-colors"
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
                  Close &amp; Sign In
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
