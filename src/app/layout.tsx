import type { Metadata } from "next";
import { Inter, Lato } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const lato = Lato({
  variable: "--font-lato",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://done-deal.co"),
  title: "Done Deal - AI Transaction Coordination for Real Estate",
  description: "Stop overpaying for transaction coordination. AI TCs are half the cost of a human TC. Save up to 21 hours per transaction with Done Deal.",
  keywords: ["AI transaction coordination", "real estate", "TC", "transaction coordinator", "real estate automation"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Done Deal - AI Transaction Coordination",
    description: "AI-powered transaction coordination at 50% less than traditional services. 24/7 availability, zero human error.",
    type: "website",
    url: "https://done-deal.co",
    siteName: "Done Deal",
    images: [
      {
        url: "/dd-logo-landing.png",
        width: 1100,
        height: 440,
        alt: "Done Deal - AI Transaction Coordination for Real Estate",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Done Deal - AI Transaction Coordination",
    description: "AI-powered transaction coordination at 50% less than traditional services. 24/7 availability, zero human error.",
    images: ["/dd-logo-landing.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${lato.variable} antialiased bg-black text-white`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
