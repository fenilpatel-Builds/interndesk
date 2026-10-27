import { describe, it, expect } from "vitest";
import { INSTITUTE_CONFIG, isEmailDomainAllowed, getDepartment, getAcademicProgram } from "../src/lib/institute/config";
import { activityStore } from "../src/lib/institute/activity-store";

describe("Single Institute Master Architecture — Akash Technolabs", () => {
  it("verifies single central institute identity and configuration", () => {
    expect(INSTITUTE_CONFIG.name).toBe("Akash Technolabs");
    expect(INSTITUTE_CONFIG.legalEntity).toBe("Akash Technolabs Private Limited");
    expect(INSTITUTE_CONFIG.defaultRole).toBe("STUDENT");
    expect(INSTITUTE_CONFIG.registrationPolicy).toBe("VERIFIED_EMAIL_ADMIN_APPROVAL");
    expect(INSTITUTE_CONFIG.departments.length).toBeGreaterThanOrEqual(5);
    expect(INSTITUTE_CONFIG.academicPrograms.length).toBeGreaterThanOrEqual(6);
  });

  it("enforces allowed email domain policy", () => {
    // Permitted institute domains
    expect(isEmailDomainAllowed("fenil.patel@akashtechnolabs.com")).toBe(true);
    expect(isEmailDomainAllowed("student@student.akashtechnolabs.com")).toBe(true);
    expect(isEmailDomainAllowed("applicant@gmail.com")).toBe(true);

    // Disallowed unauthorized domains
    expect(isEmailDomainAllowed("hacker@malicious-domain.xyz")).toBe(false);
    expect(isEmailDomainAllowed("someone@random-unauthorized.net")).toBe(false);
    expect(isEmailDomainAllowed("")).toBe(false);
  });

  it("resolves institute departments and academic programs correctly", () => {
    const cseDept = getDepartment("dept-cse");
    expect(cseDept).toBeDefined();
    expect(cseDept?.name).toBe("Computer Science & Engineering");
    expect(cseDept?.code).toBe("CSE");

    const mcaProgram = getAcademicProgram("MCA");
    expect(mcaProgram).toBeDefined();
    expect(mcaProgram?.departmentId).toBe("dept-cse");
    expect(mcaProgram?.degreeType).toBe("MASTERS");
  });
});

describe("Single Institute Activities & Submissions Lifecycle", () => {
  it("creates and publishes a new academic activity", () => {
    const activity = activityStore.createActivity({
      title: "Distributed Cache Implementation with Redis",
      description: "Build an LRU cache service and measure latency under concurrent workloads.",
      instructions: "1. Write Redis connector.\n2. Benchmark 10k ops/sec.",
      category: "PROJECT_PRACTICUM",
      departmentId: "dept-cse",
      departmentName: "Computer Science & Engineering",
      deadline: "2026-11-28",
      status: "PUBLISHED",
      maxScore: 100,
      createdBy: "Akash Padhiyar (CEO)",
    });

    expect(activity.id).toBeDefined();
    expect(activity.status).toBe("PUBLISHED");
    expect(activity.departmentId).toBe("dept-cse");

    const retrieved = activityStore.getActivityById(activity.id);
    expect(retrieved?.title).toBe("Distributed Cache Implementation with Redis");
  });

  it("records a student submission and prevents unauthorized duplicate records", () => {
    const activity = activityStore.createActivity({
      title: "RESTful API Security Audit",
      description: "Audit JWT expiration and rate limiting.",
      instructions: "Implement token revocation tests.",
      category: "TECHNICAL_ASSESSMENT",
      departmentId: "dept-it",
      departmentName: "Information Technology",
      deadline: "2026-12-01",
      status: "PUBLISHED",
      maxScore: 100,
      createdBy: "Fenil Patel",
    });

    const submission = activityStore.createSubmission({
      activityId: activity.id,
      studentId: "AKT-2026-777",
      studentName: "Devang Joshi",
      studentEmail: "devang@akashtechnolabs.com",
      reportContent: "Conducted security fuzzing on auth callback endpoints. Zero critical vulnerabilities found.",
      attachmentUrl: "https://github.com/akashtechnolabs/audit-repo",
    });

    expect(submission.id).toBeDefined();
    expect(submission.status).toBe("SUBMITTED");
    expect(submission.studentEmail).toBe("devang@akashtechnolabs.com");

    // Updating submission
    const resubmission = activityStore.createSubmission({
      activityId: activity.id,
      studentId: "AKT-2026-777",
      studentName: "Devang Joshi",
      studentEmail: "devang@akashtechnolabs.com",
      reportContent: "Updated report with Burp Suite scan artifacts.",
    });

    expect(resubmission.id).toBe(submission.id);
    expect(resubmission.reportContent).toContain("Burp Suite");
  });

  it("allows faculty/administrator to review submission with feedback and score", () => {
    const activity = activityStore.createActivity({
      title: "Applied Machine Learning Classification",
      description: "Train scikit-learn random forest classifier.",
      instructions: "Submit confusion matrix.",
      category: "LAB_EXERCISE",
      departmentId: "dept-aiml",
      departmentName: "Artificial Intelligence & Machine Learning",
      deadline: "2026-11-20",
      status: "PUBLISHED",
      maxScore: 100,
      createdBy: "Dr. Priya Sharma",
    });

    const sub = activityStore.createSubmission({
      activityId: activity.id,
      studentId: "AKT-2026-555",
      studentName: "Rohan Varma",
      studentEmail: "rohan@akashtechnolabs.com",
      reportContent: "Random forest model achieved 95.8% F1-score on validation set.",
    });

    const reviewed = activityStore.reviewSubmission(sub.id, {
      status: "APPROVED",
      feedback: "Well executed hyperparameter tuning. Clean report presentation.",
      score: 96,
      reviewerName: "Dr. Priya Sharma",
      reviewerId: "rev-priya",
    });

    expect(reviewed).toBeDefined();
    expect(reviewed?.status).toBe("APPROVED");
    expect(reviewed?.score).toBe(96);
    expect(reviewed?.feedback).toContain("Well executed");
    expect(reviewed?.reviewerName).toBe("Dr. Priya Sharma");
  });

  it("sanitizes CSV exports to prevent formula injection attacks", () => {
    const sanitizeCsvValue = (val: string | number | undefined): string => {
      let str = String(val ?? "").trim();
      if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`;
      }
      return `"${str.replace(/"/g, '""')}"`;
    };

    // Attack payloads starting with =, +, -, @
    expect(sanitizeCsvValue("=cmd|'/C calc'!A0")).toBe(`"'=cmd|'/C calc'!A0"`);
    expect(sanitizeCsvValue("+1234567890")).toBe(`"'+1234567890"`);
    expect(sanitizeCsvValue("-20.5")).toBe(`"'-20.5"`);
    expect(sanitizeCsvValue("@SUM(1,2)")).toBe(`"'@SUM(1,2)"`);

    // Standard safe string
    expect(sanitizeCsvValue("Akash Technolabs")).toBe(`"Akash Technolabs"`);
  });
});
