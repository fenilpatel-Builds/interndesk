"use client";

import React from "react";
import {
  LayoutDashboard,
  Users,
  FolderTree,
  Sparkles,
  CheckSquare,
  Clock,
  FileSpreadsheet,
  BookOpen,
  Award,
  BellRing,
  BarChart3,
  Settings,
  ShieldAlert,
  CalendarCheck,
  GraduationCap,
} from "lucide-react";
import { MemberRole } from "@/types/multitenant";
import { hasPermission } from "@/lib/multitenant/permissions";

interface WorkspaceSidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  userRole: MemberRole;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function WorkspaceSidebar({
  activeTab,
  onSelectTab,
  userRole,
  isMobileOpen,
  onCloseMobile,
}: WorkspaceSidebarProps) {
  const navSections = [
    {
      label: "WORKSPACE CORE",
      items: [
        { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" />, visible: true },
        { id: "members", label: "Members Directory", icon: <Users className="w-4 h-4" />, visible: hasPermission(userRole, "members.view") },
        { id: "structure", label: "Departments & Teams", icon: <FolderTree className="w-4 h-4" />, visible: hasPermission(userRole, "members.view") },
        { id: "programs", label: "Programs & Cohorts", icon: <Sparkles className="w-4 h-4" />, visible: true },
      ],
    },
    {
      label: "OPERATIONS & WORK",
      items: [
        { id: "tasks", label: "Task Board", icon: <CheckSquare className="w-4 h-4" />, visible: true },
        { id: "attendance", label: "Attendance & Timer", icon: <Clock className="w-4 h-4" />, visible: true },
        { id: "leaves", label: "Leave Management", icon: <CalendarCheck className="w-4 h-4" />, visible: true },
        { id: "reports", label: "Daily Work Reports", icon: <FileSpreadsheet className="w-4 h-4" />, visible: true },
      ],
    },
    {
      label: "LEARNING & CREDENTIALS",
      items: [
        { id: "learning", label: "Learning Center (LMS)", icon: <BookOpen className="w-4 h-4" />, visible: true },
        { id: "assessments", label: "Assessments & MCQs", icon: <Sparkles className="w-4 h-4" />, visible: true },
        { id: "mentorship", label: "Mentorship & Reviews", icon: <GraduationCap className="w-4 h-4" />, visible: true },
        { id: "documents", label: "Documents & Certificates", icon: <Award className="w-4 h-4" />, visible: true },
      ],
    },
    {
      label: "MANAGEMENT & AUDIT",
      items: [
        { id: "announcements", label: "Announcements", icon: <BellRing className="w-4 h-4" />, visible: true },
        { id: "analytics", label: "Analytics & Reports", icon: <BarChart3 className="w-4 h-4" />, visible: hasPermission(userRole, "analytics.view") },
        { id: "settings", label: "Organization Settings", icon: <Settings className="w-4 h-4" />, visible: hasPermission(userRole, "settings.manage") },
      ],
    },
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between py-4 px-3 bg-white border-r border-slate-200/90 w-64 overflow-y-auto">
      <div className="space-y-6">
        {navSections.map((sec, idx) => {
          const visibleItems = sec.items.filter((item) => item.visible);
          if (visibleItems.length === 0) return null;

          return (
            <div key={idx} className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {sec.label}
              </p>
              <div className="space-y-0.5 pt-1">
                {visibleItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        onCloseMobile();
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-blue-600 text-white shadow-xs shadow-blue-500/20"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <span className={isActive ? "text-white" : "text-slate-400"}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Tenant Isolation Badge */}
      <div className="pt-4 border-t border-slate-100 px-3">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[10px] text-slate-500 space-y-1">
          <p className="font-bold text-slate-700 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Isolated Tenant Scope
          </p>
          <p className="leading-tight font-mono text-[9px]">
            Server-enforced row isolation active.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block shrink-0 h-[calc(100vh-4rem)] sticky top-16">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="relative z-50 w-64 h-full bg-white shadow-xl animate-slideRight">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
