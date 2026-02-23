export default function Card({ children, className = '', hover = false }) {
  return (
    <div className={`card ${hover ? 'card-hover' : ''} ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, actions, className = '' }) {
  return (
    <div className={`card-header ${className}`}>
      <div>
        {title && <div className="card-title">{title}</div>}
        {subtitle && <div className="card-subtitle">{subtitle}</div>}
      </div>
      {actions && <div className="flex gap-3 items-center">{actions}</div>}
    </div>
  )
}

export function CardBody({ children, size = 'md', className = '' }) {
  const padClass = size === 'sm' ? 'card-body-sm' : 'card-body'
  return (
    <div className={`${padClass} ${className}`}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`card-footer ${className}`}>
      {children}
    </div>
  )
}
