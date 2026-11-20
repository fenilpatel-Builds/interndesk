import { describe, it, expect, beforeEach } from "vitest";
import { assessmentStore } from "../src/lib/assessments/assessment-store";

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
        expect(q.options.length).toBeGreaterThanOrEqual(2);
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
      expect(q.correct_answer.length).toBeGreaterThan(0);
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
});
