export function prismaEnv() {
  const fallback = "postgresql://user:pass@localhost:5432/sswapp";
  return {
    ...process.env,
    DATABASE_URL: process.env.DATABASE_URL || fallback,
    DIRECT_URL: process.env.DIRECT_URL || process.env.DATABASE_URL || fallback,
  };
}
