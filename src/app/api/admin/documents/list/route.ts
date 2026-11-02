import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { safeParseSession } from "@/lib/auth/session-token";
import { isUserAdmin } from "@/lib/auth/admin-whitelist";
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
    const adminEmail = session?.email || headerEmail;

    if (!adminEmail || !isUserAdmin(adminEmail)) {
      return NextResponse.json(
        { error: "Access Denied: Admin authorization required." },
        { status: 403 }
      );
    }

    const docs = documentStore.getAll();
    return NextResponse.json({ documents: docs });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load documents";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
