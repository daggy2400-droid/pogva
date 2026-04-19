import { cookies } from 'next/headers'
import { isValidLocale, type Locale } from '@/lib/utils/i18n'
import { getDictionary } from '@/lib/i18n/getDictionary'
import { HeroSection } from '@/components/home/Hero'
import { NewArrivals } from '@/components/home/NewArrivals'
import { QuickLinks } from '@/components/home/QuickLinks'

export default async function HomePage() {
  // Read same cookie as layout so server-rendered content matches
  const cookieStore = await cookies()
  const langCookie = cookieStore.get('lang')?.value
  const locale: Locale = isValidLocale(langCookie ?? '') ? (langCookie as Locale) : 'en'
  const dict = await getDictionary(locale)
  const newArrivalsLabel = (dict as Record<string, Record<string, string>>).home?.new_arrivals ?? 'New Arrivals'

  return (
    <>
      <HeroSection dict={dict} />
      <NewArrivals newArrivalsLabel={newArrivalsLabel} />
      <QuickLinks dict={dict} />
    </>
  )
}
