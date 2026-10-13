import { describe, it, expect } from "vitest";
import { hasPermission, getRoleDisplayName } from "../src/lib/multitenant/permissions";

describe("Role-Based Access Control (RBAC) Permission Matrix", () => {
  it("grants Platform Super Admin platform-level privileges", () => {
    expect(hasPermission("SUPER_ADMIN", "platform.super_admin")).toBe(true);
    expect(hasPermission("SUPER_ADMIN", "members.manage")).toBe(true);
    expect(hasPermission("ORG_ADMIN", "platform.super_admin")).toBe(false);
    expect(hasPermission("STUDENT", "platform.super_admin")).toBe(false);
  });

  it("grants Organization Admin settings and membership management privileges", () => {
    expect(hasPermission("ORG_ADMIN", "settings.manage")).toBe(true);
    expect(hasPermission("ORG_ADMIN", "members.approve")).toBe(true);
    expect(hasPermission("ORG_ADMIN", "documents.issue")).toBe(true);
    expect(hasPermission("ORG_ADMIN", "programs.create")).toBe(true);
  });

  it("restricts interns from performing administrative operations", () => {
    expect(hasPermission("INTERN", "settings.manage")).toBe(false);
    expect(hasPermission("INTERN", "documents.issue")).toBe(false);
    expect(hasPermission("INTERN", "members.approve")).toBe(false);

    // Allowed intern operations
    expect(hasPermission("INTERN", "attendance.clock")).toBe(true);
    expect(hasPermission("INTERN", "reports.submit")).toBe(true);
    expect(hasPermission("INTERN", "tasks.view")).toBe(true);
  });

  it("restricts students to learning and assessments", () => {
    expect(hasPermission("STUDENT", "settings.manage")).toBe(false);
    expect(hasPermission("STUDENT", "attendance.clock")).toBe(false); // strictly student mode
    expect(hasPermission("STUDENT", "learning.view")).toBe(true);
    expect(hasPermission("STUDENT", "assessments.take")).toBe(true);
  });

  it("provides correct readable role display names", () => {
    expect(getRoleDisplayName("SUPER_ADMIN")).toBe("Platform Super Admin");
    expect(getRoleDisplayName("ORG_ADMIN")).toBe("Organization Admin");
    expect(getRoleDisplayName("MANAGER_SUPERVISOR")).toBe("Manager / Supervisor");
    expect(getRoleDisplayName("INTERN")).toBe("Intern");
    expect(getRoleDisplayName("STUDENT")).toBe("Student");
  });
});
