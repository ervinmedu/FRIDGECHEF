"use client";
import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";

const AuthContext = createContext(null);

// Detect in-app browsers (Facebook, Instagram, TikTok, WebViews, etc.)
function isInAppBrowser() {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  return (
    /FBAN|FBAV|FB_IAB|FB4A|FBBV/i.test(ua) ||   // Facebook
    /Instagram/i.test(ua) ||                       // Instagram
    /TikTok/i.test(ua) ||                          // TikTok
    /Twitter/i.test(ua) ||                         // Twitter
    /LinkedInApp/i.test(ua) ||                     // LinkedIn
    /Snapchat/i.test(ua) ||                        // Snapchat
    /Pinterest/i.test(ua) ||                       // Pinterest
    /\bwv\b/.test(ua) ||                           // Android WebView
    /Version\/[\d.]+.*Mobile.*Safari/i.test(ua) && !/Chrome/i.test(ua) && /GSA/i.test(ua) // Google app on iOS
  );
}

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(undefined);
  const [authError, setAuthError] = useState(null);
  const [inAppBrowser, setInAppBrowser] = useState(false);

  useEffect(() => {
    setInAppBrowser(isInAppBrowser());
    getRedirectResult(auth).catch(() => {});
    const unsub = onAuthStateChanged(auth, (u) => setUser(u ?? null));
    return unsub;
  }, []);

  const signIn = async () => {
    setAuthError(null);

    // In-app browsers block Google OAuth entirely — tell user to open in real browser
    if (isInAppBrowser()) {
      setAuthError("in-app-browser");
      return;
    }

    // On mobile use redirect (popups are blocked by mobile browsers)
    const isMobile = typeof window !== "undefined" && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      try {
        await signInWithRedirect(auth, googleProvider);
      } catch (err) {
        setAuthError("Sign-in failed. Please try again.");
        console.error("Google sign-in redirect error:", err);
      }
      return;
    }

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      if (
        err.code === "auth/popup-blocked" ||
        err.code === "auth/popup-closed-by-user" ||
        err.code === "auth/cancelled-popup-request"
      ) {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectErr) {
          setAuthError("Sign-in failed. Please try again.");
        }
      } else if (
        err.code === "auth/operation-not-supported-in-this-environment" ||
        err.message?.includes("disallowed_useragent")
      ) {
        setAuthError("in-app-browser");
      } else {
        setAuthError("Sign-in failed. Please try again.");
        console.error("Google sign-in error:", err);
      }
    }
  };

  const logOut = async () => {
    try { await signOut(auth); } catch (err) { console.error(err); }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, logOut, authError, inAppBrowser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
