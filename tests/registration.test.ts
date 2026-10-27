import { describe, it, expect } from "vitest";
import { registrationSchema } from "../src/validations/registration";
import { multiTenantStore } from "../src/lib/multitenant/store";

describe("Registration Schema Business Rules", () => {
  const validData = {
    fullName: "Aarav Sharma",
    email: "aarav@akashtechnolabs.com",
    studentId: "AKT-2026-088",
    department: "dept-cse",
    mobile: "9876543210",
    dateOfBirth: "2002-05-15",
    address: "123 Campus Road, Tech City",
    college: "Akash Technolabs",
    university: "State Technical University",
    course: "B.Tech Computer Science",
    semester: "6th Semester",
    technology: "Modern Fullstack Web Development" as const,
    duration: "3 Months" as const,
    startDate: "2026-11-01",
    category: "Academic Internship" as const,
  };

  it("validates compliant student registration payload", () => {
    const result = registrationSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects invalid email addresses", () => {
    const result = registrationSchema.safeParse({
      ...validData,
      email: "invalid-email-string",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid mobile numbers that are not 10 digits", () => {
    const result = registrationSchema.safeParse({
      ...validData,
      mobile: "12345",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing mandatory fields", () => {
    const incomplete = { ...validData };
    delete (incomplete as { fullName?: string }).fullName;
    const result = registrationSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });
});

describe("Multi-Tenant Organization Registration", () => {
  it("provisions a corporate organization with proper settings and ORG_ADMIN membership", () => {
    const corporateOrg = multiTenantStore.createOrganization({
      name: "Global Quantum Dynamics",
      slug: "global-quantum-dynamics",
      type: "CORPORATE",
      official_email: "hr@globalquantum.com",
      country: "India",
      size: "51-200 Employees",
      industry_or_category: "Software & IT Services",
      description: "Next-generation quantum cloud software engineering.",
      joining_policy: "REQUEST_APPROVAL",
      allowed_email_domains: ["@globalquantum.com"],
      settings: {
        workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        expectedDailyHours: 8,
        gracePeriodMinutes: 15,
        allowedBreakMinutes: 60,
        timeZone: "Asia/Kolkata",
        dateFormat: "DD/MM/YYYY",
        primaryColor: "#2563EB",
        requireReportReview: true,
        autoApproveAttendance: false,
        requireDocumentApproval: true,
      },
    });

    expect(corporateOrg.id).toBeDefined();
    expect(corporateOrg.type).toBe("CORPORATE");
    expect(corporateOrg.code).toMatch(/^[A-Z0-9-]+$/);

    const membership = multiTenantStore.addMembership({
      organization_id: corporateOrg.id,
      user_id: "usr-corp-admin-test",
      role: "ORG_ADMIN",
      member_type: "ADMIN",
      status: "ACTIVE",
      job_title: "Head of Talent & Engineering",
      user_full_name: "Vikram Malhotra",
      user_email: "hr@globalquantum.com",
      joined_at: new Date().toISOString(),
    });

    expect(membership.role).toBe("ORG_ADMIN");
    expect(membership.organization_id).toBe(corporateOrg.id);

    const orgMembers = multiTenantStore.getMemberships(corporateOrg.id);
    expect(orgMembers.some((m) => m.user_email === "hr@globalquantum.com")).toBe(true);
  });

  it("provisions an educational institute portal with proper academic isolation", () => {
    const instituteOrg = multiTenantStore.createOrganization({
      name: "Imperial Polytechnic University",
      slug: "imperial-polytechnic",
      type: "EDUCATIONAL",
      official_email: "dean@imperialpoly.edu",
      country: "India",
      size: "5,000 - 15,000 Students",
      industry_or_category: "Autonomous Engineering College",
      description: "Accredited higher education technical institute.",
      joining_policy: "REQUEST_APPROVAL",
      allowed_email_domains: ["@imperialpoly.edu"],
      settings: {
        workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        expectedDailyHours: 8,
        gracePeriodMinutes: 15,
        allowedBreakMinutes: 60,
        timeZone: "Asia/Kolkata",
        dateFormat: "DD/MM/YYYY",
        primaryColor: "#4F46E5",
        requireReportReview: true,
        autoApproveAttendance: false,
        requireDocumentApproval: true,
      },
    });

    expect(instituteOrg.type).toBe("EDUCATIONAL");
    expect(instituteOrg.name).toBe("Imperial Polytechnic University");

    const deanMembership = multiTenantStore.addMembership({
      organization_id: instituteOrg.id,
      user_id: "usr-dean-test",
      role: "ORG_ADMIN",
      member_type: "ADMIN",
      status: "ACTIVE",
      job_title: "Dean of Academic Internships",
      user_full_name: "Dr. David Kumar",
      user_email: "dean@imperialpoly.edu",
      joined_at: new Date().toISOString(),
    });

    expect(deanMembership.role).toBe("ORG_ADMIN");
    expect(deanMembership.organization_id).toBe(instituteOrg.id);
  });
});
