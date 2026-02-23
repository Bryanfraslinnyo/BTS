import { useState, useMemo, useRef, useEffect } from 'react'
import Avatar from '../ui/Avatar.jsx'
import { calcAge } from '../../utils/helpers.js'

export default function PatientSearchInput({ patients, value, onSelect, disabled = false }) {
  const [query, setQuery]   = useState(value ? `${value.prenom} ${value.nom}` : '')
  const [open, setOpen]     = useState(false)
  const containerRef        = useRef(null)

  // Sync query when value changes externally
  useEffect(() => {
    if (value) setQuery(`${value.prenom} ${value.nom}`)
    else setQuery('')
  }, [value])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const results = useMemo(() => {
    if (!query.trim()) return patients.slice(0, 7)
    const q = query.toLowerCase()
    return patients
      .filter(
        (p) =>
          `${p.prenom} ${p.nom}`.toLowerCase().includes(q) ||
          p.tel?.includes(q) ||
          p.email?.toLowerCase().includes(q)
      )
      .slice(0, 7)
  }, [query, patients])

  const handleSelect = (p) => {
    onSelect(p)
    setQuery(`${p.prenom} ${p.nom}`)
    setOpen(false)
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="search-wrap">
        <span className="search-icon">🔍</span>
        <input
          className="form-control"
          value={query}
          placeholder="Rechercher un patient..."
          disabled={disabled}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            if (!e.target.value) onSelect(null)
          }}
          onFocus={() => setOpen(true)}
        />
      </div>

      {open && results.length > 0 && (
        <div className="patient-dropdown">
          {results.map((p) => (
            <div
              key={p.id}
              className="patient-dropdown-item"
              onMouseDown={() => handleSelect(p)}
            >
              <Avatar name={`${p.prenom} ${p.nom}`} size="sm" color={p.photo_color} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                  {p.prenom} {p.nom}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {p.tel} · {calcAge(p.dob)} ans · Gr. {p.groupe_sanguin}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
