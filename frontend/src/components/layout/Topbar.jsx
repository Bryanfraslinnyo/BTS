import { useState, useEffect, useCallback } from 'react'
import { useApp } from '../../context/Appcontext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { DETAIL_PAGES } from '../../utils/constants.js'
import { getInitials } from '../../utils/helpers.js'
import NotificationManager from '../ui/NotificationManager.jsx'

const PAGE_META = {
  dashboard:            { title: 'Tableau de bord',       sub: null },
  patients:             { title: 'Patients',               sub: 'Gestion des dossiers patients' },
  'patient-detail':     { title: null,                    sub: 'Dossier médical complet' },
  consultations:        { title: 'Consultations',          sub: 'Gestion des consultations médicales' },
  'consultation-detail':{ title: null,                    sub: 'Détail de la consultation' },
  examens:              { title: 'Examens médicaux',       sub: 'Prescriptions & résultats' },
  laborantin:           { title: 'Laboratoire',            sub: 'Gestion et saisie des résultats' },
  stats:                { title: 'Statistiques',           sub: 'Analyses et rapports' },
}

export default function Topbar() {
  const { user, logout } = useAuth()
  const { activePage, pageParams, navigate, patients, stats, consultations, examens } = useApp()
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifCount, setNotifCount] = useState(0)

  // Calculate notification count
  const calcNotifCount = useCallback(() => {
    if (!user) return 0
    let count = 0

    if (user.role === 'medecin') {
      // Upcoming consultations (within 30 min)
      const now = new Date()
      count += consultations.filter(c => {
        if (c.statut !== 'Planifiée') return false
        const startTime = new Date(`${c.date}T${c.heure || '00:00'}`)
        const diffMins = (startTime - now) / 60000
        return diffMins > -10 && diffMins <= 30
      }).length

      // Unseen exam results
      count += examens.filter(e =>
        (e.statut === 'Terminé' || e.statut === 'Résultat disponible') &&
        !e.vu_par_medecin
      ).length
    }

    if (user.role === 'laborantin') {
      count += examens.filter(e => e.statut === 'En attente').length
    }

    return count
  }, [user, consultations, examens])

  useEffect(() => {
    setNotifCount(calcNotifCount())
    const interval = setInterval(() => setNotifCount(calcNotifCount()), 10000)
    return () => clearInterval(interval)
  }, [calcNotifCount])

  const meta    = PAGE_META[activePage] || { title: activePage, sub: null }
  const isDetail = activePage in DETAIL_PAGES
  const parentPage = DETAIL_PAGES[activePage]

  // Dynamic title for detail pages
  let title = meta.title
  if (activePage === 'patient-detail' && pageParams?.id) {
    const p = patients.find((x) => x.id === pageParams.id)
    if (p) title = `${p.prenom} ${p.nom}`
  } else if (activePage === 'consultation-detail') {
    title = 'Consultation'
  }

  // Greeting sub for dashboard
  const sub = activePage === 'dashboard'
    ? `Bonjour, ${user?.nom || 'Utilisateur'} · ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
    : meta.sub

  return (
    <header className="topbar">
      {/* Back button on detail pages */}
      {isDetail && (
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(parentPage)}>
          ← Retour
        </button>
      )}

      {/* Page title */}
      <div className="topbar-title-wrap">
        <div className="topbar-page-title">{title || 'IUG Health'}</div>
        {sub && <div className="topbar-subtitle">{sub}</div>}
      </div>

      {/* Actions */}
      <div className="topbar-actions">
        {/* Bell — notification trigger */}
        <div
          className={`topbar-icon-btn notif-bell ${notifOpen ? 'active' : ''}`}
          title="Notifications"
          onClick={() => setNotifOpen(v => !v)}
          style={{ position: 'relative', cursor: 'pointer' }}
        >
          🔔
          {notifCount > 0 && <span className="notif-badge">{notifCount}</span>}
        </div>

        {/* Notification panel */}
        <NotificationManager isOpen={notifOpen} onClose={() => setNotifOpen(false)} />

        {/* New consultation button */}
        {user?.role !== 'laborantin' && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate('consultations', { openNew: true })}
          >
            + Consultation
          </button>
        )}

        {/* Profile info */}
        <div className="topbar-user-info">
          <div className="profile-avatar" style={{ backgroundColor: user?.photo_color }}>
            {getInitials(user?.nom || 'U')}
          </div>
          <div className="topbar-user-text">
            <span className="profile-name">{user?.nom || 'Utilisateur'}</span>
            <span className="profile-role">{user?.role_label || user?.role}</span>
          </div>
        </div>

        {/* Styled logout button */}
        <button className="topbar-logout-btn" onClick={logout} title="Se déconnecter">
          <span className="logout-icon">⎋</span>
          <span className="logout-label">Déconnexion</span>
        </button>
      </div>
    </header>
  )
}