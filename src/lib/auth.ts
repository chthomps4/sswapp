import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getClerkRuntimeState } from "./clerk-runtime";
import { isOwnerEmail } from "./owner-access";

export function isClerkConfigured() {
  return getClerkRuntimeState().shouldUseClerkAuth;
}

export async function requireOwnerResponse() {
  if (!isClerkConfigured()) {
    return NextResponse.json(
      {
        message:
          "Clerk is not configured for protected actions. Set Clerk publishable/secret keys and return to a live auth environment.",
      },
      { status: 503 },
    );
  }

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || "";
  if (!user || !isOwnerEmail(email)) {
    return NextResponse.json({ message: "Unauthorized owner-only SSWApp route." }, { status: 403 });
  }
  return null;
}
