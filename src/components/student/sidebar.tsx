"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  FileCheck,
  TrendingUp,
  Clock,
  CheckSquare,
  Bell,
  FileText,
  PieChart,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOutUser } from "@/lib/auth/actions";

export function StudentSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    { label: "Activities", href: "/student/activities", icon: Layers },
    { label: "Submissions", href: "/student/submissions", icon: FileCheck },
    { label: "My Progress", href: "/student/progress", icon: TrendingUp },
    { label: "Attendance", href: "/student/attendance", icon: Clock },
    { label: "Tasks", href: "/student/tasks", icon: CheckSquare, badge: "3" },
    { label: "Notifications", href: "/student/notifications", icon: Bell },
    { label: "Documents", href: "/student/documents", icon: FileText },
    { label: "Reports", href: "/student/reports", icon: PieChart },
    { label: "Settings", href: "/student/settings", icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOutUser();
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-[#0B192C] text-slate-300 flex flex-col shrink-0 border-r border-slate-800/80 select-none relative overflow-hidden">
      {/* Decorative red curve accent at the bottom matching reference mockup */}
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-gradient-to-tr from-[#E52329]/30 to-transparent rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-tl from-[#00A8E8]/20 to-transparent rounded-full blur-xl pointer-events-none" />

      {/* Brand Header */}
      <div className="h-18 flex items-center px-5 gap-3 border-b border-slate-800/80 bg-[#07111E]">
        <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-sm border border-slate-700">
          <img
            src="/images/akash-at-watermark-hd.png"
            alt="Akash Technolabs"
            className="w-7 h-7 object-contain"
          />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center leading-tight">
            <span className="text-sm font-black text-[#E52329] tracking-tight">Akash®</span>
            <span className="text-sm font-black text-white ml-1 tracking-tight truncate">Technolabs</span>
          </div>
          <span className="text-[9px] uppercase font-bold text-sky-400 tracking-wider">
            STUDENT PORTAL
          </span>
        </div>
      </div>

      {/* Navigation List matching Image 1 Top-Right */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1 relative z-10">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/student/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150",
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-500/25"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : "text-slate-400")} />
                <span className="tracking-tight">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    "text-[10px] font-black px-1.5 py-0.2 rounded-full",
                    isActive
                      ? "bg-white text-blue-700"
                      : "bg-[#E52329] text-white"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* User Session Footer & Sign Out */}
      <div className="p-3.5 border-t border-slate-800/80 bg-[#07111E]/80 relative z-10">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
