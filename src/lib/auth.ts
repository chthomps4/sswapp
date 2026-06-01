import { isDashboardAuthDisabled } from "./dashboard-auth";

export function isClerkConfigured() {
  return false;
}

export function isDashboardAuthOpenForTesting() {
  return isDashboardAuthDisabled();
}

export async function requireOwnerResponse() {
  return null;
}
