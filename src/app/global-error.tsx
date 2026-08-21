'use client';

import { useEffect } from 'react';

/**
 * Last-resort error boundary: only fires when the root layout itself throws,
 * so unlike error.tsx it must render its own <html>/<body> (no Navbar/Footer,
 * since those depend on the layout that just failed). Kept intentionally
 * minimal and dependency-free so it can't itself fail to render.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: globalThis.Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[global-error-boundary]', error.message, error.digest);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        <main className="min-h-screen flex items-center justify-center">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <span className="text-[#00BEFF] font-semibold uppercase tracking-wider text-sm">
              Something Went Wrong
            </span>
            <h1 className="text-5xl md:text-6xl font-bold mt-4 mb-4">
              Unexpected <span className="text-[#00BEFF]">Error</span>
            </h1>
            <p className="text-xl text-gray-400 mb-10">
              Sorry about that — something broke on our end. You can try again, or head back home.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={reset}
                className="px-8 py-4 rounded-full font-semibold text-lg"
                style={{ background: '#00BEFF', color: '#000' }}
              >
                Try Again
              </button>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages --
                  global-error replaces the entire root layout (including any
                  router providers), so a plain reload via <a> is the only
                  navigation guaranteed to work here. */}
              <a
                href="/"
                className="px-8 py-4 rounded-full font-semibold text-lg border border-white/20 text-gray-300 hover:bg-white/5 transition-colors"
              >
                Back to Home
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
