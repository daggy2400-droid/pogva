'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { ThemeToggle } from './ThemeToggle'
import { siteConfig } from '@/config/siteConfig'
import { getLocaleLabel, locales } from '@/lib/utils/i18n'
import { useTranslation } from '@/hooks/useTranslation'

export function Navbar() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { t, locale } = useTranslation()

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/products', label: t('nav.products') },
    { href: '/about', label: t('nav.about') },
    { href: '/contact', label: t('nav.contact') },
  ]

  function switchLocale(newLocale: string) {
    document.cookie = `lang=${newLocale};path=/;max-age=31536000`
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-950/90 backdrop-blur border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-brand-600 dark:text-brand-400">
            <ShoppingBag className="w-6 h-6" />
            {siteConfig.name}
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-gray-600 hover:text-brand-600 dark:text-gray-300 dark:hover:text-brand-400 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Locale switcher — sets cookie, refreshes server component */}
            <select
              value={locale}
              onChange={(e) => switchLocale(e.target.value)}
              className="text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 cursor-pointer"
              aria-label="Select language"
            >
              {locales.map((l) => (
                <option key={l} value={l}>{getLocaleLabel(l)}</option>
              ))}
            </select>

            <ThemeToggle />

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-3 space-y-2">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-brand-600"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
