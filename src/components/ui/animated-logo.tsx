"use client";

import React from "react";
import Link from "next/link";

interface AnimatedLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  taglineText?: string;
  href?: string;
  variant?: "light" | "dark" | "auto";
}

export function AnimatedLogo({
  className = "",
  size = "md",
  showTagline = true,
  taglineText = "INSTITUTE ACTIVITY MANAGEMENT SYSTEM",
  href = "/",
  variant = "light",
}: AnimatedLogoProps) {
  const sizeMap = {
    sm: { icon: "h-6 w-auto", box: "w-8 h-8 p-1", text: "text-base", sub: "text-[8px]" },
    md: { icon: "h-7 w-auto", box: "w-9 h-9 p-1.5", text: "text-lg", sub: "text-[9px]" },
    lg: { icon: "h-9 w-auto", box: "w-11 h-11 p-2", text: "text-2xl", sub: "text-[10px]" },
  };

  const currentSize = sizeMap[size];
  const isDark = variant === "dark";

  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none group ${className}`}>
      {/* Icon: Image 1 (direct emblem) or Image 2 (white squircle container) */}
      {isDark ? (
        <div className={`${currentSize.box} rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm border border-slate-700/60 transition-transform duration-200 group-hover:scale-105`}>
          <img
            src="/images/akash-at-watermark-hd.png"
            alt="Akash Technolabs"
            className={`${currentSize.icon} object-contain`}
          />
        </div>
      ) : (
        <div className="relative shrink-0 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
          <img
            src="/images/akash-at-watermark-hd.png"
            alt="Akash Technolabs"
            className={`${currentSize.icon} object-contain`}
          />
        </div>
      )}

      {/* Brand Wordmark matching user's Image 1 & Image 2 */}
      <div className="flex flex-col text-left justify-center">
        <div className="flex items-center leading-none">
          {isDark ? (
            <>
              <span className={`font-black tracking-tight text-white ${currentSize.text}`}>
                Akash
              </span>
              <sup className="text-xs font-bold text-[#E52329] ml-0.5">®</sup>
              <span className={`font-black tracking-tight text-white ml-1 ${currentSize.text}`}>
                Technolabs
              </span>
            </>
          ) : (
            <>
              <span className={`font-black tracking-tight text-[#E52329] ${currentSize.text}`}>
                Akash
              </span>
              <sup className="text-xs font-bold text-[#E52329] ml-0.5">®</sup>
              <span className={`font-black tracking-tight text-[#0B192C] ml-1 ${currentSize.text}`}>
                Technolabs
              </span>
            </>
          )}
        </div>

        {showTagline && (
          <span
            className={`font-bold uppercase tracking-wider mt-1 leading-none ${currentSize.sub} ${
              isDark ? "text-sky-400" : "text-slate-500"
            }`}
          >
            {taglineText}
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
