'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') ?? 'http://localhost:8080'

function resolveImageUrl(src: string): string {
  if (!src || src === '/placeholder.jpg') return ''
  if (src.startsWith('http')) return src
  return `${API_BASE}${src}`
}

interface Props {
  images: string[]
  name: string
}

export function ImageGallery({ images, name }: Props) {
  const [active, setActive] = useState(0)
  const [errors, setErrors] = useState<Record<number, boolean>>({})
  const list = images?.length ? images : []

  function prev() { setActive((i) => (i - 1 + list.length) % list.length) }
  function next() { setActive((i) => (i + 1) % list.length) }

  const Placeholder = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
      <svg className="w-16 h-16 mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span className="text-sm opacity-40">No image</span>
    </div>
  )

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
        {list.length > 0 && !errors[active] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolveImageUrl(list[active])}
            alt={`${name} - image ${active + 1}`}
            className="w-full h-full object-cover"
            onError={() => setErrors((e) => ({ ...e, [active]: true }))}
          />
        ) : (
          <Placeholder />
        )}
        {list.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-900/80 rounded-full p-1.5 hover:bg-white dark:hover:bg-gray-900 transition-colors" aria-label="Previous image">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-900/80 rounded-full p-1.5 hover:bg-white dark:hover:bg-gray-900 transition-colors" aria-label="Next image">
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {list.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {list.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-colors bg-gray-100 dark:bg-gray-800 ${
                i === active ? 'border-brand-500' : 'border-transparent'
              }`}
            >
              {!errors[i] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolveImageUrl(src)}
                  alt={`Thumbnail ${i + 1}`}
                  className="w-full h-full object-cover"
                  onError={() => setErrors((e) => ({ ...e, [i]: true }))}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-5 h-5 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
