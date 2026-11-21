"use client";

import { useSyncExternalStore, useEffect } from "react";

let isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

let healthCheckPromise: Promise<boolean> | null = null;

/**
 * Actively pings the lightweight /api/health route to verify real internet connectivity.
 * Updates online status and notifies subscribers.
 */
export async function verifyOnlineStatus(): Promise<boolean> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    if (isOnline !== false) {
      isOnline = false;
      notify();
    }
    return false;
  }

  if (typeof window === "undefined" || typeof fetch === "undefined") {
    return isOnline;
  }

  if (healthCheckPromise) {
    return healthCheckPromise;
  }

  healthCheckPromise = (async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const url =
        typeof window !== "undefined" && window.location?.origin
          ? `${window.location.origin}/api/health`
          : "/api/health";

      const res = await fetch(url, {
        method: "HEAD",
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const ok = res.ok;
      if (isOnline !== ok) {
        isOnline = ok;
        notify();
      }
      return ok;
    } catch {
      if (isOnline !== false) {
        isOnline = false;
        notify();
      }
      return false;
    } finally {
      healthCheckPromise = null;
    }
  })();

  return healthCheckPromise;
}

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    notify();
    verifyOnlineStatus();
  });

  window.addEventListener("offline", () => {
    isOnline = false;
    notify();
  });

  window.addEventListener("focus", () => {
    verifyOnlineStatus();
  });
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): boolean {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return false;
  }
  return isOnline;
}

function getServerSnapshot(): boolean {
  return true;
}

export function toggleSimulateOffline() {
  isOnline = !isOnline;
  notify();
}

/**
 * React hook that returns true when online, false when offline.
 * Listens to online and offline events and verifies with /api/health.
 */
export function useOnlineStatus(): boolean {
  const status = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (process.env.NODE_ENV !== "test") {
      void verifyOnlineStatus();
    }
  }, []);

  return status;
}

/**
 * Testing helpers
 */
export function __setOnlineStatusForTesting(status: boolean) {
  isOnline = status;
  notify();
}

export function __resetOnlineStatusForTesting() {
  healthCheckPromise = null;
  isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
  notify();
}
