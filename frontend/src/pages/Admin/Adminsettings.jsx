import React, { useState, useEffect } from 'react'
import './AdminSettings.css'

const GST_RATES = [5, 12, 18]

const OFFER_TYPES = [
  { value: 'percentage', label: '% Percentage Off' },
  { value: 'flat',       label: '₹ Flat Amount Off' },
  { value: 'bogo',       label: 'Buy 1 Get 1 Free' },
  { value: 'freeship',   label: 'Free Shipping' },
]

const STORAGE_KEY = 'nutresa_settings'

function loadSettings() {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    return s ? JSON.parse(s) : { gstEnabled: false, gstRate: 5, offers: [] }
  } catch { return { gstEnabled: false, gstRate: 5, offers: [] } }
}

function saveSettings(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  // Dispatch event so other tabs/components know settings changed
  window.dispatchEvent(new Event('nutresa_settings_changed'))
}

export default function AdminSettings({ showToast }) {
  const [settings, setSettings] = useState(loadSettings)
  const [offerForm, setOfferForm] = useState({
    title: '', code: '', type: 'percentage', value: '',
    minOrder: '', startDate: '', endDate: '', description: '', isActive: true,
  })
  const [formError, setFormError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [saved, setSaved] = useState(false)

  // Save whenever settings change
  useEffect(() => {
    saveSettings(settings)
    setSaved(true)
    const t = setTimeout(() => setSaved(false), 2000)
    return () => clearTimeout(t)
  }, [settings])

  function toggleGST() {
    setSettings(p => ({ ...p, gstEnabled: !p.gstEnabled }))
  }

  function setGSTRate(rate) {
    setSettings(p => ({ ...p, gstRate: rate }))
  }

  function changeOffer(field, val) {
    setOfferForm(p => ({ ...p, [field]: val }))
    setFormError('')
  }

  function generateCode() {
    const base = offerForm.title
      ? offerForm.title.toUpperCase().replace(/\s+/g, '').slice(0, 6)
      : 'SAVE'
    setOfferForm(p => ({ ...p, code: base + Math.floor(Math.random() * 100) }))
  }

  function validateOffer() {
    if (!offerForm.title.trim())   return 'Offer title is required'
    if (!offerForm.code.trim())    return 'Coupon code is required'
    if (!offerForm.startDate)      return 'Start date is required'
    if (!offerForm.endDate)        return 'End date is required'
    if (offerForm.startDate > offerForm.endDate) return 'End date must be after start date'
    if (['percentage','flat'].includes(offerForm.type) && !offerForm.value)
      return 'Discount value is required'
    if (offerForm.type === 'percentage' && Number(offerForm.value) > 100)
      return 'Percentage cannot exceed 100%'
    return null
  }

  function handleAddOffer(e) {
    e.preventDefault()
    const err = validateOffer()
    if (err) { setFormError(err); return }

    if (editingId !== null) {
      setSettings(p => ({
        ...p,
        offers: p.offers.map(o => o.id === editingId ? { ...offerForm, id: editingId } : o),
      }))
      showToast('Offer updated!')
      setEditingId(null)
    } else {
      setSettings(p => ({ ...p, offers: [...p.offers, { ...offerForm, id: Date.now() }] }))
      showToast('Offer added!')
    }
    setOfferForm({ title:'', code:'', type:'percentage', value:'', minOrder:'', startDate:'', endDate:'', description:'', isActive:true })
    setFormError('')
  }

  function editOffer(offer) {
    setOfferForm({ ...offer })
    setEditingId(offer.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function deleteOffer(id) {
    if (!window.confirm('Delete this offer?')) return
    setSettings(p => ({ ...p, offers: p.offers.filter(o => o.id !== id) }))
    showToast('Offer deleted.')
  }

  function toggleOfferActive(id) {
    setSettings(p => ({
      ...p,
      offers: p.offers.map(o => o.id === id ? { ...o, isActive: !o.isActive } : o),
    }))
  }

  function cancelEdit() {
    setEditingId(null)
    setOfferForm({ title:'', code:'', type:'percentage', value:'', minOrder:'', startDate:'', endDate:'', description:'', isActive:true })
    setFormError('')
  }

  function getOfferStatus(offer) {
    const now = new Date(), start = new Date(offer.startDate), end = new Date(offer.endDate)
    if (!offer.isActive)  return { label: 'Disabled',  cls: 'status-pending' }
    if (now < start)      return { label: 'Scheduled', cls: 'status-processing' }
    if (now > end)        return { label: 'Expired',   cls: 'status-pending' }
    return { label: 'Active', cls: 'status-shipped' }
  }

  return (
    <div className="as__root">

      {/* ═══ GST ═══ */}
      <div className="as__section">
        <div className="as__section-header">
          <div>
            <h2 className="as__section-title">🧾 GST Settings</h2>
            <p className="as__section-sub">Enable GST to automatically add tax to all orders at checkout</p>
          </div>
          {saved && <span className="as__auto-saved">✓ Auto-saved</span>}
        </div>

        <div className="as__gst-card">
          <div className="as__gst-toggle-row">
            <div className="as__gst-toggle-info">
              <span className="as__gst-toggle-label">Apply GST at Checkout</span>
              <span className={"as__gst-status-pill" + (settings.gstEnabled ? ' as__gst-status-pill--on' : '')}>
                {settings.gstEnabled ? `ON — ${settings.gstRate}% applied to every order` : 'OFF — No tax added'}
              </span>
            </div>
            <button
              className={"as__toggle-switch" + (settings.gstEnabled ? ' as__toggle-switch--on' : '')}
              onClick={toggleGST}
              aria-label="Toggle GST"
            >
              <span className="as__toggle-knob" />
            </button>
          </div>

          {settings.gstEnabled && (
            <div className="as__gst-rates">
              <p className="as__gst-rate-label">Select GST Rate</p>
              <div className="as__gst-rate-grid">
                {GST_RATES.map(r => (
                  <button key={r}
                    className={"as__gst-rate-btn" + (settings.gstRate === r ? ' as__gst-rate-btn--active' : '')}
                    onClick={() => setGSTRate(r)}>
                    {r}%
                  </button>
                ))}
              </div>
              <div className="as__gst-preview">
                <span>Example: A ₹500 order → </span>
                <strong>₹{500 + Math.round(500 * settings.gstRate / 100)} at checkout</strong>
                <span className="as__gst-preview-note"> (+₹{Math.round(500 * settings.gstRate / 100)} GST @ {settings.gstRate}%)</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ OFFERS ═══ */}
      <div className="as__section">
        <div className="as__section-header">
          <div>
            <h2 className="as__section-title">🎁 Offers & Coupons</h2>
            <p className="as__section-sub">Create time-limited discount offers and coupon codes for your customers</p>
          </div>
        </div>

        <div className="as__offer-form-card">
          <h3 className="as__form-title">
            {editingId !== null ? '✏️ Edit Offer' : '➕ Create New Offer'}
          </h3>

          {formError && <div className="as__form-error">⚠️ {formError}</div>}

          <form onSubmit={handleAddOffer} noValidate>
            <div className="as__form-grid-2">
              <div className="form-group">
                <label className="form-label">Offer Title *</label>
                <input className="form-input" value={offerForm.title}
                  onChange={e => changeOffer('title', e.target.value)}
                  placeholder="e.g. Diwali Special Sale" />
              </div>
              <div className="form-group">
                <label className="form-label">Coupon Code *</label>
                <div className="as__code-row">
                  <input className="form-input as__code-input"
                    value={offerForm.code}
                    onChange={e => changeOffer('code', e.target.value.toUpperCase())}
                    placeholder="e.g. DIWALI20" />
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
              {['percentage','flat'].includes(offerForm.type) && (
                <div className="form-group">
                  <label className="form-label">{offerForm.type === 'percentage' ? 'Discount % *' : 'Flat Discount ₹ *'}</label>
                  <input className="form-input" type="number" min="1"
                    max={offerForm.type === 'percentage' ? 100 : undefined}
                    value={offerForm.value}
                    onChange={e => changeOffer('value', e.target.value)}
                    placeholder={offerForm.type === 'percentage' ? '20' : '50'} />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Min. Order (₹)</label>
                <input className="form-input" type="number" min="0"
                  value={offerForm.minOrder}
                  onChange={e => changeOffer('minOrder', e.target.value)}
                  placeholder="0 = no minimum" />
              </div>
            </div>

            <div className="as__form-grid-2">
              <div className="form-group">
                <label className="form-label">Start Date *</label>
                <input className="form-input" type="date" value={offerForm.startDate}
                  onChange={e => changeOffer('startDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="form-group">
                <label className="form-label">End Date *</label>
                <input className="form-input" type="date" value={offerForm.endDate}
                  onChange={e => changeOffer('endDate', e.target.value)}
                  min={offerForm.startDate || new Date().toISOString().split('T')[0]} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description (shown to customers)</label>
              <input className="form-input" value={offerForm.description}
                onChange={e => changeOffer('description', e.target.value)}
                placeholder="e.g. Get 20% off on all orders above ₹500 this Diwali!" />
            </div>

            <div className="as__form-active-row">
              <label className="as__form-active-label">
                <span>Activate offer immediately</span>
                <button type="button"
                  className={"as__toggle-switch as__toggle-switch--sm" + (offerForm.isActive ? ' as__toggle-switch--on' : '')}
                  onClick={() => changeOffer('isActive', !offerForm.isActive)}>
                  <span className="as__toggle-knob" />
                </button>
              </label>
            </div>

            <div className="as__form-actions">
              {editingId !== null && <button type="button" className="btn-outline" onClick={cancelEdit}>Cancel</button>}
              <button type="submit" className="btn-primary" style={{ padding:'11px 28px' }}>
                {editingId !== null ? '💾 Save Changes' : '✅ Add Offer'}
              </button>
            </div>
          </form>
        </div>

        {/* Offers list */}
        {settings.offers.length > 0 ? (
          <div className="as__offers-list">
            <h3 className="as__offers-list-title">All Offers ({settings.offers.length})</h3>
            {settings.offers.map(offer => {
              const status = getOfferStatus(offer)
              const days = Math.ceil((new Date(offer.endDate) - new Date()) / (1000*60*60*24))
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
                      <span className="as__offer-detail-val">{OFFER_TYPES.find(t=>t.value===offer.type)?.label}</span>
                    </div>
                    {offer.value && (
                      <div className="as__offer-detail-item">
                        <span className="as__offer-detail-label">Discount</span>
                        <span className="as__offer-detail-val as__discount-val">
                          {offer.type==='percentage' ? `${offer.value}% OFF` : `₹${offer.value} OFF`}
                        </span>
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
                        {new Date(offer.startDate).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
                        {' → '}
                        {new Date(offer.endDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                        {status.label==='Active' && days>0 && <span className="as__days-left"> ({days} days left)</span>}
                      </span>
                    </div>
                  </div>

                  {offer.description && <p className="as__offer-desc">"{offer.description}"</p>}

                  <div className="as__offer-actions">
                    <button
                      className={"as__toggle-switch as__toggle-switch--sm" + (offer.isActive ? ' as__toggle-switch--on' : '')}
                      onClick={() => toggleOfferActive(offer.id)}>
                      <span className="as__toggle-knob" />
                    </button>
                    <span className="as__offer-action-label">{offer.isActive ? 'Active' : 'Disabled'}</span>
                    <button className="as__action-btn as__action-btn--edit"   onClick={() => editOffer(offer)}>✏️ Edit</button>
                    <button className="as__action-btn as__action-btn--delete" onClick={() => deleteOffer(offer.id)}>🗑 Delete</button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="as__empty-offers">
            <div style={{ fontSize:40, marginBottom:12 }}>🎁</div>
            <p>No offers yet. Create your first offer above!</p>
          </div>
        )}
      </div>
    </div>
  )
}