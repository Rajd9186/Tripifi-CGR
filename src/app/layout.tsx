import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Tripifi CGR — Your trip. Your way.",
    template: "%s | Tripifi CGR",
  },
  description:
    "Plan, personalize and book your entire Indian journey in one place. Don't just book a ticket. Build the entire journey.",
  keywords: [
    "Tripifi CGR",
    "travel India",
    "flight booking",
    "train booking",
    "cab booking",
    "trip planner",
    "travel packages",
    "India travel",
    "custom trip",
    "journey planner",
  ],
  authors: [{ name: "Tripifi CGR" }],
  creator: "Tripifi CGR",
  publisher: "Tripifi CGR",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://tripifi.in"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://tripifi.in",
    siteName: "Tripifi CGR",
    title: "Tripifi CGR — Your trip. Your way.",
    description: "Plan, personalize and book your entire Indian journey in one place.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80",
        width: 1600,
        height: 900,
        alt: "Tripifi CGR - Indian Travel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tripifi CGR — Your trip. Your way.",
    description: "Plan, personalize and book your entire Indian journey in one place.",
    images: ["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#05070F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className="bg-bg font-body text-text antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
