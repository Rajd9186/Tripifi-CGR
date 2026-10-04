import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/store";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-display" });

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
    description:
      "Plan, personalize and book your entire Indian journey in one place. Don't just book a ticket. Build the entire journey.",
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
    description:
      "Plan, personalize and book your entire Indian journey in one place.",
    images: ["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <body className="bg-cream-50 text-ink-900 font-sans antialiased">
        <AppProvider>
          <div className="min-h-screen flex flex-col overflow-x-hidden">
            {children}
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
