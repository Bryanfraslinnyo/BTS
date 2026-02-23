export default function Button({
  children,
  variant = 'primary',
  size = '',
  icon,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  ...rest
}) {
  const sizeClass = size ? `btn-${size}` : ''
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${sizeClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {icon && <span className="btn-icon-slot">{icon}</span>}
      {children}
    </button>
  )
}
