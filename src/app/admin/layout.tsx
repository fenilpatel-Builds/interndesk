import React, { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { safeParseSession } from "@/lib/auth/session-token";
import { ADMIN_EMAILS } from "@/lib/auth/admin-whitelist";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token =
    cookieStore.get("interndesk_user")?.value ||
    cookieStore.get("akash_user")?.value;
  const session = safeParseSession(token);

  if (!session) {
    redirect("/admin/login");
  }

  const cleanEmail = session.email.toLowerCase().trim();
  if (!ADMIN_EMAILS.includes(cleanEmail)) {
    // Strict admin access control: Non-admin users are immediately redirected to student dashboard
    redirect("/student/dashboard");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Suspense fallback={<aside className="w-64 bg-slate-900 shrink-0" />}>
        <AdminSidebar />
      </Suspense>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
