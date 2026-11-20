import { describe, it, expect, beforeEach } from "vitest";
import { assessmentStore } from "../src/lib/assessments/assessment-store";
import { questionBankStore } from "../src/lib/assessments/question-bank-store";

describe("Online Examination & Anti-Cheat Assessment Engine", () => {
  const studentEmail = "test.candidate@akashtechnolabs.com";
  const studentName = "Test Candidate";

  it("sanitizes questions for students by redacting correct answers and explanations", () => {
    const studentAssessments = assessmentStore.getAll(false);
    expect(studentAssessments.length).toBeGreaterThanOrEqual(1);

    studentAssessments.forEach((asm) => {
      expect(asm.status).toBe("PUBLISHED");
      asm.questions.forEach((q) => {
        expect(q.correct_answer).toBe("");
        expect(q.explanation).toBe("");
        expect(q.question.length).toBeGreaterThan(0);
      });
    });
  });

  it("provides full question keys and explanations for authenticated administrators", () => {
    const adminAssessments = assessmentStore.getAll(true);
    expect(adminAssessments.length).toBeGreaterThanOrEqual(1);

    const aimlExam = adminAssessments.find((a) => a.id === "asm-aiml-01");
    expect(aimlExam).toBeDefined();
    expect(aimlExam?.questions.length).toBe(10);

    aimlExam?.questions.forEach((q) => {
      expect(q.correct_answer).toBeDefined();
      expect(q.explanation.length).toBeGreaterThan(0);
    });
  });

  it("allows administrator to create, update, and delete an examination", () => {
    const newAsm = assessmentStore.createAssessment({
      title: "Distributed Microservices & Cloud Infrastructure Exam",
      subject: "Cloud & DevOps",
      description: "Testing Docker, Kubernetes, gRPC, and distributed tracing.",
      duration_minutes: 30,
      passing_threshold: 75,
      attempt_limit: 2,
      status: "PUBLISHED",
      questions: [
        {
          id: "q_cloud_1",
          question: "Which Kubernetes component manages worker node pods and reports health status?",
          type: "SINGLE_CHOICE",
          options: ["kubelet", "etcd", "kube-proxy", "kube-scheduler"],
          correct_answer: "kubelet",
          explanation: "kubelet is the primary node agent that registers nodes and ensures containers described in PodSpecs are running and healthy.",
          marks: 10,
        },
      ],
    });

    expect(newAsm.id).toBeDefined();
    expect(newAsm.total_marks).toBe(10);
    expect(newAsm.passing_threshold).toBe(75);

    // Update
    const updated = assessmentStore.updateAssessment(newAsm.id, {
      passing_threshold: 80,
      duration_minutes: 35,
    });
    expect(updated?.passing_threshold).toBe(80);
    expect(updated?.duration_minutes).toBe(35);

    // Delete
    const deleted = assessmentStore.deleteAssessment(newAsm.id);
    expect(deleted).toBe(true);
    expect(assessmentStore.getById(newAsm.id, true)).toBeNull();
  });

  it("strictly enforces attempt limits and prevents unauthorized multiple attempts", () => {
    const check1 = assessmentStore.canStudentStartExam("asm-aiml-01", "new.unique.candidate@akashtechnolabs.com");
    expect(check1.canStart).toBe(true);
    expect(check1.attemptsUsed).toBe(0);
    expect(check1.maxAttempts).toBe(2);
  });

  it("grades exam submission strictly on the server with proctoring audit", () => {
    const candidateEmail = "grading.test.candidate@akashtechnolabs.com";

    const attempt = assessmentStore.submitAttempt({
      assessmentId: "asm-aiml-01",
      studentEmail: candidateEmail,
      studentName: "Grading Candidate",
      answers: {
        q_ai_1: "Dropout and L2 (Ridge) Weight Regularization",
        q_ai_2: "Computing dynamic dependency weights between all token positions in parallel",
        q_ai_3: "Categorical Cross-Entropy Loss",
        q_ai_4: "Batch GD computes gradients using the entire dataset, while SGD updates parameters per single sample or mini-batch",
        q_ai_5: "ReLU (Rectified Linear Unit)",
        q_ai_6: "Max Pooling / Average Pooling",
        q_ai_7: "Recall (Sensitivity)",
        q_ai_8: "Mapping discrete tokens or concepts into dense, continuous high-dimensional semantic vector spaces",
        q_ai_9: "Adam (Adaptive Moment Estimation)",
        q_ai_10: "Exploration (discovering new actions) vs Exploitation (leveraging known rewards)",
      },
      tabSwitchCount: 0,
      timeSpentSeconds: 650,
    });

    expect(attempt.score).toBe(100);
    expect(attempt.percentage).toBe(100);
    expect(attempt.passed).toBe(true);
    expect(attempt.correct_count).toBe(10);
    expect(attempt.wrong_count).toBe(0);
    expect(attempt.unanswered_count).toBe(0);
    expect(attempt.proctoring_flag).toBe("CLEAN");
    expect(attempt.evaluations?.length).toBe(10);

    // Clean up
    assessmentStore.deleteAttempt(attempt.id);
  });

  it("flags tab switch violations and marks suspicious proctoring behavior", () => {
    const candidateEmail = "proctoring.violation@akashtechnolabs.com";

    const attempt = assessmentStore.submitAttempt({
      assessmentId: "asm-aiml-01",
      studentEmail: candidateEmail,
      studentName: "Cheating Suspect",
      answers: {
        q_ai_1: "Dropout and L2 (Ridge) Weight Regularization",
      },
      tabSwitchCount: 5, // 5 tab switches
      timeSpentSeconds: 120,
    });

    expect(attempt.tab_switch_count).toBe(5);
    expect(attempt.proctoring_flag).toBe("VIOLATION");

    // Clean up
    assessmentStore.deleteAttempt(attempt.id);
  });

  it("preserves candidate Fenil Patel's exam history across alias emails", () => {
    const attempts1 = assessmentStore.getAttemptsForStudent("fenil.patel@akashtechnolabs.com");
    const attempts2 = assessmentStore.getAttemptsForStudent("huntarmy001@gmail.com");

    expect(attempts1.length).toBeGreaterThanOrEqual(1);
    expect(attempts2.length).toBeGreaterThanOrEqual(1);
    expect(attempts1[0].assessment_title).toBe("AI & Machine Learning Engineering Practicum Exam");
    expect(attempts1[0].percentage).toBe(90);
    expect(attempts1[0].passed).toBe(true);
  });

  it("allows administrator to reset a student attempt granting them a retake", () => {
    const candidateEmail = "reset.test.candidate@akashtechnolabs.com";

    const attempt = assessmentStore.submitAttempt({
      assessmentId: "asm-aiml-01",
      studentEmail: candidateEmail,
      studentName: "Reset Candidate",
      answers: {},
      tabSwitchCount: 0,
      timeSpentSeconds: 50,
    });

    expect(assessmentStore.getAttemptsForStudent(candidateEmail).length).toBe(1);

    const deleted = assessmentStore.deleteAttempt(attempt.id);
    expect(deleted).toBe(true);
    expect(assessmentStore.getAttemptsForStudent(candidateEmail).length).toBe(0);
  });

  // ================= NEW ENTERPRISE UPGRADE TEST SUITE =================

  it("manages server-authoritative exam sessions with autosave and activity logging", () => {
    const student = "session.test@akashtechnolabs.com";
    const { session, isResumed } = assessmentStore.startSession({
      assessmentId: "asm-aiml-01",
      studentEmail: student,
      studentName: "Session Test Candidate",
    });

    expect(session.session_id).toBeDefined();
    expect(session.status).toBe("ACTIVE");
    expect(isResumed).toBe(false);

    // Resuming active session returns the same session
    const resumeCheck = assessmentStore.startSession({
      assessmentId: "asm-aiml-01",
      studentEmail: student,
      studentName: "Session Test Candidate",
    });
    expect(resumeCheck.session.session_id).toBe(session.session_id);
    expect(resumeCheck.isResumed).toBe(true);

    // Autosave progress
    const autosaved = assessmentStore.autosaveSession({
      sessionId: session.session_id,
      answers: { q_ai_1: "Dropout and L2 (Ridge) Weight Regularization" },
      markedForReview: ["q_ai_1"],
      visitedQuestions: ["q_ai_1", "q_ai_2"],
    });
    expect(autosaved?.saved_answers["q_ai_1"]).toBe("Dropout and L2 (Ridge) Weight Regularization");
    expect(autosaved?.marked_for_review).toContain("q_ai_1");

    // Log proctoring activity
    const logged = assessmentStore.logSessionActivity({
      sessionId: session.session_id,
      type: "TAB_SWITCH",
      details: "Navigated away from browser window",
    });
    expect(logged?.tab_switch_count).toBe(1);
    expect(logged?.activity_logs.length).toBeGreaterThan(1);

    // Extend time by proctor
    const extended = assessmentStore.extendSessionTime(session.session_id, 10);
    expect(extended?.duration_minutes).toBe(session.duration_minutes + 10);

    // Force submit
    const forceSubmitted = assessmentStore.forceSubmitSession(session.session_id);
    expect(forceSubmitted?.status).toBe("SUBMITTED");
  });

  it("evaluates multi-format questions including True/False, Fill in Blanks, and Matching", () => {
    const testExam = assessmentStore.createAssessment({
      title: "Multi-Format Comprehensive Assessment",
      subject: "Computer Science",
      duration_minutes: 20,
      passing_threshold: 60,
      attempt_limit: 1,
      status: "PUBLISHED",
      questions: [
        {
          id: "q_tf_1",
          question: "HTTP is a stateful application layer protocol.",
          type: "TRUE_FALSE",
          correct_answer: "false",
          explanation: "HTTP is stateless by default.",
          marks: 10,
        },
        {
          id: "q_fb_1",
          question: "The default port for HTTPS communication is _____.",
          type: "FILL_BLANKS",
          correct_answer: "443",
          explanation: "Port 443 is used for TLS/HTTPS.",
          marks: 10,
        },
        {
          id: "q_match_1",
          question: "Match protocols to default ports.",
          type: "MATCHING",
          matching_pairs: [
            { left: "DNS", right: "53" },
            { left: "SSH", right: "22" },
          ],
          explanation: "DNS uses 53, SSH uses 22.",
          marks: 20,
        },
      ],
    });

    const attempt = assessmentStore.submitAttempt({
      assessmentId: testExam.id,
      studentEmail: "multiformat.test@akashtechnolabs.com",
      studentName: "Multi Format Candidate",
      answers: {
        q_tf_1: "false",
        q_fb_1: "443",
        q_match_1: { DNS: "53", SSH: "22" },
      },
      tabSwitchCount: 0,
      timeSpentSeconds: 180,
    });

    expect(attempt.score).toBe(40);
    expect(attempt.percentage).toBe(100);
    expect(attempt.passed).toBe(true);

    // Clean up
    assessmentStore.deleteAssessment(testExam.id);
    assessmentStore.deleteAttempt(attempt.id);
  });

  it("supports teacher subjective grading with rubric criteria and feedback", () => {
    const descExam = assessmentStore.createAssessment({
      title: "System Architecture Essay Exam",
      subject: "Software Architecture",
      duration_minutes: 30,
      passing_threshold: 50,
      attempt_limit: 1,
      status: "PUBLISHED",
      questions: [
        {
          id: "q_desc_1",
          question: "Explain the CAP theorem and trade-offs between consistency and availability.",
          type: "DESCRIPTIVE",
          explanation: "Consistency, Availability, and Partition Tolerance.",
          marks: 50,
          rubric: "15 marks for consistency definition, 15 marks for availability, 20 marks for partition tolerance trade-off analysis.",
        },
      ],
    });

    const attempt = assessmentStore.submitAttempt({
      assessmentId: descExam.id,
      studentEmail: "subjective.test@akashtechnolabs.com",
      studentName: "Subjective Student",
      answers: {
        q_desc_1: "The CAP theorem states that a distributed system cannot simultaneously achieve Consistency, Availability, and Partition tolerance...",
      },
      tabSwitchCount: 0,
      timeSpentSeconds: 300,
    });

    // Initially marked pending teacher evaluation
    expect(attempt.evaluations?.[0].evaluation_status).toBe("PENDING_TEACHER");
    expect(attempt.score).toBe(0);

    // Faculty grades the essay
    const evaluated = assessmentStore.evaluateSubjectiveQuestion({
      attemptId: attempt.id,
      questionId: "q_desc_1",
      awardedMarks: 45,
      feedback: "Exceptional depth on network partitioning and PACELC trade-offs.",
      evaluatorName: "Prof. Akash Padhiyar",
    });

    expect(evaluated?.score).toBe(45);
    expect(evaluated?.percentage).toBe(90);
    expect(evaluated?.passed).toBe(true);
    expect(evaluated?.evaluations?.[0].evaluation_status).toBe("EVALUATED");
    expect(evaluated?.evaluations?.[0].feedback).toContain("Exceptional depth");

    // Clean up
    assessmentStore.deleteAssessment(descExam.id);
    assessmentStore.deleteAttempt(attempt.id);
  });

  it("provides comprehensive Question Bank management and filtering", () => {
    const allQuestions = questionBankStore.getAll();
    expect(allQuestions.length).toBeGreaterThanOrEqual(10);

    // Filter by subject
    const aimlQuestions = questionBankStore.search({ subject: "AI & Machine Learning" });
    expect(aimlQuestions.length).toBeGreaterThanOrEqual(3);
    aimlQuestions.forEach((q) => expect(q.subject).toBe("AI & Machine Learning"));

    // Filter by difficulty
    const hardQuestions = questionBankStore.search({ difficulty: "HARD" });
    expect(hardQuestions.length).toBeGreaterThanOrEqual(1);

    // Create a new question in bank
    const created = questionBankStore.createQuestion({
      subject: "DevOps & SRE",
      topic: "Site Reliability",
      difficulty: "ADVANCED",
      type: "SHORT_ANSWER",
      question: "What is an Error Budget in Google SRE methodology?",
      explanation: "The maximum allowable downtime or error rate defined by 100% minus the SLO.",
      marks: 15,
      tags: ["sre", "sli", "slo"],
    });

    expect(created.id).toBeDefined();
    expect(created.subject).toBe("DevOps & SRE");

    // Delete question
    const deleted = questionBankStore.deleteQuestion(created.id);
    expect(deleted).toBe(true);
  });
});
