export default function StatCard({ icon, label, value, trend, trendDir = 'up', colorClass = 'stat-icon-blue' }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${colorClass}`}>{icon}</div>
      <div className="flex-1">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {trend && (
          <div className={`stat-trend ${trendDir}`}>
            {trendDir === 'up' ? '↑' : trendDir === 'down' ? '↓' : '→'} {trend}
          </div>
        )}
      </div>
    </div>
  )
}
