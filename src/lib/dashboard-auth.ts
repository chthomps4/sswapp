export const dashboardAuthMode = "open_testing" as const;

export function isDashboardAuthDisabled() {
  return true;
}

export function getDashboardAuthStatus() {
  return {
    mode: dashboardAuthMode,
    disabled: true,
    provider: "none",
    message:
      "Dashboard auth is temporarily removed so the private dashboard can be tested on the Vercel app URL. Restore owner auth before private production use.",
  };
}
