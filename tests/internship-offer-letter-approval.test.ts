import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { documentStore } from "../src/lib/documents/document-store";

describe("Internship Offer Letter Custom Track, Date Selection & Admin Approval Workflow", () => {
  const studentEmail = `student_${Date.now()}_approval@akashtechnolabs.com`;
  const studentName = "Akshat Nayak";

  beforeEach(() => {
    documentStore.deleteDocumentsForStudent(studentEmail);
  });

  afterEach(() => {
    documentStore.deleteDocumentsForStudent(studentEmail);
  });

  it("creates a document with custom field, start date, end date in PENDING_APPROVAL status", () => {
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
});

