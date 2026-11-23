import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { safeParseSession } from "@/lib/auth/session-token";
import { isUserAdmin } from "@/lib/auth/admin-whitelist";
import { assessmentStore } from "@/lib/assessments/assessment-store";
import { questionBankStore } from "@/lib/assessments/question-bank-store";
import {
  parseExcelOrCsvBuffer,
  parseQuestionsFromText,
  parseJsonExamContent,
  generateSampleExcelBuffer,
  generateSampleCsvString,
  generateSampleJsonString,
  ParsedExamFileResult,
} from "@/lib/assessments/exam-file-parser";

// Dynamic import for pdf-parse to avoid cold-start overhead when not used
async function extractTextFromPdfBuffer(buffer: Buffer): Promise<string> {
  try {
    const pdfModule: any = await import("pdf-parse");
    const pdf = typeof pdfModule === "function" ? pdfModule : (pdfModule.default || pdfModule);
    const data = await pdf(buffer);
    return data.text || "";
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "PDF extraction failed";
    throw new Error(`Failed to extract text from PDF: ${message}`);
  }
}

async function verifyAdminAuth(req: NextRequest) {
  const cookieStore = await cookies();
  const token =
    req.cookies.get("interndesk_user")?.value ||
    req.cookies.get("akash_user")?.value ||
    cookieStore.get("interndesk_user")?.value ||
    cookieStore.get("akash_user")?.value;

  const session = safeParseSession(token);
  const headerEmail = req.headers.get("x-user-email");
  const adminEmail = session?.email || headerEmail;

  const roleStr = String(session?.role || "");
  const isAdmin =
    isUserAdmin(adminEmail) ||
    roleStr === "ORG_ADMIN" ||
    roleStr === "SUPER_ADMIN" ||
    roleStr === "ADMIN";

  if (!adminEmail || !isAdmin) {
    return { isAuthorized: false, adminEmail: null };
  }
  return { isAuthorized: true, adminEmail };
}

/**
 * GET: Download sample templates in Excel, CSV, or JSON format.
 */
export async function GET(req: NextRequest) {
  const format = (req.nextUrl.searchParams.get("format") || "excel").toLowerCase();

  if (format === "csv") {
    const csvContent = generateSampleCsvString();
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="akash-technolabs-exam-template.csv"',
      },
    });
  }

  if (format === "json") {
    const jsonContent = generateSampleJsonString();
    return new NextResponse(jsonContent, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": 'attachment; filename="akash-technolabs-exam-template.json"',
      },
    });
  }

  // Default: Excel (.xlsx)
  const excelBuffer = generateSampleExcelBuffer();
  return new NextResponse(new Uint8Array(excelBuffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="akash-technolabs-exam-template.xlsx"',
    },
  });
}

/**
 * POST: Upload and process an Excel, CSV, PDF, or JSON file.
 * Handles drag-and-drop file imports for creating examinations or populating the Question Bank.
 */
export async function POST(req: NextRequest) {
  try {
    const { isAuthorized } = await verifyAdminAuth(req);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Access Denied: Admin authorization required." }, { status: 403 });
    }

    const contentType = req.headers.get("content-type") || "";

    let fileName = "";
    let fileBuffer: Buffer | null = null;
    let textContent = "";
    let action = "PREVIEW"; // "PREVIEW" | "CREATE_EXAM" | "IMPORT_QUESTION_BANK"
    let overrideMetadata: any = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      action = (formData.get("action") as string) || "PREVIEW";
      const metadataStr = formData.get("metadata") as string | null;
      if (metadataStr) {
        try {
          overrideMetadata = JSON.parse(metadataStr);
        } catch {}
      }

      if (!file) {
        return NextResponse.json({ error: "No file was uploaded." }, { status: 400 });
      }

      fileName = file.name || "uploaded_file";
      const arrayBuf = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuf);
    } else {
      // JSON body
      const body = await req.json();
      action = body.action || "PREVIEW";
      fileName = body.fileName || "uploaded_file.json";
      overrideMetadata = body.metadata || null;

      if (body.fileData) {
        // Base64 encoded file
        fileBuffer = Buffer.from(body.fileData, "base64");
      } else if (body.textContent) {
        textContent = body.textContent;
      } else if (body.json) {
        textContent = typeof body.json === "string" ? body.json : JSON.stringify(body.json);
      } else if (body.questions && Array.isArray(body.questions)) {
        // Direct questions array payload to save
        textContent = JSON.stringify(body);
      } else {
        return NextResponse.json({ error: "No fileData, textContent, or questions payload provided." }, { status: 400 });
      }
    }

    const ext = fileName.toLowerCase().split(".").pop() || "";
    let parseResult: ParsedExamFileResult;

    if (ext === "xlsx" || ext === "xls" || ext === "csv") {
      if (!fileBuffer && textContent) {
        fileBuffer = Buffer.from(textContent, "utf-8");
      }
      if (!fileBuffer) {
        return NextResponse.json({ error: "File data is empty." }, { status: 400 });
      }
      parseResult = parseExcelOrCsvBuffer(fileBuffer, fileName);
    } else if (ext === "pdf") {
      if (!fileBuffer) {
        return NextResponse.json({ error: "PDF file data is empty." }, { status: 400 });
      }
      const extractedText = await extractTextFromPdfBuffer(fileBuffer);
      parseResult = parseQuestionsFromText(extractedText, fileName.replace(/\.[^/.]+$/, ""));
    } else if (ext === "json") {
      const jsonStr = textContent || (fileBuffer ? fileBuffer.toString("utf-8") : "");
      parseResult = parseJsonExamContent(jsonStr);
    } else {
      // Fallback: check if text content or excel buffer
      if (fileBuffer) {
        try {
          parseResult = parseExcelOrCsvBuffer(fileBuffer, fileName);
        } catch {
          const str = fileBuffer.toString("utf-8");
          parseResult = parseQuestionsFromText(str, fileName);
        }
      } else {
        parseResult = parseQuestionsFromText(textContent, fileName);
      }
    }

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: parseResult.errors[0] || "Failed to extract questions from file.",
        errors: parseResult.errors,
        warnings: parseResult.warnings,
      }, { status: 422 });
    }

    // Apply any user override metadata
    if (overrideMetadata) {
      if (overrideMetadata.title) parseResult.metadata.title = overrideMetadata.title;
      if (overrideMetadata.subject) parseResult.metadata.subject = overrideMetadata.subject;
      if (overrideMetadata.description) parseResult.metadata.description = overrideMetadata.description;
      if (overrideMetadata.duration_minutes) parseResult.metadata.duration_minutes = Number(overrideMetadata.duration_minutes);
      if (overrideMetadata.passing_threshold) parseResult.metadata.passing_threshold = Number(overrideMetadata.passing_threshold);
      if (overrideMetadata.attempt_limit) parseResult.metadata.attempt_limit = Number(overrideMetadata.attempt_limit);
    }

    // Handle ACTION = "CREATE_EXAM"
    if (action === "CREATE_EXAM") {
      const { metadata, questions } = parseResult;
      const createdAssessment = assessmentStore.createAssessment({
        title: metadata.title,
        subject: metadata.subject,
        description: metadata.description,
        duration_minutes: metadata.duration_minutes,
        passing_threshold: metadata.passing_threshold,
        attempt_limit: metadata.attempt_limit,
        status: (overrideMetadata?.status as any) || "PUBLISHED",
        security_policy: {
          require_fullscreen: true,
          disable_copy_paste: true,
          max_violations_allowed: 3,
          auto_submit_on_violation_limit: true,
        },
        questions: questions.map((q) => ({
          ...q,
          topic: q.topic || metadata.subject,
        })),
      });

      return NextResponse.json({
        success: true,
        message: `Successfully created and published examination "${createdAssessment.title}" with ${questions.length} questions.`,
        assessment: createdAssessment,
        summary: parseResult.summary,
        warnings: parseResult.warnings,
      });
    }

    // Handle ACTION = "IMPORT_QUESTION_BANK"
    if (action === "IMPORT_QUESTION_BANK") {
      const bankFormatQuestions = parseResult.questions.map((q) => ({
        subject: parseResult.metadata.subject || "General Engineering",
        topic: q.topic || "Core Practicum",
        difficulty: q.difficulty || "MEDIUM",
        type: q.type,
        question: q.question,
        options: q.options || [],
        correct_answer: q.correct_answer || "",
        correct_answers: q.correct_answers,
        explanation: q.explanation || "Official answer key",
        marks: q.marks || 10,
        negative_marks: q.negative_marks || 0,
        tags: [parseResult.metadata.subject.toLowerCase(), q.type.toLowerCase()],
      }));

      const created = questionBankStore.importBulk(bankFormatQuestions);

      return NextResponse.json({
        success: true,
        message: `Successfully imported ${created.length} questions into Central Question Bank.`,
        createdCount: created.length,
        summary: parseResult.summary,
        warnings: parseResult.warnings,
      });
    }

    // Default: PREVIEW
    return NextResponse.json({
      success: true,
      fileName,
      metadata: parseResult.metadata,
      questions: parseResult.questions,
      summary: parseResult.summary,
      warnings: parseResult.warnings,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "File import operation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
