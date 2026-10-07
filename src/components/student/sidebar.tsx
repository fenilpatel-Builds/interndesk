"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  Clock,
  FileSpreadsheet,
  CheckSquare,
  BookOpen,
  Award,
  FileText,
  CreditCard,
  User,
  Shield,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOutUser } from "@/lib/auth/actions";

export function StudentSidebar() {
  const pathname = usePathname();

  const sections = [
    {
      title: "OVERVIEW",
      items: [
        { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      title: "WORK",
      items: [
        { label: "Attendance & Sessions", href: "/student/attendance", icon: Clock },
        { label: "Daily Reports", href: "/student/daily-reports", icon: FileSpreadsheet },
        { label: "Tasks", href: "/student/tasks", icon: CheckSquare },
      ],
    },
    {
      title: "LEARNING",
      items: [
        { label: "Learning Center", href: "/student/learning", icon: BookOpen },
        { label: "Assessments", href: "/student/assessments", icon: Award },
      ],
    },
    {
      title: "DOCUMENTS",
      items: [
        { label: "Offer & Certificates", href: "/student/documents", icon: FileText },
      ],
    },
    {
      title: "ACCOUNT",
      items: [
        { label: "Payments & Receipts", href: "/student/payments", icon: CreditCard },
        { label: "My Profile", href: "/student/profile", icon: User },
        { label: "Account & Devices", href: "/student/security", icon: Shield },
      ],
    },
  ];

  const router = useRouter();

  const handleSignOut = async () => {
    await signOutUser();
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800 bg-slate-950">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold shadow-sm">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold text-white tracking-tight">InternDesk</span>
          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
            STUDENT PORTAL
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {sections.map((sec, i) => (
          <div key={i} className="space-y-1.5">
            <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {sec.title}
            </h4>
            <div className="space-y-0.5">
              {sec.items.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all",
                      isActive
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Actions */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
