import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export const metadata: Metadata = {
  title: "RealiTea — Reality TV news, in 60 words",
  description:
    "The world's reality-TV headlines, aggregated from across the internet and summarized by AI. Swipe through the latest from Big Brother, Love Island, Bigg Boss, Drag Race and more.",
  applicationName: "RealiTea",
  openGraph: {
    title: "RealiTea — Reality TV news, in 60 words",
    description:
      "Worldwide reality-TV headlines, AI-summarized into bite-size cards.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#cc9d42",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {ADSENSE_CLIENT ? (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        ) : null}
      </head>
      <body>{children}</body>
    </html>
  );
}
