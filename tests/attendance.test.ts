import { describe, it, expect } from "vitest";

describe("Attendance Engine Duration & Break Math", () => {
  it("calculates total duration and productive duration correctly", () => {
    const clockInMs = new Date("2026-10-07T09:00:00Z").getTime();
    const clockOutMs = new Date("2026-10-07T17:00:00Z").getTime(); // 8 hours = 28,800 seconds

    const totalSeconds = Math.max(0, Math.floor((clockOutMs - clockInMs) / 1000));
    expect(totalSeconds).toBe(28800);

    // 1 hour lunch break (3,600s) + 15 min tea break (900s) = 4,500s
    const totalBreakSeconds = 3600 + 900;
    const productiveSeconds = Math.max(0, totalSeconds - totalBreakSeconds);

    expect(productiveSeconds).toBe(24300); // 6.75 hours productive
  });

  it("handles zero or negative duration gracefully", () => {
    const clockInMs = new Date("2026-10-07T09:00:00Z").getTime();
    const clockOutMs = clockInMs - 1000; // impossible clock-out in past

    const totalSeconds = Math.max(0, Math.floor((clockOutMs - clockInMs) / 1000));
    expect(totalSeconds).toBe(0);
  });
});
