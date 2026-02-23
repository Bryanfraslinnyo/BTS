import { STATUS_BADGE_MAP } from '../../utils/constants.js'

export default function Badge({ children, variant, className = '' }) {
  // Auto-detect variant from status string if not provided
  const cls = variant || STATUS_BADGE_MAP[children] || 'badge-gray'
  return (
    <span className={`badge ${cls} ${className}`}>
      {children}
    </span>
  )
}
