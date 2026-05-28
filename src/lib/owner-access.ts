export function getOwnerEmails() {
  return (process.env.OWNER_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isOwnerEmail(email: string | null | undefined) {
  if (!email) return false;
  const owners = getOwnerEmails();
  return owners.length === 0 || owners.includes(email.toLowerCase());
}
