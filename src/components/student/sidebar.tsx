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
  FileSpreadsheet,
  BookOpen,
  Award,
  Calendar,
  GraduationCap,
  FileText,
  PieChart,
  Bell,
  Settings,
  Shield,
  LifeBuoy,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOutUser } from "@/lib/auth/actions";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function StudentSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const navSections: NavSection[] = [
    {
      title: "CORE ACTIVITIES",
      items: [
        { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
        { label: "Activities & Tasks", href: "/student/activities", icon: Layers },
        { label: "Submissions", href: "/student/submissions", icon: FileCheck },
        { label: "My Progress", href: "/student/progress", icon: TrendingUp },
        { label: "Attendance & Clock", href: "/student/attendance", icon: Clock },
        { label: "Project Tasks", href: "/student/tasks", icon: CheckSquare },
        { label: "Daily Work Reports", href: "/student/daily-reports", icon: FileSpreadsheet },
      ],
    },
    {
      title: "ACADEMICS & LEARNING",
      items: [
        { label: "Learning Center", href: "/student/learning", icon: BookOpen },
        { label: "Assessments & Tests", href: "/student/assessments", icon: Award },
        { label: "Academic Calendar", href: "/student/calendar", icon: Calendar },
        { label: "Browse Programs", href: "/student/programs", icon: GraduationCap },
      ],
    },
    {
      title: "REPORTS & DOCUMENTS",
      items: [
        { label: "Reports & Analytics", href: "/student/reports", icon: PieChart },
        { label: "Offer & Certificates", href: "/student/documents", icon: FileText },
        { label: "Notifications", href: "/student/notifications", icon: Bell },
      ],
    },
    {
      title: "ACCOUNT & SUPPORT",
      items: [
        { label: "Profile & Settings", href: "/student/settings", icon: Settings },
        { label: "Security & Devices", href: "/student/security", icon: Shield },
        { label: "Help & Support", href: "/student/support", icon: LifeBuoy },
      ],
    },
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
      <div className="h-18 flex items-center px-4 border-b border-slate-800/80 bg-[#07111E]">
        <Link href="/student/dashboard" className="w-full">
          <div className="bg-white px-3 py-2 rounded-xl shadow-xs border border-white/20 flex items-center justify-center hover:opacity-95 transition-opacity">
            <img
              src="/images/akash-technolabs-logo-transparent.png"
              alt="Akash Technolabs"
              className="h-8 w-auto object-contain"
            />
          </div>
        </Link>
      </div>

      {/* Navigation Sections with all functions kept */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5 relative z-10 custom-scrollbar">
        {navSections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 px-3 block mb-1">
              {sec.title}
            </span>

            {sec.items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/student/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150",
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-500/25"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  )}
                >
                  <div className="flex items-center gap-2.5">
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
        ))}
      </div>

      {/* User Session Footer & Sign Out */}
      <div className="p-3 border-t border-slate-800/80 bg-[#07111E]/90 relative z-10">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer group"
        >
          <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-400 transition-colors shrink-0" />
          <span className="tracking-tight">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
