import { describe, it, expect } from "vitest";
import { generateOrganizationCode, validateOrganizationCode } from "../src/lib/multitenant/code-generator";
import { multiTenantStore } from "../src/lib/multitenant/store";

describe("Organization Code System Business Rules", () => {
  it("generates standard unique 6-character alphanumeric code with ORG- prefix", () => {
    const code = generateOrganizationCode();
    expect(code).toMatch(/^ORG-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/);
  });

  it("validates authentic organization codes and normalizes casing", () => {
    const valid = "ORG-7K4P9X";
    const result = validateOrganizationCode(valid);
    expect(result.isValid).toBe(true);
    expect(result.normalized).toBe("ORG-7K4P9X");

    // Lowercase input normalized to uppercase
    const lowercase = "org-7k4p9x";
    const lowerResult = validateOrganizationCode(lowercase);
    expect(lowerResult.isValid).toBe(true);
    expect(lowerResult.normalized).toBe("ORG-7K4P9X");

    // Input without prefix normalized
    const withoutPrefix = "7k4p9x";
    const prefixResult = validateOrganizationCode(withoutPrefix);
    expect(prefixResult.isValid).toBe(true);
    expect(prefixResult.normalized).toBe("ORG-7K4P9X");
  });

  it("rejects malicious or invalid length organization codes", () => {
    const shortCode = "ORG-12";
    expect(validateOrganizationCode(shortCode).isValid).toBe(false);

    const sqlInjection = "ORG-' OR '1'='1";
    expect(validateOrganizationCode(sqlInjection).isValid).toBe(false);

    const empty = "";
    expect(validateOrganizationCode(empty).isValid).toBe(false);
  });

  it("resolves registered organizations case-insensitively from store", () => {
    const foundUpper = multiTenantStore.getOrganizationByCode("ORG-7K4P9X");
    expect(foundUpper).toBeDefined();
    expect(foundUpper?.name).toBe("Apex Technologies");

    const foundLower = multiTenantStore.getOrganizationByCode("org-7k4p9x");
    expect(foundLower).toBeDefined();
    expect(foundLower?.name).toBe("Apex Technologies");
  });
});
