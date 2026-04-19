import { Star } from 'lucide-react'

interface Props {
  rating: number
  max?: number
  size?: 'sm' | 'md'
  showValue?: boolean
  count?: number
}

export function StarRating({ rating, max = 5, size = 'sm', showValue, count }: Props) {
  const sz = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5'
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`${sz} ${i < Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
        />
      ))}
      {showValue && (
        <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
          {rating.toFixed(1)}{count !== undefined ? ` (${count})` : ''}
        </span>
      )}
    </span>
  )
}
