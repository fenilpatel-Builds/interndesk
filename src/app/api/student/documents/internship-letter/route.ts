import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { safeParseSession } from "@/lib/auth/session-token";
import { documentStore } from "@/lib/documents/document-store";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token =
      req.cookies.get("interndesk_user")?.value ||
      req.cookies.get("akash_user")?.value ||
      cookieStore.get("interndesk_user")?.value ||
      cookieStore.get("akash_user")?.value;

    const session = safeParseSession(token);
    const searchParams = req.nextUrl.searchParams;
    const email = searchParams.get("email") || session?.email;

    if (!email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const hasRequested = documentStore.hasStudentRequestedInternshipLetter(email);
    const document = documentStore.getInternshipLetterForStudent(email);
    const isApproved = document
      ? document.status === "ISSUED" || document.approval_status === "APPROVED"
      : false;

    return NextResponse.json({
      success: true,
      hasRequested,
      isApproved,
      canRequest: !hasRequested,
      document,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to query letter status";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token =
      req.cookies.get("interndesk_user")?.value ||
      req.cookies.get("akash_user")?.value ||
      cookieStore.get("interndesk_user")?.value ||
      cookieStore.get("akash_user")?.value;

    const session = safeParseSession(token);
    const body = await req.json();

    const email = body.studentEmail || session?.email;
    const name = body.studentName || session?.name || "Student Intern";
    const purpose = body.purpose || "Academic Verification & Degree Practicum Credit";
    const technology = body.technology || "AI & Full Stack Enterprise Systems";
    const salutation = body.salutation === "Ms." ? "Ms." : "Mr.";
    const commencementDate = body.commencementDate || "3rd July 2026";
    const continueUntilDate = body.continueUntilDate || "30th April 2027";

    if (!email) {
      return NextResponse.json({ error: "Student email is required" }, { status: 400 });
    }

    // Check if student has already requested an internship letter
    if (documentStore.hasStudentRequestedInternshipLetter(email)) {
      const existingDoc = documentStore.getInternshipLetterForStudent(email);
      return NextResponse.json({
        success: false,
        error: "Single-Issuance Policy: You have already requested your official internship letter. Each student is allowed only one internship letter.",
        document: existingDoc,
      }, { status: 409 });
    }

    const document = documentStore.requestOneTimeInternshipLetter({
      studentEmail: email,
      studentName: name,
      purpose,
      technology,
      salutation,
      commencementDate,
      continueUntilDate,
      immediateApproval: false, // Strict: Requires Admin Verification & Approval
    });

    return NextResponse.json({
      success: true,
      message: "Official Internship Offer Letter request submitted. Awaiting verification and sign-off by Akash Technolabs Admin.",
      document,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to process request";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

