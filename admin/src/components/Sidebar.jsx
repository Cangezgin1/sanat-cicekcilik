import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/dashboard', icon: '▦', label: 'Dashboard' },
  { to: '/urunler', icon: '❀', label: 'Ürünler' },
  { to: '/kategoriler', icon: '◈', label: 'Kategoriler' },
  { to: '/siparisler', icon: '◻', label: 'Siparişler' },
  { to: '/ayarlar', icon: '◎', label: 'Ayarlar' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <aside style={{
      width: 'var(--sidebar-w)',
      minHeight: '100vh',
      background: 'var(--ink)',
      display: 'flex', flexDirection: 'column',
      position: 'fixed', left: 0, top: 0, bottom: 0,
      zIndex: 100,
    }}>
      {/* Gold top accent */}
      <div style={{ height: 3, background: 'linear-gradient(to right, var(--gold), var(--gold-light))' }} />

      {/* Logo */}
      <div style={{ padding: '22px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🌸</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: 14, fontWeight: 600, lineHeight: 1.2 }}>Sanat Çiçekçilik</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>Yönetim Paneli</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, padding: '0 8px', marginBottom: 10 }}>Menü</div>
        {navItems.map(item => {
          const active = location.pathname === item.to
          return (
            <Link key={item.to} to={item.to} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', marginBottom: 2,
              background: active ? 'rgba(184,146,74,0.15)' : 'transparent',
              color: active ? 'var(--gold-light)' : 'rgba(255,255,255,0.5)',
              fontSize: 13, fontWeight: active ? 500 : 400,
              transition: 'all 0.15s',
              borderLeft: active ? '2px solid var(--gold)' : '2px solid transparent',
              textDecoration: 'none',
            }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)' } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' } }}
            >
              <span style={{ fontSize: 15, width: 18, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User + logout */}
      <div style={{ padding: '16px 12px 20px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 4 }}>
          <div style={{ width: 28, height: 28, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'rgba(255,255,255,0.6)', flexShrink: 0 }}>
            {user?.username?.[0]?.toUpperCase() || 'A'}
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{user?.username}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>Yönetici</div>
          </div>
        </div>
        <button onClick={logout} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px', background: 'transparent', border: 'none',
          color: 'rgba(255,255,255,0.3)', fontSize: 12, cursor: 'pointer',
          transition: 'color 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
        >
          ← Çıkış Yap
        </button>
      </div>
    </aside>
  )
}
