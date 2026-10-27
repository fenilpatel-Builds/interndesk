"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck } from "lucide-react";
import { GlobalSearch } from "@/components/ui/global-search";
import { NotificationCenter } from "@/components/ui/notification-center";
import { parseClientSessionCookie } from "@/lib/auth/client-session";

export function AdminTopbar({ title }: { title: string }) {
  const [userName, setUserName] = useState("Administrator");
  const [userEmail, setUserEmail] = useState("admin@interndesk.io");
  const [userRole, setUserRole] = useState("ADMIN");

  useEffect(() => {
    const session = parseClientSessionCookie();
    if (session) {
      if (session.name) setUserName(session.name);
      if (session.email) setUserEmail(session.email);
      if (session.role) setUserRole(session.role);
    }
  }, []);

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "AD";

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h1>
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
          <span>Akash Technolabs Admin</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Global Search (Ctrl + K) */}
        <GlobalSearch />

        {/* Interactive Notification Center */}
        <NotificationCenter />

        {/* Admin Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shadow-2xs">
            {initials}
          </div>
          <div className="hidden sm:block text-left leading-tight max-w-[140px] truncate">
            <span className="block text-xs font-bold text-slate-900 truncate">{userName}</span>
            <span className="block text-[10px] text-blue-600 font-bold truncate">
              {userRole.replace("_", " ")}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
