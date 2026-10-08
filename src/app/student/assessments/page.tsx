"use client";

import React, { useState, useEffect, useCallback } from "react";
import { StudentTopbar } from "@/components/student/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Award,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from "lucide-react";

interface ExamQuestion {
  id: string;
  text: string;
  marks: number;
  options: { key: "A" | "B" | "C" | "D"; text: string }[];
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
}

const mockQuestions: ExamQuestion[] = [
  {
    id: "q1",
    text: "Which concept in Next.js allows rendering dynamic React components on the server while keeping client bundles small?",
    marks: 1,
    options: [
      { key: "A", text: "React Server Components (RSC)" },
      { key: "B", text: "Client-Side Hydration only" },
      { key: "C", text: "Static Site Generation without JavaScript" },
      { key: "D", text: "CSS-in-JS Runtime compilation" },
    ],
    correctAnswer: "A",
    explanation: "React Server Components (RSC) execute exclusively on the server, generating lightweight HTML payloads without shipping client-side component code.",
  },
  {
    id: "q2",
    text: "Which PostgreSQL mechanism does InternDesk enforce to isolate each student's attendance and profile data?",
    marks: 1,
    options: [
      { key: "A", text: "Foreign Key Cascades" },
      { key: "B", text: "Row-Level Security (RLS) policies" },
      { key: "C", text: "Manual WHERE clauses only" },
      { key: "D", text: "Database table partitioning" },
    ],
    correctAnswer: "B",
    explanation: "Row-Level Security (RLS) policies at the PostgreSQL database layer ensure queries can only read/write rows owned by the authenticated user ID.",
  },
  {
    id: "q3",
    text: "What is the critical business rule regarding InternDesk student registration?",
    marks: 1,
    options: [
      { key: "A", text: "Students must pay ₹1,000 during registration signup" },
      { key: "B", text: "Registration is 100% free; fees apply only upon program enrollment" },
      { key: "C", text: "Registration requires paying before email verification" },
      { key: "D", text: "Payment is required before admin application review" },
    ],
    correctAnswer: "B",
    explanation: "Registration is completely free with zero signup charges. Course enrollment fees apply only after admin approval when students choose a program.",
  },
  {
    id: "q4",
    text: "How does the InternDesk work session timer prevent inaccurate hours during user idle or tab switching?",
    marks: 1,
    options: [
      { key: "A", text: "Using setInterval tick counting exclusively" },
      { key: "B", text: "Relying on client localStorage counters" },
      { key: "C", text: "Real-time timestamp deltas computed from start timestamps" },
      { key: "D", text: "Refreshing the page every second" },
    ],
    correctAnswer: "C",
    explanation: "Timestamp deltas (Date.now() - startTime) compute real elapsed duration immune to background tab throttling or tick drifting.",
  },
  {
    id: "q5",
    text: "Which REST service validates payment signatures server-side to guarantee cryptographic integrity?",
    marks: 1,
    options: [
      { key: "A", text: "Client-side alert triggers" },
      { key: "B", text: "HMAC-SHA256 signature verification with secret key" },
      { key: "C", text: "Browser local storage tokens" },
      { key: "D", text: "URL query parameter matching" },
    ],
    correctAnswer: "B",
    explanation: "HMAC-SHA256 hashes the order ID and payment ID using the private API secret key to prevent payment manipulation.",
  },
];

export default function StudentAssessmentsPage() {
  const [examState, setExamState] = useState<"LIST" | "IN_PROGRESS" | "RESULT">("LIST");
  const [timeLeft, setTimeLeft] = useState<number>(1478); // 24:38 timer (Section 24)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [examResult, setExamResult] = useState<{
    score: number;
    percentage: number;
    correct: number;
    wrong: number;
    unanswered: number;
    total: number;
    timeTaken: string;
  } | null>(null);

  // Timer runner
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (examState === "IN_PROGRESS" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [examState, timeLeft]);

  const formatTimerDisplay = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleStartExam = () => {
    setExamState("IN_PROGRESS");
    setTimeLeft(1478); // 24:38
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setExamResult(null);
  };

  const handleSelectAnswer = (qId: string, optKey: "A" | "B" | "C" | "D") => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optKey }));
  };

  const handleSubmitAssessment = useCallback(() => {
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;

    mockQuestions.forEach((q) => {
      const chosen = selectedAnswers[q.id];
      if (!chosen) {
        unanswered++;
      } else if (chosen === q.correctAnswer) {
        correct++;
      } else {
        wrong++;
      }
    });

    const percentage = Math.round((correct / mockQuestions.length) * 100);
    const timeSpentSeconds = 1478 - timeLeft;
    const timeTaken = `${Math.floor(timeSpentSeconds / 60)}m ${timeSpentSeconds % 60}s`;

    setExamResult({
      score: correct,
      percentage,
      correct,
      wrong,
      unanswered,
      total: mockQuestions.length,
      timeTaken,
    });
    setExamState("RESULT");
  }, [selectedAnswers, timeLeft]);

  const currentQ = mockQuestions[currentQuestionIndex];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      <StudentTopbar title="MCQ Assessments" studentName="Fenil Patel" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* VIEW 1: ASSESSMENT CATALOG */}
        {examState === "LIST" && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Curriculum Assessments &amp; Knowledge Tests
              </h2>
              <p className="text-xs text-slate-500">
                Timed MCQ evaluations designed to benchmark your progress and qualify for your certificate.
              </p>
            </div>

            <Card className="border-slate-200/90 shadow-sm rounded-2xl bg-white overflow-hidden">
              <CardHeader className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                      Module 2 Assessment
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 font-semibold">25 Minutes</span>
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-900">
                    Assessment: Full Stack &amp; Architecture Fundamentals
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Covers React Server Components, PostgreSQL RLS, Payment Integrations, and Timers.
                  </p>
                </div>

                <Button
                  onClick={handleStartExam}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Start Assessment
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </CardHeader>

              <CardContent className="p-6 text-xs text-slate-600 space-y-3">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                  Assessment Guidelines:
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>5 Multiple Choice Questions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Passing threshold: 70% or higher</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Timer starts automatically once opened</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Server-side anti-cheat scoring evaluation</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {/* VIEW 2: MCQ RUNNER (Section 24) */}
        {examState === "IN_PROGRESS" && (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Top Bar: Title + Timer (Section 24: "24:38") */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Current Assessment
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Assessment: Architecture &amp; Fundamentals
                </h3>
              </div>

              {/* Timer Display */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-mono font-bold text-base shadow-inner">
                <Clock className="w-4 h-4 text-blue-600 animate-spin" style={{ animationDuration: "8s" }} />
                <span>{formatTimerDisplay(timeLeft)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Question & Options Area (Left 8 cols) */}
              <div className="lg:col-span-8 space-y-5">
                <Card className="border-slate-200/90 shadow-md rounded-2xl bg-white p-6 space-y-6">
                  {/* Question Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                      Question {currentQuestionIndex + 1} of {mockQuestions.length}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">1 Mark</span>
                  </div>

                  {/* Question Text */}
                  <h4 className="text-base font-bold text-slate-900 leading-relaxed">
                    {currentQ.text}
                  </h4>

                  {/* Answer Options: A, B, C, D */}
                  <div className="space-y-3">
                    {currentQ.options.map((opt) => {
                      const isSelected = selectedAnswers[currentQ.id] === opt.key;
                      return (
                        <button
                          key={opt.key}
                          onClick={() => handleSelectAnswer(currentQ.id, opt.key)}
                          className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all flex items-center gap-3.5 ${
                            isSelected
                              ? "bg-blue-50 border-blue-600 text-blue-950 shadow-xs ring-2 ring-blue-100"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                              isSelected
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {opt.key}
                          </div>
                          <span className="flex-1">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Question Navigation Controls */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                      disabled={currentQuestionIndex === 0}
                      className="rounded-xl text-xs"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                      Previous
                    </Button>

                    {currentQuestionIndex < mockQuestions.length - 1 ? (
                      <Button
                        onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold px-5"
                      >
                        Next Question
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmitAssessment}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold px-6 shadow-xs"
                      >
                        Submit Assessment
                        <CheckCircle2 className="w-4 h-4 ml-1.5" />
                      </Button>
                    )}
                  </div>
                </Card>
              </div>

              {/* Right Side: Question Navigation Palette (Section 24) */}
              <div className="lg:col-span-4 space-y-4">
                <Card className="border-slate-200/90 shadow-2xs rounded-2xl bg-white p-5 space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Question Palette
                  </h5>

                  {/* Indicator Legend */}
                  <div className="grid grid-cols-3 gap-2 text-[10px] font-semibold text-slate-600 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>Answered</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                      <span>Unanswered</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                      <span>Current</span>
                    </div>
                  </div>

                  {/* Question Grid Buttons */}
                  <div className="grid grid-cols-5 gap-2">
                    {mockQuestions.map((q, idx) => {
                      const isCurrent = currentQuestionIndex === idx;
                      const isAnswered = Boolean(selectedAnswers[q.id]);

                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentQuestionIndex(idx)}
                          className={`h-9 rounded-xl text-xs font-bold transition-all ${
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

                  {/* Big Submit Button (Section 24) */}
                  <div className="pt-3 border-t border-slate-100">
                    <Button
                      onClick={handleSubmitAssessment}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs py-2.5"
                    >
                      Submit Assessment
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: ASSESSMENT RESULT SCREEN (Section 25) */}
        {examState === "RESULT" && examResult && (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="border-emerald-200 shadow-xl rounded-3xl bg-white text-center overflow-hidden">
              <div className="bg-gradient-to-b from-blue-50/80 via-white to-white p-8 sm:p-10 space-y-6">
                {/* Large Animated Score (Section 25: e.g. 86%) */}
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
                    {examResult.percentage >= 70 ? "Assessment Passed! 🎉" : "Assessment Completed"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {examResult.percentage >= 70
                      ? "Congratulations! Your score meets the criteria for certificate qualification."
                      : "Good effort. Review the question analysis below to improve your score."}
                  </p>
                </div>

                {/* Question-Level Analysis (Section 25) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">Correct</span>
                    <span className="text-lg font-black text-emerald-700">{examResult.correct}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                    <span className="text-[10px] font-bold text-red-800 uppercase block">Incorrect</span>
                    <span className="text-lg font-black text-red-700">{examResult.wrong}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Unanswered</span>
                    <span className="text-lg font-black text-slate-700">{examResult.unanswered}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                    <span className="text-[10px] font-bold text-blue-800 uppercase block">Time Taken</span>
                    <span className="text-xs font-mono font-bold text-blue-900 mt-1 block">
                      {examResult.timeTaken}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                  <Button
                    onClick={handleStartExam}
                    variant="outline"
                    size="lg"
                    className="rounded-xl font-semibold"
                  >
                    <RotateCcw className="w-4 h-4 mr-1.5" />
                    Retake Assessment
                  </Button>
                  <Button
                    onClick={() => setExamState("LIST")}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
                  >
                    Back to Curriculum
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
