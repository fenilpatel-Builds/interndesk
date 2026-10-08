"use client";

import React from "react";
import Link from "next/link";

interface AnimatedLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  href?: string;
}

export function AnimatedLogo({
  className = "",
  size = "md",
  showTagline = true,
  href = "/",
}: AnimatedLogoProps) {
  const sizeMap = {
    sm: { icon: "w-8 h-8", text: "text-lg", sub: "text-[9px]" },
    md: { icon: "w-10 h-10", text: "text-xl", sub: "text-[10px]" },
    lg: { icon: "w-12 h-12", text: "text-2xl", sub: "text-xs" },
  };

  const currentSize = sizeMap[size];

  const content = (
    <div className={`inline-flex items-center gap-3 select-none group ${className}`}>
      {/* Animated Desk Emblem */}
      <div
        className={`relative ${currentSize.icon} rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 p-0.5 shadow-md shadow-blue-500/20 transition-transform duration-300 group-hover:scale-105`}
      >
        <div className="w-full h-full bg-slate-950/20 backdrop-blur-xs rounded-[10px] flex items-center justify-center relative overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute inset-0 bg-radial from-blue-400/30 to-transparent opacity-75 animate-pulse" />

          {/* SVG Animated Desk / Workspace Symbol with Nodes */}
          <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 relative z-10 text-white"
          >
            {/* Top Workspace Bar */}
            <path
              d="M8 14H32"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="drop-shadow-sm transition-all"
            />
            {/* Supporting Legs & Connected Nodes */}
            <path
              d="M12 14V26M28 14V26"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              opacity="0.85"
            />
            {/* Cross Strut / Growth Path */}
            <path
              d="M12 21H28"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeDasharray="2 2"
              opacity="0.7"
            />
            {/* Floating Innovation Node Points (Learn • Work • Grow) */}
            <circle cx="8" cy="14" r="2" fill="#60A5FA" />
            <circle cx="32" cy="14" r="2" fill="#60A5FA" />
            <circle cx="20" cy="10" r="2.2" fill="#38BDF8" className="animate-ping" style={{ animationDuration: "3s" }} />
            <circle cx="20" cy="10" r="2" fill="#FFFFFF" />
            <circle cx="12" cy="26" r="1.8" fill="#818CF8" />
            <circle cx="28" cy="26" r="1.8" fill="#818CF8" />
          </svg>
        </div>
      </div>

      {/* Brand Wordmark & Tagline */}
      <div className="flex flex-col text-left">
        <span
          className={`font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors ${currentSize.text}`}
        >
          Intern<span className="text-blue-600">Desk</span>
        </span>
        {showTagline && (
          <span
            className={`font-bold uppercase tracking-wider text-slate-500 transition-colors group-hover:text-slate-700 ${currentSize.sub}`}
          >
            Learn • Work • Grow
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
