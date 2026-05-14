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

  if (loading) return <LoadingState />

  return (
    <div style={{ animation: 'slideUp 0.3s ease' }}>
      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 10, color: 'var(--gold)', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 8 }}>
          {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
          Dashboard
        </h1>
      </div>

      {/* Bugün */}
      <SectionLabel>Bugün</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 32 }}>
        <StatCard label="Toplam" value={stats?.today.total ?? 0} color="var(--gold)" icon="📦" />
        <StatCard label="Teslim Edildi" value={stats?.today.completed ?? 0} color="var(--sage)" icon="✓" />
        <StatCard label="Bekliyor" value={stats?.today.pending ?? 0} color="#8B6F3A" icon="⏳" />
        <StatCard label="İptal" value={stats?.today.cancelled ?? 0} color="var(--red)" icon="✕" />
      </div>

      {/* Bu hafta */}
      <SectionLabel>Bu Hafta</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 32 }}>
        <StatCard label="Toplam Sipariş" value={stats?.week.total ?? 0} color="var(--gold)" icon="📊" />
        <StatCard label="Teslim Edildi" value={stats?.week.completed ?? 0} color="var(--sage)" icon="✓" />
        <StatCard label="Haftalık Ciro" value={(stats?.week.revenue ?? 0).toLocaleString('tr-TR') + ' ₺'} color="var(--gold)" icon="💰" big />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {/* İlçe raporu */}
        <div className="card">
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 16 }}>📍 İlçe Bazlı</div>
          {(stats?.by_district || []).length === 0
            ? <p style={{ fontSize: 13, color: 'var(--text-soft)' }}>Henüz sipariş yok</p>
            : (stats?.by_district || []).map((d, i) => (
              <div key={d.district_name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 24, height: 24, background: i === 0 ? 'var(--gold)' : 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: i === 0 ? 'white' : 'var(--text-soft)' }}>{i + 1}</div>
                  <span style={{ fontSize: 13 }}>{d.district_name}</span>
                </div>
                <span className="badge badge-gold">{d.count}</span>
              </div>
            ))
          }
        </div>

        {/* En çok sipariş */}
        <div className="card">
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 16 }}>🌸 En Çok Sipariş</div>
          {(stats?.by_product || []).length === 0
            ? <p style={{ fontSize: 13, color: 'var(--text-soft)' }}>Henüz sipariş yok</p>
            : (stats?.by_product || []).map((p, i) => (
              <div key={p.product_name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 24, height: 24, background: i === 0 ? 'var(--gold)' : 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: i === 0 ? 'white' : 'var(--text-soft)' }}>{i + 1}</div>
                  <span style={{ fontSize: 13, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.product_name}</span>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-soft)' }}>{p.count} sipariş</span>
              </div>
            ))
          }
        </div>

        {/* Tüm zamanlar */}
        <div className="card" style={{ borderTop: '3px solid var(--gold)' }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 20 }}>🏆 Tüm Zamanlar</div>
          {[
            ['Toplam Yönlendirme', stats?.all_time.total ?? 0],
            ['Teslim Edildi', stats?.all_time.completed ?? 0],
          ].map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13, color: 'var(--text-mid)' }}>{label}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{val}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0 0' }}>
            <span style={{ fontSize: 13, color: 'var(--text-mid)' }}>Toplam Ciro</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--gold)' }}>
              {(stats?.all_time.revenue ?? 0).toLocaleString('tr-TR')} ₺
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionLabel({ children }) {
  return <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-soft)', marginBottom: 12 }}>{children}</div>
}

function StatCard({ label, value, color, icon, big }) {
  return (
    <div className="card" style={{ borderTop: `3px solid ${color}`, padding: '20px' }}>
      <div style={{ fontSize: 11, color: 'var(--text-soft)', fontWeight: 500, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{label}</span>
        <span style={{ fontSize: 14 }}>{icon}</span>
      </div>
      <div style={{ fontFamily: big ? 'var(--font-display)' : 'inherit', fontSize: big ? 20 : 28, fontWeight: 700, color, letterSpacing: big ? '-0.01em' : '-0.02em' }}>{value}</div>
    </div>
  )
}

function LoadingState() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
      {[...Array(8)].map((_, i) => (
        <div key={i} style={{ height: 90, background: 'white', border: '1px solid var(--border)', animation: 'pulse 1.5s infinite' }} />
      ))}
    </div>
  )
}
