import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar({ settings }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => setMenuOpen(false), [location])

  const waNumber = settings?.whatsapp_number || '905432990430'
  const transparent = isHome && !scrolled

  return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 900,
        height: 72,
        background: transparent ? 'transparent' : 'rgba(251,248,243,0.96)',
        backdropFilter: transparent ? 'none' : 'blur(20px)',
        borderBottom: transparent ? 'none' : '1px solid var(--border)',
        transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{
              width: 38, height: 38,
              background: transparent ? 'rgba(255,255,255,0.15)' : 'var(--gold)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, transition: 'background 0.4s',
              border: transparent ? '1px solid rgba(255,255,255,0.3)' : 'none',
            }}>🌸</div>
            <div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 17,
                fontWeight: 700,
                color: transparent ? 'white' : 'var(--text)',
                letterSpacing: '-0.01em',
                lineHeight: 1,
                transition: 'color 0.4s',
              }}>Sanat Çiçekçilik</div>
              <div style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 9,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: transparent ? 'rgba(255,255,255,0.6)' : 'var(--gold)',
                lineHeight: 1,
                marginTop: 3,
                transition: 'color 0.4s',
              }}>Avcılar · Est. 2014</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 40 }} className="desk-nav">
            {[['/', 'Ana Sayfa'], ['/urunler', 'Koleksiyon'], ['/#hakkimizda', 'Hakkımızda']].map(([to, label]) => (
              <Link key={to} to={to} style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: transparent ? 'rgba(255,255,255,0.85)' : 'var(--text-mid)',
                transition: 'color 0.25s',
                position: 'relative',
                paddingBottom: 2,
              }}
                onMouseEnter={e => e.currentTarget.style.color = transparent ? 'white' : 'var(--text)'}
                onMouseLeave={e => e.currentTarget.style.color = transparent ? 'rgba(255,255,255,0.85)' : 'var(--text-mid)'}
              >{label}</Link>
            ))}
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: 'var(--gold)',
                color: 'white',
                padding: '9px 20px',
                fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                transition: 'all 0.3s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#a07c3a'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.transform = 'none' }}
            >
              <WAIcon /> Sipariş Ver
            </a>
          </nav>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="burger"
            style={{ display: 'none', flexDirection: 'column', gap: 5, padding: 6 }}
          >
            {[0,1,2].map(i => (
              <span key={i} style={{
                width: 22, height: 2,
                background: transparent ? 'white' : 'var(--text)',
                display: 'block',
                transition: 'all 0.3s',
                transform: menuOpen && i === 0 ? 'rotate(45deg) translateY(7px)' : menuOpen && i === 2 ? 'rotate(-45deg) translateY(-7px)' : 'none',
                opacity: menuOpen && i === 1 ? 0 : 1,
              }} />
            ))}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 72, left: 0, right: 0, zIndex: 899,
          background: 'rgba(251,248,243,0.98)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)',
          padding: '24px 20px 32px',
          animation: 'slideDown 0.25s ease',
        }}>
          {[['/', 'Ana Sayfa'], ['/urunler', 'Koleksiyon'], ['/#hakkimizda', 'Hakkımızda']].map(([to, label]) => (
            <Link key={to} to={to} style={{
              display: 'block', padding: '14px 0',
              borderBottom: '1px solid var(--border)',
              fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--text-mid)',
            }}>{label}</Link>
          ))}
          <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: '#25D366', color: 'white',
            padding: '14px', marginTop: 16,
            fontSize: 13, fontWeight: 600, letterSpacing: '0.06em',
          }}>
            <WAIcon /> WhatsApp ile Sipariş Ver
          </a>
        </div>
      )}

      <style>{`
        @media (max-width: 820px) {
          .desk-nav { display: none !important; }
          .burger { display: flex !important; }
        }
      `}</style>
    </>
  )
}

function WAIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
}
