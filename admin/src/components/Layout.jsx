import React, { useState } from 'react'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile header */}
      <div className="admin-mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🌸</div>
          <span style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600 }}>Sanat Çiçekçilik</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4, padding: 4 }}
        >
          {[0,1,2].map(i => (
            <span key={i} style={{ width: 20, height: 2, background: 'white', display: 'block', transition: 'all 0.2s',
              transform: sidebarOpen && i === 0 ? 'rotate(45deg) translateY(6px)' : sidebarOpen && i === 2 ? 'rotate(-45deg) translateY(-6px)' : 'none',
              opacity: sidebarOpen && i === 1 ? 0 : 1,
            }} />
          ))}
        </button>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="admin-sidebar-overlay"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 190 }}
        />
      )}

      {/* Sidebar */}
      <div className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`} style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 248, zIndex: 200 }}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <main
        className="admin-layout-main"
        style={{
          flex: 1,
          marginLeft: 'var(--sidebar-w)',
          padding: '32px 36px',
          minHeight: '100vh',
          background: 'var(--bg)',
        }}
      >
        {children}
      </main>
    </div>
  )
}
