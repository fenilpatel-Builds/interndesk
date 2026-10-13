import { describe, it, expect } from "vitest";
import { multiTenantStore } from "../src/lib/multitenant/store";

describe("Multi-Tenant Data Isolation & Workspace Boundary Tests", () => {
  const APEX_ORG_ID = "org-apex-01";
  const WESTBRIDGE_ORG_ID = "org-westbridge-02";

  it("strictly isolates tasks across different organizations", () => {
    const apexTasks = multiTenantStore.getTasks(APEX_ORG_ID);
    const westbridgeTasks = multiTenantStore.getTasks(WESTBRIDGE_ORG_ID);

    expect(apexTasks.length).toBeGreaterThan(0);
    expect(westbridgeTasks.length).toBeGreaterThan(0);

    // Assert that NO task from Apex Technologies appears in Westbridge query
    const apexTaskIds = new Set(apexTasks.map((t) => t.id));
    const westbridgeTaskIds = westbridgeTasks.map((t) => t.id);

    const hasLeakedTask = westbridgeTaskIds.some((id) => apexTaskIds.has(id));
    expect(hasLeakedTask).toBe(false);
  });

  it("prevents task created in one organization from leaking to another", () => {
    const createdTask = multiTenantStore.createTask({
      organization_id: APEX_ORG_ID,
      title: "Confidential Apex Internal Security Review",
      description: "Private corporate security audit.",
      priority: "URGENT",
      status: "PENDING",
      due_date: "2026-12-01",
    });

    // Westbridge query must NOT find this task
    const westbridgeTasks = multiTenantStore.getTasks(WESTBRIDGE_ORG_ID);
    const leaked = westbridgeTasks.find((t) => t.id === createdTask.id);
    expect(leaked).toBeUndefined();

    // Apex query MUST find this task
    const apexTasks = multiTenantStore.getTasks(APEX_ORG_ID);
    const found = apexTasks.find((t) => t.id === createdTask.id);
    expect(found).toBeDefined();
    expect(found?.organization_id).toBe(APEX_ORG_ID);
  });

  it("handles multi-organization user memberships with distinct roles", () => {
    // Sarah Chen belongs to both Apex (as INTERN) and Westbridge (as STUDENT)
    const sarahMemberships = multiTenantStore.getUserMemberships("sarah.chen@student.io");
    expect(sarahMemberships.length).toBeGreaterThanOrEqual(2);

    const apexMembership = sarahMemberships.find((m) => m.organization_id === APEX_ORG_ID);
    const westbridgeMembership = sarahMemberships.find((m) => m.organization_id === WESTBRIDGE_ORG_ID);

    expect(apexMembership).toBeDefined();
    expect(apexMembership?.role).toBe("INTERN");

    expect(westbridgeMembership).toBeDefined();
    expect(westbridgeMembership?.role).toBe("STUDENT");
  });

  it("enforces tenant-isolation on attendance work sessions", () => {
    const apexSessions = multiTenantStore.getWorkSessions(APEX_ORG_ID);
    const westbridgeSessions = multiTenantStore.getWorkSessions(WESTBRIDGE_ORG_ID);

    expect(apexSessions.every((s) => s.organization_id === APEX_ORG_ID)).toBe(true);
    expect(westbridgeSessions.every((s) => s.organization_id === WESTBRIDGE_ORG_ID)).toBe(true);
  });
});
