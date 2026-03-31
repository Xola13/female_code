import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-luna-berry to-luna-gold flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-display font-semibold text-lg">Luna Beauty</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-curated luxury beauty products, perfectly matched to you. Powered by Luna Mind.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Shop</h3>
            <ul className="space-y-2">
              {[
                { href: '/products', label: 'All Products' },
                { href: '/products?category=Skincare', label: 'Skincare' },
                { href: '/products?category=Foundation', label: 'Makeup' },
                { href: '/products?category=Haircare', label: 'Haircare' },
                { href: '/products?category=Fragrance', label: 'Fragrance' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Discover */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Discover</h3>
            <ul className="space-y-2">
              {[
                { href: '/quiz', label: 'Beauty Quiz' },
                { href: '/recommendations', label: 'My AI Picks' },
                { href: '/products?bestseller=true', label: 'Bestsellers' },
                { href: '/products?featured=true', label: 'Featured' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Legal</h3>
            <ul className="space-y-2">
              {[
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/privacy#affiliate', label: 'Affiliate Disclosure' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Affiliate Disclosure */}
        <div className="border-t border-border pt-6">
          <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl mb-3">
            <strong>Affiliate Disclosure:</strong> Luna Beauty is a participant in the Amazon Services
            LLC Associates Program, an affiliate advertising program designed to provide a means for
            sites to earn advertising fees by advertising and linking to Amazon.com. As an Amazon
            Associate, we earn from qualifying purchases. Prices and availability are subject to
            change. Product images may differ from actual products.
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Luna Beauty. All rights reserved. Powered by{' '}
            <span className="text-primary">Luna Mind AI</span>.
          </p>
        </div>
      </div>
    </footer>
  )
}
