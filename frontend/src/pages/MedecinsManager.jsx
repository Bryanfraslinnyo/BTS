import { useState, useMemo } from 'react'
import { useApp } from '../context/Appcontext.jsx'
import '../css/MedecinsManager.css'

const SPECIALITES = [
  "Médecine Générale", "Cardiologie", "Pneumologie", "Neurologie",
  "Gynécologie", "Pédiatrie", "Dermatologie", "Ophtalmologie",
  "ORL", "Traumatologie", "Endocrinologie", "Hépato-Gastroentérologie","Odontologie",
  "Kinésithérapie",
]

const EMPTY_FORM = {
  nom: '',
  prenom: '',
  specialite: 'Médecine Générale',
  matricule: '',
  tel: '',
  email: null,
  actif: true,
}

export default function MedecinsManager() {
  const { medecins, addMedecin, updateMedecin, deleteMedecin } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSpecialite, setFilterSpecialite] = useState('Toutes')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [deletingId, setDeletingId] = useState(null)

  // Filtrer les médecins
// Filtrer les médecins
const filteredMedecins = useMemo(() => {
  if (!medecins || medecins.length === 0) return []
  
  return medecins.filter(med => {
    const matchSearch = searchTerm === '' || 
      (med.nom && med.nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (med.prenom && med.prenom.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (med.matricule && med.matricule.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchSpecialite = filterSpecialite === 'Toutes' || 
      med.specialite === filterSpecialite
    
    return matchSearch && matchSpecialite
  })
}, [medecins, searchTerm, filterSpecialite])
  // Statistiques
  const stats = useMemo(() => {
    const specialiteCounts = {}
    medecins.forEach(med => {
      specialiteCounts[med.specialite] = (specialiteCounts[med.specialite] || 0) + 1
    })
    return {
      total: medecins.length,
      actifs: medecins.filter(m => m.actif).length,
      specialiteCounts
    }
  }, [medecins])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await updateMedecin(editingId, formData)
      } else {
        await addMedecin(formData)
      }
      resetForm()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde du médecin')
    }
  }

  const handleEdit = (medecin) => {
    setFormData({
      nom: medecin.nom,
      prenom: medecin.prenom,
      specialite: medecin.specialite,
      matricule: medecin.matricule,
      tel: medecin.tel || '',
      email: medecin.email || '',
      actif: medecin.actif,
    })
    setEditingId(medecin.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (deletingId === id) {
      try {
        await deleteMedecin(id)
        setDeletingId(null)
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
        alert('Erreur lors de la suppression du médecin')
      }
    } else {
      setDeletingId(id)
      setTimeout(() => setDeletingId(null), 3000)
    }
  }

  const resetForm = () => {
    setFormData(EMPTY_FORM)
    setEditingId(null)
    setShowForm(false)
  }

  const specialitesDisponibles = ['Toutes', ...SPECIALITES]

  return (
    <div className="medecins-manager">
      {/* Header avec stats */}
      <header className="mm-header">
        <div className="mm-header-content">
          <div className="mm-title-section">
            <h1 className="mm-title">Corps Médical</h1>
            <p className="mm-subtitle">{stats.total} médecins • {stats.actifs} actifs</p>
          </div>
          
          <button 
            className="mm-add-btn"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '✕ Annuler' : '+ Nouveau médecin'}
          </button>
        </div>

        {/* Mini stats */}
        <div className="mm-stats-grid">
          {Object.entries(stats.specialiteCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([spec, count]) => (
              <div key={spec} className="mm-stat-card">
                <span className="mm-stat-value">{count}</span>
                <span className="mm-stat-label">{spec}</span>
              </div>
            ))}
        </div>
      </header>

      {/* Formulaire */}
      {showForm && (
        <div className="mm-form-container">
          <form onSubmit={handleSubmit} className="mm-form">
            <h3 className="mm-form-title">
              {editingId ? 'Modifier le médecin' : 'Nouveau médecin'}
            </h3>
            
            <div className="mm-form-grid">
              <div className="mm-form-group">
                <label>Nom *</label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({...formData, nom: e.target.value})}
                  required
                />
              </div>

              <div className="mm-form-group">
                <label>Prénom *</label>
                <input
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                  required
                />
              </div>

              <div className="mm-form-group">
                <label>Spécialité *</label>
                <select
                  value={formData.specialite}
                  onChange={(e) => setFormData({...formData, specialite: e.target.value})}
                  required
                >
                  {SPECIALITES.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              <div className="mm-form-group">
                <label>Matricule *</label>
                <input
                  type="text"
                  value={formData.matricule}
                  onChange={(e) => setFormData({...formData, matricule: e.target.value})}
                  required
                />
              </div>

              <div className="mm-form-group">
                <label>Téléphone</label>
                <input
                  type="tel"
                  value={formData.tel}
                  onChange={(e) => setFormData({...formData, tel: e.target.value})}
                />
              </div>

              <div className="mm-form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="mm-form-actions">
              <button type="button" onClick={resetForm} className="mm-btn-cancel">
                Annuler
              </button>
              <button type="submit" className="mm-btn-submit">
                {editingId ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtres */}
      <div className="mm-filters">
        <div className="mm-search">
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou matricule..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mm-search-input"
          />
        </div>

        <div className="mm-filter-specialites">
          {specialitesDisponibles.map(spec => (
            <button
              key={spec}
              onClick={() => setFilterSpecialite(spec)}
              className={`mm-filter-chip ${filterSpecialite === spec ? 'active' : ''}`}
            >
              {spec}
              {spec !== 'Toutes' && stats.specialiteCounts[spec] && (
                <span className="mm-chip-count">{stats.specialiteCounts[spec]}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Grille de cards */}
      <div className="mm-cards-grid">
        {filteredMedecins.length === 0 ? (
          <div className="mm-empty-state">
            <div className="mm-empty-icon">🔍</div>
            <p className="mm-empty-text">Aucun médecin trouvé</p>
            <p className="mm-empty-hint">Essayez de modifier vos critères de recherche</p>
          </div>
        ) : (
          filteredMedecins.map(medecin => (
            <MedecinCard
              key={medecin.id}
              medecin={medecin}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeleting={deletingId === medecin.id}
            />
          ))
        )}
      </div>
    </div>
  )
}

function MedecinCard({ medecin, onEdit, onDelete, isDeleting }) {
  const getSpecialiteColor = (specialite) => {
    const colors = {
      'Médecine Générale': '#3b82f6',
      'Cardiologie': '#ef4444',
      'Pneumologie': '#06b6d4',
      'Neurologie': '#8b5cf6',
      'Gynécologie': '#ec4899',
      'Pédiatrie': '#f59e0b',
      'Dermatologie': '#84cc16',
      'Ophtalmologie': '#10b981',
      'ORL': '#14b8a6',
      'Traumatologie': '#f97316',
      'Endocrinologie': '#6366f1',
      'Hépato-Gastroentérologie': '#a855f7',
      'Odontologie':'#4e4953',
      'Kinésithérapie':'#460d46',
    }
    return colors[specialite] || '#6b7280'
  }

  const specialiteColor = getSpecialiteColor(medecin.specialite)

  return (
    <div className="mm-card" style={{'--specialite-color': specialiteColor}}>
      <div className="mm-card-header">
        <div className="mm-card-avatar">
          {medecin.prenom.charAt(0).toUpperCase()}{medecin.nom.charAt(0).toUpperCase()}
        </div>
        <div className="mm-card-info">
          <h3 className="mm-card-name">
            Dr. {medecin.prenom} {medecin.nom}
          </h3>
          <span className="mm-card-specialite">{medecin.specialite}</span>
        </div>
      </div>

      <div className="mm-card-details">
        <div className="mm-card-detail">
          <span className="mm-detail-icon">MAT</span>
          <span className="mm-detail-text">{medecin.matricule}</span>
        </div>
        
        {medecin.tel && (
          <div className="mm-card-detail">
            <span className="mm-detail-icon">📞</span>
            <span className="mm-detail-text">{medecin.tel}</span>
          </div>
        )}
        
        {medecin.email && (
          <div className="mm-card-detail">
            <span className="mm-detail-icon">✉️</span>
            <span className="mm-detail-text">{medecin.email}</span>
          </div>
        )}
      </div>

      <div className="mm-card-actions">
        <button 
          onClick={() => onEdit(medecin)}
          className="mm-card-btn mm-btn-edit"
          title="Modifier"
        >
          ✏️ Modifier
        </button>
        <button 
          onClick={() => onDelete(medecin.id)}
          className={`mm-card-btn mm-btn-delete ${isDeleting ? 'confirm' : ''}`}
          title={isDeleting ? 'Cliquer pour confirmer' : 'Supprimer'}
        >
          {isDeleting ? '⚠️ Confirmer ?' : '🗑️ Supprimer'}
        </button>
      </div>

      {!medecin.actif && (
        <div className="mm-card-inactive-badge">Inactif</div>
      )}
    </div>
  )
}