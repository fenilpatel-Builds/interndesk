import { describe, it, expect } from "vitest";
import {
  parseCandidateSpreadsheet,
  generateSampleCandidateSpreadsheet,
  interpolateCustomTemplate,
  generateBulkLettersZip,
  CandidateLetterRow,
  BulkGenerationOptions,
} from "../src/lib/documents/bulk-letter-engine";
import JSZip from "jszip";
import { documentStore } from "../src/lib/documents/document-store";

describe("Bulk Letter Generation & ZIP Packaging Suite", () => {
  it("should generate a sample spreadsheet and parse it accurately", () => {
    // 1. Generate sample workbook buffer
    const buffer = generateSampleCandidateSpreadsheet();
    expect(buffer).toBeInstanceOf(Uint8Array);
    expect(buffer.length).toBeGreaterThan(1000);

    // 2. Parse the workbook
    const candidates = parseCandidateSpreadsheet(buffer);
    expect(candidates).toBeInstanceOf(Array);
    expect(candidates.length).toBe(5);

    // Verify first candidate (Fenil Patel)
    const first = candidates[0];
    expect(first.studentName).toContain("Fenil Patel");
    expect(first.salutation).toBe("Mr.");
    expect(first.technology).toContain("AI & Machine Learning");
    expect(first.commencementDate).toBe("01-06-2026");
    expect(first.continueUntilDate).toBe("30-11-2026");

    // Verify second candidate (Priya Sharma - female detection)
    const second = candidates[1];
    expect(second.studentName).toContain("Priya Sharma");
    expect(second.salutation).toBe("Ms.");
    expect(second.technology).toContain("Full Stack");
  });

  it("should interpolate custom template placeholder tags with candidate fields", () => {
    const candidate: CandidateLetterRow = {
      id: "cand_test_01",
      studentName: "Fenil Patel",
      salutation: "Mr.",
      recipientEmail: "fenil.patel@akashtechnolabs.com",
      internshipPosition: "AI Engineering Intern",
      technology: "AI & Machine Learning",
      commencementDate: "1st June 2026",
      continueUntilDate: "30th November 2026",
      college: "Gujarat Technological University",
      university: "GTU",
    };

    const options: BulkGenerationOptions = {
      templateKey: "INTERNSHIP_OFFER",
      letterDate: "25-11-2026",
      signatoryName: "Prof. Akash Padhiyar",
      signatoryRole: "Managing Director & CEO",
    };

    const templateText =
      "Dear {{student_name}},\n\nWe are pleased to offer you the position of {{position}} in {{technology}} at Akash Technolabs from {{start_date}} to {{end_date}}. Representing {{college}}.\n\nSincerely,\n{{signatory_name}}, {{signatory_role}}";

    const interpolated = interpolateCustomTemplate(templateText, candidate, options);

    expect(interpolated).toContain("Dear Mr. Fenil Patel,");
    expect(interpolated).toContain("position of AI Engineering Intern in AI & Machine Learning");
    expect(interpolated).toContain("from 1st June 2026 to 30th November 2026.");
    expect(interpolated).toContain("Representing Gujarat Technological University.");
    expect(interpolated).toContain("Prof. Akash Padhiyar, Managing Director & CEO");
  });

  it("should generate authentic PDFs and package them into a valid ZIP archive", async () => {
    const candidates: CandidateLetterRow[] = [
      {
        id: "cand_1",
        studentName: "Fenil Patel",
        salutation: "Mr.",
        internshipPosition: "AI Intern",
        technology: "AI/ML",
        commencementDate: "01-06-2026",
        continueUntilDate: "30-11-2026",
      },
      {
        id: "cand_2",
        studentName: "Priya Sharma",
        salutation: "Ms.",
        internshipPosition: "Web Developer Intern",
        technology: "Full Stack Web Development",
        commencementDate: "01-06-2026",
        continueUntilDate: "30-11-2026",
      },
    ];

    const options: BulkGenerationOptions = {
      templateKey: "INTERNSHIP_OFFER",
      letterDate: "25-11-2026",
      signatoryName: "Akash Padhiyar",
      signatoryRole: "CEO",
    };

    let progressCount = 0;
    const result = await generateBulkLettersZip(candidates, options, (p) => {
      progressCount = p.current;
    });

    expect(result.totalGenerated).toBe(2);
    expect(result.zipBlob).toBeDefined();
    expect(result.zipFilename).toContain("Akash_Letters_Batch_");
    expect(result.results.length).toBe(2);
    expect(progressCount).toBe(2);

    // Read and verify zip structure with JSZip
    const arrayBuffer = await result.zipBlob.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    const filenames = Object.keys(zip.files);

    expect(filenames.length).toBe(2);
    expect(filenames.some((f) => f.includes("Fenil_Patel"))).toBe(true);
    expect(filenames.some((f) => f.includes("Priya_Sharma"))).toBe(true);

    // Verify first PDF content header (starts with %PDF)
    const firstPdfBuffer = await zip.files[filenames[0]].async("uint8array");
    const pdfHeader = String.fromCharCode(...firstPdfBuffer.slice(0, 4));
    expect(pdfHeader).toBe("%PDF");
  });

  it("should register batch generated documents into documentStore registry", () => {
    const adminEmail = "admin@akashtechnolabs.com";
    const initialCount = documentStore.getAll().length;

    const doc1 = documentStore.createOfferLetter(adminEmail, {
      templateType: "INTERNSHIP OFFER LETTER (Boy)",
      documentType: "OFFER_LETTER",
      letterDate: "25-11-2026",
      salutation: "Mr.",
      studentName: "Bulk Test Candidate Alpha",
      internshipPosition: "Software Intern",
      commencementDate: "01-06-2026",
      continueUntilDate: "30-11-2026",
      technology: "AI/ML",
    });

    const doc2 = documentStore.createOfferLetter(adminEmail, {
      templateType: "INTERNSHIP OFFER LETTER (Girl)",
      documentType: "OFFER_LETTER",
      letterDate: "25-11-2026",
      salutation: "Ms.",
      studentName: "Bulk Test Candidate Beta",
      internshipPosition: "Design Intern",
      commencementDate: "01-06-2026",
      continueUntilDate: "30-11-2026",
      technology: "UI/UX",
    });

    expect(doc1.id).toBeDefined();
    expect(doc2.id).toBeDefined();

    const afterDocs = documentStore.getAll();
    expect(afterDocs.length).toBeGreaterThanOrEqual(initialCount + 2);
    expect(afterDocs.some((d) => d.recipient_name.includes("Bulk Test Candidate Alpha"))).toBe(true);
    expect(afterDocs.some((d) => d.recipient_name.includes("Bulk Test Candidate Beta"))).toBe(true);
  });

  it("should ensure all documents in documentStore have rich multi-paragraph descriptions", () => {
    const allDocs = documentStore.getAll();
    expect(allDocs.length).toBeGreaterThan(0);

    for (const d of allDocs) {
      if (d.title.includes("EXPERIENCE") || d.document_type === "EXPERIENCE_LETTER") {
        expect(d.description_content).toBeDefined();
        expect(d.description_content!.length).toBeGreaterThan(200);
        expect(d.description_content).toContain("TO WHOMSOEVER IT MAY CONCERN");
        expect(d.description_content).toContain("Akash Technolabs");
        expect(d.description_content).toContain("practical experience");
        expect(d.description_content).not.toContain("completed an internship...");
      }
    }
  });
});
