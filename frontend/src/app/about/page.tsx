'use client'

import { useTranslation } from '@/hooks/useTranslation'
import { siteConfig } from '@/config/siteConfig'

export default function AboutPage() {
  const { t } = useTranslation()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        {t('about.title')} {siteConfig.name}
      </h1>
      <div className="space-y-4 text-gray-600 dark:text-gray-400">
        <p>{t('about.p1')}</p>
        <p>{t('about.p2')}</p>
        <p>{t('about.p3')}</p>

        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-8">{t('about.values_title')}</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>{t('about.v1')}</li>
          <li>{t('about.v2')}</li>
          <li>{t('about.v3')}</li>
          <li>{t('about.v4')}</li>
        </ul>

        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-8">{t('about.order_title')}</h2>
        <p>{t('about.order_p')}</p>
      </div>

      <div className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800 text-center">
        <p className="text-xs text-gray-400 dark:text-gray-600">
          Designed &amp; developed by{' '}
          <a href="https://yotor.dev" target="_blank" rel="noopener noreferrer"
            className="font-semibold text-brand-500 hover:text-brand-600 dark:text-brand-400">
            Yotor
          </a>
        </p>
      </div>
    </div>
  )
}
