"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  ChevronDown,
  Search,
  Bell,
  Copy,
  Check,
  Plus,
  Menu,
  X,
  LogOut,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { Organization, MemberRole } from "@/types/multitenant";
import { getRoleDisplayName } from "@/lib/multitenant/permissions";
import { signOutUser } from "@/lib/auth/actions";

interface WorkspaceHeaderProps {
  organizations: Organization[];
  activeOrg: Organization;
  onSelectOrg: (org: Organization) => void;
  currentUser: {
    name: string;
    email: string;
    role: MemberRole;
  };
  onSelectPersona?: (persona: { name: string; email: string; role: MemberRole }) => void;
  onOpenSearch: () => void;
  onToggleMobileNav: () => void;
  isMobileNavOpen: boolean;
}

export function WorkspaceHeader({
  organizations,
  activeOrg,
  onSelectOrg,
  currentUser,
  onOpenSearch,
  onToggleMobileNav,
  isMobileNavOpen,
}: WorkspaceHeaderProps) {
  const router = useRouter();
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const copyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(activeOrg.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSignOut = async () => {
    await signOutUser();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-slate-200/90 shadow-2xs">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Nav Toggle & Organization Switcher (Section 8) */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileNav}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
            aria-label="Toggle navigation sidebar"
          >
            {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <AnimatedLogo size="sm" href="/workspace" className="hidden sm:inline-flex mr-2" />

          {/* Organization Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setOrgDropdownOpen(!orgDropdownOpen); setUserMenuOpen(false); }}
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                {activeOrg.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 max-w-[130px] truncate block">
                    {activeOrg.name}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-700">
                    {activeOrg.code}
                  </span>
                </div>
                <span className="text-[10px] font-medium text-slate-500 block">
                  {activeOrg.type}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
            </button>

            {/* Switcher Dropdown Menu */}
            {orgDropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-fadeIn">
                <div className="p-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Your Workspaces ({organizations.length})
                  </span>
                  <button
                    onClick={copyCode}
                    className="text-[10px] font-mono text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    {copiedCode ? "Copied" : activeOrg.code}
                  </button>
                </div>

                <div className="py-1 space-y-1 max-h-60 overflow-y-auto">
                  {organizations.map((org) => {
                    const isSelected = org.id === activeOrg.id;
                    return (
                      <div
                        key={org.id}
                        onClick={() => {
                          onSelectOrg(org);
                          setOrgDropdownOpen(false);
                        }}
                        className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-blue-50 border border-blue-200 text-blue-900"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${
                            isSelected ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700"
                          }`}>
                            {org.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-bold truncate max-w-[150px]">{org.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{org.code} • {org.type}</p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                      </div>
                    );
                  })}
                </div>

                {/* Additional Actions */}
                <div className="pt-2 mt-1 border-t border-slate-100 space-y-1">
                  <Link
                    href="/onboard/organization"
                    onClick={() => setOrgDropdownOpen(false)}
                    className="flex items-center gap-2 p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-blue-600" />
                    Create New Workspace
                  </Link>
                  <Link
                    href="/join"
                    onClick={() => setOrgDropdownOpen(false)}
                    className="flex items-center gap-2 p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Building2 className="w-4 h-4 text-slate-500" />
                    Join Another Workspace (Enter Code)
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Global Search Trigger (Ctrl + K) */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100/80 text-slate-500 text-xs transition-colors"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search {activeOrg.name}...</span>
            </span>
            <kbd className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white text-slate-400 border border-slate-200 shadow-2xs">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right: Notifications, Super Admin link & Real User Profile Menu */}
        <div className="flex items-center gap-2.5">
          {/* Super Admin Direct Link */}
          {currentUser.role === "SUPER_ADMIN" && (
            <Link href="/super-admin">
              <Button size="sm" variant="outline" className="border-red-300 text-red-700 bg-red-50 hover:bg-red-100 text-xs font-bold rounded-lg px-2.5">
                Super Admin Console
              </Button>
            </Link>
          )}

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setUserMenuOpen(false);
                setOrgDropdownOpen(false);
              }}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
              aria-label="Open notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-xl p-3 z-50 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900">Notifications</span>
                  <span className="text-[10px] text-blue-600 hover:underline cursor-pointer">Mark all as read</span>
                </div>
                <div className="py-2 space-y-2 text-xs">
                  <div className="p-2 rounded-lg bg-blue-50/50 border border-blue-100">
                    <p className="font-bold text-slate-800">Workspace Active</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Welcome to {activeOrg.name}. All systems operational.</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <p className="font-bold text-slate-800">Daily Report Sync</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Work sessions and attendance are logging in real-time.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Real Authenticated User Profile Pill & Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setUserMenuOpen(!userMenuOpen);
                setNotificationsOpen(false);
                setOrgDropdownOpen(false);
              }}
              className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/90 transition-colors"
              aria-label="User profile menu"
            >
              <div className="text-left hidden sm:block max-w-[140px]">
                <p className="text-xs font-bold text-slate-800 truncate leading-tight">{currentUser.name}</p>
                <p className="text-[10px] font-semibold text-blue-600 truncate">{getRoleDisplayName(currentUser.role)}</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                {currentUser.name.slice(0, 1).toUpperCase()}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl p-3 z-50 animate-fadeIn space-y-2.5">
                <div className="pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center shrink-0">
                      {currentUser.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-extrabold text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 truncate font-mono">{currentUser.email}</p>
                    </div>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                    <Shield className="w-3 h-3 text-blue-600" />
                    <span>{getRoleDisplayName(currentUser.role)}</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-700">
                    <span className="text-slate-400 block text-[9px] font-bold uppercase tracking-wider">Current Organization</span>
                    <span className="font-bold text-slate-800 block truncate text-xs">{activeOrg.name}</span>
                    <span className="text-slate-400 block font-mono text-[10px]">Code: {activeOrg.code}</span>
                  </div>

                  <Link
                    href="/join"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Join Another Workspace</span>
                  </Link>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-red-600 hover:bg-red-50 text-xs font-bold transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
