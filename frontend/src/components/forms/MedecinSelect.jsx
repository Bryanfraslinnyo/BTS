import { useState, useEffect } from 'react'
import { useApp } from '../../context/Appcontext.jsx' 

export default function MedecinSelect({ value, onChange, disabled = false }) {
  const { medecins } = useApp()
  const [selectedId, setSelectedId] = useState(value || '')

  useEffect(() => {
    setSelectedId(value || '')
  }, [value])

  const handleChange = (e) => {
    const id = e.target.value
    setSelectedId(id)
    if (id === '') {
      onChange(null)
    } else {
      const selectedMedecin = medecins?.find(m => m.id === parseInt(id))
      onChange(selectedMedecin || null)
    }
  }

  // Vérifier si les médecins sont chargés
  const isLoading = !medecins || medecins.length === 0

  return (
    <select 
      className="form-control"
      value={selectedId || ''}
      onChange={handleChange}
      disabled={disabled || isLoading}
    >
      <option value="">
        {isLoading ? 'Chargement des médecins...' : 'Sélectionner un médecin référent...'}
      </option>
      {medecins && medecins.map(medecin => (
        <option key={medecin.id} value={medecin.id}>
          Dr. {medecin.prenom} {medecin.nom} - {medecin.specialite}
        </option>
      ))}
    </select>
  )
}