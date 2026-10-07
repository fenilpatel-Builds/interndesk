"use client";

import React, { useState } from "react";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { History, Search, Shield, Filter } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface AuditEntry {
  id: string;
  actor: string;
  role: "ADMIN" | "STUDENT" | "SYSTEM";
  action: string;
  entity: string;
  oldStatus?: string;
  newStatus?: string;
  timestamp: string;
  ip: string;
}

export default function AdminAuditLogsPage() {
  const [logs] = useState<AuditEntry[]>([
    {
      id: "a1",
      actor: "Dr. Rajesh Kumar",
      role: "ADMIN",
      action: "REGISTRATION_APPROVED",
      entity: "REGISTRATION (ID-APP-847291)",
      oldStatus: "PENDING_ADMIN_APPROVAL",
      newStatus: "APPROVED",
      timestamp: "2026-10-07T09:15:00Z",
      ip: "10.0.4.12",
    },
    {
      id: "a2",
      actor: "Aarav Sharma",
      role: "STUDENT",
      action: "ATTENDANCE_CLOCK_IN",
      entity: "WORK_SESSION (ws_9821)",
      newStatus: "WORKING",
      timestamp: "2026-10-07T09:00:10Z",
      ip: "152.58.12.90",
    },
    {
      id: "a3",
      actor: "Aarav Sharma",
      role: "STUDENT",
      action: "ATTENDANCE_BREAK_START",
      entity: "WORK_SESSION (ws_9821)",
      newStatus: "ON_BREAK",
      timestamp: "2026-10-07T12:00:00Z",
      ip: "152.58.12.90",
    },
    {
      id: "a4",
      actor: "Payment Gateway",
      role: "SYSTEM",
      action: "PAYMENT_SIGNATURE_VERIFIED",
      entity: "PAYMENT (order_k29f93)",
      newStatus: "VERIFIED",
      timestamp: "2026-10-07T08:45:00Z",
      ip: "Webhook API",
    },
    {
      id: "a5",
      actor: "Aarav Sharma",
      role: "STUDENT",
      action: "DAILY_REPORT_SUBMITTED",
      entity: "DAILY_REPORT (dr_1007)",
      oldStatus: "DRAFT",
      newStatus: "SUBMITTED",
      timestamp: "2026-10-06T17:05:00Z",
      ip: "152.58.12.90",
    },
  ]);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const filtered = logs.filter((l) => {
    const matchesRole = roleFilter === "ALL" || l.role === roleFilter;
    const matchesSearch =
      l.actor.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.entity.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <AdminTopbar title="Security Audit Logs" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Immutable Audit Trail
          </h2>
          <p className="text-xs text-slate-500">
            Cryptographic and operational audit log tracing every critical lifecycle mutation.
          </p>
        </div>

        {/* Filter bar */}
        <Card className="border-slate-200/90 shadow-2xs">
          <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search actor, action, or entity ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Actor Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-lg border border-slate-200 text-xs py-1.5 px-3 bg-white focus:outline-none focus:border-blue-600"
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admin Only</option>
                <option value="STUDENT">Student Only</option>
                <option value="SYSTEM">System Only</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-slate-200/90 shadow-xs">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-4 py-3.5">Actor</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Action</th>
                  <th className="px-4 py-3.5">Entity</th>
                  <th className="px-4 py-3.5">Transition</th>
                  <th className="px-6 py-3.5 text-right">Origin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </td>
                    <td className="px-4 py-4 font-bold text-slate-900">
                      {log.actor}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          log.role === "ADMIN"
                            ? "bg-purple-50 text-purple-700"
                            : log.role === "STUDENT"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {log.role}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-mono font-semibold text-slate-800">
                      {log.action}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {log.entity}
                    </td>
                    <td className="px-4 py-4">
                      {log.oldStatus && (
                        <span className="text-slate-400 line-through mr-1 text-[11px]">{log.oldStatus}</span>
                      )}
                      {log.newStatus && <StatusBadge status={log.newStatus} />}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-400 text-[11px]">
                      {log.ip}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
