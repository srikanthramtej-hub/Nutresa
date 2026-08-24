// src/utils/orderUtils.js
// Single source of truth for all order calculations

const API = import.meta.env?.VITE_API_URL || 'http://localhost:4000/api'

// ── Delivery charge — reads from backend ──
// Falls back to local calculation if API fails
export async function fetchDeliveryAndGST(subtotal) {
  try {
    const token = localStorage.getItem('token') ||
                  localStorage.getItem('access_token') ||
                  localStorage.getItem('nutresa_token') || ''
    const res = await fetch(`${API}/orders/delivery-charge?subtotal=${subtotal}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Failed')
    return await res.json()
    // Returns: { deliveryCharge, freeDeliveryAbove, gstEnabled, gstRate, gstAmount, total }
  } catch {
    // Fallback local calculation
    const deliveryCharge = subtotal >= 999 ? 0 : 79
    const gstEnabled = false
    const gstRate = 0
    const gstAmount = 0
    return { deliveryCharge, freeDeliveryAbove: 500, gstEnabled, gstRate, gstAmount, total: subtotal + deliveryCharge }
  }
}

// ── Local delivery charge (for display hints only) ──
export function getDeliveryCharge(subtotal) {
  // This is just for UI hints — actual charge comes from backend
  try {
    const s = localStorage.getItem('nutresa_settings')
    if (s) {
      const parsed = JSON.parse(s)
      if (parsed.deliveryCharge && parsed.freeDeliveryAbove) {
        return subtotal >= parsed.freeDeliveryAbove ? 0 : parsed.deliveryCharge
      }
    }
  } catch {}
  return subtotal >= 999 ? 0 : subtotal >= 500 ? 49 : 79
}

// ── GST calculation ──
export function getGSTSettings() {
  try {
    const s = localStorage.getItem('nutresa_settings')
    if (!s) return { gstEnabled: false, gstRate: 5 }
    const parsed = JSON.parse(s)
    return { gstEnabled: parsed.gstEnabled || false, gstRate: parsed.gstRate || 5 }
  } catch { return { gstEnabled: false, gstRate: 5 } }
}

export function calculateGST(subtotal) {
  const { gstEnabled, gstRate } = getGSTSettings()
  if (!gstEnabled) return { gstAmount: 0, gstRate: 0, gstEnabled: false }
  const gstAmount = Math.round(subtotal * gstRate / 100)
  return { gstAmount, gstRate, gstEnabled: true }
}

// ── Coupon offers ──
export function getOffers() {
  try {
    const s = localStorage.getItem('nutresa_settings')
    if (!s) return []
    return JSON.parse(s).offers || []
  } catch { return [] }
}

// ── Read saved totals from a stored order (ProfilePage / tracking) ──
export function getOrderTotals(order) {
  const subtotal   = order.subtotal       ?? (order.items||[]).reduce((s,i) => s + i.price * i.qty, 0)
  const shipping   = order.deliveryCharge ?? 0
  const gstEnabled = order.gstEnabled     ?? false
  const gstRate    = order.gstRate        ?? 0
  const gstAmount  = order.gstAmount      ?? 0
  const total      = order.total          ?? subtotal + shipping + gstAmount
  return { subtotal, shipping, gstEnabled, gstRate, gstAmount, total }
}