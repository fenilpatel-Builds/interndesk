import fs from "fs";
import path from "path";
import crypto from "crypto";
import { MemberRole } from "../../types/multitenant";
import { createAdminClient } from "../supabase/admin";

export interface RegisteredAccount {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  name: string;
  role: MemberRole;
  organizationId?: string;
  organizationName?: string;
  organizationType?: "CORPORATE" | "EDUCATIONAL" | "COMMUNITY";
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), "src", "lib", "data");
const ACCOUNTS_FILE = path.join(DATA_DIR, "accounts.json");

function hashPassword(password: string, salt: string): string {
  return crypto.createHash("sha256").update(password + salt).digest("hex");
}

function loadAccountsFromDisk(): RegisteredAccount[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(ACCOUNTS_FILE)) {
      const content = fs.readFileSync(ACCOUNTS_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn("[CredentialsStore] Load error:", err);
  }
  return [];
}

function saveAccountsToDisk(accounts: RegisteredAccount[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2), "utf-8");
  } catch (err) {
    console.warn("[CredentialsStore] Save error:", err);
  }
}

class CredentialsStore {
  private accounts: RegisteredAccount[] = [];

  constructor() {
    this.accounts = loadAccountsFromDisk();
  }

  public register(data: {
    email: string;
    password: string;
    name: string;
    role: MemberRole;
    organizationId?: string;
    organizationName?: string;
    organizationType?: "CORPORATE" | "EDUCATIONAL" | "COMMUNITY";
  }): RegisteredAccount {
    this.accounts = loadAccountsFromDisk();
    const cleanEmail = data.email.toLowerCase().trim();
    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = hashPassword(data.password, salt);

    // Existing check
    const existingIndex = this.accounts.findIndex((a) => a.email === cleanEmail);
    const id = existingIndex >= 0 ? this.accounts[existingIndex].id : `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newAccount: RegisteredAccount = {
      id,
      email: cleanEmail,
      passwordHash,
      salt,
      name: data.name.trim(),
      role: data.role,
      organizationId: data.organizationId,
      organizationName: data.organizationName,
      organizationType: data.organizationType,
      createdAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      this.accounts[existingIndex] = newAccount;
    } else {
      this.accounts.push(newAccount);
    }

    saveAccountsToDisk(this.accounts);

    // Asynchronously synchronize to Supabase
    this.syncToSupabase(newAccount, data.password).catch((err) => {
      console.warn("[CredentialsStore] Supabase async sync notice:", err?.message || err);
    });

    return newAccount;
  }

  public authenticate(email: string, password: string): RegisteredAccount | null {
    this.accounts = loadAccountsFromDisk();
    const cleanEmail = email.toLowerCase().trim();
    const account = this.accounts.find((a) => a.email === cleanEmail);

    if (!account) return null;

    const computed = hashPassword(password, account.salt);
    if (computed === account.passwordHash) {
      return account;
    }

    return null;
  }

  public findByEmail(email: string): RegisteredAccount | null {
    this.accounts = loadAccountsFromDisk();
    const cleanEmail = email.toLowerCase().trim();
    return this.accounts.find((a) => a.email === cleanEmail) || null;
  }

  public getAll(): Omit<RegisteredAccount, "passwordHash" | "salt">[] {
    this.accounts = loadAccountsFromDisk();
    return this.accounts.map(({ id, email, name, role, organizationId, organizationName, organizationType, createdAt }) => ({
      id,
      email,
      name,
      role,
      organizationId,
      organizationName,
      organizationType,
      createdAt,
    }));
  }

  public delete(email: string): boolean {
    this.accounts = loadAccountsFromDisk();
    const cleanEmail = email.toLowerCase().trim();
    const initialLen = this.accounts.length;
    this.accounts = this.accounts.filter((a) => a.email !== cleanEmail);
    if (this.accounts.length !== initialLen) {
      saveAccountsToDisk(this.accounts);
      return true;
    }
    return false;
  }

  public clearAllTestingAccounts(): void {
    this.accounts = [];
    saveAccountsToDisk(this.accounts);
  }

  private async syncToSupabase(account: RegisteredAccount, rawPassword: string) {
    try {
      const adminClient = createAdminClient();
      // Try creating user in Supabase Auth if not exists
      try {
        await adminClient.auth.admin.createUser({
          email: account.email,
          password: rawPassword,
          email_confirm: true,
          user_metadata: {
            full_name: account.name,
            role: account.role,
            organization_id: account.organizationId,
          },
        });
      } catch {
        // User may already exist in Supabase auth, update password
        try {
          const { data: users } = await adminClient.auth.admin.listUsers();
          const existing = users?.users?.find((u) => u.email?.toLowerCase() === account.email);
          if (existing) {
            await adminClient.auth.admin.updateUserById(existing.id, {
              password: rawPassword,
              user_metadata: {
                full_name: account.name,
                role: account.role,
                organization_id: account.organizationId,
              },
            });
          }
        } catch {
          // Ignored
        }
      }

      // Upsert profile in Supabase DB
      await adminClient.from("profiles").upsert(
        {
          id: account.id,
          email: account.email,
          full_name: account.name,
          role: account.role === "ORG_ADMIN" || account.role === "ORG_OWNER" ? "ADMIN" : account.role,
          status: "ACTIVE",
        },
        { onConflict: "email" }
      );
    } catch {
      // Ignored for offline/fallback mode
    }
  }
}

export const credentialsStore = new CredentialsStore();
