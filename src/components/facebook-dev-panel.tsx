"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, CircleAlert, RefreshCw } from "lucide-react";

type FacebookLoginStatus =
  | "not_checked"
  | "sdk_not_loaded"
  | "connected"
  | "not_authorized"
  | "unknown";

type FacebookStatusEvent = CustomEvent<{
  status: FacebookLoginStatus;
  authResponse: {
    userID?: string;
    expiresIn?: string | number;
  } | null;
}>;

declare global {
  interface Window {
    FB?: {
      login: (
        callback: (response: unknown) => void,
        options?: { scope?: string },
      ) => void;
      getLoginStatus: (callback: (response: unknown) => void) => void;
      XFBML?: { parse: () => void };
    };
    checkLoginState?: () => void;
    statusChangeCallback?: (response: unknown) => void;
  }
}

function escapeAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function FacebookDevPanel({
  sdkConfigured,
  sdkEnabled,
  appIdConfigured,
  apiVersion,
  loginConfigId,
  loginScope,
}: {
  sdkConfigured: boolean;
  sdkEnabled: boolean;
  appIdConfigured: boolean;
  apiVersion: string;
  loginConfigId: string;
  loginScope: string;
}) {
  const [status, setStatus] = useState<FacebookLoginStatus>("not_checked");
  const [userId, setUserId] = useState("");
  const [expiresIn, setExpiresIn] = useState("");

  const loginButtonMarkup = useMemo(() => {
    if (!loginConfigId) {
      return "";
    }

    return `<fb:login-button config_id="${escapeAttribute(loginConfigId)}" onlogin="checkLoginState();"></fb:login-button>`;
  }, [loginConfigId]);

  useEffect(() => {
    function handleStatus(event: Event) {
      const detail = (event as FacebookStatusEvent).detail;
      setStatus(detail.status || "unknown");
      setUserId(detail.authResponse?.userID || "");
      setExpiresIn(String(detail.authResponse?.expiresIn || ""));
    }

    window.addEventListener("facebook:login-status", handleStatus);

    if (window.FB?.XFBML && loginButtonMarkup) {
      window.FB.XFBML.parse();
    }

    if (window.checkLoginState) {
      window.checkLoginState();
    }

    return () => window.removeEventListener("facebook:login-status", handleStatus);
  }, [loginButtonMarkup]);

  function checkLoginState() {
    if (!window.checkLoginState) {
      setStatus("sdk_not_loaded");
      return;
    }

    window.checkLoginState();
  }

  function openLoginDialog() {
    if (!window.FB?.login || !window.statusChangeCallback) {
      setStatus("sdk_not_loaded");
      return;
    }

    window.FB.login(window.statusChangeCallback, { scope: loginScope });
  }

  const connected = status === "connected";

  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Facebook Login Test</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              This checks the Facebook SDK login state without displaying or storing access tokens.
              Tokens must never be copied into public client code.
            </p>
          </div>
          <span
            className={`inline-flex w-fit items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold ${
              connected ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-950"
            }`}
          >
            {connected ? <CheckCircle2 size={15} /> : <CircleAlert size={15} />}
            {status.replaceAll("_", " ")}
          </span>
        </div>

        <div className="mt-5 grid gap-3 rounded-md border border-stone-200 bg-stone-50 p-4 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-stone-500">SDK enabled</span>
            <strong>{sdkEnabled ? "yes" : "no"}</strong>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-stone-500">App ID</span>
            <strong>{appIdConfigured ? "configured" : "missing"}</strong>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-stone-500">API version</span>
            <strong>{apiVersion || "missing"}</strong>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-stone-500">Login config</span>
            <strong>{loginConfigId ? "configured" : "optional"}</strong>
          </div>
          {userId ? (
            <div className="flex justify-between gap-4">
              <span className="text-stone-500">Facebook user</span>
              <strong>{userId}</strong>
            </div>
          ) : null}
          {expiresIn ? (
            <div className="flex justify-between gap-4">
              <span className="text-stone-500">Token expiry signal</span>
              <strong>{expiresIn}</strong>
            </div>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={checkLoginState}
            className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 hover:border-emerald-400 hover:text-emerald-800"
          >
            <RefreshCw size={15} />
            Check Login State
          </button>
          <button
            type="button"
            onClick={openLoginDialog}
            disabled={!sdkConfigured}
            className="rounded-md bg-[#1877f2] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            Continue with Facebook
          </button>
        </div>

        {loginButtonMarkup ? (
          <div className="mt-5 rounded-md border border-blue-100 bg-blue-50 p-4">
            <p className="mb-3 text-sm font-semibold text-blue-950">Meta Login Button render target</p>
            <div dangerouslySetInnerHTML={{ __html: loginButtonMarkup }} />
          </div>
        ) : null}
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Publishing Boundary</h2>
        <div className="mt-3 grid gap-3 text-sm leading-6 text-stone-600">
          <p>
            Facebook Page posting will require a backend-only Page token and approved Meta permissions.
            The browser SDK is only for login/status. It is not where Page publishing tokens belong.
          </p>
          <p>
            Safe next step: use this page to confirm Facebook Login works, then build a review-only
            server route that can create draft publish requests. No automatic posting is enabled here.
          </p>
        </div>
      </section>
    </div>
  );
}
