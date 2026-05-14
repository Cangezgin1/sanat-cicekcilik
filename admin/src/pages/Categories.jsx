import React, { useState, useEffect } from 'react'
import api from '../utils/api'

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ name: '', sort_order: 0 })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => {
    api.get('/categories/admin/all')
      .then(r => { setCategories(r.data.data || []); setLoading(false) })
  }, [])

  const handleToggle = async (id) => {
    await api.patch(`/categories/${id}/toggle`)
    setCategories(prev => prev.map(c => c.id === id ? { ...c, active: c.active ? 0 : 1 } : c))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (modal === 'add') {
        const r = await api.post('/categories', form)
        setCategories(prev => [...prev, r.data.data])
        showToast('Kategori eklendi ✓')
      } else {
        const r = await api.put(`/categories/${modal.id}`, form)
        setCategories(prev => prev.map(c => c.id === modal.id ? r.data.data : c))
        showToast('Kategori güncellendi ✓')
      }
      setModal(null)
    } catch (e) {
      showToast('Hata: ' + (e.response?.data?.message || 'Bilinmeyen hata'))
    } finally {
      setSaving(false)
    }
  }

  const openAdd = () => { setForm({ name: '', sort_order: 0 }); setModal('add') }
  const openEdit = (cat) => { setForm({ name: cat.name, sort_order: cat.sort_order }); setModal(cat) }

  return (
    <div style={{ animation: 'slideUp 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 2 }}>Kategoriler</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Web sitesinde çiçekleri gruplandırmak için kullanılır</p>
        </div>
        <button className="btn btn-green" onClick={openAdd}>+ Yeni Kategori</button>
      </div>

      {loading ? <div style={{ color: 'var(--text-muted)' }}>Yükleniyor...</div> : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Kategori Adı</th>
                <th>Ürün Sayısı</th>
                <th>Sıra</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id}>
                  <td style={{ fontWeight: 500 }}>{cat.name}</td>
                  <td><span className="badge badge-gray">{cat.product_count} ürün</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>{cat.sort_order}</td>
                  <td>
                    <label className="toggle">
                      <input type="checkbox" checked={!!cat.active} onChange={() => handleToggle(cat.id)} />
                      <span className="toggle-slider" />
                    </label>
                  </td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(cat)}>Düzenle</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal !== null && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal-box" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3>{modal === 'add' ? 'Yeni Kategori' : 'Kategoriyi Düzenle'}</h3>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="label">Kategori Adı *</label>
                  <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Sıra (küçük = önce)</label>
                  <input className="input" type="number" min="0" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(null)}>İptal</button>
                <button type="submit" className="btn btn-green" disabled={saving}>{saving ? 'Kaydediliyor...' : 'Kaydet'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, background: 'var(--green)', color: 'white', padding: '12px 20px', borderRadius: 8, zIndex: 9999, fontSize: 13 }}>{toast}</div>}
    </div>
  )
}
