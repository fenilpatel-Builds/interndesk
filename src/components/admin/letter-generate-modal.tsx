"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Sparkles,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Highlighter,
  List,
  ListOrdered,
  AlignLeft,
  Table as TableIcon,
  Link as LinkIcon,
  Maximize2,
  Code2,
  HelpCircle,
  Calendar,
  CheckCircle2,
  UserCheck,
  FileText,
  Download,
  Lock,
  Eye,
  ShieldCheck,
  Loader2,
  GraduationCap,
  Building2,
  ClipboardPaste,
  Edit3,
  Trash2,
  RefreshCw,
  Paperclip,
  Upload,
  Columns,
  FileUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  downloadAkashOfferLetterPdf,
  isFemaleCandidate,
  deriveTrackTechnology,
} from "@/lib/documents/akash-pdf-generator";
import {
  LETTER_TEMPLATES,
  UNIVERSITY_PRESETS,
  generateLetterContent,
  tokenizeMarkdown,
  cleanAndSanitizePastedText,
  LetterTemplateKey,
  MarkdownToken,
} from "@/lib/documents/letter-templates";
import {
  AKASH_HEADER_BASE64,
  AKASH_WATERMARK_BASE64,
  AKASH_STAMP_BASE64,
} from "@/lib/documents/akash-letterhead-assets";

interface StudentOption {
  id: string;
  name: string;
  email: string;
  college?: string;
  technology?: string;
  university?: string;
}

export interface LetterGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (doc: any) => void;
  initialDoc?: any | null; // Pass existing document to EDIT/UPDATE
  initialCustomTab?: "PASTE" | "ATTACH";
}

// Predefined tracks for fast domain selection (AI/ML, Cybersecurity, Python, etc.)
export interface PredefinedTrack {
  label: string;
  position: string;
  technology: string;
  icon: string;
}

export const PREDEFINED_TRACKS: PredefinedTrack[] = [
  { label: "AI / ML", position: "AI/ML Intern", technology: "AI/ML", icon: "🤖" },
  { label: "Cybersecurity", position: "Cybersecurity Intern", technology: "Cybersecurity", icon: "🛡️" },
  { label: "Python Developer", position: "Python Developer Intern", technology: "Python", icon: "🐍" },
  { label: "Full Stack Web", position: "Full Stack Web Developer Intern", technology: "Full Stack Web Development", icon: "💻" },
  { label: "Data Science & Analytics", position: "Data Science & Analytics Intern", technology: "Data Science & Analytics", icon: "📊" },
  { label: "Cloud & DevOps", position: "Cloud & DevOps Intern", technology: "Cloud & DevOps", icon: "☁️" },
  { label: "Flutter / Mobile", position: "Mobile App Developer Intern", technology: "Flutter & Mobile App Development", icon: "📱" },
  { label: "UI / UX Design", position: "UI/UX Design Intern", technology: "UI/UX Design", icon: "🎨" },
  { label: "Java Developer", position: "Java Developer Intern", technology: "Java", icon: "☕" },
  { label: "PHP & Laravel", position: "PHP / Laravel Developer Intern", technology: "PHP & Laravel", icon: "🐘" },
  { label: "IoT & Embedded", position: "Embedded Systems & IoT Intern", technology: "Embedded Systems & IoT", icon: "⚡" },
  { label: "QA & Testing", position: "Quality Assurance (QA) Intern", technology: "Software Testing & QA", icon: "🔍" },
];

// Helper to format date into "3rd August 2026"
export function formatOrdinalDate(dateStr: string): string {
  if (!dateStr || !dateStr.includes("-")) return dateStr;
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return dateStr;
  const [year, month, day] = parts;
  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${getOrdinal(day)} ${months[month - 1]} ${year}`;
}

// Helper to format date into "30-10-2026" (DD-MM-YYYY)
export function formatStandardDate(dateStr: string): string {
  if (!dateStr || !dateStr.includes("-")) return dateStr;
  const parts = dateStr.split("-");
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
}

// Reusable Dual Input: Allows BOTH typing directly and picking from a popup calendar
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

// Helper to format date into "DD-MM-YYYY" based on current real date
export function getTodayFormattedDDMMYYYY(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  return `${day}-${month}-${year}`;
}

// Text Highlighter for preview
function highlightKeywords(text: string, keywords: string[]): React.ReactNode[] {
  if (!text) return [];
  const validKeywords = keywords.filter((k) => k && k.trim().length > 1);
  if (validKeywords.length === 0) return [text];

  const nodes: React.ReactNode[] = [];
  let remaining = text;
  let keyIndex = 0;

  while (remaining.length > 0) {
    let earliestIdx = -1;
    let matchedKw = "";

    for (const kw of validKeywords) {
      const idx = remaining.indexOf(kw);
      if (idx !== -1 && (earliestIdx === -1 || idx < earliestIdx)) {
        earliestIdx = idx;
        matchedKw = kw;
      }
    }

    if (earliestIdx !== -1) {
      if (earliestIdx > 0) {
        nodes.push(remaining.slice(0, earliestIdx));
      }
      nodes.push(
        <strong key={keyIndex++} className="font-bold text-slate-900">
          {matchedKw}
        </strong>
      );
      remaining = remaining.slice(earliestIdx + matchedKw.length);
    } else {
      nodes.push(remaining);
      break;
    }
  }

  return nodes;
}

export function LetterGenerateModal({
  isOpen,
  onClose,
  onSuccess,
  initialDoc,
  initialCustomTab,
}: LetterGenerateModalProps) {
  const isEditMode = Boolean(initialDoc && initialDoc.id);

  // Document Template Selection
  const [templateKey, setTemplateKey] = useState<LetterTemplateKey>("INTERNSHIP_OFFER");

  // University / Affiliation Format Selection (GTU, SOU, GU, Standard, Custom)
  const [universityId, setUniversityId] = useState<string>("STANDARD");
  const [customUniversity, setCustomUniversity] = useState<string>("");

  // Letter metadata
  const [letterDate, setLetterDate] = useState(() => getTodayFormattedDDMMYYYY());
  const [letterTitle, setLetterTitle] = useState("INTERNSHIP OFFER LETTER");

  // Candidate fields
  const [salutation, setSalutation] = useState<"Mr." | "Ms.">("Mr.");
  const [studentName, setStudentName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [internshipPosition, setInternshipPosition] = useState("");
  const [commencementDate, setCommencementDate] = useState(""); // Blank by default
  const [continueUntilDate, setContinueUntilDate] = useState(""); // Blank by default
  const [technology, setTechnology] = useState("");
  const [purpose, setPurpose] = useState("Academic Project & Practicum Training");
  const [mentorName, setMentorName] = useState("");
  const [mentorDesignation, setMentorDesignation] = useState("");

  // Signatory fields
  const [signatoryName] = useState("Akash Padhiyar");
  const [signatoryRole] = useState("CEO");

  // Registered students list for auto-fill
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  // Description / Body text
  const [description, setDescription] = useState("");
  const [isCustomEdited, setIsCustomEdited] = useState(false);

  // Quick Paste & Interpolation Assistant State
  const [showPasteHelper, setShowPasteHelper] = useState(false);
  const [pastedRawText, setPastedRawText] = useState("");

  // Attached File State (Upload Drafts / Syllabus / NOC attachments)
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    size: number;
    type: string;
    uploadedAt: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Content Assistant Mode: "PASTE" or "ATTACH"
  const [contentAssistantTab, setContentAssistantTab] = useState<"PASTE" | "ATTACH">(initialCustomTab || "PASTE");

  useEffect(() => {
    if (initialCustomTab && isOpen) {
      setContentAssistantTab(initialCustomTab);
      setTimeout(() => {
        const el = document.getElementById("custom-content-assistant-card");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 150);
    }
  }, [initialCustomTab, isOpen]);

  // View mode: Fullscreen Split Studio (Side-by-Side), Editor Form only, or Fullscreen Official A4 Preview
  const [viewMode, setViewMode] = useState<"SPLIT" | "FORM" | "PREVIEW">("SPLIT");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Synchronize description whenever fields or template changes (unless admin custom edited)
  const refreshDescriptionFromTemplate = () => {
    const generated = generateLetterContent({
      templateKey,
      salutation,
      studentName,
      internshipPosition,
      technology,
      commencementDate,
      continueUntilDate,
      letterDate,
      universityId,
      customUniversity,
      purpose,
      signatoryName,
      signatoryRole,
    });
    setLetterTitle(generated.title);
    setDescription(generated.fullText);
  };

  useEffect(() => {
    if (!isCustomEdited && !isEditMode) {
      refreshDescriptionFromTemplate();
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
    isEditMode,
  ]);

  // Load registered students
  useEffect(() => {
    if (isOpen) {
      fetch("/api/admin/students", { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((data) => {
          if (Array.isArray(data.students)) {
            setStudents(data.students);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Reset or pre-fill state when modal opens
  useEffect(() => {
    if (isOpen) {
      setViewMode("FORM");
      setStatusMessage(null);
      setIsSubmitting(false);
      setShowPasteHelper(false);
      setPastedRawText("");

      if (initialDoc) {
        // EDIT MODE: Pre-fill from existing document
        const raw = initialDoc.rawDoc || initialDoc;
        const tmplData = raw.template_data || {};

        const sal = tmplData.salutation || (isFemaleCandidate(raw.recipient_name || initialDoc.student) ? "Ms." : "Mr.");
        setSalutation(sal);

        const cleanName = (tmplData.student_name || raw.recipient_name || initialDoc.student || "")
          .replace(/^(Mr\.|Ms\.)\s*/i, "")
          .trim();
        setStudentName(cleanName);

        setRecipientEmail(raw.recipient_email || "");
        setInternshipPosition(raw.recipient_role || initialDoc.role || "AI/ML Intern");
        setTechnology(tmplData.technology || deriveTrackTechnology(raw.recipient_role || initialDoc.role));
        setCommencementDate(tmplData.commencement_date || "");
        setContinueUntilDate(tmplData.continue_until_date || "");
        setLetterDate(raw.issued_date || initialDoc.appliedAt || getTodayFormattedDDMMYYYY());
        setLetterTitle(raw.title || initialDoc.title || "INTERNSHIP OFFER LETTER");
        const detectedTmplKey: LetterTemplateKey =
          (raw.template_type as LetterTemplateKey) ||
          (raw.document_type === "COMPLETION_CERTIFICATE"
            ? "INTERNSHIP_COMPLETION"
            : raw.document_type === "NOC"
            ? "NOC_LETTER"
            : raw.document_type === "RECOMMENDATION_LETTER"
            ? "RECOMMENDATION_LETTER"
            : raw.document_type === "JOINING_LETTER"
            ? "JOINING_CONFIRMATION"
            : "INTERNSHIP_OFFER");
        setTemplateKey(detectedTmplKey);
        setUniversityId(tmplData.university || "STANDARD");
        setPurpose(tmplData.purpose || "Academic Project & Practicum Training");

        const isStub =
          !raw.description_content ||
          (!raw.description_content.includes("\n\n") &&
            (raw.description_content.trim().startsWith("This officially certifies that") ||
              raw.description_content.length < 220));

        if (raw.description_content && !isStub) {
          setDescription(raw.description_content);
          setIsCustomEdited(true);
        } else {
          setIsCustomEdited(false);
          const gen = generateLetterContent({
            templateKey: detectedTmplKey,
            salutation: sal,
            studentName: cleanName,
            internshipPosition: raw.recipient_role || initialDoc.role || `${tmplData.technology || "AI/ML"} Intern`,
            technology: tmplData.technology || deriveTrackTechnology(raw.recipient_role || initialDoc.role),
            commencementDate: tmplData.commencement_date || "",
            continueUntilDate: tmplData.continue_until_date || "",
            letterDate: raw.issued_date || initialDoc.appliedAt || getTodayFormattedDDMMYYYY(),
            universityId: tmplData.university || "STANDARD",
            purpose: tmplData.purpose || "Academic Project & Practicum Training",
            signatoryName: "Akash Padhiyar",
            signatoryRole: "CEO",
          });
          setDescription(gen.fullText);
          setLetterTitle(gen.title);
        }
      } else {
        // CREATE MODE: Fresh blank document
        setIsCustomEdited(false);
        setLetterDate(getTodayFormattedDDMMYYYY());
        setSalutation("Mr.");
        setStudentName("");
        setRecipientEmail("");
        setInternshipPosition("");
        setCommencementDate("");
        setContinueUntilDate("");
        setTechnology("");
        setSelectedStudentId("");
        setTemplateKey("INTERNSHIP_OFFER");
        setUniversityId("STANDARD");
        setCustomUniversity("");
        setPurpose("Academic Project & Practicum Training");
        refreshDescriptionFromTemplate();
      }
    }
  }, [isOpen, initialDoc]);

  // Handle template change
  const handleTemplateSelect = (key: LetterTemplateKey) => {
    setTemplateKey(key);
    const tmpl = LETTER_TEMPLATES.find((t) => t.key === key);
    if (tmpl) {
      setLetterTitle(tmpl.defaultTitle);
    }
    setIsCustomEdited(false);
  };

  // Handle University change
  const handleUniversitySelect = (uId: string) => {
    setUniversityId(uId);
    setIsCustomEdited(false);
  };

  // Student dropdown auto-fill
  const handleStudentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedStudentId(val);
    const found = students.find((s) => s.id === val || s.email === val);
    if (found) {
      setStudentName(found.name);
      setRecipientEmail(found.email);
      const isFemale = isFemaleCandidate(found.name);
      const sal = isFemale ? "Ms." : "Mr.";
      setSalutation(sal);

      if (found.technology) {
        const cleanT = deriveTrackTechnology(found.technology);
        setTechnology(cleanT);
        setInternshipPosition(`${cleanT} Intern`);
      }

      // Check university
      if (found.university) {
        const uLower = found.university.toLowerCase();
        if (uLower.includes("gtu") || uLower.includes("technological")) {
          setUniversityId("GTU");
        } else if (uLower.includes("silver") || uLower.includes("sou")) {
          setUniversityId("SOU");
        } else if (uLower.includes("gujarat university")) {
          setUniversityId("GU");
        } else if (uLower.includes("parul")) {
          setUniversityId("PARUL");
        } else if (uLower.includes("nirma")) {
          setUniversityId("NIRMA");
        }
      }

      setIsCustomEdited(false);
    }
  };

  const handleSalutationChange = (val: "Mr." | "Ms.") => {
    setSalutation(val);
    setIsCustomEdited(false);
  };

  const handleStudentNameChange = (val: string) => {
    setStudentName(val);
    if (isFemaleCandidate(val)) {
      setSalutation("Ms.");
    }
    setIsCustomEdited(false);
  };

  const handlePositionChange = (val: string) => {
    setInternshipPosition(val);
    const derived = deriveTrackTechnology(val);
    if (derived) {
      setTechnology(derived);
    }
    setIsCustomEdited(false);
  };

  const handleTrackSelect = (trk: PredefinedTrack) => {
    setInternshipPosition(trk.position);
    setTechnology(trk.technology);
    setIsCustomEdited(false);
  };

  // Paste & Interpolate Handler
  const handleApplyPastedText = (interpolate: boolean) => {
    if (!pastedRawText.trim()) return;

    if (interpolate) {
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

      if (result.detectedTitle) {
        setLetterTitle(result.detectedTitle.toUpperCase());
      }
      if (result.detectedDate) {
        setLetterDate(result.detectedDate);
      }
      setDescription(result.cleanedText);
    } else {
      setDescription(pastedRawText.trim());
    }

    setIsCustomEdited(true);
    setShowPasteHelper(false);
    setPastedRawText("");
  };

  // File Upload Handler (Text import or PDF/Doc attachment)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isTextFile =
      file.name.endsWith(".txt") ||
      file.name.endsWith(".md") ||
      file.type.startsWith("text/");

    if (isTextFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawText = event.target?.result as string;
        if (rawText) {
          const result = cleanAndSanitizePastedText(rawText, {
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

          if (result.detectedTitle) {
            setLetterTitle(result.detectedTitle.toUpperCase());
          }
          if (result.detectedDate) {
            setLetterDate(result.detectedDate);
          }
          setDescription(result.cleanedText);
          setIsCustomEdited(true);
          setStatusMessage({
            type: "success",
            text: `Imported and sanitized draft content from "${file.name}"!`,
          });
        }
      };
      reader.readAsText(file);
    } else {
      setStatusMessage({
        type: "success",
        text: `Attached file "${file.name}" (${(file.size / 1024).toFixed(1)} KB) to official document record.`,
      });
    }

    setAttachedFile({
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
      uploadedAt: new Date().toISOString(),
    });
  };

  const handleRemoveAttachment = () => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Submit Handler: Supports both CREATE and UPDATE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!studentName.trim()) {
      setStatusMessage({ type: "error", text: "Please enter or select a student name." });
      return;
    }
    if (!commencementDate.trim()) {
      setStatusMessage({ type: "error", text: "Please select the Internship Start Date." });
      return;
    }
    if (!continueUntilDate.trim()) {
      setStatusMessage({ type: "error", text: "Please select the Internship End Date." });
      return;
    }

    setIsSubmitting(true);

    try {
      const activeTmpl = LETTER_TEMPLATES.find((t) => t.key === templateKey);
      const docPayload = {
        templateType: templateKey,
        documentType: activeTmpl?.documentType || "OFFER_LETTER",
        letterDate,
        title: letterTitle,
        salutation,
        studentName,
        recipientEmail,
        internshipPosition,
        commencementDate,
        continueUntilDate,
        technology,
        descriptionContent: description,
        university: universityId !== "STANDARD" ? (universityId === "CUSTOM" ? customUniversity : universityId) : undefined,
        purpose,
        attachedFile: attachedFile ? { name: attachedFile.name, size: attachedFile.size, type: attachedFile.type } : undefined,
      };

      let res: Response;
      if (isEditMode) {
        // UPDATE Existing Document
        const docIdToUpdate =
          initialDoc.id ||
          initialDoc.docNumber ||
          initialDoc.rawDoc?.id ||
          initialDoc.rawDoc?.document_number;

        res = await fetch("/api/admin/documents/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentId: docIdToUpdate,
            updates: {
              ...docPayload,
              id: initialDoc.id || initialDoc.rawDoc?.id,
              documentNumber: initialDoc.docNumber || initialDoc.rawDoc?.document_number,
            },
          }),
        });
      } else {
        // CREATE New Document
        res = await fetch("/api/admin/documents/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(docPayload),
        });
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `Failed to ${isEditMode ? "update" : "generate"} official document.`);
      }

      setStatusMessage({
        type: "success",
        text: `Official Document (${letterTitle}) successfully ${isEditMode ? "updated" : "issued"} for ${salutation} ${studentName}! Synchronized to database.`,
      });

      if (onSuccess) {
        onSuccess(data.document);
      }

      setViewMode("PREVIEW");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error saving document";
      setStatusMessage({ type: "error", text: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Direct client-side PDF download without print dialog
  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
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
      });
    } catch (err) {
      console.error("PDF download failed:", err);
    } finally {
      setIsDownloadingPdf(false);
    }
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
      id="akash-official-offer-letter-sheet"
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
          {/* Header with Official Akash Technolabs Banner matching authentic PDF */}
          <div className="pb-3">
            <img
              src={AKASH_HEADER_BASE64}
              alt="Akash Technolabs Official Banner"
              className="w-full object-contain select-none"
            />
          </div>

          {/* Right-aligned Date matching authentic PDF */}
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

          {/* Official Attachment Badge if file attached */}
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

          {/* Sign-Off Block matching authentic PDF */}
          <div className="pt-8 space-y-0.5 text-xs sm:text-sm">
            <p className="text-slate-800 font-medium">Sincerely</p>

            {/* Official CEO Rubber Seal & Signature */}
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

        {/* Footer matching PDF with split bar and contact info */}
        <div className="pt-8 mt-auto">
          <div className="w-full flex h-1 mb-3">
            <div className="w-[28%] bg-[#1e3264]" />
            <div className="w-[72%] bg-[#d32f2f]" />
          </div>

          <div className="text-center space-y-1 text-[10px] sm:text-[11px] text-slate-600">
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 font-medium text-slate-700">
              <span className="inline-flex items-center gap-1">
                <span className="text-[#1e3264]">🌐</span> www.akashtechnolabs.com
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="text-[#d32f2f]">✉</span> info@akashtechnolabs.com
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="text-[#1e3264]">📞</span> +91 99786 21654
              </span>
            </div>
            <p className="text-slate-600 font-medium">
              202, Aarya Arcade, Above Passport Seva Kendra, Mithakhali Six Road, Navrangpura, Ahmedabad-09.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Left Column Controls: Templates, Universities, Students, Tracks
  const renderLeftControls = () => (
    <div className="space-y-5">
      {/* Card 1: Document Template & Category Selection */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0F4C81]" />
                    <span>Select Professional Document Template (8 Official Corporate Standards)</span>
                  </div>
                  <span className="text-[11px] font-mono text-blue-600">
                    {LETTER_TEMPLATES.find((t) => t.key === templateKey)?.category}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
                  {LETTER_TEMPLATES.map((tmpl) => {
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
                              isSelected
                                ? "bg-[#0F4C81] text-white"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {tmpl.shortName}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 leading-snug">
                          {tmpl.label}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Card 2: University & Affiliation Presets (GTU, SOU, GU, Parul, etc.) */}
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

              {/* Card 3: Auto-fill from Registered Student (Create mode only) */}
              {!isEditMode && (
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <UserCheck className="w-4 h-4 text-blue-600" />
                      <span>Auto-fill from Registered Student (Live Supabase &amp; DB)</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Links letter directly to verified student portal profile
                    </span>
                  </div>

                  <div className="relative">
                    <select
                      value={selectedStudentId}
                      onChange={handleStudentSelect}
                      className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Choose a student or fill manually below --</option>
                      {students.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name} ({st.email}) {st.technology ? `• ${st.technology}` : ""} {st.university ? `[${st.university}]` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Card 4: Predefined Track Quick Select */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    Predefined Internship Domain &amp; Track Quick Select
                  </h3>
                  <span className="text-[11px] text-slate-400">Click to auto-populate position &amp; tech</span>
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

  // Right Column Controls: Variables, Custom Content Source (Paste/Attach), WYSIWYG & Dispatch
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

                  {/* Salutation / Gender Selection with Explicit Male & Female Buttons */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Gender &amp; Salutation <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleSalutationChange("Mr.")}
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
                        onClick={() => handleSalutationChange("Ms.")}
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
                      onChange={(e) => handleStudentNameChange(e.target.value)}
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
                      onChange={(e) => setRecipientEmail(e.target.value)}
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
                      onChange={(e) => handlePositionChange(e.target.value)}
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
                    onChange={setCommencementDate}
                    placeholder="Pick date (e.g. 3rd July 2026)"
                    mode="ORDINAL"
                  />

                  {/* Internship End Date */}
                  <DualDateField
                    label="Internship End Date"
                    value={continueUntilDate}
                    onChange={setContinueUntilDate}
                    placeholder="Pick date (e.g. 30th April 2027)"
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

              {/* Card 6: Letter Title, Custom Format Paste, & Rich Description Editor */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Title */}
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

                  {/* Signatory Note */}
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

                {/* DUAL DOCUMENT SOURCE: BOTH OPTIONS PROMINENTLY AVAILABLE */}
                <div id="custom-content-assistant-card" className="p-4 sm:p-5 rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/60 via-white to-blue-50/40 space-y-3.5 shadow-xs transition-all">
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

                    {/* Prominent Dual Switcher */}
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

                  {/* OPTION 1: PASTE DRAFT TEXT */}
                  {contentAssistantTab === "PASTE" && (
                    <div className="space-y-3 pt-1">
                      {/* Optional Mentor Inputs for Mentorship/Guide Assignment letters */}
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

                  {/* OPTION 2: ATTACH FILE / DOCUMENT */}
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
                            onClick={handleRemoveAttachment}
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

                {/* Description Rich Text Editor Box */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">Document Body &amp; Terms (Full Editable Text)</label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomEdited(false);
                        refreshDescriptionFromTemplate();
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
                        onClick={() => setDescription((prev) => prev ? `**${prev}**` : "")}
                        title="Bold text"
                        className="p-1 hover:bg-slate-200 rounded font-bold text-slate-800 text-xs"
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDescription((prev) => prev ? `*${prev}*` : "")}
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

                {/* Company Letterhead Elements note */}
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

              {/* Submit Button */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={`${
                    isEditMode
                      ? "bg-amber-600 hover:bg-amber-700"
                      : "bg-[#0F4C81] hover:bg-[#0C3D68]"
                  } text-white font-bold px-6 py-2.5 rounded-xl shadow-md text-xs cursor-pointer flex items-center gap-1.5`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? "Saving Document..."
                      : isEditMode
                      ? "💾 Save & Update Official Document"
                      : "✔ Issue & Dispatch Official Letter"}
                  </span>
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setViewMode(viewMode === "SPLIT" ? "PREVIEW" : "SPLIT")}
                    className="text-xs font-bold rounded-xl cursor-pointer bg-white"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1 text-blue-600" />
                    {viewMode === "SPLIT" ? "Full Letterhead" : "Split Studio"}
                  </Button>
                </div>
              </div>
    </div>
  );

  const renderEditorForm = (isWideTwoColumn: boolean = false) => (
    <form id="letter-editor-form" onSubmit={handleSubmit} className="w-full">
      {isWideTwoColumn ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6">
            {renderLeftControls()}
          </div>
          <div className="lg:col-span-6">
            {renderRightControls()}
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {renderLeftControls()}
          {renderRightControls()}
        </div>
      )}
    </form>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/85 backdrop-blur-sm p-1 sm:p-2.5 overflow-hidden">
      <div className="relative w-full h-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Top brand line: Cyan, Navy, Red */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#00A8CC] via-[#0F4C81] to-[#E52329] shrink-0" />

        {/* Studio Top Navigation Bar */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-slate-200 bg-slate-50/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0F4C81] to-[#00A8CC] flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                  {isEditMode ? "Edit & Update Official Document" : "Official Document Dispatch & Letter Studio"}
                </h2>
                <span
                  className={`hidden sm:inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    isEditMode
                      ? "bg-amber-100 text-amber-800 border-amber-200"
                      : "bg-blue-100 text-blue-800 border-blue-200"
                  }`}
                >
                  {isEditMode ? `Editing: ${initialDoc.docNumber || initialDoc.id}` : "Akash Technolabs Enterprise"}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
                Full-screen studio with live A4 letterhead sync, university presets &amp; direct PDF dispatch
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
          </div>

          {/* Action buttons on top bar */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              disabled={isDownloadingPdf}
              onClick={handleDownloadPdf}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold text-xs rounded-xl shadow-2xs cursor-pointer flex items-center gap-1.5 px-3 py-1.5"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span className="hidden md:inline">Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-[#0F4C81]" />
                  <span className="hidden md:inline">Download PDF</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              onClick={(e) => {
                const formElem = document.getElementById("letter-editor-form") as HTMLFormElement | null;
                if (formElem) {
                  formElem.requestSubmit();
                } else {
                  handleSubmit(e as unknown as React.FormEvent);
                }
              }}
              disabled={isSubmitting}
              className={`${
                isEditMode ? "bg-amber-600 hover:bg-amber-700" : "bg-[#0F4C81] hover:bg-[#0C3D68]"
              } text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 px-3.5 py-1.5`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {isSubmitting
                  ? "Saving..."
                  : isEditMode
                  ? "Save Changes"
                  : "Issue & Dispatch"}
              </span>
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
            className={`px-6 py-2.5 text-xs font-semibold flex items-center gap-2 border-b shrink-0 ${
              statusMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <X className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
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
                    <span className="text-[10px] font-normal text-slate-500">(Updates live as you type)</span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isDownloadingPdf}
                    onClick={handleDownloadPdf}
                    className="h-7 text-[11px] font-bold bg-white text-slate-700 hover:bg-slate-50"
                  >
                    <Download className="w-3 h-3 mr-1 text-[#0F4C81]" />
                    PDF
                  </Button>
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
              <div className="w-full max-w-[800px] flex items-center justify-between pb-3 text-xs font-bold">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span className="text-slate-800">Official Akash Technolabs Letterhead (Full A4 View)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    disabled={isDownloadingPdf}
                    onClick={handleDownloadPdf}
                    className="bg-[#0F4C81] hover:bg-[#0C3D68] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    {isDownloadingPdf ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Official PDF</span>
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setViewMode("SPLIT")}
                    className="text-xs font-bold rounded-xl cursor-pointer bg-white"
                  >
                    Split View
                  </Button>
                </div>
              </div>
              {renderLetterheadSheet(false)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
