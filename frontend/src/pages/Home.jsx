import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getProducts, getCategories } from '../utils/api'
import ProductCard from '../components/ProductCard'
import OrderModal from '../components/OrderModal'

export default function Home({ settings }) {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const heroRef = useRef(null)

  useEffect(() => {
    Promise.all([getProducts(), getCategories()]).then(([p, c]) => {
      setFeaturedProducts((p.data || []).slice(0, 6))
      setCategories(c.data || [])
      setLoading(false)
    })
  }, [])

  const rating = settings?.google_rating || '4.9'
  const reviewCount = settings?.google_review_count || '120'
  const workStart = settings?.work_start || '10:00'
  const workEnd = settings?.work_end || '23:30'
  const waNumber = settings?.whatsapp_number || '905432990430'

  return (
    <main>
      {/* ══ HERO ══ */}
      <section ref={heroRef} style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: '#0D0D0D',
        display: 'flex',
        alignItems: 'center',
      }}>
        {/* Texture overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            radial-gradient(ellipse 80% 60% at 70% 50%, rgba(61,92,58,0.45) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 20% 80%, rgba(184,146,74,0.2) 0%, transparent 60%)
          `,
          zIndex: 1,
        }} />

        {/* Big decorative flower */}
        <div style={{
          position: 'absolute', right: '-2%', top: '50%',
          transform: 'translateY(-50%)',
          fontSize: 'clamp(280px, 35vw, 520px)',
          opacity: 0.06,
          lineHeight: 1,
          userSelect: 'none',
          zIndex: 1,
          animation: 'float 8s ease-in-out infinite',
        }}>🌸</div>

        {/* Gold accent line */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: 4,
          background: 'linear-gradient(to bottom, transparent, var(--gold), transparent)',
          zIndex: 2,
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 3, paddingTop: 120, paddingBottom: 100 }}>
          <div style={{ maxWidth: 680 }}>
            {/* Stars */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              marginBottom: 32,
              animation: 'fadeUp 0.7s 0.1s ease both',
            }}>
              <div style={{ display: 'flex', gap: 2 }}>
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="var(--gold)">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
                {rating}/5 · {reviewCount}+ değerlendirme
              </span>
              <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.2)' }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Esenyurt / Avcılar, İstanbul</span>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(44px, 7vw, 82px)',
              fontWeight: 700,
              color: 'white',
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              marginBottom: 24,
              animation: 'fadeUp 0.8s 0.2s ease both',
            }}>
              Sevdiklerinize<br />
              <span style={{
                fontStyle: 'italic',
                background: 'linear-gradient(135deg, var(--gold-light), var(--gold))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>En Güzel</span><br />
              Çiçekleri Gönderin
            </h1>

            <p style={{
              fontSize: 17,
              color: 'rgba(255,255,255,0.55)',
              lineHeight: 1.75,
              maxWidth: 460,
              marginBottom: 40,
              fontWeight: 300,
              animation: 'fadeUp 0.8s 0.3s ease both',
            }}>
              Esenyurt, Avcılar ve çevresine özenle hazırlanmış taze buket, aranjman ve saksı çiçekleri. WhatsApp ile dakikalar içinde sipariş.
            </p>

            <div style={{
              display: 'flex', gap: 12, flexWrap: 'wrap',
              animation: 'fadeUp 0.8s 0.4s ease both',
            }}>
              <Link to="/urunler" className="btn-gold">Koleksiyonu Keşfet</Link>
              <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="btn-outline-white">
                <WAIcon /> WhatsApp'tan Sipariş
              </a>
            </div>

            {/* Stats row */}
            <div style={{
              display: 'flex', gap: 0,
              marginTop: 64,
              borderTop: '1px solid rgba(255,255,255,0.1)',
              paddingTop: 32,
              animation: 'fadeUp 0.8s 0.5s ease both',
            }}>
              {[
                ['500+', 'Mutlu Müşteri'],
                ['10+', 'Yıl Deneyim'],
                [workStart+'–'+workEnd, 'Sipariş Saatleri'],
                ['6', 'Teslimat İlçesi'],
              ].map(([val, label], i) => (
                <div key={label} style={{
                  flex: 1,
                  paddingRight: 24,
                  borderRight: i < 3 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                  paddingLeft: i > 0 ? 24 : 0,
                }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>{val}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
          background: 'linear-gradient(to top, var(--cream), transparent)',
          zIndex: 4,
        }} />
      </section>

      {/* ══ MARQUEE ══ */}
      <div style={{
        background: 'var(--gold)',
        overflow: 'hidden',
        padding: '12px 0',
        position: 'relative',
        zIndex: 5,
      }}>
        <div style={{
          display: 'flex', gap: 48,
          animation: 'marquee 20s linear infinite',
          width: 'max-content',
        }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 48, flexShrink: 0 }}>
              {['🌹 Taze Güller', '🌸 Çiçek Buketi', '🌺 Aranjman', '💐 Özel Tasarım', '🌻 Saksı Çiçeği', '🌷 Gelin Buketi'].map(t => (
                <span key={t} style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'white', whiteSpace: 'nowrap' }}>{t}</span>
              ))}
            </div>
          ))}
        </div>
        <style>{`
          @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        `}</style>
      </div>

      {/* ══ KATEGORİLER ══ */}
      <section style={{ padding: '100px 0 60px' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p className="eyebrow" style={{ marginBottom: 12 }}>Koleksiyonlarımız</p>
              <h2 className="section-title">Kategoriler</h2>
            </div>
            <Link to="/urunler" style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', borderBottom: '1px solid var(--gold)', paddingBottom: 2 }}>
              Tümünü Gör →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
            {categories.map((cat, i) => {
              const emojis = ['🌹','🌸','🌿','💒','🌾','✨']
              return (
                <Link
                  key={cat.id}
                  to={`/urunler?kategori=${cat.slug}`}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '28px 16px',
                    border: '1px solid var(--border)',
                    background: 'white',
                    textAlign: 'center',
                    gap: 10,
                    transition: 'all 0.3s var(--ease)',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.background = 'var(--gold-pale)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'none' }}
                >
                  <span style={{ fontSize: 32 }}>{emojis[i % emojis.length]}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', letterSpacing: '0.04em' }}>{cat.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══ ÖNE ÇIKAN ÜRÜNLER ══ */}
      <section style={{ padding: '40px 0 100px' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p className="eyebrow" style={{ marginBottom: 12 }}>Seçtiklerimiz</p>
              <h2 className="section-title">Öne Çıkan Çiçekler</h2>
            </div>
            <Link to="/urunler" className="btn-outline-dark">Tüm Koleksiyon</Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i}>
                  <div className="skeleton" style={{ paddingBottom: '110%', marginBottom: 0 }} />
                  <div style={{ padding: '20px', border: '1px solid var(--border)', borderTop: 'none' }}>
                    <div className="skeleton" style={{ height: 22, marginBottom: 8, width: '65%' }} />
                    <div className="skeleton" style={{ height: 13, width: '85%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {featuredProducts.map((p, i) => (
                <div key={p.id} style={{ animation: `fadeUp 0.5s ${i * 0.07}s ease both` }}>
                  <ProductCard product={p} onOrder={setSelectedProduct} index={i} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══ HAKKIMIZDA ══ */}
      <section id="hakkimizda" style={{ background: 'var(--ink)', padding: '100px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', right: '-5%', top: '50%', transform: 'translateY(-50%)',
          fontSize: 320, opacity: 0.04, lineHeight: 1, userSelect: 'none',
        }}>🌸</div>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 72, alignItems: 'center' }}>
            <div>
              <p className="eyebrow" style={{ color: 'var(--gold)', marginBottom: 16 }}>Hakkımızda</p>
              <h2 className="section-title" style={{ color: 'white', marginBottom: 24 }}>
                Esenyurt / Avcılar'ın<br />
                <em style={{ fontStyle: 'italic', color: 'var(--gold-light)' }}>Çiçekçisi</em>
              </h2>
              <div style={{ width: 48, height: 2, background: 'var(--gold)', marginBottom: 28 }} />
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.85, marginBottom: 16, fontWeight: 300 }}>
                Sanat Çiçekçilik olarak yıllardır Esenyurt, Avcılar ve çevresindeki ilçelere taze, kaliteli çiçekler ulaştırıyoruz. Her buket ve aranjmanı sevgiyle hazırlıyor, özel günlerinizi daha anlamlı kılmak için çalışıyoruz.
              </p>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.85, marginBottom: 40, fontWeight: 300 }}>
                Yeşilkent Mahallesi'ndeki mağazamızdan ya da WhatsApp üzerinden kolayca sipariş verebilirsiniz.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="btn-gold">
                  <WAIcon /> WhatsApp ile Ulaş
                </a>
                <a href="https://maps.google.com/?q=Yeşilkent+Mh.+Balıkyolu+Cd.+No:70/B+Avcılar+İstanbul" target="_blank" rel="noopener noreferrer" className="btn-outline-white">
                  Yol Tarifi
                </a>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {[
                ['⭐', rating+'/5', 'Google Puanı'],
                ['📦', '500+', 'Sipariş'],
                ['🕐', workStart+'–'+workEnd, 'Çalışma Saatleri'],
                ['📍', '6 İlçe', 'Teslimat Bölgesi'],
              ].map(([emoji, val, label]) => (
                <div key={label} style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  padding: '28px 24px',
                  textAlign: 'center',
                  transition: 'background 0.3s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(184,146,74,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                >
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{emoji}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 4, letterSpacing: '-0.01em' }}>{val}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section style={{ padding: '100px 0', background: 'var(--cream-dark)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(184,146,74,0.08) 0%, transparent 70%)' }} />
        <div className="container" style={{ position: 'relative' }}>
          <p className="eyebrow" style={{ marginBottom: 16 }}>Hızlı & Kolay</p>
          <h2 className="section-title" style={{ marginBottom: 20, maxWidth: 600, margin: '0 auto 20px' }}>
            Sipariş Vermek<br />Hiç Bu Kadar Kolay Olmamıştı
          </h2>
          <div className="ornament" style={{ maxWidth: 300, margin: '20px auto 28px' }}>
            <div className="ornament-dot" />
          </div>
          <p style={{ fontSize: 16, color: 'var(--text-soft)', marginBottom: 40, fontWeight: 300 }}>
            Çiçeğinizi seçin → İlçenizi belirtin → WhatsApp'a yönlenin
          </p>
          <Link to="/urunler" className="btn-gold" style={{ fontSize: 12, padding: '16px 40px' }}>
            🌸 Koleksiyona Git
          </Link>
        </div>
      </section>

      {selectedProduct && (
        <OrderModal product={selectedProduct} settings={settings} onClose={() => setSelectedProduct(null)} />
      )}
    </main>
  )
}

function WAIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
}
