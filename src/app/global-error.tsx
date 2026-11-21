"use client";

import React from "react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 p-6 font-sans">
        <div
          role="alert"
          className="max-w-md w-full p-6 bg-white rounded-xl border border-red-200 shadow-sm text-center space-y-4"
        >
          <h1 className="text-xl font-bold text-red-600">Something went wrong</h1>
          <p className="text-sm text-slate-600">
            An unexpected error occurred. In an emergency, dial{" "}
            <strong className="text-slate-900">112</strong>.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
