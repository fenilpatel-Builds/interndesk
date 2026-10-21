import React from "react";
import Link from "next/link";
import { Home, Building2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in">
      <div className="max-w-md w-full bg-slate-800/80 border border-slate-700/80 rounded-2xl p-8 shadow-2xl backdrop-blur-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
          <Search className="w-8 h-8" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-3">
          Error 404 • Resource Not Found
        </span>

        <h1 className="text-2xl font-black text-white tracking-tight mb-2">
          Page or Workspace Not Located
        </h1>

        <p className="text-sm text-slate-400 mb-8 leading-relaxed">
          The requested path could not be found or may belong to another tenant workspace with restricted access.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/workspace">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-5 py-2.5">
              <Building2 className="w-4 h-4 mr-2" />
              Open Workspace
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700/60 rounded-xl px-5 py-2.5">
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Button>
          </Link>
        </div>
      </div>

      <p className="text-xs text-slate-500 mt-8 font-mono">
        InternDesk Enterprise Multi-Tenant Platform • Zero-Payment Guarantee
      </p>
    </div>
  );
}
