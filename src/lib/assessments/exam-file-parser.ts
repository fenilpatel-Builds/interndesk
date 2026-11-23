import * as XLSX from "xlsx";
import { AssessmentQuestion, QuestionType, QuestionDifficulty } from "./assessment-store";

export interface ParsedExamMetadata {
  title: string;
  subject: string;
  description: string;
  duration_minutes: number;
  passing_threshold: number;
  attempt_limit: number;
}

export interface ParsedExamFileResult {
  success: boolean;
  metadata: ParsedExamMetadata;
  questions: AssessmentQuestion[];
  summary: {
    totalQuestions: number;
    totalMarks: number;
    validCount: number;
    invalidCount: number;
    typesCount: Record<string, number>;
  };
  warnings: string[];
  errors: string[];
}

/**
 * Normalizes column header keys by lowercasing and stripping non-alphanumeric characters.
 */
function cleanKey(key: string): string {
  return String(key || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Parses questions and exam metadata from an Excel (.xlsx, .xls) or CSV buffer.
 * Supports auto-detection of header row, flexible column naming, positional fallbacks,
 * and multi-line/raw spreadsheets with preamble or metadata banners.
 */
export function parseExcelOrCsvBuffer(buffer: ArrayBuffer | Uint8Array | Buffer, fileName: string = ""): ParsedExamFileResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const questions: AssessmentQuestion[] = [];

  let metadata: ParsedExamMetadata = {
    title: fileName ? fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ") : "Imported Technical Examination",
    subject: "Computer Science & Engineering",
    description: "Technical assessment imported automatically via examination data sheet.",
    duration_minutes: 30,
    passing_threshold: 70,
    attempt_limit: 2,
  };

  try {
    const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      return {
        success: false,
        metadata,
        questions: [],
        summary: { totalQuestions: 0, totalMarks: 0, validCount: 0, invalidCount: 0, typesCount: {} },
        warnings: [],
        errors: ["Excel file does not contain any worksheets."],
      };
    }

    const worksheet = workbook.Sheets[firstSheetName];
    // Convert to Array of Arrays (aoa) so we can scan rows and find the true header row
    const aoa: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

    if (!aoa || aoa.length === 0) {
      return {
        success: false,
        metadata,
        questions: [],
        summary: { totalQuestions: 0, totalMarks: 0, validCount: 0, invalidCount: 0, typesCount: {} },
        warnings: [],
        errors: ["Uploaded spreadsheet is empty. Please add question rows."],
      };
    }

    // 1. Scan the first 15 rows to find the true header row
    let headerRowIndex = -1;
    let qCol = -1;
    let optCols: number[] = [];
    let ansCol = -1;
    let typeCol = -1;
    let marksCol = -1;
    let negMarksCol = -1;
    let diffCol = -1;
    let expCol = -1;
    let topicCol = -1;
    let subjectCol = -1;

    for (let r = 0; r < Math.min(aoa.length, 15); r++) {
      const row = aoa[r] || [];
      const nonEmptyCells = row.filter((c) => String(c).trim().length > 0);
      const rowStr = row.map((c) => cleanKey(String(c))).join(" ");

      // Check if this row looks like metadata
      if (rowStr.includes("examtitle") || rowStr.includes("assessmenttitle")) {
        const foundTitle = row.find((c) => typeof c === "string" && c.length > 5 && !cleanKey(c).includes("title"));
        if (foundTitle) metadata.title = String(foundTitle).trim();
      }
      if (rowStr.includes("subject") && !rowStr.includes("question")) {
        const foundSub = row.find((c) => typeof c === "string" && c.length > 3 && !cleanKey(c).includes("subject"));
        if (foundSub) metadata.subject = String(foundSub).trim();
      }

      // A real column header row must span multiple columns (at least 2 non-empty cells)
      if (nonEmptyCells.length >= 2) {
        const hasQKeyword = rowStr.includes("question") || rowStr.includes("prompt") || rowStr.includes("problem") || rowStr.includes("qno") || rowStr.includes("qtext");
        const hasOptKeyword = rowStr.includes("option") || rowStr.includes("choice") || rowStr.includes("opta") || rowStr.includes("choicea");
        const hasAnsKeyword = rowStr.includes("answer") || rowStr.includes("correct") || rowStr.includes("key") || rowStr.includes("ans");

        if ((hasQKeyword && hasOptKeyword) || (hasOptKeyword && hasAnsKeyword) || (hasQKeyword && hasAnsKeyword)) {
          headerRowIndex = r;
          break;
        }
      }
    }

    // If a header row was identified, map column indices
    if (headerRowIndex >= 0) {
      const headerCells = aoa[headerRowIndex] || [];
      headerCells.forEach((cell, colIdx) => {
        const k = cleanKey(String(cell));
        if (k.includes("question") || k.includes("prompt") || k.includes("problem") || k === "q" || k === "title" || k === "description") {
          if (qCol === -1) qCol = colIdx;
        } else if (k.includes("optiona") || k.includes("opta") || k.includes("choicea") || k === "a" || k === "option1" || k === "opt1" || k === "choice1") {
          optCols[0] = colIdx;
        } else if (k.includes("optionb") || k.includes("optb") || k.includes("choiceb") || k === "b" || k === "option2" || k === "opt2" || k === "choice2") {
          optCols[1] = colIdx;
        } else if (k.includes("optionc") || k.includes("optc") || k.includes("choicec") || k === "c" || k === "option3" || k === "opt3" || k === "choice3") {
          optCols[2] = colIdx;
        } else if (k.includes("optiond") || k.includes("optd") || k.includes("choiced") || k === "d" || k === "option4" || k === "opt4" || k === "choice4") {
          optCols[3] = colIdx;
        } else if (k.includes("optione") || k.includes("opte") || k.includes("choicee") || k === "e" || k === "option5" || k === "opt5" || k === "choice5") {
          optCols[4] = colIdx;
        } else if (k.includes("correct") || k.includes("answer") || k === "ans" || k === "key" || k.includes("solution")) {
          if (ansCol === -1) ansCol = colIdx;
        } else if (k.includes("type") || k.includes("format") || k === "qtype") {
          typeCol = colIdx;
        } else if (k.includes("marks") || k.includes("points") || k === "score") {
          marksCol = colIdx;
        } else if (k.includes("negative") || k.includes("penalty")) {
          negMarksCol = colIdx;
        } else if (k.includes("difficulty") || k.includes("level")) {
          diffCol = colIdx;
        } else if (k.includes("explanation") || k.includes("rationale")) {
          expCol = colIdx;
        } else if (k.includes("topic") || k.includes("subtopic")) {
          topicCol = colIdx;
        } else if (k.includes("subject") || k.includes("category")) {
          subjectCol = colIdx;
        }
      });
    }

    // 2. Fallback heuristic: If no header row or question column found, detect by position/content
    const startDataRow = headerRowIndex >= 0 ? headerRowIndex + 1 : 0;

    if (qCol === -1) {
      // Find the first column in data rows that contains sentences (length > 10)
      for (let r = startDataRow; r < Math.min(aoa.length, startDataRow + 5); r++) {
        const row = aoa[r] || [];
        for (let c = 0; c < row.length; c++) {
          const val = String(row[c] || "").trim();
          if (val.length > 15 || val.endsWith("?")) {
            qCol = c;
            break;
          }
        }
        if (qCol !== -1) break;
      }
      if (qCol === -1) qCol = 0; // Default to first column
    }

    // If options columns not explicitly mapped, check adjacent columns
    if (optCols.length < 2) {
      const detectedOpts: number[] = [];
      const sampleRow = aoa[startDataRow] || [];
      sampleRow.forEach((val, c) => {
        if (c !== qCol && c !== ansCol && typeof val === "string" && val.trim().length > 0) {
          detectedOpts.push(c);
        }
      });
      if (detectedOpts.length >= 2) {
        optCols = detectedOpts.slice(0, 5);
      }
    }

    // 3. Extract questions from data rows
    for (let r = startDataRow; r < aoa.length; r++) {
      const row = aoa[r] || [];
      if (!row || row.length === 0) continue;

      const questionText = String(row[qCol] || "").trim();
      if (!questionText || questionText.length < 3) continue;

      // Extract options
      const optionsList: string[] = [];
      optCols.forEach((c) => {
        if (c >= 0 && row[c] !== undefined) {
          const optVal = String(row[c]).trim();
          if (optVal) optionsList.push(optVal);
        }
      });

      // Extract answer
      const rawAns = ansCol >= 0 && row[ansCol] !== undefined ? String(row[ansCol]).trim() : "";

      // Determine type
      let type: QuestionType = "SINGLE_CHOICE";
      const rawType = typeCol >= 0 && row[typeCol] ? String(row[typeCol]).toUpperCase().trim() : "";

      if (rawType.includes("TRUE") || rawType.includes("FALSE") || rawType === "TF") {
        type = "TRUE_FALSE";
      } else if (rawType.includes("MULTI") || rawType.includes("CHECKBOX")) {
        type = "MULTIPLE_CHOICE";
      } else if (rawType.includes("FILL") || rawType.includes("BLANK")) {
        type = "FILL_BLANKS";
      } else if (rawType.includes("CODE") || rawType.includes("PROGRAM")) {
        type = "CODING";
      } else if (rawType.includes("DESC") || rawType.includes("LONG")) {
        type = "DESCRIPTIVE";
      } else if (rawType.includes("SHORT")) {
        type = "SHORT_ANSWER";
      } else {
        // Auto-detect based on options and answers
        if (optionsList.length === 2 && optionsList.some((o) => o.toLowerCase() === "true" || o.toLowerCase() === "false")) {
          type = "TRUE_FALSE";
        } else if (optionsList.length >= 2) {
          type = "SINGLE_CHOICE";
        } else {
          type = "SHORT_ANSWER";
        }
      }

      if (type === "TRUE_FALSE" && optionsList.length < 2) {
        optionsList.length = 0;
        optionsList.push("True", "False");
      }

      // Resolve correct answer
      let resolvedCorrectAnswer: string | string[] = rawAns;
      let resolvedCorrectAnswers: string[] | undefined = undefined;

      if (type === "SINGLE_CHOICE" || type === "TRUE_FALSE") {
        const letter = rawAns.toUpperCase();
        if (letter === "A" || letter === "1") {
          resolvedCorrectAnswer = optionsList[0] || rawAns;
        } else if (letter === "B" || letter === "2") {
          resolvedCorrectAnswer = optionsList[1] || rawAns;
        } else if (letter === "C" || letter === "3") {
          resolvedCorrectAnswer = optionsList[2] || rawAns;
        } else if (letter === "D" || letter === "4") {
          resolvedCorrectAnswer = optionsList[3] || rawAns;
        } else if (letter === "E" || letter === "5") {
          resolvedCorrectAnswer = optionsList[4] || rawAns;
        } else if (type === "TRUE_FALSE") {
          if (letter === "T" || letter === "TRUE" || letter === "1") resolvedCorrectAnswer = "True";
          else if (letter === "F" || letter === "FALSE" || letter === "0") resolvedCorrectAnswer = "False";
        } else {
          // Direct text match
          const matchOpt = optionsList.find((o) => o.toLowerCase() === rawAns.toLowerCase());
          if (matchOpt) resolvedCorrectAnswer = matchOpt;
        }

        // If no answer provided in row, default to Option A with warning
        if (!resolvedCorrectAnswer && optionsList.length > 0) {
          resolvedCorrectAnswer = optionsList[0];
          warnings.push(`Row ${r + 1}: No answer key specified for "${questionText.substring(0, 30)}...". Defaulted to Option A; please verify in preview.`);
        }
      } else if (type === "MULTIPLE_CHOICE") {
        const letters = rawAns.split(/[,;&|]+/).map((s) => s.trim().toUpperCase());
        const mappedList: string[] = [];

        letters.forEach((l) => {
          if (l === "A" || l === "1") mappedList.push(optionsList[0] || l);
          else if (l === "B" || l === "2") mappedList.push(optionsList[1] || l);
          else if (l === "C" || l === "3") mappedList.push(optionsList[2] || l);
          else if (l === "D" || l === "4") mappedList.push(optionsList[3] || l);
          else if (l === "E" || l === "5") mappedList.push(optionsList[4] || l);
          else {
            const matchOpt = optionsList.find((o) => o.toLowerCase() === l.toLowerCase());
            if (matchOpt) mappedList.push(matchOpt);
            else if (l) mappedList.push(l);
          }
        });

        resolvedCorrectAnswer = mappedList.length > 0 ? mappedList : optionsList.slice(0, 2);
        resolvedCorrectAnswers = Array.isArray(resolvedCorrectAnswer) ? resolvedCorrectAnswer : [resolvedCorrectAnswer];
      } else if (type === "FILL_BLANKS") {
        const variants = rawAns.split(/[,|;]+/).map((s) => s.trim()).filter(Boolean);
        resolvedCorrectAnswer = variants.length > 0 ? variants : [rawAns || "Default Answer"];
      }

      // Extract marks, difficulty, explanation
      const marksVal = marksCol >= 0 && row[marksCol] ? Number(row[marksCol]) : 10;
      const negMarksVal = negMarksCol >= 0 && row[negMarksCol] ? Number(row[negMarksCol]) : 0;
      const rawDiff = diffCol >= 0 && row[diffCol] ? String(row[diffCol]).toUpperCase() : "MEDIUM";
      let difficulty: QuestionDifficulty = "MEDIUM";
      if (rawDiff.includes("EASY")) difficulty = "EASY";
      else if (rawDiff.includes("HARD")) difficulty = "HARD";
      else if (rawDiff.includes("ADV")) difficulty = "ADVANCED";

      const explanation = expCol >= 0 && row[expCol] ? String(row[expCol]).trim() : `Official answer key explanation for: ${questionText.substring(0, 50)}`;
      const topic = topicCol >= 0 && row[topicCol] ? String(row[topicCol]).trim() : metadata.subject;

      questions.push({
        id: `q_import_${Date.now()}_${r + 1}`,
        question: questionText,
        type,
        options: optionsList.length > 0 ? optionsList : undefined,
        correct_answer: resolvedCorrectAnswer,
        correct_answers: resolvedCorrectAnswers,
        explanation,
        marks: marksVal > 0 ? marksVal : 10,
        negative_marks: negMarksVal > 0 ? negMarksVal : 0,
        difficulty,
        topic,
      });
    }

    if (questions.length === 0) {
      return {
        success: false,
        metadata,
        questions: [],
        summary: { totalQuestions: 0, totalMarks: 0, validCount: 0, invalidCount: 0, typesCount: {} },
        warnings,
        errors: ["No questions could be extracted from this spreadsheet. Please ensure the file contains question rows or download our official template."],
      };
    }

    const typesCount: Record<string, number> = {};
    let totalMarks = 0;
    questions.forEach((q) => {
      totalMarks += q.marks;
      typesCount[q.type] = (typesCount[q.type] || 0) + 1;
    });

    return {
      success: true,
      metadata,
      questions,
      summary: {
        totalQuestions: questions.length,
        totalMarks,
        validCount: questions.length,
        invalidCount: warnings.length,
        typesCount,
      },
      warnings,
      errors: [],
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to parse Excel file";
    return {
      success: false,
      metadata,
      questions: [],
      summary: { totalQuestions: 0, totalMarks: 0, validCount: 0, invalidCount: 0, typesCount: {} },
      warnings: [],
      errors: [message],
    };
  }
}

/**
 * Parses questions from structured plain text or extracted PDF text.
 */
export function parseQuestionsFromText(text: string, titleHint?: string): ParsedExamFileResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const questions: AssessmentQuestion[] = [];

  const metadata: ParsedExamMetadata = {
    title: titleHint || "Imported Examination from Document",
    subject: "Technical Engineering",
    description: "Assessment generated directly from structured document / PDF content.",
    duration_minutes: 25,
    passing_threshold: 70,
    attempt_limit: 2,
  };

  if (!text || !text.trim()) {
    return {
      success: false,
      metadata,
      questions: [],
      summary: { totalQuestions: 0, totalMarks: 0, validCount: 0, invalidCount: 0, typesCount: {} },
      warnings: [],
      errors: ["Document contains no readable text content."],
    };
  }

  // Attempt to split questions by numbered patterns (e.g., "1. ", "Question 1:", "Q1.")
  const questionBlocks = text.split(/(?:^|\n)\s*(?:Question\s*\d+[:.]|Q\s*\d+[:.]|\d+[\.)])\s+/gi);

  // The first block is the exam title / instructions preamble
  const actualBlocks = questionBlocks.length > 1 ? questionBlocks.slice(1) : questionBlocks;
  if (questionBlocks.length > 1) {
    const preamble = questionBlocks[0].trim();
    if (preamble.length > 0 && preamble.length < 300) {
      const firstLine = preamble.split("\n")[0].trim();
      if (firstLine && firstLine.length > 3) {
        metadata.title = firstLine.replace(/examination|exam|test/gi, "").trim() + " Examination";
      }
    }
  }

  actualBlocks.forEach((block, idx) => {
    const trimmed = block.trim();
    if (!trimmed || trimmed.length < 15) return;

    // Search for options (A), (B), (C), (D) or A., B., C., D.
    const optionMatches = Array.from(trimmed.matchAll(/(?:^|\n|\s)(?:\(([A-Ea-e])\)|([A-Ea-e])[\.\)])\s*([^\n\r(]+)/g));

    // Search for answer
    const ansMatch = trimmed.match(/(?:Answer|Correct Answer|Ans)[:\s]+(?:\()?([A-Ea-e]|[^\n\r]+)(?:\))?/i);
    // Search for explanation
    const expMatch = trimmed.match(/(?:Explanation|Solution|Rationale)[:\s]+([^\n\r]+)/i);

    let questionPrompt = trimmed;
    const options: string[] = [];

    if (optionMatches.length >= 2) {
      // Find where options start in the text to isolate question prompt
      const firstOptionIndex = trimmed.indexOf(optionMatches[0][0]);
      if (firstOptionIndex > 0) {
        questionPrompt = trimmed.substring(0, firstOptionIndex).trim();
      }

      optionMatches.forEach((m) => {
        const optText = (m[3] || "").trim();
        if (optText) options.push(optText);
      });
    }

    // Clean question prompt
    questionPrompt = questionPrompt.replace(/^(?:Question\s*\d+[:.]|Q\s*\d+[:.]|\d+[\.)])\s*/i, "").trim();

    if (!questionPrompt) return;

    let correct_answer: string | string[] = "";
    if (ansMatch) {
      const rawA = ansMatch[1].trim();
      const upper = rawA.toUpperCase();
      if (upper === "A" && options[0]) correct_answer = options[0];
      else if (upper === "B" && options[1]) correct_answer = options[1];
      else if (upper === "C" && options[2]) correct_answer = options[2];
      else if (upper === "D" && options[3]) correct_answer = options[3];
      else if (upper === "E" && options[4]) correct_answer = options[4];
      else {
        // Text match
        const found = options.find((o) => o.toLowerCase() === rawA.toLowerCase());
        correct_answer = found || rawA;
      }
    } else if (options.length > 0) {
      // Fallback to first option if not explicitly stated, with warning
      correct_answer = options[0];
      warnings.push(`Question ${idx + 1}: No explicit answer key found. Assigned option A as default.`);
    }

    const type: QuestionType = options.length >= 2 ? "SINGLE_CHOICE" : "SHORT_ANSWER";

    questions.push({
      id: `q_pdf_${Date.now()}_${idx + 1}`,
      question: questionPrompt,
      type,
      options: options.length > 0 ? options : undefined,
      correct_answer: correct_answer || "Descriptive answer key",
      explanation: expMatch ? expMatch[1].trim() : `Evaluated standard response for: ${questionPrompt.substring(0, 50)}`,
      marks: 10,
      negative_marks: 0,
      difficulty: "MEDIUM",
      topic: metadata.subject,
    });
  });

  if (questions.length === 0) {
    return {
      success: false,
      metadata,
      questions: [],
      summary: { totalQuestions: 0, totalMarks: 0, validCount: 0, invalidCount: 0, typesCount: {} },
      warnings,
      errors: ["Could not extract structured questions from document text. Please ensure questions are numbered (e.g. 1. Question text, A. Option 1, B. Option 2, Answer: A)."],
    };
  }

  const typesCount: Record<string, number> = {};
  let totalMarks = 0;
  questions.forEach((q) => {
    totalMarks += q.marks;
    typesCount[q.type] = (typesCount[q.type] || 0) + 1;
  });

  return {
    success: true,
    metadata,
    questions,
    summary: {
      totalQuestions: questions.length,
      totalMarks,
      validCount: questions.length - warnings.length,
      invalidCount: warnings.length,
      typesCount,
    },
    warnings,
    errors: [],
  };
}

/**
 * Parses JSON content into assessment metadata and questions.
 */
export function parseJsonExamContent(jsonStr: string): ParsedExamFileResult {
  const metadata: ParsedExamMetadata = {
    title: "Imported Assessment (JSON)",
    subject: "Technical Engineering",
    description: "Assessment imported via JSON schema.",
    duration_minutes: 30,
    passing_threshold: 70,
    attempt_limit: 2,
  };

  try {
    const parsed = JSON.parse(jsonStr);

    let rawQuestions: any[] = [];
    if (Array.isArray(parsed)) {
      rawQuestions = parsed;
    } else if (parsed && Array.isArray(parsed.questions)) {
      rawQuestions = parsed.questions;
      if (parsed.title) metadata.title = String(parsed.title);
      if (parsed.subject) metadata.subject = String(parsed.subject);
      if (parsed.description) metadata.description = String(parsed.description);
      if (parsed.duration_minutes) metadata.duration_minutes = Number(parsed.duration_minutes);
      if (parsed.passing_threshold) metadata.passing_threshold = Number(parsed.passing_threshold);
      if (parsed.attempt_limit) metadata.attempt_limit = Number(parsed.attempt_limit);
    } else {
      return {
        success: false,
        metadata,
        questions: [],
        summary: { totalQuestions: 0, totalMarks: 0, validCount: 0, invalidCount: 0, typesCount: {} },
        warnings: [],
        errors: ["Invalid JSON format: expected an array of questions or an object with a 'questions' array."],
      };
    }

    const questions: AssessmentQuestion[] = rawQuestions.map((q, idx) => {
      const qId = q.id || `q_json_${Date.now()}_${idx + 1}`;
      return {
        id: qId,
        question: q.question || `Question ${idx + 1}`,
        type: q.type || (q.options?.length >= 2 ? "SINGLE_CHOICE" : "SHORT_ANSWER"),
        options: Array.isArray(q.options) ? q.options : undefined,
        correct_answer: q.correct_answer || q.correct_answers || "",
        correct_answers: Array.isArray(q.correct_answers) ? q.correct_answers : undefined,
        explanation: q.explanation || "Official answer explanation",
        marks: Number(q.marks) || 10,
        negative_marks: Number(q.negative_marks) || 0,
        difficulty: q.difficulty || "MEDIUM",
        topic: q.topic || metadata.subject,
      };
    });

    const typesCount: Record<string, number> = {};
    let totalMarks = 0;
    questions.forEach((q) => {
      totalMarks += q.marks;
      typesCount[q.type] = (typesCount[q.type] || 0) + 1;
    });

    return {
      success: true,
      metadata,
      questions,
      summary: {
        totalQuestions: questions.length,
        totalMarks,
        validCount: questions.length,
        invalidCount: 0,
        typesCount,
      },
      warnings: [],
      errors: [],
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid JSON file";
    return {
      success: false,
      metadata,
      questions: [],
      summary: { totalQuestions: 0, totalMarks: 0, validCount: 0, invalidCount: 0, typesCount: {} },
      warnings: [],
      errors: [message],
    };
  }
}

/**
 * Generates an official Excel template buffer (.xlsx) for educators and administrators.
 */
export function generateSampleExcelBuffer(): Buffer {
  const wb = XLSX.utils.book_new();

  const sampleData = [
    {
      "Question": "Which data structure operates on a First-In, First-Out (FIFO) principle?",
      "Type": "SINGLE_CHOICE",
      "Option A": "Queue",
      "Option B": "Stack",
      "Option C": "Binary Search Tree",
      "Option D": "Hash Map",
      "Correct Answer": "A",
      "Marks": 10,
      "Negative Marks": 2.5,
      "Difficulty": "EASY",
      "Explanation": "A Queue processes elements strictly in the order they were inserted (FIFO).",
      "Subject": "Data Structures & Algorithms",
      "Topic": "Linear Data Structures",
    },
    {
      "Question": "In HTTP semantics, the GET request method must be safe and idempotent.",
      "Type": "TRUE_FALSE",
      "Option A": "True",
      "Option B": "False",
      "Option C": "",
      "Option D": "",
      "Correct Answer": "True",
      "Marks": 10,
      "Negative Marks": 0,
      "Difficulty": "EASY",
      "Explanation": "GET requests are read-only; multiple identical requests produce no server side-effects.",
      "Subject": "Full-Stack Web Development",
      "Topic": "HTTP Networking",
    },
    {
      "Question": "Which of the following database phenomena are prevented under SERIALIZABLE isolation? (Select all that apply)",
      "Type": "MULTIPLE_CHOICE",
      "Option A": "Dirty Reads",
      "Option B": "Non-Repeatable Reads",
      "Option C": "Phantom Reads",
      "Option D": "Deadlock Immunity",
      "Correct Answer": "A, B, C",
      "Marks": 15,
      "Negative Marks": 3,
      "Difficulty": "HARD",
      "Explanation": "Serializable isolation guarantees full isolation against dirty, non-repeatable, and phantom reads.",
      "Subject": "Database Systems",
      "Topic": "ACID Concurrency",
    },
    {
      "Question": "In database management, the acronym ACID stands for Atomicity, Consistency, Isolation, and ______.",
      "Type": "FILL_BLANKS",
      "Option A": "",
      "Option B": "",
      "Option C": "",
      "Option D": "",
      "Correct Answer": "Durability",
      "Marks": 10,
      "Negative Marks": 0,
      "Difficulty": "MEDIUM",
      "Explanation": "Durability guarantees that committed transactions persist even during system power failures.",
      "Subject": "Database Systems",
      "Topic": "Transaction Management",
    },
    {
      "Question": "Explain the architectural difference between Monolithic and Microservices design patterns.",
      "Type": "DESCRIPTIVE",
      "Option A": "",
      "Option B": "",
      "Option C": "",
      "Option D": "",
      "Correct Answer": "Monoliths deploy all modules in a single process; microservices deploy discrete independent domain services communicating via network RPC/REST.",
      "Marks": 20,
      "Negative Marks": 0,
      "Difficulty": "HARD",
      "Explanation": "Monoliths offer simple local calls and unified transactions, while microservices allow independent scaling and decoupled deployments.",
      "Subject": "Enterprise Architecture",
      "Topic": "System Design",
    },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);

  // Set column widths for readability
  ws["!cols"] = [
    { wch: 45 }, // Question
    { wch: 18 }, // Type
    { wch: 25 }, // Option A
    { wch: 25 }, // Option B
    { wch: 25 }, // Option C
    { wch: 25 }, // Option D
    { wch: 16 }, // Correct Answer
    { wch: 8 },  // Marks
    { wch: 14 }, // Negative Marks
    { wch: 12 }, // Difficulty
    { wch: 40 }, // Explanation
    { wch: 25 }, // Subject
    { wch: 25 }, // Topic
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Examination Questions");

  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}

/**
 * Generates sample CSV string for instant download.
 */
export function generateSampleCsvString(): string {
  const headers = [
    "Question",
    "Type",
    "Option A",
    "Option B",
    "Option C",
    "Option D",
    "Correct Answer",
    "Marks",
    "Negative Marks",
    "Difficulty",
    "Explanation",
    "Subject",
    "Topic",
  ];

  const rows = [
    [
      '"Which data structure operates on a First-In, First-Out (FIFO) principle?"',
      "SINGLE_CHOICE",
      '"Queue"',
      '"Stack"',
      '"Binary Search Tree"',
      '"Hash Map"',
      '"A"',
      "10",
      "2.5",
      "EASY",
      '"A Queue processes elements strictly in the order they were inserted (FIFO)."',
      '"Data Structures"',
      '"Linear"',
    ],
    [
      '"In HTTP semantics, the GET request method must be safe and idempotent."',
      "TRUE_FALSE",
      '"True"',
      '"False"',
      '""',
      '""',
      '"True"',
      "10",
      "0",
      "EASY",
      '"GET requests are read-only; multiple identical requests produce no server side-effects."',
      '"Web Dev"',
      '"HTTP"',
    ],
    [
      '"Which of the following phenomena are prevented under SERIALIZABLE isolation?"',
      "MULTIPLE_CHOICE",
      '"Dirty Reads"',
      '"Non-Repeatable Reads"',
      '"Phantom Reads"',
      '"Deadlock Immunity"',
      '"A, B, C"',
      "15",
      "3",
      "HARD",
      '"Serializable isolation prevents Dirty, Non-Repeatable, and Phantom Reads."',
      '"Databases"',
      '"ACID"',
    ],
  ];

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

/**
 * Generates sample JSON schema string.
 */
export function generateSampleJsonString(): string {
  const sample = {
    title: "Full-Stack Enterprise Certification Examination",
    subject: "Full-Stack Web Development",
    description: "Official evaluation of modern React, Next.js, and cloud database fundamentals.",
    duration_minutes: 30,
    passing_threshold: 70,
    attempt_limit: 2,
    questions: [
      {
        question: "How do React Server Components (RSC) fundamentally differ from standard Client Components?",
        type: "SINGLE_CHOICE",
        options: [
          "RSCs execute exclusively on the server, producing lightweight streamed HTML without shipping component JavaScript to the client bundle",
          "RSCs execute inside a browser Service Worker to cache offline network assets",
          "RSCs are strictly limited to rendering static images and cannot query databases",
          "RSCs re-render on every client mousemove event"
        ],
        correct_answer: "RSCs execute exclusively on the server, producing lightweight streamed HTML without shipping component JavaScript to the client bundle",
        marks: 10,
        negative_marks: 2.5,
        difficulty: "MEDIUM",
        explanation: "RSCs keep sensitive data and heavyweight libraries on the server, streaming minimal zero-bundle HTML to client browsers.",
        topic: "React Architecture"
      },
      {
        question: "Which of the following statements regarding the Transformer Attention mechanism are correct? (Select all that apply)",
        type: "MULTIPLE_CHOICE",
        options: [
          "Self-Attention calculates dynamic dot-product affinity between Query and Key vectors",
          "Multi-Head Attention allows the model to attend to information from different representation subspaces jointly",
          "Scaled Dot-Product divides by sqrt(d_k) to prevent softmax gradients from vanishing in high dimensions",
          "Transformers require recurrent loops to pass hidden states sequentially between time steps"
        ],
        correct_answer: [
          "Self-Attention calculates dynamic dot-product affinity between Query and Key vectors",
          "Multi-Head Attention allows the model to attend to information from different representation subspaces jointly",
          "Scaled Dot-Product divides by sqrt(d_k) to prevent softmax gradients from vanishing in high dimensions"
        ],
        marks: 15,
        negative_marks: 3,
        difficulty: "HARD",
        explanation: "Transformers operate without recurrent loops; Query, Key, and Value dot products allow global parallel token attention.",
        topic: "Transformers & Attention"
      }
    ]
  };

  return JSON.stringify(sample, null, 2);
}
