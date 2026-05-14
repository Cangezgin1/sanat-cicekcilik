import React, { useState, useEffect } from 'react'
import { getDistricts, createOrder } from '../utils/api'
import { buildWhatsAppMessage, openWhatsApp, isWorkingHours } from '../utils/whatsapp'

export default function OrderModal({ product, settings, onClose }) {
  const [quantity, setQuantity] = useState(1)
  const [districts, setDistricts] = useState([])
  const [selectedDistrict, setSelectedDistrict] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)

  useEffect(() => {
    getDistricts().then(r => setDistricts(r.data || []))
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const totalPrice = product.price * quantity

  const handleOrder = async () => {
    if (!selectedDistrict) { setError('Lütfen ilçe seçin'); return }
    if (!selectedDistrict.active) { setError('Bu ilçeye şu an sipariş gönderemiyoruz'); return }

    const workStart = settings?.work_start || '10:00'
    const workEnd = settings?.work_end || '23:30'
    if (!isWorkingHours(workStart, workEnd)) {
      setError(`Siparişler sadece ${workStart} - ${workEnd} saatleri arasında alınmaktadır.`)
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

      const msg = buildWhatsAppMessage({
        productName: product.name,
        quantity,
        price: product.price,
        district: selectedDistrict.name,
        totalPrice,
      })

      openWhatsApp(settings?.whatsapp_number || '905432990430', msg)
      onClose()
    } catch (err) {
      const msg = err?.response?.data?.message || 'Bir hata oluştu'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(26, 26, 26, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div style={{
        background: 'var(--cream)',
        borderRadius: 8,
        width: '100%', maxWidth: 480,
        maxHeight: '90vh',
        overflow: 'auto',
        animation: 'fadeUp 0.3s ease',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          padding: '24px 24px 0',
        }}>
          <div>
            <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 4 }}>Sipariş Ver</p>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 500 }}>{product.name}</h2>
          </div>
          <button onClick={onClose} style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--cream-dark)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, color: 'var(--text-muted)',
            flexShrink: 0,
          }}>✕</button>
        </div>

        {/* Product info */}
        <div style={{ display: 'flex', gap: 16, padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.name}
              style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
            />
          )}
          <div style={{ flex: 1 }}>
            {product.description && (
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.6 }}>{product.description}</p>
            )}
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 500, color: 'var(--green)' }}>
              {product.price.toLocaleString('tr-TR')} ₺
            </p>
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Adet */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-mid)', display: 'block', marginBottom: 10, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Adet
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                style={{
                  width: 40, height: 40, borderRadius: 'var(--radius)',
                  border: '1.5px solid var(--border)',
                  background: 'white', fontSize: 20, color: 'var(--green)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'var(--transition)',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--green)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >−</button>
              <span style={{ fontSize: 22, fontWeight: 500, minWidth: 32, textAlign: 'center' }}>{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                style={{
                  width: 40, height: 40, borderRadius: 'var(--radius)',
                  border: '1.5px solid var(--border)',
                  background: 'white', fontSize: 20, color: 'var(--green)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'var(--transition)',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--green)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >+</button>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 8 }}>Stok: {product.stock}</span>
            </div>
          </div>

          {/* İlçe */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-mid)', display: 'block', marginBottom: 10, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Teslimat İlçesi
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {districts.map(d => (
                <button
                  key={d.id}
                  onClick={() => { setSelectedDistrict(d); setError('') }}
                  style={{
                    padding: '10px 12px',
                    border: `1.5px solid ${selectedDistrict?.id === d.id ? 'var(--green)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius)',
                    background: selectedDistrict?.id === d.id ? 'var(--green)' : 'white',
                    color: selectedDistrict?.id === d.id ? 'white' : (d.active ? 'var(--text-dark)' : 'var(--text-muted)'),
                    fontSize: 13, fontWeight: 500,
                    transition: 'var(--transition)',
                    textAlign: 'left',
                    opacity: d.active ? 1 : 0.6,
                    position: 'relative',
                  }}
                >
                  {d.name}
                  {!d.active && (
                    <span style={{ display: 'block', fontSize: 10, color: selectedDistrict?.id === d.id ? 'rgba(255,255,255,0.7)' : 'var(--rose)', marginTop: 2 }}>
                      Şu an kapalı
                    </span>
                  )}
                </button>
              ))}
            </div>
            {selectedDistrict && !selectedDistrict.active && (
              <p style={{ fontSize: 13, color: 'var(--rose)', marginTop: 8, background: 'rgba(196,96,106,0.08)', padding: '8px 12px', borderRadius: 'var(--radius)' }}>
                ⚠️ Bu ilçeye şu an sipariş gönderemiyoruz. Lütfen aktif bir ilçe seçin.
              </p>
            )}
          </div>

          {/* Toplam */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '16px', background: 'var(--cream-dark)',
            borderRadius: 'var(--radius)', marginBottom: 20,
          }}>
            <span style={{ fontSize: 14, color: 'var(--text-mid)' }}>Toplam Tutar</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 600, color: 'var(--green)' }}>
              {totalPrice.toLocaleString('tr-TR')} ₺
            </span>
          </div>

          {error && (
            <div style={{
              padding: '12px 16px', background: 'rgba(196,96,106,0.1)',
              border: '1px solid rgba(196,96,106,0.3)',
              borderRadius: 'var(--radius)', marginBottom: 16,
              fontSize: 14, color: 'var(--rose)',
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={handleOrder}
            disabled={loading}
            className="btn-whatsapp"
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? (
              'Yükleniyor...'
            ) : (
              <>
                <WhatsAppIcon />
                WhatsApp ile Sipariş Ver
              </>
            )}
          </button>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 10 }}>
            WhatsApp'a yönlendirileceksiniz. Sadece Gönder tuşuna basın.
          </p>
        </div>
      </div>
    </div>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}
