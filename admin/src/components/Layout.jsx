import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Sayfa değişince sidebar'ı kapat (sadece mobilde)
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Desktop Sidebar ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: 248, zIndex: 100,
      }} className="admin-desktop-sidebar">
        <Sidebar />
      </div>

      {/* ── Mobile: Karartma overlay ── */}
      <div
        onClick={() => setSidebarOpen(false)}
        className="admin-mobile-overlay"
        style={{
          display: sidebarOpen ? 'block' : 'none',
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.65)',
          zIndex: 300,
        }}
      />

      {/* ── Mobile: Sidebar (soldan kayar) ── */}
      <div
        className="admin-mobile-sidebar"
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0,
          width: 248, zIndex: 310,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* ── Mobile: Üst header ── */}
      <div className="admin-mobile-header" style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: 56, zIndex: 200,
        background: '#0D0D0D',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'none',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, background: '#B8924A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🌸</div>
          <span style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600 }}>Sanat Çiçekçilik</span>
        </div>
        <button
          onClick={() => setSidebarOpen(v => !v)}
          style={{
            background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer',
            padding: '8px', borderRadius: 4,
            display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'center',
          }}
        >
          <span style={{ width: 20, height: 2, background: 'white', display: 'block', transition: 'all 0.25s', transform: sidebarOpen ? 'rotate(45deg) translateY(7px)' : 'none' }} />
          <span style={{ width: 20, height: 2, background: 'white', display: 'block', transition: 'opacity 0.25s', opacity: sidebarOpen ? 0 : 1 }} />
          <span style={{ width: 20, height: 2, background: 'white', display: 'block', transition: 'all 0.25s', transform: sidebarOpen ? 'rotate(-45deg) translateY(-7px)' : 'none' }} />
        </button>
      </div>

      {/* ── Ana içerik ── */}
      <main className="admin-main-content" style={{
        flex: 1,
        marginLeft: 248,
        padding: '32px 36px',
        minHeight: '100vh',
        background: 'var(--bg)',
      }}>
        {children}
      </main>

      <style>{`
        @media (max-width: 820px) {
          .admin-desktop-sidebar { display: none !important; }
          .admin-mobile-header { display: flex !important; }
          .admin-main-content {
            margin-left: 0 !important;
            padding: 68px 14px 24px !important;
          }
        }
        @media (min-width: 821px) {
          .admin-mobile-sidebar { display: none !important; }
          .admin-mobile-overlay { display: none !important; }
          .admin-mobile-header { display: none !important; }
        }
      `}</style>
    </div>
  )
}
