/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useRef, useMemo } from "react";
import {
  X,
  FileSpreadsheet,
  UploadCloud,
  Download,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Edit3,
  Plus,
  RefreshCw,
  Search,
  Eye,
  Check,
  Calendar,
  Building2,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CandidateLetterRow,
  BulkGenerationOptions,
  BulkGenerationProgress,
  parseCandidateSpreadsheet,
  generateSampleCandidateSpreadsheet,
  generateBulkLettersZip,
  interpolateCustomTemplate,
} from "@/lib/documents/bulk-letter-engine";
import {
  LETTER_TEMPLATES,
  UNIVERSITY_PRESETS,
  LetterTemplateKey,
  generateLetterContent,
} from "@/lib/documents/letter-templates";
import { downloadAkashOfferLetterPdf } from "@/lib/documents/akash-pdf-generator";

interface BulkLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BulkLetterModal({ isOpen, onClose, onSuccess }: BulkLetterModalProps) {
  // Wizard Steps: 1 = Upload, 2 = Template & Format, 3 = Verification Grid, 4 = Generate & Download
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Candidates Data
  const [candidates, setCandidates] = useState<CandidateLetterRow[]>([]);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  // Template & Global Format Configuration
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<LetterTemplateKey>("INTERNSHIP_OFFER");
  const [letterDate, setLetterDate] = useState<string>(() => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
  });
  const [signatoryName, setSignatoryName] = useState("Akash Padhiyar");
  const [signatoryRole, setSignatoryRole] = useState("CEO");
  const [selectedUniversity, setSelectedUniversity] = useState("STANDARD");
  const [isCustomTemplateActive, setIsCustomTemplateActive] = useState(false);
  const [customTemplateText, setCustomTemplateText] = useState("");
  const [saveToRegistry, setSaveToRegistry] = useState(true);

  // Grid Search & Inline Editing
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCandidateId, setEditingCandidateId] = useState<string | null>(null);
  const [editCandidateData, setEditCandidateData] = useState<Partial<CandidateLetterRow>>({});

  // Single Candidate Live Preview
  const [previewCandidate, setPreviewCandidate] = useState<CandidateLetterRow | null>(null);

  // Generation & Packaging
  const [generationProgress, setGenerationProgress] = useState<BulkGenerationProgress | null>(null);
  const [generationSuccess, setGenerationSuccess] = useState<boolean>(false);
  const [generatedZipBlob, setGeneratedZipBlob] = useState<Blob | null>(null);
  const [generatedZipFilename, setGeneratedZipFilename] = useState<string>("");
  const [generatedCount, setGeneratedCount] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when closing
  const handleClose = () => {
    setCurrentStep(1);
    setCandidates([]);
    setSelectedFileName("");
    setFileError(null);
    setGenerationProgress(null);
    setGenerationSuccess(false);
    setGeneratedZipBlob(null);
    onClose();
  };

  // Handle Drag & Drop / File Selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const processFile = async (file: File) => {
    setIsParsing(true);
    setFileError(null);
    setSelectedFileName(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const rows = parseCandidateSpreadsheet(buffer);
      setCandidates(rows);
      setCurrentStep(2);
    } catch (err: any) {
      setFileError(err.message || "Failed to parse file. Please verify column headers.");
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Download Sample Spreadsheet
  const handleDownloadSample = () => {
    const buffer = generateSampleCandidateSpreadsheet();
    const blob = new Blob([buffer as unknown as BlobPart], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Akash_Letter_Generation_Sample_Template.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Filtered Candidates in Grid
  const filteredCandidates = useMemo(() => {
    if (!searchQuery.trim()) return candidates;
    const q = searchQuery.toLowerCase();
    return candidates.filter(
      (c) =>
        c.studentName.toLowerCase().includes(q) ||
        c.technology.toLowerCase().includes(q) ||
        c.internshipPosition.toLowerCase().includes(q) ||
        (c.college && c.college.toLowerCase().includes(q)) ||
        (c.recipientEmail && c.recipientEmail.toLowerCase().includes(q))
    );
  }, [candidates, searchQuery]);

  // Start Inline Editing a Candidate
  const handleStartEdit = (cand: CandidateLetterRow) => {
    setEditingCandidateId(cand.id);
    setEditCandidateData({ ...cand });
  };

  // Save Inline Edit
  const handleSaveEdit = () => {
    if (!editingCandidateId) return;
    setCandidates((prev) =>
      prev.map((c) => (c.id === editingCandidateId ? ({ ...c, ...editCandidateData } as CandidateLetterRow) : c))
    );
    setEditingCandidateId(null);
    setEditCandidateData({});
  };

  // Delete Candidate Row
  const handleDeleteRow = (id: string) => {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
  };

  // Add Empty Candidate Row
  const handleAddCandidate = () => {
    const newCand: CandidateLetterRow = {
      id: `cand_manual_${Date.now()}`,
      studentName: "New Candidate",
      salutation: "Mr.",
      internshipPosition: "Software Engineering Intern",
      technology: "Full Stack Web Development",
      commencementDate: "1st June 2026",
      continueUntilDate: "30th November 2026",
      college: "Gujarat Technological University",
    };
    setCandidates((prev) => [newCand, ...prev]);
    handleStartEdit(newCand);
  };

  // Preview Individual PDF
  const handlePreviewSinglePdf = async (cand: CandidateLetterRow) => {
    const templateDef = LETTER_TEMPLATES.find((t) => t.key === selectedTemplateKey);
    let customDescription: string | undefined = undefined;
    let isCustomEdited = false;

    if (isCustomTemplateActive && customTemplateText.trim()) {
      customDescription = interpolateCustomTemplate(customTemplateText, cand, {
        templateKey: selectedTemplateKey,
        letterDate,
        signatoryName,
        signatoryRole,
      });
      isCustomEdited = true;
    }

    await downloadAkashOfferLetterPdf(
      {
        salutation: cand.salutation,
        studentName: cand.studentName,
        internshipPosition: cand.internshipPosition,
        technology: cand.technology,
        commencementDate: cand.commencementDate,
        continueUntilDate: cand.continueUntilDate,
        letterDate,
        title: templateDef?.defaultTitle || "INTERNSHIP OFFER LETTER",
        customDescription,
        isCustomEdited,
        templateType: selectedTemplateKey,
        customUniversity: cand.college,
        signatoryName,
        signatoryRole,
      },
      `SAMPLE_PREVIEW_${cand.studentName.replace(/\s+/g, "_")}.pdf`
    );
  };

  // Trigger Bulk Generation & ZIP Packaging
  const handleExecuteBulkGeneration = async () => {
    if (candidates.length === 0) return;
    setCurrentStep(4);
    setGenerationSuccess(false);

    try {
      const templateDef = LETTER_TEMPLATES.find((t) => t.key === selectedTemplateKey);
      const options: BulkGenerationOptions = {
        templateKey: selectedTemplateKey,
        letterDate,
        title: templateDef?.defaultTitle,
        customDescriptionTemplate: isCustomTemplateActive ? customTemplateText : undefined,
        signatoryName,
        signatoryRole,
        universityId: selectedUniversity,
        saveToRegistry,
      };

      // 1. Generate PDFs & Package ZIP
      const result = await generateBulkLettersZip(candidates, options, (progress) => {
        setGenerationProgress(progress);
      });

      setGeneratedZipBlob(result.zipBlob);
      setGeneratedZipFilename(result.zipFilename);
      setGeneratedCount(result.totalGenerated);
      setGenerationSuccess(true);

      // Auto-trigger ZIP download
      const url = URL.createObjectURL(result.zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.zipFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);

      // 2. If Save to Registry is enabled, register into backend database
      if (saveToRegistry) {
        try {
          await fetch("/api/admin/documents/bulk-generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ candidates, options }),
          });
          if (onSuccess) onSuccess();
        } catch (err) {
          console.warn("Backend registration error:", err);
        }
      }
    } catch (err: any) {
      setGenerationProgress({
        current: 0,
        total: candidates.length,
        candidateName: "Generation Failed",
        status: "ERROR",
        error: err.message || "Failed to generate bulk letters.",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden my-auto animate-scaleUp">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Bulk &amp; Multiple Letter Generation Studio
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                  Excel / CSV Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate batches of authentic official letters from spreadsheets with custom format mapping and 1-click ZIP download.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Step Navigation */}
        <div className="grid grid-cols-4 border-b border-slate-100 bg-slate-50/70 text-xs font-semibold shrink-0">
          {[
            { step: 1, label: "1. Upload Spreadsheet", icon: UploadCloud },
            { step: 2, label: "2. Template & Format", icon: FileText },
            { step: 3, label: `3. Verify Roster (${candidates.length})`, icon: Layers },
            { step: 4, label: "4. Generate & ZIP", icon: Download },
          ].map((s) => {
            const Icon = s.icon;
            const isActive = currentStep === s.step;
            const isCompleted = currentStep > s.step;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => {
                  if (s.step <= currentStep || (s.step === 2 && candidates.length > 0)) {
                    setCurrentStep(s.step as any);
                  }
                }}
                disabled={s.step > currentStep && candidates.length === 0}
                className={`py-3 px-3 flex items-center justify-center gap-2 border-b-2 transition-all ${
                  isActive
                    ? "border-indigo-600 text-indigo-700 bg-white font-bold"
                    : isCompleted
                    ? "border-emerald-500 text-emerald-700 hover:bg-slate-100"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-indigo-600" : isCompleted ? "text-emerald-500" : ""}`} />
                <span className="truncate">{s.label}</span>
                {isCompleted && <Check className="w-3 h-3 text-emerald-500 ml-0.5" />}
              </button>
            );
          })}
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* STEP 1: UPLOAD SPREADSHEET */}
          {currentStep === 1 && (
            <div className="space-y-6 max-w-2xl mx-auto py-2">
              <div className="text-center space-y-1">
                <h4 className="text-sm font-bold text-slate-900">
                  Upload Candidate Roster (Excel / CSV)
                </h4>
                <p className="text-xs text-slate-500">
                  Upload an Excel workbook (.xlsx, .xls) or comma-separated values (.csv) file containing candidate details.
                </p>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={async (e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) await processFile(file);
                }}
                className="border-2 border-dashed border-indigo-200 bg-indigo-50/30 hover:bg-indigo-50/60 rounded-2xl p-8 text-center transition-all cursor-pointer space-y-4"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-100/80 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Click to browse or drag &amp; drop spreadsheet here
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports Microsoft Excel (.xlsx, .xls) and CSV files (up to 500 rows)
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-white border-indigo-200 text-indigo-700 font-bold hover:bg-indigo-50 text-xs"
                >
                  Choose Excel / CSV File
                </Button>
              </div>

              {/* Error Banner */}
              {fileError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{fileError}</span>
                </div>
              )}

              {/* Sample Template & Help Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    Standard Column Format Reference
                  </div>
                  <Button
                    type="button"
                    onClick={handleDownloadSample}
                    variant="outline"
                    size="sm"
                    className="text-xs font-bold text-emerald-700 bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Sample Excel Template (.xlsx)
                  </Button>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  The spreadsheet parser automatically detects column headers case-insensitively:
                  <strong className="text-slate-700"> Candidate Name</strong>,
                  <strong className="text-slate-700"> Salutation</strong> (Mr./Ms.),
                  <strong className="text-slate-700"> Email</strong>,
                  <strong className="text-slate-700"> Technology / Track</strong> (AI/ML, Full Stack, Python, etc.),
                  <strong className="text-slate-700"> Position</strong>,
                  <strong className="text-slate-700"> Commencement Date</strong>,
                  <strong className="text-slate-700"> Continue Until Date</strong>, and
                  <strong className="text-slate-700"> College / University</strong>.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: TEMPLATE & FORMAT CUSTOMIZATION */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Select Letter Template &amp; Global Format
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Choose the document format to generate for all {candidates.length} candidates in the roster.
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {candidates.length} Candidate Rows Loaded
                </span>
              </div>

              {/* Template Catalog Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {LETTER_TEMPLATES.map((tmpl) => {
                  const isSelected = selectedTemplateKey === tmpl.key;
                  return (
                    <button
                      key={tmpl.key}
                      type="button"
                      onClick={() => setSelectedTemplateKey(tmpl.key)}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 text-indigo-950"
                          : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="text-xl mb-1.5">{tmpl.icon}</div>
                      <div className="font-bold text-xs leading-snug">{tmpl.shortName}</div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">{tmpl.defaultTitle}</div>
                    </button>
                  );
                })}
              </div>

              {/* Global Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Letter Issue Date
                  </label>
                  <input
                    type="text"
                    value={letterDate}
                    onChange={(e) => setLetterDate(e.target.value)}
                    placeholder="DD-MM-YYYY (e.g. 05-11-2026)"
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Authorized Signatory Name
                  </label>
                  <input
                    type="text"
                    value={signatoryName}
                    onChange={(e) => setSignatoryName(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Signatory Role / Designation
                  </label>
                  <input
                    type="text"
                    value={signatoryRole}
                    onChange={(e) => setSignatoryRole(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Custom Format & Placeholders Accordion */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-800">
                    <input
                      type="checkbox"
                      checked={isCustomTemplateActive}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setIsCustomTemplateActive(val);
                        if (val && !customTemplateText) {
                          // Pre-fill with template standard text
                          const cand = candidates[0];
                          const generated = generateLetterContent({
                            templateKey: selectedTemplateKey,
                            salutation: cand?.salutation || "Mr.",
                            studentName: cand?.studentName || "Candidate",
                            internshipPosition: cand?.internshipPosition || "Intern",
                            technology: cand?.technology || "AI/ML",
                            commencementDate: cand?.commencementDate || "1st June 2026",
                            continueUntilDate: cand?.continueUntilDate || "30th November 2026",
                            letterDate,
                            signatoryName,
                            signatoryRole,
                          });
                          // Replace candidate specific values with tags
                          let generic = generated.fullText
                            .replace(new RegExp(cand?.studentName || "Candidate", "g"), "{{name}}")
                            .replace(new RegExp(cand?.technology || "AI/ML", "g"), "{{technology}}");
                          setCustomTemplateText(generic);
                        }
                      }}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span>Customize Letter Format &amp; Body Text (Use Placeholders)</span>
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Supports dynamic replacement tags
                  </span>
                </div>

                {isCustomTemplateActive && (
                  <div className="space-y-3 pt-2">
                    <div className="flex flex-wrap gap-1.5 text-[10px]">
                      {[
                        "{{student_name}}",
                        "{{name}}",
                        "{{salutation}}",
                        "{{technology}}",
                        "{{position}}",
                        "{{start_date}}",
                        "{{end_date}}",
                        "{{college}}",
                        "{{university}}",
                        "{{date}}",
                        "{{signatory_name}}",
                        "{{signatory_role}}",
                      ].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setCustomTemplateText((prev) => prev + " " + tag)}
                          className="px-2 py-0.5 rounded bg-indigo-100/70 text-indigo-800 font-mono font-bold hover:bg-indigo-200 border border-indigo-200"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>

                    <textarea
                      rows={6}
                      value={customTemplateText}
                      onChange={(e) => setCustomTemplateText(e.target.value)}
                      placeholder="Write or customize template format. Use placeholders like {{student_name}}, {{technology}}, {{start_date}}..."
                      className="w-full p-3 rounded-lg border border-slate-300 font-mono text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: CANDIDATE VERIFICATION GRID */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search candidates, tracks, colleges..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <span className="text-xs text-slate-500 font-semibold shrink-0">
                    Showing {filteredCandidates.length} of {candidates.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={handleAddCandidate}
                    variant="outline"
                    size="sm"
                    className="text-xs font-semibold text-slate-700 hover:text-indigo-600 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Candidate
                  </Button>
                </div>
              </div>

              {/* Data Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white max-h-[46vh] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] sticky top-0 z-10">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Sal.</th>
                      <th className="py-2.5 px-3">Candidate Name</th>
                      <th className="py-2.5 px-3">Technology &amp; Position</th>
                      <th className="py-2.5 px-3">Duration Dates</th>
                      <th className="py-2.5 px-3">College / University</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCandidates.map((cand, idx) => {
                      const isEditing = editingCandidateId === cand.id;
                      return (
                        <tr key={cand.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2 px-3 font-mono text-slate-400">{idx + 1}</td>

                          {/* Salutation */}
                          <td className="py-2 px-3">
                            {isEditing ? (
                              <select
                                value={editCandidateData.salutation || cand.salutation}
                                onChange={(e) =>
                                  setEditCandidateData({ ...editCandidateData, salutation: e.target.value as any })
                                }
                                className="p-1 rounded border border-slate-300 text-xs font-bold"
                              >
                                <option value="Mr.">Mr.</option>
                                <option value="Ms.">Ms.</option>
                              </select>
                            ) : (
                              <span className="font-bold text-slate-700">{cand.salutation}</span>
                            )}
                          </td>

                          {/* Student Name */}
                          <td className="py-2 px-3">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editCandidateData.studentName ?? cand.studentName}
                                onChange={(e) =>
                                  setEditCandidateData({ ...editCandidateData, studentName: e.target.value })
                                }
                                className="p-1 rounded border border-slate-300 text-xs font-bold w-full"
                              />
                            ) : (
                              <div>
                                <span className="font-bold text-slate-900">{cand.studentName}</span>
                                {cand.recipientEmail && (
                                  <div className="text-[10px] text-slate-400 font-mono">{cand.recipientEmail}</div>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Technology & Position */}
                          <td className="py-2 px-3">
                            {isEditing ? (
                              <div className="space-y-1">
                                <input
                                  type="text"
                                  value={editCandidateData.technology ?? cand.technology}
                                  onChange={(e) =>
                                    setEditCandidateData({ ...editCandidateData, technology: e.target.value })
                                  }
                                  placeholder="Technology"
                                  className="p-1 rounded border border-slate-300 text-xs w-full"
                                />
                                <input
                                  type="text"
                                  value={editCandidateData.internshipPosition ?? cand.internshipPosition}
                                  onChange={(e) =>
                                    setEditCandidateData({ ...editCandidateData, internshipPosition: e.target.value })
                                  }
                                  placeholder="Position"
                                  className="p-1 rounded border border-slate-300 text-xs w-full text-slate-600"
                                />
                              </div>
                            ) : (
                              <div>
                                <span className="font-semibold text-indigo-700">{cand.technology}</span>
                                <div className="text-[10px] text-slate-500">{cand.internshipPosition}</div>
                              </div>
                            )}
                          </td>

                          {/* Dates */}
                          <td className="py-2 px-3">
                            {isEditing ? (
                              <div className="space-y-1">
                                <input
                                  type="text"
                                  value={editCandidateData.commencementDate ?? cand.commencementDate}
                                  onChange={(e) =>
                                    setEditCandidateData({ ...editCandidateData, commencementDate: e.target.value })
                                  }
                                  className="p-1 rounded border border-slate-300 text-xs w-full"
                                />
                                <input
                                  type="text"
                                  value={editCandidateData.continueUntilDate ?? cand.continueUntilDate}
                                  onChange={(e) =>
                                    setEditCandidateData({ ...editCandidateData, continueUntilDate: e.target.value })
                                  }
                                  className="p-1 rounded border border-slate-300 text-xs w-full"
                                />
                              </div>
                            ) : (
                              <div className="text-[11px] text-slate-700">
                                <div>{cand.commencementDate}</div>
                                <div className="text-slate-400 text-[10px]">to {cand.continueUntilDate}</div>
                              </div>
                            )}
                          </td>

                          {/* College */}
                          <td className="py-2 px-3">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editCandidateData.college ?? cand.college ?? ""}
                                onChange={(e) => setEditCandidateData({ ...editCandidateData, college: e.target.value })}
                                className="p-1 rounded border border-slate-300 text-xs w-full"
                              />
                            ) : (
                              <span className="text-slate-600 truncate block max-w-xs">{cand.college || "—"}</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-2 px-3 text-right shrink-0">
                            <div className="flex items-center justify-end gap-1.5">
                              {isEditing ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={handleSaveEdit}
                                  className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                                >
                                  Save
                                </Button>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handlePreviewSinglePdf(cand)}
                                    title="Preview Official PDF"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleStartEdit(cand)}
                                    title="Edit Row"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteRow(cand.id)}
                                    title="Delete Row"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 4: GENERATE & ZIP DOWNLOAD */}
          {currentStep === 4 && (
            <div className="space-y-6 max-w-xl mx-auto py-6 text-center">
              {!generationSuccess && generationProgress?.status !== "ERROR" ? (
                <div className="space-y-5">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center mx-auto">
                    <RotateCcw className="w-8 h-8 animate-spin text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">
                      Generating Official Letter PDFs &amp; Packaging ZIP
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {generationProgress?.candidateName || "Preparing vector assets..."}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Progress</span>
                      <span>
                        {generationProgress?.current || 0} / {generationProgress?.total || candidates.length} Letters
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
                        style={{
                          width: `${Math.round(
                            ((generationProgress?.current || 0) / (generationProgress?.total || candidates.length || 1)) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : generationSuccess ? (
                <div className="space-y-5 animate-in fade-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900">
                      Batch Generation Complete!
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Successfully generated and packaged <strong>{generatedCount} official letters</strong> into a high-compression ZIP file.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                    <div className="font-mono font-bold text-slate-900">{generatedZipFilename}</div>
                    <div>Tamper-Evident SHA-256 Verified Official Akash Letterhead Template</div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    {generatedZipBlob && (
                      <Button
                        type="button"
                        onClick={() => {
                          const url = URL.createObjectURL(generatedZipBlob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = generatedZipFilename;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          setTimeout(() => URL.revokeObjectURL(url), 2000);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 w-full sm:w-auto"
                      >
                        <Download className="w-4 h-4" />
                        Download ZIP Archive Again
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      className="text-xs font-semibold w-full sm:w-auto"
                    >
                      Done &amp; Return to Documents
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-red-700">Generation Error Occurred</h4>
                  <p className="text-xs text-slate-600">{generationProgress?.error || "Unknown error"}</p>
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Back to Candidates
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4 shrink-0">
          <div>
            {currentStep > 1 && currentStep < 4 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
                className="text-xs font-semibold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Previous Step
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="text-xs font-semibold"
            >
              Cancel
            </Button>

            {currentStep === 1 && candidates.length > 0 && (
              <Button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5"
              >
                Continue to Template &amp; Format
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}

            {currentStep === 2 && (
              <Button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5"
              >
                Review Candidates ({candidates.length})
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}

            {currentStep === 3 && (
              <Button
                type="button"
                onClick={handleExecuteBulkGeneration}
                disabled={candidates.length === 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4" />
                Generate All {candidates.length} Official Letters &amp; Download ZIP
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
