"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  UserCheck,
  Clock,
  FileSpreadsheet,
  CheckSquare,
  BookOpen,
  Award,
  CreditCard,
  BarChart3,
  History,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOutUser } from "@/lib/auth/actions";

export function AdminSidebar() {
  const pathname = usePathname();

  const navSections = [
    {
      title: "OVERVIEW",
      items: [
        { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      title: "STUDENTS & PROGRAMS",
      items: [
        { label: "Registrations", href: "/admin/registrations", icon: UserCheck },
        { label: "All Students", href: "/admin/students", icon: Users },
        { label: "Programs & Fees", href: "/admin/programs", icon: BookOpen },
      ],
    },
    {
      title: "ATTENDANCE & WORK",
      items: [
        { label: "Work Sessions", href: "/admin/attendance", icon: Clock },
        { label: "Daily Reports", href: "/admin/daily-reports", icon: FileSpreadsheet },
        { label: "Tasks", href: "/admin/tasks", icon: CheckSquare },
      ],
    },
    {
      title: "LEARNING & EXAMS",
      items: [
        { label: "Subjects & Materials", href: "/admin/learning", icon: BookOpen },
        { label: "Assessments & MCQs", href: "/admin/assessments", icon: Award },
      ],
    },
    {
      title: "DOCUMENTS & FINANCE",
      items: [
        { label: "Official Documents", href: "/admin/documents", icon: Award },
        { label: "Payments & Receipts", href: "/admin/finance", icon: CreditCard },
      ],
    },
    {
      title: "ANALYTICS & SYSTEM",
      items: [
        { label: "Reports", href: "/admin/reports", icon: BarChart3 },
        { label: "Audit Logs", href: "/admin/audit-logs", icon: History },
        { label: "Settings", href: "/admin/settings", icon: Settings },
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
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold text-white tracking-tight">InternDesk</span>
          <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
            ADMIN CONSOLE
          </span>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {navSections.map((sec, i) => (
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

      {/* Admin Sign Out */}
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
