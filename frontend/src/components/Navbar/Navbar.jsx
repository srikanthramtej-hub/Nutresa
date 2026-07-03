import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './Navbar.css'

// Replace the 🌿 emoji icon with your NUTRESA logo image
// Put your logo file at: frontend/public/logo.png
// Then change logoSrc below to '/logo.png'
const LOGO_SRC = '/logo.png'   // ← put your logo.png in /public/

const navLinks = [
  { label: 'Home',  path: '/' },
  { label: 'Shop',  path: '/shop' },
  { label: 'About', path: '/about' },
]

function Navbar({ cartCount }) {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { user, logout } = useAuth()

  const [scrolled,    setScrolled]    = useState(false)
  const [drawerOpen,  setDrawerOpen]  = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // Close drawer whenever route changes
  useEffect(() => { setDrawerOpen(false) }, [location.pathname])

  function go(path) {
    navigate(path)
    setDrawerOpen(false)
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <>
      <header className={"navbar" + (scrolled ? ' navbar--scrolled' : '')}>
        <div className="navbar__inner">

          {/* ── Logo ── */}
          <div className="navbar__logo" onClick={() => go('/')}>
            <img
              src={LOGO_SRC}
              alt="Nutresa"
              className="navbar__logo-img"
              onError={e => {
                // fallback if logo.png not found
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
            {/* Fallback text logo shown if image fails */}
            <div className="navbar__logo-fallback" style={{ display: 'none' }}>
              <div className="navbar__logo-icon">🌿</div>
              <div className="navbar__logo-text">
                <span className="navbar__brand-name">Nutresa</span>
                <span className="navbar__brand-tagline">Pure Nutrition, Daily Power</span>
              </div>
            </div>
          </div>

          {/* ── Centre nav links — hidden on mobile ── */}
          <nav className="navbar__links">
            {navLinks.map(link => (
              <button
                key={link.path}
                className={"navbar__link" + (location.pathname === link.path ? ' navbar__link--active' : '')}
                onClick={() => go(link.path)}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* ── Right actions ── */}
          <div className="navbar__actions">

            {/* Desktop: user + admin + signout */}
            {user ? (
              <>
                <button className="navbar__user-btn" onClick={() => go('/profile')}>
                  <span className="navbar__user-avatar">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                  <span className="navbar__user-name">{user.name?.split(' ')[0]}</span>
                </button>

                {user.role === 'ADMIN' && (
                  <button className="navbar__admin-btn" onClick={() => go('/admin')}>
                    ⚙ Admin
                  </button>
                )}

                <button className="navbar__logout" onClick={handleLogout}>
                  Sign Out
                </button>
              </>
            ) : (
              <button
                className="btn-outline navbar__login-btn"
                onClick={() => go('/login')}
              >
                Login
              </button>
            )}

            {/* Cart — always visible */}
            <button className="navbar__cart-btn" onClick={() => go('/cart')}>
              <span className="navbar__cart-icon">🛒</span>
              <span className="navbar__cart-text">Cart</span>
              {cartCount > 0 && (
                <span className="navbar__cart-badge" key={cartCount}>
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {/* Hamburger — only on mobile */}
            <button
              className={"navbar__hamburger" + (drawerOpen ? ' navbar__hamburger--open' : '')}
              onClick={() => setDrawerOpen(v => !v)}
              aria-label="Toggle menu"
              aria-expanded={drawerOpen}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile slide-down drawer ── */}
      {drawerOpen && (
        <div className="navbar__drawer">
          <div className="navbar__drawer-links">
            {navLinks.map(link => (
              <button
                key={link.path}
                className={"navbar__drawer-link" + (location.pathname === link.path ? ' navbar__drawer-link--active' : '')}
                onClick={() => go(link.path)}
              >
                {link.label === 'Home'  ? '🏠' : link.label === 'Shop' ? '🛍' : '📖'}
                {' '}{link.label}
              </button>
            ))}
          </div>

          <div className="navbar__drawer-divider" />

          <div className="navbar__drawer-actions">
            {user ? (
              <>
                <button className="navbar__drawer-link" onClick={() => go('/profile')}>
                  👤 {user.name}
                </button>
                {user.role === 'ADMIN' && (
                  <button className="navbar__drawer-link" onClick={() => go('/admin')}>
                    ⚙️ Admin Panel
                  </button>
                )}
                <button
                  className="navbar__drawer-link navbar__drawer-link--danger"
                  onClick={handleLogout}
                >
                  ↩ Sign Out
                </button>
              </>
            ) : (
              <button className="navbar__drawer-link" onClick={() => go('/login')}>
                🔑 Login / Register
              </button>
            )}
          </div>
        </div>
      )}

      {/* Overlay to close drawer on outside click */}
      {drawerOpen && (
        <div className="navbar__overlay" onClick={() => setDrawerOpen(false)} />
      )}
    </>
  )
}

export default Navbar