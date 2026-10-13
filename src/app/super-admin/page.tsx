"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Building2,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Activity,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { multiTenantStore } from "@/lib/multitenant/store";
import { Organization } from "@/types/multitenant";

export default function SuperAdminConsolePage() {
  const [orgs, setOrgs] = useState<Organization[]>(multiTenantStore.getOrganizations());
  const [search, setSearch] = useState("");
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

  const metrics = multiTenantStore.getSuperAdminMetrics();
  const auditLogs = multiTenantStore.getAuditLogs();

  const handleApprove = (orgId: string) => {
    multiTenantStore.verifyOrganization(orgId, "APPROVED", "Approved by Platform Super Admin");
    setOrgs([...multiTenantStore.getOrganizations()]);
  };

  const handleSuspend = (orgId: string) => {
    multiTenantStore.verifyOrganization(orgId, "SUSPENDED", "Suspended due to security review");
    setOrgs([...multiTenantStore.getOrganizations()]);
  };

  const handleRotateCode = (orgId: string) => {
    multiTenantStore.rotateOrganizationCode(orgId);
    setOrgs([...multiTenantStore.getOrganizations()]);
  };

  const filteredOrgs = orgs.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.code.toLowerCase().includes(search.toLowerCase()) ||
    o.official_email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-950 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AnimatedLogo size="sm" href="/" />
          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-red-950 text-red-400 border border-red-800 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            PLATFORM SUPER ADMIN CONSOLE
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/workspace">
            <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs rounded-xl">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Return to Workspace
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
        {/* Metric Cards Row (Section 27) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Workspaces</p>
            <p className="text-2xl font-black text-white mt-1">{metrics.totalOrgs}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Verified</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">{metrics.verifiedOrgs}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Pending Review</p>
            <p className="text-2xl font-black text-amber-400 mt-1">{metrics.pendingVerifications}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
            <p className="text-[10px] font-bold uppercase tracking-wider text-red-400">Suspended</p>
            <p className="text-2xl font-black text-red-400 mt-1">{metrics.suspendedOrgs}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Total Members</p>
            <p className="text-2xl font-black text-blue-400 mt-1">{metrics.totalMembers}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Platform Health</p>
            <p className="text-sm font-bold text-emerald-400 mt-2 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              100% Operational
            </p>
          </div>
        </div>

        {/* Organization Management & Verification Queue */}
        <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                Organization Tenant Registry & Verification Queue
              </h3>
              <p className="text-xs text-slate-400 font-normal">
                Review tenant legitimacy, approve workspaces, manage suspensions, and rotate codes.
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tenant or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-700">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="p-3.5">Organization</th>
                  <th className="p-3.5">Code</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5 text-right">Super Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 font-medium">
                {filteredOrgs.map((org) => (
                  <tr key={org.id} className="hover:bg-slate-750/50">
                    <td className="p-3.5">
                      <p className="font-bold text-white">{org.name}</p>
                      <p className="text-[10px] text-slate-400">{org.industry_or_category}</p>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-blue-400">
                      {org.code}
                    </td>
                    <td className="p-3.5 text-slate-300">
                      {org.type}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        org.status === "APPROVED"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : org.status === "VERIFICATION_PENDING"
                          ? "bg-amber-950 text-amber-400 border border-amber-800"
                          : "bg-red-950 text-red-400 border border-red-800"
                      }`}>
                        {org.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                      {org.official_email}
                    </td>
                    <td className="p-3.5 text-right space-x-1.5">
                      {org.status !== "APPROVED" && (
                        <Button
                          size="sm"
                          onClick={() => handleApprove(org.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg"
                        >
                          Approve
                        </Button>
                      )}
                      {org.status === "APPROVED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSuspend(org.id)}
                          className="border-red-800 text-red-400 hover:bg-red-950 text-[11px] font-bold px-2.5 py-1 rounded-lg"
                        >
                          Suspend
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRotateCode(org.id)}
                        className="border-slate-700 text-slate-300 hover:bg-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-lg"
                        title="Rotate Organization Code"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Rotate Code
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security & Audit Events */}
        <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-400" />
            Platform-Wide Audit Trail & Security Events
          </h3>
          <div className="space-y-2">
            {auditLogs.slice(0, 6).map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-slate-900 border border-slate-750 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-blue-400">{log.action}</span>
                  <span className="text-slate-400 ml-2">by {log.actor_email} ({log.actor_role})</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Resource: {log.resource}</p>
                </div>
                <div className="text-right text-[11px] text-slate-500 font-mono">
                  <p>{new Date(log.created_at).toLocaleTimeString()}</p>
                  <p>IP: {log.ip_address}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        InternDesk Platform Administration • Super Admin Role Authorization Required
      </footer>
    </div>
  );
}
