'use client'

import Link from 'next/link'
import { Phone, Mail, MapPin } from 'lucide-react'
import { siteConfig } from '@/config/siteConfig'
import { useTranslation } from '@/hooks/useTranslation'

export function Footer() {
  const { t } = useTranslation()

  const links = [
    { href: '/products', label: t('nav.products') },
    { href: '/about', label: t('footer.about_us') },
    { href: '/contact', label: t('nav.contact') },
    { href: '/policy', label: t('footer.privacy_policy') },
  ]

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <h3 className="text-white font-bold text-lg mb-3">{siteConfig.name}</h3>
          <p className="text-sm text-gray-400 mb-4">{siteConfig.tagline}</p>
          <div className="flex gap-3">
            <a href={siteConfig.social.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors text-sm">Instagram</a>
            <a href={siteConfig.social.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors text-sm">Facebook</a>
            <a href={siteConfig.social.telegram} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors text-sm">Telegram</a>
          </div>
        </div>

        {/* Links */}
        <div>
          <h4 className="text-white font-semibold mb-3">{t('footer.quick_links')}</h4>
          <ul className="space-y-2 text-sm">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-3">{t('nav.contact')}</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 shrink-0" />
              <a href={`tel:${siteConfig.phone}`} className="hover:text-white">{siteConfig.phone}</a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 shrink-0" />
              <a href={`mailto:${siteConfig.email}`} className="hover:text-white">{siteConfig.email}</a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{siteConfig.address}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} {siteConfig.name}. {t('footer.all_rights')}
      </div>
    </footer>
  )
}
