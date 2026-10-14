import React from "react";
import { Building2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
          <Building2 className="w-8 h-8 animate-pulse-subtle" />
          <div className="absolute inset-0 rounded-2xl border-2 border-blue-500/40 border-t-blue-400 animate-spin" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-base font-bold text-white tracking-wide">
            Loading InternDesk Workspace
          </h2>
          <p className="text-xs text-slate-400">
            Establishing secure multi-tenant session...
          </p>
        </div>

        {/* Skeleton cards */}
        <div className="w-64 max-w-xs space-y-2.5 mt-4">
          <div className="h-3 w-full bg-slate-800 rounded-md animate-shimmer" />
          <div className="h-3 w-4/5 mx-auto bg-slate-800 rounded-md animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
