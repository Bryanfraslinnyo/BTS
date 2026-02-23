import { useApp } from '../../context/Appcontext.jsx'
import { NAV_GROUPS, DETAIL_PAGES } from '../../utils/constants.js'
import { today } from '../../utils/helpers.js'

export default function Sidebar() {
  const { activePage, navigate, consultations, stats } = useApp()

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
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <div className="nav-group-label">{group.label}</div>
            {group.items.map((item) => {
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
        ))}
      </nav>

      {/* User */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">BI</div>
          <div className="flex-1" style={{ minWidth: 0 }}>
            <div className="sidebar-user-name">Dr. Bah Ibrahim</div>
            <div className="sidebar-user-role">Médecin Chef · Cardio</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
