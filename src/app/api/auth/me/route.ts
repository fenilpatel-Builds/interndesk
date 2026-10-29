import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { safeParseSession, signSessionToken } from "@/lib/auth/session-token";
import { credentialsStore } from "@/lib/auth/credentials-store";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get("interndesk_user")?.value ||
      cookieStore.get("akash_user")?.value;

    const session = safeParseSession(token);
    if (!session || !session.email) {
      return NextResponse.json(
        { success: false, message: "Unauthenticated" },
        { status: 401 }
      );
    }

    const cleanEmail = session.email.toLowerCase().trim();
    let resolvedName = session.name;

    // 1. Look up user in local credentials store
    const localAccount = credentialsStore.findByEmail(cleanEmail);
    if (localAccount && localAccount.name && !localAccount.name.toLowerCase().includes("@") && localAccount.name !== cleanEmail.split("@")[0]) {
      resolvedName = localAccount.name;
    } else {
      // 2. Look up in Supabase profiles
      try {
        const adminClient = createAdminClient();
        const { data: profile } = await adminClient
          .from("profiles")
          .select("full_name")
          .eq("email", cleanEmail)
          .maybeSingle();

        if (profile?.full_name) {
          resolvedName = profile.full_name.trim();
        }
      } catch {
        // Fallback to localAccount or session
      }
    }

    // If localAccount exists with full name, ensure cookies are refreshed with true name
    if (localAccount && localAccount.name && session.name !== localAccount.name) {
      resolvedName = localAccount.name;
      const newToken = signSessionToken({
        id: localAccount.id,
        name: localAccount.name,
        email: localAccount.email,
        role: localAccount.role,
        organizationId: localAccount.organizationId || "org-akash-01",
      });

      cookieStore.set("interndesk_user", newToken, {
        path: "/",
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
      });

      cookieStore.set("akash_user", newToken, {
        path: "/",
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: session.id,
        name: resolvedName,
        email: cleanEmail,
        role: session.role,
        organizationId: session.organizationId,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to resolve user.";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
