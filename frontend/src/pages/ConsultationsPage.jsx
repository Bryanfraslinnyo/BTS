import { useState, useMemo } from 'react'
import { useApp } from '../context/Appcontext.jsx'
import Card, { CardHeader } from '../components/ui/Card.jsx'
import Modal from '../components/ui/Modal.jsx'
import ConfirmModal from '../components/ui/ConfirmModal.jsx'
import Avatar from '../components/ui/Avatar.jsx'
import Badge from '../components/ui/Badge.jsx'
import ConsultationForm from '../components/forms/ConsultationForm.jsx'
import { formatDate, calcAge } from '../utils/helpers.js'
import { STATUTS_CONSULTATION } from '../utils/constants.js'

export default function ConsultationsPage() {
  const { patients, consultations, addConsultations, updateConsultation, deleteConsultation, navigate, pageParams } = useApp()

  const [search,     setSearch]     = useState('')
  const [filterS,    setFilterS]    = useState('Tous')
  const [filterDate, setFilterDate] = useState('')
  const [showForm,   setShowForm]   = useState(!!pageParams?.openNew)
  const [editTarget, setEditTarget] = useState(null)
  const [delTarget,  setDelTarget]  = useState(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return consultations
      .filter((c) => {
        const p    = patients.find((x) => x.id === c.patient_id)
        const name = p ? `${p.prenom} ${p.nom}`.toLowerCase() : ''
        const matchQ = !q || name.includes(q) || c.motif?.toLowerCase().includes(q) || c.medecin?.toLowerCase().includes(q) || c.specialite?.toLowerCase().includes(q)
        const matchS = filterS === 'Tous' || c.statut === filterS
        const matchD = !filterDate || c.date === filterDate
        return matchQ && matchS && matchD
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [consultations, patients, search, filterS, filterDate])

  return (
    <div className="page-content page-enter">
      {/* Toolbar */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="search-wrap flex-1" style={{ minWidth: 200 }}>
          <span className="search-icon">🔍</span>
          <input className="form-control" placeholder="Patient, motif, médecin..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="form-control" style={{ width: 155 }} value={filterS} onChange={(e) => setFilterS(e.target.value)}>
          <option>Tous</option>
          {STATUTS_CONSULTATION.map((s) => <option key={s}>{s}</option>)}
        </select>
        <input type="date" className="form-control" style={{ width: 166 }} value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Nouvelle consultation</button>
      </div>

      <Card>
        <CardHeader title="Consultations" subtitle={`${filtered.length} résultat${filtered.length !== 1 ? 's' : ''}`} />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Patient</th><th>Date & Heure</th><th>Type</th>
                <th>Spécialité</th><th>Médecin</th><th>Motif</th>
                <th>Statut</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>Aucune consultation trouvée</td></tr>
              ) : (
                filtered.map((c) => {
                  const p = patients.find((x) => x.id === c.patient_id)
                  return (
                    <tr key={c.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <Avatar name={p ? `${p.prenom} ${p.nom}` : '?'} size="sm" color={p?.photo_color || '#1565C0'} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{p ? `${p.prenom} ${p.nom}` : 'Inconnu'}</div>
                            {p && <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{calcAge(p.dob)} ans</div>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{formatDate(c.date)}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.heure}</div>
                      </td>
                      <td><Badge variant="badge-blue" className="text-xs">{c.type}</Badge></td>
                      <td style={{ fontSize: 12.5 }}>{c.specialite}</td>
                      <td style={{ fontSize: 12.5 }}>{c.medecin}</td>
                      <td style={{ maxWidth: 160, fontSize: 12.5, color: 'var(--text-secondary)' }}>
                        {c.motif?.slice(0, 44)}{c.motif?.length > 44 ? '…' : ''}
                      </td>
                      <td><Badge>{c.statut}</Badge></td>
                      <td>
                        <div className="table-actions">
                          <button className="action-btn action-btn-view" title="Voir détail" onClick={() => navigate('consultation-detail', { id: c.id })}>👁</button>
                          <button className="action-btn action-btn-edit" title="Modifier" onClick={() => setEditTarget(c)}>✏️</button>
                          <button className="action-btn action-btn-delete" title="Supprimer" onClick={() => setDelTarget(c)}>🗑</button>
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

      {/* Add */}
      <Modal show={showForm} onClose={() => setShowForm(false)} title="Nouvelle consultation" size="lg">
        <ConsultationForm patients={patients} onSubmit={(d) => { addConsultations(d); setShowForm(false) }} onClose={() => setShowForm(false)} />
      </Modal>

      {/* Edit */}
      <Modal show={!!editTarget} onClose={() => setEditTarget(null)} title="Modifier la consultation" size="lg">
        {editTarget && (
          <ConsultationForm
            initial={editTarget}
            patients={patients}
            preselectedPatient={patients.find((p) => p.id === editTarget.patient_id)}
            onSubmit={(d) => { updateConsultation(editTarget.id, d); setEditTarget(null) }}
            onClose={() => setEditTarget(null)}
          />
        )}
      </Modal>

      {/* Delete */}
      <ConfirmModal
        show={!!delTarget}
        onClose={() => setDelTarget(null)}
        onConfirm={() => deleteConsultation(delTarget.id)}
        title="Supprimer la consultation"
        message="Êtes-vous sûr de vouloir supprimer cette consultation ? Les examens liés seront également supprimés."
      />
    </div>
  )
}
