import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { productsAPI } from '../../api'
import Footer from '../../components/Footer/Footer'
import './ProductPage.css'

const UPLOADS = import.meta.env.VITE_UPLOADS_URL || 'http://localhost:4000'

function buildSrc(url) {
  if (!url) return null
  if (url.startsWith('http')) return url
  return `${UPLOADS}${url.startsWith('/') ? '' : '/'}${url}`
}

function getImages(product) {
  if (Array.isArray(product.imageUrls) && product.imageUrls.length > 0) return product.imageUrls
  try {
    const arr = JSON.parse(product.imageUrls || '[]')
    if (arr.length > 0) return arr
  } catch { }
  if (product.imageUrl) return [product.imageUrl]
  return []
}

export default function ProductPage({ onAddToCart }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [selectedWeight, setSelectedWeight] = useState(null)
  const [qty, setQty] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [reviews, setReviews] = useState([])
  const [newRating, setNewRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [reviewDone, setReviewDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    setLoading(true)
    productsAPI.getOne(Number(id))
      .then(res => {
        setProduct(res.data)
        setReviews(res.data.reviews || [])
      })
      .catch(() => navigate('/shop'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="pp__loading">
      <div className="pp__loading-spinner" />
      <p>Loading product…</p>
    </div>
  )

  if (!product) return null

  const images = getImages(product)
  const isOOS = product.stock === 0
  const canAdd = selectedWeight !== null && !isOOS

  function handleAddToCart() {
    if (!canAdd) return
    onAddToCart({ ...product, selectedWeight: selectedWeight.label, price: selectedWeight.price, cartKey: `${product.id}-${selectedWeight.label}` }, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  function handleBuyNow() {
    if (!canAdd) return
    onAddToCart({ ...product, selectedWeight: selectedWeight.label, price: selectedWeight.price, cartKey: `${product.id}-${selectedWeight.label}` }, qty)
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
    } catch { }
    setSubmitting(false)
  }

  return (
    <div className="page-wrapper">
      <div className="pp__container">

        {/* Breadcrumb */}
        <div className="pp__breadcrumb">
          <button onClick={() => navigate('/')}>Home</button>
          <span>›</span>
          <button onClick={() => navigate('/shop')}>Shop</button>
          <span>›</span>
          <span>{product.name}</span>
        </div>

        {/* Main content — 50/50 split */}
        <div className="pp__main">

          {/* ── LEFT 50%: Images ── */}
          <div className="pp__gallery">

            {/* Main image */}
            <div className="pp__main-img-wrap">
              {images.length > 0 ? (
                <img
                  key={activeImg}
                  src={buildSrc(images[activeImg])}
                  alt={product.name}
                  className="pp__main-img"
                />
              ) : (
                <div className="pp__img-fallback">🌿</div>
              )}

              {product.isNew && !isOOS && <span className="pp__badge pp__badge--new">✨ New Arrival</span>}
              {isOOS && <span className="pp__badge pp__badge--oos">Out of Stock</span>}

              {/* Arrows */}
              {images.length > 1 && (
                <>
                  <button className="pp__arrow pp__arrow--left"
                    onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}>‹</button>
                  <button className="pp__arrow pp__arrow--right"
                    onClick={() => setActiveImg(i => (i + 1) % images.length)}>›</button>

                  {/* Dots */}
                  <div className="pp__dots">
                    {images.map((_, i) => (
                      <button key={i}
                        className={"pp__dot" + (i === activeImg ? ' pp__dot--active' : '')}
                        onClick={() => setActiveImg(i)} />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="pp__thumbs">
                {images.map((url, i) => (
                  <button key={i}
                    className={"pp__thumb" + (i === activeImg ? ' pp__thumb--active' : '')}
                    onClick={() => setActiveImg(i)}>
                    <img src={buildSrc(url)} alt={`view ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}

            {/* Info chips */}
            <div className="pp__info-chips">
              {product.origin && <div className="pp__chip"><span>📍</span><span>{product.origin}</span></div>}
              {product.shelfLife && <div className="pp__chip"><span>⏳</span><span>Shelf life: {product.shelfLife}</span></div>}
              <div className="pp__chip"><span>📦</span><span>{product.stock > 0 ? `${product.stock} units in stock` : 'Out of stock'}</span></div>
            </div>
          </div>

          {/* ── RIGHT 50%: Details ── */}
          <div className="pp__details">

            {/* Category + rating */}
            <div className="pp__top-row">
              <span className="pp__category-pill">{product.category}</span>
              {product.reviewCount > 0 && (
                <span className="pp__rating">
                  {'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}
                  <span className="pp__rating-count"> {product.rating?.toFixed(1)} ({product.reviewCount} reviews)</span>
                </span>
              )}
            </div>

            {/* Name */}
            <h1 className="pp__name">{product.name}</h1>

            {/* Price */}
            <div className="pp__price-row">
              {selectedWeight
                ? <><span className="pp__price">₹{selectedWeight.price}</span><span className="pp__price-per">for {selectedWeight.label}</span><span className="pp__price-100">₹{Math.round(selectedWeight.price / selectedWeight.grams * 100)}/100g</span></>
                : <><span className="pp__price">₹{product.basePrice}</span><span className="pp__price-per">per 100g</span></>
              }
            </div>

            {/* Tags */}
            <div className="pp__tags">
              {(product.tags || []).map(t => <span key={t} className="tag-badge">{t}</span>)}
            </div>

            <div className="pp__divider" />

            {/* Weight selector */}
            <div className="pp__section">
              <p className="pp__section-label">
                Select Weight
                {!selectedWeight && !isOOS && <span className="pp__hint"> — choose to continue</span>}
              </p>
              <div className="pp__weight-grid">
                {(product.weightOptions || []).map(opt => (
                  <button key={opt.label}
                    className={"pp__weight-btn" + (selectedWeight?.label === opt.label ? ' pp__weight-btn--active' : '')}
                    onClick={() => { setSelectedWeight(opt); setQty(1) }}
                    disabled={isOOS}>
                    <span className="pp__weight-label">{opt.label}</span>
                    <span className="pp__weight-price">₹{opt.price}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            {selectedWeight && !isOOS && (
              <div className="pp__section">
                <p className="pp__section-label">Quantity</p>
                <div className="pp__qty-row">
                  <div className="pp__qty">
                    <button className="pp__qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty === 1}>−</button>
                    <span className="pp__qty-val">{qty}</span>
                    <button className="pp__qty-btn" onClick={() => { if (qty < 10) { setQty(q => q + 1); } }}> + </button>                  
                  </div>
                  <span className="pp__total">Total: <strong>₹{selectedWeight.price * qty}</strong></span>
                </div>
              </div>
            )}

            {/* CTA buttons */}
            {isOOS ? (
              <div className="pp__oos-msg">⚠️ This product is currently out of stock.</div>
            ) : (
              <div className="pp__cta-row">
                <button className="pp__btn-cart" disabled={!canAdd} onClick={handleAddToCart}>
                  {added ? '✓ Added!' : '🛒 Add to Cart'}
                </button>
                <button className="pp__btn-buy" disabled={!canAdd} onClick={handleBuyNow}>
                  ⚡ Buy Now
                </button>
              </div>
            )}

            {!selectedWeight && !isOOS && (
              <p className="pp__select-hint">☝️ Please select a weight option above to continue</p>
            )}

            <div className="pp__divider" />

            {/* Tabs */}
            <div className="pp__tabs">
              <div className="pp__tab-nav">
                {['description', 'delivery', 'reviews'].map(tab => (
                  <button key={tab}
                    className={"pp__tab-btn" + (activeTab === tab ? ' pp__tab-btn--active' : '')}
                    onClick={() => setActiveTab(tab)}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {tab === 'reviews' && reviews.length > 0 && <span className="pp__tab-count">({reviews.length})</span>}
                  </button>
                ))}
              </div>

              <div className="pp__tab-body">
                {activeTab === 'description' && (
                  <p className="pp__tab-text">{product.description}</p>
                )}

                {activeTab === 'delivery' && (
                  <div className="pp__delivery-list">
                    {[['🚚', 'Free delivery on orders above ₹499'], ['📦', 'Processed & shipped in 1–2 business days'], ['⏱️', 'Delivered in 3–7 business days'], ['🔄', 'Easy 7-day returns on damaged items']].map(([icon, text]) => (
                      <div key={text} className="pp__delivery-row"><span>{icon}</span><span>{text}</span></div>
                    ))}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="pp__reviews">
                    {reviews.length === 0 && (
                      <p className="pp__no-reviews">No reviews yet. Be the first to review this product!</p>
                    )}
                    {reviews.map(r => (
                      <div key={r.id} className="pp__review-card">
                        <div className="pp__review-top">
                          <div className="pp__reviewer">
                            <div className="pp__reviewer-avatar">{r.name?.charAt(0)}</div>
                            <div>
                              <div className="pp__reviewer-name">{r.name}</div>
                              <div className="pp__reviewer-date">{new Date(r.date || r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                            </div>
                          </div>
                          <div className="pp__stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                        </div>
                        <p className="pp__review-text">{r.comment}</p>
                      </div>
                    ))}

                    {user ? (
                      <div className="pp__write-review">
                        <h4 className="pp__write-title">Write a Review</h4>
                        {reviewDone ? (
                          <p className="pp__review-thanks">✓ Thank you for your review!</p>
                        ) : (
                          <>
                            <div className="pp__star-picker">
                              {[1, 2, 3, 4, 5].map(s => (
                                <button key={s}
                                  className={"pp__star" + ((hoverRating || newRating) >= s ? ' pp__star--on' : '')}
                                  onMouseEnter={() => setHoverRating(s)}
                                  onMouseLeave={() => setHoverRating(0)}
                                  onClick={() => setNewRating(s)}>★</button>
                              ))}
                              {newRating > 0 && <span className="pp__star-label">{['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][newRating]}</span>}
                            </div>
                            <textarea className="pp__review-input"
                              placeholder="Share your experience with this product…"
                              value={reviewText} onChange={e => setReviewText(e.target.value)} />
                            <button className="pp__review-submit"
                              onClick={submitReview}
                              disabled={!newRating || !reviewText.trim() || submitting}>
                              {submitting ? 'Submitting…' : 'Submit Review'}
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="pp__login-review">
                        <span>🔒 Login to write a review</span>
                        <button className="pp__login-review-btn" onClick={() => navigate('/login')}>Login / Register</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}