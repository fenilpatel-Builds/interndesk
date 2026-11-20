import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { safeParseSession } from "@/lib/auth/session-token";
import { isUserAdmin } from "@/lib/auth/admin-whitelist";
import { questionBankStore } from "@/lib/assessments/question-bank-store";

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

    const searchParams = req.nextUrl.searchParams;
    const subject = searchParams.get("subject") || undefined;
    const topic = searchParams.get("topic") || undefined;
    const difficulty = searchParams.get("difficulty") || undefined;
    const type = searchParams.get("type") || undefined;
    const query = searchParams.get("query") || undefined;

    const questions = questionBankStore.search({ subject, topic, difficulty, type, query });

    return NextResponse.json({
      success: true,
      questions,
      count: questions.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch question bank";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { isAuthorized } = await verifyAdminAuth(req);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Access Denied: Admin authorization required." }, { status: 403 });
    }

    const body = await req.json();

    if (body.isBulk && Array.isArray(body.questions)) {
      const created = questionBankStore.importBulk(body.questions);
      return NextResponse.json({
        success: true,
        message: `Successfully imported ${created.length} questions into Question Bank.`,
        createdCount: created.length,
      });
    }

    const {
      subject,
      topic,
      difficulty,
      type,
      question,
      options,
      correct_answer,
      explanation,
      marks,
      negative_marks,
      tags,
      code_language,
      starter_code,
      test_cases,
      matching_pairs,
      rubric,
    } = body;

    if (!subject || !topic || !question) {
      return NextResponse.json({ error: "Subject, topic, and question text are required." }, { status: 400 });
    }

    const created = questionBankStore.createQuestion({
      subject,
      topic,
      difficulty: difficulty || "MEDIUM",
      type: type || "SINGLE_CHOICE",
      question,
      options: options || [],
      correct_answer: correct_answer || "",
      explanation: explanation || "",
      marks: Number(marks) || 10,
      negative_marks: Number(negative_marks) || 0,
      tags: tags || [],
      code_language,
      starter_code,
      test_cases,
      matching_pairs,
      rubric,
    });

    return NextResponse.json({
      success: true,
      message: "Question successfully added to Question Bank.",
      question: created,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to add question";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { isAuthorized } = await verifyAdminAuth(req);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Access Denied: Admin authorization required." }, { status: 403 });
    }

    const body = await req.json();
    const { id, updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Question ID is required." }, { status: 400 });
    }

    const updated = questionBankStore.updateQuestion(id, updates || body);
    if (!updated) {
      return NextResponse.json({ error: "Question not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Question updated successfully.",
      question: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update question";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { isAuthorized } = await verifyAdminAuth(req);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Access Denied: Admin authorization required." }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    let id = searchParams.get("id");

    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json({ error: "Question ID is required." }, { status: 400 });
    }

    const deleted = questionBankStore.deleteQuestion(id);
    if (!deleted) {
      return NextResponse.json({ error: "Question not found or already deleted." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Question deleted successfully from Question Bank.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete question";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
