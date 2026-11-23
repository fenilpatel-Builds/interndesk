import { describe, it, expect } from "vitest";
import * as XLSX from "xlsx";
import {
  parseExcelOrCsvBuffer,
  parseQuestionsFromText,
  parseJsonExamContent,
  generateSampleExcelBuffer,
  generateSampleCsvString,
  generateSampleJsonString,
} from "../src/lib/assessments/exam-file-parser";

describe("Exam File Parser & Drag-and-Drop Creation Engine", () => {
  it("generates and parses a valid Excel (.xlsx) exam workbook", () => {
    const excelBuffer = generateSampleExcelBuffer();
    expect(excelBuffer).toBeInstanceOf(Buffer);
    expect(excelBuffer.length).toBeGreaterThan(100);

    const result = parseExcelOrCsvBuffer(excelBuffer, "Data_Structures_Exam.xlsx");
    expect(result.success).toBe(true);
    expect(result.questions.length).toBeGreaterThanOrEqual(4);
    expect(result.summary.totalMarks).toBeGreaterThan(0);

    // Verify first question (Single Choice MCQ with option A as correct answer)
    const q1 = result.questions[0];
    expect(q1.type).toBe("SINGLE_CHOICE");
    expect(q1.options).toContain("Queue");
    expect(q1.correct_answer).toBe("Queue"); // "A" was mapped to Option A ("Queue")

    // Verify True/False question
    const q2 = result.questions[1];
    expect(q2.type).toBe("TRUE_FALSE");
    expect(q2.correct_answer).toBe("True");
  });

  it("parses CSV content with intelligent column normalization", () => {
    const csvContent = generateSampleCsvString();
    const buffer = Buffer.from(csvContent, "utf-8");

    const result = parseExcelOrCsvBuffer(buffer, "sample-exam.csv");
    expect(result.success).toBe(true);
    expect(result.questions.length).toBe(3);

    // Verify Multiple Choice mapping
    const q3 = result.questions[2];
    expect(q3.type).toBe("MULTIPLE_CHOICE");
    expect(Array.isArray(q3.correct_answer)).toBe(true);
    expect((q3.correct_answer as string[])).toContain("Dirty Reads");
  });

  it("parses structured text from PDF exam question sheets", () => {
    const samplePdfText = `
    Advanced Computer Networks Final Examination
    Duration: 60 Minutes

    1. What is the primary function of the Address Resolution Protocol (ARP)?
    (A) Resolving IP addresses to MAC hardware addresses
    (B) Encrypting transport layer TCP payloads
    (C) Assigning dynamic IP addresses automatically
    (D) Routing packets between autonomous systems
    Answer: A
    Explanation: ARP maps 32-bit IPv4 addresses to 48-bit Ethernet MAC addresses.

    2. Which protocol operates at the Transport Layer of the OSI model?
    (A) IP
    (B) TCP
    (C) HTTP
    (D) Ethernet
    Answer: B
    Explanation: TCP and UDP are standard Transport Layer protocols.
    `;

    const result = parseQuestionsFromText(samplePdfText, "Networks_Exam.pdf");
    expect(result.success).toBe(true);
    expect(result.questions.length).toBe(2);

    const q1 = result.questions[0];
    expect(q1.options).toHaveLength(4);
    expect(q1.correct_answer).toBe("Resolving IP addresses to MAC hardware addresses");

    const q2 = result.questions[1];
    expect(q2.options).toHaveLength(4);
    expect(q2.correct_answer).toBe("TCP");
  });

  it("parses JSON exam schema with metadata and questions", () => {
    const jsonStr = generateSampleJsonString();
    const result = parseJsonExamContent(jsonStr);

    expect(result.success).toBe(true);
    expect(result.metadata.title).toBe("Full-Stack Enterprise Certification Examination");
    expect(result.questions.length).toBe(2);
    expect(result.questions[0].type).toBe("SINGLE_CHOICE");
    expect(result.questions[1].type).toBe("MULTIPLE_CHOICE");
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
