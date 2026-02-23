import { useState, useMemo } from 'react'
import { useApp } from '../context/Appcontext.jsx'
import Card, { CardHeader } from '../components/ui/Card.jsx'
import Modal from '../components/ui/Modal.jsx'
import ConfirmModal from '../components/ui/ConfirmModal.jsx'
import Avatar from '../components/ui/Avatar.jsx'
import Badge from '../components/ui/Badge.jsx'
import PatientForm from '../components/forms/PatientForm.jsx'
import { formatDate, calcAge } from '../utils/helpers.js'

export default function PatientsPage() {
  const { patients, consultations, medecins, addPatient, updatePatient, deletePatient, navigate } = useApp()
  const [search,     setSearch]     = useState('')
  const [showForm,   setShowForm]   = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [delTarget,  setDelTarget]  = useState(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return patients.filter((p) =>
      `${p.prenom} ${p.nom}`.toLowerCase().includes(q) ||
      p.tel?.includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.groupe_sanguin?.toLowerCase().includes(q)
    )
  }, [patients, search])

  // Vérifier si les médecins sont chargés
const medecinsLoaded = medecins !== undefined && medecins !== null

  return (
    <div className="page-content page-enter">
      {/* Toolbar */}
      <div className="flex gap-3 items-center mb-5">
        <div className="search-wrap flex-1">
          <span className="search-icon">🔍</span>
          <input className="form-control" placeholder="Rechercher par nom, téléphone, email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowForm(true)}
          disabled={!medecinsLoaded}  // Désactiver si médecins pas chargés
        >
          {medecinsLoaded ? '+ Nouveau patient' : 'Chargement...'}
        </button>
      </div>

      <Card>
        <CardHeader title="Liste des patients" subtitle={`${filtered.length} patient${filtered.length !== 1 ? 's' : ''}`} />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Date de naissance</th>
                <th>Téléphone</th>
                <th>Groupe sanguin</th>
                <th>Médecin référent</th>
                <th>Consultations</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>Aucun patient trouvé</td></tr>
              ) : (
                filtered.map((p) => {
                  const nbC = consultations.filter((c) => c.patient_id === p.id).length
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar name={`${p.prenom} ${p.nom}`} size="sm" color={p.photo_color} />
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.prenom} {p.nom}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.sexe}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {formatDate(p.dob)}
                        {p.dob && <span style={{ color: 'var(--text-muted)', fontSize: 11, marginLeft: 6 }}>({calcAge(p.dob)} ans)</span>}
                      </td>
                      <td className="td-bold">{p.tel || '–'}</td>
                      <td><Badge variant="badge-blue">{p.groupe_sanguin}</Badge></td>
                      <td style={{ fontSize: 12.5 }}>{p.medecin_ref}</td>
                      <td><Badge variant="badge-cyan">{nbC} consult{nbC !== 1 ? 's' : ''}</Badge></td>
                      <td>
                        <div className="table-actions">
                          <button className="action-btn action-btn-view" title="Dossier médical" onClick={() => navigate('patient-detail', { id: p.id })}>👁</button>
                          <button className="action-btn action-btn-edit" title="Modifier" onClick={() => setEditTarget(p)}>✏️</button>
                          <button className="action-btn action-btn-delete" title="Supprimer" onClick={() => setDelTarget(p)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Modal - Ne s'affiche que si les médecins sont chargés */}
      <Modal show={showForm && medecinsLoaded} onClose={() => setShowForm(false)} title="Nouveau patient" size="lg">
        <PatientForm
          onSubmit={(data) => { addPatient(data); setShowForm(false) }}
          onClose={() => setShowForm(false)}
        />
      </Modal>

      {/* Edit Modal - Ne s'affiche que si les médecins sont chargés */}
      <Modal show={!!editTarget && medecinsLoaded} onClose={() => setEditTarget(null)} title="Modifier le patient" size="lg">
        {editTarget && (
          <PatientForm
            initial={editTarget}
            onSubmit={(data) => { updatePatient(editTarget.id, data); setEditTarget(null) }}
            onClose={() => setEditTarget(null)}
          />
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        show={!!delTarget}
        onClose={() => setDelTarget(null)}
        onConfirm={() => deletePatient(delTarget.id)}
        title="Supprimer le patient"
        message={`Êtes-vous sûr de vouloir supprimer ${delTarget?.prenom} ${delTarget?.nom} ? Toutes ses consultations et examens seront également supprimés. Cette action est irréversible.`}
      />
    </div>
  )
}