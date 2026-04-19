'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getPublicSlides, type HeroSlide } from '@/lib/api/hero'

interface Props {
  dict: Record<string, unknown>
}

function t(dict: Record<string, unknown>, key: string): string {
  const parts = key.split('.')
  let cur: unknown = dict
  for (const p of parts) {
    if (typeof cur !== 'object' || cur === null) return key
    cur = (cur as Record<string, unknown>)[p]
  }
  return typeof cur === 'string' ? cur : key
}

// Fallback slide when API is unavailable
function fallbackSlide(dict: Record<string, unknown>): HeroSlide {
  return {
    id: 0,
    type: 'image',
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1800&q=85&auto=format&fit=crop',
    video_url: null,
    title: t(dict, 'home.hero_title'),
    subtitle: t(dict, 'home.hero_subtitle'),
    cta_label: t(dict, 'home.shop_now'),
    cta_url: '/products',
    sort_order: 0,
    is_active: true,
    created_at: '',
    updated_at: '',
  }
}

// ─── Single slide renderer ────────────────────────────────────────────────────
function SlideContent({ slide, dict, active }: {
  slide: HeroSlide
  dict: Record<string, unknown>
  active: boolean
}) {
  const ctaHref = slide.cta_url ?? '/products'

  return (
    <div
      className={`absolute inset-0 transition-opacity duration-700 ${active ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
      aria-hidden={!active}
    >
      {/* Background media */}
      {(slide.type === 'image' || slide.type === 'mixed') && slide.image_url && (
        <Image
          src={slide.image_url}
          alt={slide.title ?? 'Hero'}
          fill
          priority={active}
          sizes="100vw"
          className="object-cover object-center"
        />
      )}

      {(slide.type === 'video' || slide.type === 'mixed') && slide.video_url && (
        <video
          src={slide.video_url}
          autoPlay
          muted
          loop
          playsInline
          className={`absolute inset-0 w-full h-full object-cover ${
            slide.type === 'mixed' ? 'opacity-60' : ''
          }`}
        />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/35 to-black/65" />
      <div className="absolute inset-0 bg-brand-900/15 mix-blend-multiply" />

      {/* Text content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
        <span className="inline-block mb-4 px-4 py-1.5 rounded-full border border-brand-300/60 bg-brand-500/20 backdrop-blur-sm text-brand-200 text-sm font-medium tracking-widest uppercase">
          Samson Fashion
        </span>

        {slide.title && (
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-5 drop-shadow-lg max-w-3xl text-balance">
            {slide.title}
          </h1>
        )}

        {slide.subtitle && (
          <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-xl leading-relaxed">
            {slide.subtitle}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 active:bg-brand-600 text-white font-semibold px-9 py-4 rounded-full transition-all duration-200 shadow-lg shadow-brand-900/40 hover:shadow-brand-500/40 hover:-translate-y-0.5"
          >
            {slide.cta_label ?? t(dict, 'home.shop_now')}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
            </svg>
          </Link>
          <Link
            href={`/about`}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold px-9 py-4 rounded-full border border-white/30 transition-all duration-200 hover:-translate-y-0.5"
          >
            Our Story
          </Link>
        </div>

        {/* Trust badges — only on first/active slide */}
        <div className="mt-12 flex flex-wrap justify-center gap-6 text-white/60 text-sm">
          <span className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-brand-400">
              <path fillRule="evenodd" d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
            </svg>
            Handcrafted Quality
          </span>
          <span className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-brand-400">
              <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.154.75.75 0 0 0 0-1.115A28.897 28.897 0 0 0 3.105 2.288Z" />
            </svg>
            Cash on Delivery
          </span>
          <span className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-brand-400">
              <path fillRule="evenodd" d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z" clipRule="evenodd" />
            </svg>
            Addis Ababa Delivery
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Main HeroSection ─────────────────────────────────────────────────────────
export function HeroSection({ dict }: Props) {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [current, setCurrent] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    getPublicSlides()
      .then((data) => setSlides(data.length > 0 ? data : [fallbackSlide(dict)]))
      .catch(() => setSlides([fallbackSlide(dict)]))
  }, [dict])

  // Auto-advance slideshow when multiple slides
  useEffect(() => {
    if (slides.length <= 1) return
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length)
    }, 6000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [slides.length])

  const goTo = useCallback((idx: number) => {
    setCurrent(idx)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length)
    }, 6000)
  }, [slides.length])

  // Show nothing until slides load (avoids layout shift)
  if (slides.length === 0) {
    return (
      <section className="relative h-[92vh] min-h-[560px] bg-gray-900 animate-pulse" />
    )
  }

  return (
    <section className="relative h-[92vh] min-h-[560px] overflow-hidden">
      {slides.map((slide, i) => (
        <SlideContent
          key={slide.id}
          slide={slide}
          dict={dict}
          active={i === current}
        />
      ))}

      {/* Dot navigation — only when multiple slides */}
      {slides.length > 1 && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-6 h-2 bg-white'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}

      {/* Prev / Next arrows — only when multiple slides */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => goTo((current - 1 + slides.length) % slides.length)}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={() => goTo((current + 1) % slides.length)}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </button>
        </>
      )}

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 text-white/40 text-xs animate-bounce">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
        </svg>
      </div>
    </section>
  )
}
