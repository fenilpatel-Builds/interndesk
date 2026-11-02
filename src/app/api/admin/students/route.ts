import { NextResponse } from "next/server";
import { credentialsStore } from "@/lib/auth/credentials-store";

export async function GET() {
  try {
    const allAccounts = credentialsStore.getAll();
    const studentAccounts = allAccounts.filter((a) => a.role === "STUDENT");

    const techOptions = [
      "Full Stack Web Development",
      "Python & AI Engineering",
      "Data Science & Analytics",
      "Cloud Computing & DevOps",
      "Cybersecurity",
    ];
    const collegeOptions = [
      "National Institute of Technology",
      "Institute of Engineering & Tech",
      "Gujarat Technological University",
      "Ahmedabad Institute of Technology",
    ];

    const students = studentAccounts.map((account, index) => {
      const joinedDate = account.createdAt
        ? account.createdAt.split("T")[0]
        : "2026-10-01";

      return {
        id: account.id,
        name: account.name,
        email: account.email,
        phone: "+91 99786 21654",
        college: collegeOptions[index % collegeOptions.length],
        university: "Gujarat Technological University",
        technology: techOptions[index % techOptions.length],
        program: `${techOptions[index % techOptions.length]} Cohort`,
        enrollmentId: `ENR-${100000 + index * 1234}`,
        complianceStatus: "VERIFIED",
        attendancePct: 94.5 - index * 1.5,
        tasksCompleted: `${4 + (index % 3)}/6`,
        status: "ACTIVE",
        joinedDate,
      };
    });

    return NextResponse.json({ students });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load students";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
