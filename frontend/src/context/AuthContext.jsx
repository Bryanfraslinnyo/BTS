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

  /**
   * login(username, password)
   * → En production, remplace le bloc DEMO_USERS par :
   *   const res = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({username, password}) })
   *   const data = await res.json()
   *   if (!res.ok) throw new Error(data.message)
   *   saveSession(data.user); setUser(data.user)
   */
  const login = useCallback(async (username, password) => {
    setLoading(true)
    setError(null)

    try {
      // Simulation délai réseau
      await new Promise((r) => setTimeout(r, 800))

      // Vérification démo
      const found = DEMO_USERS.find(
        (u) =>
          u.username.toLowerCase() === username.toLowerCase().trim() &&
          u.password === password
      )

      if (!found) {
        throw new Error('Identifiant ou mot de passe incorrect.')
      }

      // On ne stocke jamais le mot de passe côté client
      const { password: _pw, ...safeUser } = found
      saveSession(safeUser)
      setUser(safeUser)
      return safeUser
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
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
      demoUsers: DEMO_USERS.map(({ password: _pw, ...u }) => u),
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