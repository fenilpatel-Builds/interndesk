import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { safeParseSession } from "./lib/auth/session-token";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-anon-key";

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh Supabase Auth user session
  await supabase.auth.getUser();

  // Check application session cookie with tamper-proof HMAC verification
  const interndeskSession = request.cookies.get("interndesk_user")?.value;
  const parsedSession = safeParseSession(interndeskSession);
  const userRole = parsedSession?.role || "STUDENT";
  const path = request.nextUrl.pathname;

  // Unauthenticated users attempting to access protected admin/workspace routes must sign in
  if (!parsedSession && (path.startsWith("/workspace") || path.startsWith("/admin") || path.startsWith("/super-admin"))) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Prevent students from accessing admin /workspace and /admin console
  if ((path.startsWith("/workspace") || path.startsWith("/admin")) && userRole === "STUDENT") {
    return NextResponse.redirect(new URL("/student/dashboard", request.url));
  }

  // Protect /super-admin against non-superadmin access
  if (path.startsWith("/super-admin")) {
    if (userRole !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/workspace", request.url));
    }
  }

  // Ensure active org cookie default
  if (!request.cookies.get("interndesk_active_org")?.value) {
    response.cookies.set("interndesk_active_org", "org-apex-01", {
      path: "/",
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/workspace/:path*",
    "/admin/:path*",
    "/super-admin/:path*",
  ],
};
