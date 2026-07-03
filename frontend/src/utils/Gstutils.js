export function getGSTSettings() {
  try {
    const s = localStorage.getItem('nutresa_settings')
    if (!s) return { gstEnabled: false, gstRate: 5 }
    const parsed = JSON.parse(s)
    return {
      gstEnabled: parsed.gstEnabled || false,
      gstRate:    parsed.gstRate    || 5,
    }
  } catch {
    return { gstEnabled: false, gstRate: 5 }
  }
}

export function calculateGST(subtotal) {
  const { gstEnabled, gstRate } = getGSTSettings()
  if (!gstEnabled) return { gstAmount: 0, gstRate: 0, gstEnabled: false }
  const gstAmount = Math.round(subtotal * gstRate / 100)
  return { gstAmount, gstRate, gstEnabled: true }
}

export function getOffers() {
  try {
    const s = localStorage.getItem('nutresa_settings')
    if (!s) return []
    return JSON.parse(s).offers || []
  } catch { return [] }
}