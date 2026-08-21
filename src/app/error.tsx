'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

/**
 * Branded error boundary for the App Router root. Next.js renders this
 * automatically when a Server or Client Component throws during render,
 * replacing the default unstyled error screen with the site's design
 * system, mirroring the not-found.tsx pattern.
 */
export default function ErrorBoundaryPage({
  error,
  reset,
}: {
  error: globalThis.Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log for observability; never surface raw error details to the user.
    console.error('[app-error-boundary]', error.message, error.digest);
  }, [error]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 bg-black flex items-center">
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
              className="cyan-button px-8 py-4 rounded-full font-semibold text-lg"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="px-8 py-4 rounded-full font-semibold text-lg border border-white/20 text-gray-300 hover:bg-white/5 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
