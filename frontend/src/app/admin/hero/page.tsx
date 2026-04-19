'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, Image as ImageIcon, Video, Layers } from 'lucide-react'
import {
  adminGetSlides, adminCreateSlide, adminUpdateSlide, adminDeleteSlide,
  type HeroSlide, type HeroSlidePayload,
} from '@/lib/api/hero'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

const TYPE_ICONS = {
  image: ImageIcon,
  video: Video,
  mixed: Layers,
}

const TYPE_LABELS = {
  image: 'Fixed Image',
  video: 'Video',
  mixed: 'Image + Video',
}

const EMPTY: HeroSlidePayload = {
  type: 'image',
  image_url: '',
  video_url: '',
  title: '',
  subtitle: '',
  cta_label: 'Shop Now',
  cta_url: '/products',
  sort_order: 0,
  is_active: true,
}

export default function AdminHeroPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<HeroSlide | null>(null)
  const [form, setForm] = useState<HeroSlidePayload>(EMPTY)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const load = useCallback(async () => {
    try {
      setSlides(await adminGetSlides())
    } catch {
      setError('Failed to load slides')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function openCreate() {
    setEditing(null)
    setForm({ ...EMPTY, sort_order: slides.length })
    setShowForm(true)
    setError('')
  }

  function openEdit(s: HeroSlide) {
    setEditing(s)
    setForm({
      type: s.type,
      image_url: s.image_url ?? '',
      video_url: s.video_url ?? '',
      title: s.title ?? '',
      subtitle: s.subtitle ?? '',
      cta_label: s.cta_label ?? '',
      cta_url: s.cta_url ?? '',
      sort_order: s.sort_order,
      is_active: s.is_active,
    })
    setShowForm(true)
    setError('')
  }

  async function handleSave() {
    setError('')
    // Validate
    if (form.type === 'image' && !form.image_url?.trim()) {
      setError('Image URL is required for image slides')
      return
    }
    if (form.type === 'video' && !form.video_url?.trim()) {
      setError('Video URL is required for video slides')
      return
    }
    if (form.type === 'mixed' && (!form.image_url?.trim() || !form.video_url?.trim())) {
      setError('Both image and video URLs are required for mixed slides')
      return
    }

    setSaving(true)
    try {
      const payload: HeroSlidePayload = {
        ...form,
        image_url: form.image_url?.trim() || null,
        video_url: form.video_url?.trim() || null,
        title: form.title?.trim() || null,
        subtitle: form.subtitle?.trim() || null,
        cta_label: form.cta_label?.trim() || null,
        cta_url: form.cta_url?.trim() || null,
      }
      if (editing) {
        await adminUpdateSlide(editing.id, payload)
      } else {
        await adminCreateSlide(payload)
      }
      await load()
      setShowForm(false)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save slide')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    try {
      await adminDeleteSlide(id)
      await load()
    } catch {
      setError('Failed to delete slide')
    } finally {
      setDeleteId(null)
    }
  }

  async function toggleActive(s: HeroSlide) {
    try {
      await adminUpdateSlide(s.id, {
        type: s.type,
        image_url: s.image_url,
        video_url: s.video_url,
        title: s.title,
        subtitle: s.subtitle,
        cta_label: s.cta_label,
        cta_url: s.cta_url,
        sort_order: s.sort_order,
        is_active: !s.is_active,
      })
      await load()
    } catch {
      setError('Failed to update slide')
    }
  }

  if (loading) return <LoadingSpinner className="py-20" />

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Hero Slides</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage homepage hero — images, videos, or mixed</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Slide
        </button>
      </div>

      {error && !showForm && (
        <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">{error}</p>
      )}

      {/* Slide list */}
      {slides.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <Layers className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No slides yet. Add your first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map((s) => {
            const TypeIcon = TYPE_ICONS[s.type]
            return (
              <div
                key={s.id}
                className={`flex items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl border p-4 transition-opacity ${
                  s.is_active ? 'border-gray-100 dark:border-gray-800' : 'border-dashed border-gray-200 dark:border-gray-700 opacity-60'
                }`}
              >
                <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />

                {/* Preview thumbnail */}
                <div className="w-20 h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0 relative">
                  {s.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.image_url} alt="" className="w-full h-full object-cover" />
                  ) : s.video_url ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="w-6 h-6 text-gray-400" />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 px-2 py-0.5 rounded-full">
                      <TypeIcon className="w-3 h-3" />
                      {TYPE_LABELS[s.type]}
                    </span>
                    <span className="text-xs text-gray-400">#{s.sort_order}</span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
                    {s.title ?? <span className="text-gray-400 italic">No title</span>}
                  </p>
                  {s.subtitle && (
                    <p className="text-xs text-gray-400 truncate">{s.subtitle}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleActive(s)}
                    title={s.is_active ? 'Hide slide' : 'Show slide'}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {s.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => openEdit(s)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-brand-600 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(s.id)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Slide form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-bold text-gray-900 dark:text-gray-100">
                {editing ? 'Edit Slide' : 'New Slide'}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {/* Type selector */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Slide Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['image', 'video', 'mixed'] as const).map((t) => {
                    const Icon = TYPE_ICONS[t]
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, type: t }))}
                        className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-medium transition-all ${
                          form.type === t
                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                            : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {TYPE_LABELS[t]}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Image URL */}
              {(form.type === 'image' || form.type === 'mixed') && (
                <Field
                  label="Image URL"
                  required
                  value={form.image_url ?? ''}
                  onChange={(v) => setForm((f) => ({ ...f, image_url: v }))}
                  placeholder="https://images.unsplash.com/..."
                />
              )}

              {/* Video URL */}
              {(form.type === 'video' || form.type === 'mixed') && (
                <Field
                  label="Video URL"
                  required
                  value={form.video_url ?? ''}
                  onChange={(v) => setForm((f) => ({ ...f, video_url: v }))}
                  placeholder="https://example.com/video.mp4"
                  hint="MP4 or WebM direct link. YouTube/Vimeo embeds not supported."
                />
              )}

              {/* Live preview */}
              {(form.type === 'image' || form.type === 'mixed') && form.image_url?.trim() && (
                <div className="rounded-xl overflow-hidden h-36 bg-gray-100 dark:bg-gray-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.image_url}
                    alt="preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                </div>
              )}

              <Field label="Title" value={form.title ?? ''} onChange={(v) => setForm((f) => ({ ...f, title: v }))} placeholder="Premium Ethiopian Footwear" />
              <Field label="Subtitle" value={form.subtitle ?? ''} onChange={(v) => setForm((f) => ({ ...f, subtitle: v }))} placeholder="Handcrafted shoes for every occasion" />

              <div className="grid grid-cols-2 gap-3">
                <Field label="CTA Button Label" value={form.cta_label ?? ''} onChange={(v) => setForm((f) => ({ ...f, cta_label: v }))} placeholder="Shop Now" />
                <Field label="CTA URL" value={form.cta_url ?? ''} onChange={(v) => setForm((f) => ({ ...f, cta_url: v }))} placeholder="/products" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Sort Order</label>
                  <input
                    type="number"
                    min={0}
                    value={form.sort_order}
                    onChange={(e) => setForm((f) => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div className="flex items-end pb-0.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_active ?? true}
                      onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                      className="w-4 h-4 rounded accent-brand-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Active (visible)</span>
                  </label>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex gap-3 justify-end">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 text-sm font-semibold bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Slide'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Delete slide?</h3>
            <p className="text-sm text-gray-500 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)} className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({
  label, value, onChange, placeholder, required, hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  hint?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}
