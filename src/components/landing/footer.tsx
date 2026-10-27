import React from "react";
import Link from "next/link";
import { Shield, Mail, Phone, MapPin, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#080d1a] text-slate-400 py-12 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="p-1 rounded-xl bg-white border border-slate-700 shadow-sm">
                <img
                  src="/images/akash-at-watermark-hd.png"
                  alt="Akash Technolabs"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <span className="text-lg font-black text-white tracking-tight">
                  Akash<span className="text-[#ef4444]">®</span> Technolabs
                </span>
                <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Student &amp; Intern Management Portal
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Gujarat&apos;s leading IT training and software solutions institute specializing in AI/ML, Python, Cloud computing, and Full Stack enterprise development.
            </p>
          </div>

          {/* Platform Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Platform Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/login" className="hover:text-red-400 transition-colors">
                  Admin &amp; Student Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-red-400 transition-colors">
                  Internship Enrollment
                </Link>
              </li>
              <li>
                <Link href="/student/documents" className="hover:text-red-400 transition-colors">
                  Offer Letters &amp; Certificates
                </Link>
              </li>
              <li>
                <Link href="/verify/ID-AKT-2026-0701" className="hover:text-red-400 transition-colors">
                  Public Ledger Verification
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Location */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Akash Technolabs Contact
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>202, Aarya Arcade, Above Passport Seva Kendra, Mithakhali Six Road, Navrangpura, Ahmedabad-380009.</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>+91 99786 21654</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>info@akashtechnolabs.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>www.akashtechnolabs.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Akash Technolabs. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>AI/ML • Python • Cloud • Full Stack</span>
            <span>Accredited IT Practicum Center</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
