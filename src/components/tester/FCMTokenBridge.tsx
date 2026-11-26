"use client";

import { useEffect } from "react";

export default function FCMTokenBridge() {
  useEffect(() => {
    // Check if running inside Flutter app and token is stored in localStorage or window
    const registerDeviceToken = async (fcmToken: string) => {
      try {
        await fetch("/api/tester/fcm-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: fcmToken, platform: "android" }),
        });
        console.log("[FCM Bridge] Token registered with active session");
      } catch (err) {
        console.error("[FCM Bridge] Error registering token:", err);
      }
    };

    // 1. Expose global hook for Flutter WebView to call directly
    (window as any).syncFCMToken = (token: string) => {
      if (token) {
        localStorage.setItem("fcm_device_token", token);
        registerDeviceToken(token);
      }
    };

    // 2. Check if a token was previously stored in this WebView instance
    const savedToken = localStorage.getItem("fcm_device_token");
    if (savedToken) {
      registerDeviceToken(savedToken);
    }
  }, []);

  return null;
}
