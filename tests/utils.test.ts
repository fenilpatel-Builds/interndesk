import { describe, it, expect } from "vitest";
import { formatCurrencyINR, formatTime } from "../src/lib/utils";

describe("Utility Functions", () => {
  it("formats INR currency correctly", () => {
    const formatted = formatCurrencyINR(1000);
    expect(formatted).toContain("1,000");
  });

  it("formats duration seconds to HH:MM:SS", () => {
    expect(formatTime(0)).toBe("00:00:00");
    expect(formatTime(65)).toBe("00:01:05");
    expect(formatTime(3600)).toBe("01:00:00");
    expect(formatTime(3665)).toBe("01:01:05");
  });
});
