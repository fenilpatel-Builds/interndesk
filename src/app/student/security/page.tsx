"use client";

import React, { useState } from "react";
import { StudentTopbar } from "@/components/student/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Smartphone, Laptop, LogOut, CheckCircle2, History, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface SessionInfo {
  id: string;
  deviceLabel: string;
  browser: string;
  os: string;
  lastActive: string;
  isCurrent?: boolean;
}

export default function StudentSecurityPage() {
  const [sessions, setSessions] = useState<SessionInfo[]>([
    {
      id: "s1",
      deviceLabel: "Windows PC • Chrome 132.0",
      browser: "Chrome",
      os: "Windows 11",
      lastActive: "Just now",
      isCurrent: true,
    },
    {
      id: "s2",
      deviceLabel: "MacBook Pro • Safari 18.2",
      browser: "Safari",
      os: "macOS Sonoma",
      lastActive: "2 days ago",
      isCurrent: false,
    },
    {
      id: "s3",
      deviceLabel: "iPhone 15 • Mobile Safari",
      browser: "Mobile Safari",
      os: "iOS 18.1",
      lastActive: "5 days ago",
      isCurrent: false,
    },
  ]);

  const [message, setMessage] = useState<string | null>(null);

  const handleRevokeSession = (sessionId: string) => {
    setSessions(sessions.filter((s) => s.id !== sessionId));
    setMessage("Session successfully revoked. Device has been signed out.");
  };

  const handleSignOutOtherDevices = () => {
    setSessions(sessions.filter((s) => s.isCurrent));
    setMessage("All other active device sessions have been terminated.");
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <StudentTopbar title="Account & Device Security" studentName="Aarav Sharma" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Account & Session Intelligence
          </h2>
          <p className="text-xs text-slate-500">
            Monitor active login sessions, verify connected devices, and enforce multi-factor integrity.
          </p>
        </div>

        {message && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Active Devices List */}
          <div className="lg:col-span-8 space-y-4">
            <Card className="border-slate-200/90 shadow-xs">
              <CardHeader className="py-4 px-6 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Active Devices & Browsers</CardTitle>
                  <p className="text-xs text-slate-500">Devices currently authenticated to your account</p>
                </div>
                {sessions.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    onClick={handleSignOutOtherDevices}
                  >
                    Sign Out All Other Devices
                  </Button>
                )}
              </CardHeader>

              <CardContent className="p-6 space-y-3">
                {sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600">
                        {sess.os.toLowerCase().includes("ios") ? (
                          <Smartphone className="w-5 h-5" />
                        ) : (
                          <Laptop className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900">{sess.deviceLabel}</p>
                          {sess.isCurrent && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                              Current Device
                            </span>
                          )}
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          {sess.os} • Last active: {sess.lastActive}
                        </p>
                      </div>
                    </div>

                    {!sess.isCurrent && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8 text-red-600 hover:bg-red-50 border-slate-200"
                        onClick={() => handleRevokeSession(sess.id)}
                      >
                        <LogOut className="w-3.5 h-3.5 mr-1" />
                        Revoke
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Security Policy Card */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="border-blue-200 bg-blue-50/40 shadow-xs">
              <CardContent className="p-5 space-y-3 text-xs text-blue-950">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm">Automated Threat Mitigation</h4>
                <p className="text-blue-900/80 leading-relaxed text-[11px]">
                  Whenever a sign-in is attempted from a new browser or geographic zone, InternDesk requires full Email OTP re-authentication and logs an immutable audit event.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
