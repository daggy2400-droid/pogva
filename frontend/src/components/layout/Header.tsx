'use client'

import Link from 'next/link'
import { ShoppingBag, Menu, X, Phone } from 'lucide-react'
import { useState } from 'react'
import { ThemeToggle } from './ThemeToggle'
import { SearchBar } from '@/components/ui/SearchBar'
import { siteConfig } from '@/config/siteConfig'
import { getLocaleLabel, locales } from '@/lib/utils/i18n'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'

export function Header() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const router = useRouter()
  const { locale } = useTranslation()

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ]

  function handleSearch(v: string) {
    setSearch(v)
    if (v.trim()) {
      router.push(`/products?search=${encodeURIComponent(v.trim())}`)
    }
  }

  function switchLocale(newLocale: string) {
    document.cookie = `lang=${newLocale};path=/;max-age=31536000`
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-brand-600 dark:text-brand-400 shrink-0">
            <ShoppingBag className="w-6 h-6" />
            <span className="hidden sm:inline">{siteConfig.name}</span>
          </Link>

          {/* Search — desktop */}
          <SearchBar value={search} onChange={handleSearch} placeholder="Search products..." className="hidden md:block flex-1 max-w-sm" />

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-5">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm font-medium text-gray-600 hover:text-brand-600 dark:text-gray-300 dark:hover:text-brand-400 transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <a href={`tel:${siteConfig.phone}`} className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline">
              <Phone className="w-3.5 h-3.5" />
              {siteConfig.phone}
            </a>

            <select
              value={locale}
              onChange={(e) => switchLocale(e.target.value)}
              className="text-xs bg-transparent border border-gray-300 dark:border-gray-700 rounded px-1 py-0.5 cursor-pointer"
              aria-label="Select language"
            >
              {locales.map((l) => (
                <option key={l} value={l}>{getLocaleLabel(l)}</option>
              ))}
            </select>

            <ThemeToggle />

            <button className="lg:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setOpen(!open)} aria-label="Toggle menu">
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden pb-3">
          <SearchBar value={search} onChange={handleSearch} placeholder="Search products..." />
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-3 space-y-1">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-brand-600">
              {l.label}
            </Link>
          ))}
          <a href={`tel:${siteConfig.phone}`} className="flex items-center gap-2 py-2 text-sm font-medium text-brand-600">
            <Phone className="w-4 h-4" />
            {siteConfig.phone}
          </a>
        </div>
      )}
    </header>
  )
}
