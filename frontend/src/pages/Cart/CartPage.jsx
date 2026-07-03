import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './CartPage.css'

const FREE_SHIP = 499

export default function CartPage({ cart, onUpdateQty, onRemove }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const shipping = subtotal >= FREE_SHIP ? 0 : 49
  const total = subtotal

  if (cart.length === 0) return (
    <div className="page-wrapper">
      <div className="cart__empty-wrap">
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <div className="empty-title">Your cart is empty</div>
          <div className="empty-sub">Add some premium dry fruits to get started</div>
          <button className="btn-primary" style={{ marginTop: 24, padding: '12px 28px' }} onClick={() => navigate('/shop')}>Browse Products →</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="page-wrapper">
      <div className="cart__container">
        <div className="cart__header">
          <h1 className="cart__title">Your Cart <span className="cart__item-count">{cart.length} items</span></h1>
          <button className="cart__continue-btn" onClick={() => navigate('/shop')}>← Continue Shopping</button>
        </div>
        <div className="cart__layout">
          <div className="cart__items">
            {subtotal < FREE_SHIP && (
              <div className="cart__shipping-progress">
                <p className="cart__shipping-msg">Add <strong>₹{FREE_SHIP - subtotal}</strong> more for free shipping 🚚</p>
                <div className="cart__shipping-bar"><div className="cart__shipping-fill" style={{ width: `${(subtotal / FREE_SHIP) * 100}%` }} /></div>
              </div>
            )}
            {subtotal >= FREE_SHIP && <div className="cart__free-shipping-notice">🎉 You've unlocked free shipping!</div>}

            {cart.map((item, index) => (
              <div key={item.cartKey} className="cart-item cart-item--animate" style={{ animationDelay: `${index * 90}ms` }}>
                <div className="cart-item__image">
                  {item.imageUrl
                    ? <img src={`${import.meta.env.VITE_UPLOADS_URL || 'http://localhost:4000'}${item.imageUrl}`} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                    : <span className="cart-item__emoji">🌿</span>
                  }
                </div>
                <div className="cart-item__info">
                  <h3 className="cart-item__name">{item.name}</h3>
                  <div className="cart-item__meta">
                    <span className="cart-item__weight-tag">{item.selectedWeight}</span>
                    <span className="cart-item__unit-price">₹{item.price} per pack</span>
                  </div>
                </div>
                <div className="cart-item__qty-control">
                  <button className="cart-item__qty-btn" onClick={() => item.qty === 1 ? onRemove(item.cartKey) : onUpdateQty(item.cartKey, item.qty - 1)}>−</button>
                  <span className="cart-item__qty-value">{item.qty}</span>
                  <button className="cart-item__qty-btn" onClick={() => { if (item.qty < 10) { onUpdateQty(item.cartKey, item.qty + 1); }}}> +</button>                
                </div>
                <div className="cart-item__total-col">
                  <span className="cart-item__line-total">₹{item.price * item.qty}</span>
                  <button className="cart-item__remove-btn" onClick={() => onRemove(item.cartKey)}>Remove</button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart__summary">
            <h2 className="cart__summary-title">Order Summary</h2>
            <div className="cart__summary-rows">
              {cart.map(i => (
                <div key={i.cartKey} className="cart__summary-row">
                  <span>{i.name} <span className="cart__summary-weight">({i.selectedWeight})</span> ×{i.qty}</span>
                  <span>₹{i.price * i.qty}</span>
                </div>
              ))}
            </div>
            <div className="cart__summary-divider" />
            <div className="cart__summary-row"><span>Subtotal</span><span>₹{subtotal}</span></div>
            {/* <div className="cart__summary-row"><span>Shipping</span><span className={shipping === 0 ? 'cart__free-label' : ''}>{shipping === 0 ? 'FREE' : '₹' + shipping}</span></div> */}
            <div className="cart__summary-total"><span>Total</span><span>₹{total}</span></div>
            <button
              className="cart__checkout-btn btn-primary"
              onClick={() => user ? navigate('/checkout') : navigate('/login')}
            >
              <div className="cart__checkout-content">

                <img
                  src="/assets/truck.png"
                  alt="truck"
                  className="cart__truck"
                />

                <span className="cart__checkout-text">
                  {user
                    ? 'Proceed to Checkout'
                    : 'Login to Checkout'}
                </span>

              </div>
            </button>
            {!user && <p className="cart__login-hint">You need to be logged in to place an order.</p>}
            <div className="cart__trust-badges">
              <span>🔒 Secure</span><span>📦 Easy Returns</span><span>🌿 Fresh</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
