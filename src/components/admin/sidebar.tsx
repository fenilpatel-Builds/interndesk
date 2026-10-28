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
        { label: "Programs & Cohorts", href: "/admin/programs", icon: BookOpen },
      ],
    },
    {
      title: "ACTIVITIES & WORK",
      items: [
        { label: "Activities & Review", href: "/admin/activities", icon: CheckSquare },
        { label: "Daily Work Reports", href: "/admin/daily-reports", icon: FileSpreadsheet },
        { label: "Work Sessions", href: "/admin/attendance", icon: Clock },
        { label: "Project Tasks", href: "/admin/tasks", icon: CheckSquare },
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
      title: "DOCUMENTS & CREDENTIALS",
      items: [
        { label: "Official Documents", href: "/admin/documents", icon: Award },
        { label: "Verify Credentials", href: "/verify/ID-AKT-2026-0701", icon: Award },
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
      <div className="h-18 flex items-center px-4 border-b border-slate-800 bg-slate-950">
        <Link href="/admin/dashboard" className="w-full">
          <div className="bg-white px-3 py-2 rounded-xl shadow-xs border border-white/20 flex items-center justify-center hover:opacity-95 transition-opacity">
            <img
              src="/images/akash-technolabs-logo-transparent.png"
              alt="Akash Technolabs"
              className="h-8 w-auto object-contain"
            />
          </div>
        </Link>
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
