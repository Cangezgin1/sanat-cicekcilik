import React, { useState, useEffect } from 'react'
import { BACKEND_URL } from '../utils/api'

export default function Reviews({ settings }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/reviews`)
      .then(r => r.json())
      .then(d => { setReviews(d.data || []); setLoading(false); })
      .catch(() => setLoading(false))
  }, [])

  const rating = settings?.google_rating || '4.9'
  const reviewCount = settings?.google_review_count || '128'

  if (!loading && reviews.length === 0) return null

  return (
    <section style={{ padding: '100px 0', background: 'white', position: 'relative', overflow: 'hidden' }}>
      {/* Dekoratif arka plan */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'radial-gradient(circle at 10% 50%, rgba(184,146,74,0.04) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      <div className="container" style={{ position: 'relative' }}>
        {/* Başlık */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p className="eyebrow" style={{ marginBottom: 12 }}>Müşteri Yorumları</p>
          <h2 className="section-title" style={{ marginBottom: 20 }}>
            Müşterilerimiz Ne Diyor?
          </h2>

          {/* Genel puan */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 16,
            background: 'var(--cream)', padding: '14px 28px',
            border: '1px solid var(--border)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{rating}</div>
              <div style={{ fontSize: 10, color: 'var(--text-soft)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 4 }}>/ 5</div>
            </div>
            <div style={{ width: 1, height: 40, background: 'var(--border)' }} />
            <div>
              <StarRow rating={5} size={18} />
              <div style={{ fontSize: 12, color: 'var(--text-soft)', marginTop: 4 }}>{reviewCount} Google yorumu</div>
            </div>
            <div style={{ width: 1, height: 40, background: 'var(--border)' }} />
            <img
              src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png"
              alt="Google"
              style={{ height: 20, opacity: 0.7 }}
            />
          </div>
        </div>

        {/* Yorum kartları */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ padding: 24, border: '1px solid var(--border)' }}>
                <div className="skeleton" style={{ height: 14, width: '40%', marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 12, width: '100%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 12, width: '80%' }} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {reviews.map((review, i) => (
              <ReviewCard key={i} review={review} index={i} />
            ))}
          </div>
        )}

        {/* Google'da gör butonu */}
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <a
            href={`https://search.google.com/local/reviews?placeid=${settings?.google_maps_place_id || ''}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-dark"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <GoogleIcon />
            Google'da Tüm Yorumları Gör
          </a>
        </div>
      </div>
    </section>
  )
}

function ReviewCard({ review, index }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '24px',
        border: `1px solid ${hovered ? 'var(--gold)' : 'var(--border)'}`,
        background: hovered ? 'var(--cream)' : 'white',
        transition: 'all 0.3s var(--ease)',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? '0 12px 40px rgba(184,146,74,0.12)' : 'none',
        display: 'flex', flexDirection: 'column', gap: 14,
        animation: `fadeUp 0.5s ${index * 0.08}s ease both`,
      }}
    >
      {/* Üst kısım: isim + puan */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Avatar */}
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'var(--gold)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700, color: 'white',
            fontFamily: 'var(--font-display)',
            flexShrink: 0,
            overflow: 'hidden',
          }}>
            {review.profile_photo ? (
              <img src={review.profile_photo} alt={review.author} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none' }} />
            ) : (
              review.author?.[0]?.toUpperCase()
            )}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{review.author}</div>
            <div style={{ fontSize: 11, color: 'var(--text-soft)', marginTop: 1 }}>{review.time}</div>
          </div>
        </div>
        <StarRow rating={review.rating} size={13} />
      </div>

      {/* Yorum metni */}
      {review.text && (
        <p style={{
          fontSize: 13, color: 'var(--text-mid)',
          lineHeight: 1.75,
          fontStyle: 'italic',
          position: 'relative',
          paddingLeft: 16,
          borderLeft: '2px solid var(--gold)',
          flex: 1,
        }}>
          "{review.text.length > 180 ? review.text.slice(0, 180) + '...' : review.text}"
        </p>
      )}

      {/* Google logosu */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <GoogleIcon small />
      </div>
    </div>
  )
}

function StarRow({ rating, size = 14 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= rating ? '#F5A623' : '#E0E0E0'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  )
}

function GoogleIcon({ small }) {
  const size = small ? 14 : 16
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}
