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
    document.title = 'Koleksiyon | Sanat Çiçekçilik'
    getCategories().then(r => setCategories(r.data || []))
  }, [])

  useEffect(() => {
    setLoading(true)
    getProducts(activeCategory === 'all' ? null : activeCategory).then(r => {
      setProducts(r.data || [])
      setLoading(false)
    })
  }, [activeCategory])

  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main style={{ paddingTop: 72, minHeight: '100vh' }}>
      {/* Page header */}
      <div style={{ background: 'var(--ink)', padding: '60px 0 50px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '-3%', top: '50%', transform: 'translateY(-50%)', fontSize: 200, opacity: 0.05, lineHeight: 1, userSelect: 'none' }}>💐</div>
        <div className="container" style={{ position: 'relative' }}>
          <p className="eyebrow" style={{ color: 'var(--gold)', marginBottom: 14 }}>Tüm Ürünler</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 700, color: 'white', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Koleksiyonumuz
          </h1>
        </div>
      </div>

      <div className="container" style={{ padding: '36px 32px' }}>
        {/* Filtreler */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <FilterBtn active={activeCategory === 'all'} onClick={() => setSearchParams({})}>Tümü</FilterBtn>
            {categories.map(cat => (
              <FilterBtn key={cat.id} active={activeCategory === cat.slug} onClick={() => setSearchParams({ kategori: cat.slug })}>
                {cat.name}
              </FilterBtn>
            ))}
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Çiçek ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding: '10px 36px 10px 14px',
                border: '1.5px solid var(--border)',
                fontSize: 13, background: 'white', outline: 'none',
                fontFamily: 'var(--font-sans)', minWidth: 200,
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--gold)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-soft)', fontSize: 14 }}>🔍</span>
          </div>
        </div>

        {!loading && (
          <p style={{ fontSize: 12, color: 'var(--text-soft)', marginBottom: 24, letterSpacing: '0.06em' }}>
            {filtered.length} ürün
          </p>
        )}

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {[...Array(8)].map((_, i) => (
              <div key={i}>
                <div className="skeleton" style={{ paddingBottom: '110%' }} />
                <div style={{ padding: 20, border: '1px solid var(--border)', borderTop: 'none' }}>
                  <div className="skeleton" style={{ height: 22, marginBottom: 8, width: '65%' }} />
                  <div className="skeleton" style={{ height: 13, width: '85%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🌿</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 8 }}>Ürün bulunamadı</h3>
            <p style={{ color: 'var(--text-soft)' }}>Farklı bir kategori veya arama deneyin.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {filtered.map((p, i) => (
              <div key={p.id} style={{ animation: `fadeUp 0.4s ${Math.min(i, 5) * 0.07}s ease both` }}>
                <ProductCard product={p} onOrder={setSelectedProduct} index={i} />
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedProduct && (
        <OrderModal product={selectedProduct} settings={settings} onClose={() => setSelectedProduct(null)} />
      )}
    </main>
  )
}

function FilterBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: '8px 18px',
      border: `1.5px solid ${active ? 'var(--gold)' : 'var(--border)'}`,
      background: active ? 'var(--gold)' : 'white',
      color: active ? 'white' : 'var(--text-mid)',
      fontSize: 11, fontWeight: 600,
      letterSpacing: '0.08em', textTransform: 'uppercase',
      cursor: 'pointer',
      transition: 'all 0.2s',
    }}>
      {children}
    </button>
  )
}
