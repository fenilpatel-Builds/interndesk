"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert, LogOut, Home, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { INSTITUTE_CONFIG } from "@/lib/institute/config";
import { parseClientSessionCookie, ClientSession } from "@/lib/auth/client-session";
import { signOutUser } from "@/lib/auth/actions";

export default function UnauthorizedPage() {
  const router = useRouter();
  const [session, setSession] = useState<ClientSession | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const s = parseClientSessionCookie();
    if (s) setSession(s);
  }, []);

  const handleSwitchAccount = async () => {
    setIsSigningOut(true);
    try {
      await signOutUser();
    } catch {
      // Ignored
    }
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#080d1a] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10 text-center">
        <div className="flex justify-center mb-3">
          <AnimatedLogo size="lg" />
        </div>

        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-2xl p-8 shadow-2xl space-y-5">
          <div className="w-20 h-20 rounded-full bg-red-950/60 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold tracking-widest uppercase text-red-400 bg-red-950/60 border border-red-800/60 px-3 py-1 rounded-full">
              403 • Access Forbidden
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Restricted Institute Area
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
              You do not have administrative clearance to access this department or console in {INSTITUTE_CONFIG.name}. Your role does not grant permission for this operation.
            </p>
          </div>

          {session && (
            <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/80 text-left text-xs space-y-1">
              <div className="flex items-center gap-2 text-slate-300">
                <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="font-semibold text-white truncate">{session.name || "Student User"}</span>
                <span className="text-[10px] bg-blue-900/60 text-blue-300 border border-blue-700/50 px-2 py-0.5 rounded-full font-bold ml-auto uppercase">
                  {session.role}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate pl-5">{session.email}</p>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link href="/student/dashboard" className="flex-1">
              <Button
                size="lg"
                className="w-full bg-[#E52329] hover:bg-[#C41C22] text-white font-bold rounded-xl shadow-lg shadow-red-950/50 cursor-pointer text-xs sm:text-sm"
              >
                <Home className="w-4 h-4 mr-1.5" />
                Student Portal
              </Button>
            </Link>
            <button
              type="button"
              onClick={handleSwitchAccount}
              disabled={isSigningOut}
              className="flex-1 min-h-[48px] px-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs sm:text-sm shadow-md"
            >
              <LogOut className="w-4 h-4 mr-1" />
              <span>{isSigningOut ? "Signing out..." : "Switch Account"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
