import { NextRequest, NextResponse } from "next/server";
import { assessmentStore } from "@/lib/assessments/assessment-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, answers, markedForReview, visitedQuestions, tabSwitchCount, fullscreenExitCount } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required for autosave." }, { status: 400 });
    }

    const updated = assessmentStore.autosaveSession({
      sessionId,
      answers,
      markedForReview,
      visitedQuestions,
      tabSwitchCount,
      fullscreenExitCount,
    });

    if (!updated) {
      return NextResponse.json({ error: "Session not found or inactive." }, { status: 404 });
    }

    const now = Date.now();
    const expiryMs = new Date(updated.expires_at).getTime();
    const remainingSeconds = Math.max(0, Math.floor((expiryMs - now) / 1000));

    return NextResponse.json({
      success: true,
      message: "Progress autosaved to server cloud store.",
      savedAt: updated.updated_at,
      remainingSeconds,
      isExpired: remainingSeconds <= 0,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to autosave progress";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
