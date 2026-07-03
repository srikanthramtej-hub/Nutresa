import React from 'react'
import { useNavigate } from 'react-router-dom'
import './ProductCard.css'

const UPLOADS = import.meta.env.VITE_UPLOADS_URL || 'http://localhost:4000'

function ProductCard({ product }) {
  const navigate = useNavigate()
  const stock    = product.stock
  const isOOS    = stock === 0
  const isLow    = stock > 0 && stock <= 50

  function getImageSrc(url) {
    if (!url) return null
    if (url.startsWith('http')) return url
    return `${UPLOADS}${url.startsWith('/') ? '' : '/'}${url}`
  }

  const images = Array.isArray(product.imageUrls) && product.imageUrls.length > 0
    ? product.imageUrls
    : product.imageUrl ? [product.imageUrl] : []

  const imgSrc = images.length > 0 ? getImageSrc(images[0]) : null

  function handleClick() {
    navigate(`/product/${product.id}`)
  }

  return (
    <div
      className={"product-card" + (isOOS ? ' product-card--oos' : '')}
      onClick={handleClick}
    >
      {isOOS && <span className="product-card__badge product-card__badge--oos">Out of Stock</span>}
      {!isOOS && product.isNew && <span className="product-card__badge product-card__badge--new">New</span>}

      <div className="product-card__image-wrap">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={product.name}
            className="product-card__real-img"
            onError={e => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <div className="product-card__no-img" style={{ display: imgSrc ? 'none' : 'flex' }}>
          🌿
        </div>
        {images.length > 1 && (
          <div className="product-card__img-count">{images.length} photos</div>
        )}
      </div>

      <div className="product-card__body">
        <div className="product-card__meta">
          <span className="product-card__category">{product.category}</span>
          {product.reviewCount > 0 && (
            <span className="product-card__rating">
              ★ {Number(product.rating).toFixed(1)} ({product.reviewCount})
            </span>
          )}
        </div>
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__desc">{product.description}</p>
        <div className="product-card__footer">
          <div className="product-card__price">
            <span className="product-card__price-amount">₹{product.basePrice}</span>
            <span className="product-card__price-unit">/100g</span>
          </div>
          {!isOOS && isLow  && <span className="product-card__stock-low">Only {stock} left</span>}
          {!isOOS && !isLow && <span className="product-card__stock-ok">In Stock</span>}
        </div>
      </div>

      <div className="product-card__hover-cta">View Details →</div>
    </div>
  )
}

export default ProductCard