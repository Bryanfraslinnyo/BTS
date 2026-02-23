import { useState, useMemo } from 'react'
import { useApp } from '../context/Appcontext.jsx'
import Card, { CardHeader } from '../components/ui/Card.jsx'
import Modal from '../components/ui/Modal.jsx'
import ConfirmModal from '../components/ui/ConfirmModal.jsx'
import Avatar from '../components/ui/Avatar.jsx'
import Badge from '../components/ui/Badge.jsx'
import ExamenForm from '../components/forms/ExamenForm.jsx'
import { formatDate } from '../utils/helpers.js'
import { STATUTS_EXAMEN } from '../utils/constants.js'

export default function ExamensPage() {
  const { patients, consultations, examens, addExamen, updateExamen, deleteExamen } = useApp()
  const [search,     setSearch]     = useState('')
  const [filterS,    setFilterS]    = useState('Tous')
  const [showForm,   setShowForm]   = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [delTarget,  setDelTarget]  = useState(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return examens
      .filter((e) => {
        const p    = patients.find((x) => x.id === e.patient_id)
        const name = p ? `${p.prenom} ${p.nom}`.toLowerCase() : ''
        const matchQ = !q || name.includes(q) || e.nom?.toLowerCase().includes(q) || e.type?.toLowerCase().includes(q)
        const matchS = filterS === 'Tous' || e.statut === filterS
        return matchQ && matchS
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [examens, patients, search, filterS])

  return (
    <div className="page-content page-enter">
      {/* Toolbar */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="search-wrap flex-1" style={{ minWidth: 200 }}>
          <span className="search-icon">🔍</span>
          <input className="form-control" placeholder="Examen, patient, type..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="form-control" style={{ width: 210 }} value={filterS} onChange={(e) => setFilterS(e.target.value)}>
          <option>Tous</option>
          {STATUTS_EXAMEN.map((s) => <option key={s}>{s}</option>)}
        </select>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Nouvel examen</button>
      </div>

      <Card>
        <CardHeader
          title="Examens médicaux"
          subtitle={`${filtered.length} examen${filtered.length !== 1 ? 's' : ''}`}
        />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Patient</th><th>Date</th><th>Type</th>
                <th>Examen</th><th>Médecin</th><th>Statut</th>
                <th>Résultat</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>Aucun examen trouvé</td></tr>
              ) : (
                filtered.map((e) => {
                  const p = patients.find((x) => x.id === e.patient_id)
                  return (
                    <tr key={e.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <Avatar name={p ? `${p.prenom} ${p.nom}` : '?'} size="sm" color={p?.photo_color || '#1565C0'} />
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{p ? `${p.prenom} ${p.nom}` : 'Inconnu'}</span>
                        </div>
                      </td>
                      <td>{formatDate(e.date)}</td>
                      <td><Badge variant="badge-blue">{e.type}</Badge></td>
                      <td className="td-bold">{e.nom}</td>
                      <td style={{ fontSize: 12.5 }}>{e.medecin}</td>
                      <td><Badge>{e.statut}</Badge></td>
                      <td style={{ fontSize: 11.5, color: 'var(--text-muted)', maxWidth: 180 }}>
                        {e.resultat ? e.resultat.slice(0, 55) + (e.resultat.length > 55 ? '…' : '') : '–'}
                      </td>
                      <td>
                        <div className="table-actions">
                          <button className="action-btn action-btn-edit" title="Modifier" onClick={() => setEditTarget(e)}>✏️</button>
                          <button className="action-btn action-btn-delete" title="Supprimer" onClick={() => setDelTarget(e)}>🗑</button>
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

      <Modal show={showForm} onClose={() => setShowForm(false)} title="Nouvel examen" size="md">
        <ExamenForm patients={patients} consultations={consultations} onSubmit={(d) => { addExamen(d); setShowForm(false) }} onClose={() => setShowForm(false)} />
      </Modal>

      <Modal show={!!editTarget} onClose={() => setEditTarget(null)} title="Modifier l'examen" size="md">
        {editTarget && (
          <ExamenForm
            initial={editTarget}
            patients={patients}
            consultations={consultations}
            preselectedPatient={patients.find((p) => p.id === editTarget.patient_id)}
            onSubmit={(d) => { updateExamen(editTarget.id, d); setEditTarget(null) }}
            onClose={() => setEditTarget(null)}
          />
        )}
      </Modal>

      <ConfirmModal show={!!delTarget} onClose={() => setDelTarget(null)} onConfirm={() => deleteExamen(delTarget.id)} title="Supprimer l'examen" message="Supprimer cet examen définitivement ?" />
    </div>
  )
}
