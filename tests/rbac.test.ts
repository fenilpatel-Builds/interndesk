import { describe, it, expect } from "vitest";
import { hasPermission, getRoleDisplayName } from "../src/lib/multitenant/permissions";
import { isUserAdmin } from "../src/lib/auth/admin-whitelist";
import { credentialsStore } from "../src/lib/auth/credentials-store";
import { multiTenantStore } from "../src/lib/multitenant/store";

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

  it("grants executive administrative privileges and access to akash.padhiyar@gmail.com", () => {
    // 1. Central Whitelist Verification
    expect(isUserAdmin("akash.padhiyar@gmail.com")).toBe(true);
    expect(isUserAdmin("AKASH.PADHIYAR@GMAIL.COM")).toBe(true);
    expect(isUserAdmin("fenil8160@gmail.com")).toBe(true);
    expect(isUserAdmin("unauthorized@example.com")).toBe(false);

    // 2. Credentials Store Authentication
    const account = credentialsStore.findByEmail("akash.padhiyar@gmail.com");
    expect(account).not.toBeNull();
    expect(account?.role).toBe("ORG_ADMIN");
    expect(account?.name).toBe("Akash Padhiyar");
    expect(account?.organizationId).toBe("org-akash-01");

    const authenticated = credentialsStore.authenticate("akash.padhiyar@gmail.com", "akash.padhiyar@AT26");
    expect(authenticated).not.toBeNull();
    expect(authenticated?.email).toBe("akash.padhiyar@gmail.com");

    const failedAuth = credentialsStore.authenticate("akash.padhiyar@gmail.com", "wrongpassword");
    expect(failedAuth).toBeNull();

    // 3. Multitenant Membership Verification
    const members = multiTenantStore.getMemberships("org-akash-01");
    const akashMember = members.find((m) => m.user_email === "akash.padhiyar@gmail.com");
    expect(akashMember).toBeDefined();
    expect(akashMember?.role).toBe("ORG_ADMIN");
    expect(akashMember?.member_type).toBe("ADMIN");
  });

  it("grants executive administrative privileges and access to developer accounts", () => {
    // 1. Central Whitelist Verification
    expect(isUserAdmin("devloper.at12@gmail.com")).toBe(true);
    expect(isUserAdmin("delvloper.at12@gamil.com")).toBe(true);
    expect(isUserAdmin("developer.at12@gmail.com")).toBe(true);

    // 2. Credentials Store Authentication with Devloper@AT26
    const devAcc1 = credentialsStore.findByEmail("devloper.at12@gmail.com");
    expect(devAcc1).not.toBeNull();
    expect(devAcc1?.role).toBe("ORG_ADMIN");

    const authDev = credentialsStore.authenticate("devloper.at12@gmail.com", "Devloper@AT26");
    expect(authDev).not.toBeNull();
    expect(authDev?.email).toBe("devloper.at12@gmail.com");

    const authDevTypo = credentialsStore.authenticate("delvloper.at12@gamil.com", "Devloper@AT26");
    expect(authDevTypo).not.toBeNull();
    expect(authDevTypo?.email).toBe("delvloper.at12@gamil.com");

    const failedDev = credentialsStore.authenticate("devloper.at12@gmail.com", "wrongpassword");
    expect(failedDev).toBeNull();
  });
});
