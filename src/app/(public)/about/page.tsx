import React from "react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, ShieldCheck, Target, Users, Award } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center space-y-3">
            <span className="text-xs uppercase font-bold tracking-wider text-blue-600">
              About InternDesk
            </span>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Bridging the Gap Between Academics and Industry
            </h1>
            <p className="text-base text-slate-600 max-w-2xl mx-auto">
              InternDesk is a dedicated enterprise training and internship platform providing students with verified, project-driven industrial experience.
            </p>
          </div>

          {/* Core Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-slate-200/90 shadow-xs">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Industry-Aligned</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Our curriculum tracks (Fullstack Web, Python, Data Science, AI/ML, Enterprise Java) prepare interns for high-impact technical roles.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200/90 shadow-xs">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Verifiable Credentials</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every Offer Letter and Certificate of Completion is cryptographically recorded with unique IDs and public verification links.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200/90 shadow-xs">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Mentor Supervision</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Students log daily work reports, receive actionable feedback from mentors, and complete evaluated technical assessments.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
