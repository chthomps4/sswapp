# Facebook Dev Integration

This app can load the Facebook SDK for JavaScript on private dashboard pages so an owner can test Facebook Login and prepare for future Facebook Page publishing.

## Current Scope

- Loads the Facebook SDK asynchronously when enabled.
- Initializes `FB.init` using environment variables.
- Calls `FB.getLoginStatus` after SDK init.
- Provides a private `/facebook-dev` page for login status checks.
- Supports the Meta Login Button markup when a login configuration ID is provided.
- Dispatches sanitized login status to the browser without displaying or storing access tokens.

## Environment Variables

Client-side SDK setup:

```env
NEXT_PUBLIC_FACEBOOK_SDK_ENABLED="true"
NEXT_PUBLIC_FACEBOOK_APP_ID="your-meta-app-id"
NEXT_PUBLIC_FACEBOOK_API_VERSION="your-meta-api-version"
NEXT_PUBLIC_FACEBOOK_LOGIN_CONFIG_ID="your-meta-login-config-id"
NEXT_PUBLIC_FACEBOOK_LOGIN_SCOPE="public_profile,email"
```

Server-side publishing setup for a later reviewed endpoint:

```env
ENABLE_FACEBOOK_PUBLISHING="false"
FACEBOOK_PAGE_ID=""
FACEBOOK_PAGE_ACCESS_TOKEN=""
```

Do not prefix Page tokens with `NEXT_PUBLIC_`. Page tokens must remain server-only.

## Login Flow

The SDK loader defines:

- `window.statusChangeCallback(response)`
- `window.checkLoginState()`
- `window.fbAsyncInit`

The callback intentionally strips `accessToken` and `signedRequest` before dispatching status to the app UI.

## Publishing Boundary

Facebook Page posting should use a server route with approved permissions and a Page access token. The browser SDK is only for login/status checks.

Required safety rules:

- Do not auto-publish.
- Do not auto-approve.
- Do not expose Page tokens in client code.
- Do not log access tokens.
- Do not send private dashboard rows to Meta.
- Create draft or needs-review records first, then require an owner action before publishing.

## Meta Setup Notes

Facebook Page publishing generally requires a Meta app, owner login, Page access, and approved Page permissions such as Page post management. Use the current Meta Developer dashboard values for the app ID, API version, login configuration ID, OAuth redirect URLs, and allowed domains.

Add allowed domains/origins for:

- `https://sitesignal.company`
- `https://www.sitesignal.company`
- local development URL if testing locally

## Verification

1. Set the client-side env vars in Vercel.
2. Redeploy.
3. Visit `/facebook-dev` as an authenticated owner.
4. Confirm the SDK status shows configured.
5. Click **Check Login State**.
6. Use **Continue with Facebook** or the Meta Login Button to test login.

No Facebook publishing endpoint is active until `ENABLE_FACEBOOK_PUBLISHING=true` and a separate reviewed server-side implementation exists.
