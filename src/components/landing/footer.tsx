import React from "react";
import Link from "next/link";
import { GraduationCap, Shield, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold text-white tracking-tight">
                  InternDesk
                </span>
                <span className="block text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                  Learn • Work • Grow
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              The premier SaaS portal for structured industrial training, daily productivity tracking, skill assessments, and certified credentialing.
            </p>
          </div>

          {/* Platform Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Core Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  Student Journey
                </a>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Register for Internship
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Student / Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Trust & Support
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>Zero-Trust RLS Protected</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>support@interndesk.local</span>
              </li>
              <li>
                <Link href="/verify" className="hover:text-white transition-colors">
                  Document Verification
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 InternDesk. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Learn • Work • Grow</span>
            <span>Made for modern internship organizations</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
