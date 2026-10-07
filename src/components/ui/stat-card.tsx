import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "./card";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("card-elevation card-elevation-hover", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              {title}
            </p>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {value}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
            )}
            {trend && (
              <div
                className={cn(
                  "inline-flex items-center text-xs font-semibold mt-1",
                  trend.isPositive ? "text-emerald-600" : "text-rose-600"
                )}
              >
                <span>{trend.value}</span>
              </div>
            )}
          </div>
          {icon && (
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100/80">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
