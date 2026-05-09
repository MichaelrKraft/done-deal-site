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
