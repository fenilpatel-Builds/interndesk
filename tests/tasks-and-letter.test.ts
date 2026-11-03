import { describe, it, expect } from "vitest";
import { taskStore } from "../src/lib/tasks/task-store";
import { documentStore } from "../src/lib/documents/document-store";
import { liveAttendanceStore } from "../src/lib/attendance/live-attendance-store";

describe("One-Time Internship Letter Issuance & Re-Request Gate", () => {
  const testStudentEmail = `test_student_${Date.now()}_${Math.random().toString(36).substring(2, 7)}@akashtechnolabs.com`;

  it("permits initial one-time internship letter request and records issuance", () => {
    // Ensure clean state for test student
    expect(documentStore.hasStudentRequestedInternshipLetter(testStudentEmail)).toBe(false);

    const doc = documentStore.requestOneTimeInternshipLetter({
      studentEmail: testStudentEmail,
      studentName: "Test Student",
      technology: "AI & Machine Learning",
      salutation: "Mr.",
    });

    expect(doc).toBeDefined();
    expect(doc.document_type).toBe("INTERNSHIP_LETTER");
    expect(doc.recipient_name).toContain("Test Student");
    expect(doc.verification_code).toMatch(/^VRF-AKT-/);
    expect(documentStore.hasStudentRequestedInternshipLetter(testStudentEmail)).toBe(true);
  });

  it("strictly throws an error if student attempts to request letter a second time", () => {
    expect(documentStore.hasStudentRequestedInternshipLetter(testStudentEmail)).toBe(true);

    expect(() => {
      documentStore.requestOneTimeInternshipLetter({
        studentEmail: testStudentEmail,
        studentName: "Test Student",
        technology: "AI & Machine Learning",
        salutation: "Mr.",
      });
    }).toThrow(/Single-Issuance Policy/i);
  });
});

describe("Private & Group Task Delegation Scoping", () => {
  const studentAlpha = "student_alpha@test.com";
  const studentBeta = "student_beta@test.com";
  const studentGamma = "student_gamma@test.com";

  let privateTaskAlphaId = "";
  let groupTaskId = "";

  it("allows creating an individual private task for Student Alpha", () => {
    const task = taskStore.createTask({
      title: "Private Alpha Security Review",
      description: "Review encrypted credentials pipeline.",
      priority: "HIGH",
      dueAt: "2026-11-20",
      technology: "TypeScript & Crypto",
      assignedToEmail: studentAlpha,
      assignedToName: "Student Alpha",
      isGroupTask: false,
      createdBy: "Akash Padhiyar (CEO)",
    });

    expect(task.id).toBeDefined();
    expect(task.isGroupTask).toBe(false);
    expect(task.progress).toBe(0);
    privateTaskAlphaId = task.id;
  });

  it("allows creating a group project task for Alpha and Beta only", () => {
    const task = taskStore.createTask({
      title: "Squad Alpha & Beta Microservices Architecture",
      description: "Design cross-service gRPC interfaces.",
      priority: "URGENT",
      dueAt: "2026-11-30",
      technology: "Go & Docker",
      assignedToEmail: studentAlpha,
      assignedToName: "Student Alpha",
      isGroupTask: true,
      groupName: "Alpha-Beta Squad",
      groupMembers: [studentAlpha, studentBeta],
      createdBy: "Akash Padhiyar (CEO)",
    });

    expect(task.isGroupTask).toBe(true);
    expect(task.groupMembers).toContain(studentAlpha);
    expect(task.groupMembers).toContain(studentBeta);
    groupTaskId = task.id;
  });

  it("enforces private scoping: Student Alpha sees private task and group task", () => {
    const alphaTasks = taskStore.getTasksForUser(studentAlpha, "STUDENT");
    expect(alphaTasks.some((t) => t.id === privateTaskAlphaId)).toBe(true);
    expect(alphaTasks.some((t) => t.id === groupTaskId)).toBe(true);
  });

  it("enforces private scoping: Student Beta sees group task but NOT Student Alpha's private task", () => {
    const betaTasks = taskStore.getTasksForUser(studentBeta, "STUDENT");
    expect(betaTasks.some((t) => t.id === privateTaskAlphaId)).toBe(false); // Strictly hidden!
    expect(betaTasks.some((t) => t.id === groupTaskId)).toBe(true); // Group task visible!
  });

  it("enforces private scoping: Student Gamma sees NEITHER task", () => {
    const gammaTasks = taskStore.getTasksForUser(studentGamma, "STUDENT");
    expect(gammaTasks.some((t) => t.id === privateTaskAlphaId)).toBe(false);
    expect(gammaTasks.some((t) => t.id === groupTaskId)).toBe(false);
  });

  it("allows group members to update progress and automatically updates status", () => {
    const updated = taskStore.updateTaskProgress(groupTaskId, {
      progress: 75,
      status: "IN_PROGRESS",
      completionNotes: "API definitions drafted.",
    });

    expect(updated).toBeDefined();
    expect(updated?.progress).toBe(75);
    expect(updated?.status).toBe("IN_PROGRESS");
    expect(updated?.completionNotes).toBe("API definitions drafted.");
  });
});

describe("Live Clock In / Clock Out Attendance Store", () => {
  const liveEmail = "live_tracker_student@akashtechnolabs.com";

  it("registers student and records live clock-in status", () => {
    const attendance = liveAttendanceStore.updateStudentStatus(liveEmail, {
      status: "WORKING",
      clockInTime: "09:30 AM",
      location: "Akash Technolabs — Ahmedabad Campus",
    });

    expect(attendance).toBeDefined();
    expect(attendance?.status).toBe("WORKING");
    expect(attendance?.clockInTime).toBe("09:30 AM");
  });

  it("records break punch and updates status to ON_BREAK", () => {
    const onBreak = liveAttendanceStore.updateStudentStatus(liveEmail, {
      status: "ON_BREAK",
      currentBreak: "Lunch Break",
    });

    expect(onBreak).toBeDefined();
    expect(onBreak?.status).toBe("ON_BREAK");
    expect(onBreak?.currentBreak).toBe("Lunch Break");
  });

  it("records clock-out and updates status to COMPLETED", () => {
    const completed = liveAttendanceStore.updateStudentStatus(liveEmail, {
      status: "COMPLETED",
      clockOutTime: "06:00 PM",
      workedMinutes: 480,
    });

    expect(completed).toBeDefined();
    expect(completed?.status).toBe("COMPLETED");
    expect(completed?.clockOutTime).toBe("06:00 PM");
    expect(completed?.workedMinutes).toBe(480);
  });
});
