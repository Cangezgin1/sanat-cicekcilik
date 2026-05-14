import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await login(username, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Kullanıcı adı veya şifre hatalı')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'var(--ink)',
    }}>
      {/* Sol panel */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 40,
      }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          {/* Logo */}
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 42, height: 42, background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🌸</div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'white' }}>Sanat Çiçekçilik</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Yönetim Paneli</div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: 'white', marginBottom: 8 }}>Giriş Yap</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 300 }}>Yönetim paneline erişmek için giriş yapın.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="label" style={{ color: 'rgba(255,255,255,0.4)' }}>Kullanıcı Adı</label>
              <input
                type="text" className="input"
                value={username} onChange={e => setUsername(e.target.value)}
                placeholder="admin" required autoComplete="username"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.1)', color: 'white' }}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
            <div>
              <label className="label" style={{ color: 'rgba(255,255,255,0.4)' }}>Şifre</label>
              <input
                type="password" className="input"
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required autoComplete="current-password"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.1)', color: 'white' }}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
            {error && (
              <div style={{ padding: '10px 14px', background: 'rgba(196,96,106,0.15)', border: '1px solid rgba(196,96,106,0.3)', color: '#f08090', fontSize: 13 }}>
                ⚠️ {error}
              </div>
            )}
            <button type="submit" disabled={loading} className="btn btn-gold" style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 12, letterSpacing: '0.1em', marginTop: 8, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>
        </div>
      </div>

      {/* Sağ dekoratif panel */}
      <div style={{
        width: '40%', maxWidth: 480,
        background: 'linear-gradient(160deg, rgba(61,92,58,0.3), rgba(184,146,74,0.15))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }} className="login-right">
        <div style={{ fontSize: 200, opacity: 0.08, userSelect: 'none' }}>🌸</div>
        <style>{`@media(max-width:768px){.login-right{display:none}}`}</style>
      </div>
    </div>
  )
}
