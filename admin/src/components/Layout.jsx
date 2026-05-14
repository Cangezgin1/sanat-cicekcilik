import React, { useState } from 'react'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Desktop Sidebar (her zaman görünür) ── */}
      <div style={{
        width: 248,
        flexShrink: 0,
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 100,
        display: 'flex',
      }} className="desktop-sidebar">
        <Sidebar />
      </div>

      {/* ── Mobile Overlay ── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 200,
            display: 'none',
          }}
          className="mobile-overlay"
        />
      )}

      {/* ── Mobile Sidebar ── */}
      <div
        style={{
          position: 'fixed',
          top: 0, left: 0, bottom: 0,
          width: 248,
          zIndex: 210,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          display: 'none',
        }}
        className="mobile-sidebar"
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* ── Mobile Header ── */}
      <div
        style={{
          display: 'none',
          position: 'fixed',
          top: 0, left: 0, right: 0,
          height: 56,
          background: '#0D0D0D',
          zIndex: 150,
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
        className="mobile-header"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, background: '#B8924A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🌸</div>
          <span style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600 }}>Sanat Çiçekçilik</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', flexDirection: 'column', gap: 4 }}
        >
          <span style={{ width: 22, height: 2, background: 'white', display: 'block', transition: 'all 0.25s', transform: sidebarOpen ? 'rotate(45deg) translateY(6px)' : 'none' }} />
          <span style={{ width: 22, height: 2, background: 'white', display: 'block', opacity: sidebarOpen ? 0 : 1, transition: 'opacity 0.25s' }} />
          <span style={{ width: 22, height: 2, background: 'white', display: 'block', transition: 'all 0.25s', transform: sidebarOpen ? 'rotate(-45deg) translateY(-6px)' : 'none' }} />
        </button>
      </div>

      {/* ── Main Content ── */}
      <main style={{
        flex: 1,
        marginLeft: 248,
        padding: '32px 36px',
        minHeight: '100vh',
        background: 'var(--bg)',
      }} className="main-content">
        {children}
      </main>

      {/* ── Responsive Styles ── */}
      <style>{`
        @media (max-width: 820px) {
          .desktop-sidebar { display: none !important; }
          .mobile-header { display: flex !important; }
          .mobile-sidebar { display: block !important; }
          .mobile-overlay { display: block !important; }
          .main-content {
            margin-left: 0 !important;
            padding: 72px 16px 24px !important;
          }
        }
      `}</style>
    </div>
  )
}
