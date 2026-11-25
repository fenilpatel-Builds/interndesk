/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
  GraduationCap,
  Paperclip,
  Upload,
  Columns,
  FileUp,
  ClipboardPaste,
  Bold,
  Italic,
  List,
  Highlighter,
  AlignLeft,
  Table as TableIcon,
  Link as LinkIcon,
  Maximize2,
  Code2,
  HelpCircle,
  Lock,
  ChevronLeft,
  ChevronRight,
  Users,
  Loader2,
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
  tokenizeMarkdown,
  cleanAndSanitizePastedText,
} from "@/lib/documents/letter-templates";
import {
  downloadAkashOfferLetterPdf,
  isFemaleCandidate,
  deriveTrackTechnology,
} from "@/lib/documents/akash-pdf-generator";
import {
  AKASH_HEADER_BASE64,
  AKASH_FOOTER_BASE64,
  AKASH_WATERMARK_BASE64,
  AKASH_STAMP_BASE64,
} from "@/lib/documents/akash-letterhead-assets";
import {
  PREDEFINED_TRACKS,
  PredefinedTrack,
  formatOrdinalDate,
  formatStandardDate,
  getTodayFormattedDDMMYYYY,
} from "./letter-generate-modal";

interface BulkLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Dual Input: Allows BOTH typing directly and picking from a popup calendar
interface DualDateFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  mode: "DD-MM-YYYY" | "ORDINAL";
  required?: boolean;
}

function DualDateField({
  label,
  value,
  onChange,
  placeholder,
  mode,
  required = true,
}: DualDateFieldProps) {
  const pickerRef = useRef<HTMLInputElement>(null);

  const handleCalendarClick = () => {
    if (pickerRef.current) {
      if ("showPicker" in HTMLInputElement.prototype) {
        try {
          pickerRef.current.showPicker();
        } catch {
          pickerRef.current.focus();
        }
      } else {
        pickerRef.current.focus();
      }
    }
  };

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.value; // "YYYY-MM-DD"
    if (!picked) return;
    if (mode === "DD-MM-YYYY") {
      onChange(formatStandardDate(picked));
    } else {
      onChange(formatOrdinalDate(picked));
    }
  };

  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative flex items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full text-xs font-semibold text-slate-900 border border-slate-300 rounded-xl pl-3 pr-10 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={handleCalendarClick}
          title="Pick date from calendar"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
        >
          <Calendar className="w-4 h-4" />
        </button>
        <input
          ref={pickerRef}
          type="date"
          onChange={handlePickerChange}
          className="absolute opacity-0 pointer-events-none w-0 h-0"
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>
      <p className="text-[10px] text-slate-400 mt-1">
        Type directly or click 📅 calendar icon
      </p>
    </div>
  );
}

export function BulkLetterModal({ isOpen, onClose, onSuccess }: BulkLetterModalProps) {
  // Studio View Modes:
  // "SPLIT"   = Left: Form Editor, Right: Live A4 Letterhead Preview
  // "FORM"    = Wide 2-Column Editor (Left: Templates & Presets, Right: Variables & Body)
  // "PREVIEW" = Full-screen A4 Letterhead for active candidate
  // "ROSTER"  = Candidate Roster Grid (Search, Inline Edit, Add/Delete, File Upload)
  const [viewMode, setViewMode] = useState<"SPLIT" | "FORM" | "PREVIEW" | "ROSTER">("SPLIT");

  // Candidates Spreadsheet Roster
  const [candidates, setCandidates] = useState<CandidateLetterRow[]>([]);
  const [activeCandidateIndex, setActiveCandidateIndex] = useState<number>(0);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  // Template & University Format Selection
  const [templateKey, setTemplateKey] = useState<LetterTemplateKey>("INTERNSHIP_OFFER");
  const [universityId, setUniversityId] = useState<string>("STANDARD");
  const [customUniversity, setCustomUniversity] = useState<string>("");

  // Letter Variables (Synced to Active Candidate)
  const [letterDate, setLetterDate] = useState<string>(() => getTodayFormattedDDMMYYYY());
  const [letterTitle, setLetterTitle] = useState<string>("INTERNSHIP OFFER LETTER");
  const [salutation, setSalutation] = useState<"Mr." | "Ms.">("Mr.");
  const [studentName, setStudentName] = useState<string>("");
  const [recipientEmail, setRecipientEmail] = useState<string>("");
  const [internshipPosition, setInternshipPosition] = useState<string>("");
  const [commencementDate, setCommencementDate] = useState<string>("");
  const [continueUntilDate, setContinueUntilDate] = useState<string>("");
  const [technology, setTechnology] = useState<string>("");
  const [purpose, setPurpose] = useState<string>("Academic Project & Practicum Training");

  // Signatory & Mentorship
  const [signatoryName] = useState<string>("Akash Padhiyar");
  const [signatoryRole] = useState<string>("CEO");
  const [mentorName, setMentorName] = useState<string>("");
  const [mentorDesignation, setMentorDesignation] = useState<string>("");

  // Body Text & Customization
  const [description, setDescription] = useState<string>("");
  const [isCustomEdited, setIsCustomEdited] = useState<boolean>(false);
  const [customTemplateText, setCustomTemplateText] = useState<string>("");

  // Custom Content Source: Paste Draft or Attach File
  const [contentAssistantTab, setContentAssistantTab] = useState<"PASTE" | "ATTACH">("PASTE");
  const [pastedRawText, setPastedRawText] = useState<string>("");
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    size: number;
    type: string;
    uploadedAt: string;
  } | null>(null);

  // Database Synchronization Option
  const [saveToRegistry, setSaveToRegistry] = useState<boolean>(true);

  // Roster Search & Inline Editing
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [editingCandidateId, setEditingCandidateId] = useState<string | null>(null);
  const [editCandidateData, setEditCandidateData] = useState<Partial<CandidateLetterRow>>({});

  // Status & Generation Progress
  const [isDownloadingSinglePdf, setIsDownloadingSinglePdf] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<BulkGenerationProgress | null>(null);
  const [generatedZipBlob, setGeneratedZipBlob] = useState<Blob | null>(null);
  const [generatedZipFilename, setGeneratedZipFilename] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  // Active candidate object
  const activeCandidate: CandidateLetterRow | undefined = candidates[activeCandidateIndex];

  // Initialize sample candidates on first open if empty
  useEffect(() => {
    if (isOpen && candidates.length === 0) {
      try {
        const sampleBuffer = generateSampleCandidateSpreadsheet();
        const sampleRows = parseCandidateSpreadsheet(sampleBuffer);
        setCandidates(sampleRows);
        setSelectedFileName("Akash_Sample_Roster.xlsx");
        setActiveCandidateIndex(0);
      } catch (err) {
        console.warn("Failed to load sample roster:", err);
      }
    }
  }, [isOpen, candidates.length]);

  // Sync active candidate fields into form state when active candidate changes
  useEffect(() => {
    if (!activeCandidate) return;

    setSalutation(activeCandidate.salutation || (isFemaleCandidate(activeCandidate.studentName) ? "Ms." : "Mr."));
    setStudentName(activeCandidate.studentName || "");
    setRecipientEmail(activeCandidate.recipientEmail || "");
    setInternshipPosition(activeCandidate.internshipPosition || "Software Engineering Intern");
    setTechnology(activeCandidate.technology || deriveTrackTechnology(activeCandidate.internshipPosition));
    setCommencementDate(activeCandidate.commencementDate || "1st June 2026");
    setContinueUntilDate(activeCandidate.continueUntilDate || "30th November 2026");

    if (activeCandidate.college || activeCandidate.university) {
      const col = (activeCandidate.college || activeCandidate.university || "").toLowerCase();
      if (col.includes("gtu") || col.includes("technological")) {
        setUniversityId("GTU");
      } else if (col.includes("silver") || col.includes("sou")) {
        setUniversityId("SOU");
      } else if (col.includes("gujarat university")) {
        setUniversityId("GU");
      } else if (col.includes("parul")) {
        setUniversityId("PARUL");
      } else if (col.includes("nirma")) {
        setUniversityId("NIRMA");
      } else {
        setUniversityId("CUSTOM");
        setCustomUniversity(activeCandidate.college || activeCandidate.university || "");
      }
    }
  }, [activeCandidateIndex, candidates]);

  // Synchronize description when template, university or candidate fields change (unless custom edited)
  useEffect(() => {
    if (!isCustomEdited && activeCandidate) {
      const generated = generateLetterContent({
        templateKey,
        salutation,
        studentName: studentName || activeCandidate.studentName,
        internshipPosition: internshipPosition || activeCandidate.internshipPosition,
        technology: technology || activeCandidate.technology,
        commencementDate: commencementDate || activeCandidate.commencementDate,
        continueUntilDate: continueUntilDate || activeCandidate.continueUntilDate,
        letterDate,
        universityId,
        customUniversity,
        purpose,
        signatoryName,
        signatoryRole,
      });
      setLetterTitle(generated.title);
      setDescription(generated.fullText);
    }
  }, [
    templateKey,
    universityId,
    customUniversity,
    salutation,
    studentName,
    internshipPosition,
    technology,
    commencementDate,
    continueUntilDate,
    letterDate,
    purpose,
    isCustomEdited,
    activeCandidate,
    signatoryName,
    signatoryRole,
  ]);

  // Template switch handler
  const handleTemplateSelect = (key: LetterTemplateKey) => {
    setTemplateKey(key);
    const tmpl = LETTER_TEMPLATES.find((t) => t.key === key);
    if (tmpl) {
      setLetterTitle(tmpl.defaultTitle);
    }
    setIsCustomEdited(false);
  };

  // University switch handler
  const handleUniversitySelect = (uId: string) => {
    setUniversityId(uId);
    setIsCustomEdited(false);
  };

  // Predefined Track Quick Select
  const handleTrackSelect = (trk: PredefinedTrack) => {
    setInternshipPosition(trk.position);
    setTechnology(trk.technology);
    updateActiveCandidateField({
      internshipPosition: trk.position,
      technology: trk.technology,
    });
    setIsCustomEdited(false);
  };

  // Update current active candidate in memory
  const updateActiveCandidateField = (patch: Partial<CandidateLetterRow>) => {
    setCandidates((prev) =>
      prev.map((c, i) => (i === activeCandidateIndex ? { ...c, ...patch } : c))
    );
  };

  // Spreadsheet File Parsing Handler
  const handleSpreadsheetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setFileError(null);
    setSelectedFileName(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const parsedRows = parseCandidateSpreadsheet(buffer);
      if (parsedRows.length === 0) {
        throw new Error("No candidate rows found in the uploaded file.");
      }
      setCandidates(parsedRows);
      setActiveCandidateIndex(0);
      setIsCustomEdited(false);
      setStatusMessage({
        type: "success",
        text: `Successfully imported ${parsedRows.length} candidates from "${file.name}"!`,
      });
    } catch (err: any) {
      setFileError(err.message || "Failed to parse file. Please verify column headers.");
      setStatusMessage({
        type: "error",
        text: err.message || "Error parsing spreadsheet file.",
      });
    } finally {
      setIsParsing(false);
      if (replaceFileInputRef.current) replaceFileInputRef.current.value = "";
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

  // Paste & Sanitize Draft Handler
  const handleApplyPastedText = (interpolate: boolean) => {
    if (!pastedRawText.trim()) return;

    if (interpolate && activeCandidate) {
      const result = cleanAndSanitizePastedText(pastedRawText, {
        salutation,
        studentName,
        internshipPosition: internshipPosition || "AI/ML Intern",
        technology: technology || "AI/ML Systems",
        commencementDate: commencementDate || "[Joining Date]",
        continueUntilDate: continueUntilDate || "[End Date]",
        letterDate,
        mentorName: mentorName || "Dr. Rajesh Vaghela (Tech Lead)",
        mentorDesignation: mentorDesignation || "Senior Technical Project Guide",
      });

      if (result.detectedTitle) setLetterTitle(result.detectedTitle.toUpperCase());
      if (result.detectedDate) setLetterDate(result.detectedDate);
      setDescription(result.cleanedText);
      setCustomTemplateText(pastedRawText);
    } else {
      setDescription(pastedRawText.trim());
      setCustomTemplateText(pastedRawText.trim());
    }

    setIsCustomEdited(true);
    setPastedRawText("");
  };

  // File Attachment / Text Import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isTextFile =
      file.name.endsWith(".txt") || file.name.endsWith(".md") || file.type.startsWith("text/");

    if (isTextFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawText = event.target?.result as string;
        if (rawText && activeCandidate) {
          const result = cleanAndSanitizePastedText(rawText, {
            salutation,
            studentName,
            internshipPosition,
            technology,
            commencementDate,
            continueUntilDate,
            letterDate,
            mentorName,
            mentorDesignation,
          });
          if (result.detectedTitle) setLetterTitle(result.detectedTitle.toUpperCase());
          setDescription(result.cleanedText);
          setIsCustomEdited(true);
          setStatusMessage({
            type: "success",
            text: `Imported and sanitized text draft from "${file.name}"!`,
          });
        }
      };
      reader.readAsText(file);
    } else {
      setStatusMessage({
        type: "success",
        text: `Attached file "${file.name}" (${(file.size / 1024).toFixed(1)} KB) to official document records.`,
      });
    }

    setAttachedFile({
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
      uploadedAt: new Date().toISOString(),
    });
  };

  // Download Single PDF for Active Candidate
  const handleDownloadSinglePdf = async () => {
    if (!activeCandidate) return;
    setIsDownloadingSinglePdf(true);
    try {
      await downloadAkashOfferLetterPdf({
        salutation,
        studentName,
        internshipPosition,
        technology,
        commencementDate,
        continueUntilDate,
        letterDate,
        title: letterTitle,
        customDescription: description,
        isCustomEdited,
        templateType: templateKey,
        universityId,
        customUniversity,
        purpose,
        signatoryName,
        signatoryRole,
        attachedFile: attachedFile ? { name: attachedFile.name, size: attachedFile.size } : undefined,
      });
    } catch (err) {
      console.error("Single PDF download failed:", err);
    } finally {
      setIsDownloadingSinglePdf(false);
    }
  };

  // Trigger Bulk Generation & ZIP Packaging
  const handleExecuteBulkGeneration = async () => {
    if (candidates.length === 0) return;

    setGenerationProgress({
      current: 0,
      total: candidates.length,
      candidateName: "Initializing Generator Engine...",
      status: "GENERATING",
    });

    try {
      const templateDef = LETTER_TEMPLATES.find((t) => t.key === templateKey);
      const options: BulkGenerationOptions = {
        templateKey,
        letterDate,
        title: letterTitle || templateDef?.defaultTitle,
        customDescriptionTemplate: isCustomEdited ? description : undefined,
        signatoryName,
        signatoryRole,
        universityId,
        saveToRegistry,
      };

      const result = await generateBulkLettersZip(candidates, options, (progress) => {
        setGenerationProgress(progress);
      });

      setGeneratedZipBlob(result.zipBlob);
      setGeneratedZipFilename(result.zipFilename);

      // Trigger immediate download of the ZIP file
      const url = URL.createObjectURL(result.zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.zipFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);

      // If saveToRegistry is enabled, register into backend store
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

  // Filtered Candidates in Roster View
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

  // Candidate Roster Actions
  const handleStartInlineEdit = (cand: CandidateLetterRow) => {
    setEditingCandidateId(cand.id);
    setEditCandidateData({ ...cand });
  };

  const handleSaveInlineEdit = () => {
    if (!editingCandidateId) return;
    setCandidates((prev) =>
      prev.map((c) => (c.id === editingCandidateId ? ({ ...c, ...editCandidateData } as CandidateLetterRow) : c))
    );
    setEditingCandidateId(null);
    setEditCandidateData({});
  };

  const handleDeleteCandidate = (id: string) => {
    setCandidates((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (activeCandidateIndex >= next.length) {
        setActiveCandidateIndex(Math.max(0, next.length - 1));
      }
      return next;
    });
  };

  const handleAddNewCandidate = () => {
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
    setActiveCandidateIndex(0);
    handleStartInlineEdit(newCand);
  };

  const previewKeywords = [
    `${salutation} ${studentName}`.trim(),
    studentName.trim(),
    "Akash Technolabs",
    internshipPosition.trim(),
    technology.trim(),
    commencementDate.trim(),
    continueUntilDate.trim(),
    "Internship Completion Certificate",
  ].filter(Boolean);

  // Render the authentic A4 Letterhead sheet (used in Split Studio and Full Preview)
  const renderLetterheadSheet = (isSplitView: boolean = false) => (
    <div
      id="akash-bulk-letterhead-sheet"
      className={`relative bg-white mx-auto w-full ${
        isSplitView ? "max-w-[720px] p-5 sm:p-9" : "max-w-[800px] p-8 sm:p-14"
      } shadow-xl border border-slate-300 rounded-sm text-slate-900 select-text overflow-hidden transition-all`}
      style={{ minHeight: isSplitView ? "960px" : "1050px" }}
    >
      {/* Center Dual-Tone Translucent Watermark matching authentic PDF */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
        <img
          src={AKASH_WATERMARK_BASE64}
          alt="Akash Technolabs Official Watermark"
          className="w-[280px] max-w-[85%] object-contain select-none pointer-events-none"
          style={{ opacity: 0.12 }}
        />
      </div>

      <div className="relative z-10 flex flex-col justify-between" style={{ minHeight: isSplitView ? "890px" : "960px" }}>
        <div>
          {/* Header with Official Akash Technolabs Banner */}
          <div className="pb-3">
            <img
              src={AKASH_HEADER_BASE64}
              alt="Akash Technolabs Official Banner"
              className="w-full object-contain select-none"
            />
          </div>

          {/* Right-aligned Date */}
          <div className="text-right text-xs sm:text-sm font-medium text-slate-900 pr-1 pt-1 pb-4">
            <span>Date :{letterDate}</span>
          </div>

          {/* Centered Bold Underlined Title */}
          <div className="text-center pt-1 pb-6">
            <h1 className="text-base sm:text-lg lg:text-xl font-bold tracking-wider text-slate-900 uppercase underline underline-offset-4 decoration-slate-900 decoration-1">
              {letterTitle}
            </h1>
          </div>

          {/* Dynamic Formatted Body Text with Markdown Tokenization */}
          <div className="space-y-4 text-xs sm:text-[13px] leading-relaxed text-slate-800 font-normal text-justify">
            {description.split(/\n\s*\n/).map((para, pIdx) => {
              const trimmed = para.trim();
              if (!trimmed) return null;

              // Filter out redundant elements that are already part of official letterhead
              const cleanLine = trimmed.replace(/^\*\*|\*\*$/g, "").replace(/^<b>|<\/b>$/gi, "").trim();
              if (/^akash\s*technolabs$/i.test(cleanLine)) return null;
              if (cleanLine.toUpperCase() === letterTitle.toUpperCase()) return null;
              if (/^date\s*:/i.test(cleanLine)) return null;
              if (/^for\s*akash\s*technolabs$/i.test(cleanLine)) return null;
              if (/^authorized\s*signatory$/i.test(cleanLine)) return null;

              if (/^(\*\*)?TO WHOMSOEVER IT MAY CONCERN(\*\*)?$/i.test(trimmed)) {
                return (
                  <p key={pIdx} className="font-bold text-slate-900 tracking-wide text-sm py-1">
                    TO WHOMSOEVER IT MAY CONCERN
                  </p>
                );
              }

              if (
                /^(\*\*)?To,/i.test(trimmed) ||
                /^(\*\*)?Subject:/i.test(trimmed) ||
                /^(\*\*)?Dear\s/i.test(trimmed)
              ) {
                const lines = trimmed.split("\n");
                return (
                  <div key={pIdx} className="space-y-1 py-1">
                    {lines.map((l, lIdx) => {
                      const isSubj = l.toLowerCase().includes("subject:");
                      const isTo = l.toLowerCase().includes("to,");
                      const tokens = tokenizeMarkdown(l, previewKeywords);
                      return (
                        <p
                          key={lIdx}
                          className={isSubj || isTo ? "font-bold text-slate-900" : "text-slate-800"}
                        >
                          {tokens.map((tok, tIdx) => (
                            <span
                              key={tIdx}
                              className={tok.bold || isSubj || isTo ? "font-bold text-slate-900" : ""}
                            >
                              {tok.text}
                            </span>
                          ))}
                        </p>
                      );
                    })}
                  </div>
                );
              }

              if (trimmed.includes("• ") || trimmed.includes("- ")) {
                const lines = trimmed.split("\n");
                return (
                  <div key={pIdx} className="space-y-1.5">
                    {lines.map((l, lIdx) => {
                      const lTrim = l.trim();
                      if (lTrim.startsWith("• ") || lTrim.startsWith("- ")) {
                        const bulletText = lTrim.replace(/^[•\-]\s*/, "");
                        const bTokens = tokenizeMarkdown(bulletText, previewKeywords);
                        return (
                          <div key={lIdx} className="flex items-start gap-2 pl-4 text-slate-800">
                            <span className="font-bold text-slate-900">•</span>
                            <span>
                              {bTokens.map((tok, tIdx) =>
                                tok.bold ? (
                                  <strong key={tIdx} className="font-bold text-slate-900">
                                    {tok.text}
                                  </strong>
                                ) : tok.italic ? (
                                  <em key={tIdx} className="italic text-slate-800">
                                    {tok.text}
                                  </em>
                                ) : (
                                  <span key={tIdx}>{tok.text}</span>
                                )
                              )}
                            </span>
                          </div>
                        );
                      }
                      const lTokens = tokenizeMarkdown(lTrim, previewKeywords);
                      return (
                        <p key={lIdx}>
                          {lTokens.map((tok, tIdx) =>
                            tok.bold ? (
                              <strong key={tIdx} className="font-bold text-slate-900">
                                {tok.text}
                              </strong>
                            ) : tok.italic ? (
                              <em key={tIdx} className="italic text-slate-800">
                                {tok.text}
                              </em>
                            ) : (
                              <span key={tIdx}>{tok.text}</span>
                            )
                          )}
                        </p>
                      );
                    })}
                  </div>
                );
              }

              const isIntroIndent = trimmed.startsWith("This is to inform");
              const tokens = tokenizeMarkdown(trimmed, previewKeywords);

              return (
                <p key={pIdx} className={isIntroIndent ? "indent-6" : ""}>
                  {tokens.map((tok, tIdx) =>
                    tok.bold ? (
                      <strong key={tIdx} className="font-bold text-slate-900">
                        {tok.text}
                      </strong>
                    ) : tok.italic ? (
                      <em key={tIdx} className="italic text-slate-800">
                        {tok.text}
                      </em>
                    ) : (
                      <span key={tIdx}>{tok.text}</span>
                    )
                  )}
                </p>
              );
            })}
          </div>

          {/* Official Attachment Badge */}
          {attachedFile && (
            <div className="mt-5 p-2.5 rounded-xl border border-dashed border-blue-300 bg-blue-50/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-800">
                <Paperclip className="w-4 h-4 text-blue-600" />
                <span className="font-semibold">Official Attachment:</span>
                <span className="font-mono text-blue-700">{attachedFile.name}</span>
                <span className="text-slate-500 text-[11px]">({(attachedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Verified Attached
              </span>
            </div>
          )}

          {/* Sign-Off Block */}
          <div className="pt-8 space-y-0.5 text-xs sm:text-sm">
            <p className="text-slate-800 font-medium">Sincerely</p>
            <div className="py-1">
              <img
                src={AKASH_STAMP_BASE64}
                alt="Akash Padhiyar CEO Signature & Stamp"
                className="h-16 w-auto object-contain select-none"
              />
            </div>
            <p className="font-bold text-slate-900 text-sm">{signatoryName}</p>
            <p className="font-medium text-slate-700 text-xs">{signatoryRole}</p>
          </div>
        </div>

        {/* Official Footer Banner */}
        <div className="pt-8 mt-auto">
          <img
            src={AKASH_FOOTER_BASE64}
            alt="Akash Technolabs Official Footer"
            className="w-full object-contain select-none"
          />
        </div>
      </div>
    </div>
  );

  // Left Column Controls (Matching Screenshot 2)
  const renderLeftControls = () => (
    <div className="space-y-5">
      {/* Card 1: Document Template Selection (8 Corporate Standards) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0F4C81]" />
            <span>Select Professional Document Template (8 Official Corporate Standards)</span>
          </div>
          <span className="text-[11px] font-mono text-blue-600 font-bold">
            {LETTER_TEMPLATES.find((t) => t.key === templateKey)?.shortName || "OFFER"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {LETTER_TEMPLATES.map((tmpl, idx) => {
            const isSelected = templateKey === tmpl.key;
            return (
              <button
                key={tmpl.key}
                type="button"
                onClick={() => handleTemplateSelect(tmpl.key)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  isSelected
                    ? "border-[#0F4C81] bg-blue-50/80 ring-2 ring-[#0F4C81]/30 shadow-xs"
                    : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base">{tmpl.icon}</span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                      isSelected ? "bg-[#0F4C81] text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {tmpl.shortName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">{idx + 1}. {tmpl.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Card 2: University Academic Practicum Format & Affiliation */}
      <div className="bg-slate-50/90 rounded-2xl border border-slate-200/90 p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <GraduationCap className="w-4 h-4 text-purple-600" />
            <span>University Academic Practicum Format &amp; Affiliation</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Auto-inserts university-specific curriculum standards
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {UNIVERSITY_PRESETS.map((uni) => {
            const isSelected = universityId === uni.id;
            return (
              <button
                key={uni.id}
                type="button"
                onClick={() => handleUniversitySelect(uni.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-purple-700 text-white shadow-xs ring-2 ring-purple-300"
                    : "bg-white text-slate-700 border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50"
                }`}
              >
                <span>🏛️</span>
                <span>{uni.name}</span>
              </button>
            );
          })}
        </div>

        {universityId === "CUSTOM" && (
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Custom University / College Name
            </label>
            <input
              type="text"
              value={customUniversity}
              onChange={(e) => {
                setCustomUniversity(e.target.value);
                setIsCustomEdited(false);
              }}
              placeholder="e.g. Ahmedabad Institute of Technology / Nirma University"
              className="w-full text-xs font-semibold text-slate-900 border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
          </div>
        )}
      </div>

      {/* Card 3: Spreadsheet Roster Source & Active Candidate Stepper */}
      <div className="bg-white rounded-2xl border border-blue-200/90 p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-blue-100 pb-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <FileSpreadsheet className="w-4 h-4 text-[#0F4C81]" />
            <span>Spreadsheet Source &amp; Active Candidate Navigator</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
            {candidates.length} Loaded Candidates
          </span>
        </div>

        {/* Candidate Switcher Stepper */}
        {candidates.length > 0 && activeCandidate && (
          <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-blue-50/90 p-3.5 rounded-xl border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={activeCandidateIndex <= 0}
                onClick={() => setActiveCandidateIndex((prev) => Math.max(0, prev - 1))}
                className="h-8 text-xs font-bold cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 mr-0.5" /> Prev
              </Button>

              <div className="text-center sm:text-left px-2">
                <p className="text-xs font-black text-slate-900">
                  {activeCandidate.salutation} {activeCandidate.studentName}
                </p>
                <p className="text-[10px] text-slate-600 font-medium">
                  Candidate {activeCandidateIndex + 1} of {candidates.length} • {activeCandidate.internshipPosition}
                </p>
              </div>

              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={activeCandidateIndex >= candidates.length - 1}
                onClick={() => setActiveCandidateIndex((prev) => Math.min(candidates.length - 1, prev + 1))}
                className="h-8 text-xs font-bold cursor-pointer"
              >
                Next <ChevronRight className="w-4 h-4 ml-0.5" />
              </Button>
            </div>

            {/* Quick dropdown jump */}
            <div className="w-full sm:w-auto">
              <select
                value={activeCandidateIndex}
                onChange={(e) => setActiveCandidateIndex(Number(e.target.value))}
                className="w-full sm:w-48 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {candidates.map((c, idx) => (
                  <option key={c.id || idx} value={idx}>
                    #{idx + 1}: {c.studentName} ({c.internshipPosition})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Upload / Replace Spreadsheet Dropzone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <input
            ref={replaceFileInputRef}
            type="file"
            onChange={handleSpreadsheetUpload}
            accept=".xlsx,.xls,.csv"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => replaceFileInputRef.current?.click()}
            disabled={isParsing}
            className="p-3 rounded-xl border border-dashed border-blue-400 bg-blue-50/50 hover:bg-blue-100/60 text-slate-800 transition-all cursor-pointer flex items-center justify-center gap-2 text-xs font-bold"
          >
            {isParsing ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            ) : (
              <UploadCloud className="w-4 h-4 text-blue-600" />
            )}
            <span>Upload / Replace Excel/CSV</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadSample}
            className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2 text-xs font-bold"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Download Sample Excel</span>
          </button>
        </div>

        {selectedFileName && (
          <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Active Roster: <strong className="text-slate-800">{selectedFileName}</strong> ({candidates.length} records)</span>
          </p>
        )}
      </div>

      {/* Card 4: Predefined Track Quick Select */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            Predefined Internship Domain &amp; Track Quick Select
          </h3>
          <span className="text-[11px] text-slate-400">Click to apply to active candidate</span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {PREDEFINED_TRACKS.map((trk) => {
            const isSelected =
              internshipPosition === trk.position ||
              technology.toLowerCase() === trk.technology.toLowerCase();
            return (
              <button
                key={trk.label}
                type="button"
                onClick={() => handleTrackSelect(trk)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#0F4C81] text-white shadow-xs ring-2 ring-blue-400"
                    : "bg-slate-50 text-slate-700 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/60"
                }`}
              >
                <span>{trk.icon}</span>
                <span>{trk.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Right Column Controls (Matching Screenshots 2, 3, 4)
  const renderRightControls = () => (
    <div className="space-y-5">
      {/* Card 5: Predefined Dynamic Letter Fields */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E52329]" />
            Candidate &amp; Practicum Variables (Full Dynamic Control)
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">Official Letterhead Variables</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Letter Date */}
          <DualDateField
            label="Letter Date"
            value={letterDate}
            onChange={setLetterDate}
            placeholder="DD-MM-YYYY (e.g. 04-11-2026)"
            mode="DD-MM-YYYY"
          />

          {/* Salutation / Gender Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Gender &amp; Salutation <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSalutation("Mr.");
                  updateActiveCandidateField({ salutation: "Mr." });
                  setIsCustomEdited(false);
                }}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
                  salutation === "Mr."
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span>👨 Male (Mr.)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSalutation("Ms.");
                  updateActiveCandidateField({ salutation: "Ms." });
                  setIsCustomEdited(false);
                }}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
                  salutation === "Ms."
                    ? "bg-pink-600 text-white border-pink-600 shadow-xs"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span>👩 Female (Ms.)</span>
              </button>
            </div>
          </div>

          {/* Student Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Student Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => {
                const val = e.target.value;
                setStudentName(val);
                if (isFemaleCandidate(val)) setSalutation("Ms.");
                updateActiveCandidateField({ studentName: val });
                setIsCustomEdited(false);
              }}
              placeholder="e.g. Fenil Patel"
              required
              className="w-full text-xs font-semibold text-slate-900 border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Recipient Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Recipient Student Email
            </label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => {
                setRecipientEmail(e.target.value);
                updateActiveCandidateField({ recipientEmail: e.target.value });
              }}
              placeholder="e.g. fenil.patel@akashtechnolabs.com"
              className="w-full text-xs font-semibold text-slate-900 border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Internship Position */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Internship Position / Role <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={internshipPosition}
              onChange={(e) => {
                const val = e.target.value;
                setInternshipPosition(val);
                const derived = deriveTrackTechnology(val);
                if (derived) setTechnology(derived);
                updateActiveCandidateField({ internshipPosition: val, technology: derived || technology });
                setIsCustomEdited(false);
              }}
              placeholder="e.g. AI/ML Intern or Python Intern"
              required
              className="w-full text-xs font-semibold text-slate-900 border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Technology */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Technology Domain <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={technology}
              onChange={(e) => {
                setTechnology(e.target.value);
                updateActiveCandidateField({ technology: e.target.value });
                setIsCustomEdited(false);
              }}
              placeholder="e.g. AI/ML, Python, PHP / Laravel..."
              required
              className="w-full text-xs font-semibold text-slate-900 border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Internship Start Date */}
          <DualDateField
            label="Internship Start Date"
            value={commencementDate}
            onChange={(val) => {
              setCommencementDate(val);
              updateActiveCandidateField({ commencementDate: val });
              setIsCustomEdited(false);
            }}
            placeholder="Pick date (e.g. 1st June 2026)"
            mode="ORDINAL"
          />

          {/* Internship End Date */}
          <DualDateField
            label="Internship End Date"
            value={continueUntilDate}
            onChange={(val) => {
              setContinueUntilDate(val);
              updateActiveCandidateField({ continueUntilDate: val });
              setIsCustomEdited(false);
            }}
            placeholder="Pick date (e.g. 30th November 2026)"
            mode="ORDINAL"
          />

          {/* Purpose / Academic Activity */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Purpose / Academic Activity
            </label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => {
                setPurpose(e.target.value);
                setIsCustomEdited(false);
              }}
              placeholder="e.g. Semester Practicum & Degree Project"
              className="w-full text-xs font-semibold text-slate-900 border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Card 6: Letter Title, Custom Content Source (Paste/Attach), & Mentor Assignment */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Official Document Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={letterTitle}
              onChange={(e) => setLetterTitle(e.target.value)}
              required
              className="w-full text-xs font-bold text-slate-900 border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Authorized Signatory
            </label>
            <div className="w-full text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 flex items-center justify-between">
              <span>{signatoryName} ({signatoryRole})</span>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                Digital Signature &amp; Stamp Attached
              </span>
            </div>
          </div>
        </div>

        {/* Custom Content Source: Dual Switcher (Screenshot 4) */}
        <div className="p-4 sm:p-5 rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/60 via-white to-blue-50/40 space-y-3.5 shadow-xs transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200/70 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <FileUp className="w-4 h-4 text-blue-700" />
                <h4 className="text-xs font-bold text-slate-900">
                  Custom Content Source: Attach Document File or Paste Draft
                </h4>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Choose either option: paste custom draft text or upload a document file (.txt, .md, .pdf, .docx)
              </p>
            </div>

            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-blue-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setContentAssistantTab("PASTE")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  contentAssistantTab === "PASTE"
                    ? "bg-[#0F4C81] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                <span>📋 Paste Draft Text</span>
              </button>

              <button
                type="button"
                onClick={() => setContentAssistantTab("ATTACH")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  contentAssistantTab === "ATTACH"
                    ? "bg-[#0F4C81] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>📎 Attach File / Upload</span>
              </button>
            </div>
          </div>

          {/* TAB 1: PASTE DRAFT TEXT */}
          {contentAssistantTab === "PASTE" && (
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-white p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Mentor Name (for Mentor Assignment Letters)
                  </label>
                  <input
                    type="text"
                    value={mentorName}
                    onChange={(e) => setMentorName(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Vaghela"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Mentor Designation
                  </label>
                  <input
                    type="text"
                    value={mentorDesignation}
                    onChange={(e) => setMentorDesignation(e.target.value)}
                    placeholder="e.g. Senior Technical Lead"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <textarea
                rows={5}
                value={pastedRawText}
                onChange={(e) => setPastedRawText(e.target.value)}
                placeholder="Paste your custom letter draft, NOC text, or university format here..."
                className="w-full p-3 text-xs font-sans text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 leading-relaxed"
              />

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  disabled={!pastedRawText.trim()}
                  onClick={() => handleApplyPastedText(true)}
                  className="bg-[#0F4C81] hover:bg-[#0C3D68] text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-300" />
                  Apply &amp; Auto-Replace Placeholders
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!pastedRawText.trim()}
                  onClick={() => handleApplyPastedText(false)}
                  className="text-xs font-bold rounded-xl cursor-pointer"
                >
                  Paste Raw Draft (As-Is)
                </Button>

                {pastedRawText && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPastedRawText("")}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ATTACH FILE / DOCUMENT */}
          {contentAssistantTab === "ATTACH" && (
            <div className="space-y-3 pt-1">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                accept=".txt,.md,.doc,.docx,.pdf,image/*"
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-300 hover:border-blue-500 bg-white hover:bg-blue-50/50 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-2xs">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Click to Browse or Drag &amp; Drop Document File
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Supports .txt, .md (auto-imported into letter body), .pdf, .docx, and images
                  </p>
                </div>
              </div>

              {attachedFile && (
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Paperclip className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{attachedFile.name}</p>
                      <p className="text-[10px] text-slate-500">
                        {(attachedFile.size / 1024).toFixed(1)} KB • Uploaded just now
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachedFile(null)}
                    className="text-red-500 hover:text-red-700 p-1 rounded-md text-xs font-semibold cursor-pointer"
                    title="Remove attachment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card 7: Document Body & Terms (Full Editable Text) (Screenshot 3) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700">Document Body &amp; Terms (Full Editable Text)</label>
            <button
              type="button"
              onClick={() => {
                setIsCustomEdited(false);
              }}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Reset to Official Template</span>
            </button>
          </div>

          <div className="border border-slate-300 rounded-xl overflow-hidden shadow-2xs">
            {/* Simulated WYSIWYG Toolbar */}
            <div className="bg-slate-100/90 px-3 py-1.5 border-b border-slate-200 flex flex-wrap items-center gap-1 text-slate-600">
              <button
                type="button"
                onClick={() => setDescription((prev) => (prev ? `**${prev}**` : ""))}
                title="Bold text"
                className="p-1 hover:bg-slate-200 rounded font-bold text-slate-800 text-xs"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDescription((prev) => (prev ? `*${prev}*` : ""))}
                title="Italic text"
                className="p-1 hover:bg-slate-200 rounded italic text-slate-800 text-xs"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDescription((prev) => prev + "\n• ")}
                title="Add bullet point"
                className="p-1 hover:bg-slate-200 rounded"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <span className="w-px h-4 bg-slate-300 mx-1" />
              <button type="button" className="p-1 hover:bg-slate-200 rounded text-amber-600"><Highlighter className="w-3.5 h-3.5" /></button>
              <button type="button" className="p-1 hover:bg-slate-200 rounded"><AlignLeft className="w-3.5 h-3.5" /></button>
              <button type="button" className="p-1 hover:bg-slate-200 rounded"><TableIcon className="w-3.5 h-3.5" /></button>
              <button type="button" className="p-1 hover:bg-slate-200 rounded"><LinkIcon className="w-3.5 h-3.5" /></button>
              <span className="w-px h-4 bg-slate-300 mx-1" />
              <button type="button" className="p-1 hover:bg-slate-200 rounded"><Maximize2 className="w-3.5 h-3.5" /></button>
              <button type="button" className="p-1 hover:bg-slate-200 rounded"><Code2 className="w-3.5 h-3.5" /></button>
              <button type="button" className="p-1 hover:bg-slate-200 rounded"><HelpCircle className="w-3.5 h-3.5" /></button>
            </div>

            {/* Textarea for Description */}
            <textarea
              rows={11}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setIsCustomEdited(true);
              }}
              className="w-full p-4 text-xs sm:text-sm font-sans text-slate-800 bg-white leading-relaxed focus:outline-hidden"
              placeholder="Type, edit or paste your letter body here..."
            />
          </div>
        </div>

        {/* Company Letterhead Elements locked note */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px] font-semibold">
              Company Letterhead Elements locked: Official Banner, Center Watermark, Aligned Right Date, Digital Signature &amp; Corporate Address &amp; Contact Footer.
            </span>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
            Akash Technolabs Authentic
          </span>
        </div>
      </div>

      {/* Database registry checkbox & Action Buttons */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={saveToRegistry}
            onChange={(e) => setSaveToRegistry(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
          />
          <span>Register generated records in Supabase &amp; Candidate Document Portal</span>
        </label>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleDownloadSinglePdf}
            disabled={isDownloadingSinglePdf}
            className="text-xs font-bold rounded-xl cursor-pointer bg-white"
          >
            <Download className="w-3.5 h-3.5 mr-1 text-[#0F4C81]" />
            <span>Download Single PDF</span>
          </Button>

          <Button
            type="button"
            onClick={handleExecuteBulkGeneration}
            className="bg-[#0F4C81] hover:bg-[#0C3D68] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 px-4 py-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Generate All ({candidates.length}) &amp; Download ZIP</span>
          </Button>
        </div>
      </div>
    </div>
  );

  // Wide 2-Column or Single-Column Form Renderer
  const renderEditorForm = (isWideTwoColumn: boolean = false) => (
    <div className="w-full">
      {isWideTwoColumn ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6">{renderLeftControls()}</div>
          <div className="lg:col-span-6">{renderRightControls()}</div>
        </div>
      ) : (
        <div className="space-y-5">
          {renderLeftControls()}
          {renderRightControls()}
        </div>
      )}
    </div>
  );

  // Candidate Roster View (`viewMode === "ROSTER"`)
  const renderCandidateRoster = () => (
    <div className="space-y-4">
      {/* Top Roster Header Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, role, tech, or college..."
              className="w-full text-xs font-semibold pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50"
            />
          </div>
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
            Showing {filteredCandidates.length} of {candidates.length}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleDownloadSample}
            className="text-xs font-bold rounded-xl cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Sample Excel
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => replaceFileInputRef.current?.click()}
            className="text-xs font-bold rounded-xl cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5 mr-1 text-blue-600" />
            Replace File
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleAddNewCandidate}
            className="bg-[#0F4C81] hover:bg-[#0C3D68] text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Candidate
          </Button>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <th className="py-3 px-3 w-12 text-center">#</th>
                <th className="py-3 px-4">Candidate Name</th>
                <th className="py-3 px-4">Salutation</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Position / Role</th>
                <th className="py-3 px-4">Technology Track</th>
                <th className="py-3 px-4">Internship Dates</th>
                <th className="py-3 px-4">College / University</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredCandidates.map((cand, idx) => {
                const isEditing = editingCandidateId === cand.id;
                const isSelectedActive = candidates[activeCandidateIndex]?.id === cand.id;

                if (isEditing) {
                  return (
                    <tr key={cand.id || idx} className="bg-blue-50/40">
                      <td className="py-3 px-3 text-center font-bold text-slate-500">{idx + 1}</td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={editCandidateData.studentName || ""}
                          onChange={(e) => setEditCandidateData({ ...editCandidateData, studentName: e.target.value })}
                          className="w-full text-xs font-bold p-1.5 border border-blue-400 rounded-lg bg-white"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <select
                          value={editCandidateData.salutation || "Mr."}
                          onChange={(e) => setEditCandidateData({ ...editCandidateData, salutation: e.target.value as "Mr." | "Ms." })}
                          className="text-xs font-semibold p-1.5 border border-blue-400 rounded-lg bg-white"
                        >
                          <option value="Mr.">Mr.</option>
                          <option value="Ms.">Ms.</option>
                        </select>
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="email"
                          value={editCandidateData.recipientEmail || ""}
                          onChange={(e) => setEditCandidateData({ ...editCandidateData, recipientEmail: e.target.value })}
                          className="w-full text-xs p-1.5 border border-blue-400 rounded-lg bg-white"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={editCandidateData.internshipPosition || ""}
                          onChange={(e) => setEditCandidateData({ ...editCandidateData, internshipPosition: e.target.value })}
                          className="w-full text-xs p-1.5 border border-blue-400 rounded-lg bg-white"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={editCandidateData.technology || ""}
                          onChange={(e) => setEditCandidateData({ ...editCandidateData, technology: e.target.value })}
                          className="w-full text-xs p-1.5 border border-blue-400 rounded-lg bg-white"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex gap-1">
                          <input
                            type="text"
                            placeholder="Start"
                            value={editCandidateData.commencementDate || ""}
                            onChange={(e) => setEditCandidateData({ ...editCandidateData, commencementDate: e.target.value })}
                            className="w-24 text-[11px] p-1 border border-blue-400 rounded-lg bg-white"
                          />
                          <input
                            type="text"
                            placeholder="End"
                            value={editCandidateData.continueUntilDate || ""}
                            onChange={(e) => setEditCandidateData({ ...editCandidateData, continueUntilDate: e.target.value })}
                            className="w-24 text-[11px] p-1 border border-blue-400 rounded-lg bg-white"
                          />
                        </div>
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={editCandidateData.college || editCandidateData.university || ""}
                          onChange={(e) => setEditCandidateData({ ...editCandidateData, college: e.target.value, university: e.target.value })}
                          className="w-full text-xs p-1.5 border border-blue-400 rounded-lg bg-white"
                        />
                      </td>
                      <td className="py-2 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            onClick={handleSaveInlineEdit}
                            className="h-7 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-2.5"
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingCandidateId(null)}
                            className="h-7 text-xs text-slate-600"
                          >
                            Cancel
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr
                    key={cand.id || idx}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isSelectedActive ? "bg-blue-50/50 font-semibold" : ""
                    }`}
                  >
                    <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{cand.studentName}</span>
                      {isSelectedActive && (
                        <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">Active</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{cand.salutation}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{cand.recipientEmail || "—"}</td>
                    <td className="py-3 px-4 text-slate-800 font-medium">{cand.internshipPosition}</td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded text-[11px]">
                        {cand.technology}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[11px]">
                      {cand.commencementDate} → {cand.continueUntilDate}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-[200px] truncate">
                      {cand.college || cand.university || "—"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const realIdx = candidates.findIndex((c) => c.id === cand.id);
                            if (realIdx !== -1) {
                              setActiveCandidateIndex(realIdx);
                              setViewMode("PREVIEW");
                            }
                          }}
                          className="h-7 text-xs bg-blue-50/80 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold px-2.5 rounded-lg flex items-center gap-1 cursor-pointer"
                          title="Preview live A4 letterhead on screen"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          <span>Preview</span>
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const realIdx = candidates.findIndex((c) => c.id === cand.id);
                            if (realIdx !== -1) {
                              setActiveCandidateIndex(realIdx);
                              setViewMode("SPLIT");
                            }
                          }}
                          className="h-7 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-semibold px-2 rounded-lg flex items-center gap-1 cursor-pointer"
                          title="Open in split studio editor"
                        >
                          <Columns className="w-3.5 h-3.5" />
                          <span>Studio</span>
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            const realIdx = candidates.findIndex((c) => c.id === cand.id);
                            if (realIdx !== -1) {
                              setActiveCandidateIndex(realIdx);
                              await downloadAkashOfferLetterPdf({
                                salutation: cand.salutation,
                                studentName: cand.studentName,
                                internshipPosition: cand.internshipPosition,
                                technology: cand.technology,
                                commencementDate: cand.commencementDate,
                                continueUntilDate: cand.continueUntilDate,
                                letterDate,
                                title: letterTitle,
                                customDescription: isCustomEdited ? description : undefined,
                                isCustomEdited,
                                templateType: templateKey,
                                universityId,
                                customUniversity: cand.college || cand.university,
                                signatoryName,
                                signatoryRole,
                              });
                            }
                          }}
                          className="h-7 text-xs text-slate-500 hover:text-[#0F4C81] hover:bg-blue-50 font-semibold px-2 rounded-lg flex items-center gap-1 cursor-pointer"
                          title="Download this candidate's PDF file"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </Button>

                        <button
                          type="button"
                          onClick={() => handleStartInlineEdit(cand)}
                          className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                          title="Edit candidate"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteCandidate(cand.id)}
                          className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                          title="Delete candidate"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/85 backdrop-blur-sm p-1 sm:p-2.5 overflow-hidden">
      <div className="relative w-full h-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Top brand line: Cyan, Navy, Red */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#00A8CC] via-[#0F4C81] to-[#E52329] shrink-0" />

        {/* Studio Top Navigation Bar (Screenshot 2) */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-slate-200 bg-slate-50/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0F4C81] to-[#00A8CC] flex items-center justify-center text-white shadow-xs">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                  Official Bulk Document Dispatch &amp; Letter Studio
                </h2>
                <span className="hidden sm:inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-blue-100 text-blue-800 border-blue-200">
                  Akash Technolabs Enterprise
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
                Full-screen studio with live A4 letterhead sync, spreadsheet roster binding, university presets &amp; bulk ZIP package
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode("SPLIT")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "SPLIT"
                  ? "bg-[#0F4C81] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">⚡ Split Studio</span>
              <span className="sm:hidden">Split</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("FORM")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "FORM"
                  ? "bg-[#0F4C81] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">📝 Editor Only</span>
              <span className="sm:hidden">Edit</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("PREVIEW")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "PREVIEW"
                  ? "bg-[#0F4C81] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">📄 Full Letterhead</span>
              <span className="sm:hidden">Letterhead</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("ROSTER")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "ROSTER"
                  ? "bg-[#0F4C81] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">👥 Candidate Roster ({candidates.length})</span>
              <span className="sm:hidden">Roster ({candidates.length})</span>
            </button>
          </div>

          {/* Action buttons on top bar */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleDownloadSample}
              className="hidden lg:flex items-center gap-1.5 text-xs font-bold rounded-xl cursor-pointer bg-white"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sample Excel</span>
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setViewMode("PREVIEW")}
              className="bg-blue-50/90 hover:bg-blue-100 text-[#0F4C81] border border-blue-200 font-bold text-xs rounded-xl shadow-2xs cursor-pointer flex items-center gap-1.5 px-3 py-1.5"
              title="Preview active candidate's A4 letterhead on screen (no download)"
            >
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Preview Letter</span>
              <span className="sm:hidden">Preview</span>
            </Button>

            <Button
              type="button"
              size="sm"
              disabled={isDownloadingSinglePdf}
              onClick={handleDownloadSinglePdf}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold text-xs rounded-xl shadow-2xs cursor-pointer flex items-center gap-1.5 px-3 py-1.5"
            >
              {isDownloadingSinglePdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span className="hidden md:inline">Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-[#0F4C81]" />
                  <span className="hidden md:inline">Download Single PDF</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              onClick={handleExecuteBulkGeneration}
              disabled={candidates.length === 0}
              className="bg-[#0F4C81] hover:bg-[#0C3D68] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 px-3.5 py-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Generate All ({candidates.length}) &amp; ZIP</span>
            </Button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer ml-1"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback message banner */}
        {statusMessage && (
          <div
            className={`px-6 py-2.5 text-xs font-semibold flex items-center justify-between border-b shrink-0 ${
              statusMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Main Studio Body Workspace */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {viewMode === "SPLIT" && (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
              {/* Left Column: Form Editor (Scrollable) */}
              <div className="lg:col-span-6 xl:col-span-6 h-full overflow-y-auto p-4 sm:p-6 bg-slate-50/60 border-r border-slate-200">
                {renderEditorForm(false)}
              </div>

              {/* Right Column: Live Letterhead Sheet Preview (Scrollable) */}
              <div className="lg:col-span-6 xl:col-span-6 h-full overflow-y-auto p-4 sm:p-6 bg-slate-200/70 flex flex-col items-center">
                <div className="w-full max-w-[720px] flex items-center justify-between pb-3 text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-1.5 text-slate-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Live A4 Letterhead Preview</span>
                    {activeCandidate && (
                      <span className="text-[10px] font-normal text-slate-500">
                        (Active: {activeCandidate.studentName})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setViewMode("PREVIEW")}
                      className="h-7 text-[11px] font-bold bg-white text-blue-700 hover:bg-blue-50 border-blue-200 cursor-pointer"
                      title="View full A4 letterhead on screen"
                    >
                      <Eye className="w-3 h-3 mr-1 text-blue-600" />
                      Fullscreen
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isDownloadingSinglePdf}
                      onClick={handleDownloadSinglePdf}
                      className="h-7 text-[11px] font-bold bg-white text-slate-700 hover:bg-slate-50 cursor-pointer"
                      title="Download PDF file for this candidate"
                    >
                      <Download className="w-3 h-3 mr-1 text-[#0F4C81]" />
                      PDF
                    </Button>
                  </div>
                </div>
                {renderLetterheadSheet(true)}
              </div>
            </div>
          )}

          {viewMode === "FORM" && (
            <div className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 bg-slate-50/60">
              <div className="w-full max-w-[1750px] mx-auto px-1 sm:px-2">
                {renderEditorForm(true)}
              </div>
            </div>
          )}

          {viewMode === "PREVIEW" && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-200/80 flex flex-col items-center">
              {/* Candidate Navigation & Action Bar for Preview Mode */}
              <div className="w-full max-w-[800px] mb-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={activeCandidateIndex <= 0}
                    onClick={() => setActiveCandidateIndex((prev) => Math.max(0, prev - 1))}
                    className="h-8 text-xs font-bold cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4 mr-0.5" /> Prev
                  </Button>
                  <div className="text-center sm:text-left px-2">
                    <span className="text-xs font-black text-slate-900 block">
                      #{activeCandidateIndex + 1} of {candidates.length}: {activeCandidate?.salutation} {activeCandidate?.studentName}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {activeCandidate?.internshipPosition} • {activeCandidate?.technology}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={activeCandidateIndex >= candidates.length - 1}
                    onClick={() => setActiveCandidateIndex((prev) => Math.min(candidates.length - 1, prev + 1))}
                    className="h-8 text-xs font-bold cursor-pointer"
                  >
                    Next <ChevronRight className="w-4 h-4 ml-0.5" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={activeCandidateIndex}
                    onChange={(e) => setActiveCandidateIndex(Number(e.target.value))}
                    className="text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-hidden"
                  >
                    {candidates.map((c, idx) => (
                      <option key={c.id || idx} value={idx}>
                        #{idx + 1}: {c.studentName} ({c.internshipPosition})
                      </option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setViewMode("ROSTER")}
                    className="h-8 text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5 mr-1" />
                    Roster
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setViewMode("SPLIT")}
                    className="h-8 text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer"
                  >
                    <Columns className="w-3.5 h-3.5 mr-1" />
                    Split Studio
                  </Button>
                  <Button
                    size="sm"
                    disabled={isDownloadingSinglePdf}
                    onClick={handleDownloadSinglePdf}
                    className="h-8 bg-[#0F4C81] hover:bg-[#0C3D68] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    {isDownloadingSinglePdf ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
              {renderLetterheadSheet(false)}
            </div>
          )}

          {viewMode === "ROSTER" && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/70">
              <div className="max-w-[1600px] mx-auto">
                {renderCandidateRoster()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generation Progress Modal / Overlay */}
      {generationProgress && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 w-full max-w-md space-y-5">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0F4C81] flex items-center justify-center mx-auto shadow-inner">
                {generationProgress.status === "DONE" ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-600 animate-in zoom-in" />
                ) : generationProgress.status === "ERROR" ? (
                  <AlertCircle className="w-7 h-7 text-red-600" />
                ) : (
                  <Sparkles className="w-6 h-6 animate-spin text-[#0F4C81]" />
                )}
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {generationProgress.status === "DONE"
                  ? "Bulk Letters Generated & Packaged!"
                  : generationProgress.status === "ERROR"
                  ? "Generation Interrupted"
                  : "Generating Official Candidate Letters..."}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {generationProgress.status === "DONE"
                  ? `Successfully produced ${generationProgress.total} letters in a clean ZIP bundle.`
                  : generationProgress.candidateName}
              </p>
            </div>

            {/* Progress Bar */}
            {generationProgress.status !== "ERROR" && (
              <div className="space-y-1.5">
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-[#0F4C81] h-2.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        generationProgress.total > 0
                          ? Math.round((generationProgress.current / generationProgress.total) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-bold text-slate-500">
                  <span>
                    {generationProgress.current} of {generationProgress.total} candidates
                  </span>
                  <span>
                    {generationProgress.total > 0
                      ? Math.round((generationProgress.current / generationProgress.total) * 100)
                      : 0}
                    %
                  </span>
                </div>
              </div>
            )}

            {/* Actions on Finish / Error */}
            <div className="pt-2 flex items-center justify-end gap-2">
              {generationProgress.status === "DONE" && generatedZipBlob && (
                <Button
                  size="sm"
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
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Download ZIP Again
                </Button>
              )}

              <Button
                size="sm"
                variant={generationProgress.status === "DONE" ? "outline" : "primary"}
                onClick={() => setGenerationProgress(null)}
                className="text-xs font-bold rounded-xl"
              >
                {generationProgress.status === "DONE" ? "Close" : "Dismiss"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
