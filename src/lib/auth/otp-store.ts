import fs from "fs";
import path from "path";
import crypto from "crypto";

interface StoredOtp {
  code: string;
  expiresAt: number;
  attempts: number;
  createdAt: number;
}

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

// In-memory cache
const memoryCache: Map<string, StoredOtp> = new Map();

// File persistence path for development hot-reloads
const DATA_DIR = path.join(process.cwd(), "src", "lib", "data");
const OTP_FILE = path.join(DATA_DIR, "active-otps.json");

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {
    // Non-fatal
  }
}

function loadPersistedOtps(): Record<string, StoredOtp> {
  try {
    ensureDataDir();
    if (fs.existsSync(OTP_FILE)) {
      const content = fs.readFileSync(OTP_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch {
    // Fall back to memory
  }
  return {};
}

function persistOtps(store: Record<string, StoredOtp>): void {
  try {
    ensureDataDir();
    fs.writeFileSync(OTP_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch {
    // Non-fatal
  }
}

export class OtpStore {
  /**
   * Generates a secure 6-digit numeric OTP and stores it for the email
   */
  public generate(email: string): string {
    const cleanEmail = email.toLowerCase().trim();
    // Cryptographically secure 6-digit code
    const code = crypto.randomInt(100000, 999999).toString();
    const entry: StoredOtp = {
      code,
      expiresAt: Date.now() + OTP_EXPIRY_MS,
      attempts: 0,
      createdAt: Date.now(),
    };

    memoryCache.set(cleanEmail, entry);

    const persisted = loadPersistedOtps();
    persisted[cleanEmail] = entry;
    // Clean up expired entries in file
    const now = Date.now();
    for (const [k, v] of Object.entries(persisted)) {
      if (v.expiresAt < now) {
        delete persisted[k];
      }
    }
    persistOtps(persisted);

    return code;
  }

  /**
   * Validates a provided OTP for the given email
   */
  public verify(
    email: string,
    inputCode: string
  ): { valid: boolean; error?: string } {
    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = inputCode.trim();

    // Check memory first, then disk
    let entry = memoryCache.get(cleanEmail);
    if (!entry) {
      const persisted = loadPersistedOtps();
      entry = persisted[cleanEmail];
      if (entry) {
        memoryCache.set(cleanEmail, entry);
      }
    }

    if (!entry) {
      return {
        valid: false,
        error: "No active verification code found for this email. Please request a new code.",
      };
    }

    if (Date.now() > entry.expiresAt) {
      this.clear(cleanEmail);
      return {
        valid: false,
        error: "Verification code has expired (valid for 10 minutes). Please request a fresh code.",
      };
    }

    if (entry.attempts >= MAX_ATTEMPTS) {
      this.clear(cleanEmail);
      return {
        valid: false,
        error: "Too many failed attempts. For your security, this code was invalidated. Please request a new code.",
      };
    }

    entry.attempts += 1;

    if (entry.code !== cleanCode) {
      // Update attempts
      memoryCache.set(cleanEmail, entry);
      const persisted = loadPersistedOtps();
      persisted[cleanEmail] = entry;
      persistOtps(persisted);

      return {
        valid: false,
        error: `Incorrect verification code. Please check your inbox and try again (${MAX_ATTEMPTS - entry.attempts} attempts remaining).`,
      };
    }

    // Success - consume OTP so it cannot be re-used
    this.clear(cleanEmail);
    return { valid: true };
  }

  /**
   * Retrieves active code for testing assistance / development logs
   */
  public getActiveCode(email: string): string | null {
    const cleanEmail = email.toLowerCase().trim();
    let entry = memoryCache.get(cleanEmail);
    if (!entry) {
      const persisted = loadPersistedOtps();
      entry = persisted[cleanEmail];
    }
    if (entry && Date.now() <= entry.expiresAt) {
      return entry.code;
    }
    return null;
  }

  public clear(email: string): void {
    const cleanEmail = email.toLowerCase().trim();
    memoryCache.delete(cleanEmail);
    try {
      const persisted = loadPersistedOtps();
      delete persisted[cleanEmail];
      persistOtps(persisted);
    } catch {
      // Ignored
    }
  }
}

export const otpStore = new OtpStore();
