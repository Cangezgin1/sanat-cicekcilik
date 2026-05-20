import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'

export default function ForgotPassword() {
  const [step, setStep] = useState(1)
  const [answer, setAnswer] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPassword2, setNewPassword2] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const SECURITY_ANSWER = 'sanat' // Güvenlik sorusu cevabı

  const handleStep1 = (e) => {
    e.preventDefault()
    if (answer.toLowerCase().trim() !== SECURITY_ANSWER) {
      setError('Cevap hatalı')
      return
    }
    setError('')
    setStep(2)
  }

  const handleReset = async (e) => {
    e.preventDefault()
    if (newPassword !== newPassword2) { setError('Şifreler eşleşmiyor'); return }
    if (newPassword.length < 6) { setError('Şifre en az 6 karakter olmalı'); return }
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { answer, newPassword })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0D0D0D' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
              <div style={{ width: 36, height: 36, background: '#B8924A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🌸</div>
              <span style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: 15, fontWeight: 600 }}>Sanat Çiçekçilik</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, color: 'white', marginBottom: 8 }}>Şifre Sıfırla</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 300 }}>Güvenlik sorusunu cevaplayın.</p>
          </div>

          {success ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <p style={{ color: 'white', fontSize: 15, marginBottom: 24 }}>Şifreniz başarıyla güncellendi!</p>
              <Link to="/login" style={{ color: '#B8924A', fontSize: 14 }}>Giriş sayfasına dön →</Link>
            </div>
          ) : step === 1 ? (
            <form onSubmit={handleStep1} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ padding: '14px 16px', background: 'rgba(184,146,74,0.1)', border: '1px solid rgba(184,146,74,0.3)', fontSize: 13, color: '#D4A96A' }}>
                💡 Güvenlik Sorusu: <strong>İşletmenizin adı ne?</strong>
              </div>
              <div>
                <label className="label" style={{ color: 'rgba(255,255,255,0.4)' }}>Cevabınız</label>
                <input className="input" value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Cevap..." required
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.1)', color: 'white' }}
                  onFocus={e => e.target.style.borderColor = '#B8924A'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
              {error && <div style={{ padding: '10px 14px', background: 'rgba(196,96,106,0.15)', color: '#f08090', fontSize: 13 }}>⚠️ {error}</div>}
              <button type="submit" className="btn btn-gold" style={{ width: '100%', justifyContent: 'center', padding: 13 }}>Devam Et</button>
              <Link to="/login" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, textAlign: 'center' }}>← Giriş sayfasına dön</Link>
            </form>
          ) : (
            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="label" style={{ color: 'rgba(255,255,255,0.4)' }}>Yeni Şifre</label>
                <input type="password" className="input" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6}
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.1)', color: 'white' }}
                  onFocus={e => e.target.style.borderColor = '#B8924A'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
              <div>
                <label className="label" style={{ color: 'rgba(255,255,255,0.4)' }}>Yeni Şifre (Tekrar)</label>
                <input type="password" className="input" value={newPassword2} onChange={e => setNewPassword2(e.target.value)} required
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.1)', color: 'white' }}
                  onFocus={e => e.target.style.borderColor = '#B8924A'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
              {error && <div style={{ padding: '10px 14px', background: 'rgba(196,96,106,0.15)', color: '#f08090', fontSize: 13 }}>⚠️ {error}</div>}
              <button type="submit" className="btn btn-gold" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: 13 }}>
                {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
              </button>
            </form>
          )}
        </div>
      </div>
      <div style={{ width: '40%', background: 'linear-gradient(160deg, rgba(61,92,58,0.3), rgba(184,146,74,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="login-right">
        <div style={{ fontSize: 200, opacity: 0.08 }}>🌸</div>
        <style>{`@media(max-width:768px){.login-right{display:none}}`}</style>
      </div>
    </div>
  )
}
