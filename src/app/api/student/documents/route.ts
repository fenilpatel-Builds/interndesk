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
    const headerEmail = req.headers.get("x-user-email");

    const email = session?.email || headerEmail;
    const name = session?.name || undefined;

    if (!email) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    let docs = documentStore.getForStudent(email, name);

    // If student has no specific documents yet, return the official Akash Technolabs documents
    if (docs.length === 0) {
      const allDocs = documentStore.getAll();
      docs = allDocs.filter((d) => d.organization_id === "org-akash-01");
    }

    return NextResponse.json({ documents: docs });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load documents";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
