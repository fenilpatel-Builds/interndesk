import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { safeParseSession } from "@/lib/auth/session-token";
import { isUserAdmin } from "@/lib/auth/admin-whitelist";
import { assessmentStore } from "@/lib/assessments/assessment-store";

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
      return NextResponse.json({ error: "Access Denied: Only Akash Administrators can access full assessment data." }, { status: 403 });
    }

    const assessments = assessmentStore.getAll(true); // Full key visibility
    return NextResponse.json({ success: true, assessments, count: assessments.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch assessments";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { isAuthorized } = await verifyAdminAuth(req);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Access Denied: Only Akash Administrators can create assessments." }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      subject,
      description,
      duration_minutes,
      passing_threshold,
      attempt_limit,
      negative_marking_rate,
      security_policy,
      start_date,
      end_date,
      assigned_batches,
      assigned_courses,
      status,
      questions,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Assessment title is required." }, { status: 400 });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: "At least one question is required." }, { status: 400 });
    }

    // Format and sanitize questions
    const formattedQuestions = questions.map((q: any, idx: number) => ({
      id: q.id || `q_${Date.now()}_${idx}`,
      question: (q.question || "").trim(),
      type: q.type || "SINGLE_CHOICE",
      difficulty: q.difficulty || "MEDIUM",
      options: Array.isArray(q.options) ? q.options.map((o: string) => String(o).trim()) : [],
      correct_answer: Array.isArray(q.correct_answer)
        ? q.correct_answer
        : (q.correct_answer || "").trim(),
      explanation: (q.explanation || "").trim(),
      marks: Number(q.marks) || 10,
      negative_marks: typeof q.negative_marks === "number" ? q.negative_marks : undefined,
      tags: Array.isArray(q.tags) ? q.tags : undefined,
      code_language: q.code_language,
      starter_code: q.starter_code,
      test_cases: q.test_cases,
      matching_pairs: q.matching_pairs,
      rubric: q.rubric,
    }));

    const created = assessmentStore.createAssessment({
      title: title.trim(),
      subject: subject || "Technical Practicum",
      description: description || "",
      duration_minutes: Number(duration_minutes) || 25,
      passing_threshold: Number(passing_threshold) || 70,
      attempt_limit: Number(attempt_limit) || 2,
      negative_marking_rate: typeof negative_marking_rate === "number" ? negative_marking_rate : 0,
      security_policy: security_policy || {
        fullscreen_required: true,
        block_copy_paste: true,
        max_violations_allowed: 3,
        auto_submit_on_violation: true,
        block_devtools: true,
      },
      start_date,
      end_date,
      assigned_batches,
      assigned_courses,
      status: status || "PUBLISHED",
      questions: formattedQuestions,
    });

    return NextResponse.json({
      success: true,
      message: `Assessment "${created.title}" successfully created with ${created.questions.length} questions.`,
      assessment: created,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create assessment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { isAuthorized } = await verifyAdminAuth(req);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Access Denied: Only Akash Administrators can modify assessments." }, { status: 403 });
    }

    const body = await req.json();
    const { id, updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Assessment ID is required." }, { status: 400 });
    }

    const updated = assessmentStore.updateAssessment(id, updates || body);
    if (!updated) {
      return NextResponse.json({ error: "Assessment not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Assessment "${updated.title}" successfully updated.`,
      assessment: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update assessment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { isAuthorized } = await verifyAdminAuth(req);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Access Denied: Only Akash Administrators can delete assessments." }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    let id = searchParams.get("id");

    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json({ error: "Assessment ID is required." }, { status: 400 });
    }

    const deleted = assessmentStore.deleteAssessment(id);
    if (!deleted) {
      return NextResponse.json({ error: "Assessment not found or already deleted." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Assessment successfully removed.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete assessment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
