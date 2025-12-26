import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@tengra/language";
import { loadTranslations } from "@tengra/language/server";
import translationConfig from "@/tl.config";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" });

const BASE_URL = "https://velora.tengra.studio";

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: "Velora — Ücretsiz & Sınırsız Dosya Dönüştürücü",
      template: "%s | Velora",
    },
    description: "Resim, video ve ses dosyalarını anında, sınırsız ve tamamen ücretsiz dönüştürün. HEIC, MP4, MP3, WAV ve 60+ format desteği. Kayıt gerektirmez.",
    keywords: [
      "dosya dönüştürücü", "online file converter", "heic to jpg", "heic dönüştürücü",
      "video dönüştürücü", "mp4 dönüştürücü", "ücretsiz dosya dönüştürme",
      "sınırsız dönüştürücü", "raw convert", "webp to png", "png to jpg",
      "tengra studio", "velora"
    ],
    authors: [{ name: "Tengra Studio", url: "https://tengra.studio" }],
    creator: "Tengra Studio",
    publisher: "Tengra Studio",
    alternates: {
      canonical: "/",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      url: BASE_URL,
      siteName: "Velora",
      title: "Velora — Ücretsiz & Sınırsız Dosya Dönüştürücü",
      description: "60+ format desteğiyle her türlü dosyayı saniyeler içinde ücretsiz dönüştürün. Kayıt yok, sınır yok.",
      images: [
        {
          url: "https://cdn.tengra.studio/uploads/tengra_without_text.png",
          width: 1200,
          height: 630,
          alt: "Velora File Converter",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Velora — Ücretsiz & Sınırsız Dosya Dönüştürücü",
      description: "Tüm cihazlarda çalışan sınırsız dosya dönüştürme aracı.",
      images: ["https://cdn.tengra.studio/uploads/tengra_without_text.png"],
      creator: "@tengrastudio",
    },
    icons: {
      icon: "/velora-logo.svg",
      shortcut: "/logo.png",
      apple: "/logo.png",
    },
  };
}

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
