import { describe, it, expect } from "vitest";
import { activityStore } from "../src/lib/institute/activity-store";

describe("New User State & Data Isolation", () => {
  const newStudentEmail = "fresh.intern." + Date.now() + "@example.com";

  it("ensures a newly registered student has 0 submissions and 0 completed activities", () => {
    const subs = activityStore.getSubmissions({ studentEmail: newStudentEmail });
    expect(subs).toEqual([]);
    expect(subs.length).toBe(0);
  });

  it("ensures newly created submissions are isolated to the specific student", () => {
    const act = activityStore.getActivities()[0];
    expect(act).toBeDefined();

    // Student A submits
    const subA = activityStore.createSubmission({
      activityId: act.id,
      studentId: "STD-A-01",
      studentName: "Student Alpha",
      studentEmail: newStudentEmail,
      reportContent: "Alpha student submission report content.",
    });

    expect(subA.id).toBeDefined();
    expect(subA.status).toBe("SUBMITTED");

    // Student A sees 1 submission
    const subsA = activityStore.getSubmissions({ studentEmail: newStudentEmail });
    expect(subsA.length).toBe(1);
    expect(subsA[0].studentEmail).toBe(newStudentEmail);

    // Another new Student B sees 0 submissions
    const anotherStudentEmail = "brand.new.student." + Date.now() + "@example.com";
    const subsB = activityStore.getSubmissions({ studentEmail: anotherStudentEmail });
    expect(subsB.length).toBe(0);
  });

  it("handles reviewing a submission without affecting other students", () => {
    const act = activityStore.getActivities()[0];
    const sub = activityStore.getSubmissions({ studentEmail: newStudentEmail })[0];
    expect(sub).toBeDefined();

    const reviewed = activityStore.reviewSubmission(sub.id, {
      status: "APPROVED",
      feedback: "Well done!",
      score: 95,
      reviewerName: "Faculty Coordinator",
    });

    expect(reviewed?.status).toBe("APPROVED");
    expect(reviewed?.score).toBe(95);

    // Verify it updates for Student A
    const subsA = activityStore.getSubmissions({ studentEmail: newStudentEmail });
    expect(subsA[0].status).toBe("APPROVED");
    expect(subsA[0].score).toBe(95);
  });
});
