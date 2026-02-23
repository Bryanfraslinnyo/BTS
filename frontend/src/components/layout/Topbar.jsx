import { useApp } from '../../context/Appcontext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { DETAIL_PAGES } from '../../utils/constants.js'
import { getInitials } from '../../utils/helpers.js'

const PAGE_META = {
  dashboard:            { title: 'Tableau de bord',       sub: null },
  patients:             { title: 'Patients',               sub: 'Gestion des dossiers patients' },
  'patient-detail':     { title: null,                    sub: 'Dossier médical complet' },
  consultations:        { title: 'Consultations',          sub: 'Gestion des consultations médicales' },
  'consultation-detail':{ title: null,                    sub: 'Détail de la consultation' },
  examens:              { title: 'Examens médicaux',       sub: 'Prescriptions & résultats' },
  stats:                { title: 'Statistiques',           sub: 'Analyses et rapports' },
}

export default function Topbar() {
  const { activePage, pageParams, navigate, patients, stats } = useApp()
  const { user, logout } = useAuth()

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
    ? `Bonjour, Dr. Bah · ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
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
        <div className="topbar-icon-btn" title="Notifications">
          🔔
          {stats.plannedConsults > 0 && <div className="notif-dot" />}
        </div>

        {/* Utilisateur connecté */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 4 }}>
            <div
              style={{
                width: 34, height: 34, borderRadius: '50%',
                background: (user.photo_color || '#1565C0') + '22',
                color: user.photo_color || '#1565C0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 12, flexShrink: 0,
              }}
            >
              {getInitials(user.nom)}
            </div>
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                {user.nom.includes('Dr.') ? user.nom : `Dr. ${user.nom}`}
              </div>
              <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{user.role_label}</div>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={logout}
              title="Se déconnecter"
              style={{ marginLeft: 4 }}
            >
              ⎋ Déconnexion
            </button>
          </div>
        )}

        <button
          className="btn btn-primary btn-sm"
          onClick={() => navigate('consultations', { openNew: true })}
        >
          + Consultation
        </button>
      </div>
    </header>
  )
}