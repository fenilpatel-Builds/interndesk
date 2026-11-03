import { describe, it, expect } from "vitest";
import { proxy } from "../src/proxy";
import { NextRequest } from "next/server";
import { signSessionToken } from "../src/lib/auth/session-token";

describe("Guest Mode & Authentication Boundary Security", () => {
  it("redirects unauthenticated guest accessing /student/submissions to /login", async () => {
    const req = new NextRequest("http://localhost:3000/student/submissions", {
      method: "GET",
    });

    const res = await proxy(req);
    expect(res.status).toBe(307); // NextResponse.redirect
    expect(res.headers.get("location")).toBe("http://localhost:3000/login");
  });

  it("redirects unauthenticated guest accessing /student/dashboard to /login", async () => {
    const req = new NextRequest("http://localhost:3000/student/dashboard", {
      method: "GET",
    });

    const res = await proxy(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/login");
  });

  it("redirects unauthenticated guest accessing /admin/dashboard to /admin/login", async () => {
    const req = new NextRequest("http://localhost:3000/admin/dashboard", {
      method: "GET",
    });

    const res = await proxy(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/admin/login");
  });

  it("redirects unauthenticated guest accessing /workspace to /login", async () => {
    const req = new NextRequest("http://localhost:3000/workspace", {
      method: "GET",
    });

    const res = await proxy(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/login");
  });

  it("allows authenticated student to access /student/submissions", async () => {
    const studentToken = signSessionToken({
      id: "usr-student-fenil",
      email: "fenil.patel@akashtechnolabs.com",
      role: "STUDENT",
      name: "Fenil Patel",
    });

    const req = new NextRequest("http://localhost:3000/student/submissions", {
      method: "GET",
      headers: {
        cookie: `interndesk_user=${studentToken}`,
      },
    });

    const res = await proxy(req);
    // Should NOT redirect to /login
    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
  });

  it("blocks authenticated student from accessing /admin routes and redirects to /unauthorized", async () => {
    const studentToken = signSessionToken({
      id: "usr-student-fenil",
      email: "fenil.patel@akashtechnolabs.com",
      role: "STUDENT",
      name: "Fenil Patel",
    });

    const req = new NextRequest("http://localhost:3000/admin/dashboard", {
      method: "GET",
      headers: {
        cookie: `interndesk_user=${studentToken}`,
      },
    });

    const res = await proxy(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/unauthorized");
  });

  it("allows authorized admin to access /admin/dashboard", async () => {
    const adminToken = signSessionToken({
      id: "usr-akash-admin",
      email: "fenil8160@gmail.com",
      role: "ORG_ADMIN",
      name: "Fenil Patel",
    });

    const req = new NextRequest("http://localhost:3000/admin/dashboard", {
      method: "GET",
      headers: {
        cookie: `interndesk_user=${adminToken}`,
      },
    });

    const res = await proxy(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
  });
});
