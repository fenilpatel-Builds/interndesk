import { NextRequest, NextResponse } from "next/server";
import { assessmentStore } from "@/lib/assessments/assessment-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, type, details } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required." }, { status: 400 });
    }

    if (!type) {
      return NextResponse.json({ error: "Activity type is required." }, { status: 400 });
    }

    const updated = assessmentStore.logSessionActivity({
      sessionId,
      type,
      details,
    });

    if (!updated) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }

    // Check against exam security policy
    const asm = assessmentStore.getById(updated.assessment_id, true);
    const maxViolations = asm?.security_policy?.max_violations_allowed ?? 3;
    const autoSubmitOnViolation = asm?.security_policy?.auto_submit_on_violation ?? true;

    const totalViolations = updated.tab_switch_count + updated.fullscreen_exit_count;
    const shouldAutoSubmit = autoSubmitOnViolation && totalViolations >= maxViolations;

    return NextResponse.json({
      success: true,
      message: `Activity logged: ${type}`,
      tabSwitchCount: updated.tab_switch_count,
      fullscreenExitCount: updated.fullscreen_exit_count,
      totalViolations,
      maxViolations,
      autoSubmitTriggered: shouldAutoSubmit,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to log activity";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
