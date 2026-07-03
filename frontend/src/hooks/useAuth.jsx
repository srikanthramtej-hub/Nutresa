import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { usersAPI } from '../api'

const AuthContext = createContext(null)

// JWT expiry check — decode payload without a library
function getTokenExpiry(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 // convert to ms
  } catch {
    return null
  }
}

function isTokenExpired(token) {
  const expiry = getTokenExpiry(token)
  if (!expiry) return true
  // Consider expired 60 seconds before actual expiry (buffer)
  return Date.now() > expiry - 60_000
}

function getTimeUntilExpiry(token) {
  const expiry = getTokenExpiry(token)
  if (!expiry) return 0
  return Math.max(0, expiry - Date.now())
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      // On load: if token already expired, clear immediately
      if (token && isTokenExpired(token)) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        return null
      }
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  function login(userData, token) {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  // ── Auto-logout when JWT expires ──
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token || !user) return

    const timeLeft = getTimeUntilExpiry(token)
    if (timeLeft <= 0) {
      logout()
      return
    }

    // Show warning 5 minutes before expiry
    const warnAt = timeLeft - 5 * 60 * 1000
    let warnTimer = null
    if (warnAt > 0) {
      warnTimer = setTimeout(() => {
        // You can replace this with a nicer toast/modal if preferred
        const stay = window.confirm(
          'Your session is about to expire in 5 minutes.\n\nClick OK to stay logged in, or Cancel to log out now.'
        )
        if (!stay) logout()
      }, warnAt)
    }

    // Hard logout when token expires
    const expireTimer = setTimeout(() => {
      alert('Your session has expired. Please log in again.')
      logout()
    }, timeLeft)

    return () => {
      clearTimeout(warnTimer)
      clearTimeout(expireTimer)
    }
  }, [user, logout])

  // ── Refresh user profile on load ──
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token || !user) return
    if (isTokenExpired(token)) { logout(); return }

    usersAPI.getMe()
      .then(res => {
        const fresh = { ...res.data, role: user.role }
        localStorage.setItem('user', JSON.stringify(fresh))
        setUser(fresh)
      })
      .catch(() => {
        // If 401 from server, token is invalid — log out
        logout()
      })
  }, []) // only on mount

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}