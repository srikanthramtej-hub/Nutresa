import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { ordersAPI, usersAPI } from '../../api'
import './ProfilePage.css'
import { getOrderTotals } from '../../utils/orderUtils.js'

const ORDER_STEPS = ['Order Placed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered']
const STATUS_STEP = { PLACED: 0, PROCESSING: 1, PACKED: 2, SHIPPED: 3, OUT_FOR_DELIVERY: 4, DELIVERED: 5 }

// ── PDF download — reads saved values from order object ──
function downloadOrderPDF(order) {
  const address = typeof order.address === 'string' ? JSON.parse(order.address) : (order.address || {})

  
  const itemsSubtotal = (order.items || []).reduce((s, i) => s + i.price * i.qty, 0)
  const shipping = order.deliveryCharge ?? 0
  const gstEnabled = order.gstEnabled ?? false
  const gstRate = order.gstRate ?? 0
  const gstAmount = order.gstAmount ?? 0
  const total = itemsSubtotal + shipping + gstAmount

  const itemsHTML = (order.items || []).map(i =>
    `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f0e6d3">${i.product?.name || i.name} (${i.weightLabel})</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0e6d3;text-align:center">${i.qty}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0e6d3;text-align:right">₹${(i.price * i.qty).toFixed(2)}</td>
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
    <div style="font-size:12px;color:#9c8080;margin-top:2px">${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
    <span style="display:inline-block;padding:3px 12px;background:#F3E4C9;color:#7F2020;border-radius:20px;font-size:11px;font-weight:600;margin-top:5px">${order.status?.replace(/_/g, ' ')}</span></div>
  </div>
  <div class="info-grid">
    <div class="info-box"><div class="info-label">Customer</div><div class="info-value"><strong>${order.user?.name || address.name || ''}</strong><br/>${order.user?.email || ''}</div></div>
    <div class="info-box"><div class="info-label">Delivery Address</div><div class="info-value">${address.line1 || ''}<br/>${address.city || ''}, ${address.state || ''}<br/>PIN: ${address.pin || ''}</div></div>
  </div>
  <table><thead><tr><th>Product</th><th style="text-align:center">Qty</th><th style="text-align:right">Amount</th></tr></thead>
  <tbody>${itemsHTML}</tbody></table>
  <div class="totals">
    <div class="t-row"><span>Subtotal</span><span>₹${itemsSubtotal.toFixed(2)}</span></div>
    <div class="t-row"><span>Delivery</span><span>${shipping === 0 ? 'FREE' : '₹' + shipping.toFixed(2)}</span></div>
    ${gstEnabled && gstAmount > 0 ? `<div class="t-row" style="color:#7F2020"><span>GST (${gstRate}%)</span><span>₹${gstAmount.toFixed(2)}</span></div>` : ''}
    <div class="t-grand"><span>Total Paid</span><span>₹${total.toFixed(2)}</span></div>
  </div>
  <div class="footer">Thank you for shopping with <strong>Nutresa</strong> | info@nutresa.in | Vijayawada, AP</div>
  <script>window.onload=function(){window.print()}</script></body></html>`

  const win = window.open('', '_blank')
  win.document.write(html); win.document.close()
}

// ── Track Order ──
function TrackOrder() {
  const [trackId, setTrackId] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleTrack(e) {
    e.preventDefault()
    if (!trackId.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token')
      const res = await fetch(`/api/orders/track/${trackId.trim()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) setError('Order not found. Please check your Order ID.')
      else setResult(await res.json())
    } catch { setError('Something went wrong. Please try again.') }
    setLoading(false)
  }

  const step = result ? (STATUS_STEP[result.status] ?? 0) : 0

  const { subtotal: itemsSubtotal, shipping, gstEnabled, gstRate, gstAmount, total } = getOrderTotals(order)

  return (
    <div className="profile__track-section">
      <h2 className="profile__section-heading">Track Your Order</h2>
      <p className="profile__track-sub">Enter your Order ID to check the current status</p>
      <form className="profile__track-form" onSubmit={handleTrack}>
        <input className="form-input profile__track-input" value={trackId}
          onChange={e => { setTrackId(e.target.value); setError(''); setResult(null) }}
          placeholder="Enter Order ID" />
        <button type="submit" className="btn-primary profile__track-btn" disabled={loading}>
          {loading ? '⏳' : '🔍 Track'}
        </button>
      </form>
      {error && <div className="profile__track-error">❌ {error}</div>}
      {result && (
        <div className="profile__track-result">
          <div className="profile__track-result-header">
            <div>
              <div className="profile__order-card-id">{result.id}</div>
              <div className="profile__order-card-date">Placed on {new Date(result.createdAt).toLocaleDateString()}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className={"status-badge status-" + result.status.toLowerCase()}>{result.status.replace(/_/g, ' ')}</span>
              <button className="btn-outline" style={{ fontSize: 12, padding: '5px 12px' }} onClick={() => downloadOrderPDF(result)}>📄 PDF</button>
            </div>
          </div>
          <div className="order-progress" style={{ marginTop: 16 }}>
            {ORDER_STEPS.map((s, i) => (
              <div key={s} className="order-progress__step">
                {i > 0 && <div className={"order-progress__conn" + (i <= step ? ' order-progress__conn--done' : '')} />}
                <div className={"order-progress__circle" + (i < step ? ' order-progress__circle--done' : i === step ? ' order-progress__circle--active' : '')}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={"order-progress__label" + (i <= step ? ' order-progress__label--done' : '')}>{s}</span>
              </div>
            ))}
          </div>
          <div className="profile__track-items">
            {(result.items || []).map(i => (
              <div key={i.id} className="profile__order-item">
                <div className="profile__order-item-info">
                  <span className="profile__order-item-name">{i.product?.name}</span>
                  <span className="profile__order-item-qty">{i.weightLabel} × {i.qty}</span>
                </div>
                <span className="profile__order-item-price">₹{(i.price * i.qty).toFixed(2)}</span>
              </div>
            ))}
            <div className="profile__price-breakdown">
              <div className="profile__breakdown-row"><span>Subtotal</span><span>₹{itemsSubtotal.toFixed(2)}</span></div>
              <div className="profile__breakdown-row">
                <span>Delivery Charges</span>
                <span className={shipping === 0 ? 'profile__free-label' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
              </div>
              {gstEnabled && gstAmount > 0 && (
                <div className="profile__breakdown-row profile__gst-row">
                  <span>GST ({gstRate}%)</span><span>₹{gstAmount.toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className="profile__order-total-row"><span>Total Paid</span><span>₹{total.toFixed(2)}</span></div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Order Detail ──
function OrderDetail({ order, onBack }) {
  const step = STATUS_STEP[order.status] ?? 0
  const address = typeof order.address === 'string' ? JSON.parse(order.address) : (order.address || {})

  const { subtotal: itemsSubtotal, shipping, gstEnabled, gstRate, gstAmount, total } = getOrderTotals(order)

  return (
    <div className="profile__order-detail">
      <button className="profile__back-btn" onClick={onBack}>← Back to Orders</button>
      <div className="profile__order-header">
        <div>
          <h2 className="profile__order-id">{order.id}</h2>
          <p className="profile__order-date">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className={"status-badge status-" + order.status.toLowerCase()} style={{ fontSize: 13, padding: '7px 16px' }}>
            {order.status.replace(/_/g, ' ')}
          </span>
          <button className="btn-primary" style={{ fontSize: 13, padding: '8px 18px' }} onClick={() => downloadOrderPDF(order)}>
            📄 Download PDF
          </button>
        </div>
      </div>

      <div className="profile__detail-card">
        <h3 className="profile__detail-card-title">📍 Order Progress</h3>
        <div className="order-progress">
          {ORDER_STEPS.map((s, i) => (
            <div key={s} className="order-progress__step">
              {i > 0 && <div className={"order-progress__conn" + (i <= step ? ' order-progress__conn--done' : '')} />}
              <div className={"order-progress__circle" + (i < step ? ' order-progress__circle--done' : i === step ? ' order-progress__circle--active' : '')}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={"order-progress__label" + (i <= step ? ' order-progress__label--done' : '')}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="profile__detail-card">
        <h3 className="profile__detail-card-title">🛍 Items</h3>
        {order.items?.map(i => (
          <div key={i.id} className="profile__order-item">
            <div className="profile__order-item-info">
              <span className="profile__order-item-name">{i.product?.name}</span>
              <span className="profile__order-item-qty">{i.weightLabel} × {i.qty}</span>
            </div>
            <span className="profile__order-item-price">₹{(i.price * i.qty).toFixed(2)}</span>
          </div>
        ))}
        <div className="profile__price-breakdown">
          <div className="profile__breakdown-row"><span>Subtotal</span><span>₹{itemsSubtotal.toFixed(2)}</span></div>
          <div className="profile__breakdown-row">
            <span>Delivery Charges</span>
            <span className={shipping === 0 ? 'profile__free-label' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
          </div>
          {gstEnabled && gstAmount > 0 && (
            <div className="profile__breakdown-row profile__gst-row">
              <span>GST ({gstRate}%)</span><span>₹{gstAmount.toFixed(2)}</span>
            </div>
          )}
        </div>
        <div className="profile__order-total-row"><span>Total Paid</span><span>₹{total.toFixed(2)}</span></div>
      </div>

      {address && (
        <div className="profile__detail-card">
          <h3 className="profile__detail-card-title">📦 Delivery To</h3>
          <p className="profile__address-text">
            {address.name} — {address.phone}<br />
            {address.line1}<br />
            {address.city}, {address.state} — {address.pin}
          </p>
        </div>
      )}
    </div>
  )
}

// ── Main ProfilePage ──
export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [tab, setTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [selected, setSelected] = useState(null)
  const [profile, setProfile] = useState({ name: user?.name || '', phone: '' })
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => {
    ordersAPI.getMy()
      .then(res => setOrders(res.data))
      .catch(() => { })
      .finally(() => setLoadingOrders(false))
    usersAPI.getMe()
      .then(res => setProfile({ name: res.data.name, phone: res.data.phone || '' }))
      .catch(() => { })
  }, [])

  async function saveProfile() {
    try { await usersAPI.updateMe(profile); alert('Profile saved!') }
    catch { alert('Failed to save') }
  }

  if (selected) return (
    <div className="page-wrapper">
      <div className="profile__container">
        <OrderDetail order={selected} onBack={() => setSelected(null)} />
      </div>
    </div>
  )

  return (
    <div className="page-wrapper">
      <div className="profile__container">
        <div className="profile__hero">
          <div className="profile__avatar">{user?.name?.slice(0, 2).toUpperCase()}</div>
          <div className="profile__hero-info">
            <h1 className="profile__hero-name">{user?.name}</h1>
            <p className="profile__hero-email">{user?.email}</p>
          </div>
          <button className="profile__signout-btn" onClick={() => { logout(); navigate('/') }}>Sign Out</button>
        </div>

        <div className="profile__tabs">
          {[['orders', '📦 Orders'], ['track', '🔍 Track Order'], ['settings', '⚙️ Settings']].map(([k, l]) => (
            <button key={k} className={"profile__tab" + (tab === k ? ' profile__tab--active' : '')} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        {tab === 'orders' && (
          <div>
            <h2 className="profile__section-heading">Your Orders</h2>
            {loadingOrders ? (
              <p style={{ color: 'var(--gray-400)' }}>Loading…</p>
            ) : orders.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <div className="empty-title">No orders yet</div>
                <div className="empty-sub">Your placed orders will appear here</div>
              </div>
            ) : (
              orders.map(o => (
                <div key={o.id} className="profile__order-card" onClick={() => setSelected(o)}>
                  <div className="profile__order-card-top">
                    <div>
                      <div className="profile__order-card-id">{o.id}</div>
                      <div className="profile__order-card-date">{new Date(o.createdAt).toLocaleDateString()}</div>
                    </div>
                    <span className={"status-badge status-" + o.status.toLowerCase()}>{o.status.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="profile__order-card-items">
                    {o.items?.map(i => (
                      <span key={i.id} className="profile__order-card-item">{i.product?.name} ×{i.qty}</span>
                    ))}
                  </div>
                  <div className="profile__order-card-footer">
                    <span className="profile__order-card-total">₹{o.total?.toFixed(2)}</span>
                    <span className="profile__order-card-link">View Details →</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'track' && <TrackOrder />}

        {tab === 'settings' && (
          <div>
            <h2 className="profile__section-heading">Account Settings</h2>
            <div className="profile__settings-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" value={user?.email} disabled />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+91 XXXXX XXXXX" />
              </div>
              <button className="btn-primary" style={{ padding: '11px 28px' }} onClick={saveProfile}>Save Changes</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}