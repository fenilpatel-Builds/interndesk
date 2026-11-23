import { describe, it, expect } from "vitest";
import { generateAIQuestions } from "../src/lib/assessments/ai-question-generator";
import { assessmentStore } from "../src/lib/assessments/assessment-store";

describe("AI Question Generator & Sectional Multi-Part Examination Engine", () => {
  it("generates balanced technical questions from a topic prompt", async () => {
    const result = await generateAIQuestions({
      prompt: "Generate 5 MCQs on React Server Components & PostgreSQL RLS",
      topic: "React & Database Architecture",
      subject: "Full-Stack Web Development",
      difficulty: "MEDIUM",
      count: 5,
      questionType: "SINGLE_CHOICE",
    });

    expect(result.success).toBe(true);
    expect(result.questions.length).toBe(5);

    result.questions.forEach((q) => {
      expect(q.question).toBeDefined();
      expect(q.type).toBe("SINGLE_CHOICE");
      expect(q.options).toBeDefined();
      expect(q.options?.length).toBeGreaterThanOrEqual(4);
      expect(q.options).toContain(q.correct_answer);
      expect(q.marks).toBeGreaterThan(0);
      expect(q.explanation).toBeDefined();
    });
  });

  it("evaluates multi-part exams with independent section cutoffs", () => {
    // Submit attempt on asm-fullstack-02 which has 2 sections
    // Section 1: Part A (Cutoff 60%)
    // Section 2: Part B (Cutoff 70%)
    const attempt = assessmentStore.submitAttempt({
      assessmentId: "asm-fullstack-02",
      studentEmail: "test.candidate@akashtechnolabs.com",
      studentName: "Test Multi-Part Candidate",
      answers: {
        q_fs_1: "RSCs execute exclusively on the server, producing lightweight streamed HTML without shipping component JavaScript to the client bundle",
        q_fs_2: "RLS is enforced at the database engine level, preventing data leakage even if an application query omits tenant filtering",
        q_fs_3: "Type-safe RPC execution directly from components with automatic revalidation and zero boilerplate REST endpoints",
        q_fs_4: "Using authoritative server timestamps and client timestamp deltas (Date.now() - startTime)",
        q_fs_5: "Content-Security-Policy (CSP)",
        q_fs_6: "Reusing database connections across ephemeral function invocations to avoid exhausting PostgreSQL connection limits",
        q_fs_7: "Pre-renders dynamic segment routes at build time for instant static HTML serving",
        q_fs_8: "PUT",
        q_fs_9: "Immediately updating the user interface under the assumption the server mutation will succeed, then rolling back if an error occurs",
        q_fs_10: "Verifying the payload has not been tampered with or modified in transit",
      },
      tabSwitchCount: 0,
      timeSpentSeconds: 600,
    });

    expect(attempt.percentage).toBe(100);
    expect(attempt.passed).toBe(true);
    expect(attempt.section_scores).toBeDefined();

    const secScores = attempt.section_scores!;
    expect(secScores["sec-fs-01"]).toBeDefined();
    expect(secScores["sec-fs-01"].title).toContain("Part A");
    expect(secScores["sec-fs-01"].passed).toBe(true);
    expect(secScores["sec-fs-01"].percentage).toBe(100);

    expect(secScores["sec-fs-02"]).toBeDefined();
    expect(secScores["sec-fs-02"].title).toContain("Part B");
    expect(secScores["sec-fs-02"].passed).toBe(true);

    // Clean up temporary test attempt
    assessmentStore.deleteAttempt(attempt.id);
  });
});
