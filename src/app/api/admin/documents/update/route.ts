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
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const roleStr = String(session?.role || "");
    const isAdmin =
      isUserAdmin(adminEmail) ||
      roleStr === "ORG_ADMIN" ||
      roleStr === "SUPER_ADMIN" ||
      roleStr === "ADMIN";

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Access Denied: Only Akash Technolabs Administrators can update documents." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { documentId, updates } = body;

    if (!documentId) {
      return NextResponse.json({ error: "Document ID is required." }, { status: 400 });
    }

    const updatedDoc = documentStore.updateDocument(documentId, adminEmail, updates || body);
    if (!updatedDoc) {
      return NextResponse.json({ error: "Document not found or could not be updated." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Document "${updatedDoc.title}" successfully updated for ${updatedDoc.recipient_name}!`,
      document: updatedDoc,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update document";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

