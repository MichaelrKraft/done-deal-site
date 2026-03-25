import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Done Deal",
  description: "AI-powered transaction coordination for real estate agents",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.ico",
    apple: "/done-deal-flower.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-sd-bg text-sd-text antialiased">
        {children}
      </body>
    </html>
  );
}
