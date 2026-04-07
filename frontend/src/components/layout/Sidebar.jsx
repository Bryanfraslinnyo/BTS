import { useApp } from '../../context/Appcontext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { NAV_GROUPS, DETAIL_PAGES } from '../../utils/constants.js'
import { today, getInitials } from '../../utils/helpers.js'

export default function Sidebar() {
  const { activePage, navigate, consultations, stats } = useApp()
  const { user } = useAuth()

  const isActive = (id) =>
    activePage === id || DETAIL_PAGES[activePage] === id

  function getBadge(id) {
    if (id === 'consultations' && stats.todayConsultations.length > 0)
      return `${stats.todayConsultations.length} auj.`
    if (id === 'examens' && stats.pendingExamens.length > 0)
      return `${stats.pendingExamens.length}`
    return null
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">IUG</div>
        <div className="sidebar-logo-text">
          <div className="app-name">IUG HEALTH</div>
          <div className="app-sub">Système de Santé</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV_GROUPS.map((group) => {
          // Filtrage par rôles
          const visibleItems = group.items.filter(item => {
            if (user?.role === 'laborantin') {
              return ['dashboard', 'laborantin'].includes(item.id)
            }
            if (user?.role === 'medecin') {
               return ['dashboard', 'consultations', 'patients', 'examens', 'stats'].includes(item.id)
            }
            return true // admin voit tout
          })

          if (visibleItems.length === 0) return null

          return (
            <div key={group.label}>
              <div className="nav-group-label">{group.label}</div>
              {visibleItems.map((item) => {
                const badge = getBadge(item.id)
                return (
                  <div
                    key={item.id}
                    className={`nav-item ${isActive(item.id) ? 'active' : ''}`}
                    onClick={() => navigate(item.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <span className="nav-item-icon">{item.icon}</span>
                    {item.label}
                    {badge && <span className="nav-badge">{badge}</span>}
                  </div>
                )
              })}
            </div>
          )
        })}
      </nav>

      {/* User */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar" style={{ backgroundColor: user?.photo_color }}>
            {getInitials(user?.nom || 'U')}
          </div>
          <div className="flex-1" style={{ minWidth: 0 }}>
            <div className="sidebar-user-name">{user?.nom || 'Utilisateur'}</div>
            <div className="sidebar-user-role">{user?.role_label || user?.role}</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
