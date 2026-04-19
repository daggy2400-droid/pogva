'use client'

import { Phone, MessageCircle, Instagram } from 'lucide-react'
import { siteConfig } from '@/config/siteConfig'
import { useTranslation } from '@/hooks/useTranslation'

export function QuickLinks({ dict: _ }: { dict: Record<string, unknown> }) {
  const { t } = useTranslation()

  return (
    <section className="bg-brand-600 dark:bg-brand-800 py-12 px-4">
      <div className="max-w-4xl mx-auto text-center text-white">
        <h2 className="text-2xl font-bold mb-2">{t('quicklinks.title')}</h2>
        <p className="text-brand-100 mb-8">{t('quicklinks.subtitle')}</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href={`tel:${siteConfig.phone}`}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-5 py-2.5 rounded-full transition-colors"
          >
            <Phone className="w-4 h-4" />
            {siteConfig.phone}
          </a>
          <a
            href={`https://wa.me/${siteConfig.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 px-5 py-2.5 rounded-full transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
          <a
            href={siteConfig.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-5 py-2.5 rounded-full transition-colors"
          >
            <Instagram className="w-4 h-4" />
            Instagram
          </a>
        </div>
      </div>
    </section>
  )
}
