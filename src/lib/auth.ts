import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isOwnerEmail } from "./owner-access";

export function isClerkConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
}

export async function requireOwnerResponse() {
  if (!isClerkConfigured()) return null;
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || "";
  if (!user || !isOwnerEmail(email)) {
    return NextResponse.json({ message: "Unauthorized owner-only SSWApp route." }, { status: 403 });
  }
  return null;
}
