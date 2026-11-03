import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { safeParseSession } from "./lib/auth/session-token";
import { isUserAdmin } from "./lib/auth/admin-whitelist";

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
  try {
    await supabase.auth.getUser();
  } catch {
    // Non-blocking
  }

  // Check application session cookie with tamper-proof HMAC verification
  const interndeskSession =
    request.cookies.get("interndesk_user")?.value ||
    request.cookies.get("akash_user")?.value;
  const parsedSession = safeParseSession(interndeskSession);
  const userRole = parsedSession?.role || "STUDENT";
  const path = request.nextUrl.pathname;

  // Dedicated admin login page
  if (path === "/admin/login") {
    if (
      parsedSession &&
      (isUserAdmin(parsedSession.email) ||
        userRole === "SUPER_ADMIN" ||
        userRole === "ORG_OWNER" ||
        userRole === "HR_COORDINATOR" ||
        userRole === "ORG_ADMIN")
    ) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return response;
  }

  // Dedicated student login page
  if (path === "/login") {
    if (parsedSession) {
      if (
        isUserAdmin(parsedSession.email) ||
        userRole === "SUPER_ADMIN" ||
        userRole === "ORG_OWNER" ||
        userRole === "HR_COORDINATOR" ||
        userRole === "ORG_ADMIN"
      ) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
      return NextResponse.redirect(new URL("/student/dashboard", request.url));
    }
    return response;
  }

  // Unauthenticated users attempting to access protected routes must sign in
  if (!parsedSession) {
    if (path.startsWith("/admin") && path !== "/admin/login") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (
      path.startsWith("/student") ||
      path.startsWith("/workspace") ||
      path.startsWith("/super-admin")
    ) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Prevent students from accessing admin console
  if (
    (path.startsWith("/workspace") || (path.startsWith("/admin") && path !== "/admin/login")) &&
    userRole === "STUDENT"
  ) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  // Protect /super-admin against non-superadmin access
  if (path.startsWith("/super-admin")) {
    if (userRole !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  // Ensure active org cookie default
  if (!request.cookies.get("interndesk_active_org")?.value) {
    response.cookies.set("interndesk_active_org", "org-akash-01", {
      path: "/",
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/student/:path*",
    "/workspace/:path*",
    "/admin/:path*",
    "/super-admin/:path*",
    "/login",
  ],
};
