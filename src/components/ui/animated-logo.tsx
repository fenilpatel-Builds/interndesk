"use client";

import React from "react";
import Link from "next/link";

interface AnimatedLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  href?: string;
  variant?: "light" | "dark" | "auto";
}

export function AnimatedLogo({
  className = "",
  size = "md",
  showTagline = true,
  href = "/",
  variant = "auto",
}: AnimatedLogoProps) {
  const sizeMap = {
    sm: { icon: "h-7 w-auto", text: "text-base", sub: "text-[9px]" },
    md: { icon: "h-9 w-auto", text: "text-lg", sub: "text-[10px]" },
    lg: { icon: "h-11 w-auto", text: "text-xl", sub: "text-xs" },
  };

  const currentSize = sizeMap[size];

  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none group ${className}`}>
      {/* Official Akash Technolabs Emblem with Subtle Ambient Glow */}
      <div className="relative shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600/30 to-blue-700/30 rounded-xl blur-xs opacity-60 group-hover:opacity-100 transition-opacity" />
        <img
          src="/images/akash-at-watermark-hd.png"
          alt="Akash Technolabs"
          className={`${currentSize.icon} relative z-10 object-contain drop-shadow-xs`}
        />
      </div>

      {/* Brand Wordmark & Official Tagline */}
      <div className="flex flex-col text-left">
        <div className="flex items-center leading-none">
          <span className={`font-black tracking-tight text-[#d32f2f] ${currentSize.text}`}>
            Akash<span className="text-[10px] align-super font-bold ml-0.5">®</span>
          </span>
          <span className={`font-black tracking-tight text-[#1e3264] ml-1.5 ${currentSize.text}`}>
            Technolabs
          </span>
        </div>
        {showTagline && (
          <span
            className={`font-bold uppercase tracking-wider text-slate-500 mt-1 leading-none ${currentSize.sub}`}
          >
            Student &amp; Intern Workspace
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
