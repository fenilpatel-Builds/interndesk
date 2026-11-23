import fs from "fs";
import path from "path";
import {
  generateSampleExcelBuffer,
  generateSampleCsvString,
  generateSampleJsonString,
  generateSamplePdfBuffer,
  parseExcelOrCsvBuffer,
  parseJsonExamContent,
  parseQuestionsFromText,
} from "../src/lib/assessments/exam-file-parser";

async function main() {
  console.log("Generating verified sample exam files...");

  const baseDirs = [
    path.join(process.cwd(), "sample-exams"),
    path.join(process.cwd(), "public", "sample-exams"),
  ];

  for (const dir of baseDirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // 1. Generate Excel (.xlsx)
  const excelBuffer = generateSampleExcelBuffer();
  for (const dir of baseDirs) {
    fs.writeFileSync(path.join(dir, "sample-technical-exam.xlsx"), excelBuffer);
  }
  console.log("✓ Generated sample-technical-exam.xlsx");

  // 2. Generate CSV (.csv)
  const csvString = generateSampleCsvString();
  for (const dir of baseDirs) {
    fs.writeFileSync(path.join(dir, "sample-technical-exam.csv"), csvString, "utf-8");
  }
  console.log("✓ Generated sample-technical-exam.csv");

  // 3. Generate JSON (.json)
  const jsonString = generateSampleJsonString();
  for (const dir of baseDirs) {
    fs.writeFileSync(path.join(dir, "sample-technical-exam.json"), jsonString, "utf-8");
  }
  console.log("✓ Generated sample-technical-exam.json");

  // 4. Generate PDF (.pdf)
  const pdfBuffer = await generateSamplePdfBuffer();
  for (const dir of baseDirs) {
    fs.writeFileSync(path.join(dir, "sample-technical-exam.pdf"), pdfBuffer);
  }
  console.log("✓ Generated sample-technical-exam.pdf");

  // VERIFICATION: Read and parse each file back
  console.log("\n--- VERIFYING FILE PARSING INTEGRITY ---");

  // Verify Excel
  const excelParseResult = parseExcelOrCsvBuffer(excelBuffer, "sample-technical-exam.xlsx");
  console.log(`Excel: ${excelParseResult.questions.length} questions parsed, success = ${excelParseResult.success}`);
  if (!excelParseResult.success || excelParseResult.questions.length !== 10) {
    throw new Error(`Excel verification failed: expected 10 questions, got ${excelParseResult.questions.length}`);
  }

  // Verify CSV
  const csvBuffer = Buffer.from(csvString, "utf-8");
  const csvParseResult = parseExcelOrCsvBuffer(csvBuffer, "sample-technical-exam.csv");
  console.log(`CSV: ${csvParseResult.questions.length} questions parsed, success = ${csvParseResult.success}`);
  if (!csvParseResult.success || csvParseResult.questions.length !== 10) {
    throw new Error(`CSV verification failed: expected 10 questions, got ${csvParseResult.questions.length}`);
  }

  // Verify JSON
  const jsonParseResult = parseJsonExamContent(jsonString);
  console.log(`JSON: ${jsonParseResult.questions.length} questions parsed, success = ${jsonParseResult.success}`);
  if (!jsonParseResult.success || jsonParseResult.questions.length !== 10) {
    throw new Error(`JSON verification failed: expected 10 questions, got ${jsonParseResult.questions.length}`);
  }

  // Verify PDF
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

  const pdfParseResult = parseQuestionsFromText(pdfText, "sample-technical-exam.pdf");
  console.log(`PDF: ${pdfParseResult.questions.length} questions parsed, success = ${pdfParseResult.success}`);
  if (!pdfParseResult.success || pdfParseResult.questions.length < 5) {
    throw new Error(`PDF verification failed: got ${pdfParseResult.questions.length} questions`);
  }

  console.log("\nALL 4 EXAM FORMATS (EXCEL, CSV, JSON, PDF) SUCCESSFULLY GENERATED AND VERIFIED!");
}

main().catch((err) => {
  console.error("Error generating sample exam files:", err);
  process.exit(1);
});
