import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/dashboard', emoji: '📊', label: 'Dashboard' },
  { to: '/urunler', emoji: '🌸', label: 'Ürünler' },
  { to: '/kategoriler', emoji: '🏷️', label: 'Kategoriler' },
  { to: '/siparisler', emoji: '📦', label: 'Siparişler' },
  { to: '/ayarlar', emoji: '⚙️', label: 'Ayarlar' },
]

export default function Sidebar({ onClose }) {
  const { user, logout } = useAuth()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    if (onClose) onClose()
  }

  return (
    <div style={{
      width: 248,
      height: '100vh',
      background: '#0D0D0D',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
    }}>
      {/* Gold top bar */}
      <div style={{ height: 3, background: 'linear-gradient(to right, #B8924A, #D4A96A)', flexShrink: 0 }} />

      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, background: '#B8924A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🌸</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: 14, fontWeight: 600, lineHeight: 1.2 }}>Sanat Çiçekçilik</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>Yönetim Paneli</div>
            </div>
          </div>
          {/* Mobile kapat butonu */}
          {onClose && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 18, cursor: 'pointer', padding: 4 }}>✕</button>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px' }}>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, padding: '0 8px', marginBottom: 8 }}>Menü</div>
        {navItems.map(item => {
          const active = location.pathname === item.to
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', marginBottom: 2,
                background: active ? 'rgba(184,146,74,0.18)' : 'transparent',
                color: active ? '#D4A96A' : 'rgba(255,255,255,0.5)',
                fontSize: 13, fontWeight: active ? 600 : 400,
                borderLeft: `2px solid ${active ? '#B8924A' : 'transparent'}`,
                transition: 'all 0.15s',
                textDecoration: 'none',
                borderRadius: '0 4px 4px 0',
              }}
            >
              <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{item.emoji}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div style={{ padding: '12px 10px 16px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 4 }}>
          <div style={{ width: 28, height: 28, background: '#B8924A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'white', fontWeight: 700, flexShrink: 0 }}>
            {(user?.username?.[0] || 'A').toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{user?.username}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>Yönetici</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', background: 'transparent', border: 'none',
            color: 'rgba(255,255,255,0.3)', fontSize: 12, cursor: 'pointer',
            transition: 'color 0.15s', textAlign: 'left',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
        >
          ← Çıkış Yap
        </button>
      </div>
    </div>
  )
}
