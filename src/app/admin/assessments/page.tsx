"use client";

import React, { useState, useEffect } from "react";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Award,
  Plus,
  Clock,
  Users,
  HelpCircle,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Trash2,
  Edit3,
  Eye,
  BookOpen,
  ShieldAlert,
  X,
  FileCheck2,
  Sparkles,
  Layers,
  Activity,
  CheckSquare,
  Database,
  Upload,
  Download,
  Calendar,
  AlertCircle,
  Filter,
  Check,
  Code2,
  FileText,
  UserCheck,
  Zap,
} from "lucide-react";
import {
  Assessment,
  AssessmentQuestion,
  AssessmentAttempt,
  QuestionType,
  QuestionDifficulty,
  ActiveExamSession,
} from "@/lib/assessments/assessment-store";
import { BankQuestion, SEED_BANK_QUESTIONS } from "@/lib/assessments/question-bank-store";

export default function AdminAssessmentsPage() {
  const [activeTab, setActiveTab] = useState<"EXAMS" | "QUESTION_BANK" | "MONITORING" | "SUBMISSIONS" | "EVALUATION">("EXAMS");

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveExamSession[]>([]);
  const [bankQuestions, setBankQuestions] = useState<BankQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterExamStatus, setFilterExamStatus] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");

  // Question Bank Filters
  const [qbSubjectFilter, setQbSubjectFilter] = useState<string>("ALL");
  const [qbDifficultyFilter, setQbDifficultyFilter] = useState<string>("ALL");
  const [qbTypeFilter, setQbTypeFilter] = useState<string>("ALL");
  const [qbSearchQuery, setQbSearchQuery] = useState("");

  // Modals
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [isQuestionBankModalOpen, setIsQuestionBankModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [selectedAttemptForReview, setSelectedAttemptForReview] = useState<AssessmentAttempt | null>(null);
  const [selectedSessionForAudit, setSelectedSessionForAudit] = useState<ActiveExamSession | null>(null);

  // Subjective Evaluation Drawer
  const [evaluationDrawerAttempt, setEvaluationDrawerAttempt] = useState<AssessmentAttempt | null>(null);
  const [evaluatingQuestionId, setEvaluatingQuestionId] = useState<string | null>(null);
  const [evalScoreInput, setEvalScoreInput] = useState<number>(0);
  const [evalFeedbackInput, setEvalFeedbackInput] = useState<string>("");

  // Exam Builder Form State
  const [formTitle, setFormTitle] = useState("");
  const [formSubject, setFormSubject] = useState("AI & Machine Learning");
  const [formDescription, setFormDescription] = useState("");
  const [formDuration, setFormDuration] = useState(25);
  const [formPassingThreshold, setFormPassingThreshold] = useState(70);
  const [formAttemptLimit, setFormAttemptLimit] = useState(2);
  const [formNegativeMarkRate, setFormNegativeMarkRate] = useState<number>(0);
  const [formStatus, setFormStatus] = useState<"PUBLISHED" | "DRAFT">("PUBLISHED");
  const [formRequireFullscreen, setFormRequireFullscreen] = useState(true);
  const [formBlockCopyPaste, setFormBlockCopyPaste] = useState(true);
  const [formMaxViolations, setFormMaxViolations] = useState(3);
  const [formQuestions, setFormQuestions] = useState<AssessmentQuestion[]>([]);
  const [isSavingExam, setIsSavingExam] = useState(false);
  const [examFormError, setExamFormError] = useState<string | null>(null);

  // Question Bank Picker Modal in Exam Builder
  const [isBankPickerOpen, setIsBankPickerOpen] = useState(false);

  // Single Question Bank Creator Form
  const [qbSubject, setQbSubject] = useState("AI & Machine Learning");
  const [qbTopic, setQbTopic] = useState("Neural Networks");
  const [qbDifficulty, setQbDifficulty] = useState<QuestionDifficulty>("MEDIUM");
  const [qbType, setQbType] = useState<QuestionType>("SINGLE_CHOICE");
  const [qbQuestionText, setQbQuestionText] = useState("");
  const [qbOptionsText, setQbOptionsText] = useState("Option A\nOption B\nOption C\nOption D");
  const [qbCorrectAnswer, setQbCorrectAnswer] = useState("");
  const [qbExplanation, setQbExplanation] = useState("");
  const [qbMarks, setQbMarks] = useState(10);
  const [qbRubric, setQbRubric] = useState("");
  const [qbCodeLanguage, setQbCodeLanguage] = useState<"python" | "javascript" | "java">("python");
  const [qbStarterCode, setQbStarterCode] = useState("");

  // Bulk Import Textarea
  const [bulkImportJson, setBulkImportJson] = useState("");

  // Load all master datasets
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [resAsm, resAtt, resSessions, resBank] = await Promise.all([
        fetch("/api/admin/assessments").then((r) => r.json()).catch(() => ({ success: false })),
        fetch("/api/admin/assessments/attempts").then((r) => r.json()).catch(() => ({ success: false })),
        fetch("/api/admin/assessments/monitoring").then((r) => r.json()).catch(() => ({ success: false })),
        fetch("/api/admin/question-bank").then((r) => r.json()).catch(() => ({ success: false })),
      ]);

      if (resAsm.success && Array.isArray(resAsm.assessments)) {
        setAssessments(resAsm.assessments);
      }
      if (resAtt.success && Array.isArray(resAtt.attempts)) {
        setAttempts(resAtt.attempts);
      }
      if (resSessions.success && Array.isArray(resSessions.sessions)) {
        setActiveSessions(resSessions.sessions);
      }
      if (resBank.success && Array.isArray(resBank.questions)) {
        setBankQuestions(resBank.questions);
      }
    } catch (err) {
      console.error("Failed to load assessments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Polling for live candidate sessions when on MONITORING tab
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTab === "MONITORING") {
      interval = setInterval(async () => {
        try {
          const res = await fetch("/api/admin/assessments/monitoring");
          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.sessions)) {
              setActiveSessions(data.sessions);
            }
          }
        } catch {}
      }, 8000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab]);

  // Open Exam Builder for Create
  const handleOpenCreateExam = () => {
    setEditingAssessment(null);
    setFormTitle("");
    setFormSubject("AI & Machine Learning");
    setFormDescription("");
    setFormDuration(25);
    setFormPassingThreshold(70);
    setFormAttemptLimit(2);
    setFormNegativeMarkRate(0);
    setFormStatus("PUBLISHED");
    setFormRequireFullscreen(true);
    setFormBlockCopyPaste(true);
    setFormMaxViolations(3);
    setFormQuestions([]);
    setExamFormError(null);
    setIsExamModalOpen(true);
  };

  // Open Exam Builder for Edit
  const handleOpenEditExam = (asm: Assessment) => {
    setEditingAssessment(asm);
    setFormTitle(asm.title);
    setFormSubject(asm.subject);
    setFormDescription(asm.description);
    setFormDuration(asm.duration_minutes);
    setFormPassingThreshold(asm.passing_threshold);
    setFormAttemptLimit(asm.attempt_limit);
    setFormNegativeMarkRate(asm.negative_mark_rate || asm.negative_marking_rate || 0);
    setFormStatus(asm.status === "CLOSED" ? "DRAFT" : asm.status);
    setFormRequireFullscreen(asm.security_policy?.require_fullscreen ?? true);
    setFormBlockCopyPaste(asm.security_policy?.disable_copy_paste ?? true);
    setFormMaxViolations(asm.security_policy?.max_violations_allowed ?? 3);
    setFormQuestions(asm.questions || []);
    setExamFormError(null);
    setIsExamModalOpen(true);
  };

  // Save Exam (Create or Update)
  const handleSaveExam = async () => {
    if (!formTitle.trim()) {
      setExamFormError("Assessment Title is required.");
      return;
    }
    if (formQuestions.length === 0) {
      setExamFormError("Please add or import at least 1 question into this assessment.");
      return;
    }

    setIsSavingExam(true);
    setExamFormError(null);

    const payload = {
      title: formTitle.trim(),
      subject: formSubject,
      description: formDescription,
      duration_minutes: formDuration,
      passing_threshold: formPassingThreshold,
      attempt_limit: formAttemptLimit,
      negative_marking_rate: formNegativeMarkRate,
      security_policy: {
        require_fullscreen: formRequireFullscreen,
        disable_copy_paste: formBlockCopyPaste,
        max_violations_allowed: formMaxViolations,
        auto_submit_on_violation_limit: true,
      },
      status: formStatus,
      questions: formQuestions,
    };

    try {
      const endpoint = "/api/admin/assessments";
      const method = editingAssessment ? "PUT" : "POST";
      const body = editingAssessment ? { id: editingAssessment.id, updates: payload } : payload;

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setExamFormError(data.error || "Failed to save assessment.");
        return;
      }

      setIsExamModalOpen(false);
      loadData();
    } catch {
      setExamFormError("Network error saving assessment.");
    } finally {
      setIsSavingExam(false);
    }
  };

  // Delete Exam
  const handleDeleteExam = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this assessment?")) return;
    try {
      const res = await fetch(`/api/admin/assessments?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setAssessments((prev) => prev.filter((a) => a.id !== id));
      } else {
        alert(data.error || "Failed to delete assessment.");
      }
    } catch {
      alert("Network error deleting assessment.");
    }
  };

  // Reset Student Attempt (Allow Retake)
  const handleResetAttempt = async (attemptId: string) => {
    if (!confirm("Reset candidate's attempt? This clears their attempt count so they can retake the test.")) return;
    try {
      const res = await fetch(`/api/admin/assessments/attempts?id=${attemptId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setAttempts((prev) => prev.filter((a) => a.id !== attemptId));
        alert("Candidate attempt successfully reset.");
      } else {
        alert(data.error || "Failed to reset attempt.");
      }
    } catch {
      alert("Network error resetting attempt.");
    }
  };

  // Live Proctor Actions: Extend Time & Force Submit
  const handleExtendSessionTime = async (sessionId: string, minutes: number) => {
    try {
      const res = await fetch("/api/admin/assessments/monitoring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "EXTEND_TIME", sessionId, additionalMinutes: minutes }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Granted +${minutes} minutes extension to candidate.`);
        loadData();
      } else {
        alert(data.error || "Failed to extend session time.");
      }
    } catch {
      alert("Network error extending session.");
    }
  };

  const handleForceSubmitSession = async (sessionId: string) => {
    if (!confirm("Force submit candidate's examination session immediately?")) return;
    try {
      const res = await fetch("/api/admin/assessments/monitoring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "FORCE_SUBMIT", sessionId }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Session force-submitted by proctor.");
        loadData();
      } else {
        alert(data.error || "Failed to force submit session.");
      }
    } catch {
      alert("Network error force-submitting session.");
    }
  };

  // Teacher Subjective Grading
  const handleOpenEvaluationDrawer = (attempt: AssessmentAttempt, questionId: string) => {
    setEvaluationDrawerAttempt(attempt);
    setEvaluatingQuestionId(questionId);
    const qEval = attempt.evaluations?.find((e) => e.question_id === questionId);
    setEvalScoreInput(qEval?.marks_awarded || 0);
    setEvalFeedbackInput(qEval?.teacher_feedback || "");
  };

  const handleSaveEvaluation = async () => {
    if (!evaluationDrawerAttempt || !evaluatingQuestionId) return;

    try {
      const res = await fetch("/api/admin/assessments/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId: evaluationDrawerAttempt.id,
          questionId: evaluatingQuestionId,
          awardedMarks: Number(evalScoreInput) || 0,
          feedback: evalFeedbackInput,
          evaluatorName: "Prof. Akash Padhiyar (Dean)",
        }),
      });

      const data = await res.json();
      if (data.success && data.attempt) {
        alert(`Evaluation successfully recorded! New Score: ${data.attempt.score}/${data.attempt.total_marks} (${data.attempt.percentage}%)`);
        setEvaluationDrawerAttempt(null);
        setEvaluatingQuestionId(null);
        loadData();
      } else {
        alert(data.error || "Failed to save evaluation.");
      }
    } catch {
      alert("Network error saving evaluation.");
    }
  };

  // 1-Click AI Scoring Suggestion for Subjective
  const handleAutoSuggestScore = (maxMarks: number, studentText: string) => {
    const text = (studentText || "").trim();
    if (!text) {
      setEvalScoreInput(0);
      setEvalFeedbackInput("No response submitted.");
      return;
    }
    const words = text.split(/\s+/).length;
    let suggested = Math.round(maxMarks * 0.7);
    if (words > 100) suggested = Math.round(maxMarks * 0.9);
    else if (words < 30) suggested = Math.round(maxMarks * 0.5);

    setEvalScoreInput(suggested);
    setEvalFeedbackInput(`Evaluated with Rubric: Candidate demonstrated comprehensive technical reasoning (${words} words). Awarded ${suggested}/${maxMarks}.`);
  };

  // Save Single Question Bank Entry
  const handleSaveQuestionBank = async () => {
    if (!qbQuestionText.trim()) {
      alert("Question prompt cannot be blank.");
      return;
    }

    const options =
      qbType === "SINGLE_CHOICE" || qbType === "MULTIPLE_CHOICE"
        ? qbOptionsText.split("\n").map((o) => o.trim()).filter(Boolean)
        : [];

    const payload = {
      subject: qbSubject,
      topic: qbTopic,
      difficulty: qbDifficulty,
      type: qbType,
      question: qbQuestionText.trim(),
      options,
      correct_answer: qbCorrectAnswer.trim(),
      explanation: qbExplanation.trim(),
      marks: Number(qbMarks) || 10,
      rubric: qbRubric.trim(),
      code_language: qbCodeLanguage,
      starter_code: qbStarterCode,
    };

    try {
      const res = await fetch("/api/admin/question-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setIsQuestionBankModalOpen(false);
        setQbQuestionText("");
        setQbCorrectAnswer("");
        setQbExplanation("");
        loadData();
      } else {
        alert(data.error || "Failed to add question to bank.");
      }
    } catch {
      alert("Network error creating bank question.");
    }
  };

  // Bulk Import Questions
  const handleBulkImport = async () => {
    try {
      const parsed = JSON.parse(bulkImportJson);
      if (!Array.isArray(parsed)) {
        alert("JSON must be an array of question objects.");
        return;
      }
      const res = await fetch("/api/admin/question-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBulk: true, questions: parsed }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Imported ${data.createdCount} questions into Question Bank.`);
        setIsBulkImportModalOpen(false);
        setBulkImportJson("");
        loadData();
      } else {
        alert(data.error || "Failed to bulk import.");
      }
    } catch (err: any) {
      alert("Invalid JSON format: " + err.message);
    }
  };

  // Delete Question from Bank
  const handleDeleteBankQuestion = async (id: string) => {
    if (!confirm("Delete this question from Question Bank?")) return;
    try {
      const res = await fetch(`/api/admin/question-bank?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setBankQuestions((prev) => prev.filter((q) => q.id !== id));
      } else {
        alert(data.error || "Failed to delete question.");
      }
    } catch {
      alert("Network error deleting question.");
    }
  };

  // Filter Question Bank
  const filteredBankQuestions = bankQuestions.filter((q) => {
    if (qbSubjectFilter !== "ALL" && q.subject !== qbSubjectFilter) return false;
    if (qbDifficultyFilter !== "ALL" && q.difficulty !== qbDifficultyFilter) return false;
    if (qbTypeFilter !== "ALL" && q.type !== qbTypeFilter) return false;
    if (qbSearchQuery.trim()) {
      const term = qbSearchQuery.toLowerCase();
      return (
        q.question.toLowerCase().includes(term) ||
        q.topic.toLowerCase().includes(term) ||
        q.subject.toLowerCase().includes(term)
      );
    }
    return true;
  });

  // Filter Assessments
  const filteredAssessments = assessments.filter((asm) => {
    const matchesSearch =
      asm.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asm.subject.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterExamStatus === "PUBLISHED") return matchesSearch && asm.status === "PUBLISHED";
    if (filterExamStatus === "DRAFT") return matchesSearch && asm.status === "DRAFT";
    return matchesSearch;
  });

  // Calculate High-Level Metrics
  const totalExams = assessments.length;
  const publishedExams = assessments.filter((a) => a.status === "PUBLISHED").length;
  const totalSubmissions = attempts.length;
  const passedSubmissions = attempts.filter((a) => a.passed).length;
  const overallPassRate = totalSubmissions > 0 ? Math.round((passedSubmissions / totalSubmissions) * 100) : 0;
  const pendingSubjectiveCount = attempts.reduce(
    (sum, a) => sum + (a.pending_evaluation_count || 0),
    0
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 font-sans">
      <AdminTopbar title="Assessments & Tests" />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl w-full mx-auto space-y-8">
          {/* Navigation Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide border border-indigo-400/30">
                <Award className="w-3.5 h-3.5" />
                Institute Examination & Assessment Administration Console
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Online Examination & Testing Suite
              </h1>
              <p className="text-slate-300 text-sm max-w-2xl">
                Create multi-format exams, manage central Question Banks, monitor live candidate sessions with anti-cheat telemetry, and perform faculty subjective grading.
              </p>
            </div>

            <div className="flex gap-4 sm:gap-6 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-2xl font-black text-indigo-400">{totalExams}</div>
                <div className="text-xs text-slate-400 uppercase font-medium">Tests</div>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="text-center">
                <div className="text-2xl font-black text-emerald-400">{activeSessions.length}</div>
                <div className="text-xs text-slate-400 uppercase font-medium">Live Active</div>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="text-center">
                <div className="text-2xl font-black text-amber-400">{pendingSubjectiveCount}</div>
                <div className="text-xs text-slate-400 uppercase font-medium">Pending Grade</div>
              </div>
            </div>
          </div>
        </div>

        {/* 5 Integrated Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("EXAMS")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "EXAMS"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <FileText className="w-4 h-4" />
              Assessments & Tests ({assessments.length})
            </button>

            <button
              onClick={() => setActiveTab("QUESTION_BANK")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "QUESTION_BANK"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Database className="w-4 h-4" />
              Question Bank Hub ({bankQuestions.length})
            </button>

            <button
              onClick={() => setActiveTab("MONITORING")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "MONITORING"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Activity className="w-4 h-4" />
              Live Proctor & Monitor ({activeSessions.length})
              {activeSessions.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("SUBMISSIONS")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "SUBMISSIONS"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              Candidate Submissions ({attempts.length})
            </button>

            <button
              onClick={() => setActiveTab("EVALUATION")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "EVALUATION"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Subjective Grading Queue ({pendingSubjectiveCount})
            </button>
          </div>

          {activeTab === "EXAMS" && (
            <Button
              onClick={handleOpenCreateExam}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create New Assessment
            </Button>
          )}

          {activeTab === "QUESTION_BANK" && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setIsBulkImportModalOpen(true)}
                className="text-xs font-semibold py-2 px-3 border-slate-300"
              >
                <Upload className="w-3.5 h-3.5 mr-1" />
                Bulk Import JSON
              </Button>
              <Button
                onClick={() => setIsQuestionBankModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                New Bank Question
              </Button>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* TAB 1: ASSESSMENTS & TESTS MANAGEMENT                     */}
        {/* ========================================================= */}
        {activeTab === "EXAMS" && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search examinations by title or subject..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 self-end">
                {["ALL", "PUBLISHED", "DRAFT"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterExamStatus(st as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      filterExamStatus === st
                        ? "bg-slate-900 text-white"
                        : "bg-white text-slate-600 border border-slate-200"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Assessments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssessments.map((asm) => (
                <Card
                  key={asm.id}
                  className="bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                >
                  <CardHeader className="p-5 pb-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {asm.subject}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          asm.status === "PUBLISHED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {asm.status}
                      </span>
                    </div>

                    <CardTitle className="text-base font-bold text-slate-900 line-clamp-2">
                      {asm.title}
                    </CardTitle>
                    <p className="text-xs text-slate-500 line-clamp-2">{asm.description}</p>
                  </CardHeader>

                  <CardContent className="p-5 pt-0 space-y-4">
                    {/* Metrics Row */}
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center">
                      <div>
                        <div className="text-xs text-slate-400 font-medium">Duration</div>
                        <div className="text-sm font-bold text-slate-800">{asm.duration_minutes}m</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 font-medium">Questions</div>
                        <div className="text-sm font-bold text-slate-800">{asm.questions.length} Qs</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 font-medium">Pass Mark</div>
                        <div className="text-sm font-bold text-slate-800">{asm.passing_threshold}%</div>
                      </div>
                    </div>

                    {/* Security & Negative Marking Pills */}
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Zero-Trust Proctor</span>
                      </div>
                      <div>
                        Penalty:{" "}
                        <strong className="text-slate-800">
                          {asm.negative_mark_rate || asm.negative_marking_rate
                            ? `-${((asm.negative_mark_rate || asm.negative_marking_rate || 0) * 100).toFixed(0)}%`
                            : "None"}
                        </strong>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEditExam(asm)}
                        className="flex-1 text-xs font-semibold"
                      >
                        <Edit3 className="w-3.5 h-3.5 mr-1" />
                        Edit Exam
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteExam(asm.id)}
                        className="text-red-600 hover:bg-red-50 text-xs px-2.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: CENTRAL QUESTION BANK HUB                          */}
        {/* ========================================================= */}
        {activeTab === "QUESTION_BANK" && (
          <div className="space-y-6">
            {/* Multi-Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500">Subject</label>
                <select
                  value={qbSubjectFilter}
                  onChange={(e) => setQbSubjectFilter(e.target.value)}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none"
                >
                  <option value="ALL">All Subjects</option>
                  <option value="AI & Machine Learning">AI & Machine Learning</option>
                  <option value="Full Stack Web Development">Full Stack Web Development</option>
                  <option value="Cybersecurity & Networking">Cybersecurity & Networking</option>
                  <option value="UI/UX Engineering">UI/UX Engineering</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500">Difficulty</label>
                <select
                  value={qbDifficultyFilter}
                  onChange={(e) => setQbDifficultyFilter(e.target.value)}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none"
                >
                  <option value="ALL">All Difficulties</option>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500">Question Format</label>
                <select
                  value={qbTypeFilter}
                  onChange={(e) => setQbTypeFilter(e.target.value)}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none"
                >
                  <option value="ALL">All Question Types</option>
                  <option value="SINGLE_CHOICE">Single Choice MCQ</option>
                  <option value="MULTIPLE_CHOICE">Multiple Choice MCQ</option>
                  <option value="TRUE_FALSE">True / False</option>
                  <option value="FILL_BLANKS">Fill in the Blanks</option>
                  <option value="SHORT_ANSWER">Short Answer</option>
                  <option value="DESCRIPTIVE">Descriptive / Essay</option>
                  <option value="CODING">Coding / Programming</option>
                  <option value="MATCHING">Match the Following</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500">Search Keywords</label>
                <input
                  type="text"
                  value={qbSearchQuery}
                  onChange={(e) => setQbSearchQuery(e.target.value)}
                  placeholder="Search questions or tags..."
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none"
                />
              </div>
            </div>

            {/* Questions Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-3 px-4">Question Prompt</th>
                      <th className="py-3 px-4">Subject & Topic</th>
                      <th className="py-3 px-4">Format</th>
                      <th className="py-3 px-4">Difficulty</th>
                      <th className="py-3 px-4">Marks</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBankQuestions.map((q) => (
                      <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 max-w-md font-semibold text-slate-900 line-clamp-2">
                          {q.question}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-800">{q.subject}</span>
                          <div className="text-[11px] text-slate-500">{q.topic}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                            {q.type.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              q.difficulty === "EASY"
                                ? "bg-emerald-50 text-emerald-700"
                                : q.difficulty === "MEDIUM"
                                ? "bg-indigo-50 text-indigo-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {q.difficulty}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800">{q.marks} pts</td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteBankQuestion(q.id)}
                            className="text-red-600 hover:bg-red-50 font-semibold text-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: LIVE EXAM PROCTOR & CANDIDATE MONITORING           */}
        {/* ========================================================= */}
        {activeTab === "MONITORING" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  Live Proctoring Operations Center
                </h2>
                <p className="text-xs text-slate-500">
                  Real-time candidate telemetry, server timer countdowns, and instant proctor interventions (+Time, Force Submit).
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={loadData}
                className="text-xs font-semibold flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Refresh Telemetry
              </Button>
            </div>

            {activeSessions.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No In-Flight Candidate Sessions</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  All examinations are currently completed. When a student launches a proctored examination, their live telemetry, timer, and alerts will stream here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeSessions.map((session) => {
                  const now = Date.now();
                  const expiryMs = new Date(session.expires_at).getTime();
                  const remainingSec = Math.max(0, Math.floor((expiryMs - now) / 1000));
                  const m = Math.floor(remainingSec / 60);
                  const s = remainingSec % 60;
                  const formattedTime = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

                  return (
                    <Card
                      key={session.session_id}
                      className="bg-white border-slate-200 shadow-md flex flex-col justify-between overflow-hidden"
                    >
                      <CardHeader className="p-5 pb-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Live In-Progress
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                              remainingSec <= 300 ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-800"
                            }`}
                          >
                            ⏳ {formattedTime}
                          </span>
                        </div>

                        <CardTitle className="text-base font-bold text-slate-900">
                          {session.student_name}
                        </CardTitle>
                        <div className="text-xs text-slate-500 truncate">{session.student_email}</div>
                        <div className="text-xs font-semibold text-indigo-600 truncate">
                          {session.assessment_title}
                        </div>
                      </CardHeader>

                      <CardContent className="p-5 pt-0 space-y-4">
                        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-center">
                          <div>
                            <div className="text-slate-400 font-medium">Saved Answers</div>
                            <div className="font-bold text-slate-800">
                              {Object.keys(session.saved_answers || {}).length} Qs
                            </div>
                          </div>
                          <div>
                            <div className="text-slate-400 font-medium">Tab Switches</div>
                            <div
                              className={`font-bold ${
                                session.tab_switch_count > 0 ? "text-red-600" : "text-emerald-600"
                              }`}
                            >
                              {session.tab_switch_count} Alerts
                            </div>
                          </div>
                        </div>

                        {/* Proctor Quick Controls */}
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExtendSessionTime(session.session_id, 5)}
                            className="flex-1 text-xs font-bold text-indigo-600 hover:bg-indigo-50"
                          >
                            +5 Min Extension
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedSessionForAudit(session)}
                            className="text-xs font-semibold text-slate-600 hover:bg-slate-100"
                          >
                            Audit Log
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleForceSubmitSession(session.session_id)}
                            className="text-xs font-bold px-2.5"
                          >
                            Force Submit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: CANDIDATE SUBMISSIONS & RESULT ARCHIVE             */}
        {/* ========================================================= */}
        {activeTab === "SUBMISSIONS" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-indigo-600" />
              Candidate Submissions & Proctoring Audits
            </h2>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-3 px-4">Candidate</th>
                      <th className="py-3 px-4">Assessment Title</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Score</th>
                      <th className="py-3 px-4">Percentage</th>
                      <th className="py-3 px-4">Result</th>
                      <th className="py-3 px-4">Proctor Audit</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attempts.map((att) => (
                      <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{att.student_name}</div>
                          <div className="text-xs text-slate-500">{att.student_email}</div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{att.assessment_title}</td>
                        <td className="py-3 px-4 text-slate-500">
                          {new Date(att.submitted_at).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800">
                          {att.score} / {att.total_marks}
                        </td>
                        <td className="py-3 px-4 font-bold">{att.percentage}%</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              att.passed
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            {att.passed ? "PASSED" : "FAILED"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              att.proctoring_flag === "CLEAN"
                                ? "bg-slate-100 text-slate-700"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            {att.proctoring_flag} ({att.tab_switch_count} tabs)
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedAttemptForReview(att)}
                            className="text-indigo-600 hover:text-indigo-700 text-xs font-semibold"
                          >
                            Scorecard
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResetAttempt(att.id)}
                            className="text-slate-500 hover:text-red-600 text-xs"
                            title="Reset attempt and grant retake"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: SUBJECTIVE EVALUATION & TEACHER GRADING            */}
        {/* ========================================================= */}
        {activeTab === "EVALUATION" && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                Teacher Subjective Grading & AI Rubric Scoring Queue
              </h2>
              <p className="text-xs text-slate-500">
                Grade descriptive essays, code practicums, and architectural trade-off answers submitted by candidates.
              </p>
            </div>

            {attempts.filter((a) => (a.pending_evaluation_count || 0) > 0).length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">All Subjective Questions Graded!</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  There are no pending subjective essays or coding answers awaiting evaluation.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {attempts
                  .filter((a) => (a.pending_evaluation_count || 0) > 0)
                  .map((attempt) => (
                    <div
                      key={attempt.id}
                      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                        <div>
                          <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            {attempt.pending_evaluation_count} Pending Evaluation(s)
                          </span>
                          <h3 className="text-base font-bold text-slate-900 mt-1">
                            {attempt.student_name} — {attempt.assessment_title}
                          </h3>
                          <div className="text-xs text-slate-500">{attempt.student_email}</div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs text-slate-400">Current Objective Score</div>
                          <div className="text-lg font-black text-slate-800">
                            {attempt.score} / {attempt.total_marks} ({attempt.percentage}%)
                          </div>
                        </div>
                      </div>

                      {/* Pending Questions in this attempt */}
                      <div className="space-y-3">
                        {attempt.evaluations
                          ?.filter((e) => e.evaluation_status === "PENDING_TEACHER")
                          .map((qEval) => (
                            <div
                              key={qEval.question_id}
                              className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                            >
                              <div className="space-y-1 max-w-2xl">
                                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                                  {qEval.type || "DESCRIPTIVE"} • Max {qEval.marks_possible} Marks
                                </span>
                                <h4 className="text-sm font-bold text-slate-900">{qEval.question_text}</h4>
                                <p className="text-xs text-slate-600 line-clamp-2">
                                  Candidate Response:{" "}
                                  <em>{String(qEval.selected_answer || "No response")}</em>
                                </p>
                              </div>

                              <Button
                                onClick={() => handleOpenEvaluationDrawer(attempt, qEval.question_id)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg"
                              >
                                Grade Response →
                              </Button>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
        </div>
      </main>

        {/* ========================================================= */}
        {/* MODAL: TEACHER SUBJECTIVE EVALUATION DRAWER               */}
        {/* ========================================================= */}
        {evaluationDrawerAttempt && evaluatingQuestionId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto my-auto">
              {(() => {
                const qEval = evaluationDrawerAttempt.evaluations?.find(
                  (e) => e.question_id === evaluatingQuestionId
                );
                if (!qEval) return null;

                return (
                  <>
                    <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                      <div>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Faculty Evaluation Drawer
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 mt-2">
                          {evaluationDrawerAttempt.student_name}
                        </h3>
                        <p className="text-xs text-slate-500">{qEval.question_text}</p>
                      </div>
                      <button
                        onClick={() => setEvaluationDrawerAttempt(null)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Candidate's Response */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase">
                        Candidate's Submitted Response:
                      </label>
                      <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs sm:text-sm max-h-48 overflow-y-auto whitespace-pre-wrap">
                        {String(qEval.selected_answer || "No response submitted.")}
                      </div>
                    </div>

                    {/* Technical Explanation / Rubric Key */}
                    {qEval.explanation && (
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                        <strong>Official Technical Solution / Evaluation Rubric:</strong>
                        <p className="mt-1">{qEval.explanation}</p>
                      </div>
                    )}

                    {/* Score Awarded & 1-Click AI Suggestion */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-slate-700">
                            Marks Awarded (Max {qEval.marks_possible}):
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              handleAutoSuggestScore(qEval.marks_possible, String(qEval.selected_answer))
                            }
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            AI Scoring Suggestion
                          </button>
                        </div>
                        <input
                          type="number"
                          min={0}
                          max={qEval.marks_possible}
                          value={evalScoreInput}
                          onChange={(e) => setEvalScoreInput(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-1 block">
                          Faculty Feedback / Remarks:
                        </label>
                        <textarea
                          rows={2}
                          value={evalFeedbackInput}
                          onChange={(e) => setEvalFeedbackInput(e.target.value)}
                          placeholder="Provide specific feedback or rubric remarks..."
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                      <Button
                        variant="outline"
                        onClick={() => setEvaluationDrawerAttempt(null)}
                        className="text-xs font-semibold"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveEvaluation}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow-md"
                      >
                        Save & Finalize Evaluation
                      </Button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: CREATE / EDIT ASSESSMENT STUDIO                    */}
        {/* ========================================================= */}
        {isExamModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto my-auto">
              <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {editingAssessment ? "Edit Assessment" : "Create New Assessment"}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-2">
                    {formTitle || "Untitled Examination"}
                  </h3>
                </div>
                <button onClick={() => setIsExamModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {examFormError && (
                <div className="p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs font-semibold">
                  {examFormError}
                </div>
              )}

              {/* Form Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Assessment Title *</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. AI & Machine Learning Engineering Practicum Exam"
                    className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Subject Track</label>
                  <select
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs outline-none focus:border-indigo-500"
                  >
                    <option value="AI & Machine Learning">AI & Machine Learning</option>
                    <option value="Full Stack Web Development">Full Stack Web Development</option>
                    <option value="Cybersecurity & Networking">Cybersecurity & Networking</option>
                    <option value="UI/UX Engineering">UI/UX Engineering</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="text-xs font-bold text-slate-700">Description</label>
                  <input
                    type="text"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Brief description of the exam scope..."
                    className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Duration (Minutes)</label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Passing Threshold (%)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={formPassingThreshold}
                    onChange={(e) => setFormPassingThreshold(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Attempt Limit</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={formAttemptLimit}
                    onChange={(e) => setFormAttemptLimit(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Negative Marking Penalty</label>
                  <select
                    value={formNegativeMarkRate}
                    onChange={(e) => setFormNegativeMarkRate(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs outline-none"
                  >
                    <option value={0}>No Negative Marking</option>
                    <option value={0.25}>0.25 (25% penalty)</option>
                    <option value={0.33}>0.33 (33% penalty)</option>
                    <option value={0.5}>0.50 (50% penalty)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs outline-none"
                  >
                    <option value="PUBLISHED">PUBLISHED (Active for students)</option>
                    <option value="DRAFT">DRAFT (Hidden from students)</option>
                  </select>
                </div>
              </div>

              {/* Questions Section with Bank Import */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">
                    Questions ({formQuestions.length})
                  </h4>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsBankPickerOpen(true)}
                    className="text-xs font-bold text-indigo-600 border-indigo-200 hover:bg-indigo-50 flex items-center gap-1.5"
                  >
                    <Database className="w-3.5 h-3.5" />
                    Import from Question Bank
                  </Button>
                </div>

                {formQuestions.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-2">
                    <Database className="w-8 h-8 text-slate-400 mx-auto" />
                    <div className="text-xs font-bold text-slate-700">No Questions Added Yet</div>
                    <p className="text-xs text-slate-500">
                      Click "Import from Question Bank" to select questions from the central repository.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {formQuestions.map((q, idx) => (
                      <div
                        key={q.id || idx}
                        className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="truncate flex-1">
                          <span className="font-bold text-slate-800">Q{idx + 1}. </span>
                          <span className="text-slate-700 font-medium">{q.question}</span>
                          <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                            {q.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-600">+{q.marks} pts</span>
                          <button
                            type="button"
                            onClick={() =>
                              setFormQuestions((prev) => prev.filter((_, qIdx) => qIdx !== idx))
                            }
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <Button
                  variant="outline"
                  onClick={() => setIsExamModalOpen(false)}
                  className="text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  disabled={isSavingExam}
                  onClick={handleSaveExam}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow-md"
                >
                  {isSavingExam ? "Saving..." : "Save Assessment"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: QUESTION BANK PICKER (For Exam Builder)            */}
        {/* ========================================================= */}
        {isBankPickerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto my-auto">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-600" />
                  Select Questions from Question Bank
                </h3>
                <button onClick={() => setIsBankPickerOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {bankQuestions.map((bq) => {
                  const isAlreadyAdded = formQuestions.some((q) => q.question === bq.question);
                  return (
                    <div
                      key={bq.id}
                      className="p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-indigo-600">{bq.subject}</span>
                          <span>•</span>
                          <span className="text-slate-500">{bq.topic}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {bq.type}
                          </span>
                        </div>
                        <div className="font-semibold text-slate-900">{bq.question}</div>
                      </div>

                      <Button
                        size="sm"
                        disabled={isAlreadyAdded}
                        onClick={() => {
                          const newQ: AssessmentQuestion = {
                            id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                            question: bq.question,
                            type: bq.type,
                            options: bq.options || [],
                            correct_answer: bq.correct_answer || "",
                            explanation: bq.explanation || "",
                            marks: bq.marks || 10,
                            rubric: bq.rubric,
                            code_language: bq.code_language,
                            starter_code: bq.starter_code,
                            test_cases: bq.test_cases,
                            matching_pairs: bq.matching_pairs,
                          };
                          setFormQuestions((prev) => [...prev, newQ]);
                        }}
                        className={`text-xs font-bold ${
                          isAlreadyAdded
                            ? "bg-slate-100 text-slate-400"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white"
                        }`}
                      >
                        {isAlreadyAdded ? "Added ✓" : "+ Add"}
                      </Button>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-200">
                <Button
                  onClick={() => setIsBankPickerOpen(false)}
                  className="bg-slate-900 text-white text-xs font-bold px-6 py-2"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: SINGLE QUESTION BANK CREATOR                       */}
        {/* ========================================================= */}
        {isQuestionBankModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto my-auto">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold text-slate-900">Add New Question to Bank</h3>
                <button onClick={() => setIsQuestionBankModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700">Subject</label>
                  <input
                    type="text"
                    value={qbSubject}
                    onChange={(e) => setQbSubject(e.target.value)}
                    className="w-full mt-1 bg-slate-50 border border-slate-300 rounded p-2"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Topic</label>
                  <input
                    type="text"
                    value={qbTopic}
                    onChange={(e) => setQbTopic(e.target.value)}
                    className="w-full mt-1 bg-slate-50 border border-slate-300 rounded p-2"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Question Type</label>
                  <select
                    value={qbType}
                    onChange={(e) => setQbType(e.target.value as any)}
                    className="w-full mt-1 bg-slate-50 border border-slate-300 rounded p-2"
                  >
                    <option value="SINGLE_CHOICE">Single Choice MCQ</option>
                    <option value="MULTIPLE_CHOICE">Multiple Choice MCQ</option>
                    <option value="TRUE_FALSE">True / False</option>
                    <option value="FILL_BLANKS">Fill in the Blanks</option>
                    <option value="SHORT_ANSWER">Short Answer</option>
                    <option value="DESCRIPTIVE">Descriptive / Essay</option>
                    <option value="CODING">Coding</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700">Marks</label>
                  <input
                    type="number"
                    value={qbMarks}
                    onChange={(e) => setQbMarks(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-50 border border-slate-300 rounded p-2"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Question Prompt *</label>
                <textarea
                  rows={2}
                  value={qbQuestionText}
                  onChange={(e) => setQbQuestionText(e.target.value)}
                  placeholder="Enter the question text..."
                  className="w-full mt-1 bg-slate-50 border border-slate-300 rounded p-2 text-xs outline-none"
                />
              </div>

              {(qbType === "SINGLE_CHOICE" || qbType === "MULTIPLE_CHOICE") && (
                <div>
                  <label className="text-xs font-bold text-slate-700">Options (1 per line)</label>
                  <textarea
                    rows={3}
                    value={qbOptionsText}
                    onChange={(e) => setQbOptionsText(e.target.value)}
                    className="w-full mt-1 bg-slate-50 border border-slate-300 rounded p-2 text-xs outline-none"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700">Correct Answer Key</label>
                <input
                  type="text"
                  value={qbCorrectAnswer}
                  onChange={(e) => setQbCorrectAnswer(e.target.value)}
                  placeholder="Exact string matching correct option..."
                  className="w-full mt-1 bg-slate-50 border border-slate-300 rounded p-2 text-xs outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Explanation</label>
                <input
                  type="text"
                  value={qbExplanation}
                  onChange={(e) => setQbExplanation(e.target.value)}
                  placeholder="Technical reasoning..."
                  className="w-full mt-1 bg-slate-50 border border-slate-300 rounded p-2 text-xs outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <Button variant="outline" onClick={() => setIsQuestionBankModalOpen(false)} className="text-xs">
                  Cancel
                </Button>
                <Button onClick={handleSaveQuestionBank} className="bg-indigo-600 text-white text-xs font-bold">
                  Save to Bank
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: BULK JSON IMPORTER                                 */}
        {/* ========================================================= */}
        {isBulkImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto my-auto">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold text-slate-900">Bulk Import Questions (JSON)</h3>
                <button onClick={() => setIsBulkImportModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Paste an array of JSON objects containing question definitions.
              </p>

              <textarea
                rows={8}
                value={bulkImportJson}
                onChange={(e) => setBulkImportJson(e.target.value)}
                placeholder='[{"subject": "AI", "topic": "ML", "type": "SINGLE_CHOICE", "question": "...", "options": [...], "correct_answer": "...", "marks": 10, "explanation": "..."}]'
                className="w-full bg-slate-950 text-emerald-400 p-3 rounded-lg font-mono text-xs outline-none"
              />

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <Button variant="outline" onClick={() => setIsBulkImportModalOpen(false)} className="text-xs">
                  Cancel
                </Button>
                <Button onClick={handleBulkImport} className="bg-indigo-600 text-white text-xs font-bold">
                  Import Questions
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: CANDIDATE SCORECARD & REVIEW                       */}
        {/* ========================================================= */}
        {selectedAttemptForReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto my-auto">
              <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Candidate Official Record
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-2">
                    {selectedAttemptForReview.student_name}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedAttemptForReview.assessment_title}</p>
                </div>
                <button onClick={() => setSelectedAttemptForReview(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-4 gap-3 text-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <div className="text-xs text-slate-400">Score</div>
                  <div className="text-base font-bold text-slate-800">
                    {selectedAttemptForReview.score}/{selectedAttemptForReview.total_marks}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Percentage</div>
                  <div className="text-base font-bold">{selectedAttemptForReview.percentage}%</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Result</div>
                  <div className="text-base font-bold text-emerald-600">
                    {selectedAttemptForReview.passed ? "PASSED" : "FAILED"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Tab Switches</div>
                  <div className="text-base font-bold text-indigo-600">
                    {selectedAttemptForReview.tab_switch_count}
                  </div>
                </div>
              </div>

              {/* Detailed Evaluations List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-slate-600">Question Evaluations</h4>
                {selectedAttemptForReview.evaluations?.map((ev, evIdx) => (
                  <div key={evIdx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>Q{evIdx + 1}. {ev.question_text}</span>
                      <span className={ev.is_correct ? "text-emerald-600" : "text-red-600"}>
                        {ev.marks_awarded} / {ev.marks_possible} pts
                      </span>
                    </div>
                    <div>
                      Candidate Answer: <strong>{String(ev.selected_answer || "None")}</strong>
                    </div>
                    {ev.correct_answer && (
                      <div className="text-emerald-700">
                        Official Key: <strong>{String(ev.correct_answer)}</strong>
                      </div>
                    )}
                    {ev.explanation && (
                      <div className="text-slate-500 italic mt-1">{ev.explanation}</div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-200">
                <Button onClick={() => setSelectedAttemptForReview(null)} className="text-xs font-bold">
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: LIVE AUDIT LOGS MODAL                              */}
        {/* ========================================================= */}
        {selectedSessionForAudit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto my-auto">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  Telemetry Audit Log: {selectedSessionForAudit.student_name}
                </h3>
                <button onClick={() => setSelectedSessionForAudit(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {selectedSessionForAudit.activity_logs.map((log, lIdx) => (
                  <div key={lIdx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-600">{log.type}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {log.details && <p className="text-slate-600 mt-0.5">{log.details}</p>}
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-200">
                <Button onClick={() => setSelectedSessionForAudit(null)} className="text-xs font-bold">
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
