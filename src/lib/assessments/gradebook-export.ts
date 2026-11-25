import * as XLSX from "xlsx";
import { AssessmentAttempt } from "./assessment-store";

export interface GradebookRow {
  "Rank": number;
  "Candidate Name": string;
  "Student Email": string;
  "Examination Title": string;
  "Score": number;
  "Total Marks": number;
  "Percentage": string;
  "Result": string;
  "Proctoring Telemetry": string;
  "Tab Switch Alerts": number;
  "Fullscreen Exits": number;
  "Time Spent (Minutes)": number;
  "Submission Date": string;
  "Verification ID": string;
}

export interface AnalyticsSummaryRow {
  "Metric": string;
  "Value": string | number;
}

export interface QuestionBreakdownRow {
  "Question #": number;
  "Question Prompt": string;
  "Question Type": string;
  "Max Marks": number;
  "Correct Answers": number;
  "Incorrect Answers": number;
  "Accuracy Rate": string;
}

/**
 * Formats attempts into clean, standardized gradebook rows sorted by rank
 */
export function formatGradebookRows(attempts: AssessmentAttempt[]): GradebookRow[] {
  const sorted = [...attempts].sort(
    (a, b) => b.score - a.score || new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
  );

  return sorted.map((att, idx) => {
    const durationMin = Math.round((att.time_spent_seconds || 60) / 60);
    const dateFormatted = att.submitted_at
      ? new Date(att.submitted_at).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A";

    const verifId = `VERIF-${Buffer.from(`${att.id}-${att.student_email}`).toString("hex").substring(0, 16).toUpperCase()}`;

    return {
      "Rank": idx + 1,
      "Candidate Name": att.student_name || "Unknown Candidate",
      "Student Email": att.student_email || "N/A",
      "Examination Title": att.assessment_title || "Enterprise Assessment",
      "Score": att.score,
      "Total Marks": att.total_marks,
      "Percentage": `${att.percentage}%`,
      "Result": att.passed ? (att.percentage >= 85 ? "PASSED (DISTINCTION)" : "PASSED") : "FAILED",
      "Proctoring Telemetry": att.proctoring_flag || "CLEAN",
      "Tab Switch Alerts": att.tab_switch_count || 0,
      "Fullscreen Exits": att.fullscreen_exit_count || 0,
      "Time Spent (Minutes)": durationMin,
      "Submission Date": dateFormatted,
      "Verification ID": verifId,
    };
  });
}

/**
 * Generates an executive summary analytics table for the cohort
 */
export function generateAnalyticsSummary(attempts: AssessmentAttempt[]): AnalyticsSummaryRow[] {
  if (attempts.length === 0) {
    return [{ Metric: "Total Submissions", Value: 0 }];
  }

  const total = attempts.length;
  const passedCount = attempts.filter((a) => a.passed).length;
  const failedCount = total - passedCount;
  const distinctionCount = attempts.filter((a) => a.percentage >= 85).length;
  const avgPct = Math.round(attempts.reduce((acc, a) => acc + a.percentage, 0) / total);
  const maxScore = Math.max(...attempts.map((a) => a.score));
  const minScore = Math.min(...attempts.map((a) => a.score));
  const cleanProctorCount = attempts.filter((a) => a.proctoring_flag === "CLEAN").length;
  const cleanPct = Math.round((cleanProctorCount / total) * 100);
  const totalTabSwitches = attempts.reduce((acc, a) => acc + (a.tab_switch_count || 0), 0);
  const totalFullscreenExits = attempts.reduce((acc, a) => acc + (a.fullscreen_exit_count || 0), 0);
  const avgTimeMinutes = Math.round(attempts.reduce((acc, a) => acc + (a.time_spent_seconds || 60), 0) / (total * 60));

  return [
    { Metric: "Total Candidate Submissions", Value: total },
    { Metric: "Passing Rate (%)", Value: `${Math.round((passedCount / total) * 100)}%` },
    { Metric: "Candidates Passed", Value: passedCount },
    { Metric: "Candidates Failed", Value: failedCount },
    { Metric: "Candidates with Distinction (>=85%)", Value: distinctionCount },
    { Metric: "Cohort Average Score (%)", Value: `${avgPct}%` },
    { Metric: "Highest Score Achieved", Value: maxScore },
    { Metric: "Lowest Score Achieved", Value: minScore },
    { Metric: "Zero-Trust Clean Integrity Rate", Value: `${cleanPct}%` },
    { Metric: "Total Tab Switch Incidents", Value: totalTabSwitches },
    { Metric: "Total Fullscreen Exits", Value: totalFullscreenExits },
    { Metric: "Average Completion Time (Minutes)", Value: avgTimeMinutes },
    { Metric: "Report Generated At", Value: new Date().toLocaleString("en-US") },
    { Metric: "Academic Authority", Value: "Akash Technolabs Examination & Proctoring Board" },
  ];
}

/**
 * Extracts question-by-question cohort accuracy breakdown
 */
export function generateQuestionBreakdown(attempts: AssessmentAttempt[]): QuestionBreakdownRow[] {
  const questionMap: Record<
    string,
    { prompt: string; type: string; maxMarks: number; correct: number; incorrect: number }
  > = {};

  attempts.forEach((att) => {
    (att.evaluations || []).forEach((ev) => {
      const qKey = ev.question_id || ev.question_text.substring(0, 30);
      if (!questionMap[qKey]) {
        questionMap[qKey] = {
          prompt: ev.question_text,
          type: ev.type || "SINGLE_CHOICE",
          maxMarks: ev.marks_possible,
          correct: 0,
          incorrect: 0,
        };
      }
      if (ev.is_correct) {
        questionMap[qKey].correct += 1;
      } else {
        questionMap[qKey].incorrect += 1;
      }
    });
  });

  return Object.values(questionMap).map((qData, idx) => {
    const totalAnswers = qData.correct + qData.incorrect;
    const accuracy = totalAnswers > 0 ? `${Math.round((qData.correct / totalAnswers) * 100)}%` : "0%";

    return {
      "Question #": idx + 1,
      "Question Prompt": qData.prompt,
      "Question Type": qData.type,
      "Max Marks": qData.maxMarks,
      "Correct Answers": qData.correct,
      "Incorrect Answers": qData.incorrect,
      "Accuracy Rate": accuracy,
    };
  });
}

/**
 * Builds an enterprise multi-sheet workbook containing:
 * Sheet 1: Candidate Gradebook
 * Sheet 2: Executive Analytics
 * Sheet 3: Question-by-Question Accuracy (if available)
 */
export function buildGradebookWorkbook(
  attempts: AssessmentAttempt[],
  options: { includeAnalytics?: boolean; includeQuestions?: boolean } = { includeAnalytics: true, includeQuestions: true }
): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Candidate Gradebook
  const gradebookRows = formatGradebookRows(attempts);
  const gradebookSheet = XLSX.utils.json_to_sheet(gradebookRows);
  gradebookSheet["!cols"] = [
    { wch: 8 },  // Rank
    { wch: 22 }, // Candidate Name
    { wch: 28 }, // Student Email
    { wch: 34 }, // Examination Title
    { wch: 8 },  // Score
    { wch: 12 }, // Total Marks
    { wch: 12 }, // Percentage
    { wch: 22 }, // Result
    { wch: 20 }, // Proctoring Telemetry
    { wch: 16 }, // Tab Switches
    { wch: 16 }, // Fullscreen Exits
    { wch: 20 }, // Time Spent
    { wch: 24 }, // Submission Date
    { wch: 24 }, // Verification ID
  ];
  XLSX.utils.book_append_sheet(workbook, gradebookSheet, "Candidate Gradebook");

  // Sheet 2: Executive Analytics Summary
  if (options.includeAnalytics !== false) {
    const analyticsRows = generateAnalyticsSummary(attempts);
    const analyticsSheet = XLSX.utils.json_to_sheet(analyticsRows);
    analyticsSheet["!cols"] = [{ wch: 36 }, { wch: 44 }];
    XLSX.utils.book_append_sheet(workbook, analyticsSheet, "Executive Analytics");
  }

  // Sheet 3: Question Accuracy Breakdown
  if (options.includeQuestions !== false) {
    const questionRows = generateQuestionBreakdown(attempts);
    if (questionRows.length > 0) {
      const questionSheet = XLSX.utils.json_to_sheet(questionRows);
      questionSheet["!cols"] = [
        { wch: 12 }, // Question #
        { wch: 48 }, // Prompt
        { wch: 18 }, // Type
        { wch: 12 }, // Max Marks
        { wch: 16 }, // Correct
        { wch: 16 }, // Incorrect
        { wch: 16 }, // Accuracy
      ];
      XLSX.utils.book_append_sheet(workbook, questionSheet, "Question Breakdown");
    }
  }

  return workbook;
}

/**
 * Downloads candidate gradebook as Microsoft Excel (.xlsx) file
 */
export function exportGradebookToExcel(
  attempts: AssessmentAttempt[],
  examTitle: string = "All_Assessments",
  options: { includeAnalytics?: boolean; includeQuestions?: boolean } = { includeAnalytics: true, includeQuestions: true }
): void {
  if (attempts.length === 0) {
    alert("No candidate submission records available to export.");
    return;
  }

  const workbook = buildGradebookWorkbook(attempts, options);
  const cleanTitle = examTitle.replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 25);
  const fileName = `Gradebook_${cleanTitle}_${new Date().toISOString().substring(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

/**
 * Downloads candidate gradebook as CSV file
 */
export function exportGradebookToCsv(attempts: AssessmentAttempt[], examTitle: string = "All_Assessments"): void {
  const rows = formatGradebookRows(attempts);
  if (rows.length === 0) {
    alert("No submission records available to export.");
    return;
  }

  const headers = Object.keys(rows[0]) as (keyof GradebookRow)[];
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

  const csvContent = csvLines.join("\n");
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const cleanTitle = examTitle.replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 25);
  link.href = url;
  link.download = `Gradebook_${cleanTitle}_${new Date().toISOString().substring(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates binary Buffer of Excel workbook for server-side API responses
 */
export function generateGradebookExcelBuffer(
  attempts: AssessmentAttempt[],
  options?: { includeAnalytics?: boolean; includeQuestions?: boolean }
): Buffer {
  const workbook = buildGradebookWorkbook(attempts, options);
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
