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
  ShieldCheck,
  HelpCircle,
  BookOpen,
  Eye,
  Check,
  AlertCircle,
  X,
  FileCheck2,
  Maximize2,
  Minimize2,
  CloudCheck,
  RefreshCw,
  Code2,
  FileText,
  ListFilter,
  Flame,
  CheckSquare,
  Square,
  Play,
  Printer,
  ChevronRight,
  Sparkles,
  Lock,
} from "lucide-react";
import { Assessment, AssessmentQuestion, AssessmentAttempt, QuestionType } from "@/lib/assessments/assessment-store";
import { SandboxedCodeEditor } from "@/components/assessments/sandboxed-code-editor";

export default function StudentAssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>([]);
  const [studentEmail, setStudentEmail] = useState<string>("fenil.patel@akashtechnolabs.com");
  const [studentName, setStudentName] = useState<string>("Fenil Patel");
  const [isLoading, setIsLoading] = useState(true);

  // Exam Runner States
  const [examState, setExamState] = useState<"LIST" | "IN_PROGRESS" | "RESULT">("LIST");
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, any>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [visitedQuestions, setVisitedQuestions] = useState<Set<string>>(new Set());

  // Timer & Sync States
  const [timeLeft, setTimeLeft] = useState<number>(1500); // in seconds
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<"SAVED" | "SAVING" | "OFFLINE">("SAVED");
  const [lastSavedTime, setLastSavedTime] = useState<string>("");

  // Sectional Timing & Multi-Part Exam States
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0);
  const [sectionTimeLeft, setSectionTimeLeft] = useState<number>(600); // in seconds

  // Anti-Cheat Proctoring States
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const [fullscreenExitCount, setFullscreenExitCount] = useState<number>(0);
  const [showTabSwitchWarning, setShowTabSwitchWarning] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState(false);
  const [examResult, setExamResult] = useState<AssessmentAttempt | null>(null);

  // Pre-exam instruction dialog state
  const [pendingStartAssessment, setPendingStartAssessment] = useState<Assessment | null>(null);
  const [rulesAccepted, setRulesAccepted] = useState<boolean>(false);
  const [startError, setStartError] = useState<string | null>(null);

  // Filter tab in catalog view
  const [catalogFilter, setCatalogFilter] = useState<"ALL" | "AVAILABLE" | "COMPLETED">("ALL");

  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load student auth session & exam catalog
  const loadData = async () => {
    try {
      const authRes = await fetch("/api/auth/me").then((r) => (r.ok ? r.json() : null)).catch(() => null);
      let email = "fenil.patel@akashtechnolabs.com";
      let name = "Fenil Patel";

      if (authRes?.user?.email) {
        email = authRes.user.email;
        name = authRes.user.name || name;
        setStudentEmail(email);
        setStudentName(name);
      }

      const [asmRes, attRes] = await Promise.all([
        fetch("/api/assessments").then((r) => r.json()),
        fetch(`/api/student/assessments/attempts?email=${encodeURIComponent(email)}`).then((r) => r.json()),
      ]);

      if (asmRes.success && Array.isArray(asmRes.assessments)) {
        setAssessments(asmRes.assessments);
      }

      if (attRes.success && Array.isArray(attRes.attempts)) {
        setAttempts(attRes.attempts);
      }
    } catch (err) {
      console.error("Error loading assessment data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Advance Section or Submit on section expiration
  const handleSectionExpireOrProceed = () => {
    if (!activeAssessment?.sections || activeAssessment.sections.length === 0) return;
    const nextIdx = currentSectionIndex + 1;
    if (nextIdx < activeAssessment.sections.length) {
      const nextSec = activeAssessment.sections[nextIdx];
      setCurrentSectionIndex(nextIdx);
      setSectionTimeLeft(nextSec.duration_minutes * 60);

      // Find first question index of new section
      const firstQId = nextSec.question_ids[0];
      const foundQIdx = activeAssessment.questions.findIndex((q) => q.id === firstQId);
      if (foundQIdx !== -1) {
        setCurrentQuestionIndex(foundQIdx);
      }
    } else {
      // Last section completed -> auto submit assessment
      handleSubmitAssessment(true);
    }
  };

  // Server-Authoritative Timer Runner with Sectional Countdown Support
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (examState === "IN_PROGRESS" && expiresAt) {
      timer = setInterval(() => {
        const now = Date.now();
        const expiryMs = new Date(expiresAt).getTime();
        const remaining = Math.max(0, Math.floor((expiryMs - now) / 1000));
        setTimeLeft(remaining);

        // Section Countdown
        if (activeAssessment?.sections && activeAssessment.sections.length > 0) {
          setSectionTimeLeft((prevSec) => {
            if (prevSec <= 1) {
              handleSectionExpireOrProceed();
              return 0;
            }
            return prevSec - 1;
          });
        }

        if (remaining <= 0) {
          clearInterval(timer);
          // Auto submit on time expiry
          handleSubmitAssessment(true);
        }
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [examState, expiresAt, activeAssessment, currentSectionIndex]);

  // Periodic session sync every 30 seconds
  useEffect(() => {
    let syncInterval: NodeJS.Timeout;
    if (examState === "IN_PROGRESS" && sessionId) {
      syncInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/student/assessments/session?sessionId=${sessionId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && typeof data.remainingSeconds === "number") {
              setTimeLeft(data.remainingSeconds);
              if (data.isExpired) {
                handleSubmitAssessment(true);
              }
            }
          }
        } catch {}
      }, 30000);
    }
    return () => {
      if (syncInterval) clearInterval(syncInterval);
    };
  }, [examState, sessionId]);

  // Continuous Autosave Debouncer
  const triggerAutosave = useCallback(
    (newAnswers: Record<string, any>, newMarked: Set<string>, newVisited: Set<string>) => {
      if (!sessionId || examState !== "IN_PROGRESS") return;

      setSyncStatus("SAVING");
      if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);

      autosaveTimeoutRef.current = setTimeout(async () => {
        try {
          const res = await fetch("/api/student/assessments/autosave", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              answers: newAnswers,
              markedForReview: Array.from(newMarked),
              visitedQuestions: Array.from(newVisited),
              tabSwitchCount,
              fullscreenExitCount,
            }),
          });
          if (res.ok) {
            setSyncStatus("SAVED");
            setLastSavedTime(
              new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
            );
          } else {
            setSyncStatus("OFFLINE");
          }
        } catch {
          setSyncStatus("OFFLINE");
        }
      }, 800);
    },
    [sessionId, examState, tabSwitchCount, fullscreenExitCount]
  );

  // Anti-Cheat: Proctoring Event Listeners
  useEffect(() => {
    if (examState !== "IN_PROGRESS") return;

    const logViolation = async (type: "TAB_SWITCH" | "BLUR" | "FULLSCREEN_EXIT", details: string) => {
      if (!sessionId) return;
      try {
        const res = await fetch("/api/student/assessments/log-activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, type, details }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.autoSubmitTriggered) {
            alert("Security Violation Limit Exceeded! Your examination will now be automatically submitted.");
            handleSubmitAssessment(true);
          }
        }
      } catch {}
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const next = prev + 1;
          setWarningMessage(`Tab switch / background app detected (Violation #${next}).`);
          setShowTabSwitchWarning(true);
          logViolation("TAB_SWITCH", `Tab switched or document hidden #${next}`);
          return next;
        });
      }
    };

    const handleWindowBlur = () => {
      setTabSwitchCount((prev) => {
        const next = prev + 1;
        setWarningMessage(`Exam window lost focus (Violation #${next}).`);
        setShowTabSwitchWarning(true);
        logViolation("BLUR", `Window lost focus #${next}`);
        return next;
      });
    };

    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      if (!isFull) {
        setFullscreenExitCount((prev) => {
          const next = prev + 1;
          setWarningMessage(`Exited full screen mode (Violation #${next}). Please re-enter full screen immediately.`);
          setShowTabSwitchWarning(true);
          logViolation("FULLSCREEN_EXIT", `Exited full screen #${next}`);
          return next;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [examState, sessionId]);

  // Request Fullscreen
  const enterFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {}
  };

  // Launch pre-exam review modal
  const handleRequestStartExam = (asm: Assessment) => {
    setStartError(null);
    setRulesAccepted(false);
    setPendingStartAssessment(asm);
  };

  // Start exam session
  const handleConfirmStartExam = async () => {
    if (!pendingStartAssessment || !rulesAccepted) return;
    setStartError(null);

    try {
      const res = await fetch("/api/student/assessments/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId: pendingStartAssessment.id,
          email: studentEmail,
          studentName: studentName,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setStartError(data.error || "Cannot start exam session.");
        return;
      }

      // Initialize session state
      setActiveAssessment(data.assessment || pendingStartAssessment);
      setSessionId(data.sessionId);
      setExpiresAt(data.expiresAt);
      setSelectedAnswers(data.savedAnswers || {});
      setMarkedForReview(new Set(data.markedForReview || []));

      const firstQId = data.assessment?.questions?.[0]?.id;
      const initialVisited = new Set<string>(data.visitedQuestions || (firstQId ? [firstQId] : []));
      setVisitedQuestions(initialVisited);

      setCurrentQuestionIndex(0);
      setTabSwitchCount(data.tabSwitchCount || 0);
      setFullscreenExitCount(data.fullscreenExitCount || 0);
      setShowTabSwitchWarning(false);
      setExamResult(null);

      const durationSec = (data.durationMinutes || pendingStartAssessment.duration_minutes || 25) * 60;
      setTimeLeft(durationSec);

      if (pendingStartAssessment.sections && pendingStartAssessment.sections.length > 0) {
        setCurrentSectionIndex(0);
        setSectionTimeLeft(pendingStartAssessment.sections[0].duration_minutes * 60);
      } else {
        setCurrentSectionIndex(0);
        setSectionTimeLeft(durationSec);
      }
      setPendingStartAssessment(null);
      setExamState("IN_PROGRESS");

      // Auto trigger fullscreen
      enterFullscreen();
    } catch {
      setStartError("Network error starting examination. Please check connection.");
    }
  };

  // Select or update answer - MCQ One-Time Selection Rule
  const handleAnswerChange = (qId: string, answer: any) => {
    // Once an option is clicked for single-choice or true/false, lock it permanently
    const activeQ = activeAssessment?.questions.find((q) => q.id === qId);
    if (activeQ && (activeQ.type === "SINGLE_CHOICE" || activeQ.type === "TRUE_FALSE")) {
      const existing = selectedAnswers[qId];
      if (existing !== undefined && existing !== null && existing !== "") {
        return; // Locked! Per examination rules, answer cannot be changed once selected
      }
    }
    const updated = { ...selectedAnswers, [qId]: answer };
    setSelectedAnswers(updated);
    triggerAutosave(updated, markedForReview, visitedQuestions);
  };

  // Clear answer
  const handleClearAnswer = (qId: string) => {
    const activeQ = activeAssessment?.questions.find((q) => q.id === qId);
    if (activeQ && (activeQ.type === "SINGLE_CHOICE" || activeQ.type === "TRUE_FALSE")) {
      return; // Locked! One-time selected MCQ answers cannot be cleared
    }
    const updated = { ...selectedAnswers };
    delete updated[qId];
    setSelectedAnswers(updated);
    triggerAutosave(updated, markedForReview, visitedQuestions);
  };

  // Toggle Mark for Review
  const handleToggleMarkForReview = (qId: string) => {
    const updated = new Set(markedForReview);
    if (updated.has(qId)) {
      updated.delete(qId);
    } else {
      updated.add(qId);
    }
    setMarkedForReview(updated);
    triggerAutosave(selectedAnswers, updated, visitedQuestions);
  };

  // Navigate to Question
  const handleJumpToQuestion = (index: number) => {
    if (!activeAssessment || !activeAssessment.questions[index]) return;
    const targetQId = activeAssessment.questions[index].id;
    const nextVisited = new Set(visitedQuestions);
    nextVisited.add(targetQId);
    setVisitedQuestions(nextVisited);
    setCurrentQuestionIndex(index);
    triggerAutosave(selectedAnswers, markedForReview, nextVisited);
  };

  // Navigation handlers
  const handleNextQuestion = () => {
    if (!activeAssessment) return;
    if (currentQuestionIndex < activeAssessment.questions.length - 1) {
      handleJumpToQuestion(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      handleJumpToQuestion(currentQuestionIndex - 1);
    }
  };

  // Submit assessment
  const handleSubmitAssessment = useCallback(
    async (force: boolean = false) => {
      if (!activeAssessment || isSubmitting) return;

      setIsSubmitting(true);
      setShowSubmitConfirmModal(false);

      const totalDurationSec = (activeAssessment.duration_minutes || 25) * 60;
      const elapsedSec = Math.max(1, totalDurationSec - timeLeft);

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
            fullscreenExitCount: fullscreenExitCount,
            timeSpentSeconds: elapsedSec,
            sessionId: sessionId,
          }),
        });

        const data = await res.json();
        if (data.success && data.attempt) {
          setExamResult(data.attempt);
          setAttempts((prev) => [data.attempt, ...prev.filter((a) => a.id !== data.attempt.id)]);
          setExamState("RESULT");

          // Exit fullscreen if active
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
          }
        } else {
          alert(data.error || "Failed to submit assessment.");
        }
      } catch {
        alert("Network error submitting assessment.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      activeAssessment,
      isSubmitting,
      timeLeft,
      studentEmail,
      studentName,
      selectedAnswers,
      tabSwitchCount,
      fullscreenExitCount,
      sessionId,
    ]
  );

  // Helper for question palette status: 5 distinct visual states
  const getQuestionPaletteState = (qId: string) => {
    const isAnswered = selectedAnswers[qId] !== undefined && selectedAnswers[qId] !== "";
    const isMarked = markedForReview.has(qId);
    const isVisited = visitedQuestions.has(qId);

    if (isAnswered && isMarked) return "ANSWERED_MARKED"; // Purple with green badge
    if (isMarked) return "MARKED"; // Purple
    if (isAnswered) return "ANSWERED"; // Green
    if (isVisited) return "VISITED_UNANSWERED"; // Red/Orange outline
    return "NOT_VISITED"; // Gray
  };

  const formatTimerDisplay = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Timer warning style calculation
  const getTimerStyle = () => {
    if (timeLeft <= 60) return "bg-red-600 text-white animate-pulse border-red-700 shadow-lg shadow-red-200";
    if (timeLeft <= 300) return "bg-amber-500 text-white border-amber-600";
    if (timeLeft <= 900) return "bg-yellow-100 text-yellow-900 border-yellow-400";
    return "bg-slate-900 text-white border-slate-700";
  };

  // Filter assessments
  const availableAssessments = assessments.filter((a) => {
    const studentAttempts = attempts.filter((att) => att.assessment_id === a.id);
    return studentAttempts.length < a.attempt_limit;
  });

  const completedAssessments = assessments.filter((a) => {
    const studentAttempts = attempts.filter((att) => att.assessment_id === a.id);
    return studentAttempts.length >= a.attempt_limit;
  });

  const displayedAssessments =
    catalogFilter === "AVAILABLE"
      ? availableAssessments
      : catalogFilter === "COMPLETED"
      ? completedAssessments
      : assessments;

  // Counts for palette
  const totalQuestions = activeAssessment?.questions.length || 0;
  const answeredCount = Object.keys(selectedAnswers).filter(
    (k) => selectedAnswers[k] !== undefined && selectedAnswers[k] !== ""
  ).length;
  const markedCount = markedForReview.size;
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 h-full overflow-hidden bg-slate-50 font-sans" onContextMenu={(e) => examState === "IN_PROGRESS" && e.preventDefault()}>
      {/* Topbar only in catalog mode */}
      {examState === "LIST" && <StudentTopbar />}

      {/* ========================================================= */}
      {/* 1. ASSESSMENT CATALOG VIEW                                */}
      {/* ========================================================= */}
      {examState === "LIST" && (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl w-full mx-auto space-y-8">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-start gap-4">
                <div className="bg-white p-2.5 rounded-2xl shadow-md border border-white/20 shrink-0 hidden sm:flex items-center justify-center">
                  <img
                    src="/images/akash-technolabs-header-logo.png"
                    alt="Akash Technolabs"
                    className="h-10 w-auto object-contain"
                  />
                </div>
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide border border-indigo-400/30">
                    <Award className="w-3.5 h-3.5" />
                    Akash Technolabs • Department of Examination & Technical Certification
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Examinations & Skill Assessments
                  </h1>
                  <p className="text-slate-300 text-sm max-w-2xl">
                    Attempt proctored technical evaluations, coding practicums, and module examinations.
                    All attempts are secured by Zero-Trust Proctoring, continuous autosave, and server-authoritative timers.
                  </p>
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="flex gap-4 sm:gap-6 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm shrink-0">
                <div className="text-center">
                  <div className="text-2xl font-black text-indigo-400">{assessments.length}</div>
                  <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Tests</div>
                </div>
                <div className="h-10 w-px bg-white/10" />
                <div className="text-center">
                  <div className="text-2xl font-black text-emerald-400">
                    {attempts.filter((a) => a.passed).length}
                  </div>
                  <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Passed</div>
                </div>
                <div className="h-10 w-px bg-white/10" />
                <div className="text-center">
                  <div className="text-2xl font-black text-amber-400">{attempts.length}</div>
                  <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Attempts</div>
                </div>
              </div>
            </div>
          </div>

          {/* Catalog Filter Tabs */}
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCatalogFilter("ALL")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  catalogFilter === "ALL"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                All Examinations ({assessments.length})
              </button>
              <button
                onClick={() => setCatalogFilter("AVAILABLE")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  catalogFilter === "AVAILABLE"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Available for Attempt ({availableAssessments.length})
              </button>
              <button
                onClick={() => setCatalogFilter("COMPLETED")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  catalogFilter === "COMPLETED"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Completed & Evaluated ({completedAssessments.length})
              </button>
            </div>
          </div>

          {/* Assessments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedAssessments.map((asm) => {
              const studentAttempts = attempts.filter((att) => att.assessment_id === asm.id);
              const attemptsLeft = Math.max(0, asm.attempt_limit - studentAttempts.length);
              const latestAttempt = studentAttempts[0];

              return (
                <Card
                  key={asm.id}
                  className="bg-white border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                >
                  <CardHeader className="p-5 pb-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {asm.subject}
                      </span>
                      {latestAttempt ? (
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            latestAttempt.passed
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {latestAttempt.passed ? "Passed ✓" : "Failed ✕"} ({latestAttempt.percentage}%)
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Ready to Attempt
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {asm.title}
                    </CardTitle>
                    <p className="text-xs text-slate-500 line-clamp-2">{asm.description}</p>
                  </CardHeader>

                  <CardContent className="p-5 pt-0 space-y-4">
                    {/* Metrics Row */}
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center">
                      <div>
                        <div className="text-xs text-slate-400 font-medium">Duration</div>
                        <div className="text-sm font-bold text-slate-700">{asm.duration_minutes}m</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 font-medium">Questions</div>
                        <div className="text-sm font-bold text-slate-700">{asm.questions.length} Qs</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 font-medium">Pass Mark</div>
                        <div className="text-sm font-bold text-slate-700">{asm.passing_threshold}%</div>
                      </div>
                    </div>

                    {/* Security & Attempt Badges */}
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Zero-Trust Proctored</span>
                      </div>
                      <div>
                        Attempts: <strong className="text-slate-800">{studentAttempts.length}/{asm.attempt_limit}</strong>
                      </div>
                    </div>

                    {/* Action Button */}
                    {attemptsLeft > 0 ? (
                      <Button
                        onClick={() => handleRequestStartExam(asm)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        {studentAttempts.length > 0 ? "Retake Examination" : "Start Examination"}
                      </Button>
                    ) : latestAttempt ? (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setExamResult(latestAttempt);
                          setExamState("RESULT");
                        }}
                        className="w-full border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Official Scorecard
                      </Button>
                    ) : (
                      <Button disabled className="w-full bg-slate-100 text-slate-400 font-semibold py-2.5 rounded-lg">
                        Attempts Exhausted
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Recent Submissions & Performance History */}
          {attempts.length > 0 && (
            <div className="space-y-4 pt-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-indigo-600" />
                Official Examination Records & Verified Attempts
              </h2>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <tr>
                        <th className="py-3 px-4">Examination Title</th>
                        <th className="py-3 px-4">Date & Time</th>
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
                          <td className="py-3 px-4 font-semibold text-slate-900">{att.assessment_title}</td>
                          <td className="py-3 px-4 text-slate-500">
                            {new Date(att.submitted_at).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
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
                                  : att.proctoring_flag === "SUSPICIOUS"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-red-50 text-red-700 border border-red-200"
                              }`}
                            >
                              {att.proctoring_flag} ({att.tab_switch_count} tab switches)
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setExamResult(att);
                                setExamState("RESULT");
                              }}
                              className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-semibold text-xs"
                            >
                              Review
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
          </div>
        </main>
      )}

      {/* ========================================================= */}
      {/* 2. PRE-EXAM INSTRUCTION & CODE OF CONDUCT MODAL           */}
      {/* ========================================================= */}
      {pendingStartAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-start gap-3">
                <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs shrink-0 flex items-center justify-center">
                  <img
                    src="/images/akash-technolabs-header-logo.png"
                    alt="Akash Technolabs"
                    className="h-8 w-auto object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Pre-Examination Protocol
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Candidate: <strong className="text-slate-700">{studentName}</strong></span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    {pendingStartAssessment.title}
                  </h2>
                  <p className="text-xs text-slate-500">{pendingStartAssessment.subject} • {pendingStartAssessment.category || "Technical Certification"}</p>
                </div>
              </div>
              <button
                onClick={() => setPendingStartAssessment(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
              <div>
                <div className="text-xs text-slate-400 font-medium">Duration</div>
                <div className="text-sm font-bold text-slate-800">{pendingStartAssessment.duration_minutes} Minutes</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Questions</div>
                <div className="text-sm font-bold text-slate-800">{pendingStartAssessment.questions.length} Items</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Total Marks</div>
                <div className="text-sm font-bold text-slate-800">{pendingStartAssessment.total_marks} Marks</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Passing Mark</div>
                <div className="text-sm font-bold text-emerald-600">{pendingStartAssessment.passing_threshold}%</div>
              </div>
            </div>

            {/* Examination Rules & Security Alerts */}
            <div className="space-y-3 bg-amber-50/60 p-4 rounded-xl border border-amber-200/60 text-xs text-amber-900">
              <div className="font-bold text-sm text-amber-950 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Zero-Trust Examination Rules & Anti-Cheat Monitoring
              </div>
              <ul className="space-y-1.5 list-disc list-inside text-slate-700">
                <li>
                  <strong>Fullscreen Mode Required:</strong> You must remain in full screen. Exiting full screen is logged as a security event.
                </li>
                <li>
                  <strong>Tab Switching Detection:</strong> Switching tabs, opening other applications, or minimizing the browser is strictly monitored and flagged.
                </li>
                <li>
                  <strong>Server-Authoritative Timer:</strong> The countdown timer runs on the cloud server. Refreshing the browser will not reset or extend your timer.
                </li>
                <li>
                  <strong>One-Time Answer Finality:</strong> In Multiple Choice Questions (MCQ) and True/False questions, an option can only be selected ONCE. After clicking, your answer is permanently locked and cannot be changed or cleared.
                </li>
                <li>
                  <strong>Continuous Cloud Autosave:</strong> Your selected answers are continuously autosaved to the server in real-time.
                </li>
                <li>
                  <strong>Auto-Submission:</strong> When the time expires, your exam will be automatically submitted with all saved answers.
                </li>
              </ul>
            </div>

            {startError && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs font-semibold">
                {startError}
              </div>
            )}

            {/* Acknowledgment Checkbox */}
            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={rulesAccepted}
                onChange={(e) => setRulesAccepted(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <span className="text-xs text-slate-700">
                I acknowledge that I am attempting this examination independently without unauthorized assistance.
                I agree to the strict proctoring terms and understand violations may lead to disqualification.
              </span>
            </label>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setPendingStartAssessment(null)}
                className="text-xs font-semibold px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                disabled={!rulesAccepted}
                onClick={handleConfirmStartExam}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow-md"
              >
                Launch Proctored Exam Studio →
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. PROCTORED EXAMINATION RUNNER STUDIO                    */}
      {/* ========================================================= */}
      {examState === "IN_PROGRESS" && activeAssessment && (
        <div className="fixed inset-0 z-40 flex flex-col bg-slate-900 text-slate-100 h-screen w-screen overflow-hidden">
          {/* Top Bar: Proctored Header */}
          <header className="h-16 flex-shrink-0 bg-slate-950 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between z-30 select-none">
            {/* Title & Badge */}
            <div className="flex items-center gap-3">
              <div className="bg-white px-2.5 py-1 rounded-lg shadow-sm border border-white/20 flex items-center justify-center shrink-0">
                <img
                  src="/images/akash-technolabs-header-logo.png"
                  alt="Akash Technolabs"
                  className="h-6 w-auto object-contain"
                />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white tracking-wide truncate max-w-xs sm:max-w-md">
                  {activeAssessment.title}
                </h1>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Candidate: <strong>{studentName}</strong></span>
                  <span>•</span>
                  <span>{activeAssessment.subject}</span>
                </div>
              </div>
            </div>

            {/* Live Timer, Autosave Status & Controls */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Autosave Chip */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs">
                {syncStatus === "SAVING" ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                    <span className="text-indigo-300">Autosaving...</span>
                  </>
                ) : syncStatus === "SAVED" ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-slate-300">Cloud Synced {lastSavedTime && `(${lastSavedTime})`}</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-amber-300">Offline / Local</span>
                  </>
                )}
              </div>

              {/* Authoritative Server Countdown Timer */}
              <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border text-sm font-mono font-bold tracking-wider ${getTimerStyle()}`}>
                <Clock className="w-4 h-4" />
                <span>{formatTimerDisplay(timeLeft)}</span>
              </div>

              {/* Fullscreen Toggle */}
              <button
                onClick={enterFullscreen}
                title="Toggle Fullscreen"
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Submit Exam Button */}
              <Button
                onClick={() => setShowSubmitConfirmModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-md"
              >
                Submit Exam
              </Button>
            </div>
          </header>

          {/* Sectional Timing & Multi-Part Navigation Bar */}
          {activeAssessment.sections && activeAssessment.sections.length > 0 && (
            <div className="flex-shrink-0 bg-slate-950/90 border-b border-slate-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 select-none">
              <div className="flex items-center gap-2 overflow-x-auto">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Parts:</span>
                {activeAssessment.sections.map((sec, sIdx) => {
                  const isActive = sIdx === currentSectionIndex;
                  const isCompleted = sIdx < currentSectionIndex;

                  return (
                    <div
                      key={sec.id}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400"
                          : isCompleted
                          ? "bg-emerald-950/70 text-emerald-300 border border-emerald-800"
                          : "bg-slate-900 text-slate-500 border border-slate-800"
                      }`}
                    >
                      <span>{sec.title}</span>
                      {isActive && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-900/80 text-amber-300 font-mono font-black border border-indigo-500/50">
                          ⏳ Part Time: {formatTimerDisplay(sectionTimeLeft)}
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-[10px] text-emerald-400">✓ Completed</span>
                      )}
                      {!isActive && !isCompleted && (
                        <span className="text-[10px] text-slate-500">🔒 Locked</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Section Cutoff Info & Proceed button */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-slate-400 hidden md:inline">
                  Part Cutoff: <strong className="text-slate-200">{activeAssessment.sections[currentSectionIndex]?.passing_threshold || activeAssessment.passing_threshold}%</strong>
                </span>

                {currentSectionIndex < activeAssessment.sections.length - 1 && (
                  <Button
                    size="sm"
                    onClick={handleSectionExpireOrProceed}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm"
                  >
                    Complete Section & Proceed to Part {currentSectionIndex + 2} →
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Subheader Alert (Warnings) */}
          {timeLeft <= 300 && (
            <div className="flex-shrink-0 bg-amber-500/20 border-b border-amber-500/40 text-amber-200 px-4 py-1.5 text-xs text-center font-bold flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Notice: Under 5 minutes remaining! Review all answers before final submission.
            </div>
          )}

          {/* Main Runner Body: 2 Columns with bounded viewport height */}
          <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
            {/* Left Column: Active Question Workspace - Independent smooth scroll */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 overscroll-contain select-text">
              {activeAssessment.questions[currentQuestionIndex] && (
                (() => {
                  const q = activeAssessment.questions[currentQuestionIndex];
                  const qId = q.id;
                  const currentAnswer = selectedAnswers[qId];
                  const isMarked = markedForReview.has(qId);

                  return (
                    <div className="max-w-4xl w-full mx-auto space-y-6 pb-24">
                      {/* Question Header Card */}
                      <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700/80 space-y-4 shadow-md">
                        <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-extrabold text-indigo-400">
                              Question {currentQuestionIndex + 1}
                            </span>
                            <span className="text-xs text-slate-400">of {activeAssessment.questions.length}</span>
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-700 text-slate-300 uppercase tracking-wider">
                              {q.type.replace("_", " ")}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-emerald-400">+{q.marks} Marks</span>
                            {activeAssessment.negative_mark_rate ? (
                              <span className="text-xs font-bold text-red-400">
                                -{(q.marks * activeAssessment.negative_mark_rate).toFixed(2)} Negative
                              </span>
                            ) : null}
                          </div>
                        </div>

                        {/* Question Prompt */}
                        <div className="text-base sm:text-lg font-semibold text-white leading-relaxed">
                          {q.question}
                        </div>
                      </div>

                      {/* Dynamic Question Format Renderers */}
                      <div className="bg-slate-800/60 rounded-xl p-5 sm:p-6 border border-slate-700/80 space-y-4">
                        {/* 1. SINGLE CHOICE MCQ */}
                        {q.type === "SINGLE_CHOICE" && (() => {
                          const isAnswered = currentAnswer !== undefined && currentAnswer !== null && currentAnswer !== "";
                          return (
                            <div className="space-y-3">
                              {/* One-Time Selection Status Indicator */}
                              <div className="flex items-center justify-between pb-1">
                                {isAnswered ? (
                                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40 animate-in fade-in">
                                    <Lock className="w-3.5 h-3.5" />
                                    Answer Selected & Locked (Final)
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/40">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    One-Time Selection: Clicking an option locks it permanently
                                  </div>
                                )}
                              </div>

                              <div className="space-y-2.5">
                                {(q.options || []).map((opt, oIdx) => {
                                  const letter = String.fromCharCode(65 + oIdx);
                                  const isSelected = currentAnswer === opt;
                                  return (
                                    <button
                                      key={oIdx}
                                      type="button"
                                      disabled={isAnswered}
                                      onClick={() => handleAnswerChange(qId, opt)}
                                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 ${
                                        isSelected
                                          ? "bg-emerald-600/30 border-emerald-500 text-white shadow-lg ring-2 ring-emerald-500/60"
                                          : isAnswered
                                          ? "bg-slate-900/40 border-slate-800 text-slate-500 opacity-50 cursor-not-allowed"
                                          : "bg-slate-900/60 border-slate-700 text-slate-200 hover:bg-slate-700/50 hover:border-slate-500 cursor-pointer"
                                      }`}
                                    >
                                      <div
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                          isSelected
                                            ? "bg-emerald-500 text-white"
                                            : isAnswered
                                            ? "bg-slate-800 text-slate-600 border border-slate-800"
                                            : "bg-slate-800 text-slate-400 border border-slate-700"
                                        }`}
                                      >
                                        {letter}
                                      </div>
                                      <span className="text-sm font-medium flex-1 leading-snug">{opt}</span>
                                      {isSelected && (
                                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 shrink-0 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/60">
                                          <Lock className="w-3 h-3" /> Locked
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}

                        {/* 2. MULTIPLE CHOICE MCQ (Checkboxes) */}
                        {q.type === "MULTIPLE_CHOICE" && (
                          <div className="space-y-3">
                            <p className="text-xs text-indigo-400 font-semibold mb-2">
                              Select all matching correct options:
                            </p>
                            {(q.options || []).map((opt, oIdx) => {
                              const selectedList: string[] = Array.isArray(currentAnswer) ? currentAnswer : [];
                              const isChecked = selectedList.includes(opt);

                              const toggleOption = () => {
                                const next = isChecked
                                  ? selectedList.filter((item) => item !== opt)
                                  : [...selectedList, opt];
                                handleAnswerChange(qId, next);
                              };

                              return (
                                <button
                                  key={oIdx}
                                  type="button"
                                  onClick={toggleOption}
                                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 ${
                                    isChecked
                                      ? "bg-indigo-600/30 border-indigo-500 text-white ring-1 ring-indigo-500"
                                      : "bg-slate-900/60 border-slate-700 text-slate-200 hover:bg-slate-700/50 hover:border-slate-600"
                                  }`}
                                >
                                  <div
                                    className={`w-6 h-6 rounded flex items-center justify-center ${
                                      isChecked ? "bg-indigo-500 text-white" : "bg-slate-800 border border-slate-700 text-transparent"
                                    }`}
                                  >
                                    <Check className="w-4 h-4" />
                                  </div>
                                  <span className="text-sm font-medium flex-1">{opt}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* 3. TRUE / FALSE */}
                        {q.type === "TRUE_FALSE" && (() => {
                          const isAnswered = currentAnswer !== undefined && currentAnswer !== null && currentAnswer !== "";
                          return (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between pb-1">
                                {isAnswered ? (
                                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40 animate-in fade-in">
                                    <Lock className="w-3.5 h-3.5" />
                                    Answer Selected & Locked (Final)
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/40">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    One-Time Selection: Clicking an option locks it permanently
                                  </div>
                                )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {["true", "false"].map((val) => {
                                  const isSelected = String(currentAnswer).toLowerCase() === val;
                                  return (
                                    <button
                                      key={val}
                                      type="button"
                                      disabled={isAnswered}
                                      onClick={() => handleAnswerChange(qId, val)}
                                      className={`p-6 rounded-xl border text-center font-bold text-lg transition-all capitalize flex items-center justify-center gap-2 ${
                                        isSelected
                                          ? "bg-emerald-600 border-emerald-400 text-white shadow-lg ring-2 ring-emerald-400"
                                          : isAnswered
                                          ? "bg-slate-900/40 border-slate-800 text-slate-500 opacity-50 cursor-not-allowed"
                                          : "bg-slate-900/60 border-slate-700 text-slate-300 hover:bg-slate-700/50 cursor-pointer"
                                      }`}
                                    >
                                      {val === "true" ? "✓ True" : "✕ False"}
                                      {isSelected && <Lock className="w-4 h-4 ml-1" />}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}

                        {/* 4. FILL IN THE BLANKS */}
                        {q.type === "FILL_BLANKS" && (
                          <div className="space-y-3">
                            <label className="text-xs font-semibold text-slate-400">Your Answer:</label>
                            <input
                              type="text"
                              value={currentAnswer || ""}
                              onChange={(e) => handleAnswerChange(qId, e.target.value)}
                              placeholder="Type your exact answer here..."
                              className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 text-white text-base outline-none"
                            />
                          </div>
                        )}

                        {/* 5. SHORT ANSWER */}
                        {q.type === "SHORT_ANSWER" && (
                          <div className="space-y-3">
                            <label className="text-xs font-semibold text-slate-400">
                              Concise Answer (1-3 sentences):
                            </label>
                            <textarea
                              rows={3}
                              value={currentAnswer || ""}
                              onChange={(e) => handleAnswerChange(qId, e.target.value)}
                              placeholder="Provide your short explanation..."
                              className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-4 text-white text-sm outline-none resize-none"
                            />
                          </div>
                        )}

                        {/* 6. DESCRIPTIVE / ESSAY */}
                        {q.type === "DESCRIPTIVE" && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs text-slate-400">
                              <span>Comprehensive Descriptive Analysis:</span>
                              <span>
                                Word count: <strong>{(currentAnswer || "").trim().split(/\s+/).filter(Boolean).length}</strong> words
                              </span>
                            </div>
                            <textarea
                              rows={8}
                              value={currentAnswer || ""}
                              onChange={(e) => handleAnswerChange(qId, e.target.value)}
                              placeholder="Write your comprehensive analysis, architectural reasoning, and detailed solution here..."
                              className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-4 text-white text-sm outline-none font-mono"
                            />
                            {q.rubric && (
                              <div className="text-xs text-slate-400 bg-slate-900/60 p-3 rounded-lg border border-slate-700/60">
                                <strong>Evaluation Rubric:</strong> {q.rubric}
                              </div>
                            )}
                          </div>
                        )}

                        {/* 7. CODING / PROGRAMMING (IN-BROWSER CODE RUNNER) */}
                        {q.type === "CODING" && (
                          <div className="space-y-4">
                            <SandboxedCodeEditor
                              questionId={qId}
                              language={q.code_language || "python"}
                              starterCode={q.starter_code}
                              initialCode={currentAnswer !== undefined ? currentAnswer : q.starter_code}
                              testCases={q.test_cases}
                              onCodeChange={(newCode) => handleAnswerChange(qId, newCode)}
                            />
                          </div>
                        )}

                        {/* 8. MATCHING */}
                        {q.type === "MATCHING" && q.matching_pairs && (
                          <div className="space-y-3">
                            <p className="text-xs text-indigo-400 font-semibold">
                              Select the matching correspondence for each item:
                            </p>
                            <div className="space-y-2">
                              {q.matching_pairs.map((pair, pIdx) => {
                                const userMapping = typeof currentAnswer === "object" && currentAnswer ? currentAnswer : {};
                                const selectedRight = userMapping[pair.left] || "";

                                return (
                                  <div
                                    key={pIdx}
                                    className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-700"
                                  >
                                    <div className="font-semibold text-sm text-white w-full sm:w-1/2">
                                      {pair.left}
                                    </div>
                                    <div className="w-full sm:w-1/2 flex items-center gap-2">
                                      <span className="text-slate-500">→</span>
                                      <select
                                        value={selectedRight}
                                        onChange={(e) => {
                                          const next = { ...userMapping, [pair.left]: e.target.value };
                                          handleAnswerChange(qId, next);
                                        }}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
                                      >
                                        <option value="">-- Choose Match --</option>
                                        {q.matching_pairs?.map((p2, p2Idx) => (
                                          <option key={p2Idx} value={p2.right}>
                                            {p2.right}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Question Actions Toolbar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            onClick={() => handleToggleMarkForReview(qId)}
                            className={`border-purple-500/50 text-xs font-semibold ${
                              isMarked
                                ? "bg-purple-600 text-white hover:bg-purple-700"
                                : "text-purple-300 hover:bg-purple-950/40"
                            }`}
                          >
                            {isMarked ? "Unmark Review" : "Mark for Review"}
                          </Button>
                          {(q.type === "SINGLE_CHOICE" || q.type === "TRUE_FALSE") &&
                          currentAnswer !== undefined &&
                          currentAnswer !== null &&
                          currentAnswer !== "" ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 text-emerald-400 border border-slate-700 text-xs font-semibold">
                              <Lock className="w-3.5 h-3.5 text-emerald-400" />
                              Answer Locked
                            </span>
                          ) : (
                            <Button
                              variant="ghost"
                              onClick={() => handleClearAnswer(qId)}
                              className="text-xs text-slate-400 hover:text-white"
                            >
                              Clear Response
                            </Button>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            disabled={currentQuestionIndex === 0}
                            onClick={handlePrevQuestion}
                            className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold"
                          >
                            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                            Previous
                          </Button>

                          {currentQuestionIndex < activeAssessment.questions.length - 1 ? (
                            <Button
                              onClick={handleNextQuestion}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5"
                            >
                              Save & Next
                              <ArrowRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          ) : (
                            <Button
                              onClick={() => setShowSubmitConfirmModal(true)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6"
                            >
                              Final Review & Submit
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>

            {/* Right Column: 5-State Question Palette & Candidate Profile - Independent smooth scroll */}
            <aside className="w-full lg:w-84 flex-shrink-0 bg-slate-950 border-t lg:border-t-0 lg:border-l border-slate-800 p-5 flex flex-col justify-between overflow-y-auto min-h-0 max-h-[45vh] lg:max-h-full overscroll-contain space-y-6 select-none">
              <div className="space-y-6">
                {/* Candidate Overview */}
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Candidate Session</span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Proctored Live
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                      {studentName.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-white truncate">{studentName}</div>
                      <div className="text-xs text-slate-400 truncate">{studentEmail}</div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Anti-Cheat Flags:</span>
                    <span className={`font-bold ${tabSwitchCount > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                      {tabSwitchCount} / 3 Alerts
                    </span>
                  </div>
                </div>

                {/* 5-State Question Palette */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Question Palette
                    </h3>
                    <span className="text-xs font-semibold text-indigo-400">
                      {answeredCount} / {totalQuestions} Answered
                    </span>
                  </div>

                  {/* Grid of question buttons */}
                  <div className="grid grid-cols-5 gap-2 max-h-56 overflow-y-auto pr-1">
                    {activeAssessment.questions.map((q, idx) => {
                      const state = getQuestionPaletteState(q.id);
                      const isCurrent = currentQuestionIndex === idx;

                      let btnStyle = "bg-slate-800 text-slate-300 border-slate-700"; // NOT_VISITED
                      if (state === "ANSWERED") {
                        btnStyle = "bg-emerald-600 text-white border-emerald-500 font-bold";
                      } else if (state === "VISITED_UNANSWERED") {
                        btnStyle = "bg-red-950/60 text-red-300 border-red-700 font-bold";
                      } else if (state === "MARKED") {
                        btnStyle = "bg-purple-900/60 text-purple-300 border-purple-500 font-bold";
                      } else if (state === "ANSWERED_MARKED") {
                        btnStyle = "bg-purple-600 text-white border-purple-400 font-bold";
                      }

                      return (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => handleJumpToQuestion(idx)}
                          className={`h-10 rounded-lg text-xs flex items-center justify-center border transition-all relative ${btnStyle} ${
                            isCurrent ? "ring-2 ring-indigo-400 scale-105 z-10" : ""
                          }`}
                        >
                          {idx + 1}
                          {state === "ANSWERED_MARKED" && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-slate-950" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Palette Color Legend */}
                <div className="space-y-2 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-xs">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Legend Status
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-emerald-600 inline-block" />
                    <span className="text-slate-300">Answered ({answeredCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-red-900 border border-red-700 inline-block" />
                    <span className="text-slate-300">Not Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-purple-600 inline-block" />
                    <span className="text-slate-300">Marked for Review ({markedCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700 inline-block" />
                    <span className="text-slate-300">Not Visited</span>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Submit Action */}
              <div className="pt-4 border-t border-slate-800">
                <Button
                  onClick={() => setShowSubmitConfirmModal(true)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg shadow-lg text-xs"
                >
                  Final Exam Submission
                </Button>
              </div>
            </aside>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. ANTI-CHEAT PROCTORING WARNING MODAL                    */}
      {/* ========================================================= */}
      {showTabSwitchWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 text-center border-2 border-red-500 shadow-2xl space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            <div className="w-14 h-14 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/40">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black text-white">Proctoring Alert!</h3>
            <p className="text-xs text-red-300 leading-relaxed">
              {warningMessage || "A window blur or tab switch was detected by the Zero-Trust Proctor."}
            </p>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
              Security Violation Count: <strong className="text-red-400">{tabSwitchCount} / 3 Allowed</strong>
              <p className="text-[11px] text-slate-400 mt-1">
                Exceeding maximum violations will result in automatic examination submission.
              </p>
            </div>

            <Button
              onClick={() => {
                setShowTabSwitchWarning(false);
                enterFullscreen();
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 rounded-lg"
            >
              I Understand — Return to Exam
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. SUBMIT CONFIRMATION SUMMARY DIALOG                     */}
      {/* ========================================================= */}
      {showSubmitConfirmModal && activeAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-700 shadow-2xl space-y-6 text-white my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold">Confirm Final Examination Submission</h3>
              <button
                onClick={() => setShowSubmitConfirmModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Submission Stats */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                <div className="text-xl font-black text-emerald-400">{answeredCount}</div>
                <div className="text-xs text-slate-400">Answered</div>
              </div>
              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                <div className="text-xl font-black text-amber-400">{unansweredCount}</div>
                <div className="text-xs text-slate-400">Unanswered</div>
              </div>
              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                <div className="text-xl font-black text-purple-400">{markedCount}</div>
                <div className="text-xs text-slate-400">Marked Review</div>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="bg-amber-500/20 border border-amber-500/40 p-3 rounded-xl text-xs text-amber-200">
                <strong>Attention:</strong> You still have <strong>{unansweredCount} unanswered questions</strong>. Once submitted, your answers cannot be modified.
              </div>
            )}

            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to end your examination session and submit your answers for server grading?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowSubmitConfirmModal(false)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold"
              >
                Resume Examination
              </Button>
              <Button
                disabled={isSubmitting}
                onClick={() => handleSubmitAssessment(false)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow-lg"
              >
                {isSubmitting ? "Submitting..." : "Yes, Submit Final Exam"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. RESULT & OFFICIAL SCORECARD VIEW                       */}
      {/* ========================================================= */}
      {examState === "RESULT" && examResult && (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl w-full mx-auto space-y-8">
          {/* Official Scorecard Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            {/* Header with Result Status */}
            <div
              className={`p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 ${
                examResult.passed
                  ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700"
                  : "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="bg-white p-2 rounded-xl shadow-md border border-white/20 shrink-0 hidden sm:flex items-center justify-center">
                  <img
                    src="/images/akash-technolabs-header-logo.png"
                    alt="Akash Technolabs"
                    className="h-10 w-auto object-contain"
                  />
                </div>
                <div className="space-y-1 text-center sm:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white border border-white/30 uppercase tracking-wider">
                    Official Assessment Scorecard
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black">{examResult.assessment_title}</h1>
                  <p className="text-xs sm:text-sm text-white/90">
                    Candidate: <strong>{examResult.student_name}</strong> ({examResult.student_email})
                  </p>
                  <div className="text-[11px] text-white/70 font-mono">
                    Official Verification ID: VRF-AKT-EXAM-{examResult.id.slice(-8).toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Radial Percentage Indicator */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.2)" strokeWidth="8" fill="transparent" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#ffffff"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - examResult.percentage / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <span className="text-2xl font-black">{examResult.percentage}%</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {examResult.passed ? "PASSED" : "FAILED"}
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-slate-200 text-center bg-slate-50/60">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="text-xs text-slate-400 font-medium">Score Awarded</div>
                <div className="text-lg font-black text-slate-800">
                  {examResult.score} / {examResult.total_marks}
                </div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="text-xs text-slate-400 font-medium">Correct Answers</div>
                <div className="text-lg font-black text-emerald-600">{examResult.correct_count} Qs</div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="text-xs text-slate-400 font-medium">Time Spent</div>
                <div className="text-lg font-black text-slate-800">
                  {Math.floor(examResult.time_spent_seconds / 60)}m {examResult.time_spent_seconds % 60}s
                </div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="text-xs text-slate-400 font-medium">Proctor Audit</div>
                <div className="text-lg font-black text-indigo-600">{examResult.proctoring_flag}</div>
              </div>
            </div>

            {/* Sectional Performance & Cutoff Verification Card */}
            {examResult.section_scores && Object.keys(examResult.section_scores).length > 0 && (
              <div className="p-6 border-b border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Sectional Performance & Cutoff Verification
                  </h4>
                  <span className="text-[11px] text-slate-500">All mandatory section cutoffs must be met</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.values(examResult.section_scores).map((sec) => (
                    <div
                      key={sec.section_id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                        sec.passed
                          ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                          : "bg-red-50/70 border-red-200 text-red-950"
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="text-xs font-bold truncate text-slate-900">{sec.title}</div>
                        <div className="text-[11px] text-slate-600">
                          Score: <strong>{sec.earned} / {sec.total}</strong> ({sec.percentage}%) • Cutoff: <strong>{sec.cutoff}%</strong>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 ${
                          sec.passed
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : "bg-red-100 text-red-800 border-red-300"
                        }`}
                      >
                        {sec.passed ? "CUTOFF PASSED" : "CUTOFF FAILED"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending Subjective Evaluations Alert */}
            {examResult.pending_evaluation_count && examResult.pending_evaluation_count > 0 ? (
              <div className="p-4 bg-amber-50 border-b border-amber-200 flex items-center gap-3 text-xs text-amber-900">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <span>
                  Notice: <strong>{examResult.pending_evaluation_count} subjective question(s)</strong> are currently being reviewed by faculty evaluators. Your score will automatically update upon teacher grading.
                </span>
              </div>
            ) : null}

            {/* Detailed Question Review Breakdown */}
            <div className="p-6 space-y-6">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                Detailed Question-by-Question Evaluation
              </h3>

              <div className="space-y-4">
                {(examResult.evaluations || []).map((ev, evIdx) => (
                  <div
                    key={evIdx}
                    className={`p-4 rounded-xl border space-y-3 ${
                      ev.evaluation_status === "PENDING_TEACHER"
                        ? "bg-amber-50/40 border-amber-200"
                        : ev.is_correct
                        ? "bg-emerald-50/40 border-emerald-200"
                        : "bg-red-50/40 border-red-200"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-800">Question {evIdx + 1}</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                          ev.evaluation_status === "PENDING_TEACHER"
                            ? "bg-amber-100 text-amber-800"
                            : ev.is_correct
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {ev.evaluation_status === "PENDING_TEACHER"
                          ? "Pending Faculty Evaluation"
                          : `${ev.marks_awarded} / ${ev.marks_possible} Marks`}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-slate-900">{ev.question_text}</p>

                    <div className="space-y-1.5 text-xs">
                      <div>
                        <span className="text-slate-500 font-medium">Your Submitted Response: </span>
                        <strong className="text-slate-800">
                          {typeof ev.selected_answer === "object"
                            ? JSON.stringify(ev.selected_answer)
                            : String(ev.selected_answer || "Not Answered")}
                        </strong>
                      </div>

                      {ev.correct_answer && (
                        <div>
                          <span className="text-emerald-700 font-medium">Official Correct Key: </span>
                          <strong className="text-emerald-800">{String(ev.correct_answer)}</strong>
                        </div>
                      )}

                      {ev.explanation && (
                        <div className="p-2.5 rounded bg-white/80 border border-slate-200 text-slate-600 mt-2">
                          <strong>Technical Explanation:</strong> {ev.explanation}
                        </div>
                      )}

                      {ev.teacher_feedback && (
                        <div className="p-2.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-900 mt-2">
                          <strong>Faculty Feedback:</strong> {ev.teacher_feedback}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Official Certification & Verification Signatory Block */}
            <div className="p-6 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-600">
              <div className="space-y-1 text-center sm:text-left">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 justify-center sm:justify-start">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Akash Technolabs Examination & Certification Board
                </div>
                <p className="text-[11px] text-slate-500">
                  202, Aarya Arcade, Above Passport Seva Kendra, Mithakhali Six Road, Navrangpura, Ahmedabad-380009
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  Digitally Verified & Certified • Tamper-Evident Examination Hash: SHA256-{(examResult.id + examResult.score).split("").reverse().join("").slice(0, 16)}
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <img
                  src="/images/akash-official-stamp.png"
                  alt="Official Seal"
                  className="h-14 w-auto object-contain opacity-85"
                />
                <div className="text-center sm:text-right space-y-0.5">
                  <img
                    src="/images/akash-ceo-signature.png"
                    alt="Authorized Signature"
                    className="h-8 w-auto object-contain mx-auto sm:ml-auto"
                  />
                  <div className="text-[11px] font-bold text-slate-900">Akash Padhiyar</div>
                  <div className="text-[10px] text-slate-500">CEO & Founder, Akash Technolabs</div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setExamState("LIST")}
                className="text-xs font-semibold"
              >
                ← Back to Assessments Catalog
              </Button>

              <Button
                onClick={() => window.print()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print / Save Scorecard
              </Button>
            </div>
          </div>
        </div>
      </main>
    )}
    </div>
  );
}
