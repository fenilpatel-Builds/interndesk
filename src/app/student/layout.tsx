import React, { Suspense } from "react";
import { StudentSidebar } from "@/components/student/sidebar";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
