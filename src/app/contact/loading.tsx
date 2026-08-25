/**
 * Route-level loading state for /contact, shown by Next.js during the
 * initial navigation/hydration to this page. The page itself has no async
 * server data — this exists purely to avoid a blank flash on slower
 * connections while the client bundle for the form hydrates.
 */
export default function ContactLoading() {
  return (
    <main className="min-h-screen pt-20 bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-pulse">
        <div className="text-center mb-12">
          <div className="h-4 w-24 bg-white/10 rounded mx-auto mb-4" />
          <div className="h-10 w-2/3 bg-white/10 rounded mx-auto mb-4" />
          <div className="h-6 w-1/2 bg-white/5 rounded mx-auto" />
        </div>
        <div className="bg-white/5 rounded-2xl p-8 border border-white/10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-12 bg-white/5 rounded-lg" />
            <div className="h-12 bg-white/5 rounded-lg" />
            <div className="h-12 bg-white/5 rounded-lg" />
            <div className="h-12 bg-white/5 rounded-lg" />
          </div>
          <div className="h-32 bg-white/5 rounded-lg" />
          <div className="h-14 bg-white/10 rounded-full" />
        </div>
      </div>
    </main>
  );
}
