import React from "react";
import Link from "next/link";
import { Shield, Mail, Phone, MapPin, Globe, CheckCircle2, Zap, Lightbulb, Headphones } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#080d1a] text-slate-400 border-t border-slate-900 select-none">
      {/* Upper Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800/80">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-xl bg-white border border-slate-700 shadow-sm">
                <img
                  src="/images/akash-at-watermark-hd.png"
                  alt="Akash Technolabs"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <span className="text-lg font-black text-white tracking-tight">
                  Akash<span className="text-[#E52329]">®</span> Technolabs
                </span>
                <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Institute Activity Management System
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Gujarat&apos;s premier educational &amp; IT training institution managing student project activities, attendance, daily progress reports, and certified practicum credentials.
            </p>
          </div>

          {/* Platform Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Platform Portals
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/login" className="hover:text-red-400 transition-colors">
                  Student Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-red-400 transition-colors">
                  Student Registration (Free)
                </Link>
              </li>
              <li>
                <Link href="/student/activities" className="hover:text-red-400 transition-colors">
                  Academic Activities Hub
                </Link>
              </li>
              <li>
                <Link href="/verify/ID-AKT-2026-0701" className="hover:text-red-400 transition-colors">
                  Public Certificate Verification
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Location */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Headquarters
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
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
      </div>

      {/* Signature Bottom Ribbon matching Image 1 & Image 2 exactly */}
      <div className="bg-[#050914] border-t border-slate-800/90 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          {/* Logo + Tagline */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-black text-sm text-white">
              <span className="text-[#E52329]">Akash</span>
              <span>Technolabs</span>
            </div>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-400 font-medium hidden sm:inline">
              Building a smarter future through technology
            </span>
          </div>

          {/* 4 Trust Badges */}
          <div className="flex items-center gap-5 text-slate-400 text-[11px] font-semibold">
            <span className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              Secure
            </span>
            <span className="flex items-center gap-1.5 hover:text-white transition-colors">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Reliable
            </span>
            <span className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              Innovative
            </span>
            <span className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Headphones className="w-3.5 h-3.5 text-red-400" />
              Support
            </span>
          </div>

          {/* Website domain */}
          <div>
            <a
              href="https://akashtechnolabs.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-slate-300 hover:text-white transition-colors"
            >
              www.akashtechnolabs.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
