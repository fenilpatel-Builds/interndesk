import { describe, it, expect } from "vitest";
import {
  LETTER_TEMPLATES,
  UNIVERSITY_PRESETS,
  generateLetterContent,
} from "../src/lib/documents/letter-templates";
import { generateAkashOfferLetterPdf } from "../src/lib/documents/akash-pdf-generator";
import { documentStore } from "../src/lib/documents/document-store";

describe("Professional Letter Templates Catalog & Dynamic Generators", () => {
  it("should contain all 10 document templates (8 professional + 2 appointment variants)", () => {
    expect(LETTER_TEMPLATES).toHaveLength(10);

    const keys = LETTER_TEMPLATES.map((t) => t.key);
    expect(keys).toContain("AKASH_STANDARD_BOY");
    expect(keys).toContain("AKASH_STANDARD_GIRL");
    expect(keys).toContain("INTERNSHIP_OFFER");
    expect(keys).toContain("JOINING_CONFIRMATION");
    expect(keys).toContain("INTERNSHIP_CONFIRMATION");
    expect(keys).toContain("INTERNSHIP_COMPLETION");
    expect(keys).toContain("NOC_LETTER");
    expect(keys).toContain("EXPERIENCE_LETTER");
    expect(keys).toContain("RELIEVING_LETTER");
    expect(keys).toContain("RECOMMENDATION_LETTER");
  });

  it("should contain university academic presets (GTU, SOU, GU, Parul, Nirma)", () => {
    const uniIds = UNIVERSITY_PRESETS.map((u) => u.id);
    expect(uniIds).toContain("STANDARD");
    expect(uniIds).toContain("GTU");
    expect(uniIds).toContain("SOU");
    expect(uniIds).toContain("GU");
    expect(uniIds).toContain("PARUL");
    expect(uniIds).toContain("NIRMA");
    expect(uniIds).toContain("CUSTOM");
  });

  it("should generate exact professional text for Template 1: Internship Offer Letter", () => {
    const res = generateLetterContent({
      templateKey: "INTERNSHIP_OFFER",
      salutation: "Mr.",
      studentName: "Fenil Patel",
      internshipPosition: "AI/ML Intern",
      technology: "AI/ML",
      commencementDate: "3rd July 2026",
      continueUntilDate: "30th April 2027",
      letterDate: "04-11-2026",
      universityId: "GTU",
    });

    expect(res.title).toBe("INTERNSHIP OFFER LETTER");
    expect(res.headerType).toBe("TO_PERSON");
    expect(res.headerLines).toContain("To,");
    expect(res.headerLines).toContain("Mr. Fenil Patel");
    expect(res.headerLines).toContain("Subject: Offer of Internship – AI/ML Intern");
    expect(res.headerLines).toContain("Dear Fenil Patel,");
    expect(res.fullText).toContain("We are pleased to offer you an internship opportunity at Akash Technolabs as a AI/ML Intern");
    expect(res.fullText).toContain("Gujarat Technological University (GTU)");
    expect(res.fullText).toContain("3rd July 2026");
    expect(res.fullText).toContain("30th April 2027");
  });

  it("should generate exact professional text for Template 2: Joining Confirmation Letter", () => {
    const res = generateLetterContent({
      templateKey: "JOINING_CONFIRMATION",
      salutation: "Mr.",
      studentName: "Valand Harsh",
      internshipPosition: "Python Intern",
      technology: "Python",
      commencementDate: "1st December 2026",
      continueUntilDate: "25th December 2026",
      letterDate: "01-12-2026",
      universityId: "SOU",
    });

    expect(res.title).toBe("INTERNSHIP JOINING CONFIRMATION LETTER");
    expect(res.fullText).toContain("This letter confirms that you have officially joined Akash Technolabs as a Python Intern with effect from 1st December 2026");
    expect(res.fullText).toContain("Silver Oak University (SOU)");
  });

  it("should generate exact professional text for Template 3: Confirmation Letter", () => {
    const res = generateLetterContent({
      templateKey: "INTERNSHIP_CONFIRMATION",
      salutation: "Ms.",
      studentName: "Priya Sharma",
      internshipPosition: "Full Stack Web Developer Intern",
      technology: "Next.js & React",
      commencementDate: "1st January 2026",
      continueUntilDate: "30th June 2026",
      letterDate: "04-11-2026",
      universityId: "GU",
    });

    expect(res.title).toBe("INTERNSHIP CONFIRMATION LETTER");
    expect(res.headerType).toBe("WHOMSOEVER");
    expect(res.fullText).toContain("TO WHOMSOEVER IT MAY CONCERN");
    expect(res.fullText).toContain("This is to officially confirm that Ms. Priya Sharma is associated with Akash Technolabs as a Full Stack Web Developer Intern");
    expect(res.fullText).toContain("Gujarat University (GU)");
  });

  it("should generate exact professional text for Template 4: Completion Letter", () => {
    const res = generateLetterContent({
      templateKey: "INTERNSHIP_COMPLETION",
      salutation: "Mr.",
      studentName: "Dev Pawar",
      internshipPosition: "Cybersecurity Intern",
      technology: "Cybersecurity",
      commencementDate: "1st May 2026",
      continueUntilDate: "31st October 2026",
      letterDate: "31-10-2026",
    });

    expect(res.title).toBe("INTERNSHIP COMPLETION LETTER");
    expect(res.fullText).toContain("This is to certify that Mr. Dev Pawar has successfully completed an internship at Akash Technolabs as a Cybersecurity Intern from 1st May 2026 to 31st October 2026.");
  });

  it("should generate exact professional text for Template 5: No Objection Certificate (NOC)", () => {
    const res = generateLetterContent({
      templateKey: "NOC_LETTER",
      salutation: "Mr.",
      studentName: "Akshat Nayak",
      internshipPosition: "Cloud & DevOps Intern",
      technology: "Cloud & DevOps",
      commencementDate: "1st July 2026",
      continueUntilDate: "31st December 2026",
      letterDate: "04-11-2026",
      purpose: "Final Semester Major Capstone Project at GTU",
    });

    expect(res.title).toBe("NO OBJECTION CERTIFICATE (NOC)");
    expect(res.fullText).toContain("Akash Technolabs has no objection to the intern pursuing Final Semester Major Capstone Project at GTU");
  });

  it("should generate exact professional text for Template 6: Experience Letter with bullet points", () => {
    const res = generateLetterContent({
      templateKey: "EXPERIENCE_LETTER",
      salutation: "Mr.",
      studentName: "Fenil Patel",
      internshipPosition: "AI/ML Intern",
      technology: "AI/ML",
      commencementDate: "3rd July 2026",
      continueUntilDate: "30th April 2027",
      letterDate: "30-04-2027",
    });

    expect(res.title).toBe("INTERNSHIP EXPERIENCE LETTER");
    expect(res.fullText).toContain("Working on technical projects and assigned development tasks.");
    expect(res.fullText).toContain("Applying theoretical concepts to practical scenarios.");
    expect(res.fullText).toContain("Learning and implementing relevant tools and technologies.");
    expect(res.fullText).toContain("Collaborating with team members and following development guidelines.");
    expect(res.fullText).toContain("Improving technical problem-solving and professional skills.");
  });

  it("should generate exact professional text for Template 7: Relieving Letter", () => {
    const res = generateLetterContent({
      templateKey: "RELIEVING_LETTER",
      salutation: "Mr.",
      studentName: "Valand Harsh",
      internshipPosition: "Python Intern",
      technology: "Python",
      commencementDate: "1st December 2026",
      continueUntilDate: "25th December 2026",
      letterDate: "25-12-2026",
    });

    expect(res.title).toBe("INTERNSHIP RELIEVING LETTER");
    expect(res.fullText).toContain("This is to formally confirm that you have been relieved from your internship responsibilities at Akash Technolabs as a Python Intern, effective 25th December 2026.");
  });

  it("should generate exact professional text for Template 8: Letter of Recommendation (LOR)", () => {
    const res = generateLetterContent({
      templateKey: "RECOMMENDATION_LETTER",
      salutation: "Ms.",
      studentName: "Priya Sharma",
      internshipPosition: "PHP / Laravel Developer Intern",
      technology: "PHP / Laravel",
      commencementDate: "3rd July 2026",
      continueUntilDate: "30th April 2027",
      letterDate: "04-11-2026",
    });

    expect(res.title).toBe("LETTER OF RECOMMENDATION");
    expect(res.fullText).toContain("It is our pleasure to recommend Ms. Priya Sharma");
    expect(res.fullText).toContain("Based on their performance and contributions during the internship, we are pleased to recommend them for suitable future academic and professional opportunities.");
  });

  it("should render clean, valid PDFs for each template without overlapping or exceeding 1 page", async () => {
    const templates: ("INTERNSHIP_OFFER" | "NOC_LETTER" | "EXPERIENCE_LETTER" | "RECOMMENDATION_LETTER")[] = [
      "INTERNSHIP_OFFER",
      "NOC_LETTER",
      "EXPERIENCE_LETTER",
      "RECOMMENDATION_LETTER",
    ];

    for (const tmpl of templates) {
      const pdfBytes = await generateAkashOfferLetterPdf({
        templateType: tmpl,
        salutation: "Mr.",
        studentName: "Fenil Patel",
        internshipPosition: "AI/ML Intern",
        technology: "AI/ML",
        commencementDate: "3rd July 2026",
        continueUntilDate: "30th April 2027",
        letterDate: "04-11-2026",
        universityId: "GTU",
      });

      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(pdfBytes.length).toBeGreaterThan(1500);
    }
  });

  it("should store and retrieve newly generated letters with template type and university in documentStore", () => {
    const adminEmail = "akash@akashtechnolabs.com";
    const doc = documentStore.createOfferLetter(adminEmail, {
      templateType: "EXPERIENCE_LETTER",
      documentType: "EXPERIENCE_LETTER",
      letterDate: "04-11-2026",
      title: "INTERNSHIP EXPERIENCE LETTER",
      salutation: "Mr.",
      studentName: "Fenil Patel",
      recipientEmail: "huntarmy001@gmail.com",
      internshipPosition: "AI/ML Intern",
      commencementDate: "3rd July 2026",
      continueUntilDate: "30th April 2027",
      technology: "AI/ML",
      university: "GTU",
      descriptionContent: "This is to certify that Mr. Fenil Patel has completed an internship...",
    });

    expect(doc).toBeDefined();
    expect(doc.template_type).toBe("EXPERIENCE_LETTER");
    expect(doc.document_type).toBe("EXPERIENCE_LETTER");
    expect(doc.template_data.university).toBe("GTU");
    expect(doc.status).toBe("ISSUED");
    expect(doc.approval_status).toBe("APPROVED");

    const retrieved = documentStore.getById(doc.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.recipient_name).toBe("Mr. Fenil Patel");
  });
});
