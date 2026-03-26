import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-[#2c2420] mb-2">404</h1>
        <p className="text-lg font-medium text-[#2c2420] mb-1">Page not found</p>
        <p className="text-sm text-[#7a6e63] mb-6">
          This page doesn&apos;t exist or you don&apos;t have access to it.
        </p>
        <Link
          href="/feed"
          className="rounded-lg bg-[#84c9d1] px-4 py-2 text-sm font-medium text-white hover:bg-[#6fb8c0] transition-colors"
        >
          Go to Feed
        </Link>
      </div>
    </div>
  )
}
