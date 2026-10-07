"use client";

import React, { useState } from "react";
import { StudentTopbar } from "@/components/student/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, CheckCircle2, Lock, ShieldCheck } from "lucide-react";

export default function StudentProfilePage() {
  const [fullName, setFullName] = useState("Aarav Sharma");
  const [email] = useState("aarav@college.edu"); // Read-only identity
  const [mobile, setMobile] = useState("9876543210");
  const [college] = useState("National Institute of Technology"); // Academic record
  const [university] = useState("State Technical University");
  const [course] = useState("B.Tech Computer Science");
  const [technology] = useState("Modern Fullstack Web Development");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <StudentTopbar title="My Profile" studentName="Aarav Sharma" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Personal & Academic Profile
          </h2>
          <p className="text-xs text-slate-500">
            View verified enrollment data and update contact settings.
          </p>
        </div>

        {saved && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Profile contact details updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
          {/* Identity & Contact */}
          <Card className="border-slate-200/90 shadow-xs">
            <CardHeader className="py-4 px-6 border-b border-slate-100 flex flex-row items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <CardTitle className="text-base font-bold">Personal & Contact Info</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
                <Input
                  label="10-Digit Mobile Number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <span>Registered Email Address</span>
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-500 cursor-not-allowed"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Email changes require administrator identity re-verification.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Academic Records (Read-only verified records) */}
          <Card className="border-slate-200/90 shadow-xs">
            <CardHeader className="py-4 px-6 border-b border-slate-100 flex flex-row items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <CardTitle className="text-base font-bold">Verified Academic & Specialization Record</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Enrolled College</span>
                  <p className="font-semibold text-slate-900">{college}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Affiliated University</span>
                  <p className="font-semibold text-slate-900">{university}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Degree & Course</span>
                  <p className="font-semibold text-slate-900">{course}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-blue-700">Internship Domain</span>
                  <p className="font-bold text-blue-900">{technology}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-2">
            <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700 font-semibold px-8">
              Save Profile Updates
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
