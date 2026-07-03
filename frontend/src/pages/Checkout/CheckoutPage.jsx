import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { ordersAPI } from '../../api'
import { calculateGST, getOffers } from '../../utils/gstUtils'
import './CheckoutPage.css'

const PAYMENT_METHODS = [
  { id: 'upi',  label: 'UPI / PhonePe / GPay', icon: '📱' },
  { id: 'card', label: 'Credit / Debit Card',   icon: '💳' },
  { id: 'net',  label: 'Net Banking',            icon: '🏦' },
  { id: 'cod',  label: 'Cash on Delivery',       icon: '💵' },
]

function getDeliveryCharge(subtotal) {
  if (subtotal >= 999) return 0
  if (subtotal >= 500) return 49
  return 79
}

function applyCoupon(code, subtotal) {
  const offers = getOffers()
  const now    = new Date()

  const offer = offers.find(o => {
    if (!o.isActive)                                   return false
    if (o.code.toUpperCase() !== code.toUpperCase())   return false
    if (new Date(o.startDate) > now)                   return false
    if (new Date(o.endDate)   < now)                   return false
    return true
  })

  if (!offer) return { valid: false, message: 'Invalid or expired coupon code' }

  if (offer.minOrder && subtotal < Number(offer.minOrder)) {
    return { valid: false, message: `Minimum order of ₹${offer.minOrder} required for this coupon` }
  }

  let discount = 0
  let label    = ''

  if (offer.type === 'percentage') {
    discount = Math.round(subtotal * Number(offer.value) / 100)
    label    = `${offer.value}% off applied`
  } else if (offer.type === 'flat') {
    discount = Math.min(Number(offer.value), subtotal)
    label    = `₹${offer.value} off applied`
  } else if (offer.type === 'freeship') {
    discount = 0
    label    = 'Free shipping applied'
  } else if (offer.type === 'bogo') {
    discount = 0
    label    = 'Buy 1 Get 1 applied'
  }

  return {
    valid:        true,
    discount,
    label,
    type:         offer.type,
    freeShipping: offer.type === 'freeship',
    title:        offer.title,
  }
}

// NOTE: itemsSnapshot is the saved copy taken BEFORE cart got cleared
function downloadOrderPDF(order, address, itemsSnapshot, total, shipping, gstAmount, gstRate, discount, couponCode) {
  const itemsHTML = itemsSnapshot.map(i =>
    `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f0e6d3">${i.name} (${i.selectedWeight})</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0e6d3;text-align:center">${i.qty}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0e6d3;text-align:right">&#8377;${i.price * i.qty}</td>
    </tr>`
  ).join('')

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Order ${order.id}</title>
  <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:sans-serif;background:#fff;color:#2c1f1f;padding:40px}
  .hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:16px;border-bottom:2px solid #7F2020}
  .brand{font-size:24px;font-weight:700;color:#7F2020}.brand-tag{font-size:10px;color:#b08a55;letter-spacing:2px;text-transform:uppercase;margin-top:2px}
  .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:22px}
  .info-box{background:#faf7f7;border-radius:8px;padding:13px 15px}
  .info-label{font-size:10px;color:#9c8080;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px}
  .info-value{font-size:13px;color:#2c1f1f;line-height:1.6}
  table{width:100%;border-collapse:collapse}thead th{background:#7F2020;color:white;padding:9px 12px;font-size:11px;text-align:left}
  .totals{margin-top:14px;display:flex;flex-direction:column;align-items:flex-end;gap:5px}
  .t-row{display:flex;gap:48px;font-size:12px;color:#5c4040}
  .t-row span:last-child{min-width:72px;text-align:right}
  .t-grand{display:flex;gap:48px;font-size:16px;font-weight:700;color:#7F2020;border-top:2px solid #7F2020;padding-top:8px;margin-top:5px}
  .t-grand span:last-child{min-width:72px;text-align:right}
  .footer{margin-top:28px;text-align:center;font-size:11px;color:#9c8080;padding-top:14px;border-top:1px solid #f0e6d3}
  .footer strong{color:#7F2020}@media print{body{padding:20px}}</style></head><body>
  <div class="hdr">
    <div><div class="brand">Nutresa</div><div class="brand-tag">Pure Nutrition, Daily Power</div></div>
    <div style="text-align:right"><strong style="font-size:15px;color:#4a1212">${order.id}</strong>
    <div style="font-size:12px;color:#9c8080;margin-top:2px">Order Confirmation</div>
    <span style="display:inline-block;padding:3px 12px;background:#F3E4C9;color:#7F2020;border-radius:20px;font-size:11px;font-weight:600;margin-top:5px">✓ Order Placed</span></div>
  </div>
  <div class="info-grid">
    <div class="info-box"><div class="info-label">Customer</div><div class="info-value"><strong>${address.name}</strong><br/>${order.user?.email||''}<br/>${address.phone}</div></div>
    <div class="info-box"><div class="info-label">Delivery Address</div><div class="info-value">${address.line1}<br/>${address.city}, ${address.state}<br/>PIN: ${address.pin}</div></div>
  </div>
  <table><thead><tr><th>Product</th><th style="text-align:center">Qty</th><th style="text-align:right">Amount</th></tr></thead>
  <tbody>${itemsHTML}</tbody></table>
  <div class="totals">
    <div class="t-row"><span>Subtotal</span><span>&#8377;${itemsSnapshot.reduce((s,i)=>s+i.price*i.qty,0)}</span></div>
    <div class="t-row"><span>Delivery</span><span>${shipping===0?'FREE':'&#8377;'+shipping}</span></div>
    ${discount > 0 ? `<div class="t-row" style="color:#7F2020"><span>Coupon (${couponCode})</span><span>-&#8377;${discount}</span></div>` : ''}
    ${gstAmount > 0 ? `<div class="t-row" style="color:#7F2020"><span>GST (${gstRate}%)</span><span>&#8377;${gstAmount}</span></div>` : ''}
    <div class="t-grand"><span>Total Paid</span><span>&#8377;${total}</span></div>
  </div>
  <div class="footer">Thank you for shopping with <strong>Nutresa</strong> | info@nutresa.in | Vijayawada, AP</div>
  <script>window.onload=function(){window.print()}</script></body></html>`

  const win = window.open('', '_blank')
  win.document.write(html)
  win.document.close()
}

export default function CheckoutPage({ cart, onOrderPlaced, showToast }) {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [address, setAddress] = useState({
    name: user?.name || '', phone: '',
    line1: '', city: '', state: 'Andhra Pradesh', pin: '',
  })
  const [payment,       setPayment]       = useState('upi')
  const [placing,       setPlacing]       = useState(false)
  const [placed,        setPlaced]        = useState(false)
  const [orderId,       setOrderId]       = useState('')
  const [orderResult,   setOrderResult]   = useState(null)
  const [formTouched,   setFormTouched]   = useState(false)
  const [couponInput,   setCouponInput]   = useState('')
  const [couponResult,  setCouponResult]  = useState(null)
  const [couponError,   setCouponError]   = useState('')
  const [couponApplied, setCouponApplied] = useState(false)

  // ★ FIX: snapshot of cart + totals taken at the moment of placing the order.
  // The `cart` prop gets cleared by onOrderPlaced() right after placing,
  // so the PDF button must use this saved copy, not the live `cart` prop.
  const [orderSnapshot, setOrderSnapshot] = useState(null)

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const discount = couponResult?.valid ? (couponResult.discount || 0) : 0
  const baseShip = getDeliveryCharge(subtotal)
  const shipping = couponResult?.freeShipping ? 0 : baseShip
  const { gstAmount, gstRate, gstEnabled } = calculateGST(subtotal - discount)
  const total    = subtotal - discount + shipping + gstAmount

  // ── Back / unload guard ──
  useEffect(() => {
    if (placed) return

    const onBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)

    window.history.pushState({ checkoutGuard: true }, '', window.location.href)

    const onPop = () => {
      const confirmed = window.confirm(
        '⚠️ Are you sure you want to go back?\n\nYour checkout details will be lost.'
      )
      if (confirmed) {
        window.removeEventListener('popstate', onPop)
        window.history.go(-1)
      } else {
        window.history.pushState({ checkoutGuard: true }, '', window.location.href)
      }
    }
    window.addEventListener('popstate', onPop)

    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      window.removeEventListener('popstate', onPop)
    }
  }, [placed])

  function change(field, val) {
    setFormTouched(true)
    setAddress(p => ({ ...p, [field]: val }))
  }

  function handleGoBack() {
    const confirmed = window.confirm(
      '⚠️ Are you sure you want to go back?\n\nYour checkout details will be lost.'
    )
    if (confirmed) navigate('/cart')
  }

  function handleApplyCoupon() {
    if (!couponInput.trim()) { setCouponError('Enter a coupon code'); return }
    const result = applyCoupon(couponInput.trim(), subtotal)
    if (result.valid) {
      setCouponResult(result)
      setCouponApplied(true)
      setCouponError('')
      showToast(`✓ ${result.label}!`)
    } else {
      setCouponError(result.message)
      setCouponResult(null)
      setCouponApplied(false)
    }
  }

  function handleRemoveCoupon() {
    setCouponResult(null)
    setCouponInput('')
    setCouponApplied(false)
    setCouponError('')
  }

  async function handlePlace() {
    const required = ['name', 'phone', 'line1', 'city', 'state', 'pin']
    if (required.some(f => !address[f].trim())) {
      showToast('Please fill all address fields')
      return
    }
    setPlacing(true)
    try {
      const items = cart.map(i => ({
        productId: i.productId, weightLabel: i.selectedWeight, price: i.price, qty: i.qty,
      }))
      const res = await ordersAPI.create(items, address, total)

      // ★ FIX: save a snapshot of everything needed for the PDF
      // BEFORE calling onOrderPlaced() (which clears the live cart).
      setOrderSnapshot({
        items:    cart.map(i => ({ ...i })),   // deep-ish copy of cart items
        address:  { ...address },
        total,
        shipping,
        gstAmount,
        gstRate,
        discount,
        couponCode: couponInput,
      })

      setOrderId(res.data.id)
      setOrderResult(res.data)
      setPlaced(true)
      onOrderPlaced()   // this clears the cart — happens AFTER snapshot is saved
    } catch {
      showToast('Failed to place order. Please try again.')
    }
    setPlacing(false)
  }

  function handleDownloadPDF() {
    if (!orderSnapshot) return
    downloadOrderPDF(
      orderResult || { id: orderId, user: { email: user.email } },
      orderSnapshot.address,
      orderSnapshot.items,
      orderSnapshot.total,
      orderSnapshot.shipping,
      orderSnapshot.gstAmount,
      orderSnapshot.gstRate,
      orderSnapshot.discount,
      orderSnapshot.couponCode
    )
  }

  // ── Success screen ──
  if (placed) {
    return (
      <div className="page-wrapper">
        <div className="checkout__success">
          <div className="checkout__success-icon">🎉</div>
          <h1 className="checkout__success-title">Order Placed!</h1>
          <p className="checkout__success-sub">
            Thank you, <strong>{user.name}</strong>!<br />
            Order <strong>{orderId}</strong> confirmed.
          </p>
          <div className="checkout__success-info">
            <p>📧 Confirmation sent to <strong>{user.email}</strong></p>
            <p>📦 Expected delivery: 3–7 business days</p>
            {discount > 0 && <p>🎁 Saved ₹{discount} with coupon <strong>{couponInput.toUpperCase()}</strong></p>}
            {gstEnabled && gstAmount > 0 && <p>🧾 GST ({gstRate}%): ₹{gstAmount} included</p>}
          </div>
          <div className="checkout__success-actions">
            <button
              className="btn-primary"
              style={{ padding: '12px 28px', fontSize: '15px' }}
              onClick={handleDownloadPDF}
            >
              📄 Download Order PDF
            </button>
            <button className="btn-outline" style={{ padding: '12px 24px' }} onClick={() => navigate('/profile')}>
              Track My Order →
            </button>
            <button className="btn-outline" style={{ padding: '12px 24px' }} onClick={() => navigate('/shop')}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Checkout form ──
  return (
    <div className="page-wrapper">
      <div className="checkout__container">
        <button className="checkout__back-btn" onClick={handleGoBack}>← Back to Cart</button>
        <h1 className="checkout__page-title">Checkout</h1>

        <div className="checkout__layout">
          <div>

            {/* 1. Address */}
            <div className="checkout__section">
              <h2 className="checkout__section-title">
                <span className="checkout__section-num">1</span>Delivery Address
              </h2>
              <div className="checkout__form-2">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" value={address.name} onChange={e => change('name', e.target.value)} placeholder="As on ID" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input className="form-input" value={address.phone} onChange={e => change('phone', e.target.value)} placeholder="+91 98765 43210" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Address *</label>
                <input className="form-input" value={address.line1} onChange={e => change('line1', e.target.value)} placeholder="House no., Street, Area, Landmark" />
              </div>
              <div className="checkout__form-3">
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input className="form-input" value={address.city} onChange={e => change('city', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input className="form-input" value={address.state} onChange={e => change('state', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">PIN Code *</label>
                  <input className="form-input" value={address.pin} onChange={e => change('pin', e.target.value)} placeholder="500001" maxLength={6} />
                </div>
              </div>
            </div>

            {/* 2. Coupon */}
            <div className="checkout__section">
              <h2 className="checkout__section-title">
                <span className="checkout__section-num">2</span>Promo / Coupon Code
              </h2>
              {!couponApplied ? (
                <div>
                  <div className="checkout__coupon-row">
                    <input
                      className="form-input checkout__coupon-input"
                      value={couponInput}
                      onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError('') }}
                      placeholder="Enter coupon code e.g. SAVE20"
                      onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                    />
                    <button className="checkout__coupon-btn btn-outline" onClick={handleApplyCoupon}>
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="checkout__coupon-error">❌ {couponError}</p>}
                </div>
              ) : (
                <div className="checkout__coupon-applied">
                  <div className="checkout__coupon-applied-left">
                    <span className="checkout__coupon-tick">✓</span>
                    <div>
                      <div className="checkout__coupon-code-label">{couponInput.toUpperCase()}</div>
                      <div className="checkout__coupon-savings">{couponResult.label}</div>
                    </div>
                  </div>
                  <button className="checkout__coupon-remove" onClick={handleRemoveCoupon}>Remove</button>
                </div>
              )}
            </div>

            {/* 3. Payment */}
            <div className="checkout__section">
              <h2 className="checkout__section-title">
                <span className="checkout__section-num">3</span>Payment Method
              </h2>
              <div className="checkout__payment-list">
                {PAYMENT_METHODS.map(m => (
                  <label key={m.id} className="checkout__payment-option">
                    <input
                      type="radio" name="payment" value={m.id}
                      checked={payment === m.id}
                      onChange={() => { setPayment(m.id); setFormTouched(true) }}
                    />
                    <span className="checkout__payment-icon">{m.icon}</span>
                    <span className="checkout__payment-label">{m.label}</span>
                    {m.id === 'upi' && <span className="checkout__payment-tag">Recommended</span>}
                  </label>
                ))}
              </div>
            </div>

          </div>

          {/* Summary */}
          <div className="checkout__summary">
            <h2 className="checkout__summary-title">Order Summary</h2>
            <div className="checkout__summary-items">
              {cart.map(i => (
                <div key={i.cartKey} className="checkout__summary-item">
                  <span className="checkout__item-emoji">🌿</span>
                  <div className="checkout__item-details">
                    <span className="checkout__item-name">{i.name}</span>
                    <span className="checkout__item-qty">{i.selectedWeight} × {i.qty}</span>
                  </div>
                  <span className="checkout__item-price">₹{i.price * i.qty}</span>
                </div>
              ))}
            </div>

            <div className="checkout__sum-row"><span>Subtotal</span><span>₹{subtotal}</span></div>
            <div className="checkout__sum-row">
              <span>Delivery</span>
              <span className={shipping === 0 ? 'checkout__free-label' : ''}>
                {shipping === 0 ? 'FREE' : `₹${shipping}`}
              </span>
            </div>

            {shipping > 0 && (
              <div className="checkout__delivery-info">
                {subtotal < 500
                  ? `Add ₹${500 - subtotal} more to save ₹30 on delivery`
                  : `Add ₹${999 - subtotal} more for FREE delivery`}
              </div>
            )}

            {couponApplied && discount > 0 && (
              <div className="checkout__sum-row checkout__discount-row">
                <span>🎁 Coupon ({couponInput})</span>
                <span className="checkout__discount-amount">−₹{discount}</span>
              </div>
            )}

            {gstEnabled && (
              <div className="checkout__sum-row checkout__gst-row">
                <span>🧾 GST ({gstRate}%)</span>
                <span className="checkout__gst-amount">₹{gstAmount}</span>
              </div>
            )}

            <div className="checkout__sum-total"><span>Total</span><span>₹{total}</span></div>

            {discount > 0 && (
              <div className="checkout__savings-banner">
                🎉 You're saving ₹{discount} on this order!
              </div>
            )}

            <button className="checkout__place-btn btn-primary" onClick={handlePlace} disabled={placing}>
              {placing ? '⏳ Placing Order…' : `🎉 Place Order — ₹${total}`}
            </button>
            <p className="checkout__terms">Confirmation will be sent to <strong>{user?.email}</strong></p>
          </div>

        </div>
      </div>
    </div>
  )
}