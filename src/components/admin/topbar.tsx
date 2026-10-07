"use client";

import React from "react";
import { Bell, ShieldCheck, Search } from "lucide-react";

export function AdminTopbar({ title }: { title: string }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h1>
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>System Healthy</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Quick Search */}
        <div className="relative hidden sm:block">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search students, order ID..."
            className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs w-56 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100"
          />
        </div>

        {/* Notifications */}
        <button
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 relative"
          aria-label="View notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-1.5 right-1.5 ring-2 ring-white" />
        </button>

        {/* Admin Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
            AD
          </div>
          <div className="hidden sm:block text-left leading-tight">
            <span className="block text-xs font-bold text-slate-900">Administrator</span>
            <span className="block text-[10px] text-slate-500 font-medium">admin@interndesk.local</span>
          </div>
        </div>
      </div>
    </header>
  );
}
