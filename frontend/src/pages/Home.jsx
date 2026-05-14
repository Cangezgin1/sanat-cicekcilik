import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getProducts, getCategories } from '../utils/api'
import ProductCard from '../components/ProductCard'
import OrderModal from '../components/OrderModal'

export default function Home({ settings }) {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [loading, setLoading] = useState(true)

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
      {/* Hero */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(160deg, var(--green) 0%, #3a6b1a 50%, var(--cream) 100%)',
      }}>
        {/* Decorative elements */}
        <div style={{
          position: 'absolute', top: '10%', right: '5%',
          width: 300, height: 300,
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '50%',
          transform: 'translate(30%, -30%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', right: '10%',
          fontSize: 180, opacity: 0.07, lineHeight: 1,
          userSelect: 'none',
        }}>🌸</div>

        <div className="container" style={{ position: 'relative', zIndex: 2, paddingTop: 100, paddingBottom: 80 }}>
          <div style={{ maxWidth: 640 }}>
            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '6px 14px', borderRadius: 100,
              marginBottom: 28,
            }}>
              <span style={{ fontSize: 14 }}>{'⭐'.repeat(5)}</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                {rating}/5 · {reviewCount}+ Değerlendirme
              </span>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(40px, 7vw, 72px)',
              fontWeight: 500,
              color: 'white',
              lineHeight: 1.1,
              marginBottom: 20,
              animation: 'fadeUp 0.8s ease both',
            }}>
              Sevdiklerinize<br />
              <em style={{ color: 'var(--gold-light)' }}>En Güzel</em> Çiçekler
            </h1>

            <p style={{
              fontSize: 18, color: 'rgba(255,255,255,0.75)',
              lineHeight: 1.7, marginBottom: 36,
              maxWidth: 480,
              animation: 'fadeUp 0.8s 0.1s ease both',
            }}>
              Avcılar ve çevresine taze, özenle hazırlanmış buket ve aranjmanlar. WhatsApp ile kolay sipariş.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', animation: 'fadeUp 0.8s 0.2s ease both' }}>
              <Link to="/urunler" className="btn-primary" style={{ background: 'white', color: 'var(--green)', borderColor: 'white' }}>
                Çiçekleri Gör
              </Link>
              <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="btn-outline" style={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white' }}>
                WhatsApp'tan Ulaş
              </a>
            </div>

            {/* Stats */}
            <div style={{
              display: 'flex', gap: 32, marginTop: 56,
              animation: 'fadeUp 0.8s 0.3s ease both',
            }}>
              {[['500+', 'Mutlu Müşteri'], ['10+', 'Yıllık Deneyim'], [workStart + '-' + workEnd, 'Sipariş Saatleri']].map(([val, label]) => (
                <div key={label}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 600, color: 'white' }}>{val}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave */}
        <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0 }}>
          <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 80 }}>
            <path d="M0,80 L0,40 Q360,0 720,40 Q1080,80 1440,40 L1440,80 Z" fill="var(--cream)" />
          </svg>
        </div>
      </section>

      {/* Kategoriler */}
      <section style={{ padding: '80px 0 40px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p className="section-label">Koleksiyonlarımız</p>
            <h2 className="section-title">Kategoriler</h2>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            {categories.map((cat, i) => (
              <Link
                key={cat.id}
                to={`/urunler?kategori=${cat.slug}`}
                style={{
                  padding: '10px 22px',
                  border: '1.5px solid var(--border)',
                  borderRadius: 100,
                  fontSize: 14, fontWeight: 500,
                  background: 'white',
                  color: 'var(--text-mid)',
                  transition: 'var(--transition)',
                  display: 'inline-block',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--green)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'var(--green)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--text-mid)'; e.currentTarget.style.borderColor = 'var(--border)' }}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Öne Çıkan Ürünler */}
      <section style={{ padding: '40px 0 80px' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p className="section-label">Seçtiklerimiz</p>
              <h2 className="section-title" style={{ marginBottom: 0 }}>Öne Çıkan Çiçekler</h2>
            </div>
            <Link to="/urunler" className="btn-outline">Tümünü Gör</Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ borderRadius: 4, overflow: 'hidden' }}>
                  <div className="skeleton" style={{ height: 200 }} />
                  <div style={{ padding: 16 }}>
                    <div className="skeleton" style={{ height: 20, marginBottom: 8, width: '70%' }} />
                    <div className="skeleton" style={{ height: 14, width: '90%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
              {featuredProducts.map((p, i) => (
                <div key={p.id} style={{ animation: `fadeUp 0.5s ${i * 0.08}s ease both` }}>
                  <ProductCard product={p} onOrder={setSelectedProduct} index={i} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Hakkımızda */}
      <section id="hakkimizda" style={{ background: 'var(--cream-dark)', padding: '80px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 60, alignItems: 'center' }}>
            <div>
              <p className="section-label">Hakkımızda</p>
              <h2 className="section-title">Avcılar'ın Çiçekçisi</h2>
              <div className="divider" />
              <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 16 }}>
                Sanat Çiçekçilik olarak yıllardır Avcılar ve çevresindeki ilçelere taze, kaliteli çiçekler ulaştırıyoruz. Her buket ve aranjmanı sevgiyle hazırlıyor, özel günlerinizi daha anlamlı kılmak için çalışıyoruz.
              </p>
              <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 32 }}>
                Yeşilkent Mahallesi'ndeki mağazamızdan ya da WhatsApp üzerinden kolayca sipariş verebilirsiniz.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="btn-primary">
                  WhatsApp ile İletişim
                </a>
                <a href="https://maps.google.com/?q=Yeşilkent+Mh.+Balıkyolu+Cd.+No:70/B+Avcılar+İstanbul" target="_blank" rel="noopener noreferrer" className="btn-outline">
                  Yol Tarifi
                </a>
              </div>
            </div>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  ['⭐', rating + '/5', 'Google Puanı'],
                  ['📦', '500+', 'Sipariş'],
                  ['🕐', workStart + '-' + workEnd, 'Çalışma'],
                  ['📍', '6 İlçe', 'Teslimat'],
                ].map(([emoji, val, label]) => (
                  <div key={label} style={{
                    background: 'white', borderRadius: 4, padding: '24px 20px',
                    border: '1px solid var(--border)', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{emoji}</div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600, color: 'var(--green)' }}>{val}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 0', background: 'var(--green)', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 500, color: 'white', marginBottom: 16 }}>
            Sipariş Vermek Çok Kolay
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', marginBottom: 36, maxWidth: 480, margin: '0 auto 36px' }}>
            Çiçeğinizi seçin, ilçenizi belirtin, WhatsApp'a yönlenin. Hepsi bu kadar!
          </p>
          <Link to="/urunler" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'white', color: 'var(--green)',
            padding: '16px 36px', borderRadius: 'var(--radius)',
            fontSize: 15, fontWeight: 600,
            transition: 'var(--transition)',
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            🌸 Sipariş Ver
          </Link>
        </div>
      </section>

      {selectedProduct && (
        <OrderModal
          product={selectedProduct}
          settings={settings}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </main>
  )
}
