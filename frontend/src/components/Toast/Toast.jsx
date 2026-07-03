import React, { useEffect, useState } from 'react'
import './Toast.css'

/**
 * Toast — small popup notification shown bottom-right of screen.
 *
 * How it works:
 * - Appears when you add a product to cart, place an order, etc.
 * - Automatically disappears after 3 seconds
 * - Shows a green checkmark with the message
 *
 * Usage in App.jsx:
 *   const [toast, setToast] = useState(null)
 *   showToast('Cashews added to cart!')   ← sets the message
 *   {toast && <Toast message={toast} onDone={() => setToast(null)} />}
 */

function Toast({ message, onDone }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setVisible(false), 2800)
    const doneTimer = setTimeout(onDone, 3200)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(doneTimer)
    }
  }, [onDone])

  return (
    <div className={"toast" + (visible ? ' toast--visible' : ' toast--hidden')}>
      <div className="toast__icon">✓</div>
      <span className="toast__message">{message}</span>
    </div>
  )
}

export default Toast