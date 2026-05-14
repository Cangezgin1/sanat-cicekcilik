import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar({ settings }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [location])

  const phone = settings?.whatsapp_number || '905432990430'

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? 'rgba(250,247,242,0.97)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(45,80,22,0.1)' : 'none',
      transition: 'all 0.4s ease',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40,
            background: 'var(--green)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 20 }}>🌸</span>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 600, color: 'var(--green)', lineHeight: 1.1 }}>
              Sanat
            </div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', lineHeight: 1 }}>
              Çiçekçilik
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="desktop-nav">
          <NavLink to="/" label="Ana Sayfa" active={location.pathname === '/'} />
          <NavLink to="/urunler" label="Çiçeklerimiz" active={location.pathname === '/urunler'} />
          <NavLink to="/#hakkimizda" label="Hakkımızda" />
          <a
            href={`https://wa.me/${phone}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#25D366', color: 'white',
              padding: '8px 18px', borderRadius: 'var(--radius)',
              fontSize: 13, fontWeight: 500,
              transition: 'var(--transition)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#1da851'}
            onMouseLeave={e => e.currentTarget.style.background = '#25D366'}
          >
            <WhatsAppIcon />
            Sipariş Ver
          </a>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="mobile-menu-btn"
          style={{ display: 'none', flexDirection: 'column', gap: 5, padding: 8 }}
          aria-label="Menü"
        >
          <span style={{ width: 24, height: 2, background: 'var(--green)', display: 'block', transition: 'var(--transition)', transform: menuOpen ? 'rotate(45deg) translateY(7px)' : 'none' }} />
          <span style={{ width: 24, height: 2, background: 'var(--green)', display: 'block', opacity: menuOpen ? 0 : 1, transition: 'var(--transition)' }} />
          <span style={{ width: 24, height: 2, background: 'var(--green)', display: 'block', transition: 'var(--transition)', transform: menuOpen ? 'rotate(-45deg) translateY(-7px)' : 'none' }} />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          background: 'rgba(250,247,242,0.99)', backdropFilter: 'blur(12px)',
          padding: '20px 24px 32px',
          borderTop: '1px solid var(--border)',
          animation: 'slideDown 0.2s ease',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <MobileNavLink to="/" label="Ana Sayfa" />
            <MobileNavLink to="/urunler" label="Çiçeklerimiz" />
            <MobileNavLink to="/#hakkimizda" label="Hakkımızda" />
            <a
              href={`https://wa.me/${phone}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#25D366', color: 'white',
                padding: '12px 16px', borderRadius: 'var(--radius)',
                fontSize: 14, fontWeight: 500, marginTop: 12,
              }}
            >
              <WhatsAppIcon /> WhatsApp ile İletişim
            </a>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  )
}

function NavLink({ to, label, active }) {
  return (
    <Link
      to={to}
      style={{
        fontSize: 14, fontWeight: active ? 500 : 400,
        color: active ? 'var(--green)' : 'var(--text-mid)',
        letterSpacing: '0.02em',
        position: 'relative',
        paddingBottom: 2,
        transition: 'color 0.2s ease',
      }}
    >
      {label}
      {active && <span style={{ position: 'absolute', bottom: -2, left: 0, right: 0, height: 2, background: 'var(--gold)', borderRadius: 1 }} />}
    </Link>
  )
}

function MobileNavLink({ to, label }) {
  return (
    <Link to={to} style={{ padding: '12px 0', fontSize: 16, color: 'var(--text-dark)', borderBottom: '1px solid var(--border)', display: 'block' }}>
      {label}
    </Link>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}
