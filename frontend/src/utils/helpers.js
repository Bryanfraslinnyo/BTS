// ══════════════════════════════════════════════════
// IUG HEALTH — Utility / Helper Functions
// ══════════════════════════════════════════════════

/** Generate a short unique ID */
export function genId() {
  return Math.random().toString(36).substr(2, 9)
}

/** Get today's date as YYYY-MM-DD */
export function today() {
  return new Date().toISOString().split('T')[0]
}

/** Format a date string to French locale */
export function formatDate(d, opts = {}) {
  if (!d) return '–'
  const defaults = { day: '2-digit', month: 'short', year: 'numeric' }
  return new Date(d).toLocaleDateString('fr-FR', { ...defaults, ...opts })
}

/** Format a date + time */
export function formatDateTime(d, h) {
  if (!d) return '–'
  const date = formatDate(d)
  return h ? `${date} à ${h}` : date
}

/** Calculate age from DOB string */
export function calcAge(dob) {
  if (!dob) return '–'
  const diff = Date.now() - new Date(dob).getTime()
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))
}

/** Get initials from a full name */
export function getInitials(name) {
  return (name || '')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/** Compute BMI */
export function calcBMI(poids, taille) {
  if (!poids || !taille) return null
  const bmi = parseInt(poids) / Math.pow(parseInt(taille) / 100, 2)
  return isNaN(bmi) ? null : bmi.toFixed(1)
}

/** BMI status label */
export function bmiStatus(bmi) {
  if (!bmi) return null
  const v = parseFloat(bmi)
  if (v < 18.5) return { label: 'Insuffisance pondérale', status: 'warning' }
  if (v < 25)   return { label: 'Normal', status: 'normal' }
  if (v < 30)   return { label: 'Surpoids', status: 'warning' }
  return { label: 'Obésité', status: 'critical' }
}

/** Vital sign status helper */
export function vitalStatus(type, value) {
  const v = parseFloat(value)
  if (isNaN(v)) return 'normal'
  switch (type) {
    case 'pouls':
      if (v < 60 || v > 100) return 'warning'
      if (v < 50 || v > 120) return 'critical'
      return 'normal'
    case 'saturation':
      if (v < 95) return 'warning'
      if (v < 90) return 'critical'
      return 'normal'
    case 'temperature':
      if (v > 37.5 || v < 36) return 'warning'
      if (v > 39 || v < 35) return 'critical'
      return 'normal'
    default:
      return 'normal'
  }
}

/** Truncate string with ellipsis */
export function truncate(str, max = 50) {
  if (!str) return ''
  return str.length > max ? str.slice(0, max) + '…' : str
}

/** Get month name in French */
export const MONTHS_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

/** Get day name */
export function getDayName(dateStr) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { weekday: 'long' })
}

/** Sort array of objects by date field */
export function sortByDate(arr, field = 'date', asc = false) {
  return [...arr].sort((a, b) => {
    const da = new Date(a[field])
    const db = new Date(b[field])
    return asc ? da - db : db - da
  })
}

/** Group array by a key */
export function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key]
    if (!acc[k]) acc[k] = []
    acc[k].push(item)
    return acc
  }, {})
}