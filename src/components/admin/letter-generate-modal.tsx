"use client";

import React, { useState, useEffect } from "react";
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
  Printer,
  Download,
  Lock,
  Eye,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OfficialAkashStamp } from "@/components/documents/document-studio-modal";

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

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top cyan/blue line matching Image 2 */}
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
              {/* Card 1: Auto-fill from Registered Student (Image 3) */}
              <div className="bg-slate-50/80 rounded-2xl border border-slate-200/90 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <span>Auto-fill from Registered Student (Optional)</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Links letter to student portal profile
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

              {/* Card 2: Predefined Dynamic Letter Fields (Image 3) */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#E52329]" />
                    Predefined Dynamic Letter Fields
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">Official Letterhead Variables</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Letter Date */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Letter Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={letterDate}
                        onChange={(e) => setLetterDate(e.target.value)}
                        placeholder="DD-MM-YYYY (e.g. 30-10-2026)"
                        required
                        className="w-full text-xs font-semibold text-slate-900 border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                      <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

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
                      placeholder="e.g. AI/ML Intern"
                      required
                      className="w-full text-xs font-semibold text-slate-900 border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Internship Start Date */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Internship Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={commencementDate}
                      onChange={(e) => setCommencementDate(e.target.value)}
                      placeholder="e.g. 3rd August 2026"
                      required
                      className="w-full text-xs font-semibold text-slate-900 border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Internship End Date */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Internship End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={continueUntilDate}
                      onChange={(e) => setContinueUntilDate(e.target.value)}
                      placeholder="e.g. 30th April 2027"
                      required
                      className="w-full text-xs font-semibold text-slate-900 border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Technology */}
                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Technology <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={technology}
                      onChange={(e) => setTechnology(e.target.value)}
                      placeholder="e.g. AI/ML or Full Stack"
                      required
                      className="w-full text-xs font-semibold text-slate-900 border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Card 3: Letter Template, Date, Title & Rich Description (Image 2) */}
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

                  {/* Date * */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={letterDate}
                      onChange={(e) => setLetterDate(e.target.value)}
                      required
                      className="w-full text-xs font-semibold text-slate-900 border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

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

                {/* Description Rich Text Editor Box (Image 2) */}
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
                    {/* Simulated WYSIWYG Toolbar matching Image 2 */}
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

                {/* Company Letterhead Elements note (Image 3) */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[11px] font-semibold">
                      Company Letterhead Elements locked: Official Banner, Center Watermark, Aligned Right Date, Digital Signature &amp; Registered Stamp, Corporate Address &amp; Contact Footer.
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                    Akash Technolabs Authentic
                  </span>
                </div>
              </div>

              {/* Submit Button matching Image 2 */}
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
                    Official Akash Technolabs Letterhead (Print-Ready A4 Ratio)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handlePrint}
                    className="bg-[#0F4C81] hover:bg-[#0C3D68] text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5 mr-1" />
                    Print / Save PDF
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
                className="relative bg-white mx-auto max-w-[800px] p-8 sm:p-14 shadow-lg border border-slate-300 rounded-sm text-slate-900 select-text"
                style={{ minHeight: "1050px" }}
              >
                {/* Center Dual-Tone Translucent Watermark matching PDF */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
                  <img
                    src="/images/akash-at-watermark-hd.png"
                    alt="Akash Technolabs Official Watermark"
                    className="w-[340px] max-w-[85%] object-contain opacity-[0.08] select-none"
                  />
                </div>

                <div className="relative z-10 flex flex-col justify-between" style={{ minHeight: "960px" }}>
                  <div>
                    {/* Header with Logo and Two-Tone Bar matching PDF */}
                    <div className="pb-4">
                      <div className="flex items-center justify-between pb-2">
                        <img
                          src="/images/akash-technolabs-header-logo.png"
                          alt="Akash Technolabs"
                          className="h-12 sm:h-14 w-auto object-contain"
                        />
                      </div>
                      {/* Split Two-Color Bar matching PDF: Navy blue left ~28%, Red right ~72% */}
                      <div className="w-full flex h-[3.5px]">
                        <div className="w-[28%] bg-[#1e3264]" />
                        <div className="w-[72%] bg-[#d32f2f]" />
                      </div>
                    </div>

                    {/* Right-aligned Date matching PDF */}
                    <div className="text-right text-xs sm:text-sm font-medium text-slate-900 pr-1 pt-1 pb-4">
                      <span>Date :{letterDate}</span>
                    </div>

                    {/* Centered Bold Underlined Title */}
                    <div className="text-center pt-2 pb-6">
                      <h1 className="text-lg sm:text-xl font-bold tracking-wider text-slate-900 uppercase underline underline-offset-4 decoration-slate-900 decoration-1">
                        {letterTitle}
                      </h1>
                    </div>

                    {/* 4 Paragraphs of Body Text */}
                    <div className="space-y-4 text-xs sm:text-[13px] leading-relaxed text-slate-800 font-normal text-justify">
                      {description.split("\n\n").map((para, idx) => (
                        <p key={idx}>{para}</p>
                      ))}
                    </div>

                    {/* Sign-Off Block (Bottom Left) */}
                    <div className="pt-8 space-y-1 text-xs sm:text-sm">
                      <p className="text-slate-800 font-medium">Sincerely</p>

                      {/* Official Akash Technolabs Seal & Signature */}
                      <div className="py-1">
                        <OfficialAkashStamp />
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
