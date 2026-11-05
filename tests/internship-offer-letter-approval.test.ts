import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { documentStore } from "../src/lib/documents/document-store";

describe("Internship Offer Letter Custom Track, Date Selection & Admin Approval Workflow", () => {
  let studentEmail = "";
  const studentName = "Akshat Nayak";

  beforeEach(() => {
    studentEmail = `student_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@akashtechnolabs.com`;
    documentStore.deleteDocumentsForStudent(studentEmail);
  });

  afterEach(() => {
    if (studentEmail) {
      documentStore.deleteDocumentsForStudent(studentEmail);
    }
  });

  it("creates a document with custom field, start date, end date in PENDING_APPROVAL status and generates full professional letter format", () => {
    const doc = documentStore.requestOneTimeInternshipLetter({
      studentEmail,
      studentName,
      salutation: "Mr.",
      technology: "PHP / Laravel Web Development",
      commencementDate: "3rd July 2026",
      continueUntilDate: "30th April 2027",
      immediateApproval: false,
    });

    expect(doc).toBeDefined();
    expect(doc.status).toBe("PENDING_APPROVAL");
    expect(doc.approval_status).toBe("PENDING");
    expect(doc.approved_by).toBe("");
    expect(doc.recipient_role).toBe("PHP / Laravel Web Development Intern");
    expect(doc.template_data.commencement_date).toBe("3rd July 2026");
    expect(doc.template_data.continue_until_date).toBe("30th April 2027");
    expect(doc.template_data.technology).toBe("PHP / Laravel Web Development");

    // Strictly verifies the full multi-paragraph corporate letter text is generated
    expect(doc.description_content).toBeDefined();
    expect(doc.description_content).toContain("This is to inform that Mr. Akshat Nayak has been selected for an internship");
    expect(doc.description_content).toContain("commence on 3rd July 2026 and continue until 30th April 2027");
    expect(doc.description_content).toContain("awarded an Internship Completion Certificate");
    expect(doc.description_content).toContain("enriching internship experience");

    // Strictly prevents premature preview/download by maintaining pending status
    const studentDocs = documentStore.getForStudent(studentEmail);
    expect(studentDocs.length).toBe(1);
    expect(studentDocs[0].status).toBe("PENDING_APPROVAL");
  });

  it("strictly enforces single-issuance policy preventing duplicate requests", () => {
    documentStore.requestOneTimeInternshipLetter({
      studentEmail,
      studentName,
      salutation: "Mr.",
      technology: "AI & Machine Learning Engineering",
      commencementDate: "1st August 2026",
      continueUntilDate: "30th April 2027",
      immediateApproval: false,
    });

    expect(() => {
      documentStore.requestOneTimeInternshipLetter({
        studentEmail,
        studentName,
        technology: "Full-Stack Web Development",
        immediateApproval: false,
      });
    }).toThrow(/Single-Issuance Policy/i);
  });

  it("allows Administrator to verify, adjust, and approve letter, unlocking it for student", () => {
    const requestedDoc = documentStore.requestOneTimeInternshipLetter({
      studentEmail,
      studentName,
      salutation: "Mr.",
      technology: "Full-Stack Web Development",
      commencementDate: "15th July 2026",
      continueUntilDate: "15th April 2027",
      immediateApproval: false,
    });

    expect(requestedDoc.status).toBe("PENDING_APPROVAL");

    // Admin verifies and approves
    const approvedDoc = documentStore.approveDocument(
      requestedDoc.id,
      "Akash Padhiyar",
      {
        technology: "Full Stack Web Development (Next.js & React)",
        commencementDate: "1st August 2026",
        continueUntilDate: "30th April 2027",
      }
    );

    expect(approvedDoc).not.toBeNull();
    expect(approvedDoc?.status).toBe("ISSUED");
    expect(approvedDoc?.approval_status).toBe("APPROVED");
    expect(approvedDoc?.approved_by).toBe("Akash Padhiyar");
    expect(approvedDoc?.approved_at).toBeDefined();
    expect(approvedDoc?.template_data.technology).toBe("Full Stack Web Development (Next.js & React)");
    expect(approvedDoc?.template_data.commencement_date).toBe("1st August 2026");
    expect(approvedDoc?.template_data.continue_until_date).toBe("30th April 2027");

    // Student now sees approved and issued status
    const studentDocs = documentStore.getForStudent(studentEmail);
    expect(studentDocs[0].status).toBe("ISSUED");
    expect(studentDocs[0].approval_status).toBe("APPROVED");
  });

  it("allows Administrator to reject/remove a pending document request", () => {
    const requestedDoc = documentStore.requestOneTimeInternshipLetter({
      studentEmail,
      studentName,
      salutation: "Mr.",
      technology: "Cloud Computing & DevOps",
      immediateApproval: false,
    });

    expect(documentStore.getById(requestedDoc.id)).not.toBeNull();

    const rejected = documentStore.rejectDocument(requestedDoc.id);
    expect(rejected).toBe(true);

    expect(documentStore.getById(requestedDoc.id)).toBeNull();
    expect(documentStore.getForStudent(studentEmail).length).toBe(0);
  });

  it("successfully updates or upserts official document without 404 or missing doc errors", () => {
    const adminEmail = "admin@akashtechnolabs.com";
    const docNumber = "ID-AKT-2026-INTR99";

    const updated = documentStore.updateDocument(docNumber, adminEmail, {
      studentName: "Helly Leuva",
      salutation: "Ms.",
      technology: "UI/UX Design",
      internshipPosition: "UI/UX Design Intern",
      commencementDate: "8th August 2026",
      continueUntilDate: "5th April 2027",
      recipientEmail: "hellyleuva.29@gmail.com",
      title: "INTERNSHIP OFFER LETTER",
      documentType: "OFFER_LETTER",
      status: "ISSUED",
      descriptionContent: "This is to inform that Ms. Helly Leuva has been selected for an internship at Akash Technolabs...",
    });

    expect(updated).not.toBeNull();
    expect(updated?.recipient_name).toBe("Ms. Helly Leuva");
    expect(updated?.recipient_role).toBe("UI/UX Design Intern");
    expect(updated?.status).toBe("ISSUED");
    expect(updated?.template_data.technology).toBe("UI/UX Design");

    // Can be retrieved immediately by document number or id
    const found = documentStore.getById(docNumber);
    expect(found).not.toBeNull();
    expect(found?.document_number).toBe(docNumber);
    expect(found?.recipient_email).toBe("hellyleuva.29@gmail.com");

    // Clean up
    documentStore.deleteDocumentsForStudent("hellyleuva.29@gmail.com");
  });
});

