'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff, Upload } from 'lucide-react'
import {
  getAdminProducts, createProduct, updateProduct, deleteProduct,
} from '@/lib/api/products'
import { apiClient } from '@/lib/api/client'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { siteConfig } from '@/config/siteConfig'
import type { Product } from '@/lib/types'

const EMPTY_FORM = {
  name: '', description: '', price: '', category: '',
  stock: '', image_url: '', sizes: '', colors: '',
  is_active: true, is_premium: false,
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await getAdminProducts({ limit: 200 })
      setProducts(res.data)
    } catch {
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
    setError('')
  }

  function openEdit(p: Product) {
    setEditing(p)
    setForm({
      name: p.name,
      description: p.description ?? '',
      price: String(p.price),
      category: p.category,
      stock: String(p.stock),
      image_url: p.image_url ?? '',
      sizes: (p.sizes ?? []).join(', '),
      colors: (p.colors ?? []).join(', '),
      is_active: p.is_active,
      is_premium: p.is_premium,
    })
    setShowForm(true)
    setError('')
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await apiClient.post<{ success: boolean; data: { url: string } }>('/admin/images', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setForm((f) => ({ ...f, image_url: res.data.data.url }))
    } catch {
      setError('Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
    setError('')
    if (!form.name.trim() || !form.category || !form.price) {
      setError('Name, category and price are required')
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        category: form.category,
        stock: parseInt(form.stock) || 0,
        image_url: form.image_url.trim() || undefined,
        sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
        colors: form.colors.split(',').map((c) => c.trim()).filter(Boolean),
        is_active: form.is_active,
        is_premium: form.is_premium,
      }
      if (editing) {
        await updateProduct(editing.id, payload)
      } else {
        await createProduct(payload)
      }
      await load()
      setShowForm(false)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteProduct(id)
      await load()
    } catch {
      setError('Failed to delete product')
    } finally {
      setDeleteId(null)
    }
  }

  async function toggleActive(p: Product) {
    try {
      await updateProduct(p.id, { is_active: !p.is_active })
      await load()
    } catch {
      setError('Failed to update product')
    }
  }

  if (loading) return <LoadingSpinner className="py-20" />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Products</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {error && !showForm && (
        <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">{error}</p>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                {['Image', 'Name', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                      {p.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image_url.startsWith('http') ? p.image_url : `https://pogva.onrender.com${p.image_url}`} alt="" className="w-full h-full object-cover" />
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 max-w-[180px] truncate">{p.name}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.category}</td>
                  <td className="px-4 py-3 font-semibold text-brand-600 dark:text-brand-400 whitespace-nowrap">
                    {siteConfig.currency} {p.price.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
                      {p.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleActive(p)} title={p.is_active ? 'Hide' : 'Show'} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors">
                        {p.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-brand-600 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <p className="text-center py-12 text-gray-400 text-sm">No products yet.</p>
          )}
        </div>
      </div>

      {/* Product form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-bold text-gray-900 dark:text-gray-100">{editing ? 'Edit Product' : 'New Product'}</h2>
            </div>
            <div className="p-6 space-y-4">
              <Field label="Name" required value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="Product name" />

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Category <span className="text-red-500">*</span></label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Select category</option>
                  {siteConfig.categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Price (ETB)" required value={form.price} onChange={(v) => setForm((f) => ({ ...f, price: v }))} placeholder="0" />
                <Field label="Stock" value={form.stock} onChange={(v) => setForm((f) => ({ ...f, stock: v }))} placeholder="0" />
              </div>

              {/* Image */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Image</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.image_url}
                    onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                    placeholder="https://... or upload below"
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <label className="flex items-center gap-1.5 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Uploading…' : 'Upload'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
                  </label>
                </div>
                {form.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.image_url} alt="preview" className="mt-2 h-24 rounded-lg object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                )}
              </div>

              <Field label="Description" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} placeholder="Product description" />
              <Field label="Sizes (comma separated)" value={form.sizes} onChange={(v) => setForm((f) => ({ ...f, sizes: v }))} placeholder="36, 37, 38, 39, 40" />
              <Field label="Colors (comma separated)" value={form.colors} onChange={(v) => setForm((f) => ({ ...f, colors: v }))} placeholder="Black, Brown, Tan" />

              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 rounded accent-brand-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_premium} onChange={(e) => setForm((f) => ({ ...f, is_premium: e.target.checked }))} className="w-4 h-4 rounded accent-brand-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Premium</span>
                </label>
              </div>

              {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex gap-3 justify-end">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2 text-sm font-semibold bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-lg transition-colors">
                {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Delete product?</h3>
            <p className="text-sm text-gray-500 mb-5">This will hide the product from the store.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean
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
    </div>
  )
}
