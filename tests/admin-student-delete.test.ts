import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { credentialsStore } from "../src/lib/auth/credentials-store";
import { liveAttendanceStore } from "../src/lib/attendance/live-attendance-store";
import { taskStore } from "../src/lib/tasks/task-store";
import { activityStore } from "../src/lib/institute/activity-store";
import { documentStore } from "../src/lib/documents/document-store";
import { GET as getStudents, DELETE as deleteStudents } from "../src/app/api/admin/students/route";
import { NextRequest } from "next/server";

describe("Admin Dynamic Student Directory & Delete Operations", () => {
  let testStudentEmail = "";
  let createdStudentId = "";

  beforeEach(() => {
    testStudentEmail = `test_delete_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@akashtechnolabs.com`;
    // Register temporary student
    const account = credentialsStore.register({
      email: testStudentEmail,
      name: "Temporary Student For Delete Test",
      password: "TestPassword123!",
      role: "STUDENT",
      organizationId: "org-akash-01",
      organizationName: "Akash Technolabs",
      organizationType: "CORPORATE",
    });
    createdStudentId = account.id;

    // Add attendance punch
    liveAttendanceStore.updateStudentStatus(testStudentEmail, {
      status: "WORKING",
      clockInTime: "09:00 AM",
    });

    // Assign a task
    taskStore.createTask({
      title: "Test Task To Delete",
      description: "Sample description",
      priority: "MEDIUM",
      dueAt: "2026-11-20",
      technology: "AI/ML Systems",
      assignedToEmail: testStudentEmail,
      assignedToName: "Temporary Student",
      isGroupTask: false,
      createdBy: "Akash Padhiyar",
    });

    // Create an activity submission
    activityStore.createSubmission({
      activityId: "act-akt-01",
      studentId: createdStudentId,
      studentName: "Temporary Student",
      studentEmail: testStudentEmail,
      reportContent: "Test submission content for delete test",
    });

    // Issue an internship letter
    documentStore.requestOneTimeInternshipLetter({
      studentName: "Temporary Student",
      studentEmail: testStudentEmail,
      salutation: "Mr.",
      technology: "AI/ML Systems",
    });
  });

  afterEach(() => {
    if (testStudentEmail) {
      credentialsStore.delete(testStudentEmail);
      liveAttendanceStore.deleteStudent(testStudentEmail);
      taskStore.deleteTasksForStudent(testStudentEmail);
      activityStore.deleteSubmissionsForStudent(testStudentEmail);
      documentStore.deleteDocumentsForStudent(testStudentEmail);
    }
  });

  it("dynamically returns real registered students in GET /api/admin/students", async () => {
    const res = await getStudents();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.students)).toBe(true);

    const found = data.students.find(
      (s: { email: string }) => s.email.toLowerCase() === testStudentEmail.toLowerCase()
    );
    expect(found).toBeDefined();
    expect(found.name).toBe("Temporary Student For Delete Test");
    expect(found.status).toBe("ACTIVE");
    expect(found.attendancePct).toBeGreaterThan(0);
  });

  it("permanently deletes a student by email and purges attendance, tasks, submissions, and documents", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/students", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testStudentEmail }),
    });

    const deleteRes = await deleteStudents(req);
    expect(deleteRes.status).toBe(200);
    const deleteData = await deleteRes.json();
    expect(deleteData.success).toBe(true);
    expect(deleteData.deletedCount).toBeGreaterThanOrEqual(1);

    // Verify removed from credentials
    const foundCred = credentialsStore.findByEmail(testStudentEmail);
    expect(foundCred).toBeNull();

    // Verify removed from live attendance
    const attendanceRecords = liveAttendanceStore.getAll();
    const foundAttendance = attendanceRecords.find(
      (a) => a.studentEmail.toLowerCase() === testStudentEmail.toLowerCase()
    );
    expect(foundAttendance).toBeUndefined();

    // Verify tasks cleared
    const remainingTasks = taskStore.getTasksForUser(testStudentEmail, "STUDENT");
    expect(remainingTasks.length).toBe(0);

    // Verify GET no longer lists the deleted student
    const getRes = await getStudents();
    const getData = await getRes.json();
    const stillPresent = getData.students.find(
      (s: { email: string }) => s.email.toLowerCase() === testStudentEmail.toLowerCase()
    );
    expect(stillPresent).toBeUndefined();
  });

  it("supports bulk deletion of multiple students in a single call", async () => {
    const bulkEmail1 = `bulk1_${Date.now()}@akashtechnolabs.com`;
    const bulkEmail2 = `bulk2_${Date.now()}@akashtechnolabs.com`;

    credentialsStore.register({
      email: bulkEmail1,
      name: "Bulk Student One",
      password: "TestPassword123!",
      role: "STUDENT",
    });

    credentialsStore.register({
      email: bulkEmail2,
      name: "Bulk Student Two",
      password: "TestPassword123!",
      role: "STUDENT",
    });

    const req = new NextRequest("http://localhost:3000/api/admin/students", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails: [bulkEmail1, bulkEmail2] }),
    });

    const res = await deleteStudents(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.deletedCount).toBe(2);

    expect(credentialsStore.findByEmail(bulkEmail1)).toBeNull();
    expect(credentialsStore.findByEmail(bulkEmail2)).toBeNull();
  });
});
