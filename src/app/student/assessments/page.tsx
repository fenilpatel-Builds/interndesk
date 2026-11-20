"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { StudentTopbar } from "@/components/student/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Award,
  ShieldAlert,
  HelpCircle,
  BookOpen,
  Eye,
  Check,
  AlertCircle,
  X,
  FileCheck2,
} from "lucide-react";
import { Assessment, AssessmentAttempt } from "@/lib/assessments/assessment-store";

export default function StudentAssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>([]);
  const [studentEmail, setStudentEmail] = useState<string>("fenil.patel@akashtechnolabs.com");
  const [studentName, setStudentName] = useState<string>("Fenil Patel");
  const [isLoading, setIsLoading] = useState(true);

  // Exam Runner States
  const [examState, setExamState] = useState<"LIST" | "IN_PROGRESS" | "RESULT">("LIST");
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(1500); // in seconds
  const [startTimeMs, setStartTimeMs] = useState<number>(Date.now());
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const [showTabSwitchWarning, setShowTabSwitchWarning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examResult, setExamResult] = useState<AssessmentAttempt | null>(null);

  // Pre-exam instruction dialog state
  const [pendingStartAssessment, setPendingStartAssessment] = useState<Assessment | null>(null);
  const [startError, setStartError] = useState<string | null>(null);

  // Filter tab in catalog view
  const [catalogFilter, setCatalogFilter] = useState<"ALL" | "AVAILABLE" | "COMPLETED">("ALL");

  // Load live session & assessments
  const loadData = async () => {
    try {
      // 1. Get current student auth session
      const authRes = await fetch("/api/auth/me").then((r) => (r.ok ? r.json() : null)).catch(() => null);
      let email = "fenil.patel@akashtechnolabs.com";
      let name = "Fenil Patel";

      if (authRes?.user?.email) {
        email = authRes.user.email;
        name = authRes.user.name || name;
        setStudentEmail(email);
        setStudentName(name);
      }

      // 2. Fetch assessments catalog & attempts
      const [asmRes, attRes] = await Promise.all([
        fetch("/api/assessments").then((r) => r.json()),
        fetch(`/api/student/assessments/attempts?email=${encodeURIComponent(email)}`).then((r) => r.json()),
      ]);

      if (asmRes.success && Array.isArray(asmRes.assessments)) {
        setAssessments(asmRes.assessments);
        try {
          localStorage.setItem("student_assessments_catalog_cache", JSON.stringify(asmRes.assessments));
        } catch {}
      }

      if (attRes.success && Array.isArray(attRes.attempts)) {
        setAttempts(attRes.attempts);
        try {
          localStorage.setItem("student_assessments_attempts_cache", JSON.stringify(attRes.attempts));
        } catch {}
      }
    } catch {
      // Load from local cache fallback
      try {
        const cachedAsm = localStorage.getItem("student_assessments_catalog_cache");
        const cachedAtt = localStorage.getItem("student_assessments_attempts_cache");
        if (cachedAsm) setAssessments(JSON.parse(cachedAsm));
        if (cachedAtt) setAttempts(JSON.parse(cachedAtt));
      } catch {}
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Timer runner with authoritative wall-clock timestamp delta
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (examState === "IN_PROGRESS" && activeAssessment) {
      timer = setInterval(() => {
        const elapsedSec = Math.floor((Date.now() - startTimeMs) / 1000);
        const totalDurationSec = (activeAssessment.duration_minutes || 25) * 60;
        const remaining = Math.max(0, totalDurationSec - elapsedSec);
        setTimeLeft(remaining);

        if (remaining <= 0) {
          clearInterval(timer);
          handleSubmitAssessment();
        }
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [examState, activeAssessment, startTimeMs]);

  // Anti-Cheat: Track window blur and visibility changes
  useEffect(() => {
    if (examState !== "IN_PROGRESS") return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const next = prev + 1;
          setShowTabSwitchWarning(true);
          return next;
        });
      }
    };

    const handleWindowBlur = () => {
      setTabSwitchCount((prev) => {
        const next = prev + 1;
        setShowTabSwitchWarning(true);
        return next;
      });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [examState]);

  const formatTimerDisplay = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Launch pre-exam review
  const handleRequestStartExam = (asm: Assessment) => {
    setStartError(null);
    setPendingStartAssessment(asm);
  };

  // Confirm start
  const handleConfirmStartExam = async () => {
    if (!pendingStartAssessment) return;
    setStartError(null);

    try {
      const res = await fetch("/api/student/assessments/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId: pendingStartAssessment.id,
          email: studentEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setStartError(data.error || "Cannot start exam session.");
        return;
      }

      // Initialize proctored session
      setActiveAssessment(data.assessment || pendingStartAssessment);
      setPendingStartAssessment(null);
      setSelectedAnswers({});
      setCurrentQuestionIndex(0);
      setTabSwitchCount(0);
      setShowTabSwitchWarning(false);
      setExamResult(null);

      const durationSec = (data.durationMinutes || pendingStartAssessment.duration_minutes || 25) * 60;
      setTimeLeft(durationSec);
      setStartTimeMs(Date.now());
      setExamState("IN_PROGRESS");
    } catch {
      setStartError("Network error starting examination.");
    }
  };

  const handleSelectAnswer = (qId: string, answerText: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: answerText }));
  };

  const handleClearAnswer = (qId: string) => {
    setSelectedAnswers((prev) => {
      const copy = { ...prev };
      delete copy[qId];
      return copy;
    });
  };

  const handleSubmitAssessment = useCallback(async () => {
    if (!activeAssessment || isSubmitting) return;

    setIsSubmitting(true);
    const elapsedSec = Math.max(1, Math.floor((Date.now() - startTimeMs) / 1000));

    try {
      const res = await fetch("/api/student/assessments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId: activeAssessment.id,
          email: studentEmail,
          studentName: studentName,
          answers: selectedAnswers,
          tabSwitchCount: tabSwitchCount,
          timeSpentSeconds: elapsedSec,
        }),
      });

      const data = await res.json();
      if (data.success && data.attempt) {
        setExamResult(data.attempt);
        setAttempts((prev) => [data.attempt, ...prev.filter((a) => a.id !== data.attempt.id)]);
        setExamState("RESULT");
      } else {
        alert(data.error || "Failed to submit assessment.");
      }
    } catch {
      alert("Network error submitting assessment.");
    } finally {
      setIsSubmitting(false);
    }
  }, [activeAssessment, isSubmitting, selectedAnswers, studentEmail, studentName, tabSwitchCount, startTimeMs]);

  // View past attempt result
  const handleViewAttemptResult = (att: AssessmentAttempt) => {
    setExamResult(att);
    setExamState("RESULT");
  };

  // Filtered catalog cards
  const filteredAssessments = assessments.filter((asm) => {
    const studentAttempts = attempts.filter((a) => a.assessment_id === asm.id);
    const hasCompleted = studentAttempts.length > 0;

    if (catalogFilter === "AVAILABLE") return !hasCompleted;
    if (catalogFilter === "COMPLETED") return hasCompleted;
    return true;
  });

  // Calculate overview metrics
  const completedExamsCount = new Set(attempts.map((a) => a.assessment_id)).size;
  const passedExamsCount = new Set(attempts.filter((a) => a.passed).map((a) => a.assessment_id)).size;
  const avgScore =
    attempts.length > 0
      ? Math.round(attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / attempts.length)
      : 0;

  const currentQ = activeAssessment?.questions?.[currentQuestionIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const totalQuestions = activeAssessment?.questions?.length || 0;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      <StudentTopbar title="Assessments & Knowledge Evaluations" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* ================= VIEW 1: ASSESSMENT CATALOG ================= */}
        {examState === "LIST" && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Curriculum Assessments &amp; Online Examinations
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Accredited Practicum
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Timed MCQ examinations evaluated with server-side anti-cheat grading to qualify for accredited certificates.
              </p>
            </div>

            {/* Performance Overview Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="p-4 bg-white rounded-2xl border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Available Exams
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-slate-900">{assessments.length}</span>
                  <BookOpen className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-[11px] text-slate-500">Official Practicum Modules</p>
              </Card>

              <Card className="p-4 bg-white rounded-2xl border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Exams Completed
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-slate-900">{completedExamsCount}</span>
                  <CheckCircle2 className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-[11px] text-slate-500">{attempts.length} Total Submissions</p>
              </Card>

              <Card className="p-4 bg-white rounded-2xl border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Passed &amp; Qualified
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-emerald-600">{passedExamsCount}</span>
                  <Award className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-[11px] text-slate-500">Meeting Certificate Threshold</p>
              </Card>

              <Card className="p-4 bg-white rounded-2xl border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Average Score
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-blue-600">{avgScore}%</span>
                  <Award className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-[11px] text-slate-500">Across Attempt History</p>
              </Card>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
              <button
                onClick={() => setCatalogFilter("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  catalogFilter === "ALL" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                All Examinations ({assessments.length})
              </button>
              <button
                onClick={() => setCatalogFilter("AVAILABLE")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  catalogFilter === "AVAILABLE" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Available / Pending ({assessments.length - completedExamsCount})
              </button>
              <button
                onClick={() => setCatalogFilter("COMPLETED")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  catalogFilter === "COMPLETED" ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Completed &amp; Reviewed ({completedExamsCount})
              </button>
            </div>

            {/* Exam Cards Grid */}
            {isLoading ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-500 font-medium">Loading accredited examinations...</p>
              </div>
            ) : filteredAssessments.length === 0 ? (
              <Card className="p-12 text-center rounded-3xl border-dashed border-2 border-slate-200 bg-white">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No evaluations found in this view</h3>
                <p className="text-xs text-slate-500 mt-1">Switch to &apos;All Examinations&apos; to browse the full curriculum catalog.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredAssessments.map((exam) => {
                  const studentAttempts = attempts.filter((a) => a.assessment_id === exam.id);
                  const bestAttempt = studentAttempts.reduce<AssessmentAttempt | null>(
                    (best, cur) => (!best || cur.percentage > best.percentage ? cur : best),
                    null
                  );

                  const isPassed = bestAttempt?.passed || false;
                  const attemptsCount = studentAttempts.length;
                  const maxAttempts = exam.attempt_limit || 2;
                  const canRetake = attemptsCount < maxAttempts;

                  return (
                    <Card
                      key={exam.id}
                      className="border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow rounded-2xl bg-white flex flex-col justify-between overflow-hidden"
                    >
                      <CardHeader className="p-6 border-b border-slate-100 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {exam.subject}
                          </span>

                          {isPassed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              Passed ({bestAttempt?.percentage}%)
                            </span>
                          ) : attemptsCount > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <AlertTriangle className="w-3 h-3" />
                              Attempt 1: {bestAttempt?.percentage}%
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                              Not Attempted
                            </span>
                          )}
                        </div>

                        <CardTitle className="text-base font-bold text-slate-900 leading-snug">
                          {exam.title}
                        </CardTitle>

                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {exam.description || "Timed technical practicum evaluation with instant anti-cheat grading."}
                        </p>
                      </CardHeader>

                      <CardContent className="p-6 pt-4 space-y-4">
                        {/* Meta Spec Bar */}
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Questions</span>
                            <span className="font-bold text-slate-900">{exam.questions?.length || 0} MCQs</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Duration</span>
                            <span className="font-bold text-slate-900">{exam.duration_minutes} Mins</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Pass Mark</span>
                            <span className="font-bold text-emerald-600">{exam.passing_threshold}%</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Attempts</span>
                            <span className="font-bold text-slate-900">{attemptsCount} / {maxAttempts}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-1">
                          {bestAttempt ? (
                            <>
                              <Button
                                onClick={() => handleViewAttemptResult(bestAttempt)}
                                variant="outline"
                                className="flex-1 rounded-xl text-xs font-bold border-slate-300 hover:bg-slate-50 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 mr-1 text-slate-600" />
                                Review Answers &amp; Analysis
                              </Button>

                              {canRetake && (
                                <Button
                                  onClick={() => handleRequestStartExam(exam)}
                                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                                >
                                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                                  Retake Exam
                                </Button>
                              )}
                            </>
                          ) : (
                            <Button
                              onClick={() => handleRequestStartExam(exam)}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold py-2.5 shadow-xs cursor-pointer"
                            >
                              Start Assessment
                              <ArrowRight className="w-4 h-4 ml-1.5" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= VIEW 2: PROCTORED EXAM RUNNER ================= */}
        {examState === "IN_PROGRESS" && activeAssessment && (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Top Bar: Title + Anti-Cheat Status + Timer */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                    {activeAssessment.subject}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                    <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
                    Proctoring Active
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                  {activeAssessment.title}
                </h3>
              </div>

              {/* Timer Display */}
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-base shadow-inner transition-colors ${
                  timeLeft <= 120
                    ? "bg-red-50 border border-red-300 text-red-700 animate-pulse"
                    : "bg-blue-50 border border-blue-200 text-blue-900"
                }`}
              >
                <Clock className="w-4 h-4 text-blue-600 animate-spin" style={{ animationDuration: "8s" }} />
                <span>{formatTimerDisplay(timeLeft)}</span>
              </div>
            </div>

            {/* Main Runner Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Question & Options Area (Left 8 cols) */}
              <div className="lg:col-span-8 space-y-5">
                {currentQ ? (
                  <Card className="border-slate-200 shadow-md rounded-2xl bg-white p-6 space-y-6">
                    {/* Question Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                        Question {currentQuestionIndex + 1} of {totalQuestions}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {currentQ.marks || 10} Marks
                      </span>
                    </div>

                    {/* Question Text */}
                    <h4 className="text-base font-bold text-slate-900 leading-relaxed">
                      {currentQ.question}
                    </h4>

                    {/* Options (A, B, C, D) */}
                    <div className="space-y-3">
                      {currentQ.options?.map((opt, optIdx) => {
                        const optLetter = ["A", "B", "C", "D", "E"][optIdx];
                        const isSelected = selectedAnswers[currentQ.id] === opt;

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectAnswer(currentQ.id, opt)}
                            className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all flex items-center gap-3.5 cursor-pointer ${
                              isSelected
                                ? "bg-blue-50 border-blue-600 text-blue-950 shadow-xs ring-2 ring-blue-100"
                                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                            }`}
                          >
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                                isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {optLetter}
                            </div>
                            <span className="flex-1 leading-relaxed">{opt}</span>
                            {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                          disabled={currentQuestionIndex === 0}
                          className="rounded-xl text-xs font-semibold cursor-pointer"
                        >
                          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                          Previous
                        </Button>

                        {selectedAnswers[currentQ.id] && (
                          <Button
                            variant="ghost"
                            onClick={() => handleClearAnswer(currentQ.id)}
                            className="rounded-xl text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            Clear Selection
                          </Button>
                        )}
                      </div>

                      {currentQuestionIndex < totalQuestions - 1 ? (
                        <Button
                          onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold px-5 cursor-pointer shadow-xs"
                        >
                          Next Question
                          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                        </Button>
                      ) : (
                        <Button
                          onClick={handleSubmitAssessment}
                          disabled={isSubmitting}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold px-6 shadow-xs cursor-pointer"
                        >
                          {isSubmitting ? "Submitting..." : "Submit Examination"}
                          <CheckCircle2 className="w-4 h-4 ml-1.5" />
                        </Button>
                      )}
                    </div>
                  </Card>
                ) : null}
              </div>

              {/* Right Side: Question Navigation Palette */}
              <div className="lg:col-span-4 space-y-4">
                <Card className="border-slate-200 shadow-2xs rounded-2xl bg-white p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-black uppercase tracking-wider text-slate-700">
                      Question Palette
                    </h5>
                    <span className="text-[11px] font-bold text-blue-600">
                      {answeredCount} of {totalQuestions} Answered
                    </span>
                  </div>

                  {/* Legend */}
                  <div className="grid grid-cols-3 gap-1.5 text-[10px] font-semibold text-slate-600 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>Answered</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                      <span>Pending</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                      <span>Current</span>
                    </div>
                  </div>

                  {/* Grid Buttons */}
                  <div className="grid grid-cols-5 gap-2">
                    {activeAssessment.questions?.map((q, idx) => {
                      const isCurrent = currentQuestionIndex === idx;
                      const isAnswered = Boolean(selectedAnswers[q.id]);

                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentQuestionIndex(idx)}
                          className={`h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isCurrent
                              ? "bg-blue-600 text-white ring-2 ring-blue-300 shadow-xs"
                              : isAnswered
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>

                  {/* Big Submit Button */}
                  <div className="pt-3 border-t border-slate-100">
                    <Button
                      onClick={handleSubmitAssessment}
                      disabled={isSubmitting}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs py-2.5 cursor-pointer"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Assessment"}
                    </Button>
                  </div>
                </Card>

                {/* Anti-Cheat Notification Box */}
                <Card className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-800 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Zero-Trust Anti-Cheat Active</span>
                  </div>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    Window blur and tab switches are logged directly to the administration audit center. Please maintain active focus.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* ================= VIEW 3: ASSESSMENT RESULT & DEEP REVIEW ================= */}
        {examState === "RESULT" && examResult && (
          <div className="max-w-3xl mx-auto space-y-6">
            <Card className="border-slate-200 shadow-xl rounded-3xl bg-white overflow-hidden text-center">
              <div className="bg-gradient-to-b from-blue-50/70 via-white to-white p-8 sm:p-10 space-y-6">
                {/* Radial Gauge */}
                <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="text-slate-100"
                      strokeWidth="10"
                      stroke="currentColor"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className={examResult.percentage >= 70 ? "text-emerald-500" : "text-amber-500"}
                      strokeWidth="10"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (251.2 * examResult.percentage) / 100}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-black text-slate-900">
                      {examResult.percentage}%
                    </span>
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      Final Score
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    {examResult.passed ? "Assessment Passed! 🎉" : "Assessment Completed"}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {examResult.passed
                      ? "Congratulations! Your score meets the accreditation standard for internship certificate qualification."
                      : "Good effort. Review the faculty feedback below to prepare for your retake."}
                  </p>
                </div>

                {/* Score Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">Correct</span>
                    <span className="text-lg font-black text-emerald-700">{examResult.correct_count}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                    <span className="text-[10px] font-bold text-red-800 uppercase block">Incorrect</span>
                    <span className="text-lg font-black text-red-700">{examResult.wrong_count}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Score</span>
                    <span className="text-lg font-black text-slate-900">
                      {examResult.score} / {examResult.total_marks}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                    <span className="text-[10px] font-bold text-blue-800 uppercase block">Proctoring</span>
                    <span className="text-xs font-mono font-bold text-blue-900 mt-1 block">
                      {examResult.tab_switch_count === 0 ? "Clean (0 flags)" : `${examResult.tab_switch_count} switches`}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                  <Button
                    onClick={() => setExamState("LIST")}
                    variant="outline"
                    size="lg"
                    className="rounded-xl font-semibold text-xs cursor-pointer"
                  >
                    Back to Examination Catalog
                  </Button>
                </div>
              </div>
            </Card>

            {/* Question-by-Question Deep Dive Analysis */}
            <div className="space-y-4">
              <h4 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                Faculty Question-Level Evaluation &amp; Solutions
              </h4>

              <div className="space-y-4">
                {examResult.evaluations?.map((ev, idx) => (
                  <Card
                    key={ev.question_id || idx}
                    className={`p-5 rounded-2xl border text-xs space-y-3 ${
                      ev.is_correct ? "bg-emerald-50/40 border-emerald-200" : "bg-red-50/40 border-red-200"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <div className="flex items-center gap-2">
                        <span className="bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 text-slate-800 font-bold">
                          Question #{idx + 1}
                        </span>
                        {ev.is_correct ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Correct (+{ev.marks_awarded} pts)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-700 font-bold">
                            <XCircle className="w-3.5 h-3.5 text-red-600" />
                            Incorrect (0 pts)
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm font-bold text-slate-900 leading-relaxed">
                      {ev.question_text}
                    </p>

                    <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1.5">
                      <p className="text-xs">
                        <span className="font-bold text-slate-500">Your Answer: </span>
                        <span className={ev.is_correct ? "text-emerald-700 font-bold" : "text-red-700 font-bold"}>
                          {ev.selected_answer || "Unanswered"}
                        </span>
                      </p>
                      {!ev.is_correct && (
                        <p className="text-xs">
                          <span className="font-bold text-slate-500">Correct Answer: </span>
                          <span className="text-emerald-700 font-bold">{ev.correct_answer}</span>
                        </p>
                      )}
                    </div>

                    {ev.explanation && (
                      <p className="text-xs text-slate-600 bg-white/60 p-3 rounded-xl border border-slate-100 leading-relaxed">
                        <span className="font-bold text-slate-800">Faculty Explanation: </span>
                        {ev.explanation}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: PRE-EXAM INSTRUCTION DIALOG */}
      {pendingStartAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    Start {pendingStartAssessment.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Akash Technolabs Examination Protocol
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPendingStartAssessment(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {startError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{startError}</span>
              </div>
            )}

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <span className="font-bold text-slate-900 block">Examination Guidelines &amp; Rules:</span>
              <ul className="space-y-1.5 text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Duration: <strong>{pendingStartAssessment.duration_minutes} Minutes</strong> (Strict Timer)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Total Questions: <strong>{pendingStartAssessment.questions?.length || 0} Questions</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Passing Threshold: <strong>{pendingStartAssessment.passing_threshold}%</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span><strong>Zero-Cheat Proctoring:</strong> Switching tabs or windows is tracked and audited</span>
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                onClick={() => setPendingStartAssessment(null)}
                className="rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmStartExam}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs px-5 shadow-xs cursor-pointer"
              >
                I Understand, Start Now
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* PROCTORING TAB SWITCH WARNING TOAST MODAL */}
      {showTabSwitchWarning && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-amber-300 space-y-4 text-center">
            <div className="w-14 h-14 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Academic Integrity Warning!
              </h3>
              <p className="text-xs text-amber-800 font-semibold">
                Tab switch or window blur detected ({tabSwitchCount} recorded).
              </p>
              <p className="text-xs text-slate-500 pt-1 leading-relaxed">
                Akash Technolabs monitors active examination window focus. Continued tab switches will result in session invalidation and zero marks.
              </p>
            </div>

            <Button
              onClick={() => setShowTabSwitchWarning(false)}
              className="w-full bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs py-2.5 cursor-pointer"
            >
              Return to Examination Focus
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
