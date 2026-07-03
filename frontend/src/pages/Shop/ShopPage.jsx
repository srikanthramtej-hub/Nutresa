import React, { useState, useEffect, useMemo } from 'react'
import ProductCard from '../../components/ProductCard/ProductCard'
import { productsAPI } from '../../api'
import './ShopPage.css'

const SORT_OPTIONS = [
  { value:'default',    label:'Sort: Default' },
  { value:'price-asc',  label:'Price: Low → High' },
  { value:'price-desc', label:'Price: High → Low' },
  { value:'rating',     label:'Top Rated' },
]

export default function ShopPage() {
  const [products,    setProducts]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [category,    setCategory]    = useState('All')
  const [search,      setSearch]      = useState('')
  const [sortBy,      setSortBy]      = useState('default')
  const [inStockOnly, setInStockOnly] = useState(false)

  useEffect(() => {
    setLoading(true)
    productsAPI.getAll(category !== 'All' ? category : undefined)
      .then(res => setProducts(res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [category])

  const filtered = useMemo(() => {
    let list = [...products]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.tags||[]).some(t => t.toLowerCase().includes(q))
      )
    }
    if (inStockOnly) list = list.filter(p => p.stock > 0)
    if (sortBy === 'price-asc')  list.sort((a,b) => a.basePrice - b.basePrice)
    if (sortBy === 'price-desc') list.sort((a,b) => b.basePrice - a.basePrice)
    if (sortBy === 'rating')     list.sort((a,b) => (b.rating||0) - (a.rating||0))
    return list
  }, [products, search, sortBy, inStockOnly])

  const cats = ['All','Nuts','Dried Fruits']

  return (
    <div className="page-wrapper">
      <div className="shop__header">
        <div className="shop__header-inner">
          <p className="section-eyebrow">Our Collection</p>
          <h1 className="shop__page-title">Premium Dry Fruits & Nuts</h1>
        </div>
      </div>

      <div className="shop__toolbar-wrap">
        <div className="shop__toolbar">
          <div className="shop__categories">
            {cats.map(c => (
              <button key={c}
                className={"shop__cat-btn" + (category===c ? ' shop__cat-btn--active' : '')}
                onClick={() => setCategory(c)}>{c}</button>
            ))}
          </div>
          <div className="shop__search-wrap">
            <span className="shop__search-icon">🔍</span>
            <input className="shop__search-input" placeholder="Search…"
              value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button className="shop__search-clear" onClick={() => setSearch('')}>✕</button>}
          </div>
          <select className="shop__sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <label className="shop__stock-toggle">
            <input type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} />
            <span>In stock only</span>
          </label>
          <span className="shop__count">{filtered.length} products</span>
        </div>
      </div>

      <div className="section-container" style={{paddingTop:28}}>
        {loading ? (
          <div className="shop__product-grid">
            {[1,2,3,4,5,6].map(i => <div key={i} className="shop__skeleton" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <div className="empty-title">No products found</div>
            <div className="empty-sub">Try adjusting your filters</div>
          </div>
        ) : (
          <div className="shop__product-grid">
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}