/**
 * Route-level loading state for /yourcastle, shown by Next.js during the
 * initial navigation/hydration to this page. The page composes many client
 * sections (hero, pricing, signup form, etc.) with no server data fetch of
 * its own — this skeleton only needs to cover the above-the-fold hero so
 * campaign visitors don't see a blank screen while the bundle hydrates.
 */
export default function YourCastleLoading() {
  return (
    <main className="min-h-screen pt-20 bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-pulse text-center">
        <div className="h-4 w-72 bg-white/10 rounded mx-auto mb-6" />
        <div className="h-12 w-full max-w-xl bg-white/10 rounded mx-auto mb-4" />
        <div className="h-12 w-2/3 bg-white/10 rounded mx-auto mb-6" />
        <div className="h-6 w-1/2 bg-white/5 rounded mx-auto mb-10" />
        <div className="h-14 w-56 bg-white/10 rounded-full mx-auto" />
      </div>
    </main>
  );
}
