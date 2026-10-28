"use client";

import React, { useState, useEffect } from "react";
import { StudentTopbar } from "@/components/student/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  Shield,
  Bell,
  Palette,
  CheckCircle2,
  Camera,
  IdCard,
  Mail,
  Building,
  GraduationCap,
} from "lucide-react";
import { parseClientSessionCookie } from "@/lib/auth/client-session";
import { INSTITUTE_CONFIG } from "@/lib/institute/config";

export default function StudentSettingsPage() {
  const [activeTab, setActiveTab] = useState<"Profile" | "Security" | "Notifications" | "Appearance">("Profile");

  const [fullName, setFullName] = useState("Student Intern");
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("AT-2026");
  const [department, setDepartment] = useState("Computer Science & Engineering");
  const [course, setCourse] = useState("B.Tech (CSE / IT)");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const session = parseClientSessionCookie();
    if (session?.name) {
      setFullName(session.name);
    }
    if (session?.email) {
      setEmail(session.email);
    }
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage("Profile updated successfully!");
    setTimeout(() => setToastMessage(null), 3500);
  };

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "PS";

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50">
      <StudentTopbar title="Settings & Profile" studentName={fullName} />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header matching Image 1 Bottom Right */}
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Settings</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your profile, preferences and security
          </p>
        </div>

        {/* Tabs: Profile, Security, Notifications, Appearance */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200/90 rounded-2xl w-fit shadow-xs">
          {(["Profile", "Security", "Notifications", "Appearance"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === tab
                  ? "bg-[#0F4C81] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Profile Tab matching Image 1 Bottom Right */}
        {activeTab === "Profile" && (
          <Card className="p-6 sm:p-8 rounded-3xl bg-white border-slate-200/90 shadow-xs max-w-3xl">
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Avatar + Edit Photo */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#0F4C81] to-blue-500 text-white font-black text-xl flex items-center justify-center shadow-md">
                  {initials}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{fullName}</h4>
                  <span className="text-xs text-slate-400 block mb-1.5">Student</span>
                  <button
                    type="button"
                    className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Edit Photo
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Institute Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Student ID
                  </label>
                  <input
                    type="text"
                    value={studentId}
                    disabled
                    className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Course / Program
                  </label>
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="bg-[#E52329] hover:bg-[#C41C22] text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs cursor-pointer"
                >
                  Update Profile
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Security Tab */}
        {activeTab === "Security" && (
          <Card className="p-6 rounded-3xl bg-white border-slate-200/90 shadow-xs max-w-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Security &amp; Credentials</h3>
            <p className="text-xs text-slate-500">
              Manage your password and multi-factor authentication methods.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Email OTP Two-Factor Authentication</h4>
                  <p className="text-[11px] text-slate-500">Dispatches 6-digit verification codes to your institute inbox.</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  Enabled
                </span>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
