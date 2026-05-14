import React, { useState, useEffect, useRef } from 'react'
import api from '../utils/api'

const API_BASE = 'https://sanat-cicekcilik-backend.onrender.com'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(''), 3000)
  }

  const fetchAll = () => {
    Promise.all([
      api.get('/products/admin/all'),
      api.get('/categories/admin/all'),
    ]).then(([p, c]) => {
      setProducts(p.data.data || [])
      setCategories(c.data.data || [])
      setLoading(false)
    })
  }

  useEffect(() => { fetchAll() }, [])

  const handleToggle = async (id) => {
    await api.patch(`/products/${id}/toggle`)
    setProducts(prev => prev.map(p => p.id === id ? { ...p, active: p.active ? 0 : 1 } : p))
  }

  const handleDelete = async () => {
    await api.delete(`/products/${deleteId}`)
    setProducts(prev => prev.filter(p => p.id !== deleteId))
    setDeleteId(null)
    showToast('Ürün silindi')
  }

  const handleSave = async (formData) => {
    setSaving(true)
    try {
      if (modal === 'add') {
        const r = await api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        setProducts(prev => [r.data.data, ...prev])
        showToast('Ürün eklendi ✓')
      } else {
        const r = await api.put(`/products/${modal.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        setProducts(prev => prev.map(p => p.id === modal.id ? r.data.data : p))
        showToast('Ürün güncellendi ✓')
      }
      setModal(null)
    } catch (e) {
      showToast('Hata: ' + (e.response?.data?.message || 'Bilinmeyen hata'), 'error')
    } finally {
      setSaving(false)
    }
  }

  const getImageUrl = (url) => {
    if (!url) return null
    if (url.startsWith('http')) return url
    return `${API_BASE}${url}`
  }

  return (
    <div style={{ animation: 'slideUp 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Ürünler</h1>
          <p style={{ color: 'var(--text-soft)', fontSize: 13 }}>{products.length} ürün</p>
        </div>
        <button className="btn btn-gold" onClick={() => setModal('add')}>+ Yeni Ürün</button>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-soft)', padding: 20 }}>Yükleniyor...</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ minWidth: 700 }}>
              <thead>
                <tr>
                  <th>Görsel</th>
                  <th>Ürün Adı</th>
                  <th>Kategori</th>
                  <th>Fiyat</th>
                  <th>Stok</th>
                  <th>Durum</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td style={{ width: 60 }}>
                      {getImageUrl(p.image_url)
                        ? <img src={getImageUrl(p.image_url)} alt={p.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 2 }} onError={e => { e.target.style.display = 'none' }} />
                        : <div style={{ width: 48, height: 48, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, borderRadius: 2 }}>🌸</div>
                      }
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{p.name}</div>
                      {p.description && <div style={{ fontSize: 11, color: 'var(--text-soft)', marginTop: 2, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</div>}
                    </td>
                    <td><span className="badge badge-gray">{p.category_name || '—'}</span></td>
                    <td style={{ fontWeight: 600, fontFamily: 'var(--font-display)', fontSize: 15 }}>{p.price.toLocaleString('tr-TR')} ₺</td>
                    <td>
                      <span className={`badge ${p.stock === 0 ? 'badge-red' : p.stock <= 3 ? 'badge-gold' : 'badge-green'}`}>
                        {p.stock} adet
                      </span>
                    </td>
                    <td>
                      {/* Aktif/Pasif - Görsel badge + toggle */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <label className="toggle" style={{ flexShrink: 0 }}>
                          <input type="checkbox" checked={!!p.active} onChange={() => handleToggle(p.id)} />
                          <span className="toggle-slider" />
                        </label>
                        <span style={{
                          fontSize: 10, fontWeight: 700,
                          letterSpacing: '0.08em', textTransform: 'uppercase',
                          color: p.active ? 'var(--sage)' : 'var(--red)',
                          background: p.active ? 'var(--sage-bg)' : 'var(--red-bg)',
                          padding: '3px 8px',
                          borderRadius: 2,
                        }}>
                          {p.active ? '✓ Aktif' : '✕ Pasif'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => setModal(p)}>Düzenle</button>
                        <button className="btn btn-sm" style={{ background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid #f5c6c9' }} onClick={() => setDeleteId(p.id)}>Sil</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {products.length === 0 && (
            <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-soft)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🌸</div>
              <div>Henüz ürün eklenmemiş.</div>
            </div>
          )}
        </div>
      )}

      {modal !== null && (
        <ProductModal
          product={modal === 'add' ? null : modal}
          categories={categories}
          onSave={handleSave}
          onClose={() => setModal(null)}
          saving={saving}
          getImageUrl={getImageUrl}
        />
      )}

      {deleteId && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteId(null)}>
          <div className="modal-box" style={{ maxWidth: 380 }}>
            <div className="modal-header"><h3>Ürünü Sil</h3></div>
            <div className="modal-body"><p style={{ fontSize: 14, color: 'var(--text-mid)' }}>Bu ürünü silmek istediğinize emin misiniz?</p></div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteId(null)}>İptal</button>
              <button className="btn btn-red" onClick={handleDelete}>Sil</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: toast.type === 'error' ? 'var(--red)' : 'var(--sage)', color: 'white', padding: '12px 20px', borderRadius: 6, zIndex: 9999, fontSize: 13, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', animation: 'slideUp 0.3s ease' }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}

function ProductModal({ product, categories, onSave, onClose, saving, getImageUrl }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    category_id: product?.category_id || '',
    stock: product?.stock ?? 0,
    active: product?.active !== undefined ? product.active : 1,
    sort_order: product?.sort_order || 0,
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(product?.image_url ? getImageUrl(product.image_url) : null)
  const fileRef = useRef()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    if (imageFile) fd.append('image', imageFile)
    onSave(fd)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h3>{product ? 'Ürünü Düzenle' : 'Yeni Ürün'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-soft)', lineHeight: 1 }}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Görsel */}
            <div>
              <label className="label">Ürün Görseli</label>
              <div
                onClick={() => fileRef.current.click()}
                style={{ border: '2px dashed var(--border)', padding: 16, textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s', background: 'var(--surface-2)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                {imagePreview
                  ? <img src={imagePreview} alt="" style={{ maxHeight: 120, margin: '0 auto', borderRadius: 4 }} />
                  : <div style={{ color: 'var(--text-soft)', fontSize: 13 }}>📷 Görsel seçmek için tıklayın<br /><span style={{ fontSize: 11 }}>JPG, PNG, WEBP · Max 5MB</span></div>
                }
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              {imagePreview && <p style={{ fontSize: 11, color: 'var(--gold)', marginTop: 4 }}>✓ Görsel seçildi — kaydettiğinizde güncellenecek</p>}
            </div>

            <div>
              <label className="label">Ürün Adı *</label>
              <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>

            <div>
              <label className="label">Açıklama</label>
              <textarea className="input" rows={2} value={form.description} onChange={e => set('description', e.target.value)} style={{ resize: 'vertical' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="label">Fiyat (₺) *</label>
                <input className="input" type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} required />
              </div>
              <div>
                <label className="label">Stok</label>
                <input className="input" type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="label">Kategori</label>
                <select className="input" value={form.category_id} onChange={e => set('category_id', e.target.value)}>
                  <option value="">Seç</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Sıra</label>
                <input className="input" type="number" min="0" value={form.sort_order} onChange={e => set('sort_order', e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: form.active ? 'var(--sage-bg)' : 'var(--red-bg)', borderRadius: 4, border: `1px solid ${form.active ? '#c8ddc4' : '#f5c6c9'}` }}>
              <label className="toggle">
                <input type="checkbox" checked={!!form.active} onChange={e => set('active', e.target.checked ? 1 : 0)} />
                <span className="toggle-slider" />
              </label>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: form.active ? 'var(--sage)' : 'var(--red)' }}>
                  {form.active ? '✓ Aktif' : '✕ Pasif'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-soft)', marginTop: 1 }}>
                  {form.active ? 'Web sitesinde görünüyor' : 'Web sitesinde gizli'}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>İptal</button>
            <button type="submit" className="btn btn-gold" disabled={saving}>
              {saving ? 'Kaydediliyor...' : (product ? 'Güncelle' : 'Ekle')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
