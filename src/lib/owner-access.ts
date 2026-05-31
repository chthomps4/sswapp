export function getOwnerEmails() {
  return (process.env.OWNER_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isOwnerEmail(email: string | null | undefined) {
  if (!email) return false;
  const owners = getOwnerEmails();
  if (!owners.length) return false;
  return owners.includes(email.trim().toLowerCase());
}
