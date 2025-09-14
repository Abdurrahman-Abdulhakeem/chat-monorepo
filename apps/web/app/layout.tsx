import Providers from "@/contexts/AllProviders";
import "./globals.css";
import { ReactNode } from "react";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: {
    default: "Chat Monorepo - Modern Real-Time Chat Application",
    template: "%s | Chat Monorepo",
  },
  description:
    "A modern, scalable real-time chat application with instant messaging, voice notes, voice-to-text transcription, and secure authentication. Built with React, Next.js, Socket.io, and MongoDB.",

  keywords: [
    "real-time chat",
    "instant messaging",
    "voice notes",
    "voice-to-text",
    "Socket.io",
    "React chat app",
    "Next.js chat",
    "TypeScript chat",
    "MongoDB chat",
    "secure messaging",
    "responsive chat app",
    "PWA chat",
    "modern chat application",
  ],

  authors: [
    {
      name: "Abdurrahman Abdulhakeem",
      url: "https://abdurrahman.ng",
    },
  ],

  creator: "Abdurrahman Abdulhakeem",
  publisher: "Abdurrahman Abdulhakeem",

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

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://chat-monorepo.vercel.app",
    title: "Chat Monorepo - Modern Real-Time Chat Application",
    description:
      "Experience seamless real-time communication with voice notes, instant messaging, and advanced features. Built with modern web technologies for optimal performance.",
    siteName: "Chat Monorepo",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Chat Monorepo - Modern Real-Time Chat Application Screenshot",
      },
      {
        url: "/og-image-square.jpg", // Square version for some platforms
        width: 1080,
        height: 1080,
        alt: "Chat Monorepo App Icon",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Chat Monorepo - Modern Real-Time Chat Application",
    description:
      "Experience seamless real-time communication with voice notes, instant messaging, and advanced features.",
    creator: "@rammyscript",
    site: "@rammyscript",
    images: ["/og-image.jpg"],
  },

  alternates: {
    canonical: "https://chat-monorepo.vercel.app",
  },

  category: "technology",

  // PWA and mobile app metadata
  applicationName: "Chat Monorepo",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Chat Monorepo",
    startupImage: [
      {
        url: "/splash/iphone5_splash.png",
        media:
          "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/splash/iphone6_splash.png",
        media:
          "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/splash/iphoneplus_splash.png",
        media:
          "(device-width: 621px) and (device-height: 1104px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/splash/iphonex_splash.png",
        media:
          "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/splash/iphonexr_splash.png",
        media:
          "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/splash/iphonexsmax_splash.png",
        media:
          "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/splash/ipad_splash.png",
        media:
          "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)",
      },
    ],
  },

  formatDetection: {
    telephone: false,
  },

  // verification: {
  //   google: 'your-google-verification-code',
  // },

  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: "dark light",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://res.cloudinary.com" />

        {/* DNS prefetch for third-party domains */}
        <link rel="dns-prefetch" href="//vercel.app" />
        <link rel="dns-prefetch" href="//render.com" />

        {/* PWA Icons */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#0a0a0a" />
        <meta name="msapplication-TileColor" content="#0a0a0a" />

        {/* Additional PWA meta tags */}
        <meta name="application-name" content="Chat Monorepo" />
        <meta
          name="msapplication-tooltip"
          content="Modern Real-Time Chat Application"
        />
        <meta name="msapplication-starturl" content="/" />
        <meta name="msapplication-navbutton-color" content="#0a0a0a" />

        {/* Structured Data for Rich Snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Chat Monorepo",
              description:
                "A modern, scalable real-time chat application with instant messaging, voice notes, voice-to-text transcription, and secure authentication.",
              url: "https://chat-monorepo.vercel.app",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "150",
              },
              author: {
                "@type": "Person",
                name: "Abdurrahman Abdulhakeem",
                url: "https://abdurrahman.ng",
                sameAs: [
                  "https://github.com/Abdurrahman-Abdulhakeem",
                  "https://x.com/rammyscript",
                  "https://www.linkedin.com/in/abdurrahman-abdulhakeem-322890239",
                ],
              },
              datePublished: "2025-08-01",
              dateModified: new Date().toISOString(),
              screenshot: "https://chat-monorepo.vercel.app/og-image.jpg",
              softwareVersion: "1.0.0",
              releaseNotes:
                "Initial release with real-time messaging, voice notes, and voice-to-text features.",
            }),
          }}
        />
      </head>
      <body
        className="bg-neutral-950 text-neutral-100"
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
