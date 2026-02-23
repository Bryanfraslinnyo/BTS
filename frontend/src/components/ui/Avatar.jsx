import { getInitials } from '../../utils/helpers.js'

const SIZES = {
  xs:  'avatar-xs',
  sm:  'avatar-sm',
  md:  'avatar-md',
  lg:  'avatar-lg',
  xl:  'avatar-xl',
  '2xl': 'avatar-2xl',
}

export default function Avatar({ name = '', size = 'md', color = '#1565C0', className = '' }) {
  return (
    <div
      className={`avatar ${SIZES[size] || 'avatar-md'} ${className}`}
      style={{ background: color + '22', color }}
    >
      {getInitials(name)}
    </div>
  )
}
