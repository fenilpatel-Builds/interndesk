"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Bot,
  CheckCircle2,
  AlertTriangle,
  X,
  Plus,
  Trash2,
  Database,
  Play,
  FileCheck2,
  Check,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AssessmentQuestion, QuestionType, QuestionDifficulty } from "@/lib/assessments/assessment-store";

interface AIQuestionGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestionsImportedToBank?: (questions: AssessmentQuestion[], count: number) => void;
  onAddToExamBuilder?: (questions: AssessmentQuestion[]) => void;
  onCreateNewExam?: (questions: AssessmentQuestion[], topic: string, subject: string) => void;
}

const PRESET_TOPICS = [
  "React Server Components & Next.js App Router",
  "PostgreSQL Row-Level Security (RLS) & ACID Transactions",
  "Zero-Trust Cybersecurity & Cryptographic Hashing",
  "Python AsyncIO, Event Loops & Coroutines",
  "Docker Multi-Stage Builds & Cloud Microservices",
  "Transformers & Scaled Dot-Product Attention",
];

export function AIQuestionGeneratorModal({
  isOpen,
  onClose,
  onQuestionsImportedToBank,
  onAddToExamBuilder,
  onCreateNewExam,
}: AIQuestionGeneratorModalProps) {
  const [prompt, setPrompt] = useState("");
  const [subject, setSubject] = useState("Full-Stack Web Development");
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>("MEDIUM");
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [questionType, setQuestionType] = useState<QuestionType | "MIXED">("SINGLE_CHOICE");

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [generatedQuestions, setGeneratedQuestions] = useState<AssessmentQuestion[]>([]);
  const [sourceType, setSourceType] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setErrorMessage("Please enter a topic, prompt, or lecture summary.");
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/assessments/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          topic: prompt.trim().substring(0, 40),
          subject,
          difficulty,
          count: questionCount,
          questionType,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "AI generation failed. Please try again.");
      }

      setGeneratedQuestions(data.questions || []);
      setSourceType(data.source === "GEMINI_LIVE_API" ? "Google Gemini 2.0 AI" : "Verified Academic Knowledge Engine");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate questions.";
      setErrorMessage(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteGeneratedQuestion = (idx: number) => {
    setGeneratedQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleImportToQuestionBank = async () => {
    if (generatedQuestions.length === 0) return;
    setIsSaving(true);
    try {
      const payload = {
        isBulk: true,
        questions: generatedQuestions.map((q) => ({
          subject,
          topic: q.topic || subject,
          difficulty: q.difficulty || difficulty,
          type: q.type,
          question: q.question,
          options: q.options || [],
          correct_answer: q.correct_answer || "",
          explanation: q.explanation || "",
          marks: q.marks || 10,
          negative_marks: q.negative_marks || 0,
          tags: ["ai-generated", subject.toLowerCase()],
        })),
      };

      const res = await fetch("/api/admin/question-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to import questions to Question Bank.");
      }

      if (onQuestionsImportedToBank) {
        onQuestionsImportedToBank(generatedQuestions, data.createdCount || generatedQuestions.length);
      }
      onClose();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const totalMarks = generatedQuestions.reduce((sum, q) => sum + (q.marks || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto my-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">
                  AI-Powered Examination & Question Generator
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
                  GEMINI INTEGRATED
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Type any curriculum topic, syllabus snippet, or lecture summary to generate balanced exam questions with verified answers and explanations.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Generator Controls */}
        <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Topic Prompt or Lecture Summary</span>
              <span className="text-[11px] font-normal text-slate-400">Describe what to assess</span>
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Generate 10 MCQs on React Server Components & PostgreSQL Row-Level Security with focus on tenant isolation and streaming."
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white font-medium text-slate-800"
            />
          </div>

          {/* Preset Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500">Quick Prompt Presets:</span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_TOPICS.map((topicPreset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(topicPreset)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white text-slate-700 border border-slate-200 hover:border-purple-400 hover:bg-purple-50 hover:text-purple-700 transition-all"
                >
                  {topicPreset}
                </button>
              ))}
            </div>
          </div>

          {/* Config Controls */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-semibold text-slate-700 outline-none"
              >
                <option value="Full-Stack Web Development">Full-Stack Web Development</option>
                <option value="AI & Machine Learning">AI & Machine Learning</option>
                <option value="Cybersecurity & Cryptography">Cybersecurity & Cryptography</option>
                <option value="Python Cloud Systems">Python Cloud Systems</option>
                <option value="UI/UX Design Systems">UI/UX Design Systems</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as QuestionDifficulty)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-semibold text-slate-700 outline-none"
              >
                <option value="EASY">EASY (Foundational)</option>
                <option value="MEDIUM">MEDIUM (Practicum)</option>
                <option value="HARD">HARD (Enterprise)</option>
                <option value="ADVANCED">ADVANCED (Architect)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600">Questions Count</label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-semibold text-slate-700 outline-none"
              >
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
                <option value={20}>20 Questions</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600">Question Format</label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value as any)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-semibold text-slate-700 outline-none"
              >
                <option value="SINGLE_CHOICE">Single-Choice MCQ</option>
                <option value="MULTIPLE_CHOICE">Multi-Select MCQ</option>
                <option value="TRUE_FALSE">True / False</option>
                <option value="CODING">Programming / Coding</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs py-2 px-6 rounded-xl shadow-md flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing Exam Paper with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Questions with AI</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Generated Questions Preview */}
        {generatedQuestions.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    Generated Questions ({generatedQuestions.length})
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {totalMarks} pts total
                  </span>
                  {sourceType && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                      ⚡ {sourceType}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Every question includes verified answers, distractor options, and explanations.
                </p>
              </div>
            </div>

            <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
              {generatedQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm space-y-2.5 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{q.question}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteGeneratedQuestion(idx)}
                      className="p-1 rounded text-slate-400 hover:text-red-600 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = q.correct_answer === opt;
                        return (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                              isCorrect
                                ? "bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold ring-1 ring-emerald-400"
                                : "bg-slate-50 border-slate-200 text-slate-700"
                            }`}
                          >
                            <span
                              className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                                isCorrect ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="flex-1">{opt}</span>
                            {isCorrect && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 shrink-0">
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                Verified Key
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {q.explanation && (
                    <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-start gap-1.5">
                      <strong className="text-purple-700 shrink-0">Explanation:</strong>
                      <span className="italic">{q.explanation}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="text-xs font-semibold text-slate-600"
              >
                Close
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleImportToQuestionBank}
                  disabled={isSaving}
                  className="text-xs font-bold border-purple-300 text-purple-700 hover:bg-purple-50 flex items-center gap-1.5"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Import {generatedQuestions.length} Qs to Question Bank</span>
                </Button>

                {onAddToExamBuilder && (
                  <Button
                    type="button"
                    onClick={() => {
                      onAddToExamBuilder(generatedQuestions);
                      onClose();
                    }}
                    className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Current Exam</span>
                  </Button>
                )}

                {onCreateNewExam && (
                  <Button
                    type="button"
                    onClick={() => {
                      onCreateNewExam(generatedQuestions, prompt.substring(0, 30), subject);
                      onClose();
                    }}
                    className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Create New Exam</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
