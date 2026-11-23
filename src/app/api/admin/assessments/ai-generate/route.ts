import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { safeParseSession } from "@/lib/auth/session-token";
import { isUserAdmin } from "@/lib/auth/admin-whitelist";
import { generateAIQuestions } from "@/lib/assessments/ai-question-generator";

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

export async function POST(req: NextRequest) {
  try {
    const { isAuthorized } = await verifyAdminAuth(req);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Access Denied: Admin authorization required." }, { status: 403 });
    }

    const body = await req.json();
    const { prompt, topic, subject, difficulty, count, questionType } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: "Generation prompt or topic is required." }, { status: 400 });
    }

    const result = await generateAIQuestions({
      prompt: prompt.trim(),
      topic: topic || "Software Architecture",
      subject: subject || "Technical Practicum",
      difficulty: difficulty || "MEDIUM",
      count: Number(count) || 10,
      questionType: questionType || "SINGLE_CHOICE",
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "AI question generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
