export const ADMIN_EMAILS = ["fenil8160@gmail.com", "akash@akashtechnolabs.com"];

export function isUserAdmin(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}
