'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Sparkles, Sun, Moon, Menu, X, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function Navigation() {
  const { theme, setTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const navLinks = [
    { href: '/products', label: 'All Products' },
    { href: '/products?category=Skincare', label: 'Skincare' },
    { href: '/products?category=Foundation', label: 'Makeup' },
    { href: '/products?category=Haircare', label: 'Haircare' },
    { href: '/products?category=Fragrance', label: 'Fragrance' },
    { href: '/quiz', label: 'Beauty Quiz' },
    { href: '/recommendations', label: 'My Picks' },
  ]

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/products?q=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-luna-berry to-luna-gold flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-semibold text-xl tracking-tight">
              Luna <span className="text-luna-gradient">Beauty</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-full hover:bg-muted transition-colors lg:hidden"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-border"
            >
              <form onSubmit={handleSearch} className="py-3 flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for serums, foundations, lipstick..."
                  className="flex-1 px-4 py-2 rounded-full border border-border bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Search
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-border bg-background overflow-hidden"
          >
            <nav className="container py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
