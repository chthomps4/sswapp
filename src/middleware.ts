import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { getCanonicalHostFromEnv, getClerkRuntimeState } from "./lib/clerk-runtime";

const signInUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/sign-in";
const signUpUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "/sign-up";

const isPublicRoute = createRouteMatcher([
  "/api/health(.*)",
  "/setup-status(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/auth/complete(.*)",
  "/__clerk(.*)",
]);
const isApiRoute = createRouteMatcher(["/api(.*)"]);

function resolveAuthorizedParties(request: NextRequest, baseOrigins: string[]) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") || "https";
  const currentOrigin = host ? `${protocol}://${host}` : "";
  const origins = [...baseOrigins];

  if (currentOrigin) {
    origins.push(currentOrigin);
  }

  return origins;
}

function shouldRedirectToCanonicalHost(request: NextRequest, canonicalHost: string) {
  if (!canonicalHost) return false;

  const environment = process.env.VERCEL_ENV || process.env.NODE_ENV || "";
  if (environment && environment !== "production") return false;

  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (!host) return false;
  const hostname = host.split(":")[0].toLowerCase();

  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
  if (isLocal) return false;

  return hostname !== canonicalHost;
}

function redirectToCanonical(request: NextRequest) {
  const canonicalHost = getCanonicalHostFromEnv();
  if (!canonicalHost) return null;
  const canonical = new URL(request.url);
  canonical.hostname = canonicalHost;
  return NextResponse.redirect(canonical, 308);
}

async function guardedClerkAuth(request: NextRequest, event: NextFetchEvent) {
  const clerkState = getClerkRuntimeState();
  const hasClerkHandshake = request.nextUrl.searchParams.has("__clerk_handshake");
  const pathname = request.nextUrl.pathname.toLowerCase();
  const isClerkCallbackPath = hasClerkHandshake && pathname !== "/sign-in" && pathname !== "/sign-up";
  const isAuthRoute =
    pathname.startsWith("/__clerk") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/auth/complete") ||
    isClerkCallbackPath;

  const canSkipCanonicalRedirect =
    isAuthRoute;

  if (!canSkipCanonicalRedirect && shouldRedirectToCanonicalHost(request, clerkState.canonicalHost)) {
    const response = redirectToCanonical(request);
    if (response) return response;
  }

  if (isClerkCallbackPath && !pathname.startsWith("/auth/complete")) {
    const authComplete = new URL(request.url);
    authComplete.pathname = "/auth/complete";
    return NextResponse.rewrite(authComplete);
  }

  const authorizedParties = resolveAuthorizedParties(request, clerkState.allowedRedirectOrigins);

  const clerkMiddlewareOptions = {
    domain: clerkState.domain || undefined,
    authorizedParties,
    signInUrl,
    signUpUrl,
  };

  if (!clerkState.shouldUseClerkAuth) {
    if (clerkState.shouldProtectPrivatelyInProduction && !isPublicRoute(request)) {
      return NextResponse.redirect(new URL("/setup-status", request.url));
    }
    return NextResponse.next();
  }

  const handler = clerkMiddleware(async (auth, request) => {
    if (!isPublicRoute(request) && !hasClerkHandshake) {
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
