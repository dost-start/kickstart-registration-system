import localFont from "next/font/local";
import type { Metadata } from "next";
import "./globals.css";

const garetBook = localFont({
  src: "../assets/Garet-Book.otf",
  variable: "--font-garet-book",
  display: "swap",
});

const kagitinganBold = localFont({
  src: "../assets/Kagitingan-Bold.otf",
  variable: "--font-kagitingan-bold",
  display: "swap",
});

const monument = localFont({
  src: "../assets/Monument.otf",
  variable: "--font-monument",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KickSTART 2026",
  description:
    "KickSTART 2026 is the official General Assembly uniting DOST-SEI scholars across Luzon, Visayas, and Mindanao for innovation, collaboration, and nation-building.",
  keywords: [
    "kickstart",
    "luzon",
    "2026",
    "DOST",
    "scholars",
    "assembly",
    "START",
    "technology",
    "innovation",
    "nation-building",
    "Philippines",
    "Region IV-A",
    "Batangas",
  ],
  authors: [{ name: "START - DOST Scholars" }],
  openGraph: {
    title: "KickSTART 2026",
    description:
      "KickSTART 2026 is the official General Assembly uniting DOST-SEI scholars across Luzon, Visayas, and Mindanao for innovation and nation-building.",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "KickSTART 2026",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KickSTART 2026",
    description:
      "KickSTART 2026 is the official General Assembly uniting DOST-SEI scholars across Luzon, Visayas, and Mindanao for innovation and nation-building.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`
          ${garetBook.variable} ${kagitinganBold.variable} ${monument.variable} ${garetBook.className}
          antialiased
        `}
      >
        {children}
      </body>
    </html>
  );
}
