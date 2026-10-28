"use client";

import React from "react";
import Link from "next/link";

interface AnimatedLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
  variant?: "light" | "dark" | "auto";
  showTagline?: boolean;
  taglineText?: string;
}

export function AnimatedLogo({
  className = "",
  size = "md",
  href = "/",
  variant = "light",
}: AnimatedLogoProps) {
  const sizeMap = {
    sm: "h-6 md:h-7 w-auto",
    md: "h-8 md:h-9 w-auto",
    lg: "h-10 md:h-11 w-auto",
    xl: "h-12 md:h-14 w-auto",
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const isDark = variant === "dark";

  const content = (
    <div className={`inline-flex items-center select-none group ${className}`}>
      {isDark ? (
        <div className="bg-white px-2.5 py-1.5 rounded-xl shadow-xs border border-white/20 flex items-center justify-center transition-transform duration-200 group-hover:scale-102">
          <img
            src="/images/akash-technolabs-logo-transparent.png"
            alt="Akash Technolabs"
            className={`${currentSize} object-contain`}
          />
        </div>
      ) : (
        <div className="relative shrink-0 flex items-center transition-transform duration-200 group-hover:scale-102">
          <img
            src="/images/akash-technolabs-logo-transparent.png"
            alt="Akash Technolabs"
            className={`${currentSize} object-contain`}
          />
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href} className="inline-block">{content}</Link>;
  }

  return content;
}
