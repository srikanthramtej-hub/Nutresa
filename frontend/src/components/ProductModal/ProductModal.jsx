import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { productsAPI } from '../../api'
import './ProductModal.css'

const UPLOADS = import.meta.env.VITE_UPLOADS_URL || 'http://localhost:4000'

function getImages(product) {
  if (Array.isArray(product.imageUrls) && product.imageUrls.length > 0) return product.imageUrls
  try {
    const arr = JSON.parse(product.imageUrls || '[]')
    if (arr.length > 0) return arr
  } catch {}
  if (product.imageUrl) return [product.imageUrl]
  return []
}

function buildSrc(url) {
  if (!url) return null
  if (url.startsWith('http')) return url
  return `${UPLOADS}${url.startsWith('/') ? '' : '/'}${url}`
}

export default function ProductModal({ product, onClose, onAddToCart }) {
  const navigate = useNavigate()
  const { user } = useAuth()

  const images = getImages(product)
  const [activeImg,    setActiveImg]    = useState(0)
  const [selectedWeight, setSelectedWeight] = useState(null)
  const [qty,          setQty]          = useState(1)
  const [activeTab,    setActiveTab]    = useState('description')
  const [reviews,      setReviews]      = useState(product.reviews || [])
  const [newRating,    setNewRating]    = useState(0)
  const [hoverRating,  setHoverRating]  = useState(0)
  const [reviewText,   setReviewText]   = useState('')
  const [reviewDone,   setReviewDone]   = useState(false)
  const [submitting,   setSubmitting]   = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  const isOOS     = product.stock === 0
  const canProceed = selectedWeight !== null && !isOOS

  function handleAddToCart() {
    if (!canProceed) return
    onAddToCart({ ...product, selectedWeight: selectedWeight.label, price: selectedWeight.price, cartKey: `${product.id}-${selectedWeight.label}` }, qty)
    onClose()
  }

  function handleBuyNow() {
    if (!canProceed) return
    onAddToCart({ ...product, selectedWeight: selectedWeight.label, price: selectedWeight.price, cartKey: `${product.id}-${selectedWeight.label}` }, qty)
    onClose()
    navigate('/cart')
  }

  async function submitReview() {
    if (!newRating || !reviewText.trim()) return
    setSubmitting(true)
    try {
      const res = await productsAPI.addReview(product.id, newRating, reviewText.trim())
      setReviews(prev => [{ id: res.data.id, name: user.name, rating: newRating, comment: reviewText, date: new Date().toISOString() }, ...prev])
      setNewRating(0); setReviewText(''); setReviewDone(true)
      setTimeout(() => setReviewDone(false), 3000)
    } catch {}
    setSubmitting(false)
  }

  return (
    <div className="pd__backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="pd__panel">
        <button className="pd__close-btn" onClick={onClose}>✕</button>

        <div className="pd__layout">

          {/* ── LEFT: Images ── */}
          <div className="pd__visual">

            {/* Main image */}
            <div className="pd__main-image-wrap">
              {images.length > 0 ? (
                <img
                  key={activeImg}
                  src={buildSrc(images[activeImg])}
                  alt={product.name}
                  className="pd__main-img"
                  onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }}
                />
              ) : null}
              <div className="pd__img-fallback" style={{ display: images.length > 0 ? 'none' : 'flex' }}>🌿</div>

              {/* Badges */}
              {product.isNew && !isOOS && <span className="pd__new-ribbon">✨ New</span>}
              {isOOS && <span className="pd__oos-ribbon">Out of Stock</span>}

              {/* Arrow navigation for multiple images */}
              {images.length > 1 && (
                <>
                  <button className="pd__img-arrow pd__img-arrow--left"
                    onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}>
                    ‹
                  </button>
                  <button className="pd__img-arrow pd__img-arrow--right"
                    onClick={() => setActiveImg(i => (i + 1) % images.length)}>
                    ›
                  </button>
                  <div className="pd__img-dots">
                    {images.map((_, i) => (
                      <button key={i}
                        className={"pd__img-dot" + (i === activeImg ? ' pd__img-dot--active' : '')}
                        onClick={() => setActiveImg(i)} />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="pd__thumbs">
                {images.map((url, i) => (
                  <button key={i}
                    className={"pd__thumb" + (i === activeImg ? ' pd__thumb--active' : '')}
                    onClick={() => setActiveImg(i)}>
                    <img src={buildSrc(url)} alt={`view-${i+1}`}
                      onError={e => { e.target.style.display='none' }} />
                  </button>
                ))}
              </div>
            )}

            {/* Quick info chips */}
            <div className="pd__quick-info">
              {product.origin    && <div className="pd__info-chip"><span className="pd__info-label">Origin</span><span className="pd__info-val">{product.origin}</span></div>}
              {product.shelfLife && <div className="pd__info-chip"><span className="pd__info-label">Shelf Life</span><span className="pd__info-val">{product.shelfLife}</span></div>}
              <div className="pd__info-chip"><span className="pd__info-label">Category</span><span className="pd__info-val">{product.category}</span></div>
            </div>
          </div>

          {/* ── RIGHT: Details ── */}
          <div className="pd__details">
            <div className="pd__top-row">
              <span className="pd__category-pill">{product.category}</span>
              {product.reviewCount > 0 && (
                <span style={{ fontSize:13, color:'#f59e0b' }}>★ {Number(product.rating).toFixed(1)} ({product.reviewCount})</span>
              )}
            </div>

            <h1 className="pd__product-name">{product.name}</h1>

            <div className="pd__price-block">
              {selectedWeight
                ? <><span className="pd__price-main">₹{selectedWeight.price}</span><span className="pd__price-per">for {selectedWeight.label}</span></>
                : <><span className="pd__price-main">₹{product.basePrice}</span><span className="pd__price-per">per 100g</span></>
              }
            </div>

            <div className="pd__tags">
              {(product.tags || []).map(tag => <span key={tag} className="tag-badge">{tag}</span>)}
            </div>

            {/* Weight selector */}
            <div className="pd__weight-section">
              <p className="pd__section-label">
                Select Weight
                {!selectedWeight && !isOOS && <span className="pd__required-hint"> — choose to continue</span>}
              </p>
              <div className="pd__weight-grid">
                {(product.weightOptions || []).map(opt => (
                  <button key={opt.label}
                    className={"pd__weight-btn" + (selectedWeight?.label === opt.label ? ' pd__weight-btn--selected' : '')}
                    onClick={() => { setSelectedWeight(opt); setQty(1) }}
                    disabled={isOOS}>
                    <span className="pd__weight-label">{opt.label}</span>
                    <span className="pd__weight-price">₹{opt.price}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Qty */}
            {selectedWeight && !isOOS && (
              <div className="pd__qty-section">
                <p className="pd__section-label">Quantity</p>
                <div className="pd__qty-row">
                  <div className="pd__qty-control">
                    <button className="pd__qty-btn" onClick={() => setQty(q => Math.max(1,q-1))} disabled={qty===1}>−</button>
                    <span className="pd__qty-val">{qty}</span>
                    <button className="pd__qty-btn" onClick={() => setQty(q => q+1)}>+</button>
                  </div>
                  <div className="pd__total-price">Total: <strong>₹{selectedWeight.price * qty}</strong></div>
                </div>
              </div>
            )}

            {/* CTAs */}
            {isOOS
              ? <div className="pd__oos-notice"><span>⚠️</span><span>Currently out of stock.</span></div>
              : <>
                  <div className="pd__action-row">
                    <button className="pd__btn-cart" disabled={!canProceed} onClick={handleAddToCart}>🛒 Add to Cart</button>
                    <button className="pd__btn-buy"  disabled={!canProceed} onClick={handleBuyNow}>⚡ Buy Now</button>
                  </div>
                  {!selectedWeight && <p className="pd__select-hint">☝️ Please select a weight option to continue</p>}
                </>
            }

            {/* Tabs */}
            <div className="pd__tabs">
              <div className="pd__tab-nav">
                {['description','delivery','reviews'].map(tab => (
                  <button key={tab}
                    className={"pd__tab-btn" + (activeTab===tab ? ' pd__tab-btn--active' : '')}
                    onClick={() => setActiveTab(tab)}>
                    {tab.charAt(0).toUpperCase()+tab.slice(1)}
                    {tab==='reviews' && reviews.length > 0 && <span style={{fontSize:11,opacity:.7,marginLeft:4}}>({reviews.length})</span>}
                  </button>
                ))}
              </div>
              <div className="pd__tab-body">
                {activeTab === 'description' && <p className="pd__tab-text">{product.description}</p>}

                {activeTab === 'delivery' && (
                  <div className="pd__delivery-info">
                    {[['🚚','Free delivery on orders above ₹499'],['📦','Ships within 24 hours'],['⏱️','Delivered in 3–7 business days'],['🔄','Easy 7-day returns']].map(([i,t]) => (
                      <div key={t} className="pd__delivery-row"><span>{i}</span><span>{t}</span></div>
                    ))}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="pd__reviews-section">
                    {reviews.length === 0 && <p style={{fontSize:13,color:'var(--gray-400)',marginBottom:14}}>No reviews yet. Be the first!</p>}
                    {reviews.map(r => (
                      <div key={r.id} className="pd__review-card">
                        <div className="pd__review-header">
                          <div className="pd__reviewer-info">
                            <div className="pd__reviewer-avatar">{r.name?.charAt(0)}</div>
                            <div>
                              <div className="pd__reviewer-name">{r.name}</div>
                              <div className="pd__review-date">{new Date(r.date||r.createdAt).toLocaleDateString('en-IN',{month:'short',year:'numeric'})}</div>
                            </div>
                          </div>
                          <div className="pd__review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div>
                        </div>
                        <p className="pd__review-text">{r.comment}</p>
                      </div>
                    ))}

                    {user
                      ? <div className="pd__write-review">
                          <p className="pd__write-review-title">✍️ Write a Review</p>
                          {reviewDone
                            ? <p style={{color:'var(--maroon-700)',fontSize:14,fontWeight:500}}>✓ Thanks for your review!</p>
                            : <>
                                <div className="pd__star-picker">
                                  {[1,2,3,4,5].map(s => (
                                    <button key={s}
                                      className={"pd__star-pick"+((hoverRating||newRating)>=s?' pd__star-pick--selected':'')}
                                      onMouseEnter={() => setHoverRating(s)}
                                      onMouseLeave={() => setHoverRating(0)}
                                      onClick={() => setNewRating(s)}>★</button>
                                  ))}
                                </div>
                                <textarea className="pd__review-textarea" placeholder="Share your experience…" value={reviewText} onChange={e => setReviewText(e.target.value)} />
                                <button className="pd__review-submit" onClick={submitReview} disabled={!newRating||!reviewText.trim()||submitting}>
                                  {submitting ? 'Submitting…' : 'Submit Review'}
                                </button>
                              </>
                          }
                        </div>
                      : <div className="pd__login-to-review">
                          <span>🔒 Login to write a review</span>
                          <button className="pd__login-to-review-btn" onClick={() => { onClose(); navigate('/login') }}>Login</button>
                        </div>
                    }
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}