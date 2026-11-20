"use client";

import React, { useState, useEffect } from "react";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
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
} from "lucide-react";
import { Assessment, AssessmentQuestion, AssessmentAttempt } from "@/lib/assessments/assessment-store";

export default function AdminAssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [isSubmissionsModalOpen, setIsSubmissionsModalOpen] = useState(false);
  const [selectedAssessmentForSubmissions, setSelectedAssessmentForSubmissions] = useState<string | null>(null);
  const [selectedAttemptForReview, setSelectedAttemptForReview] = useState<AssessmentAttempt | null>(null);

  // Form states for Create/Edit
  const [formTitle, setFormTitle] = useState("");
  const [formSubject, setFormSubject] = useState("AI & Machine Learning");
  const [formDescription, setFormDescription] = useState("");
  const [formDuration, setFormDuration] = useState(25);
  const [formPassingThreshold, setFormPassingThreshold] = useState(70);
  const [formAttemptLimit, setFormAttemptLimit] = useState(2);
  const [formStatus, setFormStatus] = useState<"PUBLISHED" | "DRAFT">("PUBLISHED");
  const [formQuestions, setFormQuestions] = useState<AssessmentQuestion[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Load assessments and attempts
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [resAsm, resAtt] = await Promise.all([
        fetch("/api/assessments").then((r) => r.json()),
        fetch("/api/admin/assessments/attempts").then((r) => r.json()),
      ]);

      if (resAsm.success && Array.isArray(resAsm.assessments)) {
        setAssessments(resAsm.assessments);
      }
      if (resAtt.success && Array.isArray(resAtt.attempts)) {
        setAttempts(resAtt.attempts);
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

  // Filtered assessments
  const filteredAssessments = assessments.filter((asm) => {
    const matchesSearch =
      asm.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asm.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asm.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterTab === "PUBLISHED") return matchesSearch && asm.status === "PUBLISHED";
    if (filterTab === "DRAFT") return matchesSearch && asm.status === "DRAFT";
    return matchesSearch;
  });

  // Calculate high-level metrics
  const totalExams = assessments.length;
  const publishedExams = assessments.filter((a) => a.status === "PUBLISHED").length;
  const totalSubmissions = attempts.length;
  const passedSubmissions = attempts.filter((a) => a.passed).length;
  const overallPassRate = totalSubmissions > 0 ? Math.round((passedSubmissions / totalSubmissions) * 100) : 0;

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingAssessment(null);
    setFormTitle("");
    setFormSubject("AI & Machine Learning");
    setFormDescription("Evaluates practical proficiency, algorithmic problem solving, and architecture best practices.");
    setFormDuration(25);
    setFormPassingThreshold(70);
    setFormAttemptLimit(2);
    setFormStatus("PUBLISHED");
    setFormError(null);

    // Initial 3 blank questions
    setFormQuestions([
      {
        id: `q_${Date.now()}_1`,
        question: "",
        type: "SINGLE_CHOICE",
        options: ["", "", "", ""],
        correct_answer: "",
        explanation: "",
        marks: 10,
      },
    ]);
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (asm: Assessment) => {
    setEditingAssessment(asm);
    setFormTitle(asm.title);
    setFormSubject(asm.subject);
    setFormDescription(asm.description);
    setFormDuration(asm.duration_minutes);
    setFormPassingThreshold(asm.passing_threshold);
    setFormAttemptLimit(asm.attempt_limit);
    setFormStatus(asm.status === "DRAFT" ? "DRAFT" : "PUBLISHED");
    setFormQuestions(asm.questions || []);
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  // Insert standard preset questions for rapid builder
  const handleInsertPresetQuestions = () => {
    const presetQuestions: AssessmentQuestion[] = [
      {
        id: `q_preset_${Date.now()}_1`,
        question: "What is the primary role of Activation Functions in neural network architectures?",
        type: "SINGLE_CHOICE",
        options: [
          "Introducing non-linearity to learn complex mathematical mappings",
          "Encrypting weight tensors",
          "Replacing matrix multiplication with integer addition",
          "Deleting zero-value weights during training",
        ],
        correct_answer: "Introducing non-linearity to learn complex mathematical mappings",
        explanation: "Without non-linear activation functions, stacked neural network layers collapse mathematically into a single linear transformation regardless of depth.",
        marks: 10,
      },
      {
        id: `q_preset_${Date.now()}_2`,
        question: "In PostgreSQL, which feature guarantees strict multi-tenant row isolation across accounts?",
        type: "SINGLE_CHOICE",
        options: [
          "Row-Level Security (RLS) policies",
          "Primary key constraints only",
          "Foreign Key cascades",
          "Client-side CSS hidden attributes",
        ],
        correct_answer: "Row-Level Security (RLS) policies",
        explanation: "RLS enforces security policies at the database engine level, ensuring queries only return rows matching authorized tenant contexts.",
        marks: 10,
      },
      {
        id: `q_preset_${Date.now()}_3`,
        question: "How does the InternDesk timecard tracking mechanism ensure high accuracy during device sleep or tab switching?",
        type: "SINGLE_CHOICE",
        options: [
          "Real-time timestamp deltas computed from authoritative start timestamps",
          "Client-side setInterval tick counting exclusively",
          "Reloading the page every minute",
          "Counting user keyboard inputs",
        ],
        correct_answer: "Real-time timestamp deltas computed from authoritative start timestamps",
        explanation: "Comparing real wall-clock timestamps (`Date.now() - startTime`) is immune to background tab throttling, tick drifting, or system sleep.",
        marks: 10,
      },
      {
        id: `q_preset_${Date.now()}_4`,
        question: "Which HTTP header is mandatory for preventing Cross-Site Scripting (XSS) by restricting executable script origins?",
        type: "SINGLE_CHOICE",
        options: [
          "Content-Security-Policy (CSP)",
          "Access-Control-Allow-Origin",
          "X-Frame-Options",
          "Cache-Control",
        ],
        correct_answer: "Content-Security-Policy (CSP)",
        explanation: "CSP restricts executable script origins, inline scripts, and unauthorized domains, mitigating XSS vectors.",
        marks: 10,
      },
      {
        id: `q_preset_${Date.now()}_5`,
        question: "What does the Principle of Least Privilege dictate in security architecture?",
        type: "SINGLE_CHOICE",
        options: [
          "Entities are granted only the minimum permissions necessary to perform their assigned functions",
          "Every user receives full administrator privileges by default",
          "All passwords must be public",
          "Network firewalls should be disabled for testing",
        ],
        correct_answer: "Entities are granted only the minimum permissions necessary to perform their assigned functions",
        explanation: "Least privilege minimizes the attack surface and potential damage from compromised credentials by avoiding excessive authority.",
        marks: 10,
      },
    ];

    setFormQuestions(presetQuestions);
  };

  // Add question to form
  const handleAddQuestion = () => {
    setFormQuestions((prev) => [
      ...prev,
      {
        id: `q_${Date.now()}_${prev.length + 1}`,
        question: "",
        type: "SINGLE_CHOICE",
        options: ["", "", "", ""],
        correct_answer: "",
        explanation: "",
        marks: 10,
      },
    ]);
  };

  // Remove question
  const handleRemoveQuestion = (idx: number) => {
    if (formQuestions.length <= 1) return;
    setFormQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  // Update question field
  const handleUpdateQuestion = (idx: number, field: keyof AssessmentQuestion, value: any) => {
    setFormQuestions((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  // Update option text
  const handleUpdateOption = (qIdx: number, optIdx: number, text: string) => {
    setFormQuestions((prev) => {
      const copy = [...prev];
      const opts = [...copy[qIdx].options];
      opts[optIdx] = text;
      copy[qIdx] = { ...copy[qIdx], options: opts };
      return copy;
    });
  };

  // Save / Update Assessment
  const handleSaveAssessment = async () => {
    if (!formTitle.trim()) {
      setFormError("Assessment title is required.");
      return;
    }

    if (formQuestions.length === 0) {
      setFormError("Please add at least one question.");
      return;
    }

    // Validate that questions have text, options, and correct answers
    for (let i = 0; i < formQuestions.length; i++) {
      const q = formQuestions[i];
      if (!q.question.trim()) {
        setFormError(`Question #${i + 1} text cannot be blank.`);
        return;
      }
      const validOpts = q.options.filter((o) => o.trim().length > 0);
      if (validOpts.length < 2) {
        setFormError(`Question #${i + 1} must have at least 2 valid options.`);
        return;
      }
      if (!q.correct_answer.trim()) {
        setFormError(`Question #${i + 1} must have a designated correct answer.`);
        return;
      }
    }

    setIsSaving(true);
    setFormError(null);

    try {
      const payload = {
        title: formTitle.trim(),
        subject: formSubject.trim(),
        description: formDescription.trim(),
        duration_minutes: Number(formDuration),
        passing_threshold: Number(formPassingThreshold),
        attempt_limit: Number(formAttemptLimit),
        status: formStatus,
        questions: formQuestions,
      };

      let res: Response;
      if (editingAssessment) {
        res = await fetch("/api/admin/assessments", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingAssessment.id, updates: payload }),
        });
      } else {
        res = await fetch("/api/admin/assessments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save assessment.");
      }

      setIsCreateModalOpen(false);
      setEditingAssessment(null);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || "Failed to save assessment.");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Assessment
  const handleDeleteAssessment = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this assessment?")) return;
    try {
      const res = await fetch(`/api/admin/assessments?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        await loadData();
      } else {
        alert(data.error || "Failed to delete assessment.");
      }
    } catch {
      alert("Network error deleting assessment.");
    }
  };

  // Reset Student Attempt
  const handleResetAttempt = async (attemptId: string) => {
    if (!confirm("Reset this student's exam attempt? This will allow the student to retake the assessment.")) return;
    try {
      const res = await fetch(`/api/admin/assessments/attempts?id=${encodeURIComponent(attemptId)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        await loadData();
        if (selectedAttemptForReview?.id === attemptId) {
          setSelectedAttemptForReview(null);
        }
      } else {
        alert(data.error || "Failed to reset attempt.");
      }
    } catch {
      alert("Network error resetting attempt.");
    }
  };

  // Filtered attempts for submissions modal
  const filteredAttempts = attempts.filter((att) => {
    if (selectedAssessmentForSubmissions) {
      return att.assessment_id === selectedAssessmentForSubmissions;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      <AdminTopbar title="Assessments & Examination Engine" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header & Metric Strip */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Assessments &amp; Examination Engine
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Anti-Cheat Secured
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Build MCQ evaluations, define pass criteria, manage question banks, and audit proctored candidate grading.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={() => {
                setSelectedAssessmentForSubmissions(null);
                setIsSubmissionsModalOpen(true);
              }}
              variant="outline"
              size="sm"
              className="rounded-xl text-xs font-bold border-slate-300 bg-white hover:bg-slate-50 shadow-2xs cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4 mr-1.5 text-blue-600" />
              Submissions &amp; Results ({attempts.length})
            </Button>

            <Button
              onClick={handleOpenCreateModal}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Create Assessment
            </Button>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 bg-white rounded-2xl border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Assessments
            </span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-slate-900">{totalExams}</span>
              <BookOpen className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-[11px] text-slate-500">{publishedExams} Published &amp; Active</p>
          </Card>

          <Card className="p-4 bg-white rounded-2xl border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Student Submissions
            </span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-slate-900">{totalSubmissions}</span>
              <Users className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-[11px] text-slate-500">{passedSubmissions} Passed Qualification</p>
          </Card>

          <Card className="p-4 bg-white rounded-2xl border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Average Pass Rate
            </span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-emerald-600">{overallPassRate}%</span>
              <Award className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-[11px] text-slate-500">Benchmark: 70% threshold</p>
          </Card>

          <Card className="p-4 bg-white rounded-2xl border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Proctoring Integrity
            </span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-slate-900">100%</span>
              <ShieldAlert className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-[11px] text-slate-500">Tab Blur &amp; Cheating Monitored</p>
          </Card>
        </div>

        {/* Search & Tabs Strip */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setFilterTab("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                filterTab === "ALL" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              All ({assessments.length})
            </button>
            <button
              onClick={() => setFilterTab("PUBLISHED")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                filterTab === "PUBLISHED" ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Published ({publishedExams})
            </button>
            <button
              onClick={() => setFilterTab("DRAFT")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                filterTab === "DRAFT" ? "bg-amber-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Drafts ({assessments.filter((a) => a.status === "DRAFT").length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search assessments, subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all font-medium"
            />
          </div>
        </div>

        {/* Assessments Card Grid */}
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Loading assessment engine...</p>
          </div>
        ) : filteredAssessments.length === 0 ? (
          <Card className="p-12 text-center rounded-3xl border-dashed border-2 border-slate-200 bg-white">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No assessments found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery ? "Try refining your search query." : "Click 'Create Assessment' above to publish your first evaluation."}
            </p>
            <Button onClick={handleOpenCreateModal} size="sm" className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer">
              <Plus className="w-4 h-4 mr-1.5" />
              Create First Assessment
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssessments.map((exam) => {
              const examAttempts = attempts.filter((a) => a.assessment_id === exam.id);
              const examPassed = examAttempts.filter((a) => a.passed).length;
              const passPct = examAttempts.length > 0 ? Math.round((examPassed / examAttempts.length) * 100) : null;

              return (
                <Card
                  key={exam.id}
                  className="border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between rounded-2xl bg-white overflow-hidden"
                >
                  <CardContent className="p-6 space-y-4">
                    {/* Top Row: Subject & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 truncate">
                        {exam.subject}
                      </span>
                      <StatusBadge status={exam.status} />
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-1">
                        {exam.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {exam.description || "Comprehensive technical practicum evaluation with server-side grading."}
                      </p>
                    </div>

                    {/* Meta Metric Grid */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{exam.questions?.length || 0} Questions</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{exam.duration_minutes} Mins</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{examAttempts.length} Attempts</span>
                      </div>
                      <div className="font-semibold text-emerald-700">
                        Pass: {passPct !== null ? `${passPct}%` : `${exam.passing_threshold}% Req`}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex items-center gap-2">
                      <Button
                        onClick={() => handleOpenEditModal(exam)}
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs font-semibold rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 mr-1 text-slate-500" />
                        Edit / Bank
                      </Button>

                      <Button
                        onClick={() => {
                          setSelectedAssessmentForSubmissions(exam.id);
                          setIsSubmissionsModalOpen(true);
                        }}
                        size="sm"
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 cursor-pointer shadow-none"
                      >
                        <Users className="w-3.5 h-3.5 mr-1 text-blue-600" />
                        Submissions ({examAttempts.length})
                      </Button>

                      <button
                        onClick={() => handleDeleteAssessment(exam.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        title="Delete Assessment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* MODAL 1: CREATE / EDIT ASSESSMENT BUILDER */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    {editingAssessment ? "Edit Assessment & Question Bank" : "Create New Technical Assessment"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Define examination parameters, pass criteria, and multiple-choice questions.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {formError && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Assessment Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assessment Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. AI & Machine Learning Engineering Practicum Exam"
                    className="w-full text-xs font-semibold text-slate-900 border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Technology / Domain Subject
                  </label>
                  <select
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-900 border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="AI & Machine Learning">AI &amp; Machine Learning</option>
                    <option value="Full-Stack Web Development">Full-Stack Web Development</option>
                    <option value="Cybersecurity & Identity">Cybersecurity &amp; Identity</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Cloud & DevOps">Cloud &amp; DevOps</option>
                    <option value="Python & Data Structures">Python &amp; Data Structures</option>
                    <option value="General Technical Practicum">General Technical Practicum</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full text-xs font-semibold text-slate-900 border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="PUBLISHED">Published (Available for Students)</option>
                    <option value="DRAFT">Draft (Internal Only)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Description &amp; Syllabus Overview
                  </label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Describe the topics and competency benchmark evaluated in this exam..."
                    className="w-full text-xs font-medium text-slate-900 border border-slate-300 rounded-xl p-3 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className="w-full text-xs font-semibold text-slate-900 border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Pass Threshold (%)
                    </label>
                    <input
                      type="number"
                      min={40}
                      max={100}
                      value={formPassingThreshold}
                      onChange={(e) => setFormPassingThreshold(Number(e.target.value))}
                      className="w-full text-xs font-semibold text-slate-900 border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Attempt Limit
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={formAttemptLimit}
                      onChange={(e) => setFormAttemptLimit(Number(e.target.value))}
                      className="w-full text-xs font-semibold text-slate-900 border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Question Builder */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 tracking-tight">
                      Examination Question Bank ({formQuestions.length} Questions)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Total Marks: {formQuestions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0)} pts
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      onClick={handleInsertPresetQuestions}
                      variant="outline"
                      size="sm"
                      className="text-xs font-bold rounded-xl text-blue-700 bg-blue-50/60 border-blue-200 hover:bg-blue-100 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1 text-blue-600" />
                      Auto-Fill 5 Presets
                    </Button>
                    <Button
                      type="button"
                      onClick={handleAddQuestion}
                      size="sm"
                      className="bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add Question
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {formQuestions.map((q, qIdx) => (
                    <Card key={q.id || qIdx} className="p-4 rounded-2xl border-slate-200 bg-slate-50/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                          Question #{qIdx + 1}
                        </span>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <span className="font-semibold">Marks:</span>
                            <input
                              type="number"
                              min={1}
                              max={50}
                              value={q.marks}
                              onChange={(e) => handleUpdateQuestion(qIdx, "marks", Number(e.target.value))}
                              className="w-14 px-2 py-0.5 rounded-lg border border-slate-300 text-xs bg-white text-center font-bold"
                            />
                          </div>

                          {formQuestions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(qIdx)}
                              className="p-1 text-slate-400 hover:text-red-600 rounded-md cursor-pointer"
                              title="Delete Question"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Question Text */}
                      <div>
                        <textarea
                          rows={2}
                          value={q.question}
                          onChange={(e) => handleUpdateQuestion(qIdx, "question", e.target.value)}
                          placeholder="Enter question text here..."
                          className="w-full text-xs font-semibold text-slate-900 border border-slate-300 rounded-xl p-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* 4 Options Grid */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                          Options &amp; Designate Correct Answer
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, optIdx) => {
                            const optLetter = ["A", "B", "C", "D"][optIdx];
                            const isCorrect = q.correct_answer === opt && opt.trim().length > 0;

                            return (
                              <div
                                key={optIdx}
                                className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                                  isCorrect ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-100" : "bg-white border-slate-200"
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleUpdateQuestion(qIdx, "correct_answer", opt)}
                                  className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 cursor-pointer ${
                                    isCorrect ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                  }`}
                                  title="Mark as Correct Answer"
                                >
                                  {optLetter}
                                </button>
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => handleUpdateOption(qIdx, optIdx, e.target.value)}
                                  placeholder={`Option ${optLetter}...`}
                                  className="w-full text-xs font-medium text-slate-800 bg-transparent focus:outline-hidden"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Explanation */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Technical Explanation (Shown to student after completion)
                        </label>
                        <input
                          type="text"
                          value={q.explanation}
                          onChange={(e) => handleUpdateQuestion(qIdx, "explanation", e.target.value)}
                          placeholder="e.g. Dropout prevents co-adaptation of features by deactivating nodes..."
                          className="w-full text-xs text-slate-700 border border-slate-200 rounded-xl px-3 py-1.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </Button>

              <Button
                onClick={handleSaveAssessment}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs px-6 shadow-xs cursor-pointer"
              >
                {isSaving ? "Saving Assessment..." : editingAssessment ? "Save Changes" : "Create & Publish Assessment"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: STUDENT SUBMISSIONS & EVALUATION CENTER */}
      {isSubmissionsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    Candidate Examination Submissions &amp; Proctoring Logs
                  </h3>
                  <p className="text-xs text-slate-500">
                    Review candidate scores, tab switch logs, server grading, and grant retakes.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSubmissionsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Submissions Table */}
            <div className="flex-1 overflow-y-auto p-6">
              {filteredAttempts.length === 0 ? (
                <div className="py-16 text-center space-y-2">
                  <Users className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">No submissions recorded yet</p>
                  <p className="text-xs text-slate-500">Student examination submissions will appear here live once completed.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                        <th className="p-3.5">Candidate</th>
                        <th className="p-3.5">Assessment</th>
                        <th className="p-3.5">Score</th>
                        <th className="p-3.5">Result</th>
                        <th className="p-3.5">Proctoring Log</th>
                        <th className="p-3.5">Date &amp; Time</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {filteredAttempts.map((att) => (
                        <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5">
                            <span className="font-bold text-slate-900 block">{att.student_name}</span>
                            <span className="text-[11px] text-slate-500 font-mono">{att.student_email}</span>
                          </td>
                          <td className="p-3.5 max-w-xs truncate" title={att.assessment_title}>
                            {att.assessment_title}
                          </td>
                          <td className="p-3.5">
                            <span className="font-mono font-bold text-slate-900">
                              {att.score} / {att.total_marks}
                            </span>
                            <span className="text-[11px] text-slate-500 ml-1">({att.percentage}%)</span>
                          </td>
                          <td className="p-3.5">
                            {att.passed ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />
                                Passed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                                <XCircle className="w-3 h-3" />
                                Failed
                              </span>
                            )}
                          </td>
                          <td className="p-3.5">
                            {att.tab_switch_count === 0 ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Clean (0 switches)
                              </span>
                            ) : att.tab_switch_count <= 3 ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                {att.tab_switch_count} tab switches
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700">
                                <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                                Violation ({att.tab_switch_count} switches)
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-slate-500 text-[11px]">
                            {new Date(att.submitted_at).toLocaleDateString("en-GB")} {new Date(att.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="p-3.5 text-right space-x-1">
                            <Button
                              onClick={() => setSelectedAttemptForReview(att)}
                              size="sm"
                              variant="outline"
                              className="text-[11px] h-7 px-2.5 rounded-lg border-slate-200 cursor-pointer"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Review
                            </Button>
                            <Button
                              onClick={() => handleResetAttempt(att.id)}
                              size="sm"
                              variant="outline"
                              className="text-[11px] h-7 px-2.5 rounded-lg border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                              title="Allow Retake (Reset Attempt)"
                            >
                              <RotateCcw className="w-3 h-3 mr-1" />
                              Reset
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: INDIVIDUAL CANDIDATE EVALUATION REVIEW */}
      {selectedAttemptForReview && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h4 className="text-sm font-black text-slate-900 tracking-tight">
                  Submission Audit: {selectedAttemptForReview.student_name}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {selectedAttemptForReview.assessment_title} • Score: {selectedAttemptForReview.score}/{selectedAttemptForReview.total_marks} ({selectedAttemptForReview.percentage}%)
                </p>
              </div>
              <button
                onClick={() => setSelectedAttemptForReview(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedAttemptForReview.evaluations?.map((ev, idx) => (
                <div
                  key={ev.question_id || idx}
                  className={`p-4 rounded-2xl border text-xs space-y-2 ${
                    ev.is_correct ? "bg-emerald-50/50 border-emerald-200" : "bg-red-50/50 border-red-200"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-900">Question #{idx + 1}</span>
                    <span className={ev.is_correct ? "text-emerald-700" : "text-red-700"}>
                      {ev.marks_awarded} / {ev.marks_possible} Marks
                    </span>
                  </div>

                  <p className="font-semibold text-slate-800">{ev.question_text}</p>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                    <p className="text-[11px]">
                      <span className="font-bold text-slate-500">Candidate&apos;s Answer: </span>
                      <span className={ev.is_correct ? "text-emerald-700 font-bold" : "text-red-700 font-bold"}>
                        {ev.selected_answer || "Unanswered"}
                      </span>
                    </p>
                    {!ev.is_correct && (
                      <p className="text-[11px]">
                        <span className="font-bold text-slate-500">Correct Answer: </span>
                        <span className="text-emerald-700 font-bold">{ev.correct_answer}</span>
                      </p>
                    )}
                  </div>

                  {ev.explanation && (
                    <p className="text-[11px] text-slate-600 italic">
                      <span className="font-semibold">Explanation: </span>
                      {ev.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
