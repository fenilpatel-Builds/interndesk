import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { safeParseSession } from "@/lib/auth/session-token";
import { isUserAdmin } from "@/lib/auth/admin-whitelist";
import { documentStore, OfficialOfferLetter } from "@/lib/documents/document-store";
import { CandidateLetterRow, BulkGenerationOptions, interpolateCustomTemplate } from "@/lib/documents/bulk-letter-engine";
import { LETTER_TEMPLATES, LetterTemplateKey } from "@/lib/documents/letter-templates";

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
        { error: "Access Denied: Only Akash Technolabs Administrators can perform bulk letter generation." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { candidates, options } = body as {
      candidates: CandidateLetterRow[];
      options: BulkGenerationOptions;
    };

    if (!Array.isArray(candidates) || candidates.length === 0) {
      return NextResponse.json(
        { error: "At least one candidate record is required for bulk generation." },
        { status: 400 }
      );
    }

    const templateDef = LETTER_TEMPLATES.find((t) => t.key === options?.templateKey);
    const documentType = templateDef?.documentType || "OFFER_LETTER";
    const letterTitle = options?.title || templateDef?.defaultTitle || "INTERNSHIP OFFER LETTER";
    const letterDate = options?.letterDate || new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

    const createdDocuments: OfficialOfferLetter[] = [];

    for (const cand of candidates) {
      let customDesc: string | undefined = undefined;
      if (options?.customDescriptionTemplate && options.customDescriptionTemplate.trim()) {
        customDesc = interpolateCustomTemplate(options.customDescriptionTemplate, cand, options);
      }

      const doc = documentStore.createOfferLetter(adminEmail, {
        templateType: options?.templateKey || "INTERNSHIP OFFER LETTER (Boy)",
        documentType,
        letterDate,
        title: letterTitle,
        salutation: cand.salutation || "Mr.",
        studentName: cand.studentName,
        recipientEmail: cand.recipientEmail,
        internshipPosition: cand.internshipPosition || "Software Engineering Intern",
        commencementDate: cand.commencementDate || "1st June 2026",
        continueUntilDate: cand.continueUntilDate || "30th November 2026",
        technology: cand.technology || "Full Stack Web Development",
        descriptionContent: customDesc,
        university: cand.college || cand.university,
        purpose: "Academic Internship Fulfillment",
      });

      createdDocuments.push(doc);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully generated and registered ${createdDocuments.length} letters into the Academic Document Registry.`,
      count: createdDocuments.length,
      documents: createdDocuments,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to execute bulk letter generation.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
