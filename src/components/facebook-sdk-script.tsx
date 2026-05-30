import Script from "next/script";
import { getFacebookRuntimeState } from "@/lib/facebook-runtime";

export function FacebookSdkScript() {
  const facebook = getFacebookRuntimeState();

  if (!facebook.sdkConfigured) {
    return null;
  }

  const appId = JSON.stringify(facebook.appId);
  const apiVersion = JSON.stringify(facebook.apiVersion);

  return (
    <Script id="facebook-sdk-bootstrap" strategy="afterInteractive">{`
      window.statusChangeCallback = function(response) {
        var safeAuth = response && response.authResponse
          ? {
              userID: response.authResponse.userID || "",
              expiresIn: response.authResponse.expiresIn || ""
            }
          : null;

        window.dispatchEvent(new CustomEvent("facebook:login-status", {
          detail: {
            status: response ? response.status : "unknown",
            authResponse: safeAuth
          }
        }));
      };

      window.checkLoginState = function() {
        if (!window.FB || !window.FB.getLoginStatus) {
          window.dispatchEvent(new CustomEvent("facebook:login-status", {
            detail: { status: "sdk_not_loaded", authResponse: null }
          }));
          return;
        }

        window.FB.getLoginStatus(function(response) {
          window.statusChangeCallback(response);
        });
      };

      window.fbAsyncInit = function() {
        window.FB.init({
          appId: ${appId},
          cookie: true,
          xfbml: true,
          version: ${apiVersion}
        });

        if (window.FB.AppEvents && window.FB.AppEvents.logPageView) {
          window.FB.AppEvents.logPageView();
        }

        window.checkLoginState();
      };

      (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) { return; }
        js = d.createElement(s);
        js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
      }(document, "script", "facebook-jssdk"));
    `}</Script>
  );
}
