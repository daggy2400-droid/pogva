'use client'

import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react'
import { siteConfig } from '@/config/siteConfig'
import { useTranslation } from '@/hooks/useTranslation'

export default function ContactPage() {
  const { t } = useTranslation()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('contact.title')}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-10">{t('contact.subtitle')}</p>

      <div className="grid sm:grid-cols-2 gap-6">
        <a href={`tel:${siteConfig.phone}`}
          className="flex items-center gap-4 p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-brand-300 dark:hover:border-brand-700 transition-colors shadow-sm">
          <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center">
            <Phone className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">{t('contact.phone')}</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{siteConfig.phone}</p>
          </div>
        </a>

        <a href={`https://wa.me/${siteConfig.whatsapp}`} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-4 p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-green-300 transition-colors shadow-sm">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">{t('contact.whatsapp')}</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{siteConfig.phone}</p>
          </div>
        </a>

        <a href={`mailto:${siteConfig.email}`}
          className="flex items-center gap-4 p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-brand-300 dark:hover:border-brand-700 transition-colors shadow-sm">
          <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center">
            <Mail className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">{t('contact.email')}</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{siteConfig.email}</p>
          </div>
        </a>

        <div className="flex items-center gap-4 p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center">
            <MapPin className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">{t('contact.address')}</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{siteConfig.address}</p>
          </div>
        </div>
      </div>

      <div className="mt-10 p-5 bg-brand-50 dark:bg-brand-900/20 rounded-2xl">
        <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-1">{t('contact.hours_title')}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">{t('contact.hours_weekday')}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{t('contact.hours_weekend')}</p>
      </div>
    </div>
  )
}
