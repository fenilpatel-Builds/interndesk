"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception to local telemetry console
    console.error("InternDesk Uncaught Error Boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in">
      <div className="max-w-md w-full bg-slate-800/80 border border-red-500/30 rounded-2xl p-8 shadow-2xl backdrop-blur-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 mb-3">
          Application Error Detected
        </span>

        <h1 className="text-2xl font-black text-white tracking-tight mb-2">
          Something went wrong
        </h1>

        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          An unexpected runtime error occurred. Your tenant data remains completely safe and isolated.
        </p>

        {error?.digest && (
          <p className="text-xs font-mono bg-slate-900/60 p-2.5 rounded-lg text-slate-500 mb-6 break-all border border-slate-700/50">
            Digest: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => reset()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-5 py-2.5"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Link href="/workspace">
            <Button
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700/60 rounded-xl px-5 py-2.5"
            >
              <Home className="w-4 h-4 mr-2" />
              Workspace
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-2 text-xs text-slate-500 font-mono">
        <ShieldAlert className="w-4 h-4 text-emerald-400" />
        <span>Multi-Tenant Boundaries Active • Data Protected</span>
      </div>
    </div>
  );
}
