import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { safeParseSession } from "@/lib/auth/session-token";
import { isUserAdmin } from "@/lib/auth/admin-whitelist";
import { documentStore } from "@/lib/documents/document-store";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token =
      req.cookies.get("interndesk_user")?.value ||
      req.cookies.get("akash_user")?.value ||
      cookieStore.get("interndesk_user")?.value ||
      cookieStore.get("akash_user")?.value;

    const session = safeParseSession(token);
    const headerEmail = req.headers.get("x-user-email");
    const adminEmail = session?.email || headerEmail;

    if (!adminEmail) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const roleStr = String(session?.role || "");
    const isAdmin =
      isUserAdmin(adminEmail) ||
      roleStr === "ORG_ADMIN" ||
      roleStr === "SUPER_ADMIN" ||
      roleStr === "ADMIN";

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Access Denied: Only Akash Technolabs Administrators can generate offer letters." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      templateType,
      documentType,
      letterDate,
      title,
      salutation,
      studentName,
      recipientEmail,
      internshipPosition,
      commencementDate,
      continueUntilDate,
      technology,
      descriptionContent,
      university,
      purpose,
    } = body;

    if (!studentName || !internshipPosition || !letterDate) {
      return NextResponse.json(
        { error: "Student name, internship position, and letter date are required." },
        { status: 400 }
      );
    }

    const newDoc = documentStore.createOfferLetter(adminEmail, {
      templateType: templateType || "INTERNSHIP OFFER LETTER (Boy)",
      documentType: documentType || "OFFER_LETTER",
      letterDate: letterDate || "30-10-2026",
      title: title || "INTERNSHIP OFFER LETTER",
      salutation: salutation || "Mr.",
      studentName,
      recipientEmail,
      internshipPosition,
      commencementDate: commencementDate || "3rd August 2026",
      continueUntilDate: continueUntilDate || "30th April 2027",
      technology: technology || "AI/ML",
      descriptionContent,
      university,
      purpose,
    });

    return NextResponse.json({
      success: true,
      message: `Official Offer Letter generated successfully for ${newDoc.recipient_name}!`,
      document: newDoc,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate offer letter";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
