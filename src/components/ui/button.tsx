import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

    const variants = {
      primary:
        "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow focus:ring-blue-500",
      secondary:
        "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 focus:ring-indigo-500",
      outline:
        "border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 focus:ring-slate-400",
      ghost:
        "text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:ring-slate-300",
      danger:
        "bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-red-500",
      success:
        "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus:ring-emerald-500",
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5 min-h-[32px] gap-1.5",
      md: "text-sm px-4 py-2 min-h-[40px] gap-2",
      lg: "text-base px-6 py-2.5 min-h-[48px] gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
