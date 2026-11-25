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

export function formatGradebookRows(attempts: AssessmentAttempt[]): GradebookRow[] {
  // Sort by score descending, then submission date
  const sorted = [...attempts].sort((a, b) => b.score - a.score || new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());

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
 * Downloads candidate gradebook as Microsoft Excel (.xlsx) file
 */
export function exportGradebookToExcel(attempts: AssessmentAttempt[], examTitle: string = "All_Assessments"): void {
  const rows = formatGradebookRows(attempts);
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths for clean readability
  worksheet["!cols"] = [
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

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Gradebook");

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
