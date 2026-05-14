import React, { useState, useEffect } from 'react'
import api from '../utils/api'

export default function AdminSettings() {
  const [settings, setSettings] = useState({})
  const [districts, setDistricts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [activeTab, setActiveTab] = useState('genel')
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [newPwd2, setNewPwd2] = useState('')

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(''), 3000) }

  useEffect(() => {
    Promise.all([api.get('/settings'), api.get('/districts')])
      .then(([s, d]) => {
        setSettings(s.data.data || {})
        setDistricts(d.data.data || [])
        setLoading(false)
      })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/settings', settings)
      showToast('Ayarlar kaydedildi ✓')
    } catch {
      showToast('Hata oluştu', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDistrictToggle = async (id) => {
    await api.patch(`/districts/${id}/toggle`)
    setDistricts(prev => prev.map(d => d.id === id ? { ...d, active: d.active ? 0 : 1 } : d))
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (newPwd !== newPwd2) { showToast('Yeni şifreler eşleşmiyor', 'error'); return }
    if (newPwd.length < 6) { showToast('Şifre en az 6 karakter olmalı', 'error'); return }
    try {
      await api.post('/auth/change-password', { currentPassword: currentPwd, newPassword: newPwd })
      setCurrentPwd(''); setNewPwd(''); setNewPwd2('')
      showToast('Şifre değiştirildi ✓')
    } catch (e) {
      showToast(e.response?.data?.message || 'Hata oluştu', 'error')
    }
  }

  const set = (k, v) => setSettings(s => ({ ...s, [k]: v }))

  const tabs = ['genel', 'ilçeler', 'saatler', 'google', 'şifre']

  if (loading) return <div style={{ padding: 40, color: 'var(--text-muted)' }}>Yükleniyor...</div>

  return (
    <div style={{ animation: 'slideUp 0.3s ease' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 2 }}>Ayarlar</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>İşletme bilgileri ve sistem ayarları</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: 'none',
              fontSize: 13, fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? 'var(--green)' : 'var(--text-muted)',
              borderBottom: activeTab === tab ? '2px solid var(--green)' : '2px solid transparent',
              cursor: 'pointer',
              textTransform: 'capitalize',
              marginBottom: -1,
              transition: 'all 0.15s',
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Genel */}
      {activeTab === 'genel' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>İşletme Bilgileri</h3>
          <SettingField label="İşletme Adı" value={settings.business_name || ''} onChange={v => set('business_name', v)} />
          <SettingField label="Adres" value={settings.business_address || ''} onChange={v => set('business_address', v)} />
          <SettingField label="Telefon" value={settings.business_phone || ''} onChange={v => set('business_phone', v)} />
          <SettingField label="WhatsApp Numarası (Başında 90 ile: 905xxxxxxxx)" value={settings.whatsapp_number || ''} onChange={v => set('whatsapp_number', v)} />
          <SettingField label="Instagram (@ olmadan)" value={settings.instagram || ''} onChange={v => set('instagram', v)} />
          <SettingField label="SEO Meta Açıklaması" value={settings.meta_description || ''} onChange={v => set('meta_description', v)} textarea />

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
            <label className="toggle">
              <input type="checkbox" checked={settings.orders_enabled === '1'} onChange={e => set('orders_enabled', e.target.checked ? '1' : '0')} />
              <span className="toggle-slider" />
            </label>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Siparişler Aktif</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Kapatırsanız web sitesinden sipariş alınamaz</div>
            </div>
          </div>

          <div style={{ paddingTop: 12 }}>
            <button className="btn btn-green" onClick={handleSave} disabled={saving}>
              {saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
            </button>
          </div>
        </div>
      )}

      {/* İlçeler */}
      {activeTab === 'ilçeler' && (
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Teslimat İlçeleri</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            Pasif ilçelere web sitesinden sipariş verilemeye çalışılırsa müşteriye bilgi gösterilir.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {districts.map(d => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{d.name}</div>
                  <div style={{ fontSize: 12, color: d.active ? 'var(--green-muted)' : 'var(--red)', marginTop: 2 }}>
                    {d.active ? '✓ Aktif — Sipariş alınıyor' : '✗ Pasif — Sipariş alınmıyor'}
                  </div>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={!!d.active} onChange={() => handleDistrictToggle(d.id)} />
                  <span className="toggle-slider" />
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Saatler */}
      {activeTab === 'saatler' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600 }}>Çalışma Saatleri</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Bu saatler dışında sipariş vermeye çalışan müşterilere uyarı gösterilir.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 360 }}>
            <div>
              <label className="label">Açılış Saati</label>
              <input className="input" type="time" value={settings.work_start || '10:00'} onChange={e => set('work_start', e.target.value)} />
            </div>
            <div>
              <label className="label">Kapanış Saati</label>
              <input className="input" type="time" value={settings.work_end || '23:30'} onChange={e => set('work_end', e.target.value)} />
            </div>
          </div>
          <div style={{ background: 'var(--green-bg)', padding: '12px 16px', borderRadius: 6, fontSize: 13, color: 'var(--green)' }}>
            💡 Şu an seçili saatler: {settings.work_start || '10:00'} — {settings.work_end || '23:30'}
          </div>
          <button className="btn btn-green" onClick={handleSave} disabled={saving}>
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      )}

      {/* Google */}
      {activeTab === 'google' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600 }}>Google Maps Entegrasyonu</h3>
          <div style={{ background: '#fff8e1', padding: '12px 16px', borderRadius: 6, fontSize: 13, color: '#7a5c00' }}>
            💡 API key olmadan manuel puan gösterimi yapabilirsiniz. API key eklerseniz puan otomatik güncellenir.
          </div>
          <SettingField label="Google Maps API Key (opsiyonel)" value={settings.google_maps_api_key || ''} onChange={v => set('google_maps_api_key', v)} placeholder="AIzaSy..." />
          <SettingField label="Google Place ID (opsiyonel)" value={settings.google_maps_place_id || ''} onChange={v => set('google_maps_place_id', v)} placeholder="ChIJ..." />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <SettingField label="Manuel Puan (API olmadan)" value={settings.google_rating || ''} onChange={v => set('google_rating', v)} placeholder="4.9" />
            <SettingField label="Değerlendirme Sayısı" value={settings.google_review_count || ''} onChange={v => set('google_review_count', v)} placeholder="120" />
          </div>
          <button className="btn btn-green" onClick={handleSave} disabled={saving}>
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      )}

      {/* Şifre */}
      {activeTab === 'şifre' && (
        <div className="card" style={{ maxWidth: 400 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Şifre Değiştir</h3>
          <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="label">Mevcut Şifre</label>
              <input className="input" type="password" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} required autoComplete="current-password" />
            </div>
            <div>
              <label className="label">Yeni Şifre</label>
              <input className="input" type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} required autoComplete="new-password" minLength={6} />
            </div>
            <div>
              <label className="label">Yeni Şifre (Tekrar)</label>
              <input className="input" type="password" value={newPwd2} onChange={e => setNewPwd2(e.target.value)} required autoComplete="new-password" />
            </div>
            <button type="submit" className="btn btn-green">Şifreyi Değiştir</button>
          </form>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: toast.type === 'error' ? 'var(--red)' : 'var(--green)', color: 'white', padding: '12px 20px', borderRadius: 8, zIndex: 9999, fontSize: 13 }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}

function SettingField({ label, value, onChange, textarea, placeholder }) {
  return (
    <div>
      <label className="label">{label}</label>
      {textarea
        ? <textarea className="input" rows={3} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ resize: 'vertical' }} />
        : <input className="input" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      }
    </div>
  )
}
