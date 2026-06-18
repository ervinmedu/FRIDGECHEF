"use client";
// components/AuthContext.js
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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Handle redirect result on page load (mobile sign-in flow)
    getRedirectResult(auth).catch(() => {});

    const unsub = onAuthStateChanged(auth, (u) => setUser(u ?? null));
    return unsub;
  }, []);

  const signIn = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      // Popup was blocked or closed — fall back to redirect (works on mobile too)
      if (
        err.code === "auth/popup-blocked" ||
        err.code === "auth/popup-closed-by-user" ||
        err.code === "auth/cancelled-popup-request"
      ) {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectErr) {
          setAuthError("Sign-in failed. Please try again.");
          console.error("Redirect sign-in error:", redirectErr);
        }
      } else {
        setAuthError("Sign-in failed. Please try again.");
        console.error("Google sign-in error:", err);
      }
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign-out error:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, logOut, authError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
