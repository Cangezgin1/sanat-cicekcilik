import React from 'react'
import { Link } from 'react-router-dom'

export default function About({ settings }) {
  const waNumber = settings?.whatsapp_number || '905432990430'
  const workStart = settings?.work_start || '10:00'
  const workEnd = settings?.work_end || '23:30'

  React.useEffect(() => {
    document.title = 'Hakkımızda | Sanat Çiçekçilik'
  }, [])

  return (
    <main style={{ paddingTop: 72, minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{
        background: '#0D0D0D', padding: '80px 0 70px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: '-3%', top: '50%', transform: 'translateY(-50%)', fontSize: 280, opacity: 0.04, lineHeight: 1, userSelect: 'none' }}>🌸</div>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(to bottom, transparent, var(--gold), transparent)' }} />
        <div className="container" style={{ position: 'relative' }}>
          <p className="eyebrow" style={{ color: 'var(--gold)', marginBottom: 14 }}>Hikayemiz</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 700, color: 'white', letterSpacing: '-0.02em', lineHeight: 1.1, maxWidth: 600 }}>
            Çiçeğin Sanatını<br />
            <em style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>Yaşatıyoruz</em>
          </h1>
        </div>
      </section>

      {/* Ana içerik */}
      <section style={{ padding: '80px 0', background: 'white' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 72, alignItems: 'center' }}>
            <div>
              <p className="eyebrow" style={{ marginBottom: 16 }}>Kim Biz?</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 24, lineHeight: 1.15 }}>
                Avcılar'dan Kalplere<br />Uzanan Bir Tutku
              </h2>
              <div style={{ width: 48, height: 2, background: 'var(--gold)', marginBottom: 28 }} />
              <p style={{ fontSize: 15, color: 'var(--text-mid)', lineHeight: 1.85, marginBottom: 20, fontWeight: 300 }}>
                Sanat Çiçekçilik, 2014 yılında Avcılar'ın kalbinde, çiçeklere duyulan derin bir sevgiden doğdu. Kurucumuz Ali Kocaburak'ın yıllarca süren ustalık deneyimi ve çiçeğe olan tutkusu, bugün binlerce müşteriyle buluşan bir markaya dönüştü.
              </p>
              <p style={{ fontSize: 15, color: 'var(--text-mid)', lineHeight: 1.85, marginBottom: 20, fontWeight: 300 }}>
                Her buket, her aranjman ve her saksı çiçeği; sevdiklerinize ulaştırdığımız bir duygu parçasıdır. Taze çiçekleri özenle seçiyor, elleriyle titizlikle hazırlıyor ve en kısa sürede kapınıza ulaştırıyoruz.
              </p>
              <p style={{ fontSize: 15, color: 'var(--text-mid)', lineHeight: 1.85, fontWeight: 300 }}>
                Avcılar, Esenyurt, Beylikdüzü, Büyükçekmece, Esenkent ve Bahçeşehir'e hızlı teslimat yapıyoruz. WhatsApp üzerinden dakikalar içinde sipariş verebilir, özel günlerinizi unutulmaz kılabilirsiniz.
              </p>
            </div>

            {/* Değerler */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {[
                { emoji: '🌹', title: 'Taze & Kaliteli', desc: 'Her sabah taze çiçekler temin ediyoruz. Solduk çiçek asla göndermiyoruz.' },
                { emoji: '⚡', title: 'Hızlı Teslimat', desc: 'Siparişiniz onaylandıktan sonra en kısa sürede kapınızda.' },
                { emoji: '💚', title: 'Özenli Paketleme', desc: 'Her buket ayrı bir sevgiyle paketleniyor, güvenle ulaşıyor.' },
                { emoji: '⭐', title: '10 Yıl Deneyim', desc: '2014\'ten bu yana binlerce müşteriye hizmet verdik.' },
              ].map(item => (
                <div key={item.title} style={{
                  padding: '28px 22px',
                  background: 'var(--cream)',
                  border: '1px solid var(--border)',
                  transition: 'all 0.3s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--gold-pale)'; e.currentTarget.style.borderColor = 'var(--gold)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--cream)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                >
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{item.emoji}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-soft)', lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* İstatistikler */}
      <section style={{ background: 'var(--cream-dark)', padding: '72px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 2 }}>
            {[
              ['2014', 'Kuruluş Yılı'],
              ['500+', 'Mutlu Müşteri'],
              ['4.9/5', 'Google Puanı'],
              ['6', 'Teslimat İlçesi'],
              ['10+', 'Yıl Deneyim'],
              [workStart+'–'+workEnd, 'Sipariş Saatleri'],
            ].map(([val, label]) => (
              <div key={label} style={{
                padding: '32px 20px', textAlign: 'center',
                background: 'white', border: '1px solid var(--border)',
              }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--gold)', letterSpacing: '-0.02em', marginBottom: 6 }}>{val}</div>
                <div style={{ fontSize: 10, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Adres & İletişim */}
      <section style={{ padding: '80px 0', background: 'white' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 48 }}>
            <div>
              <p className="eyebrow" style={{ marginBottom: 14 }}>Bize Ulaşın</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 32 }}>
                Her Zaman Yanınızdayız
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {[
                  ['📍', 'Adres', settings?.business_address || 'Yeşilkent Mh. Balıkyolu Cd. No:70/B Avcılar/İstanbul'],
                  ['📞', 'Telefon', settings?.business_phone || '05432990430'],
                  ['🕐', 'Çalışma Saatleri', `${workStart} – ${workEnd} (Her gün)`],
                  ['📸', 'Instagram', '@' + (settings?.instagram || 'sanat_cicekcilik')],
                ].map(([emoji, label, value]) => (
                  <div key={label} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '16px', border: '1px solid var(--border)', background: 'var(--cream)' }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{emoji}</span>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 14, color: 'var(--text-mid)' }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Google Maps iframe */}
            <div>
              <p className="eyebrow" style={{ marginBottom: 14 }}>Konumumuz</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 24 }}>
                Mağazamızı Ziyaret Edin
              </h2>
              <div style={{ border: '1px solid var(--border)', overflow: 'hidden' }}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3011.2!2d28.7!3d40.98!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14b2a0b59a852512%3A0x90f9f901934a7105!2sSanat%20%C3%87i%C3%A7ek%C3%A7ilik!5e0!3m2!1str!2str!4v1"
                  width="100%" height="280"
                  style={{ border: 0, display: 'block' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Sanat Çiçekçilik Konum"
                />
              </div>
              <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                <a
                  href="https://maps.google.com/?q=Sanat+Çiçekçilik+Avcılar+İstanbul"
                  target="_blank" rel="noopener noreferrer"
                  className="btn-gold"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, padding: '11px 20px' }}
                >
                  📍 Yol Tarifi Al
                </a>
                <a
                  href={`https://wa.me/${waNumber}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: '#25D366', color: 'white',
                    padding: '11px 20px', fontSize: 12, fontWeight: 600,
                    letterSpacing: '0.06em',
                  }}
                >
                  💬 WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--ink)', padding: '72px 0', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(184,146,74,0.08) 0%, transparent 60%)' }} />
        <div className="container" style={{ position: 'relative' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 700, color: 'white', letterSpacing: '-0.02em', marginBottom: 16 }}>
            Hemen Sipariş Verin
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', marginBottom: 36, fontWeight: 300 }}>
            Sevdiklerinize en güzel çiçekleri gönderin.
          </p>
          <Link to="/urunler" className="btn-gold" style={{ fontSize: 12, padding: '14px 36px' }}>
            🌸 Koleksiyona Git
          </Link>
        </div>
      </section>

    </main>
  )
}
