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

    const roleStr = String(session?.role || "");
    const isAdmin =
      isUserAdmin(adminEmail) ||
      roleStr === "ORG_ADMIN" ||
      roleStr === "SUPER_ADMIN" ||
      roleStr === "ADMIN";

    if (!adminEmail || !isAdmin) {
      return NextResponse.json(
        { error: "Access Denied: Admin authorization required to approve documents." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { documentId, adminName, technology, commencementDate, continueUntilDate } = body;

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required." },
        { status: 400 }
      );
    }

    const updatedDoc = documentStore.approveDocument(
      documentId,
      adminName || session?.name || "Akash Padhiyar",
      {
        technology,
        commencementDate,
        continueUntilDate,
      }
    );

    if (!updatedDoc) {
      return NextResponse.json(
        { error: "Document not found or could not be approved." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Offer letter officially approved and released to candidate.",
      document: updatedDoc,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to approve document";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

