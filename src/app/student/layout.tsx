import React, { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { safeParseSession } from "@/lib/auth/session-token";
import { StudentSidebar } from "@/components/student/sidebar";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token =
    cookieStore.get("interndesk_user")?.value ||
    cookieStore.get("akash_user")?.value;
  const session = safeParseSession(token);

  // Strict zero-trust authentication boundary:
  // Unauthenticated users (e.g. Guest mode, incognito, expired sessions) must sign in.
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Suspense fallback={<aside className="w-64 bg-slate-900 shrink-0" />}>
        <StudentSidebar />
      </Suspense>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
