import { MemberRole } from "@/types/multitenant";

export type Permission =
  | "members.view"
  | "members.invite"
  | "members.approve"
  | "members.manage"
  | "programs.view"
  | "programs.create"
  | "programs.manage"
  | "tasks.view"
  | "tasks.create"
  | "tasks.update_own"
  | "tasks.manage"
  | "attendance.clock"
  | "attendance.view_own"
  | "attendance.view_team"
  | "attendance.approve"
  | "reports.submit"
  | "reports.review"
  | "learning.view"
  | "learning.upload"
  | "assessments.take"
  | "assessments.create"
  | "assessments.grade"
  | "documents.view_own"
  | "documents.issue"
  | "documents.verify"
  | "announcements.create"
  | "analytics.view"
  | "analytics.export"
  | "settings.manage"
  | "platform.super_admin";

const ROLE_PERMISSIONS: Record<MemberRole, Permission[]> = {
  SUPER_ADMIN: [
    "platform.super_admin",
    "members.view",
    "members.manage",
    "programs.view",
    "programs.manage",
    "tasks.view",
    "tasks.manage",
    "attendance.view_team",
    "reports.review",
    "learning.view",
    "assessments.grade",
    "documents.verify",
    "analytics.view",
    "analytics.export",
  ],
  ORG_OWNER: [
    "members.view",
    "members.invite",
    "members.approve",
    "members.manage",
    "programs.view",
    "programs.create",
    "programs.manage",
    "tasks.view",
    "tasks.create",
    "tasks.manage",
    "attendance.view_team",
    "attendance.approve",
    "reports.review",
    "learning.view",
    "learning.upload",
    "assessments.create",
    "assessments.grade",
    "documents.view_own",
    "documents.issue",
    "documents.verify",
    "announcements.create",
    "analytics.view",
    "analytics.export",
    "settings.manage",
  ],
  ORG_ADMIN: [
    "members.view",
    "members.invite",
    "members.approve",
    "members.manage",
    "programs.view",
    "programs.create",
    "programs.manage",
    "tasks.view",
    "tasks.create",
    "tasks.manage",
    "attendance.view_team",
    "attendance.approve",
    "reports.review",
    "learning.view",
    "learning.upload",
    "assessments.create",
    "assessments.grade",
    "documents.view_own",
    "documents.issue",
    "documents.verify",
    "announcements.create",
    "analytics.view",
    "analytics.export",
    "settings.manage",
  ],
  HR_COORDINATOR: [
    "members.view",
    "members.invite",
    "members.approve",
    "programs.view",
    "tasks.view",
    "attendance.view_team",
    "attendance.approve",
    "reports.review",
    "learning.view",
    "documents.view_own",
    "documents.issue",
    "documents.verify",
    "announcements.create",
    "analytics.view",
    "analytics.export",
  ],
  MANAGER_SUPERVISOR: [
    "members.view",
    "programs.view",
    "tasks.view",
    "tasks.create",
    "tasks.manage",
    "attendance.view_team",
    "reports.review",
    "learning.view",
    "assessments.grade",
    "documents.view_own",
    "announcements.create",
    "analytics.view",
  ],
  TRAINER_MENTOR: [
    "members.view",
    "programs.view",
    "tasks.view",
    "tasks.create",
    "learning.view",
    "learning.upload",
    "assessments.create",
    "assessments.grade",
    "reports.review",
    "announcements.create",
  ],
  EMPLOYEE: [
    "tasks.view",
    "tasks.update_own",
    "attendance.clock",
    "attendance.view_own",
    "reports.submit",
    "learning.view",
    "documents.view_own",
  ],
  INTERN: [
    "tasks.view",
    "tasks.update_own",
    "attendance.clock",
    "attendance.view_own",
    "reports.submit",
    "learning.view",
    "assessments.take",
    "documents.view_own",
  ],
  STUDENT: [
    "programs.view",
    "tasks.view",
    "tasks.update_own",
    "learning.view",
    "assessments.take",
    "documents.view_own",
  ],
  AUDITOR: [
    "members.view",
    "programs.view",
    "tasks.view",
    "attendance.view_team",
    "reports.review",
    "documents.verify",
    "analytics.view",
    "analytics.export",
  ],
};

export function hasPermission(role: MemberRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

export function getRoleDisplayName(role: MemberRole): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "Platform Super Admin";
    case "ORG_OWNER":
      return "Organization Owner";
    case "ORG_ADMIN":
      return "Organization Admin";
    case "HR_COORDINATOR":
      return "HR / Coordinator";
    case "MANAGER_SUPERVISOR":
      return "Manager / Supervisor";
    case "TRAINER_MENTOR":
      return "Trainer / Mentor";
    case "EMPLOYEE":
      return "Employee";
    case "INTERN":
      return "Intern";
    case "STUDENT":
      return "Student";
    case "AUDITOR":
      return "Auditor / Read-Only";
    default:
      return role;
  }
}
