import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { getClerkRuntimeState } from "./lib/clerk-runtime";

const isPublicRoute = createRouteMatcher([
  "/api/health(.*)",
  "/setup-status(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/auth/complete(.*)",
  "/__clerk(.*)",
]);
const isApiRoute = createRouteMatcher(["/api(.*)"]);

const clerkState = getClerkRuntimeState();

const clerkMiddlewareOptions = {
  domain: clerkState.domain || undefined,
  frontendApiProxy: {
    enabled: true,
  },
};

async function guardedClerkAuth(request: NextRequest, event: NextFetchEvent) {
  if (!clerkState.shouldUseClerkAuth) {
    if (clerkState.shouldProtectPrivatelyInProduction && !isPublicRoute(request)) {
      return NextResponse.redirect(new URL("/setup-status", request.url));
    }
    return NextResponse.next();
  }

  const handler = clerkMiddleware(async (auth, request) => {
    if (!isPublicRoute(request)) {
      if (isApiRoute(request)) {
        await auth.protect();
        return;
      }
      await auth.protect({
        unauthenticatedUrl: new URL("/sign-in", request.url).toString(),
      });
    }
  }, clerkMiddlewareOptions);

  try {
    return await handler(request, event);
  } catch {
    if (!isPublicRoute(request)) {
      return NextResponse.redirect(new URL("/setup-status", request.url));
    }
    return NextResponse.next();
  }
}

const optionalClerkMiddleware = async (request: NextRequest, event: NextFetchEvent) => {
  return guardedClerkAuth(request, event);
};

export default optionalClerkMiddleware;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
