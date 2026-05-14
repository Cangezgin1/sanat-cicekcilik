import React, { useState, useEffect } from 'react'
import { getDistricts, createOrder } from '../utils/api'
import { buildWhatsAppMessage, isWorkingHours } from '../utils/whatsapp'

export default function OrderModal({ product, settings, onClose }) {
  const [quantity, setQuantity] = useState(1)
  const [districts, setDistricts] = useState([])
  const [selectedDistrict, setSelectedDistrict] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getDistricts().then(r => setDistricts(r.data || []))
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const totalPrice = product.price * quantity

  const handleOrder = async () => {
    if (!selectedDistrict) { setError('Lütfen teslimat ilçenizi seçin'); return }
    if (!selectedDistrict.active) { setError('Bu ilçeye şu an sipariş gönderemiyoruz'); return }

    const workStart = settings?.work_start || '10:00'
    const workEnd = settings?.work_end || '23:30'
    if (!isWorkingHours(workStart, workEnd)) {
      setError(`Siparişler ${workStart} - ${workEnd} saatleri arasında alınmaktadır.`)
      return
    }

    setLoading(true)
    setError('')

    try {
      await createOrder({
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        quantity,
        total_price: totalPrice,
        district_id: selectedDistrict.id,
        district_name: selectedDistrict.name,
      })
    } catch (err) {
      // Sipariş kaydedilemese bile WP'ye yönlendir
      console.log('Order save error:', err?.response?.data?.message)
    }

    // Her durumda WP'ye yönlendir
    const msg = buildWhatsAppMessage({
      productName: product.name,
      quantity,
      price: product.price,
      district: selectedDistrict.name,
      totalPrice,
    })

    const phone = (settings?.whatsapp_number || '905432990430').replace(/\D/g, '')
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')
    setLoading(false)
    onClose()
  }

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(10,10,10,0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div style={{
        background: 'white',
        width: '100%', maxWidth: 500,
        maxHeight: '92vh',
        overflow: 'auto',
        animation: 'fadeUp 0.3s ease',
        position: 'relative',
      }}>
        {/* Gold top border */}
        <div style={{ height: 3, background: 'linear-gradient(to right, var(--gold), var(--gold-light), var(--gold))' }} />

        {/* Header */}
        <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, marginBottom: 6 }}>Sipariş Ver</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text)' }}>{product.name}</h2>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32,
            background: 'var(--cream-dark)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, color: 'var(--text-soft)',
            flexShrink: 0, border: 'none', cursor: 'pointer',
          }}>✕</button>
        </div>

        {/* Ürün bilgisi */}
        <div style={{ display: 'flex', gap: 14, padding: '16px 24px', background: 'var(--cream)', borderBottom: '1px solid var(--border)' }}>
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} style={{ width: 72, height: 72, objectFit: 'cover', flexShrink: 0 }} />
          ) : (
            <div style={{ width: 72, height: 72, background: 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0 }}>🌸</div>
          )}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {product.description && (
              <p style={{ fontSize: 12, color: 'var(--text-soft)', lineHeight: 1.6, marginBottom: 6 }}>{product.description}</p>
            )}
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
              {product.price.toLocaleString('tr-TR')} ₺
            </div>
          </div>
        </div>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Adet */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-soft)', marginBottom: 12 }}>Adet</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1.5px solid var(--border)', width: 'fit-content' }}>
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                style={{
                  width: 44, height: 44,
                  background: quantity === 1 ? 'var(--cream)' : 'white',
                  fontSize: 20, fontWeight: 300,
                  color: quantity === 1 ? 'var(--text-soft)' : 'var(--text)',
                  border: 'none', cursor: quantity === 1 ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >−</button>
              <div style={{
                width: 56, height: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700,
                borderLeft: '1.5px solid var(--border)', borderRight: '1.5px solid var(--border)',
                background: 'var(--gold-pale)',
                color: 'var(--text)',
              }}>{quantity}</div>
              <button
                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                style={{
                  width: 44, height: 44,
                  background: quantity >= product.stock ? 'var(--cream)' : 'white',
                  fontSize: 20, fontWeight: 300,
                  color: quantity >= product.stock ? 'var(--text-soft)' : 'var(--text)',
                  border: 'none', cursor: quantity >= product.stock ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >+</button>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-soft)', marginTop: 8 }}>Stokta {product.stock} adet mevcut</p>
          </div>

          {/* İlçe */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-soft)', marginBottom: 12 }}>
              Teslimat İlçesi
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {districts.map(d => {
                const isSelected = selectedDistrict?.id === d.id
                return (
                  <button
                    key={d.id}
                    onClick={() => { setSelectedDistrict(d); setError('') }}
                    style={{
                      padding: '12px 14px',
                      border: isSelected ? '2px solid var(--gold)' : '1.5px solid var(--border)',
                      background: isSelected ? 'var(--gold)' : (d.active ? 'white' : 'var(--cream)'),
                      color: isSelected ? 'white' : (d.active ? 'var(--text)' : 'var(--text-soft)'),
                      fontSize: 13, fontWeight: isSelected ? 600 : 400,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left',
                      position: 'relative',
                      boxShadow: isSelected ? '0 4px 16px rgba(184,146,74,0.3)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>{d.name}</span>
                      {isSelected && (
                        <span style={{ fontSize: 14, marginLeft: 6 }}>✓</span>
                      )}
                    </div>
                    {!d.active && (
                      <span style={{ display: 'block', fontSize: 10, color: isSelected ? 'rgba(255,255,255,0.7)' : '#C4606A', marginTop: 2 }}>
                        Şu an kapalı
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            {selectedDistrict && !selectedDistrict.active && (
              <div style={{ marginTop: 10, padding: '10px 14px', background: '#fdf0f1', border: '1px solid #f5c6c9', fontSize: 13, color: '#C4606A' }}>
                ⚠️ Bu ilçeye şu an sipariş gönderemiyoruz. Lütfen başka ilçe seçin.
              </div>
            )}
          </div>

          {/* Toplam */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '16px 20px',
            background: 'var(--ink)',
          }}>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>Toplam Tutar</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>
                {totalPrice.toLocaleString('tr-TR')} ₺
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'right' }}>
              <div>{quantity} adet</div>
              <div>× {product.price.toLocaleString('tr-TR')} ₺</div>
            </div>
          </div>

          {error && (
            <div style={{ padding: '12px 16px', background: '#fdf0f1', border: '1px solid #f5c6c9', fontSize: 13, color: '#C4606A' }}>
              ⚠️ {error}
            </div>
          )}

          {/* WP Button */}
          <button
            onClick={handleOrder}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              background: loading ? '#ccc' : '#25D366',
              color: 'white',
              padding: '17px',
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 14, fontWeight: 700, letterSpacing: '0.06em',
              transition: 'all 0.3s',
              width: '100%',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#1ebe5d' }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#25D366' }}
          >
            {loading ? 'Yükleniyor...' : (
              <>
                <WAIcon />
                WhatsApp ile Sipariş Ver
              </>
            )}
          </button>
          <p style={{ fontSize: 11, color: 'var(--text-soft)', textAlign: 'center', marginTop: -12 }}>
            WhatsApp'a yönlendirileceksiniz. Mesajı gönderin, siparişiniz alınsın.
          </p>
        </div>
      </div>
    </div>
  )
}

function WAIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
}
