import React, { useState } from 'react'
import { getImageUrl } from '../utils/api'

const PALETTES = [
  { bg: '#F9F0F1', accent: '#C4606A' },
  { bg: '#F0F4F0', accent: '#3D5C3A' },
  { bg: '#F8F4EC', accent: '#B8924A' },
  { bg: '#F0EFF8', accent: '#5B5499' },
  { bg: '#F8F0EC', accent: '#C4724A' },
  { bg: '#EEF4F2', accent: '#3A7A6A' },
]
const EMOJIS = ['🌹','🌸','🌺','🌻','💐','🌷']

export default function ProductCard({ product, onOrder, index = 0 }) {
  const [imgError, setImgError] = useState(false)
  const [hovered, setHovered] = useState(false)
  const palette = PALETTES[index % PALETTES.length]
  const emoji = EMOJIS[index % EMOJIS.length]
  const imageUrl = getImageUrl(product.image_url)

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'white',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        transition: 'transform 0.4s var(--ease), box-shadow 0.4s var(--ease)',
        transform: hovered ? 'translateY(-6px)' : 'none',
        boxShadow: hovered ? '0 20px 60px rgba(13,13,13,0.12)' : '0 2px 16px rgba(13,13,13,0.05)',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
      }}
      onClick={() => onOrder(product)}
    >
      {/* Image */}
      <div style={{
        position: 'relative',
        paddingBottom: '110%',
        overflow: 'hidden',
        background: palette.bg,
      }}>
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={product.name}
            onError={() => setImgError(true)}
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.7s var(--ease)',
              transform: hovered ? 'scale(1.08)' : 'scale(1)',
            }}
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 72,
            animation: 'float 4s ease-in-out infinite',
          }}>
            {emoji}
          </div>
        )}

        {/* Hover overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(13,13,13,0.5) 0%, transparent 60%)',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.4s var(--ease)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          paddingBottom: 20,
        }}>
          <span style={{
            color: 'white', fontSize: 11, fontWeight: 600,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            borderBottom: '1px solid rgba(255,255,255,0.6)',
            paddingBottom: 2,
          }}>Sipariş Ver →</span>
        </div>

        {/* Category badge */}
        {product.category_name && (
          <div style={{
            position: 'absolute', top: 12, left: 12,
            background: 'rgba(251,248,243,0.92)',
            backdropFilter: 'blur(8px)',
            padding: '4px 10px',
            fontSize: 9, fontWeight: 600,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'var(--text-mid)',
          }}>{product.category_name}</div>
        )}

        {/* Stock badge */}
        {product.stock <= 3 && (
          <div style={{
            position: 'absolute', top: 12, right: 12,
            background: 'var(--gold)',
            padding: '4px 10px',
            fontSize: 9, fontWeight: 600, color: 'white',
            letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>Son {product.stock}</div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '20px 20px 22px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 18, fontWeight: 600,
          color: 'var(--text)',
          lineHeight: 1.25,
          letterSpacing: '-0.01em',
        }}>{product.name}</h3>

        {product.description && (
          <p style={{
            fontSize: 12, color: 'var(--text-soft)',
            lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flex: 1,
          }}>{product.description}</p>
        )}

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 12, paddingTop: 14,
          borderTop: '1px solid var(--border)',
        }}>
          <div>
            <div style={{ fontSize: 9, color: 'var(--text-soft)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>Fiyat</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
              {product.price.toLocaleString('tr-TR')} ₺
            </div>
          </div>
          <div style={{
            width: 40, height: 40,
            background: hovered ? 'var(--gold)' : 'var(--cream-dark)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, transition: 'background 0.3s',
          }}>
            {hovered ? '→' : '🛒'}
          </div>
        </div>
      </div>
    </article>
  )
}
