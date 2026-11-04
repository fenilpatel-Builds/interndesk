export const DEFAULT_ADMIN_EMAILS = [
  "fenil8160@gmail.com",
  "fenil.patel@akashtechnolabs.com",
  "akash@akashtechnolabs.com",
  "admin@akashtechnolabs.com",
];

export function getAdminEmails(): string[] {
  const envAdmins = [
    process.env.PRIMARY_ADMIN_EMAIL,
    process.env.ADMIN_EMAIL,
    process.env.NEXT_PUBLIC_ADMIN_EMAIL,
    ...(process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(",") : []),
  ]
    .filter(Boolean)
    .map((e) => e!.toLowerCase().trim());

  return Array.from(new Set([...DEFAULT_ADMIN_EMAILS, ...envAdmins]));
}

export const ADMIN_EMAILS = getAdminEmails();

export function isUserAdmin(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  const allAdmins = getAdminEmails();
  return allAdmins.includes(clean);
}

