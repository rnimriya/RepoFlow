"use client";

/**
 * Syncs the demo mode flag from localStorage to a cookie so
 * the middleware can read it server-side to allow /dashboard access.
 */
import { useEffect } from "react";
import { useAuth } from "./AuthProvider";

export function DemoCookieSync() {
  const { isDemoMode } = useAuth();

  useEffect(() => {
    if (isDemoMode) {
      // Set a short-lived cookie readable by middleware
      document.cookie = "repoflow_demo_mode=true; path=/; max-age=86400; SameSite=Lax";
    } else {
      // Clear it on sign-out
      document.cookie = "repoflow_demo_mode=; path=/; max-age=0";
    }
  }, [isDemoMode]);

  return null;
}
