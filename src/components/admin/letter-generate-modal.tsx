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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadAkashOfferLetterPdf } from "@/lib/documents/akash-pdf-generator";
import {
  AKASH_HEADER_BASE64,
  AKASH_FOOTER_BASE64,
  AKASH_WATERMARK_BASE64,
  AKASH_SIGNATURE_BASE64,
  AKASH_STAMP_BASE64,
} from "@/lib/documents/akash-letterhead-assets";

interface StudentOption {
  id: string;
  name: string;
  email: string;
  college?: string;
  technology?: string;
}

interface LetterGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (createdDoc: any) => void;
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

export function LetterGenerateModal({
  isOpen,
  onClose,
  onSuccess,
}: LetterGenerateModalProps) {
  const [templateType, setTemplateType] = useState<
    "INTERNSHIP OFFER LETTER (Boy)" | "INTERNSHIP OFFER LETTER (Girl)" | "RECOMMENDATION LETTER"
  >("INTERNSHIP OFFER LETTER (Boy)");
  const [letterDate, setLetterDate] = useState("30-10-2026");
  const [letterTitle, setLetterTitle] = useState("INTERNSHIP OFFER LETTER");

  // Dynamic Fields
  const [salutation, setSalutation] = useState<"Mr." | "Ms.">("Mr.");
  const [studentName, setStudentName] = useState("Fenil Patel");
  const [recipientEmail, setRecipientEmail] = useState("huntarmy001@gmail.com");
  const [internshipPosition, setInternshipPosition] = useState("AI/ML Intern");
  const [commencementDate, setCommencementDate] = useState("3rd August 2026");
  const [continueUntilDate, setContinueUntilDate] = useState("30th April 2027");
  const [technology, setTechnology] = useState("AI/ML");

  // Registered students list for auto-fill
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  // Description / Body text
  const [description, setDescription] = useState("");
  const [isCustomEdited, setIsCustomEdited] = useState(false);

  // View mode: Form or Full Official Preview
  const [viewMode, setViewMode] = useState<"FORM" | "PREVIEW">("FORM");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Generate body text from dynamic fields
  const generateBodyText = (
    sal: "Mr." | "Ms.",
    name: string,
    pos: string,
    tech: string,
    start: string,
    end: string,
    isGirl: boolean
  ) => {
    const pronounHeShe = isGirl ? "she" : "he";
    const pronounHisHer = isGirl ? "her" : "his";
    const pronounCapitalHisHer = isGirl ? "Her" : "His";
    const pronounCapitalHeShe = isGirl ? "She" : "He";
    const pronounHimHer = isGirl ? "her" : "him";

    return `This is to inform that ${sal} ${name} has been selected for an internship at Akash Technolabs as a ${pos}. ${pronounCapitalHisHer} internship will commence on ${start} and continue until ${end}.

During the internship period, ${pronounHeShe} will work on ${tech} technology and will be involved in projects and assignments designed to enhance ${pronounHisHer} technical knowledge and practical skills. ${pronounCapitalHeShe} is expected to maintain a professional attitude, follow the company's policies and guidelines, and perform ${pronounHisHer} assigned responsibilities with sincerity and dedication throughout the internship.

Upon successful completion of the internship, ${pronounHeShe} will be awarded an Internship Completion Certificate based on ${pronounHisHer} performance and adherence to the company's rules and regulations.

We are pleased to welcome ${pronounHimHer} to Akash Technolabs and wish ${pronounHimHer} a successful and enriching internship experience.`;
  };

  // Keep description synchronized unless manually modified
  useEffect(() => {
    if (!isCustomEdited) {
      const isGirl = templateType === "INTERNSHIP OFFER LETTER (Girl)" || salutation === "Ms.";
      const text = generateBodyText(
        salutation,
        studentName,
        internshipPosition,
        technology,
        commencementDate,
        continueUntilDate,
        isGirl
      );
      setDescription(text);
    }
  }, [
    templateType,
    salutation,
    studentName,
    internshipPosition,
    technology,
    commencementDate,
    continueUntilDate,
    isCustomEdited,
  ]);

  // Load students for dropdown
  useEffect(() => {
    fetch("/api/admin/students")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (Array.isArray(data.students)) {
          setStudents(data.students);
        }
      })
      .catch(() => {
        setStudents([
          { id: "usr-1793251075106-352", name: "Fenil Patel", email: "huntarmy001@gmail.com", technology: "AI/ML" },
          { id: "usr-student-fenil", name: "Fenil Patel", email: "fenil.patel@akashtechnolabs.com", technology: "AI/ML" },
          { id: "usr-student-priya", name: "Priya Sharma", email: "priya.sharma@akashtechnolabs.com", technology: "Full Stack Web Development" },
          { id: "usr-student-harshit", name: "Harshit Mehta", email: "harshit.mehta@akashtechnolabs.com", technology: "Cloud & DevOps" },
          { id: "usr-1793106423924-750", name: "Akshat Nayak", email: "akshatnayak0910@gmail.com", technology: "Cybersecurity" },
        ]);
      });
  }, []);

  const handleStudentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedStudentId(val);
    const found = students.find((s) => s.id === val || s.email === val);
    if (found) {
      setStudentName(found.name);
      setRecipientEmail(found.email);
      const isFemale =
        found.name.toLowerCase().includes("priya") ||
        found.name.toLowerCase().includes("neha") ||
        found.name.toLowerCase().includes("pooja");
      const sal = isFemale ? "Ms." : "Mr.";
      setSalutation(sal);
      if (isFemale) {
        setTemplateType("INTERNSHIP OFFER LETTER (Girl)");
      } else {
        setTemplateType("INTERNSHIP OFFER LETTER (Boy)");
      }

      if (found.technology) {
        setTechnology(found.technology);
        setInternshipPosition(`${found.technology} Intern`);
      }
      setIsCustomEdited(false);
    }
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as any;
    setTemplateType(val);
    if (val === "INTERNSHIP OFFER LETTER (Girl)") {
      setSalutation("Ms.");
    } else if (val === "INTERNSHIP OFFER LETTER (Boy)") {
      setSalutation("Mr.");
    }
    setIsCustomEdited(false);
  };

  const handleTrackSelect = (trk: PredefinedTrack) => {
    setInternshipPosition(trk.position);
    setTechnology(trk.technology);
    setIsCustomEdited(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/documents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateType,
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
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate offer letter.");
      }

      setStatusMessage({
        type: "success",
        text: `Official Offer Letter successfully issued for ${salutation} ${studentName}! Available in Student Portal.`,
      });

      if (onSuccess) {
        onSuccess(data.document);
      }

      // Switch to preview of the generated document
      setViewMode("PREVIEW");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error generating letter";
      setStatusMessage({ type: "error", text: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Direct client-side PDF download without print dialog matching authentic PDF
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
      });
    } catch (err) {
      console.error("PDF download failed:", err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const isGirl = templateType === "INTERNSHIP OFFER LETTER (Girl)" || salutation === "Ms.";
  const pronounHeShe = isGirl ? "she" : "he";
  const pronounHisHer = isGirl ? "her" : "his";
  const pronounCapitalHisHer = isGirl ? "Her" : "His";
  const pronounCapitalHeShe = isGirl ? "She" : "He";
  const pronounHimHer = isGirl ? "her" : "him";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top brand line: Cyan, Navy, Red */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#00A8CC] via-[#0F4C81] to-[#E52329]" />

        {/* Header Bar */}
        <div className="px-6 py-3.5 border-b border-slate-200/90 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              Letter Generate
            </h2>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              Akash Technolabs Admin Dispatch
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode(viewMode === "FORM" ? "PREVIEW" : "FORM")}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              {viewMode === "FORM" ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>View Official Letterhead</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  <span>Back to Edit Form</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback message banner */}
        {statusMessage && (
          <div
            className={`px-6 py-2.5 text-xs font-semibold flex items-center gap-2 border-b ${
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

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {viewMode === "FORM" ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Card 1: Auto-fill from Registered Student */}
              <div className="bg-slate-50/80 rounded-2xl border border-slate-200/90 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <span>Auto-fill from Registered Student (Optional)</span>
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
                        {st.name} ({st.email}) {st.technology ? `• ${st.technology}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Card 2: Predefined Track Quick Select (AI/ML, Cybersecurity, Python, Full Stack...) */}
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

              {/* Card 3: Predefined Dynamic Letter Fields */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#E52329]" />
                    Predefined Dynamic Letter Fields
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">Official Letterhead Variables</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Letter Date with both typing and calendar picker */}
                  <DualDateField
                    label="Letter Date"
                    value={letterDate}
                    onChange={setLetterDate}
                    placeholder="DD-MM-YYYY (e.g. 30-10-2026)"
                    mode="DD-MM-YYYY"
                  />

                  {/* Salutation */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Salutation <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={salutation}
                      onChange={(e) => setSalutation(e.target.value as "Mr." | "Ms.")}
                      className="w-full text-xs font-semibold text-slate-900 border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Ms.">Ms.</option>
                    </select>
                  </div>

                  {/* Student Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Student Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="e.g. Fenil Patel"
                      required
                      className="w-full text-xs font-semibold text-slate-900 border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Internship Position */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Internship Position <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={internshipPosition}
                      onChange={(e) => setInternshipPosition(e.target.value)}
                      placeholder="e.g. AI/ML Intern or Cybersecurity Intern"
                      required
                      className="w-full text-xs font-semibold text-slate-900 border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Internship Start Date with both typing and calendar picker */}
                  <DualDateField
                    label="Internship Start Date"
                    value={commencementDate}
                    onChange={setCommencementDate}
                    placeholder="e.g. 3rd August 2026"
                    mode="ORDINAL"
                  />

                  {/* Internship End Date with both typing and calendar picker */}
                  <DualDateField
                    label="Internship End Date"
                    value={continueUntilDate}
                    onChange={setContinueUntilDate}
                    placeholder="e.g. 30th April 2027"
                    mode="ORDINAL"
                  />

                  {/* Technology */}
                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Technology <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={technology}
                      onChange={(e) => setTechnology(e.target.value)}
                      placeholder="e.g. AI/ML, Cybersecurity, Python..."
                      required
                      className="w-full text-xs font-semibold text-slate-900 border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Card 4: Letter Template, Date, Title & Rich Description */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Letter Template */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Letter Template
                    </label>
                    <select
                      value={templateType}
                      onChange={handleTemplateChange}
                      className="w-full text-xs font-semibold text-slate-900 border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="INTERNSHIP OFFER LETTER (Boy)">INTERNSHIP OFFER LETTER (Boy)</option>
                      <option value="INTERNSHIP OFFER LETTER (Girl)">INTERNSHIP OFFER LETTER (Girl)</option>
                      <option value="RECOMMENDATION LETTER">RECOMMENDATION LETTER</option>
                    </select>
                  </div>

                  {/* Date * with both typing and calendar picker */}
                  <DualDateField
                    label="Date"
                    value={letterDate}
                    onChange={setLetterDate}
                    placeholder="DD-MM-YYYY (e.g. 30-10-2026)"
                    mode="DD-MM-YYYY"
                  />

                  {/* Title * */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={letterTitle}
                      onChange={(e) => setLetterTitle(e.target.value)}
                      required
                      className="w-full text-xs font-semibold text-slate-900 border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Description Rich Text Editor Box */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">Description</label>
                    <button
                      type="button"
                      onClick={() => setIsCustomEdited(false)}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      Reset to Official Template
                    </button>
                  </div>

                  <div className="border border-slate-300 rounded-xl overflow-hidden shadow-2xs">
                    {/* Simulated WYSIWYG Toolbar */}
                    <div className="bg-slate-100/90 px-3 py-1.5 border-b border-slate-200 flex flex-wrap items-center gap-1 text-slate-600">
                      <button type="button" className="p-1 hover:bg-slate-200 rounded text-slate-700"><Sparkles className="w-3.5 h-3.5" /></button>
                      <span className="w-px h-4 bg-slate-300 mx-1" />
                      <button type="button" className="p-1 hover:bg-slate-200 rounded font-bold text-slate-800 text-xs"><Bold className="w-3.5 h-3.5" /></button>
                      <button type="button" className="p-1 hover:bg-slate-200 rounded italic text-slate-800 text-xs"><Italic className="w-3.5 h-3.5" /></button>
                      <button type="button" className="p-1 hover:bg-slate-200 rounded underline text-slate-800 text-xs"><UnderlineIcon className="w-3.5 h-3.5" /></button>
                      <button type="button" className="p-1 hover:bg-slate-200 rounded text-amber-600"><Highlighter className="w-3.5 h-3.5" /></button>
                      <span className="w-px h-4 bg-slate-300 mx-1" />
                      <button type="button" className="p-1 hover:bg-slate-200 rounded"><List className="w-3.5 h-3.5" /></button>
                      <button type="button" className="p-1 hover:bg-slate-200 rounded"><ListOrdered className="w-3.5 h-3.5" /></button>
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
                      rows={9}
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        setIsCustomEdited(true);
                      }}
                      className="w-full p-4 text-xs sm:text-sm font-sans text-slate-800 bg-white leading-relaxed focus:outline-hidden"
                      placeholder="Type or format your offer letter body..."
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
                  className="bg-[#0F4C81] hover:bg-[#0C3D68] text-white font-bold px-6 py-2.5 rounded-xl shadow-md text-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? "Generating..." : "✔ Submit"}</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setViewMode("PREVIEW")}
                  className="text-xs font-bold rounded-xl"
                >
                  <Eye className="w-3.5 h-3.5 mr-1 text-blue-600" />
                  Preview Letterhead
                </Button>
              </div>
            </form>
          ) : (
            /* OFFICIAL A4 LETTERHEAD PREVIEW MATCHING USER'S ATTACHED PDF EXACTLY */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 print:hidden">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800">
                    Official Akash Technolabs Letterhead (Authentic A4 Format)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Direct PDF Download without print dialog */}
                  <Button
                    size="sm"
                    disabled={isDownloadingPdf}
                    onClick={handleDownloadPdf}
                    className="bg-[#0F4C81] hover:bg-[#0C3D68] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    {isDownloadingPdf ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Downloading PDF...</span>
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
                    onClick={() => setViewMode("FORM")}
                    className="text-xs font-bold rounded-xl"
                  >
                    Edit Information
                  </Button>
                </div>
              </div>

              {/* The Official Letter Paper Sheet */}
              <div
                id="akash-official-offer-letter-sheet"
                className="relative bg-white mx-auto max-w-[800px] p-8 sm:p-14 shadow-lg border border-slate-200 rounded-sm text-slate-900 select-text overflow-hidden"
                style={{ minHeight: "1050px" }}
              >
                {/* Center Dual-Tone Translucent Watermark matching authentic PDF */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
                  <img
                    src={AKASH_WATERMARK_BASE64}
                    alt="Akash Technolabs Official Watermark"
                    className="w-[300px] max-w-[85%] object-contain select-none pointer-events-none"
                    style={{ opacity: 0.12 }}
                  />
                </div>

                <div className="relative z-10 flex flex-col justify-between" style={{ minHeight: "960px" }}>
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
                      <h1 className="text-lg sm:text-xl font-bold tracking-wider text-slate-900 uppercase underline underline-offset-4 decoration-slate-900 decoration-1">
                        {letterTitle}
                      </h1>
                    </div>

                    {/* 4 Paragraphs of Body Text with exact highlighted bold keywords matching PDF */}
                    <div className="space-y-4 text-xs sm:text-[13px] leading-relaxed text-slate-800 font-normal text-justify">
                      {isCustomEdited ? (
                        description.split("\n\n").map((para, idx) => (
                          <p key={idx}>{para}</p>
                        ))
                      ) : (
                        <>
                          {/* Paragraph 1 */}
                          <p>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;This is to inform that{" "}
                            <strong>
                              {salutation} {studentName}
                            </strong>{" "}
                            has been selected for an internship at{" "}
                            <strong>Akash Technolabs</strong> as a{" "}
                            <strong>{internshipPosition}</strong>. {pronounCapitalHisHer}{" "}
                            internship will commence on <strong>{commencementDate}</strong>{" "}
                            and continue until <strong>{continueUntilDate}</strong>.
                          </p>

                          {/* Paragraph 2 with technology highlighted in bold */}
                          <p>
                            During the internship period, {pronounHeShe} will work on{" "}
                            <strong>{technology.replace(/\s*technology/i, "").trim()}</strong> technology and will be involved in projects and
                            assignments designed to enhance {pronounHisHer} technical
                            knowledge and practical skills. {pronounCapitalHeShe} is
                            expected to maintain a professional attitude, follow the
                            company&apos;s policies and guidelines, and perform{" "}
                            {pronounHisHer} assigned responsibilities with sincerity and
                            dedication throughout the internship.
                          </p>

                          {/* Paragraph 3 */}
                          <p>
                            Upon successful completion of the internship, {pronounHeShe}{" "}
                            will be awarded an{" "}
                            <strong>Internship Completion Certificate</strong> based on{" "}
                            {pronounHisHer} performance and adherence to the company&apos;s
                            rules and regulations.
                          </p>

                          {/* Paragraph 4 */}
                          <p>
                            We are pleased to welcome {pronounHimHer} to Akash Technolabs
                            and wish {pronounHimHer} a successful and enriching internship
                            experience.
                          </p>
                        </>
                      )}
                    </div>

                    {/* Sign-Off Block (Bottom Left) matching authentic PDF */}
                    <div className="pt-8 space-y-0.5 text-xs sm:text-sm">
                      <p className="text-slate-800 font-medium">Sincerely</p>

                      {/* Official CEO Rubber Seal & Signature matching authentic Fenil Offer Letter */}
                      <div className="py-1">
                        <img
                          src={AKASH_STAMP_BASE64}
                          alt="Akash Padhiyar CEO Signature & Stamp"
                          className="h-16 w-auto object-contain select-none"
                        />
                      </div>

                      <p className="font-bold text-slate-900 text-sm">Akash Padhiyar</p>
                      <p className="font-medium text-slate-700 text-xs">CEO</p>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
