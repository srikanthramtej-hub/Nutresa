import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './Adminpolicies.css'

const POLICY_KEYS = [
  { key: 'privacy', label: 'Privacy Policy', icon: '🔒' },
  { key: 'terms', label: 'Terms & Conditions', icon: '📋' },
  { key: 'shipping', label: 'Shipping Policy', icon: '🚚' },
  { key: 'refund', label: 'Return & Refund Policy', icon: '↩️' },
  { key: 'disclaimer', label: 'Disclaimer', icon: '⚠️' },
]

// ── Toolbar button component ──
function ToolbarBtn({ onClick, title, children, active }) {
  return (
    <button
      type="button"
      className={"rte__tool-btn" + (active ? ' rte__tool-btn--active' : '')}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  )
}

// ── Rich Text Editor ──
function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null)

  // Load initial content into editor
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ''
    }
  }, [value])

  function exec(command, val = null) {
    editorRef.current.focus()
    document.execCommand(command, false, val)
    syncContent()
  }

  function syncContent() {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  function insertHeading() {
    exec('formatBlock', '<h3>')
  }

  function insertBulletList() {
    exec('insertUnorderedList')
  }

  function insertParagraph() {
    exec('formatBlock', '<p>')
  }

  function handleKeyDown(e) {
    // Tab = 2 spaces
    if (e.key === 'Tab') {
      e.preventDefault()
      exec('insertText', '  ')
    }
  }

  return (
    <div className="rte__wrapper">
      {/* Toolbar */}
      <div className="rte__toolbar">
        <div className="rte__toolbar-group">
          <ToolbarBtn onClick={() => exec('bold')} title="Bold"><b>B</b></ToolbarBtn>
          <ToolbarBtn onClick={() => exec('italic')} title="Italic"><i>I</i></ToolbarBtn>
          <ToolbarBtn onClick={() => exec('underline')} title="Underline"><u>U</u></ToolbarBtn>
        </div>
        <div className="rte__toolbar-divider" />
        <div className="rte__toolbar-group">
          <ToolbarBtn onClick={insertHeading} title="Add Heading">H3</ToolbarBtn>
          <ToolbarBtn onClick={insertParagraph} title="Normal Text">¶</ToolbarBtn>
        </div>
        <div className="rte__toolbar-divider" />
        <div className="rte__toolbar-group">
          <ToolbarBtn onClick={insertBulletList} title="Bullet List">• List</ToolbarBtn>
        </div>
        <div className="rte__toolbar-divider" />
        <div className="rte__toolbar-group">
          <ToolbarBtn onClick={() => exec('justifyLeft')} title="Align Left">⬤◁</ToolbarBtn>
          <ToolbarBtn onClick={() => exec('justifyCenter')} title="Align Center">≡</ToolbarBtn>
        </div>
        <div className="rte__toolbar-divider" />
        <div className="rte__toolbar-group">
          <ToolbarBtn onClick={() => exec('undo')} title="Undo">↩</ToolbarBtn>
          <ToolbarBtn onClick={() => exec('redo')} title="Redo">↪</ToolbarBtn>
        </div>
        <div className="rte__toolbar-divider" />
        <div className="rte__toolbar-group">
          <ToolbarBtn onClick={() => exec('removeFormat')} title="Clear Formatting">✕ Clear</ToolbarBtn>
        </div>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        className="rte__editor"
        contentEditable
        suppressContentEditableWarning
        onInput={syncContent}
        onKeyDown={handleKeyDown}
        data-placeholder="Start typing your policy content here…"
      />
    </div>
  )
}

// ── Default policy content ──
const DEFAULTS = {
  privacy: {
    title: 'Privacy Policy',
    content: `<p>At Nutresa, we value your privacy and are committed to protecting your personal information.</p>
<h3>Information We Collect</h3>
<p>We may collect your name, phone number, email address, shipping address, and payment details when you place an order or contact us.</p>
<h3>How We Use Your Information</h3>
<ul><li>To process orders and deliver products</li><li>To improve our website and services</li><li>To send updates, offers, and promotional messages</li></ul>
<h3>Data Protection</h3>
<p>We implement appropriate security measures to protect your personal information.</p>
<h3>Third-Party Sharing</h3>
<p>We do not sell or rent your personal data. Information may be shared with trusted partners (like payment gateways and delivery services) for order fulfillment.</p>
<h3>Cookies</h3>
<p>Our website may use cookies to enhance user experience.</p>
<h3>Your Rights</h3>
<p>You can request to access, update, or delete your personal data at any time.</p>
<h3>Contact Us</h3>
<p>For privacy-related concerns, contact us at: <a href="mailto:info@nutresa.in">info@nutresa.in</a></p>`,
  },
  terms: {
    title: 'Terms & Conditions',
    content: `<p>By using this website, you agree to the following terms:</p>
<h3>Products & Pricing</h3><p>All prices are subject to change without prior notice.</p>
<h3>Order Acceptance</h3><p>We reserve the right to cancel or refuse any order.</p>
<h3>User Responsibility</h3><p>You agree not to misuse the website or engage in illegal activities.</p>
<h3>Intellectual Property</h3><p>All content (images, text, logo) belongs to Nutresa and cannot be used without permission.</p>
<h3>Limitation of Liability</h3><p>We are not liable for any indirect damages arising from the use of our website.</p>
<h3>Changes to Terms</h3><p>We may update these terms at any time without notice.</p>`,
  },
  shipping: {
    title: 'Shipping Policy',
    content: `<h3>Processing Time</h3><p>Orders are processed within 1–2 business days.</p>
<h3>Delivery Time</h3><p>Delivery typically takes 3–7 business days depending on location.</p>
<h3>Shipping Charges</h3><p>Shipping charges will be calculated at checkout or may be free for certain orders.</p>
<h3>Delays</h3><p>We are not responsible for delays caused by courier partners or unforeseen events.</p>`,
  },
  refund: {
    title: 'Return & Refund Policy',
    content: `<p>Due to the nature of food products, we do not accept returns once the product is delivered.</p>
<h3>Damaged or Wrong Product</h3><p>If you receive a damaged or incorrect product, contact us within 24 hours with proof (photo/video).</p>
<h3>Refund Process</h3><p>Eligible refunds will be processed within 5–7 working days.</p>
<h3>Non-Refundable Items</h3><p>Opened or used products are not eligible for return or refund.</p>`,
  },
  disclaimer: {
    title: 'Disclaimer',
    content: `<p>The information provided on this website is for general informational purposes only.</p>
<p>Nutresa products are not intended to diagnose, treat, cure, or prevent any disease. Always consult a healthcare professional before making dietary changes.</p>
<p>We do not guarantee specific results from using our products.</p>`,
  },
}

// ── Main Component ──
export default function Adminpolicies() {
  const navigate = useNavigate()

  const [policies, setPolicies] = useState({})
  const [activeKey, setActiveKey] = useState('privacy')
  const [editing, setEditing] = useState({ title: '', content: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)


  useEffect(() => { loadPolicies() }, [])

  async function loadPolicies() {
    setLoading(true)
    try {
      const res = await fetch('/api/policies')
      const data = await res.json()
      setPolicies(data)
      const first = data['privacy'] || DEFAULTS['privacy']
      setEditing({ title: first.title, content: first.content })
    } catch {
      // fallback to defaults
      setPolicies(DEFAULTS)
      setEditing({ title: DEFAULTS.privacy.title, content: DEFAULTS.privacy.content })
    }
    setLoading(false)
  }

  function selectPolicy(key) {
    setActiveKey(key)
    const p = policies[key] || DEFAULTS[key]
    if (p) setEditing({ title: p.title, content: p.content })
    setSaved(false)
    setPreviewOpen(false)
  }

  async function handleSave() {
    if (!editing.title.trim() || !editing.content.trim()) return
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/policies/${activeKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editing),
      })
      if (res.ok) {
        setPolicies(prev => ({ ...prev, [activeKey]: { ...editing } }))
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch { }
    setSaving(false)
  }

  if (loading) return <div className="ap__loading">⏳ Loading policies…</div>

  return (
    <div className="ap__root">

      {/* Header */}
      <div className="ap__header">
        <div>
          <h1 className="admin__page-title">Policy Management</h1>
          <p className="admin__page-sub">
            Edit your store's legal pages. Changes appear live in the website footer.
          </p>
        </div>
        <div className="ap__header-actions">
          <button
            className="btn-outline"
            style={{ fontSize: '13px', padding: '9px 18px' }}
            onClick={() => navigate('/admin')}
          >
            ← Dashboard
          </button>
          {saved && <span className="ap__saved-badge">✓ Saved successfully</span>}
          <button
            className="btn-outline"
            style={{ fontSize: '13px', padding: '9px 18px' }}
            onClick={() => setPreviewOpen(v => !v)}
          >
            {previewOpen ? '✕ Close Preview' : '👁 Preview'}
          </button>
          <button
            className="btn-primary"
            style={{ fontSize: '13px', padding: '9px 22px' }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? '⏳ Saving…' : '💾 Save Changes'}
          </button>
        </div>
      </div>

      <div className="ap__layout">

        {/* Policy list sidebar */}
        <div className="ap__sidebar">
          {POLICY_KEYS.map(p => (
            <button
              key={p.key}
              className={"ap__policy-btn" + (activeKey === p.key ? ' ap__policy-btn--active' : '')}
              onClick={() => selectPolicy(p.key)}
            >
              <span className="ap__policy-icon">{p.icon}</span>
              <span className="ap__policy-label">{p.label}</span>
            </button>
          ))}
        </div>

        {/* Editor panel */}
        <div className="ap__editor-panel">

          {/* Title input */}
          <div className="ap__editor-card">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>
                Page Title
              </label>
              <input
                className="form-input"
                value={editing.title}
                onChange={e => setEditing(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Privacy Policy"
                style={{ fontSize: 16, fontWeight: 600 }}
              />
            </div>
          </div>

          {/* Rich text editor */}
          <div className="ap__editor-card ap__editor-card--grow">
            <label className="form-label" style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, display: 'block' }}>
              Content
              <span className="ap__editor-hint">
                — Use the toolbar to format text. No coding needed.
              </span>
            </label>
            <RichTextEditor
              value={editing.content}
              onChange={content => setEditing(p => ({ ...p, content }))}
            />
          </div>

          {/* Preview panel — shown when preview button clicked */}
          {previewOpen && (
            <div className="ap__preview-card">
              <div className="ap__preview-header">
                <span className="ap__preview-label">👁 Live Preview</span>
                <span className="ap__preview-sub">This is how it appears to customers</span>
              </div>
              <div className="ap__preview-title-display">{editing.title}</div>
              <div
                className="ap__preview-body"
                dangerouslySetInnerHTML={{ __html: editing.content }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}