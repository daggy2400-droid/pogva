import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { cookies } from 'next/headers'
import { isValidLocale, type Locale } from '@/lib/utils/i18n'
import { getDictionary } from '@/lib/i18n/getDictionary'
import { DictionaryProvider } from '@/components/layout/DictionaryProvider'
import { Providers } from '@/components/layout/Providers'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { siteConfig } from '@/config/siteConfig'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.tagline,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const langCookie = cookieStore.get('lang')?.value
  const locale: Locale = isValidLocale(langCookie ?? '') ? (langCookie as Locale) : 'en'
  const dict = await getDictionary(locale)

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <DictionaryProvider dict={dict} locale={locale}>
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </DictionaryProvider>
        </Providers>
      </body>
    </html>
  )
}
