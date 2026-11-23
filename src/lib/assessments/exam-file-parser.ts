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
        } else if (k.includes("negative") || k.includes("penalty") || k.includes("negmark")) {
          negMarksCol = colIdx;
        } else if ((k.includes("marks") || k.includes("points") || k === "score") && !k.includes("neg")) {
          marksCol = colIdx;
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

    const lines = trimmed.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const promptLines: string[] = [];
    const options: string[] = [];
    let detectedAnswer = "";
    let detectedExplanation = "";
    let detectedMarks = 10;
    let detectedType: QuestionType | null = null;
    let isParsingOptions = false;

    for (const line of lines) {
      const optMatch = line.match(/^(?:(?:\(([A-Ea-e])\)|([A-Ea-e])[\.\)]))\s*(.+)$/i);
      const ansMatch = line.match(/^(?:Answer|Correct Answer|Ans)[:\s]+(?:\()?([A-Ea-e]|[^\n\r]+)(?:\))?/i);
      const expMatch = line.match(/^(?:Explanation|Solution|Rationale)[:\s]+(.+)$/i);
      const marksMatch = line.match(/^(?:Marks|Points|Score)[:\s]+(\d+)/i);
      const typeMatch = line.match(/^(?:Type|Format)[:\s]+([A-Z_]+)/i);

      if (ansMatch) {
        detectedAnswer = ansMatch[1].trim();
        isParsingOptions = false;
      } else if (expMatch) {
        detectedExplanation = expMatch[1].trim();
        isParsingOptions = false;
      } else if (marksMatch) {
        detectedMarks = parseInt(marksMatch[1], 10);
      } else if (typeMatch) {
        detectedType = typeMatch[1].toUpperCase() as QuestionType;
      } else if (optMatch) {
        isParsingOptions = true;
        options.push(optMatch[3].trim());
      } else if (isParsingOptions && options.length > 0) {
        // Multi-line option continuation
        options[options.length - 1] += " " + line;
      } else {
        promptLines.push(line);
      }
    }

    let questionPrompt = promptLines.join(" ").replace(/^(?:Question\s*\d+[:.]|Q\s*\d+[:.]|\d+[\.)])\s*/i, "").trim();
    if (!questionPrompt && options.length > 0) {
      questionPrompt = `Question ${idx + 1}`;
    }
    if (!questionPrompt) return;

    let correct_answer: string | string[] = "";
    if (detectedAnswer) {
      const upper = detectedAnswer.toUpperCase();
      if (upper === "A" && options[0]) correct_answer = options[0];
      else if (upper === "B" && options[1]) correct_answer = options[1];
      else if (upper === "C" && options[2]) correct_answer = options[2];
      else if (upper === "D" && options[3]) correct_answer = options[3];
      else if (upper === "E" && options[4]) correct_answer = options[4];
      else {
        const found = options.find((o) => o.toLowerCase() === detectedAnswer.toLowerCase());
        correct_answer = found || detectedAnswer;
      }
    } else if (options.length > 0) {
      correct_answer = options[0];
      warnings.push(`Question ${idx + 1}: No explicit answer key found. Assigned option A as default.`);
    }

    const type: QuestionType = detectedType || (options.length >= 2 ? "SINGLE_CHOICE" : "SHORT_ANSWER");

    questions.push({
      id: `q_pdf_${Date.now()}_${idx + 1}`,
      question: questionPrompt,
      type,
      options: options.length > 0 ? options : undefined,
      correct_answer: correct_answer || "Descriptive answer key",
      explanation: detectedExplanation || `Evaluated standard response for: ${questionPrompt.substring(0, 50)}`,
      marks: detectedMarks || 10,
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
 * 10 Accurate, Technically Verified Examination Questions
 * Covering Data Structures, Cloud Architecture, Databases, Networking, and Systems.
 */
export const VERIFIED_SAMPLE_QUESTIONS = [
  {
    question: "Which data structure operates strictly on a First-In, First-Out (FIFO) principle?",
    type: "SINGLE_CHOICE" as QuestionType,
    options: ["Queue", "Stack", "Binary Search Tree", "Hash Map"],
    correct_answer: "Queue",
    marks: 10,
    negative_marks: 2.5,
    difficulty: "EASY" as QuestionDifficulty,
    explanation: "A Queue processes elements strictly in the order they were inserted (FIFO).",
    subject: "Data Structures & Algorithms",
    topic: "Linear Data Structures",
  },
  {
    question: "How do React Server Components (RSC) fundamentally differ from standard Client Components?",
    type: "SINGLE_CHOICE" as QuestionType,
    options: [
      "RSCs execute exclusively on the server, producing lightweight streamed HTML without shipping component JavaScript to the client bundle",
      "RSCs execute inside a browser Service Worker to cache offline network assets",
      "RSCs are strictly limited to rendering static images and cannot query databases",
      "RSCs re-render on every client mousemove event",
    ],
    correct_answer: "RSCs execute exclusively on the server, producing lightweight streamed HTML without shipping component JavaScript to the client bundle",
    marks: 10,
    negative_marks: 2.5,
    difficulty: "MEDIUM" as QuestionDifficulty,
    explanation: "RSCs keep sensitive data, direct database connections, and heavy dependencies on the server, streaming minimal zero-bundle HTML to client browsers.",
    subject: "Full-Stack Web Development",
    topic: "React Architecture",
  },
  {
    question: "In PostgreSQL, what is the primary architectural security benefit of Row-Level Security (RLS)?",
    type: "SINGLE_CHOICE" as QuestionType,
    options: [
      "RLS security policies are enforced at the database engine level, preventing cross-tenant data leakage even if application queries omit tenant filters",
      "RLS automatically compresses table indexes on disk",
      "RLS eliminates the requirement for primary keys and foreign keys",
      "RLS converts relational SQL tables into NoSQL document collections",
    ],
    correct_answer: "RLS security policies are enforced at the database engine level, preventing cross-tenant data leakage even if application queries omit tenant filters",
    marks: 10,
    negative_marks: 2.5,
    difficulty: "MEDIUM" as QuestionDifficulty,
    explanation: "RLS policies are enforced directly by the database engine for every query, ensuring strict tenant isolation by default.",
    subject: "Database Systems",
    topic: "PostgreSQL Security",
  },
  {
    question: "In HTTP/1.1 semantics, which of the following request methods are guaranteed to be idempotent?",
    type: "SINGLE_CHOICE" as QuestionType,
    options: [
      "GET, HEAD, PUT, and DELETE",
      "POST only",
      "POST and PATCH only",
      "None of the standard HTTP methods are idempotent",
    ],
    correct_answer: "GET, HEAD, PUT, and DELETE",
    marks: 10,
    negative_marks: 2.5,
    difficulty: "EASY" as QuestionDifficulty,
    explanation: "Making multiple identical GET, HEAD, PUT, or DELETE requests produces the exact same server state as a single request.",
    subject: "Full-Stack Web Development",
    topic: "HTTP Networking",
  },
  {
    question: "Under ANSI SQL standards, which transaction isolation level provides complete immunity against Dirty Reads, Non-Repeatable Reads, and Phantom Reads?",
    type: "SINGLE_CHOICE" as QuestionType,
    options: [
      "SERIALIZABLE",
      "REPEATABLE READ",
      "READ COMMITTED",
      "READ UNCOMMITTED",
    ],
    correct_answer: "SERIALIZABLE",
    marks: 10,
    negative_marks: 2.5,
    difficulty: "HARD" as QuestionDifficulty,
    explanation: "SERIALIZABLE execution simulates sequential transaction execution, providing complete isolation against Dirty, Non-Repeatable, and Phantom reads.",
    subject: "Database Systems",
    topic: "ACID Concurrency",
  },
  {
    question: "When verifying a JSON Web Token (JWT) signed with an asymmetric algorithm like RS256, which key must the verifying backend service use?",
    type: "SINGLE_CHOICE" as QuestionType,
    options: [
      "The Identity Provider's Public Key",
      "The Identity Provider's Private Key",
      "A symmetric shared secret password",
      "The client browser's TLS session cookie",
    ],
    correct_answer: "The Identity Provider's Public Key",
    marks: 10,
    negative_marks: 2.5,
    difficulty: "MEDIUM" as QuestionDifficulty,
    explanation: "Asymmetric signing uses the Private Key to create signatures (held by the auth issuer) and the Public Key to mathematically verify signatures.",
    subject: "Cybersecurity & Cloud Systems",
    topic: "Token Authentication",
  },
  {
    question: "In Node.js and modern browser runtimes, what is the execution priority between Microtasks and Macrotasks?",
    type: "SINGLE_CHOICE" as QuestionType,
    options: [
      "All Microtasks in the microtask queue are drained before the event loop advances to the next Macrotask",
      "Macrotasks always execute before any queued Microtasks",
      "Microtasks and Macrotasks run concurrently across multiple OS threads",
      "Microtasks execute only when the browser window loses focus",
    ],
    correct_answer: "All Microtasks in the microtask queue are drained before the event loop advances to the next Macrotask",
    marks: 10,
    negative_marks: 2.5,
    difficulty: "MEDIUM" as QuestionDifficulty,
    explanation: "The event loop drains the entire microtask queue (Promise callbacks, process.nextTick, queueMicrotask) immediately after the current call stack clears and before processing the next macrotask.",
    subject: "Computer Science",
    topic: "Event Loop Architecture",
  },
  {
    question: "Why do Docker containers start in milliseconds with minimal memory overhead compared to traditional Type-2 Hypervisor Virtual Machines?",
    type: "SINGLE_CHOICE" as QuestionType,
    options: [
      "Containers share the host operating system kernel and isolate user space using cgroups/namespaces, whereas VMs emulate virtual hardware and boot a full guest OS",
      "Containers bypass the CPU and execute exclusively on GPU Tensor cores",
      "Containers compile application source code directly to hardware microcode",
      "Containers disable all filesystem write permissions",
    ],
    correct_answer: "Containers share the host operating system kernel and isolate user space using cgroups/namespaces, whereas VMs emulate virtual hardware and boot a full guest OS",
    marks: 10,
    negative_marks: 2.5,
    difficulty: "EASY" as QuestionDifficulty,
    explanation: "Containers are lightweight processes sharing the host Linux kernel through namespaces and cgroups, avoiding the guest OS initialization overhead of virtual machines.",
    subject: "DevOps & Cloud Infrastructure",
    topic: "Containerization",
  },
  {
    question: "In the Cache-Aside (Lazy Loading) caching pattern, how does the application handle a cache miss?",
    type: "SINGLE_CHOICE" as QuestionType,
    options: [
      "The application queries the primary database, populates the retrieved data into the cache, and returns it to the client",
      "The application returns a 404 Not Found error response immediately",
      "The cache engine automatically triggers a database query via native database extensions",
      "The application blocks all incoming HTTP requests until a cache warmup script finishes",
    ],
    correct_answer: "The application queries the primary database, populates the retrieved data into the cache, and returns it to the client",
    marks: 10,
    negative_marks: 2.5,
    difficulty: "MEDIUM" as QuestionDifficulty,
    explanation: "Under Cache-Aside, the application first inspects the cache; upon a miss, it queries the database, writes the result into the cache with a TTL, and serves the caller.",
    subject: "Enterprise Architecture",
    topic: "Distributed Caching",
  },
  {
    question: "Why is a B-Tree index preferred over a Hash index for database columns frequently queried with range operators (e.g., BETWEEN, <, >)?",
    type: "SINGLE_CHOICE" as QuestionType,
    options: [
      "B-Tree keeps index keys in sorted order with doubly linked leaf nodes for rapid range scans, whereas Hash index only supports O(1) equality lookups",
      "Hash indexes cannot store integers or timestamps",
      "B-Tree indexes do not consume disk storage",
      "Hash indexes require distributed 2-phase commit protocols for every query",
    ],
    correct_answer: "B-Tree keeps index keys in sorted order with doubly linked leaf nodes for rapid range scans, whereas Hash index only supports O(1) equality lookups",
    marks: 10,
    negative_marks: 2.5,
    difficulty: "MEDIUM" as QuestionDifficulty,
    explanation: "B-Tree leaf nodes form a sorted doubly linked list allowing efficient range scans, whereas hash functions distribute keys randomly across buckets, making range queries impossible.",
    subject: "Database Systems",
    topic: "Index Optimization",
  },
];

/**
 * Generates an official Excel template buffer (.xlsx) for educators and administrators.
 */
export function generateSampleExcelBuffer(): Buffer {
  const wb = XLSX.utils.book_new();

  const sampleData = VERIFIED_SAMPLE_QUESTIONS.map((q) => ({
    "Question": q.question,
    "Type": q.type,
    "Option A": q.options[0] || "",
    "Option B": q.options[1] || "",
    "Option C": q.options[2] || "",
    "Option D": q.options[3] || "",
    "Correct Answer": "A", // Option A is the verified correct answer in this normalized template
    "Marks": q.marks,
    "Negative Marks": q.negative_marks,
    "Difficulty": q.difficulty,
    "Explanation": q.explanation,
    "Subject": q.subject,
    "Topic": q.topic,
  }));

  const ws = XLSX.utils.json_to_sheet(sampleData);

  // Set column widths for readability
  ws["!cols"] = [
    { wch: 55 }, // Question
    { wch: 18 }, // Type
    { wch: 45 }, // Option A
    { wch: 35 }, // Option B
    { wch: 35 }, // Option C
    { wch: 35 }, // Option D
    { wch: 16 }, // Correct Answer
    { wch: 8 },  // Marks
    { wch: 14 }, // Negative Marks
    { wch: 12 }, // Difficulty
    { wch: 55 }, // Explanation
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

  const escapeCsv = (str: string | number) => `"${String(str).replace(/"/g, '""')}"`;

  const rows = VERIFIED_SAMPLE_QUESTIONS.map((q) => [
    escapeCsv(q.question),
    q.type,
    escapeCsv(q.options[0] || ""),
    escapeCsv(q.options[1] || ""),
    escapeCsv(q.options[2] || ""),
    escapeCsv(q.options[3] || ""),
    '"A"',
    q.marks,
    q.negative_marks,
    q.difficulty,
    escapeCsv(q.explanation),
    escapeCsv(q.subject),
    escapeCsv(q.topic),
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

/**
 * Generates sample JSON schema string.
 */
export function generateSampleJsonString(): string {
  const sample = {
    title: "Akash Technolabs - Technical Engineering Practicum Examination",
    subject: "Computer Science & Engineering",
    description: "Official comprehensive technical examination covering full-stack architecture, algorithms, and databases.",
    duration_minutes: 30,
    passing_threshold: 70,
    attempt_limit: 2,
    questions: VERIFIED_SAMPLE_QUESTIONS.map((q, idx) => ({
      id: `q_sample_${idx + 1}`,
      question: q.question,
      type: q.type,
      options: q.options,
      correct_answer: q.correct_answer,
      marks: q.marks,
      negative_marks: q.negative_marks,
      difficulty: q.difficulty,
      explanation: q.explanation,
      subject: q.subject,
      topic: q.topic,
    })),
  };

  return JSON.stringify(sample, null, 2);
}

/**
 * Generates an official sample PDF buffer (.pdf) with verified questions and answers.
 */
export async function generateSamplePdfBuffer(): Promise<Buffer> {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const doc = await PDFDocument.create();
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  let page = doc.addPage([595.28, 841.89]); // A4 portrait
  let y = 800;

  const checkPage = (neededSpace: number = 60) => {
    if (y < neededSpace) {
      page = doc.addPage([595.28, 841.89]);
      y = 800;
    }
  };

  // Header Banner
  page.drawText("Akash Technolabs - Technical Engineering Practicum Examination", {
    x: 50,
    y,
    size: 15,
    font: fontBold,
    color: rgb(0.12, 0.16, 0.45),
  });
  y -= 18;

  page.drawText("Standard Examination Document | Duration: 30 Mins | Passing: 70% | Total Marks: 100", {
    x: 50,
    y,
    size: 9.5,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.4),
  });
  y -= 25;

  const letterLabels = ["A", "B", "C", "D"];

  VERIFIED_SAMPLE_QUESTIONS.forEach((q, idx) => {
    checkPage(130);

    // Question Number & Text
    page.drawText(`${idx + 1}. ${q.question}`, {
      x: 50,
      y,
      size: 9.5,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.15),
    });
    y -= 15;

    // Options
    q.options.forEach((opt, optIdx) => {
      checkPage(30);
      const label = letterLabels[optIdx] || "A";
      page.drawText(`${label}. ${opt}`, {
        x: 65,
        y,
        size: 8.5,
        font: fontRegular,
        color: rgb(0.2, 0.2, 0.2),
      });
      y -= 13;
    });

    // Answer
    checkPage(35);
    page.drawText(`Answer: A`, {
      x: 65,
      y,
      size: 8.5,
      font: fontBold,
      color: rgb(0.05, 0.5, 0.2),
    });
    y -= 12;

    // Explanation
    page.drawText(`Explanation: ${q.explanation}`, {
      x: 65,
      y,
      size: 7.5,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.4),
    });
    y -= 20;
  });

  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}
