import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { adminAPI } from '../../api'
import AdminPolicies from './Adminpolicies'
import AdminSettings from './AdminSettings'
import './AdminPage.css'

const UPLOADS = import.meta.env.VITE_UPLOADS_URL || 'http://localhost:4000'
const STATUS_NEXT = { PLACED:'PROCESSING', PROCESSING:'PACKED', PACKED:'SHIPPED', SHIPPED:'OUT_FOR_DELIVERY', OUT_FOR_DELIVERY:'DELIVERED' }
const STATUS_STEP = { PLACED:0, PROCESSING:1, PACKED:2, SHIPPED:3, OUT_FOR_DELIVERY:4, DELIVERED:5 }
const ORDER_STEPS = ['Placed','Processing','Packed','Shipped','Out for Delivery','Delivered']
const MAX_IMAGES  = 5

const DEFAULT_WEIGHTS = [
  { label:'100g', grams:100, price:'' },
  { label:'250g', grams:250, price:'' },
  { label:'500g', grams:500, price:'' },
  { label:'1 kg', grams:1000, price:'' },
]

function getImageUrls(product) {
  try {
    if (!product) return []
    const arr = JSON.parse(product.imageUrls || '[]')
    if (arr.length) return arr
    if (product.imageUrl) return [product.imageUrl]
    return []
  } catch {
    if (product?.imageUrl) return [product.imageUrl]
    return []
  }
}

// ── PDF label ──
function printOrderPDF(order) {
  const address = typeof order.address === 'string' ? JSON.parse(order.address || '{}') : (order.address || {})
  const itemsHTML = (order.items || []).map(i =>
    `<tr>
      <td style="padding:9px 14px;border-bottom:1px solid #f0e6d3">${i.product?.name||''} (${i.weightLabel})</td>
      <td style="padding:9px 14px;border-bottom:1px solid #f0e6d3;text-align:center">${i.qty}</td>
      <td style="padding:9px 14px;border-bottom:1px solid #f0e6d3;text-align:right">&#8377;${i.price*i.qty}</td>
    </tr>`).join('')

  const step = STATUS_STEP[order.status] ?? 0
  const stepsHTML = ORDER_STEPS.map((s, i) => {
    const done = i < step, active = i === step
    return `<div style="display:flex;flex-direction:column;align-items:center;flex:1;position:relative;min-width:70px">
      ${i>0?`<div style="position:absolute;top:14px;right:50%;left:-50%;height:2px;background:${done?'#7F2020':'#e8dada'};z-index:0"></div>`:''}
      <div style="width:28px;height:28px;border-radius:50%;background:${done?'#7F2020':active?'#F3E4C9':'#f5f0f0'};border:2px solid ${done||active?'#7F2020':'#c9b8b8'};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:${done?'white':active?'#7F2020':'#9c8080'};z-index:1;position:relative">${done?'✓':i+1}</div>
      <div style="font-size:9px;color:${done||active?'#7F2020':'#9c8080'};margin-top:5px;text-align:center;font-weight:${done||active?600:400}">${s}</div>
    </div>`}).join('')

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Label ${order.id}</title>
  <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:sans-serif;color:#2c1f1f;padding:36px;background:#fff}
  .hdr{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:16px;border-bottom:2.5px solid #7F2020;margin-bottom:22px}
  .brand{font-size:24px;font-weight:700;color:#7F2020}.brand-tag{font-size:10px;color:#b08a55;letter-spacing:2px;text-transform:uppercase;margin-top:3px}
  .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:18px}
  .info-box{background:#faf7f7;border-radius:8px;padding:12px 14px}.info-label{font-size:10px;color:#9c8080;text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px}
  .info-value{font-size:13px;color:#2c1f1f;line-height:1.6}
  .sec-title{font-size:10px;font-weight:700;color:#9c8080;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;padding-bottom:5px;border-bottom:1px solid #f0e6d3}
  table{width:100%;border-collapse:collapse}thead th{background:#7F2020;color:white;padding:9px 14px;font-size:11px;font-weight:600;text-align:left}
  .totals{margin-top:12px;display:flex;flex-direction:column;align-items:flex-end;gap:5px}
  .grand{display:flex;gap:48px;font-size:16px;font-weight:700;color:#7F2020;border-top:2px solid #7F2020;padding-top:8px;margin-top:4px}
  .grand span:last-child{min-width:72px;text-align:right}
  .footer{margin-top:24px;text-align:center;font-size:11px;color:#9c8080;padding-top:12px;border-top:1px solid #f0e6d3}
  .footer strong{color:#7F2020}@media print{body{padding:20px}}</style></head><body>
  <div class="hdr"><div><div class="brand">Nutresa</div><div class="brand-tag">Pure Nutrition, Daily Power</div></div>
  <div style="text-align:right"><div style="font-size:15px;font-weight:700;color:#4a1212">${order.id}</div>
  <div style="font-size:12px;color:#9c8080;margin-top:2px">${new Date(order.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</div>
  <span style="display:inline-block;padding:3px 12px;background:#F3E4C9;color:#7F2020;border-radius:20px;font-size:11px;font-weight:600;margin-top:5px">${(order.status||'').replace(/_/g,' ')}</span></div></div>
  <div class="info-grid">
  <div class="info-box"><div class="info-label">Customer</div><div class="info-value"><strong>${order.user?.name||''}</strong><br/>${order.user?.email||''}</div></div>
  <div class="info-box"><div class="info-label">Ship To</div><div class="info-value">${address.line1||'—'}<br/>${address.city||''}, ${address.state||''}<br/>PIN: ${address.pin||''}${address.phone?'<br/>📞 '+address.phone:''}</div></div></div>
  <div style="margin-bottom:18px"><div class="sec-title">Order Status</div><div style="display:flex;align-items:flex-start;padding:8px 0">${stepsHTML}</div></div>
  <div style="margin-bottom:18px"><div class="sec-title">Items</div>
  <table><thead><tr><th>Product</th><th style="text-align:center">Qty</th><th style="text-align:right">Amount</th></tr></thead><tbody>${itemsHTML}</tbody></table>
  <div class="totals"><div class="grand"><span>Total</span><span>&#8377;${order.total}</span></div></div></div>
  <div class="footer"><strong>Nutresa</strong> | info@nutresa.in | +91 00000 00000 | Vijayawada, AP — 520001</div>
  <script>window.onload=function(){window.print()}</script></body></html>`

  const win = window.open('', '_blank')
  if (win) { win.document.write(html); win.document.close() }
}

function downloadOrderPDF(order, address, cart, total, shipping, gstAmount, gstRate, discount, couponCode) {
  const itemsHTML = cart.map(i =>
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
    <div class="t-row"><span>Subtotal</span><span>&#8377;${cart.reduce((s,i)=>s+i.price*i.qty,0)}</span></div>
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

/* ─── Product Form Modal — up to 5 images ─── */
function ProductFormModal({ product, onClose, onSaved }) {
  const isEdit = !!product
  const existingUrls = getImageUrls(product)

  const [form, setForm] = useState({
    name: product?.name || '',
    category: product?.category || 'Nuts',
    basePrice: product?.basePrice || '',
    description: product?.description || '',
    stock: product?.stock ?? '',
    origin: product?.origin || '',
    shelfLife: product?.shelfLife || '',
    isNew: product?.isNew || false,
    tags: (product?.tags || []).join(', '),
    weightOptions: product?.weightOptions?.length
      ? product.weightOptions.map(w => ({ label:w.label, grams:w.grams, price:w.price }))
      : DEFAULT_WEIGHTS,
  })

  // existing images (kept from before)
  const [keptImages,    setKeptImages]    = useState(existingUrls)
  // new files picked by user
  const [newFiles,      setNewFiles]      = useState([])
  // previews for new files
  const [newPreviews,   setNewPreviews]   = useState([])
  const [saving,        setSaving]        = useState(false)
  const [error,         setError]         = useState('')
  const fileRef = useRef()

  const totalImages = keptImages.length + newFiles.length
  const canAddMore  = totalImages < MAX_IMAGES

  function change(field, val) { setForm(p => ({ ...p, [field]: val })) }
  function updateWeight(i, field, val) {
    setForm(p => { const wo = [...p.weightOptions]; wo[i] = { ...wo[i], [field]: val }; return { ...p, weightOptions: wo } })
  }

  function onImagesPick(e) {
    const files = Array.from(e.target.files || [])
    const allowed = MAX_IMAGES - keptImages.length - newFiles.length
    const picked  = files.slice(0, allowed)
    setNewFiles(prev => [...prev, ...picked])
    setNewPreviews(prev => [...prev, ...picked.map(f => URL.createObjectURL(f))])
    e.target.value = ''
  }

  function removeKept(idx) { setKeptImages(prev => prev.filter((_, i) => i !== idx)) }
  function removeNew(idx) {
    setNewFiles(prev => prev.filter((_, i) => i !== idx))
    setNewPreviews(prev => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.basePrice || !form.description || !form.stock) {
      setError('Please fill Name, Base Price, Description and Stock'); return
    }
    setSaving(true); setError('')
    try {
      const fd = new FormData()
      fd.append('name',          form.name)
      fd.append('category',      form.category)
      fd.append('basePrice',     form.basePrice)
      fd.append('description',   form.description)
      fd.append('stock',         form.stock)
      fd.append('origin',        form.origin)
      fd.append('shelfLife',     form.shelfLife)
      fd.append('isNew',         String(form.isNew))
      fd.append('tags',          JSON.stringify(form.tags.split(',').map(t=>t.trim()).filter(Boolean)))
      fd.append('weightOptions', JSON.stringify(form.weightOptions))
      // Tell backend which existing images to keep
      fd.append('existingImages', keptImages.join(','))
      // Append new image files under key 'images'
      newFiles.forEach(f => fd.append('images', f))

      if (isEdit) await adminAPI.updateProduct(product.id, fd)
      else        await adminAPI.createProduct(fd)
      onSaved(); onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product.')
    }
    setSaving(false)
  }

  return (
    <div className="pf__backdrop" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="pf__modal">
        <div className="pf__header">
          <h2 className="pf__title">{isEdit ? `Edit — ${product.name}` : 'Add New Product'}</h2>
          <button className="pf__close" onClick={onClose}>✕</button>
        </div>

        <form className="pf__body" onSubmit={handleSubmit}>
          {error && <div className="pf__error">{error}</div>}

          <div className="pf__two-col">
            {/* Left column — images + weights */}
            <div>
              {/* Image upload area */}
              <div className="pf__section-title">
                Product Images
                <span className="pf__img-count"> ({totalImages}/{MAX_IMAGES})</span>
              </div>

              {/* Grid of existing + new images */}
              <div className="pf__images-grid">
                {/* Kept existing images */}
                {keptImages.map((url, i) => (
                  <div key={`kept-${i}`} className="pf__img-thumb">
                    <img src={`${UPLOADS}${url}`} alt={`img-${i}`} />
                    <button type="button" className="pf__img-remove" onClick={() => removeKept(i)}>✕</button>
                    {i === 0 && <span className="pf__img-primary-badge">Main</span>}
                  </div>
                ))}

                {/* New image previews */}
                {newPreviews.map((url, i) => (
                  <div key={`new-${i}`} className="pf__img-thumb pf__img-thumb--new">
                    <img src={url} alt={`new-${i}`} />
                    <button type="button" className="pf__img-remove" onClick={() => removeNew(i)}>✕</button>
                    {keptImages.length === 0 && i === 0 && <span className="pf__img-primary-badge">Main</span>}
                  </div>
                ))}

                {/* Add more slot */}
                {canAddMore && (
                  <div className="pf__img-add-slot" onClick={() => fileRef.current.click()}>
                    <span className="pf__img-add-icon">+</span>
                    <span className="pf__img-add-text">Add Photo</span>
                  </div>
                )}
              </div>

              <input ref={fileRef} type="file" accept="image/*" multiple
                style={{ display:'none' }} onChange={onImagesPick} />
              <p className="pf__image-hint">
                Up to {MAX_IMAGES} photos. First photo is the main display image.
              </p>

              {/* Weight options */}
              <div className="pf__section-title" style={{ marginTop:18 }}>Weight Options & Prices</div>
              {form.weightOptions.map((wo, i) => (
                <div key={wo.label} className="pf__weight-row">
                  <span className="pf__weight-label-tag">{wo.label}</span>
                  <div className="form-group" style={{margin:0,flex:1}}>
                    <input className="form-input" type="number" placeholder="Price (₹)"
                      value={wo.price} onChange={e => updateWeight(i,'price',e.target.value)} />
                  </div>
                </div>
              ))}
            </div>

            {/* Right column — product details */}
            <div>
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input className="form-input" value={form.name}
                  onChange={e => change('name',e.target.value)} placeholder="e.g. Premium Cashews" />
              </div>
              <div className="pf__two-col-inner">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-input" value={form.category} onChange={e => change('category',e.target.value)}>
                    <option>Nuts</option><option>Dried Fruits</option><option>Seeds</option><option>Berries</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Base Price /100g (₹) *</label>
                  <input className="form-input" type="number" value={form.basePrice}
                    onChange={e => change('basePrice',e.target.value)} placeholder="120" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea className="form-input pf__textarea" value={form.description}
                  onChange={e => change('description',e.target.value)} placeholder="Describe the product…" />
              </div>
              <div className="pf__two-col-inner">
                <div className="form-group">
                  <label className="form-label">Stock (units) *</label>
                  <input className="form-input" type="number" value={form.stock}
                    onChange={e => change('stock',e.target.value)} placeholder="100" />
                </div>
                <div className="form-group">
                  <label className="form-label">Origin</label>
                  <input className="form-input" value={form.origin}
                    onChange={e => change('origin',e.target.value)} placeholder="e.g. Goa, India" />
                </div>
              </div>
              <div className="pf__two-col-inner">
                <div className="form-group">
                  <label className="form-label">Shelf Life</label>
                  <input className="form-input" value={form.shelfLife}
                    onChange={e => change('shelfLife',e.target.value)} placeholder="e.g. 6 months" />
                </div>
                <div className="form-group" style={{display:'flex',alignItems:'flex-end',paddingBottom:4}}>
                  <label className="pf__checkbox-label">
                    <input type="checkbox" checked={form.isNew} onChange={e => change('isNew',e.target.checked)} />
                    <span>Mark as New Arrival</span>
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Tags (comma separated)</label>
                <input className="form-input" value={form.tags}
                  onChange={e => change('tags',e.target.value)} placeholder="Protein, Keto, Vegan" />
              </div>
            </div>
          </div>

          <div className="pf__footer">
            <button type="button" className="btn-outline" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? '⏳ Saving…' : isEdit ? '💾 Save Changes' : '✅ Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─── Main AdminPage ─── */
export default function AdminPage() {
  const navigate         = useNavigate()
  const { user, logout } = useAuth()
  const [view, setView]           = useState('dashboard')
  const [stats, setStats]         = useState(null)
  const [orders, setOrders]       = useState([])
  const [products, setProducts]   = useState([])
  const [customers, setCustomers] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [productForm, setProductForm]     = useState(null)
  const [loading, setLoading] = useState(false)
  const [toast,   setToast]   = useState('')

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => { loadView(view) }, [view])

  async function loadView(v) {
    setLoading(true)
    try {
      if (v==='dashboard') { const r = await adminAPI.getDashboard(); setStats(r.data) }
      if (v==='orders')    { const r = await adminAPI.getOrders();    setOrders(r.data) }
      if (v==='products')  { const r = await adminAPI.getProducts();  setProducts(r.data) }
      if (v==='customers') { const r = await adminAPI.getCustomers(); setCustomers(r.data) }
    } catch {}
    setLoading(false)
  }

  async function advanceOrder(id, currentStatus) {
    const next = STATUS_NEXT[currentStatus]
    if (!next) return
    try {
      await adminAPI.updateOrderStatus(id, next)
      setOrders(prev => prev.map(o => o.id===id ? {...o, status:next} : o))
      if (selectedOrder?.id===id) setSelectedOrder(p => p ? {...p, status:next} : p)
      showToast('Order status updated!')
    } catch { showToast('Failed to update status') }
  }

  async function deleteProduct(id, name) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await adminAPI.deleteProduct(id)
      setProducts(prev => prev.filter(p => p.id!==id))
      showToast('Product deleted.')
    } catch { showToast('Failed to delete product') }
  }

  async function updateStock(id, val) {
    const stock = parseInt(val)
    if (isNaN(stock) || stock<0) return
    try {
      await adminAPI.updateStock(id, stock)
      setProducts(prev => prev.map(p => p.id===id ? {...p, stock} : p))
    } catch {}
  }

  const menuItems = [
    { id:'dashboard', icon:'📊', label:'Dashboard' },
    { id:'orders',    icon:'📦', label:'Orders' },
    { id:'products',  icon:'🌿', label:'Products' },
    { id:'customers', icon:'👥', label:'Customers' },
    { id:'policies',  icon:'📄', label:'Policies' },
    { id:'settings',  icon:'⚙️', label:'Settings' },
  ]
  const pendingCount = orders.filter(o => o.status==='PLACED').length

  return (
    <div className="admin__root">
      {/* Top bar */}
      <header className="admin__topbar">
        <div className="admin__topbar-left">
          <div className="admin__topbar-logo" onClick={() => navigate('/')}>
            <div className="admin__topbar-logo-icon">🌿</div>
            <div>
              <div className="admin__topbar-brand">Nutresa</div>
              <div className="admin__topbar-subbrand">Admin Panel</div>
            </div>
          </div>
        </div>
        <div className="admin__topbar-right">
          <div className="admin__topbar-user">
            <div className="admin__topbar-avatar">{user?.name?.charAt(0)}</div>
            <span className="admin__topbar-username">{user?.name}</span>
          </div>
          <button className="admin__topbar-store-btn" onClick={() => navigate('/')}>🏪 View Store</button>
          <button className="admin__topbar-logout" onClick={() => { logout(); navigate('/') }}>Sign Out</button>
        </div>
      </header>

      <div className="admin__body">
        <aside className="admin__sidebar">
          <nav className="admin__nav">
            {menuItems.map(item => (
              <button key={item.id}
                className={"admin__nav-btn" + (view===item.id ? ' admin__nav-btn--active' : '')}
                onClick={() => { setView(item.id); setSelectedOrder(null) }}>
                <span className="admin__nav-icon">{item.icon}</span>
                <span className="admin__nav-label">{item.label}</span>
                {item.id==='orders' && pendingCount>0 && <span className="admin__nav-badge">{pendingCount}</span>}
              </button>
            ))}
          </nav>
        </aside>

        <main className="admin__main">
          {loading && !['policies','settings'].includes(view) && <div className="admin__loading">Loading…</div>}

          {/* DASHBOARD */}
          {view==='dashboard' && !loading && stats && (
            <div className="admin__view">
              <div className="admin__view-header">
                <div><h1 className="admin__page-title">Dashboard</h1><p className="admin__page-sub">Welcome back, {user?.name}!</p></div>
              </div>
              <div className="admin__stat-grid">
                {[
                  { val:`₹${stats.totalRevenue?.toLocaleString()}`, label:'Total Revenue', icon:'💰', green:true },
                  { val:stats.totalOrders,   label:'Total Orders',   icon:'📦' },
                  { val:stats.pendingOrders, label:'Pending Orders', icon:'⏳', amber:stats.pendingOrders>0 },
                  { val:stats.totalUsers,    label:'Customers',      icon:'👥' },
                ].map(s => (
                  <div key={s.label} className={"admin__stat-card"+(s.green?' admin__stat-card--green':s.amber?' admin__stat-card--amber':'')}>
                    <div className="admin__stat-top"><span className="admin__stat-icon">{s.icon}</span>{s.amber&&<span className="admin__stat-alert">Action needed</span>}</div>
                    <div className="admin__stat-value">{s.val}</div>
                    <div className="admin__stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
              {stats.lowStockProducts?.length > 0 && (
                <div className="admin__card">
                  <div className="admin__card-header">
                    <h2 className="admin__card-title">⚠️ Low / Out of Stock</h2>
                    <button className="admin__card-action" onClick={() => setView('products')}>Manage →</button>
                  </div>
                  <div className="admin__low-stock-list">
                    {stats.lowStockProducts.map(p => (
                      <div key={p.id} className="admin__low-stock-row">
                        <span className="admin__ls-name">{p.name}</span>
                        <span className={"admin__ls-stock"+(p.stock===0?' admin__ls-stock--oos':' admin__ls-stock--low')}>
                          {p.stock===0?'OUT OF STOCK':`${p.stock} left`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ORDERS LIST */}
          {view==='orders' && !loading && !selectedOrder && (
            <div className="admin__view">
              <div className="admin__view-header">
                <div><h1 className="admin__page-title">Orders</h1><p className="admin__page-sub">{orders.length} total</p></div>
              </div>
              <div className="admin__card">
                <div className="admin__table-wrap">
                  <table className="admin__table">
                    <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o.id}>
                          <td><span className="admin__order-id">{o.id.slice(0,8)}…</span></td>
                          <td>{o.user?.name}</td>
                          <td className="admin__muted">{o.items?.length}</td>
                          <td><span className="admin__money">₹{o.total}</span></td>
                          <td><span className={"status-badge status-"+o.status.toLowerCase()}>{o.status.replace(/_/g,' ')}</span></td>
                          <td className="admin__muted">{new Date(o.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div className="admin__action-btns">
                              {STATUS_NEXT[o.status] && <button className="admin__action-btn admin__action-btn--accept" onClick={() => advanceOrder(o.id,o.status)}>Accept</button>}
                              <button className="admin__action-btn admin__action-btn--view" onClick={() => setSelectedOrder(o)}>View</button>
                              <button className="admin__action-btn admin__action-btn--label" onClick={() => downloadOrderPDF(o)}>📄 PDF</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ORDER DETAIL */}
          {view==='orders' && !loading && selectedOrder && (
            <div className="admin__view">
              <button className="admin__breadcrumb-back" onClick={() => setSelectedOrder(null)}>← Back to Orders</button>
              <div className="admin__view-header" style={{marginTop:14}}>
                <div><h1 className="admin__page-title">{selectedOrder.id.slice(0,8)}…</h1><p className="admin__page-sub">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p></div>
                <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
                  <span className={"status-badge status-"+selectedOrder.status.toLowerCase()} style={{fontSize:13,padding:'7px 16px'}}>{selectedOrder.status.replace(/_/g,' ')}</span>
                  <button className="btn-primary" style={{fontSize:13,padding:'8px 18px'}} onClick={() => printOrderPDF(selectedOrder)}>📄 Download PDF</button>
                  <button className="btn-primary" style={{fontSize:13,padding:'8px 18px'}} onClick={() => downloadOrderPDF(order.id)}>📄 Customer PDF</button>
                </div>
              </div>
              <div className="admin__card">
                <h3 className="admin__card-title">Order Progress</h3>
                <div className="admin__progress-track">
                  {ORDER_STEPS.map((step,i) => {
                    const cur = STATUS_STEP[selectedOrder.status] ?? 0
                    return (
                      <div key={step} className="admin__progress-step">
                        {i>0 && <div className={"admin__progress-line"+(i<=cur?' admin__progress-line--done':'')} />}
                        <div className={"admin__progress-circle"+(i<cur?' admin__progress-circle--done':i===cur?' admin__progress-circle--active':'')}>{i<cur?'✓':i+1}</div>
                        <span className={"admin__progress-label"+(i<=cur?' admin__progress-label--done':'')}>{step}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="admin__detail-actions">
                  {STATUS_NEXT[selectedOrder.status] && (
                    <button className="btn-primary" style={{fontSize:13,padding:'10px 22px'}}
                      onClick={() => { advanceOrder(selectedOrder.id,selectedOrder.status); setSelectedOrder(p => ({...p,status:STATUS_NEXT[p.status]})) }}>
                      → Move to {STATUS_NEXT[selectedOrder.status].replace(/_/g,' ')}
                    </button>
                  )}
                </div>
              </div>
              <div className="admin__detail-grid">
                <div className="admin__card">
                  <h3 className="admin__card-title">Customer</h3>
                  {[['Name',selectedOrder.user?.name],['Email',selectedOrder.user?.email]].map(([l,v]) => (
                    <div key={l} className="admin__detail-row"><span className="admin__detail-label">{l}</span><span className="admin__detail-value">{v}</span></div>
                  ))}
                </div>
                <div className="admin__card">
                  <h3 className="admin__card-title">Items</h3>
                  {selectedOrder.items?.map(i => (
                    <div key={i.id} className="admin__detail-row">
                      <span className="admin__detail-label">{i.product?.name} ({i.weightLabel}) ×{i.qty}</span>
                      <span className="admin__detail-value admin__money">₹{i.price*i.qty}</span>
                    </div>
                  ))}
                  <div className="admin__detail-row" style={{fontWeight:700,borderTop:'2px solid var(--cream-100)',marginTop:8,paddingTop:10}}>
                    <span>Total</span><span className="admin__money">₹{selectedOrder.total}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTS */}
          {view==='products' && !loading && (
            <div className="admin__view">
              <div className="admin__view-header">
                <div><h1 className="admin__page-title">Products</h1><p className="admin__page-sub">Manage catalogue · up to 5 photos per product</p></div>
                <button className="btn-primary" style={{padding:'10px 20px',fontSize:13}} onClick={() => setProductForm('new')}>+ Add Product</button>
              </div>
              <div className="admin__card">
                <div className="admin__table-wrap">
                  <table className="admin__table">
                    <thead><tr><th>Images</th><th>Product</th><th>Category</th><th>Base Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {products.map(p => {
                        const imgs = getImageUrls(p)
                        return (
                          <tr key={p.id}>
                            <td>
                              <div className="admin__product-imgs">
                                {imgs.slice(0,3).map((url,i) => (
                                  <div key={i} className="admin__product-img-thumb">
                                    <img src={`${UPLOADS}${url}`} alt="" />
                                  </div>
                                ))}
                                {imgs.length === 0 && <div className="admin__product-img-thumb"><span>🌿</span></div>}
                                {imgs.length > 3 && <div className="admin__product-img-more">+{imgs.length-3}</div>}
                              </div>
                            </td>
                            <td>
                              <div className="admin__product-name-cell">
                                <span className="admin__product-name">{p.name}</span>
                                {p.isNew && <span className="admin__product-new">NEW</span>}
                              </div>
                            </td>
                            <td className="admin__muted">{p.category}</td>
                            <td>₹{p.basePrice}/100g</td>
                            <td>
                              <input type="number" min="0" className="admin__stock-input"
                                defaultValue={p.stock}
                                onBlur={e => updateStock(p.id, e.target.value)}
                                onKeyDown={e => e.key==='Enter' && updateStock(p.id, e.target.value)} />
                            </td>
                            <td>
                              <span className={"status-badge"+(p.stock===0?' status-pending':p.stock<=50?' status-processing':' status-shipped')}>
                                {p.stock===0?'Out of Stock':p.stock<=50?'Low Stock':'In Stock'}
                              </span>
                            </td>
                            <td>
                              <div className="admin__action-btns">
                                <button className="admin__action-btn admin__action-btn--view" onClick={() => setProductForm(p)}>Edit</button>
                                <button className="admin__action-btn" style={{background:'#fef2f2',color:'var(--red)'}} onClick={() => deleteProduct(p.id,p.name)}>Delete</button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* CUSTOMERS */}
          {view==='customers' && !loading && (
            <div className="admin__view">
              <div className="admin__view-header">
                <div><h1 className="admin__page-title">Customers</h1><p className="admin__page-sub">{customers.length} registered</p></div>
                <a href={adminAPI.getExportUrl()} className="btn-primary" style={{padding:'10px 20px',fontSize:13,textDecoration:'none'}}>⬇ Export CSV</a>
              </div>
              <div className="admin__card">
                <div className="admin__table-wrap">
                  <table className="admin__table">
                    <thead><tr><th>Customer</th><th>Email</th><th>Phone</th><th>Orders</th><th>Total Spent</th><th>Joined</th></tr></thead>
                    <tbody>
                      {customers.map(c => (
                        <tr key={c.id}>
                          <td><div className="admin__customer-cell"><div className="admin__customer-avatar">{c.name?.charAt(0)}</div><span className="admin__customer-name">{c.name}</span></div></td>
                          <td className="admin__muted">{c.email}</td>
                          <td className="admin__muted">{c.phone||'—'}</td>
                          <td>{c._count?.orders||0}</td>
                          <td><span className="admin__money">₹{c.orders?.reduce((s,o)=>s+o.total,0)||0}</span></td>
                          <td className="admin__muted">{new Date(c.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {view==='policies' && <AdminPolicies />}
          {view==='settings' && <AdminSettings showToast={showToast} />}

        </main>
      </div>

      {productForm && (
        <ProductFormModal
          product={productForm==='new' ? null : productForm}
          onClose={() => setProductForm(null)}
          onSaved={() => { showToast(productForm==='new'?'Product added!':'Product updated!'); loadView('products') }}
        />
      )}

      {toast && <div className="admin__toast">{toast}</div>}
    </div>
  )
}