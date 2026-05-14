import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProducts, getCategories } from '../utils/api'
import ProductCard from '../components/ProductCard'
import OrderModal from '../components/OrderModal'

export default function Products({ settings }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const activeCategory = searchParams.get('kategori') || 'all'

  useEffect(() => {
    document.title = 'Çiçeklerimiz | Sanat Çiçekçilik'
    getCategories().then(r => setCategories(r.data || []))
  }, [])

  useEffect(() => {
    setLoading(true)
    const cat = activeCategory === 'all' ? null : activeCategory
    getProducts(cat).then(r => {
      setProducts(r.data || [])
      setLoading(false)
    })
  }, [activeCategory])

  const filtered = products.filter(p =>
    search === '' || p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main style={{ paddingTop: 90, minHeight: '100vh' }}>
      {/* Page Header */}
      <div style={{ background: 'var(--cream-dark)', borderBottom: '1px solid var(--border)', padding: '40px 0 32px' }}>
        <div className="container">
          <p className="section-label">Koleksiyonumuz</p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 500, marginBottom: 8 }}>
            Çiçeklerimiz
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
            Tüm ürünlerimiz taze ve özenle hazırlanmaktadır.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        {/* Filtreler */}
        <div style={{
          display: 'flex', gap: 16, flexWrap: 'wrap',
          alignItems: 'center', marginBottom: 32,
          justifyContent: 'space-between',
        }}>
          {/* Kategori filtreleri */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1 }}>
            <FilterButton
              active={activeCategory === 'all'}
              onClick={() => setSearchParams({})}
              label="Tümü"
            />
            {categories.map(cat => (
              <FilterButton
                key={cat.id}
                active={activeCategory === cat.slug}
                onClick={() => setSearchParams({ kategori: cat.slug })}
                label={cat.name}
              />
            ))}
          </div>

          {/* Arama */}
          <div style={{ position: 'relative', minWidth: 200 }}>
            <input
              type="text"
              placeholder="Çiçek ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '9px 36px 9px 14px',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontSize: 14, background: 'white',
                outline: 'none', fontFamily: 'var(--font-sans)',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--green)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 16 }}>🔍</span>
          </div>
        </div>

        {/* Sonuç sayısı */}
        {!loading && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
            {filtered.length} ürün bulundu
          </p>
        )}

        {/* Ürün grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ borderRadius: 4, overflow: 'hidden' }}>
                <div className="skeleton" style={{ height: 200 }} />
                <div style={{ padding: 16 }}>
                  <div className="skeleton" style={{ height: 20, marginBottom: 8, width: '70%' }} />
                  <div className="skeleton" style={{ height: 14, width: '90%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>🌿</div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, marginBottom: 8 }}>Ürün bulunamadı</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Farklı bir kategori veya arama terimi deneyin.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {filtered.map((p, i) => (
              <div key={p.id} style={{ animation: `fadeUp 0.4s ${Math.min(i, 5) * 0.07}s ease both` }}>
                <ProductCard product={p} onOrder={setSelectedProduct} index={i} />
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedProduct && (
        <OrderModal
          product={selectedProduct}
          settings={settings}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </main>
  )
}

function FilterButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '7px 18px',
        borderRadius: 100,
        border: `1.5px solid ${active ? 'var(--green)' : 'var(--border)'}`,
        background: active ? 'var(--green)' : 'white',
        color: active ? 'white' : 'var(--text-mid)',
        fontSize: 13, fontWeight: active ? 500 : 400,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      {label}
    </button>
  )
}
