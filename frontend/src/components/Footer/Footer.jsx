import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Footer.css'

// Policy Modal Component
function PolicyModal({ title, content, onClose }) {
  return (
    <div className="policy__backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="policy__modal">
        <div className="policy__header">
          <h2 className="policy__title">{title}</h2>
          <button className="policy__close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="policy__body">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </div>
    </div>
  )
}

// Default policy content — Admin can override these via backend
const DEFAULT_POLICIES = {
  privacy: {
    title: 'Privacy Policy',
    content: `
      <p>At Nutresa, we value your privacy and are committed to protecting your personal information.</p>
      <h3>Information We Collect</h3>
      <p>We may collect your name, phone number, email address, shipping address, and payment details when you place an order or contact us.</p>
      <h3>How We Use Your Information</h3>
      <ul>
        <li>To process orders and deliver products</li>
        <li>To improve our website and services</li>
        <li>To send updates, offers, and promotional messages</li>
      </ul>
      <h3>Data Protection</h3>
      <p>We implement appropriate security measures to protect your personal information.</p>
      <h3>Third-Party Sharing</h3>
      <p>We do not sell or rent your personal data. Information may be shared with trusted partners (like payment gateways and delivery services) for order fulfillment.</p>
      <h3>Cookies</h3>
      <p>Our website may use cookies to enhance user experience.</p>
      <h3>Your Rights</h3>
      <p>You can request to access, update, or delete your personal data at any time.</p>
      <h3>Contact Us</h3>
      <p>For privacy-related concerns, contact us at: <a href="mailto:info@nutresa.in">info@nutresa.in</a></p>
    `,
  },
  terms: {
    title: 'Terms & Conditions',
    content: `
      <p>By using this website, you agree to the following terms:</p>
      <h3>Products & Pricing</h3>
      <p>All prices are subject to change without prior notice.</p>
      <h3>Order Acceptance</h3>
      <p>We reserve the right to cancel or refuse any order.</p>
      <h3>User Responsibility</h3>
      <p>You agree not to misuse the website or engage in illegal activities.</p>
      <h3>Intellectual Property</h3>
      <p>All content (images, text, logo) belongs to Nutresa and cannot be used without permission.</p>
      <h3>Limitation of Liability</h3>
      <p>We are not liable for any indirect damages arising from the use of our website.</p>
      <h3>Changes to Terms</h3>
      <p>We may update these terms at any time without notice.</p>
    `,
  },
  shipping: {
    title: 'Shipping Policy',
    content: `
      <h3>Processing Time</h3>
      <p>Orders are processed within 1–2 business days.</p>
      <h3>Delivery Time</h3>
      <p>Delivery typically takes 3–7 business days depending on location.</p>
      <h3>Shipping Charges</h3>
      <p>Shipping charges will be calculated at checkout or may be free for certain orders.</p>
      <h3>Delays</h3>
      <p>We are not responsible for delays caused by courier partners or unforeseen events.</p>
    `,
  },
  refund: {
    title: 'Return & Refund Policy',
    content: `
      <p>Due to the nature of food products, we do not accept returns once the product is delivered.</p>
      <h3>Damaged or Wrong Product</h3>
      <p>If you receive a damaged or incorrect product, contact us within 24 hours with proof (photo/video).</p>
      <h3>Refund Process</h3>
      <p>Eligible refunds will be processed within 5–7 working days.</p>
      <h3>Non-Refundable Items</h3>
      <p>Opened or used products are not eligible for return or refund.</p>
    `,
  },
  disclaimer: {
    title: 'Disclaimer',
    content: `
      <p>The information provided on this website is for general informational purposes only.</p>
      <p>Nutresa products are not intended to diagnose, treat, cure, or prevent any disease. Always consult a healthcare professional before making dietary changes.</p>
      <p>We do not guarantee specific results from using our products.</p>
    `,
  },
}

function Footer({ policies: propPolicies }) {
  const navigate  = useNavigate()
  const [openPolicy, setOpenPolicy] = useState(null)

  // Use policies from props (set by admin) or fall back to defaults
  const policies = propPolicies || DEFAULT_POLICIES

  const shopLinks = ['All Products', 'Nuts', 'Dried Fruits', 'New Arrivals', 'Best Sellers']

  const policyLinks = [
    { key: 'privacy',    label: 'Privacy Policy' },
    { key: 'terms',      label: 'Terms & Conditions' },
    { key: 'shipping',   label: 'Shipping Policy' },
    { key: 'refund',     label: 'Return & Refund Policy' },
    { key: 'disclaimer', label: 'Disclaimer' },
  ]

  return (
    <>
      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__grid">

            {/* Brand */}
            <div className="footer__brand">
              <div className="footer__logo" onClick={() => navigate('/')}>
                <img src="/logo.png" alt="Nutresa" className="footer__logo-img"
                  onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block' }} />
                <span className="footer__logo-text" style={{ display:'none' }}>Nutresa</span>
              </div>
              <p className="footer__tagline">Pure Nutrition, Daily Power</p>
              <p className="footer__brand-desc">
                Premium dry fruits and nuts, sourced directly from nature's finest orchards
                across 12 countries. Delivered fresh to your door.
              </p>
              <div className="footer__socials">
                <a href="#!" className="footer__social-link" aria-label="Instagram">📸</a>
                <a href="#!" className="footer__social-link" aria-label="Facebook">💬</a>
                <a href="#!" className="footer__social-link" aria-label="YouTube">▶️</a>
              </div>
            </div>

            {/* Shop */}
            <div>
              <h4 className="footer__heading">Shop</h4>
              <ul className="footer__list">
                {shopLinks.map(link => (
                  <li key={link}>
                    <button className="footer__link" onClick={() => navigate('/shop')}>{link}</button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="footer__heading">Contact Us</h4>
              <div className="footer__contact-list">
                <div className="footer__contact-item">
                  <span>📍</span>
                  <span>Vijayawada, Andhra Pradesh, India</span>
                </div>
                <div className="footer__contact-item">
                  <span>📞</span>
                  <span>+91 00000 00000</span>
                </div>
                <div className="footer__contact-item">
                  <span>✉️</span>
                  <a href="mailto:info@nutresa.in" className="footer__contact-link">info@nutresa.in</a>
                </div>
                <div className="footer__contact-item">
                  <span>⏰</span>
                  <span>Mon–Sat, 9am – 6pm IST</span>
                </div>
              </div>
            </div>

            {/* Policies */}
            <div>
              <h4 className="footer__heading">Policies</h4>
              <ul className="footer__list">
                {policyLinks.map(p => (
                  <li key={p.key}>
                    <button
                      className="footer__link footer__policy-btn"
                      onClick={() => setOpenPolicy(p.key)}
                    >
                      {p.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="footer__bottom">
            <p>© {new Date().getFullYear()} Nutresa. All rights reserved. Made with 🌿 in India.</p>
            <div className="footer__bottom-links">
              {policyLinks.slice(0, 3).map(p => (
                <button key={p.key} className="footer__link" onClick={() => setOpenPolicy(p.key)}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Policy modal */}
      {openPolicy && policies[openPolicy] && (
        <PolicyModal
          title={policies[openPolicy].title}
          content={policies[openPolicy].content}
          onClose={() => setOpenPolicy(null)}
        />
      )}
    </>
  )
}

export default Footer