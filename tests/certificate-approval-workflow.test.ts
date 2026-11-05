import { describe, it, expect, beforeEach } from "vitest";
import { documentStore } from "../src/lib/documents/document-store";

describe("Strict Admin Approval Gate for Certificates and Letters", () => {
  const studentEmail = `new.student.verify.${Date.now()}.${Math.random().toString(36).substring(7)}@akashtechnolabs.com`;
  const studentName = "Priya Sharma";

  beforeEach(() => {
    documentStore.deleteDocumentsForStudent(studentEmail);
  });

  it("newly registered student has zero approved documents initially", () => {
    const docs = documentStore.getForStudent(studentEmail);
    expect(docs).toHaveLength(0);

    const hasRequested = documentStore.hasStudentRequestedInternshipLetter(studentEmail);
    expect(hasRequested).toBe(false);

    const approvedCert = docs.find(
      (d) => d.document_type === "COMPLETION_CERTIFICATE" && (d.status === "ISSUED" || d.approval_status === "APPROVED")
    );
    expect(approvedCert).toBeUndefined();
  });

  it("submitting a request places the document in PENDING_APPROVAL and blocks download", () => {
    const requestedOffer = documentStore.requestOneTimeInternshipLetter({
      studentEmail,
      studentName,
      documentType: "OFFER_LETTER",
      technology: "AI & Machine Learning Engineering",
      salutation: "Ms.",
      commencementDate: "1st December 2026",
      continueUntilDate: "30th May 2027",
      immediateApproval: false,
    });

    expect(requestedOffer).toBeDefined();
    expect(requestedOffer.status).toBe("PENDING_APPROVAL");
    expect(requestedOffer.approval_status).toBe("PENDING");
    expect(requestedOffer.approved_by).toBe("");
    expect(requestedOffer.template_data.validity).toBe("Pending Verification & Release");

    // Student documents list shows the pending document, but it is NOT issued
    const studentDocs = documentStore.getForStudent(studentEmail);
    expect(studentDocs).toHaveLength(1);
    expect(studentDocs[0].status).toBe("PENDING_APPROVAL");

    const approvedDocs = studentDocs.filter((d) => d.status === "ISSUED" || d.approval_status === "APPROVED");
    expect(approvedDocs).toHaveLength(0);
  });

  it("submitting a completion certificate request requires admin approval before unlocking", () => {
    const certRequest = documentStore.requestOneTimeInternshipLetter({
      studentEmail,
      studentName,
      documentType: "COMPLETION_CERTIFICATE",
      technology: "Full-Stack Web Development",
      salutation: "Ms.",
      commencementDate: "1st June 2026",
      continueUntilDate: "30th November 2026",
      immediateApproval: false,
    });

    expect(certRequest.document_type).toBe("COMPLETION_CERTIFICATE");
    expect(certRequest.status).toBe("PENDING_APPROVAL");
    expect(certRequest.approval_status).toBe("PENDING");

    // Live certificate preview query:
    const docs = documentStore.getForStudent(studentEmail);
    const activeCert = docs.find(
      (d) => d.document_type === "COMPLETION_CERTIFICATE" && (d.status === "ISSUED" || d.approval_status === "APPROVED")
    );
    expect(activeCert).toBeUndefined(); // Certificate remains locked!

    // Admin verifies and approves the certificate
    const approvedCert = documentStore.approveDocument(certRequest.id, "Akash Padhiyar", {
      technology: "Full-Stack Web Development",
      commencementDate: "1st June 2026",
      continueUntilDate: "30th November 2026",
    });

    expect(approvedCert).not.toBeNull();
    expect(approvedCert?.status).toBe("ISSUED");
    expect(approvedCert?.approval_status).toBe("APPROVED");
    expect(approvedCert?.approved_by).toBe("Akash Padhiyar");
    expect(approvedCert?.template_data.validity).toBe("Active / Verified Credential");

    // Now the student documents query resolves the active certificate!
    const refreshedDocs = documentStore.getForStudent(studentEmail);
    const unlockedCert = refreshedDocs.find(
      (d) => d.document_type === "COMPLETION_CERTIFICATE" && (d.status === "ISSUED" || d.approval_status === "APPROVED")
    );
    expect(unlockedCert).toBeDefined();
    expect(unlockedCert?.document_number).toBe(certRequest.document_number);
  });
});
