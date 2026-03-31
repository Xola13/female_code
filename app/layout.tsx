// ============================================================
// Luna Beauty — Root Layout
// ============================================================

import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/react'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { AffiliateDisclosure } from '@/components/AffiliateDisclosure'
import { ProfileTracker } from '@/components/ProfileTracker'
import { LunaChat } from '@/components/LunaChat'
import '@/app/globals.css'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://lunabeauty.shop'

export const metadata: Metadata = {
  title: {
    default: 'Luna Beauty — Luxury Beauty, Curated by AI',
    template: '%s | Luna Beauty',
  },
  description:
    'Discover luxury beauty products hand-picked for you by Luna AI. Shop Fenty, Rare Beauty, Charlotte Tilbury, Dior, Olaplex, and more — all via Amazon with expert AI guidance.',
  keywords: [
    'luxury beauty',
    'skincare',
    'makeup',
    'haircare',
    'beauty products',
    'Fenty Beauty',
    'Charlotte Tilbury',
    'AI beauty advisor',
    'Amazon beauty',
  ],
  authors: [{ name: 'Luna Beauty' }],
  creator: 'Luna Beauty',
  metadataBase: new URL(APP_URL),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: APP_URL,
    title: 'Luna Beauty — Luxury Beauty, Curated by AI',
    description:
      'Your personal AI beauty advisor. Shop luxury beauty products from Fenty, Dior, Charlotte Tilbury & more.',
    siteName: 'Luna Beauty',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Luna Beauty — Luxury Beauty Curated by AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Luna Beauty — Luxury Beauty, Curated by AI',
    description: 'Your personal AI beauty advisor — luxury beauty products, perfectly matched to you.',
    images: ['/og-image.jpg'],
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
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FDF6F0' },
    { media: '(prefers-color-scheme: dark)', color: '#1a0d11' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to Google Fonts and Amazon for faster loads */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <link rel="preconnect" href="https://m.media-amazon.com" />
      </head>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {/* Affiliate disclosure — required by Amazon Associates */}
          <AffiliateDisclosure />

          {/* Navigation */}
          <Navigation />

          {/* Main content */}
          <main className="flex-1">{children}</main>

          {/* Footer */}
          <Footer />

          {/* Luna AI Chatbot — floating, persistent */}
          <LunaChat />

          {/* Passive behavioral tracker (invisible) */}
          <ProfileTracker />

          {/* Toast notifications */}
          <Toaster
            position="bottom-right"
            toastOptions={{
              classNames: {
                toast: 'bg-card border border-border text-foreground',
                description: 'text-muted-foreground',
                actionButton: 'bg-primary text-primary-foreground',
              },
            }}
          />
        </ThemeProvider>

        {/* Vercel Analytics — automatic, zero-config */}
        <Analytics />
      </body>
    </html>
  )
}
