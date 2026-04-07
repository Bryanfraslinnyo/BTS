// ══════════════════════════════════════════════════
// IUG HEALTH — Auth Context
// Gère : connexion, déconnexion, utilisateur courant
// ══════════════════════════════════════════════════
import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

// ── Comptes de démonstration (remplacés par l'API en prod) ──
const DEMO_USERS = [
  {
    id: 1,
    username: 'bah.ibrahim',
    password: 'iug2024',
    nom: 'Bah Ibrahim',
    role: 'medecin',
    role_label: 'Médecin Chef · Cardiologie',
    photo_color: '#1565C0',
    specialite: 'Cardiologie',
  },
  {
    id: 2,
    username: 'sylla.oumou',
    password: 'iug2024',
    nom: 'Sylla Oumou',
    role: 'medecin',
    role_label: 'Médecin · Médecine Générale',
    photo_color: '#7B1FA2',
    specialite: 'Médecine Générale',
  },
  {
    id: 3,
    username: 'admin',
    password: 'admin123',
    nom: 'Administrateur',
    role: 'admin',
    role_label: 'Administrateur système',
    photo_color: '#2E7D32',
    specialite: null,
  },
]

// ── Persistance légère (sessionStorage) ─────────────
const SESSION_KEY = 'iug_user'

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveSession(user) {
  if (user) sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
  else sessionStorage.removeItem(SESSION_KEY)
}

// ── Provider ─────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser]     = useState(loadSession)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState(null)

  const login = useCallback(async (username, password) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur de connexion')
      }

      saveSession(data.user)
      setUser(data.user)
      return data.user
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch (e) {
      console.error("Erreur lors de la déconnexion backend", e)
    }
    saveSession(null)
    setUser(null)
    setError(null)
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      isAuthenticated: !!user,
      login,
      logout,
      clearError,
      demoUsers: [], // Vider car on utilise la DB réelle
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}