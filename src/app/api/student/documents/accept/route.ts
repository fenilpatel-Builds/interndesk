import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { safeParseSession } from "@/lib/auth/session-token";
import { documentStore } from "@/lib/documents/document-store";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get("interndesk_user")?.value ||
      cookieStore.get("akash_user")?.value;
    const session = safeParseSession(token);

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const { documentId, candidateName } = await req.json();
    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required." },
        { status: 400 }
      );
    }

    const acceptedDoc = documentStore.acceptDocument(
      documentId,
      candidateName || session.name
    );

    if (!acceptedDoc) {
      return NextResponse.json(
        { error: "Document not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Offer letter accepted successfully!",
      document: acceptedDoc,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to accept document";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
