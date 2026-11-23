"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  FileCode,
  Download,
  CheckCircle2,
  AlertTriangle,
  X,
  HelpCircle,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AssessmentQuestion, QuestionType } from "@/lib/assessments/assessment-store";
import {
  ParsedExamMetadata,
  parseExcelOrCsvBuffer,
  parseJsonExamContent,
} from "@/lib/assessments/exam-file-parser";

interface ExamFileDropzoneProps {
  mode: "CREATE_EXAM" | "QUESTION_BANK" | "INLINE_APPEND";
  onExamCreated?: (assessment: any) => void;
  onQuestionsImported?: (questions: AssessmentQuestion[], count: number) => void;
  onClose?: () => void;
}

export function ExamFileDropzone({
  mode,
  onExamCreated,
  onQuestionsImported,
  onClose,
}: ExamFileDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Parsed state
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);
  const [parsedMetadata, setParsedMetadata] = useState<ParsedExamMetadata | null>(null);
  const [parsedQuestions, setParsedQuestions] = useState<AssessmentQuestion[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [examStatus, setExamStatus] = useState<"PUBLISHED" | "DRAFT">("PUBLISHED");

  // Handle Drag events with dragCounter to prevent child flickering
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current <= 0) {
      setIsDragging(false);
      dragCounter.current = 0;
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      await processSelectedFile(file);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await processSelectedFile(file);
    }
  };

  // Process file via Client-Side parser with Server-Side fallback
  const processSelectedFile = async (file: File) => {
    setErrorMessage(null);
    setIsProcessing(true);

    const ext = file.name.toLowerCase().split(".").pop() || "";

    try {
      // 1. Direct client-side parsing for instant Excel/CSV/JSON processing
      if (ext === "xlsx" || ext === "xls" || ext === "csv") {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const clientResult = parseExcelOrCsvBuffer(new Uint8Array(arrayBuffer), file.name);
          if (clientResult.success && clientResult.questions.length > 0) {
            setCurrentFileName(file.name);
            setParsedMetadata(clientResult.metadata);
            setParsedQuestions(clientResult.questions);
            setWarnings(clientResult.warnings || []);
            setIsProcessing(false);
            return;
          }
        } catch {
          // Fall back to server API
        }
      } else if (ext === "json") {
        try {
          const text = await file.text();
          const clientResult = parseJsonExamContent(text);
          if (clientResult.success && clientResult.questions.length > 0) {
            setCurrentFileName(file.name);
            setParsedMetadata(clientResult.metadata);
            setParsedQuestions(clientResult.questions);
            setWarnings(clientResult.warnings || []);
            setIsProcessing(false);
            return;
          }
        } catch {
          // Fall back to server API
        }
      }

      // 2. Server API processing (handles PDFs and complex files)
      const formData = new FormData();
      formData.append("file", file);
      formData.append("action", "PREVIEW");

      const res = await fetch("/api/admin/assessments/import-file", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to parse file. Please verify file format.");
      }

      setCurrentFileName(file.name);
      setParsedMetadata(data.metadata);
      setParsedQuestions(data.questions || []);
      setWarnings(data.warnings || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error processing file.";
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Download template
  const handleDownloadTemplate = (format: "excel" | "csv" | "json") => {
    window.open(`/api/admin/assessments/import-file?format=${format}`, "_blank");
  };

  // Reset to dropzone
  const handleReset = () => {
    setCurrentFileName(null);
    setParsedMetadata(null);
    setParsedQuestions([]);
    setWarnings([]);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Modify question in preview
  const handleUpdateQuestion = (idx: number, updates: Partial<AssessmentQuestion>) => {
    setParsedQuestions((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...updates };
      return copy;
    });
  };

  const handleDeleteQuestion = (idx: number) => {
    setParsedQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  // Submit / Save Action
  const handleFinalSubmit = async () => {
    if (!parsedQuestions || parsedQuestions.length === 0) {
      setErrorMessage("Please ensure at least 1 valid question is present.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      if (mode === "CREATE_EXAM") {
        const payload = {
          action: "CREATE_EXAM",
          metadata: {
            title: parsedMetadata?.title || "Technical Assessment",
            subject: parsedMetadata?.subject || "Computer Science",
            description: parsedMetadata?.description || "Technical assessment created via file import.",
            duration_minutes: parsedMetadata?.duration_minutes || 30,
            passing_threshold: parsedMetadata?.passing_threshold || 70,
            attempt_limit: parsedMetadata?.attempt_limit || 2,
            status: examStatus,
          },
          questions: parsedQuestions,
        };

        const res = await fetch("/api/admin/assessments/import-file", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to create examination.");
        }

        if (onExamCreated) onExamCreated(data.assessment);
        if (onClose) onClose();
      } else if (mode === "QUESTION_BANK") {
        const payload = {
          action: "IMPORT_QUESTION_BANK",
          metadata: parsedMetadata,
          questions: parsedQuestions,
        };

        const res = await fetch("/api/admin/assessments/import-file", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to import questions to Question Bank.");
        }

        if (onQuestionsImported) onQuestionsImported(parsedQuestions, data.createdCount || parsedQuestions.length);
        if (onClose) onClose();
      } else if (mode === "INLINE_APPEND") {
        if (onQuestionsImported) onQuestionsImported(parsedQuestions, parsedQuestions.length);
        if (onClose) onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to complete operation.";
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate totals
  const totalMarks = parsedQuestions.reduce((sum, q) => sum + (q.marks || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Templates */}
      {!parsedMetadata && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-indigo-900/10 via-slate-900/5 to-emerald-900/10 border border-indigo-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Smart Document & Spreadsheet Importer</span>
            </div>
            <p className="text-xs text-slate-600">
              Drop an Excel spreadsheet, CSV, PDF question paper, or JSON file to automatically extract questions and answers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleDownloadTemplate("excel")}
              className="text-xs font-semibold border-emerald-200 text-emerald-800 hover:bg-emerald-50 bg-emerald-50/50"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              Excel Template (.xlsx)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleDownloadTemplate("csv")}
              className="text-xs font-semibold border-blue-200 text-blue-800 hover:bg-blue-50 bg-blue-50/50"
            >
              <FileText className="w-3.5 h-3.5 mr-1 text-blue-600" />
              CSV (.csv)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleDownloadTemplate("json")}
              className="text-xs font-semibold border-amber-200 text-amber-800 hover:bg-amber-50 bg-amber-50/50"
            >
              <FileCode className="w-3.5 h-3.5 mr-1 text-amber-600" />
              JSON Schema
            </Button>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="font-bold">Import Warning: </strong>
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* DROPZONE SURFACE (WHEN NO FILE PARSED YET) */}
      {!parsedMetadata && (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? "border-emerald-500 bg-emerald-50/60 ring-4 ring-emerald-500/20 scale-[1.01]"
              : "border-slate-300 hover:border-indigo-400 bg-slate-50/60 hover:bg-indigo-50/30"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv,.pdf,.json"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className={`max-w-md mx-auto space-y-4 ${isDragging ? "pointer-events-none" : ""}`}>
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
              {isProcessing ? (
                <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <UploadCloud className="w-8 h-8" />
              )}
            </div>

            <div className="space-y-1.5">
              <h4 className="text-base font-bold text-slate-800">
                {isProcessing
                  ? "Parsing Document & Extracting Question Keys..."
                  : isDragging
                  ? "Drop File Now to Import"
                  : "Drag & Drop Examination File Here"}
              </h4>
              <p className="text-xs text-slate-500">
                Supports Microsoft Excel (<strong>.xlsx, .xls</strong>), Comma-Separated Values (<strong>.csv</strong>), PDF Question Sheets (<strong>.pdf</strong>), and <strong>.json</strong>.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-200">
                .XLSX Excel
              </span>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-100/80 text-blue-800 border border-blue-200">
                .CSV Sheets
              </span>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-rose-100/80 text-rose-800 border border-rose-200">
                .PDF Document
              </span>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-100/80 text-amber-800 border border-amber-200">
                .JSON Schema
              </span>
            </div>

            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                className="bg-white shadow-sm border-slate-300 text-slate-700 hover:text-indigo-600 text-xs font-bold"
              >
                Browse File from Computer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW AND EDIT STATE (AFTER FILE PARSED) */}
      {parsedMetadata && (
        <div className="space-y-6">
          {/* File Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-400/30">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{currentFileName}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    PARSED SUCCESSFULLY
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {parsedQuestions.length} questions extracted • {totalMarks} total marks
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
            >
              Upload Different File
            </Button>
          </div>

          {/* Warnings List (if any) */}
          {warnings.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-800">
                <AlertTriangle className="w-4 h-4" />
                <span>Notice regarding {warnings.length} question(s):</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-2">
                {warnings.slice(0, 4).map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
                {warnings.length > 4 && <li>...and {warnings.length - 4} more notices</li>}
              </ul>
            </div>
          )}

          {/* Exam Configuration Card (When creating an examination) */}
          {mode === "CREATE_EXAM" && (
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Examination Configuration & Metadata
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Examination Title</label>
                  <input
                    type="text"
                    value={parsedMetadata.title}
                    onChange={(e) =>
                      setParsedMetadata({ ...parsedMetadata, title: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="e.g. Full-Stack Enterprise Certification"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Subject / Category</label>
                  <input
                    type="text"
                    value={parsedMetadata.subject}
                    onChange={(e) =>
                      setParsedMetadata({ ...parsedMetadata, subject: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="e.g. AI & Machine Learning"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Duration (Minutes)</label>
                  <input
                    type="number"
                    min={5}
                    max={240}
                    value={parsedMetadata.duration_minutes}
                    onChange={(e) =>
                      setParsedMetadata({
                        ...parsedMetadata,
                        duration_minutes: Number(e.target.value) || 25,
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Passing Threshold (%)</label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={parsedMetadata.passing_threshold}
                    onChange={(e) =>
                      setParsedMetadata({
                        ...parsedMetadata,
                        passing_threshold: Number(e.target.value) || 70,
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Publication Status</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setExamStatus("PUBLISHED")}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                        examStatus === "PUBLISHED"
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      Published (Active)
                    </button>
                    <button
                      type="button"
                      onClick={() => setExamStatus("DRAFT")}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                        examStatus === "DRAFT"
                          ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      Draft Only
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Questions Header with Quick Stats */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Extracted Questions Preview ({parsedQuestions.length})</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                  {totalMarks} pts total
                </span>
              </h4>
              <p className="text-xs text-slate-500">
                Verify question wording, options, and that the correct answer is marked properly in green.
              </p>
            </div>

            <div className="text-xs text-slate-500">
              Zero-Trust Anti-Cheat and Authoritative Server Scoring will apply automatically.
            </div>
          </div>

          {/* QUESTIONS LIST CARDS */}
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {parsedQuestions.map((q, idx) => {
              const hasOptions = q.options && q.options.length > 0;
              const ca = q.correct_answers || q.correct_answer;
              const isArrayAns = Array.isArray(ca);

              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {q.type}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                        {q.marks} pts
                      </span>
                      {q.difficulty && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-50 text-slate-500">
                          {q.difficulty}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(idx)}
                      className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Remove question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Question Text */}
                  <textarea
                    rows={2}
                    value={q.question}
                    onChange={(e) => handleUpdateQuestion(idx, { question: e.target.value })}
                    className="w-full text-xs font-medium text-slate-800 p-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none"
                  />

                  {/* Options List with Highlighted Correct Answer */}
                  {hasOptions && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options!.map((opt, optIdx) => {
                        const isCorrect = isArrayAns
                          ? (ca as string[]).includes(opt)
                          : String(ca).toLowerCase() === opt.toLowerCase();

                        return (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-lg border text-xs flex items-center gap-2.5 transition-all ${
                              isCorrect
                                ? "bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold ring-1 ring-emerald-400"
                                : "bg-slate-50 border-slate-200 text-slate-700"
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                                isCorrect
                                  ? "bg-emerald-600 text-white"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="flex-1 break-words">{opt}</span>
                            {isCorrect && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 shrink-0">
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                Correct
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Non-option / descriptive answer key display */}
                  {!hasOptions && ca && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                      <strong className="text-emerald-800">Correct Answer Key: </strong>
                      <span>{Array.isArray(ca) ? ca.join(", ") : String(ca)}</span>
                    </div>
                  )}

                  {/* Explanation */}
                  {q.explanation && (
                    <div className="text-[11px] text-slate-500 flex items-start gap-1.5 pt-1 border-t border-slate-100">
                      <strong className="text-indigo-600 shrink-0">Explanation:</strong>
                      <span className="italic">{q.explanation}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs font-semibold text-slate-600"
            >
              Cancel
            </Button>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSaving || parsedQuestions.length === 0}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 shadow-sm flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : mode === "CREATE_EXAM" ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Create & {examStatus === "PUBLISHED" ? "Publish Exam" : "Save Draft"}</span>
                  </>
                ) : mode === "QUESTION_BANK" ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Import {parsedQuestions.length} Qs to Question Bank</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add {parsedQuestions.length} Questions to Exam</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
