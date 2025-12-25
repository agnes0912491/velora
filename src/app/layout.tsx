import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@tengra/language";
import { loadTranslations } from "@tengra/language/server";
import translationConfig from "@/tl.config";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "Velora | Unlimited File Converter",
    template: "%s | Velora",
  },
  description: "Free, unlimited file conversion in your browser. Convert images, videos, audio, and documents with privacy-first technology. No upload, 100% client-side processing.",
  keywords: [
    "file converter",
    "dosya dönüştürücü",
    "image converter",
    "video converter",
    "audio converter",
    "free converter",
    "online converter",
    "privacy converter",
    "client-side converter",
    "ffmpeg browser",
    "webassembly converter",
  ],
  metadataBase: new URL("https://velora.tengra.studio"),
  alternates: {
    canonical: "https://velora.tengra.studio",
  },
  openGraph: {
    title: "Velora - Unlimited Free File Converter",
    description: "Convert any file format in your browser. 100% private, unlimited, and free.",
    url: "https://velora.tengra.studio",
    siteName: "Velora",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Velora - Free File Converter",
    description: "Convert files instantly in your browser. No uploads, unlimited conversions.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/velora-logo.svg",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Simple locale detection from cookies (fallback to 'en')
  const { cookies: getCookies } = await import('next/headers');
  const cookieStore = await getCookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;
  const locale = (localeCookie === 'tr' ? 'tr' : 'en') as 'en' | 'tr';

  // Load translations using config
  const dictionary = loadTranslations(translationConfig, locale);

  return (
    <html lang={locale}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Velora",
              "url": "https://velora.tengra.studio",
              "description": "Free, unlimited file converter. Convert images, videos, and audio files instantly.",
              "applicationCategory": "MultimediaApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "creator": {
                "@type": "Organization",
                "name": "Tengra Studio",
                "url": "https://tengra.studio"
              }
            })
          }}
        />
      </head>
      <body className={`${outfit.variable} font-sans antialiased`} style={{ background: '#1a1d24', color: '#e8eaed' }}>
        <LanguageProvider initialLanguage={locale} initialDictionary={dictionary}>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
