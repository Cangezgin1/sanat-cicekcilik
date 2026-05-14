import React, { useState, useEffect, useCallback } from 'react'
import api from '../utils/api'

const STATUS_LABELS = {
  pending: { label: 'Bekliyor', badge: 'badge-gold' },
  completed: { label: 'Teslim Edildi', badge: 'badge-green' },
  cancelled: { label: 'Vazgeçti', badge: 'badge-red' },
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ status: '', district: '', date_from: '', date_to: '' })
  const [toast, setToast] = useState('')

  const LIMIT = 20
  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(''), 3000) }

  const fetchOrders = useCallback(() => {
    setLoading(true)
    const params = { page, limit: LIMIT, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) }
    api.get('/orders/admin/all', { params })
      .then(r => { setOrders(r.data.data || []); setTotal(r.data.total || 0); setLoading(false) })
      .catch(() => setLoading(false))
  }, [page, filters])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/orders/${id}/status`, { status })
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
      showToast('Durum güncellendi ✓')
    } catch {
      showToast('Hata oluştu', 'error')
    }
  }

  const totalPages = Math.ceil(total / LIMIT)

  const formatDate = (d) => new Date(d).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div style={{ animation: 'slideUp 0.3s ease' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 2 }}>Siparişler</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>WhatsApp'a yönlendirilen siparişler</p>
      </div>

      {/* Filtreler */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          <div>
            <label className="label">Durum</label>
            <select className="input" value={filters.status} onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1) }}>
              <option value="">Tümü</option>
              <option value="pending">Bekliyor</option>
              <option value="completed">Teslim Edildi</option>
              <option value="cancelled">Vazgeçti</option>
            </select>
          </div>
          <div>
            <label className="label">İlçe</label>
            <input className="input" placeholder="İlçe..." value={filters.district} onChange={e => { setFilters(f => ({ ...f, district: e.target.value })); setPage(1) }} />
          </div>
          <div>
            <label className="label">Başlangıç Tarihi</label>
            <input className="input" type="date" value={filters.date_from} onChange={e => { setFilters(f => ({ ...f, date_from: e.target.value })); setPage(1) }} />
          </div>
          <div>
            <label className="label">Bitiş Tarihi</label>
            <input className="input" type="date" value={filters.date_to} onChange={e => { setFilters(f => ({ ...f, date_to: e.target.value })); setPage(1) }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{total} kayıt bulundu</p>
        <button className="btn btn-outline btn-sm" onClick={() => { setFilters({ status: '', district: '', date_from: '', date_to: '' }); setPage(1) }}>
          Filtreleri Temizle
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Yükleniyor...</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="table" style={{ minWidth: 700 }}>
            <thead>
              <tr>
                <th>#</th>
                <th>Tarih/Saat</th>
                <th>Ürün</th>
                <th>Adet</th>
                <th>İlçe</th>
                <th>Tutar</th>
                <th>Durum</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Sipariş bulunamadı</td></tr>
              ) : orders.map(o => (
                <tr key={o.id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>#{o.id}</td>
                  <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{formatDate(o.created_at)}</td>
                  <td style={{ fontWeight: 500, maxWidth: 180 }}>{o.product_name}</td>
                  <td>{o.quantity}</td>
                  <td><span className="badge badge-gray">{o.district_name}</span></td>
                  <td style={{ fontWeight: 600, color: 'var(--green)' }}>{o.total_price.toLocaleString('tr-TR')} ₺</td>
                  <td>
                    <span className={`badge ${STATUS_LABELS[o.status]?.badge || 'badge-gray'}`}>
                      {STATUS_LABELS[o.status]?.label || o.status}
                    </span>
                  </td>
                  <td>
                    <select
                      className="input"
                      style={{ padding: '4px 8px', fontSize: 12, width: 'auto' }}
                      value={o.status}
                      onChange={e => handleStatusChange(o.id, e.target.value)}
                    >
                      <option value="pending">Bekliyor</option>
                      <option value="completed">Teslim Edildi</option>
                      <option value="cancelled">Vazgeçti</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Önceki</button>
          <span style={{ padding: '5px 12px', fontSize: 13, color: 'var(--text-muted)' }}>{page} / {totalPages}</span>
          <button className="btn btn-outline btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Sonraki →</button>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: toast.type === 'error' ? 'var(--red)' : 'var(--green)', color: 'white', padding: '12px 20px', borderRadius: 8, zIndex: 9999, fontSize: 13 }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
