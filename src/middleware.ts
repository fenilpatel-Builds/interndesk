import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
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

  // Check Supabase Auth user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check application session cookie
  const interndeskSession = request.cookies.get("interndesk_user")?.value;
  let parsedSession: { email?: string; role?: string } | null = null;
  if (interndeskSession) {
    try {
      parsedSession = JSON.parse(interndeskSession);
    } catch {
      // Ignored
    }
  }

  const userEmail = (user?.email || parsedSession?.email || "").toLowerCase().trim();
  const isAuthenticated = !!user || !!parsedSession?.email;
  const isAdmin = userEmail === "fenil8918@gmail.com" && (parsedSession?.role === "ADMIN" || !parsedSession);

  const path = request.nextUrl.pathname;

  // Protect /student/* routes
  if (path.startsWith("/student")) {
    if (!isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", path);
      return NextResponse.redirect(url);
    }
  }

  // Protect /admin/* routes (Only fenil8918@gmail.com allowed)
  if (path.startsWith("/admin")) {
    if (!isAuthenticated || userEmail !== "fenil8918@gmail.com") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", path);
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/student/:path*",
    "/admin/:path*",
  ],
};
