import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";
import {
  parseExcelOrCsvBuffer,
  parseQuestionsFromText,
  parseJsonExamContent,
  generateSampleExcelBuffer,
  generateSampleCsvString,
  generateSampleJsonString,
  generateSamplePdfBuffer,
  VERIFIED_SAMPLE_QUESTIONS,
} from "../src/lib/assessments/exam-file-parser";

describe("Exam File Parser & Drag-and-Drop Creation Engine", () => {
  it("generates and parses a valid Excel (.xlsx) exam workbook with 10 verified questions", () => {
    const excelBuffer = generateSampleExcelBuffer();
    expect(excelBuffer).toBeInstanceOf(Buffer);
    expect(excelBuffer.length).toBeGreaterThan(100);

    const result = parseExcelOrCsvBuffer(excelBuffer, "Data_Structures_Exam.xlsx");
    expect(result.success).toBe(true);
    expect(result.questions.length).toBe(10);
    expect(result.summary.totalMarks).toBe(100);

    // Verify first question (Queue FIFO)
    const q1 = result.questions[0];
    expect(q1.type).toBe("SINGLE_CHOICE");
    expect(q1.options).toContain("Queue");
    expect(q1.correct_answer).toBe("Queue"); // "A" was mapped to Option A ("Queue")

    // Verify question 2 (React Server Components)
    const q2 = result.questions[1];
    expect(q2.type).toBe("SINGLE_CHOICE");
    expect(q2.correct_answer).toContain("RSCs execute exclusively on the server");
  });

  it("parses CSV content with intelligent column normalization for all 10 questions", () => {
    const csvContent = generateSampleCsvString();
    const buffer = Buffer.from(csvContent, "utf-8");

    const result = parseExcelOrCsvBuffer(buffer, "sample-exam.csv");
    expect(result.success).toBe(true);
    expect(result.questions.length).toBe(10);
    expect(result.summary.totalMarks).toBe(100);

    const q3 = result.questions[2];
    expect(q3.question).toContain("Row-Level Security");
    expect(q3.correct_answer).toContain("database engine level");
  });

  it("generates and parses binary PDF question paper extracting all questions", async () => {
    const pdfBuffer = await generateSamplePdfBuffer();
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(500);

    // Extract text from PDF buffer using pdf-parse class or function
    const pdfModule: any = await import("pdf-parse");
    let pdfText = "";
    if (pdfModule?.PDFParse || pdfModule?.default?.PDFParse) {
      const ParserClass = pdfModule.PDFParse || pdfModule.default.PDFParse;
      const parser = new ParserClass({ data: pdfBuffer });
      const res = await parser.getText();
      pdfText = typeof res === "string" ? res : res.text;
      await parser.destroy().catch(() => {});
    } else {
      const pdfFunc = typeof pdfModule === "function" ? pdfModule : (pdfModule.default || pdfModule);
      const res = await pdfFunc(pdfBuffer);
      pdfText = res.text;
    }

    expect(pdfText).toContain("Akash Technolabs");
    const result = parseQuestionsFromText(pdfText, "Technical_Exam.pdf");
    expect(result.success).toBe(true);
    expect(result.questions.length).toBe(10);

    const q1 = result.questions[0];
    expect(q1.options).toHaveLength(4);
    expect(q1.correct_answer).toBe("Queue");

    const q4 = result.questions[3];
    expect(q4.question).toContain("idempotent");
    expect(q4.correct_answer).toContain("GET, HEAD, PUT, and DELETE");
  });

  it("parses JSON exam schema with metadata and questions", () => {
    const jsonStr = generateSampleJsonString();
    const result = parseJsonExamContent(jsonStr);

    expect(result.success).toBe(true);
    expect(result.metadata.title).toContain("Akash Technolabs");
    expect(result.questions.length).toBe(10);
    expect(result.questions[0].type).toBe("SINGLE_CHOICE");
    expect(result.questions[0].correct_answer).toBe("Queue");
  });

  it("loads and validates all pre-generated sample exam files from disk", () => {
    const sampleDir = path.join(process.cwd(), "sample-exams");

    // Excel
    const xlsxPath = path.join(sampleDir, "sample-technical-exam.xlsx");
    expect(fs.existsSync(xlsxPath)).toBe(true);
    const xlsxBuf = fs.readFileSync(xlsxPath);
    const xlsxRes = parseExcelOrCsvBuffer(xlsxBuf, "sample-technical-exam.xlsx");
    expect(xlsxRes.success).toBe(true);
    expect(xlsxRes.questions.length).toBe(10);

    // CSV
    const csvPath = path.join(sampleDir, "sample-technical-exam.csv");
    expect(fs.existsSync(csvPath)).toBe(true);
    const csvBuf = fs.readFileSync(csvPath);
    const csvRes = parseExcelOrCsvBuffer(csvBuf, "sample-technical-exam.csv");
    expect(csvRes.success).toBe(true);
    expect(csvRes.questions.length).toBe(10);

    // JSON
    const jsonPath = path.join(sampleDir, "sample-technical-exam.json");
    expect(fs.existsSync(jsonPath)).toBe(true);
    const jsonStr = fs.readFileSync(jsonPath, "utf-8");
    const jsonRes = parseJsonExamContent(jsonStr);
    expect(jsonRes.success).toBe(true);
    expect(jsonRes.questions.length).toBe(10);

    // PDF
    const pdfPath = path.join(sampleDir, "sample-technical-exam.pdf");
    expect(fs.existsSync(pdfPath)).toBe(true);
    const pdfBuf = fs.readFileSync(pdfPath);
    expect(pdfBuf.length).toBeGreaterThan(1000);
  });

  it("handles spreadsheets with metadata banner rows and custom column names", () => {
    const customData = [
      ["Akash Technolabs - Examination Paper 2026", "", "", "", "", "", ""],
      ["Instructions: Answer all questions carefully.", "", "", "", "", "", ""],
      ["Q. No.", "Problem Prompt", "Choice A", "Choice B", "Choice C", "Choice D", "Answer Key"],
      [1, "What does HTML stand for?", "HyperText Markup Language", "High Tech Modern Language", "Hyperlink Text Mode", "Home Tool Markup", "A"],
      [2, "Which language runs in browser?", "Java", "C", "Python", "JavaScript", "D"]
    ];

    const ws = XLSX.utils.aoa_to_sheet(customData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    const result = parseExcelOrCsvBuffer(buf, "custom-exam.xlsx");
    expect(result.success).toBe(true);
    expect(result.questions.length).toBe(2);
    expect(result.questions[0].question).toBe("What does HTML stand for?");
    expect(result.questions[0].correct_answer).toBe("HyperText Markup Language");
    expect(result.questions[1].question).toBe("Which language runs in browser?");
    expect(result.questions[1].correct_answer).toBe("JavaScript");
  });

  it("handles empty or corrupted files gracefully with clear error messages", () => {
    const emptyBuffer = Buffer.from("");
    const result = parseExcelOrCsvBuffer(emptyBuffer, "empty.xlsx");
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
