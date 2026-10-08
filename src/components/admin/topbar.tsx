import React from "react";
import { ShieldCheck } from "lucide-react";
import { GlobalSearch } from "@/components/ui/global-search";
import { NotificationCenter } from "@/components/ui/notification-center";

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
        {/* Global Search (Ctrl + K) conforming to Section 55 */}
        <GlobalSearch />

        {/* Interactive Notification Center */}
        <NotificationCenter />

        {/* Admin Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
            FP
          </div>
          <div className="hidden sm:block text-left leading-tight">
            <span className="block text-xs font-bold text-slate-900">Fenil Patel</span>
            <span className="block text-[10px] text-blue-600 font-bold">fenil8918@gmail.com</span>
          </div>
        </div>
      </div>
    </header>
  );
}
