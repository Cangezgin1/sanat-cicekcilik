import React, { useState } from 'react'
import { getImageUrl } from '../utils/api'

const EMOJIS = ['🌹','🌸','🌺','🌻','💐','🌷']

export default function ProductDetail({ product, onOrder, onClose, index = 0 }) {
  const [imgZoomed, setImgZoomed] = useState(false)
  const imageUrl = getImageUrl(product.image_url)
  const emoji = EMOJIS[index % EMOJIS.length]

  return (
    <>
      {/* Ana modal */}
      <div
        onClick={e => e.target === e.currentTarget && onClose()}
        style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          background: 'rgba(10,10,10,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
          animation: 'fadeIn 0.2s ease',
        }}
      >
        <div style={{
          background: 'white',
          width: '100%', maxWidth: 860,
          maxHeight: '92vh',
          overflow: 'auto',
          animation: 'fadeUp 0.3s ease',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
        }} className="product-detail-grid">

          {/* Sol: Resim */}
          <div style={{
            position: 'relative',
            background: '#F8F4EC',
            minHeight: 400,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
            cursor: imageUrl ? 'zoom-in' : 'default',
          }}
            onClick={() => imageUrl && setImgZoomed(true)}
          >
            {imageUrl ? (
              <>
                <img
                  src={imageUrl}
                  alt={product.name}
                  style={{
                    width: '100%', height: '100%',
                    objectFit: 'cover',
                    position: 'absolute', inset: 0,
                    transition: 'transform 0.4s ease',
                  }}
                  onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                />
                {/* Zoom ikonu */}
                <div style={{
                  position: 'absolute', bottom: 12, right: 12,
                  background: 'rgba(0,0,0,0.5)',
                  color: 'white', padding: '6px 10px',
                  fontSize: 11, fontWeight: 600,
                  letterSpacing: '0.06em',
                  backdropFilter: 'blur(4px)',
                }}>
                  🔍 Büyüt
                </div>
              </>
            ) : (
              <div style={{ fontSize: 100, opacity: 0.3 }}>{emoji}</div>
            )}

            {/* Kategori badge */}
            {product.category_name && (
              <div style={{
                position: 'absolute', top: 12, left: 12,
                background: 'rgba(251,248,243,0.95)',
                padding: '4px 12px',
                fontSize: 10, fontWeight: 600,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'var(--text-mid)',
              }}>{product.category_name}</div>
            )}
          </div>

          {/* Sağ: Detaylar */}
          <div style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>
            {/* Kapat */}
            <button onClick={onClose} style={{
              position: 'absolute', top: 16, right: 16,
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--cream-dark)', border: 'none',
              fontSize: 14, color: 'var(--text-soft)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>✕</button>

            <div>
              <p style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, marginBottom: 8 }}>
                {product.category_name || 'Çiçek'}
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)', lineHeight: 1.15 }}>
                {product.name}
              </h2>
            </div>

            {/* Fiyat */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px', background: 'var(--cream)',
              border: '1px solid var(--border)',
            }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-soft)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>Fiyat</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
                  {product.price.toLocaleString('tr-TR')} ₺
                </div>
              </div>
              {product.stock <= 3 && product.stock > 0 && (
                <div style={{ marginLeft: 'auto', background: 'var(--gold)', color: 'white', padding: '4px 10px', fontSize: 11, fontWeight: 600 }}>
                  Son {product.stock} adet
                </div>
              )}
            </div>

            {/* Açıklama */}
            {product.description && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-soft)', marginBottom: 8 }}>Açıklama</div>
                <p style={{ fontSize: 14, color: 'var(--text-mid)', lineHeight: 1.8, fontWeight: 300 }}>
                  {product.description}
                </p>
              </div>
            )}

            {/* Özellikler */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['🌸', 'Taze hazırlanır'],
                ['📦', 'Özenle paketlenir'],
                ['⚡', 'Hızlı teslimat'],
                ['📍', 'Avcılar, Esenyurt ve çevresi'],
              ].map(([emoji, text]) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-mid)' }}>
                  <span>{emoji}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>

            {/* Sipariş Ver butonu */}
            <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <button
                onClick={() => { onClose(); onOrder(product) }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  background: '#25D366', color: 'white',
                  padding: '16px', border: 'none', cursor: 'pointer',
                  fontSize: 14, fontWeight: 700, letterSpacing: '0.04em',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 20px rgba(37,211,102,0.3)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#1ebe5d'}
                onMouseLeave={e => e.currentTarget.style.background = '#25D366'}
              >
                <WAIcon /> WhatsApp ile Sipariş Ver
              </button>
              <p style={{ fontSize: 11, color: 'var(--text-soft)', textAlign: 'center', marginTop: 8 }}>
                Sipariş vermek için WhatsApp'a yönlendirileceksiniz
              </p>
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 640px) {
            .product-detail-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>

      {/* Zoom modal */}
      {imgZoomed && imageUrl && (
        <div
          onClick={() => setImgZoomed(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 3000,
            background: 'rgba(0,0,0,0.95)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20, cursor: 'zoom-out',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <img
            src={imageUrl}
            alt={product.name}
            style={{
              maxWidth: '90vw', maxHeight: '90vh',
              objectFit: 'contain',
              animation: 'scaleIn 0.2s ease',
            }}
          />
          <div style={{
            position: 'absolute', top: 20, right: 20,
            color: 'white', fontSize: 13,
            background: 'rgba(255,255,255,0.1)',
            padding: '8px 16px',
          }}>
            Kapatmak için tıklayın ✕
          </div>
        </div>
      )}
    </>
  )
}

function WAIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
}
