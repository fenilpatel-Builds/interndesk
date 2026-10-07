import React from "react";
import { Badge, BadgeProps } from "./badge";

export type SystemStatus =
  | "REGISTERED"
  | "PAYMENT_PENDING"
  | "PAYMENT_VERIFIED"
  | "PENDING_ADMIN_APPROVAL"
  | "APPROVED"
  | "ACTIVE"
  | "COMPLETED"
  | "REJECTED"
  | "SUSPENDED"
  | "CANCELLED"
  | "NOT_STARTED"
  | "WORKING"
  | "ON_BREAK"
  | "PENDING"
  | "IN_PROGRESS"
  | "OVERDUE"
  | "DRAFT"
  | "SUBMITTED"
  | "REVIEWED"
  | "NEEDS_REVISION";

interface StatusBadgeProps {
  status: SystemStatus | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toUpperCase();

  const getVariant = (s: string): BadgeProps["variant"] => {
    switch (s) {
      case "APPROVED":
      case "ACTIVE":
      case "COMPLETED":
      case "PAYMENT_VERIFIED":
      case "REVIEWED":
        return "success";
      case "PENDING":
      case "PAYMENT_PENDING":
      case "PENDING_ADMIN_APPROVAL":
      case "ON_BREAK":
      case "NEEDS_REVISION":
        return "warning";
      case "REJECTED":
      case "SUSPENDED":
      case "OVERDUE":
      case "CANCELLED":
        return "danger";
      case "WORKING":
      case "SUBMITTED":
      case "IN_PROGRESS":
        return "default";
      case "REGISTERED":
      case "NOT_STARTED":
      case "DRAFT":
      default:
        return "neutral";
    }
  };

  const formatText = (s: string): string => {
    return s
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <Badge variant={getVariant(normalized)} className={className}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {formatText(normalized)}
    </Badge>
  );
}
