import * as XLSX from "xlsx";
import JSZip from "jszip";
import {
  generateAkashOfferLetterPdf,
  isFemaleCandidate,
  deriveTrackTechnology,
  OfferLetterData,
} from "./akash-pdf-generator";
import {
  LETTER_TEMPLATES,
  LetterTemplateKey,
  generateLetterContent,
} from "./letter-templates";

export interface CandidateLetterRow {
  id: string;
  studentName: string;
  salutation: "Mr." | "Ms.";
  recipientEmail?: string;
  internshipPosition: string;
  technology: string;
  commencementDate: string;
  continueUntilDate: string;
  college?: string;
  university?: string;
  stipend?: string;
  documentNumber?: string;
}

export interface BulkGenerationOptions {
  templateKey: LetterTemplateKey | string;
  letterDate: string;
  customDescriptionTemplate?: string;
  title?: string;
  signatoryName?: string;
  signatoryRole?: string;
  universityId?: string;
  saveToRegistry?: boolean;
}

/**
 * Normalizes keys and values extracted from raw Excel/CSV rows.
 */
function findRowValue(row: Record<string, any>, possibleKeys: string[]): string {
  const rowKeys = Object.keys(row);
  // Pass 1: Exact stripped match
  for (const target of possibleKeys) {
    const cleanTarget = target.toLowerCase().replace(/[^a-z0-9]/g, "");
    const matchedKey = rowKeys.find(
      (k) => k.toLowerCase().trim().replace(/[^a-z0-9]/g, "") === cleanTarget
    );
    if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null) {
      const val = String(row[matchedKey]).trim();
      if (val) return val;
    }
  }
  // Pass 2: Substring / contains match (handles e.g. "Technology / Track")
  for (const target of possibleKeys) {
    const cleanTarget = target.toLowerCase().replace(/[^a-z0-9]/g, "");
    const matchedKey = rowKeys.find((k) => {
      const cleanKey = k.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
      return cleanKey.includes(cleanTarget) || cleanTarget.includes(cleanKey);
    });
    if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null) {
      const val = String(row[matchedKey]).trim();
      if (val) return val;
    }
  }
  return "";
}

/**
 * Formats Excel serial numbers or standard date strings into clean readable dates.
 */
function formatSpreadsheetDate(raw: any, fallback: string): string {
  if (!raw) return fallback;
  if (typeof raw === "number") {
    // Excel date serial
    try {
      const dateObj = XLSX.SSF.parse_date_code(raw);
      if (dateObj) {
        const d = String(dateObj.d).padStart(2, "0");
        const m = String(dateObj.m).padStart(2, "0");
        const y = dateObj.y;
        return `${d}-${m}-${y}`;
      }
    } catch {}
  }
  const str = String(raw).trim();
  if (!str) return fallback;

  // If already formatted like "3rd July 2026" or "15-11-2026"
  if (/^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}$/.test(str)) {
    return str.replace(/\//g, "-").replace(/\./g, "-");
  }

  // Parse Date string
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const day = String(parsed.getDate()).padStart(2, "0");
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const year = parsed.getFullYear();
    return `${day}-${month}-${year}`;
  }

  return str;
}

/**
 * Parses an uploaded Excel (.xlsx, .xls) or CSV file into clean CandidateLetterRow records.
 */
export function parseCandidateSpreadsheet(data: ArrayBuffer | Uint8Array): CandidateLetterRow[] {
  const workbook = XLSX.read(data, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error("Spreadsheet contains no sheets.");
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

  if (rawRows.length === 0) {
    throw new Error("No data rows found in the uploaded spreadsheet.");
  }

  const parsedCandidates: CandidateLetterRow[] = [];

  rawRows.forEach((row, idx) => {
    const rawName = findRowValue(row, [
      "studentname",
      "candidatename",
      "fullname",
      "name",
      "student",
      "candidate",
    ]);

    if (!rawName) return; // Skip empty rows

    const cleanName = rawName.replace(/^(Mr\.|Ms\.|Mrs\.|Miss)\s*/i, "").trim();
    const explicitSalutation = findRowValue(row, ["salutation", "title", "prefix", "gender"]);
    const isGirl = isFemaleCandidate(rawName, explicitSalutation);
    const salutation: "Mr." | "Ms." =
      explicitSalutation.toLowerCase().includes("ms") || explicitSalutation.toLowerCase().includes("female") || isGirl
        ? "Ms."
        : "Mr.";

    const email = findRowValue(row, ["email", "studentemail", "recipientemail", "emailaddress", "mail"]);
    const position =
      findRowValue(row, ["internshipposition", "position", "role", "internrole", "jobtitle"]) || "Software Engineering Intern";
    const technology =
      findRowValue(row, ["technology", "track", "tech", "specialization", "domain"]) ||
      deriveTrackTechnology(position);

    const commencementDate = formatSpreadsheetDate(
      findRowValue(row, ["commencementdate", "startdate", "joiningdate", "commencement", "start", "from"]),
      "1st June 2026"
    );

    const continueUntilDate = formatSpreadsheetDate(
      findRowValue(row, ["continueuntildate", "enddate", "completiondate", "continueuntil", "end", "to"]),
      "30th November 2026"
    );

    const college = findRowValue(row, ["college", "university", "institute", "collegename", "institution"]);
    const stipend = findRowValue(row, ["stipend", "salary", "compensation"]);
    const documentNumber = findRowValue(row, ["documentnumber", "docnumber", "id", "refno"]);

    parsedCandidates.push({
      id: `cand_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      studentName: cleanName,
      salutation,
      recipientEmail: email || undefined,
      internshipPosition: position,
      technology,
      commencementDate,
      continueUntilDate,
      college: college || undefined,
      university: college || undefined,
      stipend: stipend || undefined,
      documentNumber: documentNumber || undefined,
    });
  });

  if (parsedCandidates.length === 0) {
    throw new Error(
      "No valid candidate rows could be extracted. Please ensure column headers include 'Name' or 'Student Name'."
    );
  }

  return parsedCandidates;
}

/**
 * Creates and triggers download of a standardized pre-filled Excel template.
 */
export function generateSampleCandidateSpreadsheet(): Uint8Array {
  const sampleData = [
    {
      "Candidate Name": "Fenil Patel",
      Salutation: "Mr.",
      Email: "fenil.patel@akashtechnolabs.com",
      "Technology / Track": "AI & Machine Learning",
      "Internship Position": "AI & Machine Learning Engineering Intern",
      "Commencement Date": "01-06-2026",
      "Continue Until Date": "30-11-2026",
      "College / University": "Gujarat Technological University (GTU)",
      Stipend: "Performance-Based",
    },
    {
      "Candidate Name": "Priya Sharma",
      Salutation: "Ms.",
      Email: "priya.sharma@akashtechnolabs.com",
      "Technology / Track": "Full Stack Web Development",
      "Internship Position": "Full Stack Developer Intern",
      "Commencement Date": "01-06-2026",
      "Continue Until Date": "30-11-2026",
      "College / University": "Silver Oak University",
      Stipend: "Performance-Based",
    },
    {
      "Candidate Name": "Aarav Mehta",
      Salutation: "Mr.",
      Email: "aarav.mehta@example.com",
      "Technology / Track": "Python & Cloud DevOps",
      "Internship Position": "Cloud & DevOps Intern",
      "Commencement Date": "15-06-2026",
      "Continue Until Date": "15-12-2026",
      "College / University": "Nirma University",
      Stipend: "Performance-Based",
    },
    {
      "Candidate Name": "Ananya Joshi",
      Salutation: "Ms.",
      Email: "ananya.joshi@example.com",
      "Technology / Track": "UI/UX Design Systems",
      "Internship Position": "UI/UX Design Intern",
      "Commencement Date": "01-07-2026",
      "Continue Until Date": "31-12-2026",
      "College / University": "Ahmedabad University",
      Stipend: "Performance-Based",
    },
    {
      "Candidate Name": "Rohan Verma",
      Salutation: "Mr.",
      Email: "rohan.verma@example.com",
      "Technology / Track": "Cybersecurity & Ethical Hacking",
      "Internship Position": "Cybersecurity Intern",
      "Commencement Date": "01-06-2026",
      "Continue Until Date": "30-11-2026",
      "College / University": "Marwadi University",
      Stipend: "Performance-Based",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);

  // Set nice column widths
  worksheet["!cols"] = [
    { wch: 20 }, // Candidate Name
    { wch: 12 }, // Salutation
    { wch: 32 }, // Email
    { wch: 28 }, // Technology / Track
    { wch: 36 }, // Internship Position
    { wch: 18 }, // Commencement Date
    { wch: 18 }, // Continue Until Date
    { wch: 36 }, // College / University
    { wch: 20 }, // Stipend
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Candidates Roster");

  const rawOut = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
  return new Uint8Array(rawOut);
}

/**
 * Interpolates custom template placeholders with candidate specific fields.
 */
export function interpolateCustomTemplate(
  templateText: string,
  candidate: CandidateLetterRow,
  options: BulkGenerationOptions
): string {
  if (!templateText) return "";

  return templateText
    .replace(/\{\{student_name\}\}/gi, `${candidate.salutation} ${candidate.studentName}`)
    .replace(/\{\{name\}\}/gi, candidate.studentName)
    .replace(/\{\{salutation\}\}/gi, candidate.salutation)
    .replace(/\{\{position\}\}/gi, candidate.internshipPosition)
    .replace(/\{\{technology\}\}/gi, candidate.technology)
    .replace(/\{\{commencement_date\}\}/gi, candidate.commencementDate)
    .replace(/\{\{start_date\}\}/gi, candidate.commencementDate)
    .replace(/\{\{continue_until_date\}\}/gi, candidate.continueUntilDate)
    .replace(/\{\{end_date\}\}/gi, candidate.continueUntilDate)
    .replace(/\{\{college\}\}/gi, candidate.college || candidate.university || "University")
    .replace(/\{\{university\}\}/gi, candidate.university || candidate.college || "University")
    .replace(/\{\{date\}\}/gi, options.letterDate)
    .replace(/\{\{signatory_name\}\}/gi, options.signatoryName || "Akash Padhiyar")
    .replace(/\{\{signatory_role\}\}/gi, options.signatoryRole || "CEO")
    .replace(/\{\{document_number\}\}/gi, candidate.documentNumber || "PENDING");
}

export interface BulkGenerationProgress {
  current: number;
  total: number;
  candidateName: string;
  status: "GENERATING" | "PACKAGING" | "DONE" | "ERROR";
  error?: string;
}

export interface BulkGenerationResult {
  zipBlob: Blob;
  zipFilename: string;
  totalGenerated: number;
  results: Array<{
    candidate: CandidateLetterRow;
    pdfBytes: Uint8Array;
    filename: string;
  }>;
}

/**
 * Generates official PDFs for all candidates and packages them into a ZIP archive.
 */
export async function generateBulkLettersZip(
  candidates: CandidateLetterRow[],
  options: BulkGenerationOptions,
  onProgress?: (progress: BulkGenerationProgress) => void
): Promise<BulkGenerationResult> {
  const zip = new JSZip();
  const total = candidates.length;
  const results: BulkGenerationResult["results"] = [];

  const templateDef = LETTER_TEMPLATES.find((t) => t.key === options.templateKey);
  const letterTitle = options.title || templateDef?.defaultTitle || "INTERNSHIP OFFER LETTER";

  for (let i = 0; i < total; i++) {
    const candidate = candidates[i];

    if (onProgress) {
      onProgress({
        current: i + 1,
        total,
        candidateName: candidate.studentName,
        status: "GENERATING",
      });
    }

    // Determine description content: custom template or standard letter template
    let customDescription: string | undefined = undefined;
    let isCustomEdited = false;

    if (options.customDescriptionTemplate && options.customDescriptionTemplate.trim()) {
      customDescription = interpolateCustomTemplate(
        options.customDescriptionTemplate,
        candidate,
        options
      );
      isCustomEdited = true;
    }

    const offerData: OfferLetterData = {
      salutation: candidate.salutation,
      studentName: candidate.studentName,
      internshipPosition: candidate.internshipPosition,
      technology: candidate.technology,
      commencementDate: candidate.commencementDate,
      continueUntilDate: candidate.continueUntilDate,
      letterDate: options.letterDate,
      title: letterTitle,
      customDescription,
      isCustomEdited,
      templateType: options.templateKey,
      customUniversity: candidate.college || candidate.university,
      signatoryName: options.signatoryName || "Akash Padhiyar",
      signatoryRole: options.signatoryRole || "CEO",
    };

    // Generate crisp vector PDF
    const pdfBytes = await generateAkashOfferLetterPdf(offerData);

    const safeName = candidate.studentName.replace(/[^a-zA-Z0-9]/g, "_");
    const safeDocNum = (candidate.documentNumber || `CAND${i + 1}`).replace(/[^a-zA-Z0-9_-]/g, "_");
    const safeTitle = letterTitle.replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `${safeDocNum}_${safeName}_${safeTitle}.pdf`;

    // Add to ZIP
    zip.file(filename, pdfBytes);

    results.push({
      candidate,
      pdfBytes,
      filename,
    });
  }

  if (onProgress) {
    onProgress({
      current: total,
      total,
      candidateName: "Compressing & Finalizing ZIP...",
      status: "PACKAGING",
    });
  }

  const zipBlob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  const cleanDate = options.letterDate.replace(/[^a-zA-Z0-9_-]/g, "-");
  const zipFilename = `Akash_Letters_Batch_${cleanDate}_${total}_Letters.zip`;

  if (onProgress) {
    onProgress({
      current: total,
      total,
      candidateName: "Complete",
      status: "DONE",
    });
  }

  return {
    zipBlob,
    zipFilename,
    totalGenerated: total,
    results,
  };
}
