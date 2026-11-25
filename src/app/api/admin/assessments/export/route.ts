import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { safeParseSession } from "@/lib/auth/session-token";
import { isUserAdmin } from "@/lib/auth/admin-whitelist";
import { assessmentStore } from "@/lib/assessments/assessment-store";
import {
  formatGradebookRows,
  generateGradebookExcelBuffer,
  GradebookRow,
} from "@/lib/assessments/gradebook-export";

async function verifyAdminAuth(req: NextRequest) {
  const cookieStore = await cookies();
  const token =
    req.cookies.get("interndesk_user")?.value ||
    req.cookies.get("akash_user")?.value ||
    cookieStore.get("interndesk_user")?.value ||
    cookieStore.get("akash_user")?.value;

  const session = safeParseSession(token);
  const headerEmail = req.headers.get("x-user-email");
  const adminEmail = session?.email || headerEmail;

  const roleStr = String(session?.role || "");
  const isAdmin =
    isUserAdmin(adminEmail) ||
    roleStr === "ORG_ADMIN" ||
    roleStr === "SUPER_ADMIN" ||
    roleStr === "ADMIN";

  if (!adminEmail || !isAdmin) {
    return { isAuthorized: false, adminEmail: null };
  }
  return { isAuthorized: true, adminEmail };
}

export async function GET(req: NextRequest) {
  try {
    const { isAuthorized } = await verifyAdminAuth(req);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Access Denied: Admin authorization required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const format = (searchParams.get("format") || "xlsx").toLowerCase();
    const examId = searchParams.get("examId") || "ALL";
    const status = searchParams.get("status") || "ALL";
    const search = (searchParams.get("search") || "").toLowerCase().trim();

    let attempts = assessmentStore.getAllAttempts();

    // Filter by Exam
    if (examId !== "ALL") {
      attempts = attempts.filter((a) => a.assessment_id === examId);
    }

    // Filter by Status
    if (status === "PASSED") {
      attempts = attempts.filter((a) => a.passed);
    } else if (status === "FAILED") {
      attempts = attempts.filter((a) => !a.passed);
    }

    // Filter by Search Query
    if (search) {
      attempts = attempts.filter(
        (a) =>
          a.student_name.toLowerCase().includes(search) ||
          a.student_email.toLowerCase().includes(search) ||
          a.assessment_title.toLowerCase().includes(search)
      );
    }

    const targetExam = examId !== "ALL" ? assessmentStore.getById(examId, true) : null;
    const cleanTitle = (targetExam?.title || "Gradebook_Export").replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 25);
    const dateStr = new Date().toISOString().substring(0, 10);

    if (format === "csv") {
      const rows = formatGradebookRows(attempts);
      const headers = rows.length > 0 ? (Object.keys(rows[0]) as (keyof GradebookRow)[]) : [];
      const csvLines = [
        headers.map((h) => `"${h}"`).join(","),
        ...rows.map((row) =>
          headers
            .map((h) => {
              const val = row[h];
              return `"${String(val).replace(/"/g, '""')}"`;
            })
            .join(",")
        ),
      ];

      const csvContent = "\uFEFF" + csvLines.join("\n");
      const filename = `${cleanTitle}_${dateStr}.csv`;

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    // Default: Multi-sheet Excel (.xlsx)
    const excelBuffer = generateGradebookExcelBuffer(attempts, {
      includeAnalytics: true,
      includeQuestions: true,
    });
    const filename = `${cleanTitle}_${dateStr}.xlsx`;

    return new NextResponse(excelBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to export gradebook";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
