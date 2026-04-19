'use client'

import { siteConfig } from '@/config/siteConfig'
import { useTranslation } from '@/hooks/useTranslation'

export default function PolicyPage() {
  const { t } = useTranslation()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('policy.title')}</h1>

      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t('policy.privacy_title')}</h2>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <p>{t('policy.privacy_p1')}</p>
          <p>{t('policy.privacy_p2')}</p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t('policy.shipping_title')}</h2>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <p>{t('policy.shipping_p1')}</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>{t('policy.shipping_addis')}</li>
            <li>{t('policy.shipping_cities')}</li>
            <li>{t('policy.shipping_remote')}</li>
          </ul>
          <p>{t('policy.shipping_p2')}</p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t('policy.returns_title')}</h2>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <p>{t('policy.returns_p1')}</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>{t('policy.returns_r1')}</li>
            <li>{t('policy.returns_r2')}</li>
            <li>{t('policy.returns_r3')}</li>
            <li>{t('policy.returns_r4')}</li>
          </ul>
          <p>
            {t('policy.returns_cta')}{' '}
            <a href={`tel:${siteConfig.phone}`} className="text-brand-600 dark:text-brand-400 hover:underline font-medium">
              {siteConfig.phone}
            </a>
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t('policy.order_title')}</h2>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <p>{t('policy.order_p1')}</p>
          <p>{t('policy.order_p2')}</p>
        </div>
      </section>
    </div>
  )
}
