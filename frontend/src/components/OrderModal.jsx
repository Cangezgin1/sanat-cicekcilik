import React, { useState, useEffect } from 'react'
import { getDistricts, createOrder } from '../utils/api'
import { buildWhatsAppMessage, isWorkingHours } from '../utils/whatsapp'
import { getImageUrl } from '../utils/api'

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

    // Önce backend'e kaydet (hata olsa devam et)
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
      console.log('Order save error:', err?.response?.data?.message)
    }

    // WhatsApp mesajı oluştur ve yönlendir
    const msg = buildWhatsAppMessage({
      productName: product.name,
      quantity,
      price: product.price,
      district: selectedDistrict.name,
      totalPrice,
    })

    const phone = (settings?.whatsapp_number || '905432990430').replace(/\D/g, '')
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`

    // Mobil ve masaüstü için güvenilir yönlendirme
    setLoading(false)
    onClose()

    // Kısa gecikme ile aç - mobilde popup blocker sorununu önler
    setTimeout(() => {
      window.location.href = waUrl
    }, 100)
  }

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(10,10,10,0.8)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: 0,
        animation: 'fadeIn 0.2s ease',
      }}
    >
      {/* Mobilde bottom sheet, masaüstünde ortalanmış */}
      <div style={{
        background: 'white',
        width: '100%', maxWidth: 520,
        maxHeight: '95vh',
        overflow: 'auto',
        animation: 'slideUpModal 0.35s cubic-bezier(0.4,0,0.2,1)',
        position: 'relative',
        borderRadius: '16px 16px 0 0',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        <style>{`
          @media (min-width: 600px) {
            .modal-inner {
              border-radius: 4px !important;
              margin: auto;
            }
          }
          @keyframes slideUpModal {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>

        {/* Drag handle (mobilde) */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: 40, height: 4, background: 'var(--border)', borderRadius: 2 }} />
        </div>

        {/* Gold top border */}
        <div style={{ height: 3, background: 'linear-gradient(to right, var(--gold), var(--gold-light), var(--gold))', margin: '12px 0 0' }} />

        {/* Header */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, marginBottom: 6 }}>Sipariş Ver</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text)' }}>{product.name}</h2>
          </div>
          <button onClick={onClose} style={{
            width: 34, height: 34, background: 'var(--cream-dark)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, color: 'var(--text-soft)', flexShrink: 0,
            border: 'none', cursor: 'pointer', borderRadius: '50%',
          }}>✕</button>
        </div>

        {/* Ürün bilgisi */}
        <div style={{ display: 'flex', gap: 14, padding: '14px 20px', background: 'var(--cream)', borderBottom: '1px solid var(--border)' }}>
          {product.image_url ? (
            <img src={getImageUrl(product.image_url)} alt={product.name} style={{ width: 64, height: 64, objectFit: 'cover', flexShrink: 0, borderRadius: 4 }} />
          ) : (
            <div style={{ width: 64, height: 64, background: 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0, borderRadius: 4 }}>🌸</div>
          )}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {product.description && (
              <p style={{ fontSize: 12, color: 'var(--text-soft)', lineHeight: 1.5, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.description}</p>
            )}
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
              {product.price.toLocaleString('tr-TR')} ₺
            </div>
          </div>
        </div>

        <div style={{ padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Adet */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-soft)', marginBottom: 10 }}>Adet</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1.5px solid var(--border)', width: 'fit-content' }}>
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                style={{ width: 48, height: 48, background: quantity === 1 ? 'var(--cream)' : 'white', fontSize: 22, color: quantity === 1 ? 'var(--text-soft)' : 'var(--text)', border: 'none', cursor: quantity === 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >−</button>
              <div style={{ width: 56, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, borderLeft: '1.5px solid var(--border)', borderRight: '1.5px solid var(--border)', background: 'var(--gold-pale)', color: 'var(--text)' }}>
                {quantity}
              </div>
              <button
                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                style={{ width: 48, height: 48, background: quantity >= product.stock ? 'var(--cream)' : 'white', fontSize: 22, color: quantity >= product.stock ? 'var(--text-soft)' : 'var(--text)', border: 'none', cursor: quantity >= product.stock ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >+</button>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-soft)', marginTop: 6 }}>Stokta {product.stock} adet</p>
          </div>

          {/* İlçe seçimi - DÜZELTILDI */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-soft)', marginBottom: 10 }}>
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
                      padding: '11px 14px',
                      border: isSelected ? '2.5px solid var(--gold)' : '1.5px solid var(--border)',
                      background: isSelected ? 'var(--ink)' : (d.active ? 'white' : 'var(--cream)'),
                      color: isSelected ? 'white' : (d.active ? 'var(--text)' : 'var(--text-soft)'),
                      fontSize: 14,
                      fontWeight: isSelected ? 700 : 400,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left',
                      boxShadow: isSelected ? '0 4px 20px rgba(13,13,13,0.25)' : 'none',
                      transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>{d.name}</span>
                      {isSelected && (
                        <span style={{
                          width: 20, height: 20,
                          background: 'var(--gold)',
                          borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700,
                        }}>✓</span>
                      )}
                    </div>
                    {!d.active && (
                      <span style={{ display: 'block', fontSize: 10, color: isSelected ? 'rgba(255,255,255,0.6)' : '#C4606A', marginTop: 2 }}>
                        Şu an kapalı
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            {selectedDistrict && !selectedDistrict.active && (
              <div style={{ marginTop: 10, padding: '10px 14px', background: '#fdf0f1', border: '1px solid #f5c6c9', fontSize: 13, color: '#C4606A', borderRadius: 4 }}>
                ⚠️ Bu ilçeye şu an sipariş gönderemiyoruz.
              </div>
            )}
          </div>

          {/* Toplam */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'var(--ink)', borderRadius: 4 }}>
            <div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>Toplam</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>
                {totalPrice.toLocaleString('tr-TR')} ₺
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textAlign: 'right' }}>
              <div>{quantity} adet × {product.price.toLocaleString('tr-TR')} ₺</div>
            </div>
          </div>

          {error && (
            <div style={{ padding: '11px 14px', background: '#fdf0f1', border: '1px solid #f5c6c9', fontSize: 13, color: '#C4606A', borderRadius: 4 }}>
              ⚠️ {error}
            </div>
          )}

          {/* WhatsApp Butonu */}
          <button
            onClick={handleOrder}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              background: loading ? '#aaa' : '#25D366',
              color: 'white', padding: '18px',
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 15, fontWeight: 700, letterSpacing: '0.04em',
              width: '100%', borderRadius: 4,
              boxShadow: loading ? 'none' : '0 4px 20px rgba(37,211,102,0.3)',
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Yükleniyor...' : <><WAIcon /> WhatsApp ile Sipariş Ver</>}
          </button>

          <p style={{ fontSize: 11, color: 'var(--text-soft)', textAlign: 'center', marginTop: -12 }}>
            WhatsApp'a yönlendirileceksiniz. Mesajı göndermeniz yeterli.
          </p>
        </div>
      </div>
    </div>
  )
}

function WAIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
}
