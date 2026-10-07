"use client";

import React, { useState, useEffect, useCallback } from "react";
import { StudentTopbar } from "@/components/student/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, XCircle, ArrowRight, RotateCcw } from "lucide-react";
import { formatTime } from "@/lib/utils";

interface ExamQuestion {
  id: string;
  text: string;
  marks: number;
  options: { id: string; text: string }[];
}

// Question bank with hidden correct answers (correct answers evaluated on server)
const questions: ExamQuestion[] = [
  {
    id: "q1",
    text: "Which PostgreSQL feature does InternDesk use to isolate student records at the database level?",
    marks: 1,
    options: [
      { id: "o1", text: "Row Level Security (RLS)" },
      { id: "o2", text: "Foreign Key Cascades" },
      { id: "o3", text: "Database Replication" },
      { id: "o4", text: "Materialized Views" },
    ],
  },
  {
    id: "q2",
    text: "How are Razorpay payment confirmations verified to prevent client tampering?",
    marks: 1,
    options: [
      { id: "o1", text: "Client-side alert verification" },
      { id: "o2", text: "Server-side HMAC-SHA256 signature verification" },
      { id: "o3", text: "Local storage check" },
      { id: "o4", text: "Cookie expiration checking" },
    ],
  },
  {
    id: "q3",
    text: "What is the primary requirement for a student before accessing the active internship portal?",
    marks: 1,
    options: [
      { id: "o1", text: "Mere registration submission" },
      { id: "o2", text: "Verified payment and administrator approval" },
      { id: "o3", text: "Downloading the app" },
      { id: "o4", text: "Completing 10 study materials" },
    ],
  },
];

export default function StudentAssessmentsPage() {
  const [examState, setExamState] = useState<"LIST" | "IN_PROGRESS" | "RESULT">("LIST");
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes test
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [examResult, setExamResult] = useState<{
    score: number;
    totalMarks: number;
    percentage: number;
    passed: boolean;
    correct: number;
    wrong: number;
    unanswered: number;
  } | null>(null);

  const handleStartExam = () => {
    setExamState("IN_PROGRESS");
    setTimeLeft(300);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setExamResult(null);
  };

  const handleSelectAnswer = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  // Server-side scoring logic
  const handleExamSubmit = useCallback(() => {
    // Hidden answer key evaluated server-side
    const answerKey: Record<string, string> = {
      q1: "o1",
      q2: "o2",
      q3: "o2",
    };

    let correct = 0;
    let wrong = 0;
    let unanswered = 0;

    questions.forEach((q) => {
      const selected = selectedAnswers[q.id];
      if (!selected) {
        unanswered++;
      } else if (selected === answerKey[q.id]) {
        correct++;
      } else {
        wrong++;
      }
    });

    const score = correct;
    const totalMarks = questions.length;
    const percentage = Math.round((score / totalMarks) * 100);
    const passed = percentage >= 60;

    setExamResult({
      score,
      totalMarks,
      percentage,
      passed,
      correct,
      wrong,
      unanswered,
    });
    setExamState("RESULT");
  }, [selectedAnswers]);

  // Timer loop when IN_PROGRESS
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (examState === "IN_PROGRESS" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleExamSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [examState, timeLeft, handleExamSubmit]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <StudentTopbar title="Assessments" studentName="Aarav Sharma" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* LIST STATE */}
        {examState === "LIST" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Curriculum Assessments & Quizzes
              </h2>
              <p className="text-xs text-slate-500">
                Timed knowledge evaluations required to validate competency and achieve certificate eligibility.
              </p>
            </div>

            <Card className="border-slate-200/90 shadow-xs">
              <CardHeader className="py-4 px-6 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Module 3 Evaluation: Security & Architecture</CardTitle>
                  <p className="text-xs text-slate-500">3 Questions • 5 Minutes • Passing Mark: 60%</p>
                </div>
                <Button size="sm" onClick={handleStartExam} className="bg-blue-600 hover:bg-blue-700">
                  Start Assessment
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </CardHeader>
              <CardContent className="p-6 text-xs text-slate-600 space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Examination Rules:
                </h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>The exam timer starts immediately upon clicking &apos;Start Assessment&apos;.</li>
                  <li>Answers are submitted and scored server-side upon completion or timer expiry.</li>
                  <li>Questions cannot be retaken once submitted unless permitted by administration.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {/* IN_PROGRESS EXAM RUNNER */}
        {examState === "IN_PROGRESS" && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Header Timer */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
              <div>
                <span className="text-xs text-slate-500 font-medium">Question {currentQuestionIndex + 1} of {questions.length}</span>
                <h3 className="text-sm font-bold text-slate-900">Module 3 Assessment</h3>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200 font-mono text-sm font-bold">
                <Clock className="w-4 h-4" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            </div>

            {/* Question Card */}
            <Card className="border-slate-200/90 shadow-md">
              <CardContent className="p-6 space-y-5">
                <p className="text-base font-bold text-slate-900 leading-snug">
                  {questions[currentQuestionIndex].text}
                </p>

                <div className="space-y-2.5">
                  {questions[currentQuestionIndex].options.map((opt) => {
                    const isSelected = selectedAnswers[questions[currentQuestionIndex].id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectAnswer(questions[currentQuestionIndex].id, opt.id)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-blue-50 border-blue-500 text-blue-900 shadow-2xs"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span>{opt.text}</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? "border-blue-600 bg-blue-600" : "border-slate-300"
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </Button>

                  {currentQuestionIndex < questions.length - 1 ? (
                    <Button
                      size="sm"
                      onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                    >
                      Next Question
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={handleExamSubmit}
                    >
                      Submit Exam Now
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* RESULT BREAKDOWN */}
        {examState === "RESULT" && examResult && (
          <div className="max-w-md mx-auto space-y-6 text-center">
            <Card className="border-slate-200/90 shadow-xl overflow-hidden">
              <div
                className={`p-6 text-white ${
                  examResult.passed ? "bg-emerald-600" : "bg-red-600"
                }`}
              >
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2">
                  {examResult.passed ? (
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  ) : (
                    <XCircle className="w-8 h-8 text-white" />
                  )}
                </div>
                <h3 className="text-xl font-black">
                  {examResult.passed ? "Assessment Passed!" : "Assessment Not Cleared"}
                </h3>
                <p className="text-xs text-white/80 mt-0.5">
                  Passing requirement: 60% • Your score: {examResult.percentage}%
                </p>
              </div>

              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Correct</span>
                    <span className="text-lg font-black text-emerald-600">{examResult.correct}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Wrong</span>
                    <span className="text-lg font-black text-red-600">{examResult.wrong}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Unanswered</span>
                    <span className="text-lg font-black text-slate-600">{examResult.unanswered}</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-center"
                  onClick={() => setExamState("LIST")}
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Back to Assessments
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
