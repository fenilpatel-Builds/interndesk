import { describe, it, expect } from "vitest";
import { multiTenantStore } from "../src/lib/multitenant/store";
import { credentialsStore } from "../src/lib/auth/credentials-store";
import { otpStore } from "../src/lib/auth/otp-store";

describe("Akash Technolabs Integration & Accounts", () => {
  it("should have Akash Technolabs configured in multiTenantStore", () => {
    const org = multiTenantStore.getOrganizationById("org-akash-01");
    expect(org).toBeDefined();
    expect(org?.name).toBe("Akash Technolabs");
    expect(org?.slug).toBe("akash-technolabs");
    expect(org?.code).toBe("ORG-AKASH8");
    expect(org?.official_email).toBe("info@akashtechnolabs.com");
    expect(org?.contact_number).toBe("+91 99786 21654");
    expect(org?.website).toBe("https://akashtechnolabs.com");
    expect(org?.branding?.signatoryName).toBe("Akash Padhiyar");
    expect(org?.branding?.signatoryTitle).toBe("CEO");
    expect(org?.branding?.address).toContain("202, Aarya Arcade");
  });

  it("should authenticate Akash Padhiyar (CEO/Admin) and student intern accounts", () => {
    // 1. Admin login
    const adminAcc = credentialsStore.authenticate("akash@akashtechnolabs.com", "password123");
    expect(adminAcc).not.toBeNull();
    expect(adminAcc?.name).toBe("Akash Padhiyar");
    expect(adminAcc?.role).toBe("ORG_ADMIN");
    expect(adminAcc?.organizationId).toBe("org-akash-01");

    // 2. Fenil Patel (AI/ML Intern)
    const fenilAcc = credentialsStore.authenticate("fenil.patel@akashtechnolabs.com", "student123");
    expect(fenilAcc).not.toBeNull();
    expect(fenilAcc?.name).toBe("Fenil Patel");
    expect(fenilAcc?.role).toBe("STUDENT");
    expect(fenilAcc?.organizationId).toBe("org-akash-01");

    // 3. Priya Sharma (Full Stack Intern)
    const priyaAcc = credentialsStore.findByEmail("priya.sharma@akashtechnolabs.com");
    expect(priyaAcc).toBeDefined();
    expect(priyaAcc?.name).toBe("Priya Sharma");
    expect(priyaAcc?.role).toBe("STUDENT");

    // 4. Fenil Patel (huntarmy001@gmail.com)
    const huntAcc = credentialsStore.findByEmail("huntarmy001@gmail.com");
    expect(huntAcc).toBeDefined();
    expect(huntAcc?.name).toBe("Fenil Patel");
    expect(huntAcc?.role).toBe("STUDENT");
  });

  it("should have official offer letter matching the provided PDF format for Fenil Patel", () => {
    const doc = multiTenantStore.findDocumentByNumber("ID-AKT-2026-0701");
    expect(doc).toBeDefined();
    expect(doc?.recipient_name).toBe("Mr. Fenil Patel");
    expect(doc?.recipient_role).toBe("AI/ML Intern");
    expect(doc?.document_type).toBe("OFFER_LETTER");
    expect(doc?.status).toBe("ISSUED");
    expect(doc?.issued_date).toBe("01-07-2026");
    expect(doc?.template_data?.organization_name).toBe("Akash Technolabs");
    expect(doc?.template_data?.signatory_name).toBe("Akash Padhiyar");
    expect(doc?.template_data?.signatory_title).toBe("CEO");
    expect(doc?.template_data?.commencement_date).toBe("3rd July 2026");
    expect(doc?.template_data?.continue_until_date).toBe("30th April 2027");
    expect(doc?.template_data?.organization_address).toContain("202, Aarya Arcade");
    expect(doc?.template_data?.contact_email).toBe("info@akashtechnolabs.com");
    expect(doc?.template_data?.contact_phone).toBe("+91 99786 21654");
  });

  it("should have active memberships in store for the new accounts", () => {
    const members = multiTenantStore.getMemberships("org-akash-01");
    expect(members.length).toBeGreaterThanOrEqual(4);

    const fenilMem = members.find((m) => m.user_email === "fenil.patel@akashtechnolabs.com");
    expect(fenilMem).toBeDefined();
    expect(fenilMem?.job_title).toBe("AI/ML Intern");

    const adminMem = members.find((m) => m.user_email === "akash@akashtechnolabs.com");
    expect(adminMem).toBeDefined();
    expect(adminMem?.role).toBe("ORG_ADMIN");
  });

  it("should generate, verify OTP and enforce RBAC routing for students and admins", () => {
    // 1. Generate & verify OTP for Student
    const studentEmail = "priya.sharma@akashtechnolabs.com";
    const studentOtp = otpStore.generate(studentEmail);
    expect(studentOtp).toMatch(/^\d{6}$/);

    const studentVerify = otpStore.verify(studentEmail, studentOtp);
    expect(studentVerify.valid).toBe(true);

    const studentAccount = credentialsStore.findByEmail(studentEmail);
    expect(studentAccount?.role).toBe("STUDENT");

    // 2. Generate & verify OTP for Admin
    const adminEmail = "akash@akashtechnolabs.com";
    const adminOtp = otpStore.generate(adminEmail);
    expect(adminOtp).toMatch(/^\d{6}$/);

    const adminVerify = otpStore.verify(adminEmail, adminOtp);
    expect(adminVerify.valid).toBe(true);

    const adminAccount = credentialsStore.findByEmail(adminEmail);
    expect(adminAccount?.role).toBe("ORG_ADMIN");
  });

  it("should detect female candidates accurately and derive correct track technologies", async () => {
    const { isFemaleCandidate, deriveTrackTechnology, generateAkashOfferLetterPdf } = await import(
      "../src/lib/documents/akash-pdf-generator"
    );

    // 1. Female candidate detection
    expect(isFemaleCandidate("Ms. Priya Sharma")).toBe(true);
    expect(isFemaleCandidate("Priya Sharma")).toBe(true);
    expect(isFemaleCandidate("Neha Patel")).toBe(true);
    expect(isFemaleCandidate("Pooja Shah")).toBe(true);
    expect(isFemaleCandidate("Ananya Desai")).toBe(true);
    expect(isFemaleCandidate("Fenil Patel")).toBe(false);
    expect(isFemaleCandidate("Mr. Fenil Patel")).toBe(false);
    expect(isFemaleCandidate("Aarav Sharma")).toBe(false);

    // 2. Track technology synchronization
    expect(deriveTrackTechnology("PHP / Laravel Developer Intern")).toBe("PHP / Laravel");
    expect(deriveTrackTechnology("AI/ML Intern")).toBe("AI/ML");
    expect(deriveTrackTechnology("Python Developer Intern")).toBe("Python");
    expect(deriveTrackTechnology("Quality Assurance (QA) Intern")).toBe("Software Testing & QA");
    expect(deriveTrackTechnology("Full Stack Web Developer Intern")).toBe("Full Stack Web Development");
    expect(deriveTrackTechnology("Cybersecurity Intern")).toBe("Cybersecurity");

    // 3. Generate official PDF for female candidate with PHP / Laravel position
    const pdfBytes = await generateAkashOfferLetterPdf({
      salutation: "Ms.",
      studentName: "Ms. Priya Sharma",
      internshipPosition: "PHP / Laravel Developer Intern",
      commencementDate: "3rd July 2026",
      continueUntilDate: "30th April 2027",
      letterDate: "30-10-2026",
    });

    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(1000);
  });
});
