import React, { useState, useEffect } from 'react'
import api from '../utils/api'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders/admin/stats')
      .then(r => { setStats(r.data.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: 40, color: 'var(--text-muted)' }}>Yükleniyor...</div>

  return (
    <div style={{ animation: 'slideUp 0.3s ease' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Bugün */}
      <h2 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Bugün</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 28 }}>
        <StatCard label="Toplam Yönlendirme" value={stats?.today.total ?? 0} icon="📦" color="var(--green)" />
        <StatCard label="Teslim Edildi" value={stats?.today.completed ?? 0} icon="✅" color="#2e7d32" />
        <StatCard label="Bekliyor" value={stats?.today.pending ?? 0} icon="⏳" color="var(--gold)" />
        <StatCard label="Vazgeçti" value={stats?.today.cancelled ?? 0} icon="❌" color="var(--red)" />
      </div>

      {/* Bu hafta */}
      <h2 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Bu Hafta</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 28 }}>
        <StatCard label="Toplam Sipariş" value={stats?.week.total ?? 0} icon="📊" color="var(--green)" />
        <StatCard label="Teslim Edildi" value={stats?.week.completed ?? 0} icon="✅" color="#2e7d32" />
        <StatCard label="Ciro (₺)" value={(stats?.week.revenue ?? 0).toLocaleString('tr-TR')} icon="💰" color="var(--gold)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {/* İlçe bazlı */}
        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>📍 İlçe Bazlı Siparişler</h3>
          {(stats?.by_district || []).length === 0
            ? <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Henüz sipariş yok</p>
            : (stats?.by_district || []).map(d => (
              <div key={d.district_name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13 }}>{d.district_name}</span>
                <span style={{ fontSize: 13, fontWeight: 500, background: 'var(--green-bg)', color: 'var(--green)', padding: '2px 8px', borderRadius: 4 }}>{d.count}</span>
              </div>
            ))
          }
        </div>

        {/* En çok sipariş edilen */}
        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>🌸 En Çok Sipariş Edilenler</h3>
          {(stats?.by_product || []).length === 0
            ? <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Henüz sipariş yok</p>
            : (stats?.by_product || []).map((p, i) => (
              <div key={p.product_name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 16 }}>#{i + 1}</span>
                  <span style={{ fontSize: 13 }}>{p.product_name}</span>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.count} sipariş / {p.total_qty} adet</span>
              </div>
            ))
          }
        </div>

        {/* Tüm zamanlar */}
        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>🏆 Tüm Zamanlar</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <InfoRow label="Toplam Yönlendirme" value={stats?.all_time.total ?? 0} />
            <InfoRow label="Teslim Edildi" value={stats?.all_time.completed ?? 0} />
            <InfoRow label="Toplam Ciro" value={(stats?.all_time.revenue ?? 0).toLocaleString('tr-TR') + ' ₺'} highlight />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="card" style={{ borderTop: `3px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 600, color, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>
    </div>
  )
}

function InfoRow({ label, value, highlight }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: highlight ? 15 : 13, fontWeight: highlight ? 600 : 500, color: highlight ? 'var(--green)' : 'var(--text)' }}>{value}</span>
    </div>
  )
}
