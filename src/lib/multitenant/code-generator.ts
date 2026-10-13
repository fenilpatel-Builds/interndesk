/**
 * Organization Code System
 * Format: ORG-XXXXXX (6 alphanumeric uppercase chars, e.g., ORG-7K4P9X)
 * System generated, case-insensitive, server validated, non-guessable.
 */

const CODE_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // exclude 0, 1, I, O to prevent visual confusion

export function generateOrganizationCode(): string {
  let result = "";
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * CODE_CHARS.length);
    result += CODE_CHARS[randomIndex];
  }
  return `ORG-${result}`;
}

export function validateOrganizationCode(code: string): {
  isValid: boolean;
  normalized: string;
  error?: string;
} {
  if (!code || typeof code !== "string") {
    return { isValid: false, normalized: "", error: "Organization code is required." };
  }

  const cleaned = code.trim().toUpperCase();

  // Allow with or without "ORG-" prefix
  let formatted = cleaned;
  if (!formatted.startsWith("ORG-")) {
    formatted = `ORG-${formatted}`;
  }

  const regex = /^ORG-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/;
  if (!regex.test(formatted)) {
    return {
      isValid: false,
      normalized: formatted,
      error: "Invalid code format. Codes follow the pattern ORG-XXXXXX (e.g., ORG-7K4P9X).",
    };
  }

  return {
    isValid: true,
    normalized: formatted,
  };
}
