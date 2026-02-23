import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import '../css/login.css'

// Comptes démo visibles dans l'interface
const DEMO_ACCOUNTS = [
  {
    username: 'bah.ibrahim',
    password: 'iug2024',
    nom: 'Dr. Bah Ibrahim',
    role: 'Médecin Chef · Cardiologie',
    color: '#1565C0',
    initials: 'BI',
  },
  {
    username: 'admin',
    password: 'admin123',
    nom: 'Administrateur',
    role: 'Accès complet',
    color: '#2E7D32',
    initials: 'AD',
  },
]

export default function LoginPage() {
  const { login, loading, error, clearError } = useAuth()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!username.trim() || !password.trim()) return
    try {
      await login(username, password)
    } catch {
      // L'erreur est déjà dans le contexte
    }
  }

  const fillDemo = (acc) => {
    clearError()
    setUsername(acc.username)
    setPassword(acc.password)
  }

  return (
    <div className="login-root">
      {/* ── Panneau gauche ── */}
      <div className="login-left">
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
        <div className="login-orb login-orb-3" />
        <div className="login-grid-bg" />

        <div className="login-brand">
          {/* Logo */}
          <div className="login-logo-wrap">
            <div className="login-logo-badge">IUG</div>
            <div>
              <div className="login-logo-name">IUG HEALTH</div>
              <div className="login-logo-sub">Système de gestion médicale</div>
            </div>
          </div>

          {/* Headline */}
          <div className="login-headline">
            Votre espace<br />
            médical <span>intelligent</span><br />
            et sécurisé.
          </div>
          <p className="login-tagline">
            Gérez vos patients, consultations et examens
            depuis une interface claire, rapide et conçue
            pour les professionnels de santé.
          </p>
        </div>

        {/* Stats illustratives */}
        <div className="login-cards">
          {[
            { icon: '👥', val: '6+',   lbl: 'Patients actifs',         cls: 'lsi-blue' },
            { icon: '📋', val: '8+',   lbl: 'Consultations ce mois',   cls: 'lsi-cyan' },
            { icon: '🔬', val: '100%', lbl: 'Données sécurisées',       cls: 'lsi-green' },
          ].map((s, i) => (
            <div key={i} className="login-stat-card">
              <div className={`login-stat-icon ${s.cls}`}>{s.icon}</div>
              <div>
                <div className="login-stat-val">{s.val}</div>
                <div className="login-stat-lbl">{s.lbl}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Panneau droit ── */}
      <div className="login-right">
        <div className="login-form-wrap">
          <div className="login-form-title">Connexion</div>
          <p className="login-form-sub">
            Entrez vos identifiants pour accéder<br />à votre espace IUG Health.
          </p>

          {/* Erreur */}
          {error && (
            <div className="login-error">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} autoComplete="on">
            {/* Nom d'utilisateur */}
            <div className="login-field">
              <label className="login-label" htmlFor="username">
                Nom d'utilisateur
              </label>
              <div className="login-input-wrap">
                <span className="login-input-icon">👤</span>
                <input
                  id="username"
                  type="text"
                  className="login-input"
                  placeholder="ex. bah.ibrahim"
                  value={username}
                  onChange={(e) => { clearError(); setUsername(e.target.value) }}
                  autoComplete="username"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div className="login-field">
              <label className="login-label" htmlFor="password">
                Mot de passe
              </label>
              <div className="login-input-wrap">
                <span className="login-input-icon">🔒</span>
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  className="login-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { clearError(); setPassword(e.target.value) }}
                  autoComplete="current-password"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowPwd((v) => !v)}
                  tabIndex={-1}
                  title={showPwd ? 'Masquer' : 'Afficher'}
                >
                  {showPwd ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="login-btn"
              disabled={loading || !username.trim() || !password.trim()}
            >
              {loading ? (
                <>
                  <span className="login-spinner" />
                  Connexion en cours…
                </>
              ) : (
                <>
                  <span>→</span>
                  Se connecter
                </>
              )}
            </button>
          </form>

          {/* Comptes démo */}
          <div className="login-demo-sep">
            <span>CONNEXION RAPIDE — DÉMO</span>
          </div>

          <div className="login-demo-accounts">
            {DEMO_ACCOUNTS.map((acc, i) => (
              <button
                key={i}
                className="login-demo-btn"
                onClick={() => fillDemo(acc)}
                disabled={loading}
                type="button"
              >
                <div
                  className="login-demo-avatar"
                  style={{ background: acc.color + '22', color: acc.color }}
                >
                  {acc.initials}
                </div>
                <div>
                  <div className="login-demo-name">{acc.nom}</div>
                  <div className="login-demo-role">{acc.role} · {acc.username}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="login-footer">
            IUG Health · Système de gestion médicale<br />
            © {new Date().getFullYear()} — Institut Universitaire de Gestion
          </div>
        </div>
      </div>
    </div>
  )
}