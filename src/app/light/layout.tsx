import type { Metadata } from 'next';

// /light duplicates / — keep it out of search indexes.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function LightLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        body {
          background-color: #faf8f5 !important;
          color: #2c2420 !important;
        }
      `}</style>
      {children}
    </>
  );
}
