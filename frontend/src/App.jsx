import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { cartAPI } from './api'

import Navbar    from './components/Navbar/Navbar'
import Toast     from './components/Toast/Toast'

import HomePage     from './pages/Home/HomePage'
import ShopPage     from './pages/Shop/ShopPage'
import CartPage     from './pages/Cart/CartPage'
import CheckoutPage from './pages/Checkout/CheckoutPage'
import LoginPage    from './pages/Login/LoginPage'
import ProfilePage  from './pages/Profile/ProfilePage'
import AboutPage    from './pages/About/AboutPage'
import AdminPage    from './pages/Admin/AdminPage'
import ProductPage  from './pages/Product/ProductPage'

function AppInner() {
  const { user }   = useAuth()
  const location   = useLocation()
  const isAdmin    = location.pathname.startsWith('/admin')

  const [cart,  setCart]  = useState([])
  const [toast, setToast] = useState(null)

  // Load cart
  useEffect(() => {
    if (user) {
      cartAPI.get()
        .then(res => setCart(res.data.map(formatCartItem)))
        .catch(() => {})
    } else {
      try {
        const saved = localStorage.getItem('cart')
        if (saved) setCart(JSON.parse(saved))
      } catch {}
    }
  }, [user])

  useEffect(() => {
    if (!user) localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart, user])

  function formatCartItem(item) {
    return {
      cartKey:       `${item.productId}-${item.weightLabel}`,
      id:            item.id,
      productId:     item.productId || item.product?.id,
      name:          item.product?.name || item.name,
      imageUrl:      item.product?.imageUrl || item.imageUrl,
      selectedWeight: item.weightLabel,
      price:         item.price,
      qty:           item.qty,
      category:      item.product?.category,
    }
  }

  function showToast(msg) { setToast(msg) }

  async function addToCart(product, qty) {
    const key = `${product.id}-${product.selectedWeight}`
    const cartItem = {
      cartKey:        key,
      productId:      product.id,
      name:           product.name,
      imageUrl:       product.imageUrl,
      selectedWeight: product.selectedWeight,
      price:          product.price,
      qty,
      category:       product.category,
    }
    if (user) {
      try {
        await cartAPI.add(product.id, product.selectedWeight, product.price, qty)
        const fresh = await cartAPI.get()
        setCart(fresh.data.map(formatCartItem))
      } catch { showToast('Failed to add to cart'); return }
    } else {
      setCart(prev => {
        const existing = prev.find(i => i.cartKey === key)
        if (existing) return prev.map(i => i.cartKey === key ? { ...i, qty: i.qty + qty } : i)
        return [...prev, cartItem]
      })
    }
    showToast(`${product.name} (${product.selectedWeight}) added to cart!`)
  }

  async function updateCartQty(cartKey, qty) {
    setCart(prev => prev.map(i => i.cartKey === cartKey ? { ...i, qty } : i))
    if (user) {
      const item = cart.find(i => i.cartKey === cartKey)
      if (item?.id) await cartAPI.update(item.id, qty).catch(() => {})
    }
  }

  async function removeFromCart(cartKey) {
    const item = cart.find(i => i.cartKey === cartKey)
    setCart(prev => prev.filter(i => i.cartKey !== cartKey))
    if (user && item?.id) await cartAPI.remove(item.id).catch(() => {})
  }

  async function clearCart() {
    setCart([])
    if (user) await cartAPI.clear().catch(() => {})
    localStorage.removeItem('cart')
  }

  const totalCartItems = cart.reduce((s, i) => s + i.qty, 0)

  return (
    <>
      {!isAdmin && <Navbar cartCount={totalCartItems} />}

      <Routes>
        <Route path="/"         element={<HomePage />} />
        <Route path="/shop"     element={<ShopPage />} />
        <Route path="/about"    element={<AboutPage />} />
        <Route path="/product/:id" element={<ProductPage onAddToCart={addToCart} />} />
        <Route path="/cart"     element={<CartPage cart={cart} onUpdateQty={updateCartQty} onRemove={removeFromCart} />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/checkout" element={
          user
            ? <CheckoutPage cart={cart} onOrderPlaced={clearCart} showToast={showToast} />
            : <Navigate to="/login" replace />
        } />
        <Route path="/profile"  element={
          user ? <ProfilePage /> : <Navigate to="/login" replace />
        } />
        <Route path="/admin/*"  element={
          user?.role === 'ADMIN' ? <AdminPage /> : <Navigate to="/login" replace />
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </>
  )
}

export default function App() {
  return <AppInner />
}