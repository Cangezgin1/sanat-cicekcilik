import React, { useState } from 'react'

const PLACEHOLDER_COLORS = ['#e8f5e9','#fce4ec','#fff3e0','#e3f2fd','#f3e5f5','#e0f7fa']
const PLACEHOLDER_EMOJIS = ['🌹','🌸','🌺','🌻','💐','🌷']

export default function ProductCard({ product, onOrder, index = 0 }) {
  const [imgError, setImgError] = useState(false)
  const [hovered, setHovered] = useState(false)

  const placeholderColor = PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length]
  const placeholderEmoji = PLACEHOLDER_EMOJIS[index % PLACEHOLDER_EMOJIS.length]

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'white',
        borderRadius: 4,
        overflow: 'hidden',
        border: '1px solid var(--border)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', paddingBottom: '75%', overflow: 'hidden', background: placeholderColor }}>
        {product.image_url && !imgError ? (
          <img
            src={product.image_url}
            alt={product.name}
            onError={() => setImgError(true)}
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.5s ease',
              transform: hovered ? 'scale(1.05)' : 'scale(1)',
            }}
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 52,
          }}>
            {placeholderEmoji}
          </div>
        )}

        {/* Category badge */}
        {product.category_name && (
          <div style={{
            position: 'absolute', top: 10, left: 10,
            background: 'rgba(250,247,242,0.92)',
            backdropFilter: 'blur(4px)',
            padding: '3px 10px',
            borderRadius: 'var(--radius)',
            fontSize: 11,
            fontWeight: 500,
            color: 'var(--green)',
            letterSpacing: '0.04em',
          }}>
            {product.category_name}
          </div>
        )}

        {/* Stock badge */}
        {product.stock <= 3 && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            background: 'var(--gold)',
            padding: '3px 10px',
            borderRadius: 'var(--radius)',
            fontSize: 11, fontWeight: 500, color: 'white',
          }}>
            Son {product.stock} adet
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 18, fontWeight: 500,
          color: 'var(--text-dark)',
          marginBottom: 6, lineHeight: 1.3,
        }}>
          {product.name}
        </h3>
        {product.description && (
          <p style={{
            fontSize: 13, color: 'var(--text-muted)',
            lineHeight: 1.6, marginBottom: 12,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flex: 1,
          }}>
            {product.description}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600, color: 'var(--green)' }}>
            {product.price.toLocaleString('tr-TR')} ₺
          </span>
          <button
            onClick={() => onOrder(product)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'var(--green)', color: 'white',
              padding: '8px 16px', borderRadius: 'var(--radius)',
              fontSize: 13, fontWeight: 500,
              border: 'none', cursor: 'pointer',
              transition: 'var(--transition)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--green-light)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--green)'}
          >
            Sipariş Ver
          </button>
        </div>
      </div>
    </article>
  )
}
