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
 * Normalizes header keys by lowercasing and removing non-alphanumeric characters.
 */
function cleanHeaderKey(key: any): string {
  return String(key || "").toLowerCase().trim().replace(/[^a-z0-9]/g, "");
}

/**
 * Checks if a string is simply a meta-label or table header title rather than actual candidate data.
 */
function isHeaderOrMetaLabel(val: string): boolean {
  const v = cleanHeaderKey(val);
  const metaLabels = [
    "name", "studentname", "candidatename", "internname", "fullname",
    "firstname", "lastname", "srno", "sr", "sno", "serialno",
    "email", "phone", "contact", "mobile", "role", "position",
    "technology", "track", "college", "university", "total", "count",
    "students", "candidates", "interns"
  ];
  return metaLabels.includes(v);
}

const NAME_EXCLUSIONS = [
  "college", "university", "institute", "institution", "company", "org",
  "organization", "father", "mother", "parent", "guardian", "file",
  "sheet", "domain", "track", "role", "position", "project", "guide", "mentor",
  "first", "last", "fname", "lname", "surname"
];

const NON_NAME_METADATA_EXCLUSIONS = [
  "college", "university", "institute", "institution", "company", "org",
  "organization", "father", "mother", "parent", "guardian", "file", "sheet"
];

/**
 * Normalizes keys and values extracted from raw Excel/CSV rows with strict exclusion guards.
 */
function findRowValue(
  row: Record<string, any>,
  possibleKeys: string[],
  excludeSubstrings: string[] = []
): string {
  const rowKeys = Object.keys(row);

  // Pass 1: Exact stripped match
  for (const target of possibleKeys) {
    const cleanTarget = cleanHeaderKey(target);
    const matchedKey = rowKeys.find((k) => cleanHeaderKey(k) === cleanTarget);
    if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null) {
      const val = String(row[matchedKey]).trim();
      if (val && !isHeaderOrMetaLabel(val)) return val;
    }
  }

  // Pass 2: Substring / contains match with exclusion guard
  for (const target of possibleKeys) {
    const cleanTarget = cleanHeaderKey(target);
    const matchedKey = rowKeys.find((k) => {
      const cleanKey = cleanHeaderKey(k);
      // Skip if contains any excluded keyword
      if (excludeSubstrings.some((ex) => cleanKey.includes(ex))) return false;
      return cleanKey.includes(cleanTarget) || cleanTarget.includes(cleanKey);
    });
    if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null) {
      const val = String(row[matchedKey]).trim();
      if (val && !isHeaderOrMetaLabel(val)) return val;
    }
  }

  return "";
}

/**
 * Robustly extracts the candidate's personal name from a row object.
 * Supports direct names, single 'name' columns, and separate first/last name columns.
 */
function extractCandidateName(row: Record<string, any>): string {
  // 1. Direct candidate name column targets (excluding first/last partials)
  const candidateKeys = [
    "candidatename",
    "studentname",
    "internname",
    "fullname",
    "candidatestudentname",
    "candname",
    "studentfullname",
    "candidatefullname",
    "internfullname",
    "traineename",
    "applicantname",
    "participantname",
    "employeename",
    "membername",
    "username",
    "personname",
    "nameofstudent",
    "nameofcandidate",
    "nameofintern",
    "nameofapplicant",
    "nameoftrainee",
    "studentsname",
    "candidatesname",
    "internsname",
    "traineesname",
    "name",
    "student",
    "candidate",
    "intern",
    "trainee",
    "participant",
    "member",
    "applicant",
    "person",
    "nominee",
    "beneficiary"
  ];

  const direct = findRowValue(row, candidateKeys, NAME_EXCLUSIONS);
  if (direct) return direct;

  // 2. Check for separate First Name + Last Name columns
  const first = findRowValue(row, ["firstname", "first_name", "fname", "first"], NON_NAME_METADATA_EXCLUSIONS);
  const last = findRowValue(row, ["lastname", "last_name", "lname", "surname", "last"], NON_NAME_METADATA_EXCLUSIONS);
  if (first) {
    const combined = `${first} ${last}`.trim();
    if (combined && !isHeaderOrMetaLabel(combined)) return combined;
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
 * Features smart multi-row header detection, flexible column mapping, and headerless fallback.
 */
/**
 * Parses a single worksheet into CandidateLetterRow records.
 * Uses smart header row detection, column index mapping, and headerless fallback.
 */
export function parseSingleWorksheet(worksheet: XLSX.WorkSheet): CandidateLetterRow[] {
  // 1. Convert sheet to 2D row array for smart header row detection
  const matrix: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
  if (!matrix || matrix.length === 0) return [];

  // 2. Smart Header Row Detection: scan first 20 rows
  let bestHeaderRowIndex = -1;
  let bestScore = -999;

  const candidateNameHeaderTokens = [
    "candidatename", "studentname", "internname", "fullname", "candidatestudentname",
    "candname", "studentfullname", "candidatefullname", "internfullname", "traineename",
    "applicantname", "participantname", "employeename", "membername", "username",
    "personname", "nameofstudent", "nameofcandidate", "nameofintern", "nameofapplicant",
    "nameoftrainee", "studentsname", "candidatesname", "internsname", "traineesname",
    "name", "student", "candidate", "intern", "trainee", "participant", "member",
    "applicant", "person", "nominee", "beneficiary"
  ];

  const generalHeaderIndicators = [
    "email", "mail", "position", "role", "designation", "technology", "track", "tech", "stream", "domain",
    "date", "start", "commencement", "end", "completion", "college", "university", "salutation", "gender",
    "stipend", "salary", "srno", "sr", "sno", "id", "roll", "enrollment"
  ];

  for (let r = 0; r < Math.min(20, matrix.length); r++) {
    const rowCells = matrix[r];
    if (!Array.isArray(rowCells) || rowCells.length === 0) continue;

    const nonEmptyCells = rowCells.filter((c) => String(c ?? "").trim().length > 0);
    if (nonEmptyCells.length === 0) continue;

    // Single-cell rows are title banners unless the single cell is literally a column name
    if (nonEmptyCells.length === 1) {
      const cleanSingle = cleanHeaderKey(nonEmptyCells[0]);
      if (candidateNameHeaderTokens.includes(cleanSingle)) {
        if (15 > bestScore) {
          bestScore = 15;
          bestHeaderRowIndex = r;
        }
      }
      continue;
    }

    let score = 0;
    let hasNameCol = false;
    let hasFirst = false;
    let hasLast = false;

    for (const cell of rowCells) {
      const cellStr = String(cell ?? "").trim();
      const clean = cleanHeaderKey(cell);
      if (!clean || clean.length > 35) continue;

      // Actual data values are never column headers
      if (cellStr.includes("@")) continue; // email address
      if (/^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}$/.test(cellStr)) continue; // date string
      if (/intern|developer|engineer|designer|analyst/i.test(cellStr) && cellStr.split(/\s+/).length >= 2) continue; // multi-word role value

      const isExcluded = NON_NAME_METADATA_EXCLUSIONS.some((ex) => clean.includes(ex));
      if (!isExcluded) {
        if (
          candidateNameHeaderTokens.includes(clean) ||
          ((clean.endsWith("name") || clean.startsWith("name")) && clean.length <= 25)
        ) {
          score += 25;
          hasNameCol = true;
        } else if (["firstname", "first_name", "fname", "first"].includes(clean)) {
          score += 15;
          hasFirst = true;
        } else if (["lastname", "last_name", "lname", "surname", "last"].includes(clean)) {
          score += 15;
          hasLast = true;
        }
      }

      if (generalHeaderIndicators.some((gi) => clean === cleanHeaderKey(gi) || (clean.length <= 20 && clean.includes(cleanHeaderKey(gi))))) {
        score += 5;
      }
    }

    if (hasFirst && hasLast) {
      hasNameCol = true;
      score += 10;
    }

    // Give a bonus for multi-column rows
    score += Math.min(nonEmptyCells.length, 10);

    if (score > bestScore && (hasNameCol || score >= 20)) {
      bestScore = score;
      bestHeaderRowIndex = r;
    }
  }

  // Parse worksheet rows using detected header row index
  let rawRows: Record<string, any>[] = [];
  if (bestHeaderRowIndex >= 0) {
    rawRows = XLSX.utils.sheet_to_json(worksheet, {
      range: bestHeaderRowIndex,
      defval: "",
    });
  }

  // Map header column indices if available
  let nameColIdx = -1;
  let firstColIdx = -1;
  let lastColIdx = -1;
  let emailColIdx = -1;
  let roleColIdx = -1;
  let techColIdx = -1;
  let startColIdx = -1;
  let endColIdx = -1;
  let collegeColIdx = -1;
  let salutationColIdx = -1;
  let stipendColIdx = -1;
  let idColIdx = -1;

  if (bestHeaderRowIndex >= 0 && Array.isArray(matrix[bestHeaderRowIndex])) {
    matrix[bestHeaderRowIndex].forEach((hCell: any, cIdx: number) => {
      const clean = cleanHeaderKey(hCell);
      if (!clean) return;

      const isExcluded = NON_NAME_METADATA_EXCLUSIONS.some((ex) => clean.includes(ex));
      if (!isExcluded) {
        if (candidateNameHeaderTokens.includes(clean) && nameColIdx < 0) {
          nameColIdx = cIdx;
        } else if (["firstname", "first_name", "fname", "first"].includes(clean) && firstColIdx < 0) {
          firstColIdx = cIdx;
        } else if (["lastname", "last_name", "lname", "surname", "last"].includes(clean) && lastColIdx < 0) {
          lastColIdx = cIdx;
        }
      }

      if (clean.includes("email") || clean.includes("mail")) emailColIdx = cIdx;
      else if (clean.includes("role") || clean.includes("position") || clean.includes("designation")) roleColIdx = cIdx;
      else if (clean.includes("tech") || clean.includes("track") || clean.includes("stream") || clean.includes("domain")) techColIdx = cIdx;
      else if (clean.includes("start") || clean.includes("commence") || clean.includes("joining")) startColIdx = cIdx;
      else if (clean.includes("end") || clean.includes("complete") || clean.includes("continueuntil")) endColIdx = cIdx;
      else if (clean.includes("college") || clean.includes("university") || clean.includes("institute")) collegeColIdx = cIdx;
      else if (clean.includes("salutation") || clean.includes("gender") || clean.includes("prefix")) salutationColIdx = cIdx;
      else if (clean.includes("stipend") || clean.includes("salary")) stipendColIdx = cIdx;
      else if (clean.includes("sr") || clean.includes("sno") || clean.includes("id") || clean.includes("roll")) idColIdx = cIdx;
    });
  }

  const parsedCandidates: CandidateLetterRow[] = [];

  rawRows.forEach((row, idx) => {
    let rawName = extractCandidateName(row);

    // If extractCandidateName didn't find it, check matrix column
    const matrixRowIdx = bestHeaderRowIndex >= 0 ? bestHeaderRowIndex + 1 + idx : idx;
    const matrixRow = matrix[matrixRowIdx];

    if (!rawName && Array.isArray(matrixRow)) {
      if (nameColIdx >= 0 && matrixRow[nameColIdx]) {
        const v = String(matrixRow[nameColIdx]).trim();
        if (v && !isHeaderOrMetaLabel(v)) rawName = v;
      } else if (firstColIdx >= 0 && matrixRow[firstColIdx]) {
        const f = String(matrixRow[firstColIdx]).trim();
        const l = lastColIdx >= 0 ? String(matrixRow[lastColIdx] || "").trim() : "";
        const combined = `${f} ${l}`.trim();
        if (combined && !isHeaderOrMetaLabel(combined)) rawName = combined;
      }
    }

    if (!rawName) return; // Skip empty rows

    const cleanName = rawName.replace(/^(Mr\.|Ms\.|Mrs\.|Miss)\s*/i, "").trim();
    if (!cleanName || cleanName.length < 2 || isHeaderOrMetaLabel(cleanName)) return;

    const explicitSalutation =
      findRowValue(row, ["salutation", "title", "prefix", "gender"]) ||
      (salutationColIdx >= 0 && matrixRow ? String(matrixRow[salutationColIdx] || "").trim() : "");
    const isGirl = isFemaleCandidate(cleanName, explicitSalutation);
    const salutation: "Mr." | "Ms." =
      explicitSalutation.toLowerCase().includes("ms") ||
      explicitSalutation.toLowerCase().includes("female") ||
      explicitSalutation.toLowerCase().includes("girl") ||
      isGirl
        ? "Ms."
        : "Mr.";

    const email =
      findRowValue(row, ["email", "studentemail", "recipientemail", "emailaddress", "mail"]) ||
      (emailColIdx >= 0 && matrixRow ? String(matrixRow[emailColIdx] || "").trim() : "");

    const position =
      findRowValue(row, ["internshipposition", "position", "role", "internrole", "jobtitle", "designation"]) ||
      (roleColIdx >= 0 && matrixRow ? String(matrixRow[roleColIdx] || "").trim() : "") ||
      "Software Engineering Intern";

    const technology =
      findRowValue(row, ["technology", "track", "tech", "specialization", "domain", "stream"]) ||
      (techColIdx >= 0 && matrixRow ? String(matrixRow[techColIdx] || "").trim() : "") ||
      deriveTrackTechnology(position);

    const commencementDate = formatSpreadsheetDate(
      findRowValue(row, ["commencementdate", "startdate", "joiningdate", "commencement", "start", "from", "dateofjoining"]) ||
      (startColIdx >= 0 && matrixRow ? String(matrixRow[startColIdx] || "").trim() : ""),
      "1st June 2026"
    );

    const continueUntilDate = formatSpreadsheetDate(
      findRowValue(row, ["continueuntildate", "enddate", "completiondate", "continueuntil", "end", "to", "dateofcompletion"]) ||
      (endColIdx >= 0 && matrixRow ? String(matrixRow[endColIdx] || "").trim() : ""),
      "30th November 2026"
    );

    const college =
      findRowValue(row, ["college", "university", "institute", "collegename", "institution", "campus"]) ||
      (collegeColIdx >= 0 && matrixRow ? String(matrixRow[collegeColIdx] || "").trim() : "");

    const stipend =
      findRowValue(row, ["stipend", "salary", "compensation"]) ||
      (stipendColIdx >= 0 && matrixRow ? String(matrixRow[stipendColIdx] || "").trim() : "");

    const documentNumber =
      findRowValue(row, ["documentnumber", "docnumber", "id", "refno", "serialno", "srno"]) ||
      (idColIdx >= 0 && matrixRow ? String(matrixRow[idColIdx] || "").trim() : "");

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

  // Pass B: Fallback: If still 0 candidates, try extracting from 2D matrix directly (headerless CSV / unlabelled columns)
  if (parsedCandidates.length === 0 && matrix.length > 0) {
    const numCols = Math.max(...matrix.map((r) => (Array.isArray(r) ? r.length : 0)));
    let bestMatrixNameCol = -1;
    let bestNameCount = 0;

    for (let c = 0; c < numCols; c++) {
      let nameCount = 0;
      for (let r = 0; r < matrix.length; r++) {
        const val = String(matrix[r]?.[c] || "").trim();
        if (
          val.length >= 3 &&
          val.length <= 40 &&
          /^[A-Za-z\s.'-]+$/.test(val) &&
          !isHeaderOrMetaLabel(val) &&
          !/intern|engineer|developer|analyst|university|college|department/i.test(val) &&
          val.split(/\s+/).length >= 1 &&
          val.split(/\s+/).length <= 4
        ) {
          nameCount++;
        }
      }
      if (nameCount > bestNameCount) {
        bestNameCount = nameCount;
        bestMatrixNameCol = c;
      }
    }

    if (bestMatrixNameCol >= 0 && bestNameCount > 0) {
      matrix.forEach((rowCells, rIdx) => {
        const rawNameVal = String(rowCells?.[bestMatrixNameCol] || "").trim();
        if (!rawNameVal || isHeaderOrMetaLabel(rawNameVal)) return;

        const cleanName = rawNameVal.replace(/^(Mr\.|Ms\.|Mrs\.|Miss)\s*/i, "").trim();
        if (!cleanName || cleanName.length < 2) return;

        let emailVal = "";
        let roleVal = "Software Engineering Intern";
        let dateVal = "1st June 2026";

        rowCells.forEach((cVal: any, cIdx: number) => {
          if (cIdx === bestMatrixNameCol) return;
          const s = String(cVal || "").trim();
          if (s.includes("@") && s.includes(".")) emailVal = s;
          else if (/intern|engineer|developer|analyst/i.test(s)) roleVal = s;
          else if (/^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}$/.test(s)) dateVal = formatSpreadsheetDate(s, dateVal);
        });

        parsedCandidates.push({
          id: `cand_raw_${Date.now()}_${rIdx}`,
          studentName: cleanName,
          salutation: isFemaleCandidate(cleanName) ? "Ms." : "Mr.",
          recipientEmail: emailVal || undefined,
          internshipPosition: roleVal,
          technology: deriveTrackTechnology(roleVal),
          commencementDate: dateVal,
          continueUntilDate: "30th November 2026",
        });
      });
    }
  }

  return parsedCandidates;
}

/**
 * Parses an uploaded Excel (.xlsx, .xls) or CSV file into clean CandidateLetterRow records.
 * Iterates across all sheets in the workbook to reliably find candidate data.
 */
export function parseCandidateSpreadsheet(data: ArrayBuffer | Uint8Array): CandidateLetterRow[] {
  const workbook = XLSX.read(data, { type: "array" });
  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error("Spreadsheet contains no sheets.");
  }

  let bestCandidates: CandidateLetterRow[] = [];

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) continue;

    try {
      const candidates = parseSingleWorksheet(worksheet);
      if (candidates.length > bestCandidates.length) {
        bestCandidates = candidates;
      }
    } catch {
      // Continue to next sheet
    }
  }

  if (bestCandidates.length === 0) {
    throw new Error(
      "No valid candidate rows could be extracted. Please ensure column headers include 'Name' or 'Student Name'."
    );
  }

  return bestCandidates;
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
