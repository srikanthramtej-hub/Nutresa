import React, { useState, useEffect } from 'react'
import './AdminSettings.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

function getToken() {
  return localStorage.getItem('token') ||
    localStorage.getItem('access_token') ||
    localStorage.getItem('nutresa_token') || ''
}

async function apiGet(path) {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  })
  return res.json()
}

async function apiPatch(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(body),
  })
  return res.json()
}

const OFFER_TYPES = [
  { value: 'percentage', label: '% Percentage Off' },
  { value: 'flat', label: '₹ Flat Amount Off' },
  { value: 'bogo', label: 'Buy 1 Get 1 Free' },
  { value: 'freeship', label: 'Free Shipping' },
]

const DEFAULT_STORE_ADDRESS = {
  name: 'Nutresa Foods Pvt. Ltd.', line1: 'Vijayawada',
  state: 'Andhra Pradesh', pin: '520001', email: 'info@nutresa.in', phone: '',
}

function loadLocalSettings() {
  try {
    const s = localStorage.getItem('nutresa_settings')
    return s ? JSON.parse(s) : { offers: [], storeAddress: DEFAULT_STORE_ADDRESS }
  } catch { return { offers: [], storeAddress: DEFAULT_STORE_ADDRESS } }
}

function saveLocalSettings(data) {
  localStorage.setItem('nutresa_settings', JSON.stringify(data))
  window.dispatchEvent(new Event('nutresa_settings_changed'))
}

export default function AdminSettings({ showToast }) {
  // GST — from DB
  const [gstEnabled, setGstEnabled] = useState(false)
  const [gstRate, setGstRate] = useState(5)
  const [gstLoading, setGstLoading] = useState(true)

  // Delivery — from DB
  const [lowDeliveryCharge, setLowDeliveryCharge] = useState(79)
  const [deliveryCharge, setDeliveryCharge] = useState(49)
  const [freeDeliveryAbove, setFreeDeliveryAbove] = useState(999)
  const [deliveryLoading, setDeliveryLoading] = useState(true)

  // Store address — from localStorage
  const [storeAddr, setStoreAddr] = useState(() => loadLocalSettings().storeAddress || DEFAULT_STORE_ADDRESS)

  // Offers — from localStorage
  const [offers, setOffers] = useState(() => loadLocalSettings().offers || [])
  const [offerForm, setOfferForm] = useState({
    title: '', code: '', type: 'percentage', value: '',
    minOrder: '', startDate: '', endDate: '', description: '', isActive: true,
  })
  const [formError, setFormError] = useState('')
  const [editingId, setEditingId] = useState(null)

  // ── Load GST + Delivery from DB on mount ──
  useEffect(() => {
    apiGet('/admin/gst-settings')
      .then(data => { setGstEnabled(data.enabled || false); setGstRate(data.rate || 5) })
      .catch(() => { })
      .finally(() => setGstLoading(false))

    apiGet('/admin/delivery-settings')
      .then(data => {
        setLowDeliveryCharge(data.lowDeliveryCharge ?? 79)
        setDeliveryCharge(data.deliveryCharge ?? 49)
        setFreeDeliveryAbove(data.freeDeliveryAbove ?? 999)
      })
      .catch(() => { })
      .finally(() => setDeliveryLoading(false))
      .catch(() => { })
      .finally(() => setDeliveryLoading(false))
  }, [])

  // ── Sync GST to localStorage so frontend reads it ──
  useEffect(() => {
    const s = loadLocalSettings()
    saveLocalSettings({ ...s, gstEnabled, gstRate })
  }, [gstEnabled, gstRate])

  // ── GST ──
  async function handleGSTToggle() {
    const newEnabled = !gstEnabled
    setGstEnabled(newEnabled)
    try {
      await apiPatch('/admin/gst-settings', { enabled: newEnabled, rate: gstRate })
      showToast(newEnabled ? `GST ON — ${gstRate}% applied` : 'GST turned OFF')
    } catch { showToast('Failed to save GST settings') }
  }

  async function handleGSTRate(rate) {
    setGstRate(rate)
    try {
      await apiPatch('/admin/gst-settings', { enabled: gstEnabled, rate })
      showToast(`GST rate set to ${rate}%`)
    } catch { showToast('Failed to save GST rate') }
  }

  // ── Delivery ──
  async function saveDeliverySettings() {
    try {
      await apiPatch('/admin/delivery-settings', {
        lowDeliveryCharge,
        deliveryCharge,
        freeDeliveryAbove,
      })

      showToast('Delivery settings saved!')
    } catch {
      showToast('Failed to save delivery settings')
    }
  }

  // ── Store address ──
  function changeAddr(field, val) { setStoreAddr(p => ({ ...p, [field]: val })) }
  function saveStoreAddress() {
    const s = loadLocalSettings()
    saveLocalSettings({ ...s, storeAddress: storeAddr })
    showToast('Store address saved!')
  }

  // ── Offers ──
  function saveOffers(newOffers) {
    setOffers(newOffers)
    const s = loadLocalSettings()
    saveLocalSettings({ ...s, offers: newOffers })
  }

  function changeOffer(field, val) { setOfferForm(p => ({ ...p, [field]: val })); setFormError('') }

  function generateCode() {
    const base = offerForm.title ? offerForm.title.toUpperCase().replace(/\s+/g, '').slice(0, 6) : 'SAVE'
    setOfferForm(p => ({ ...p, code: base + Math.floor(Math.random() * 100) }))
  }

  function validateOffer() {
    if (!offerForm.title.trim()) return 'Offer title is required'
    if (!offerForm.code.trim()) return 'Coupon code is required'
    if (!offerForm.startDate) return 'Start date is required'
    if (!offerForm.endDate) return 'End date is required'
    if (offerForm.startDate > offerForm.endDate) return 'End date must be after start date'
    if (['percentage', 'flat'].includes(offerForm.type) && !offerForm.value) return 'Discount value is required'
    if (offerForm.type === 'percentage' && Number(offerForm.value) > 100) return 'Percentage cannot exceed 100%'
    return null
  }

  function handleAddOffer(e) {
    e.preventDefault()
    const err = validateOffer()
    if (err) { setFormError(err); return }
    let newOffers
    if (editingId !== null) {
      newOffers = offers.map(o => o.id === editingId ? { ...offerForm, id: editingId } : o)
      showToast('Offer updated!')
      setEditingId(null)
    } else {
      newOffers = [...offers, { ...offerForm, id: Date.now() }]
      showToast('Offer added!')
    }
    saveOffers(newOffers)
    setOfferForm({ title: '', code: '', type: 'percentage', value: '', minOrder: '', startDate: '', endDate: '', description: '', isActive: true })
    setFormError('')
  }

  function editOffer(offer) { setOfferForm({ ...offer }); setEditingId(offer.id); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  function deleteOffer(id) { if (!window.confirm('Delete this offer?')) return; saveOffers(offers.filter(o => o.id !== id)); showToast('Offer deleted.') }
  function toggleOfferActive(id) { saveOffers(offers.map(o => o.id === id ? { ...o, isActive: !o.isActive } : o)) }
  function cancelEdit() { setEditingId(null); setOfferForm({ title: '', code: '', type: 'percentage', value: '', minOrder: '', startDate: '', endDate: '', description: '', isActive: true }); setFormError('') }

  function getOfferStatus(offer) {
    const now = new Date(), start = new Date(offer.startDate), end = new Date(offer.endDate)
    if (!offer.isActive) return { label: 'Disabled', cls: 'status-pending' }
    if (now < start) return { label: 'Scheduled', cls: 'status-processing' }
    if (now > end) return { label: 'Expired', cls: 'status-pending' }
    return { label: 'Active', cls: 'status-shipped' }
  }

  return (
    <div className="as__root">

      {/* ═══ GST ═══ */}
      <div className="as__section">
        <div className="as__section-header">
          <div>
            <h2 className="as__section-title">🧾 GST Settings</h2>
            <p className="as__section-sub">Saved to database — applies to all new orders automatically</p>
          </div>
        </div>
        <div className="as__gst-card">
          {gstLoading ? <p style={{ color: 'var(--gray-400)' }}>Loading…</p> : (
            <>
              <div className="as__gst-toggle-row">
                <div className="as__gst-toggle-info">
                  <span className="as__gst-toggle-label">Apply GST at Checkout</span>
                  <span className={"as__gst-status-pill" + (gstEnabled ? ' as__gst-status-pill--on' : '')}>
                    {gstEnabled ? `ON — ${gstRate}% applied to every order` : 'OFF — No tax added'}
                  </span>
                </div>
                <button className={"as__toggle-switch" + (gstEnabled ? ' as__toggle-switch--on' : '')} onClick={handleGSTToggle}>
                  <span className="as__toggle-knob" />
                </button>
              </div>
              {gstEnabled && (
                <div className="as__gst-rates">
                  <p className="as__gst-rate-label">Select GST Rate</p>
                  <div className="as__gst-rate-grid">
                    {[5, 12, 18].map(r => (
                      <button key={r}
                        className={"as__gst-rate-btn" + (gstRate === r ? ' as__gst-rate-btn--active' : '')}
                        onClick={() => handleGSTRate(r)}>{r}%</button>
                    ))}
                  </div>
                  <div className="as__gst-preview">
                    <span>Example: A ₹500 order → </span>
                    <strong>₹{500 + Math.round(500 * gstRate / 100)} at checkout</strong>
                    <span className="as__gst-preview-note"> (+₹{Math.round(500 * gstRate / 100)} GST @ {gstRate}%)</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ═══ DELIVERY ═══ */}
      <div className="as__section">
        <div className="as__section-header">
          <div>
            <h2 className="as__section-title">🚚 Delivery Charge Settings</h2>
            <p className="as__section-sub">Saved to database — applies to all new orders automatically</p>
          </div>
        </div>
        <div className="as__gst-card">
          {deliveryLoading ? <p style={{ color: 'var(--gray-400)' }}>Loading…</p> : (
            <>
              <div className="as__form-grid-3">

                <div className="form-group">
                  <label className="form-label">
                    Delivery Below ₹500 (₹)
                  </label>

                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    value={lowDeliveryCharge}
                    onChange={e =>
                      setLowDeliveryCharge(Number(e.target.value))
                    }
                    placeholder="79"
                  />

                  <p style={{
                    fontSize: 11,
                    color: 'var(--gray-400)',
                    marginTop: 4
                  }}>
                    Charge for orders below ₹500
                  </p>
                </div>


                <div className="form-group">
                  <label className="form-label">
                    Delivery ₹500+ (₹)
                  </label>

                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    value={deliveryCharge}
                    onChange={e =>
                      setDeliveryCharge(Number(e.target.value))
                    }
                    placeholder="49"
                  />

                  <p style={{
                    fontSize: 11,
                    color: 'var(--gray-400)',
                    marginTop: 4
                  }}>
                    Charge for orders ₹500 and above
                  </p>
                </div>


                <div className="form-group">
                  <label className="form-label">
                    Free Delivery Above (₹)
                  </label>

                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    value={freeDeliveryAbove}
                    onChange={e =>
                      setFreeDeliveryAbove(Number(e.target.value))
                    }
                    placeholder="999"
                  />

                  <p style={{
                    fontSize: 11,
                    color: 'var(--gray-400)',
                    marginTop: 4
                  }}>
                    Orders at or above this amount are free
                  </p>
                </div>

              </div>
              <div className="as__gst-preview" style={{ marginTop: 8 }}>
                <span>
                  Current rule:
                  Orders below ₹500 →
                </span>

                <strong>
                  ₹{lowDeliveryCharge}
                </strong>

                <span>
                  &nbsp;delivery · Orders ₹500–₹{freeDeliveryAbove - 1} →
                </span>

                <strong>
                  ₹{deliveryCharge}
                </strong>

                <span className="as__gst-preview-note">
                  &nbsp;· Orders ₹{freeDeliveryAbove}+ → FREE
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
                <button className="btn-primary" style={{ padding: '10px 24px' }} onClick={saveDeliverySettings}>
                  💾 Save Delivery Settings
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ═══ STORE ADDRESS ═══ */}
      <div className="as__section">
        <div className="as__section-header">
          <div>
            <h2 className="as__section-title">📍 Store / Ship-From Address</h2>
            <p className="as__section-sub">Appears on all shipping label PDFs as the sender</p>
          </div>
        </div>
        <div className="as__gst-card">
          <div className="as__form-grid-2">
            <div className="form-group">
              <label className="form-label">Business Name</label>
              <input className="form-input" value={storeAddr.name} onChange={e => changeAddr('name', e.target.value)} placeholder="Nutresa Foods Pvt. Ltd." />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={storeAddr.phone} onChange={e => changeAddr('phone', e.target.value)} placeholder="+91 XXXXX XXXXX" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Address Line</label>
            <input className="form-input" value={storeAddr.line1} onChange={e => changeAddr('line1', e.target.value)} placeholder="Street, Area, City" />
          </div>
          <div className="as__form-grid-2">
            <div className="form-group">
              <label className="form-label">State</label>
              <input className="form-input" value={storeAddr.state} onChange={e => changeAddr('state', e.target.value)} placeholder="Andhra Pradesh" />
            </div>
            <div className="form-group">
              <label className="form-label">PIN Code</label>
              <input className="form-input" value={storeAddr.pin} onChange={e => changeAddr('pin', e.target.value)} placeholder="520001" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" value={storeAddr.email} onChange={e => changeAddr('email', e.target.value)} placeholder="info@nutresa.in" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn-primary" style={{ padding: '10px 24px' }} onClick={saveStoreAddress}>💾 Save Address</button>
          </div>
        </div>
      </div>

      {/* ═══ OFFERS ═══ */}
      <div className="as__section">
        <div className="as__section-header">
          <div>
            <h2 className="as__section-title">🎁 Offers & Coupons</h2>
            <p className="as__section-sub">Create time-limited discount offers and coupon codes</p>
          </div>
        </div>
        <div className="as__offer-form-card">
          <h3 className="as__form-title">{editingId !== null ? '✏️ Edit Offer' : '➕ Create New Offer'}</h3>
          {formError && <div className="as__form-error">⚠️ {formError}</div>}
          <form onSubmit={handleAddOffer} noValidate>
            <div className="as__form-grid-2">
              <div className="form-group">
                <label className="form-label">Offer Title *</label>
                <input className="form-input" value={offerForm.title} onChange={e => changeOffer('title', e.target.value)} placeholder="e.g. Diwali Special Sale" />
              </div>
              <div className="form-group">
                <label className="form-label">Coupon Code *</label>
                <div className="as__code-row">
                  <input className="form-input as__code-input" value={offerForm.code} onChange={e => changeOffer('code', e.target.value.toUpperCase())} placeholder="e.g. DIWALI20" />
                  <button type="button" className="as__gen-btn" onClick={generateCode}>Auto Generate</button>
                </div>
              </div>
            </div>
            <div className="as__form-grid-3">
              <div className="form-group">
                <label className="form-label">Offer Type *</label>
                <select className="form-input" value={offerForm.type} onChange={e => changeOffer('type', e.target.value)}>
                  {OFFER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              {['percentage', 'flat'].includes(offerForm.type) && (
                <div className="form-group">
                  <label className="form-label">{offerForm.type === 'percentage' ? 'Discount % *' : 'Flat Discount ₹ *'}</label>
                  <input className="form-input" type="number" min="1" max={offerForm.type === 'percentage' ? 100 : undefined}
                    value={offerForm.value} onChange={e => changeOffer('value', e.target.value)} />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Min. Order (₹)</label>
                <input className="form-input" type="number" min="0" value={offerForm.minOrder} onChange={e => changeOffer('minOrder', e.target.value)} placeholder="0 = no minimum" />
              </div>
            </div>
            <div className="as__form-grid-2">
              <div className="form-group">
                <label className="form-label">Start Date *</label>
                <input className="form-input" type="date" value={offerForm.startDate} onChange={e => changeOffer('startDate', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">End Date *</label>
                <input className="form-input" type="date" value={offerForm.endDate} onChange={e => changeOffer('endDate', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input className="form-input" value={offerForm.description} onChange={e => changeOffer('description', e.target.value)} placeholder="e.g. Get 20% off on all orders above ₹500!" />
            </div>
            <div className="as__form-active-row">
              <label className="as__form-active-label">
                <span>Activate offer immediately</span>
                <button type="button" className={"as__toggle-switch as__toggle-switch--sm" + (offerForm.isActive ? ' as__toggle-switch--on' : '')} onClick={() => changeOffer('isActive', !offerForm.isActive)}>
                  <span className="as__toggle-knob" />
                </button>
              </label>
            </div>
            <div className="as__form-actions">
              {editingId !== null && <button type="button" className="btn-outline" onClick={cancelEdit}>Cancel</button>}
              <button type="submit" className="btn-primary" style={{ padding: '11px 28px' }}>
                {editingId !== null ? '💾 Save Changes' : '✅ Add Offer'}
              </button>
            </div>
          </form>
        </div>

        {offers.length > 0 ? (
          <div className="as__offers-list">
            <h3 className="as__offers-list-title">All Offers ({offers.length})</h3>
            {offers.map(offer => {
              const status = getOfferStatus(offer)
              const days = Math.ceil((new Date(offer.endDate) - new Date()) / (1000 * 60 * 60 * 24))
              return (
                <div key={offer.id} className={"as__offer-card" + (!offer.isActive ? ' as__offer-card--disabled' : '')}>
                  <div className="as__offer-card-top">
                    <div className="as__offer-card-left">
                      <div className="as__offer-title">{offer.title}</div>
                      <div className="as__offer-code-pill">{offer.code}</div>
                    </div>
                    <span className={"status-badge " + status.cls}>{status.label}</span>
                  </div>
                  <div className="as__offer-details">
                    <div className="as__offer-detail-item">
                      <span className="as__offer-detail-label">Type</span>
                      <span className="as__offer-detail-val">{OFFER_TYPES.find(t => t.value === offer.type)?.label}</span>
                    </div>
                    {offer.value && (
                      <div className="as__offer-detail-item">
                        <span className="as__offer-detail-label">Discount</span>
                        <span className="as__offer-detail-val as__discount-val">{offer.type === 'percentage' ? `${offer.value}% OFF` : `₹${offer.value} OFF`}</span>
                      </div>
                    )}
                    {offer.minOrder && (
                      <div className="as__offer-detail-item">
                        <span className="as__offer-detail-label">Min Order</span>
                        <span className="as__offer-detail-val">₹{offer.minOrder}</span>
                      </div>
                    )}
                    <div className="as__offer-detail-item">
                      <span className="as__offer-detail-label">Valid</span>
                      <span className="as__offer-detail-val">
                        {new Date(offer.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        {' → '}
                        {new Date(offer.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {status.label === 'Active' && days > 0 && <span className="as__days-left"> ({days} days left)</span>}
                      </span>
                    </div>
                  </div>
                  {offer.description && <p className="as__offer-desc">"{offer.description}"</p>}
                  <div className="as__offer-actions">
                    <button className={"as__toggle-switch as__toggle-switch--sm" + (offer.isActive ? ' as__toggle-switch--on' : '')} onClick={() => toggleOfferActive(offer.id)}>
                      <span className="as__toggle-knob" />
                    </button>
                    <span className="as__offer-action-label">{offer.isActive ? 'Active' : 'Disabled'}</span>
                    <button className="as__action-btn as__action-btn--edit" onClick={() => editOffer(offer)}>✏️ Edit</button>
                    <button className="as__action-btn as__action-btn--delete" onClick={() => deleteOffer(offer.id)}>🗑 Delete</button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="as__empty-offers">
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎁</div>
            <p>No offers yet. Create your first offer above!</p>
          </div>
        )}
      </div>
    </div>
  )
}