import { describe, it, expect } from "vitest";
import { generateExamCertificatePdf } from "../src/lib/assessments/certificate-pdf-generator";
import {
  formatGradebookRows,
  generateAnalyticsSummary,
  generateQuestionBreakdown,
  buildGradebookWorkbook,
  generateGradebookExcelBuffer,
} from "../src/lib/assessments/gradebook-export";
import { assessmentStore, AssessmentAttempt } from "../src/lib/assessments/assessment-store";

describe("Official PDF Certificate & Gradebook Generation Suite", () => {
  const sampleAttempt: AssessmentAttempt = {
    id: "att_test_cert_001",
    organization_id: "org-akash-01",
    assessment_id: "asm-aiml-01",
    assessment_title: "AI & Machine Learning Engineering Practicum Exam",
    student_email: "fenil.patel@akashtechnolabs.com",
    student_name: "Fenil Patel",
    score: 95,
    total_marks: 100,
    percentage: 95,
    passed: true,
    correct_count: 9,
    wrong_count: 1,
    unanswered_count: 0,
    tab_switch_count: 0,
    fullscreen_exit_count: 0,
    proctoring_flag: "CLEAN",
    time_spent_seconds: 1240,
    started_at: "2026-11-25T10:00:00Z",
    submitted_at: "2026-11-25T10:20:40Z",
    answers: {},
    evaluations: [
      {
        question_id: "q_1",
        question_text: "What is Backpropagation?",
        marks_awarded: 10,
        marks_possible: 10,
        is_correct: true,
        selected_answer: "Gradient calculation algorithm",
        explanation: "Correct explanation",
      },
      {
        question_id: "q_2",
        question_text: "What is Cross-Entropy Loss?",
        marks_awarded: 0,
        marks_possible: 10,
        is_correct: false,
        selected_answer: "L2 norm",
        explanation: "Incorrect",
      },
    ],
  };

  it("should generate a valid PDF byte array with official headers and security hash", async () => {
    const pdfBytes = await generateExamCertificatePdf(sampleAttempt);
    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(1000);

    // Verify PDF Magic Bytes (%PDF-1.)
    const headerString = Buffer.from(pdfBytes.subarray(0, 8)).toString("utf-8");
    expect(headerString).toContain("%PDF");
  });

  it("should format candidate gradebook rows with correct rank, scores, and proctoring telemetry", () => {
    const attemptsList: AssessmentAttempt[] = [
      sampleAttempt,
      {
        ...sampleAttempt,
        id: "att_test_cert_002",
        student_name: "Helly Leuva",
        student_email: "hellyleuva.29@gmail.com",
        score: 85,
        percentage: 85,
        tab_switch_count: 1,
        proctoring_flag: "SUSPICIOUS",
      },
    ];

    const rows = formatGradebookRows(attemptsList);
    expect(rows).toHaveLength(2);

    // Rank 1 should be Fenil Patel (95 > 85)
    expect(rows[0]["Rank"]).toBe(1);
    expect(rows[0]["Candidate Name"]).toBe("Fenil Patel");
    expect(rows[0]["Score"]).toBe(95);
    expect(rows[0]["Percentage"]).toBe("95%");
    expect(rows[0]["Result"]).toBe("PASSED (DISTINCTION)");
    expect(rows[0]["Proctoring Telemetry"]).toBe("CLEAN");

    // Rank 2 should be Helly Leuva
    expect(rows[1]["Rank"]).toBe(2);
    expect(rows[1]["Candidate Name"]).toBe("Helly Leuva");
    expect(rows[1]["Score"]).toBe(85);
    expect(rows[1]["Tab Switch Alerts"]).toBe(1);
  });

  it("should generate executive cohort analytics and question breakdown", () => {
    const attemptsList: AssessmentAttempt[] = [sampleAttempt];

    const analytics = generateAnalyticsSummary(attemptsList);
    expect(analytics.length).toBeGreaterThan(5);

    const totalSub = analytics.find((r) => r.Metric === "Total Candidate Submissions");
    expect(totalSub?.Value).toBe(1);

    const passRate = analytics.find((r) => r.Metric === "Passing Rate (%)");
    expect(passRate?.Value).toBe("100%");

    const questions = generateQuestionBreakdown(attemptsList);
    expect(questions).toHaveLength(2);
    expect(questions[0]["Correct Answers"]).toBe(1);
    expect(questions[0]["Accuracy Rate"]).toBe("100%");
    expect(questions[1]["Incorrect Answers"]).toBe(1);
    expect(questions[1]["Accuracy Rate"]).toBe("0%");
  });

  it("should build a multi-sheet Excel workbook and binary Buffer", () => {
    const attemptsList: AssessmentAttempt[] = [sampleAttempt];

    const workbook = buildGradebookWorkbook(attemptsList, {
      includeAnalytics: true,
      includeQuestions: true,
    });

    expect(workbook.SheetNames).toContain("Candidate Gradebook");
    expect(workbook.SheetNames).toContain("Executive Analytics");
    expect(workbook.SheetNames).toContain("Question Breakdown");

    const excelBuffer = generateGradebookExcelBuffer(attemptsList);
    expect(excelBuffer).toBeInstanceOf(Buffer);
    expect(excelBuffer.length).toBeGreaterThan(1000);
  });

  it("should record proctor alert messages in active session telemetry", () => {
    // Start or get Helly Leuva's active session
    const { session } = assessmentStore.startSession({
      assessmentId: "asm-uiux-04",
      studentEmail: "hellyleuva.29@gmail.com",
      studentName: "Helly Leuva",
    });

    expect(session).toBeDefined();

    const updated = assessmentStore.sendProctorMessage(
      session.session_id,
      "Proctor Notice: Tab switching detected. Maintain focus on the examination."
    );

    expect(updated).not.toBeNull();
    expect(updated?.proctor_message).toBe("Proctor Notice: Tab switching detected. Maintain focus on the examination.");
    
    // Check that activity log recorded the event
    const lastLog = updated?.activity_logs[updated.activity_logs.length - 1];
    expect(lastLog?.details).toContain("Proctor Alert");
  });

  it("should redact access codes from public student queries", () => {
    // Create an assessment with an access code
    const asm = assessmentStore.createAssessment({
      title: "Secure Certification Exam",
      subject: "Cybersecurity",
      access_code: "SECRET2026",
      shuffle_questions: true,
      shuffle_options: true,
      questions: [
        {
          id: "q_sec_test",
          question: "Test Question?",
          type: "SINGLE_CHOICE",
          options: ["A", "B"],
          correct_answer: "A",
          explanation: "Explanation",
          marks: 10,
        },
      ],
    });

    expect(asm.access_code).toBe("SECRET2026");

    // When student fetches assessment (isAdmin = false)
    const studentAsm = assessmentStore.getById(asm.id, false);
    expect(studentAsm?.access_code).toBeUndefined();
    expect(studentAsm?.has_access_code).toBe(true);
    expect(studentAsm?.questions[0].correct_answer).toBe("");

    // When admin fetches assessment (isAdmin = true)
    const adminAsm = assessmentStore.getById(asm.id, true);
    expect(adminAsm?.access_code).toBe("SECRET2026");
    expect(adminAsm?.questions[0].correct_answer).toBe("A");
  });
});
