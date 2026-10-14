"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, Building2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedLogo } from "@/components/ui/animated-logo";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Platform", href: "/#platform" },
    { label: "Solutions", href: "/#solutions" },
    { label: "Features", href: "/#features" },
    { label: "Security", href: "/#security" },
    { label: "Verify Credential", href: "/verify/IND-APX-2026-0042" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Tagline */}
          <AnimatedLogo size="md" />

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/join">
              <Button
                variant="outline"
                size="sm"
                className="font-semibold text-slate-700 border-slate-300 hover:bg-slate-50 px-4 rounded-xl flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5 text-slate-500" />
                Find Org
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                size="sm"
                className="font-semibold text-slate-700 border-slate-300 hover:bg-slate-50 px-4 rounded-xl"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/onboard/organization">
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/10 px-5 rounded-xl flex items-center gap-1.5"
              >
                <Building2 className="w-4 h-4" />
                Create Workspace
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
            <Link href="/join" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-center rounded-xl">
                Find Your Organization (Enter Code)
              </Button>
            </Link>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-center rounded-xl">
                Sign In
              </Button>
            </Link>
            <Link href="/onboard/organization" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full justify-center bg-blue-600 hover:bg-blue-700 font-bold rounded-xl text-white">
                Create Organization Workspace
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
