"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[App Error Boundary caught error]:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="glass-card rounded-2xl p-8 max-w-lg w-full space-y-4 border border-amber-500/20 shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto text-xl font-bold">
          !
        </div>
        <h2 className="text-xl font-black text-white">Something went wrong</h2>
        <p className="text-xs text-zinc-400">
          {error.message || "An unexpected error occurred while loading this view."}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="v3nja-gold-button px-5 py-2.5 text-xs uppercase font-bold"
          >
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08] text-xs font-semibold transition-all"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
