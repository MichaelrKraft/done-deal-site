import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

/**
 * Branded 404 page for the App Router root. Renders for any unmatched route
 * so mistyped or stale URLs get the site's design system instead of the
 * default Next.js "404" screen.
 */
export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 bg-black flex items-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <span className="text-[#00BEFF] font-semibold uppercase tracking-wider text-sm">
            404 Error
          </span>
          <h1 className="text-5xl md:text-6xl font-bold mt-4 mb-4">
            Page Not <span className="text-[#00BEFF]">Found</span>
          </h1>
          <p className="text-xl text-gray-400 mb-10">
            The page you&apos;re looking for doesn&apos;t exist or may have moved.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/" className="cyan-button px-8 py-4 rounded-full font-semibold text-lg">
              Back to Home
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 rounded-full font-semibold text-lg border border-white/20 text-gray-300 hover:bg-white/5 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
