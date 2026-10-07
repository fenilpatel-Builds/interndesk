import { describe, it, expect } from "vitest";
import { registrationSchema } from "../src/validations/registration";

describe("Registration Schema Business Rules", () => {
  const validData = {
    fullName: "Aarav Sharma",
    email: "aarav@college.edu",
    mobile: "9876543210",
    dateOfBirth: "2002-05-15",
    address: "123 Campus Road, Tech City",
    college: "National Institute of Technology",
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
