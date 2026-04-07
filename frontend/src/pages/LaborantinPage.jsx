import { useState, useMemo } from 'react'
import { useApp } from '../context/Appcontext.jsx'
import Card, { CardHeader } from '../components/ui/Card.jsx'
import Modal from '../components/ui/Modal.jsx'
import Avatar from '../components/ui/Avatar.jsx'
import Badge from '../components/ui/Badge.jsx'
import ExamenForm from '../components/forms/ExamenForm.jsx'
import { formatDate } from '../utils/helpers.js'
import { STATUTS_EXAMEN } from '../utils/constants.js'

export default function LaborantinPage() {
  const { patients, consultations, examens, updateExamen } = useApp()
  const [search, setSearch] = useState('')
  const [filterS, setFilterS] = useState('En attente') // Par défaut on voit ce qu'il reste à faire
  const [editTarget, setEditTarget] = useState(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return examens
      .filter((e) => {
        const p = patients.find((x) => x.id === e.patient_id)
        const name = p ? `${p.prenom} ${p.nom}`.toLowerCase() : ''
        const matchQ = !q || name.includes(q) || e.nom?.toLowerCase().includes(q)
        const matchS = filterS === 'Tous' || e.statut === filterS
        return matchQ && matchS
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [examens, patients, search, filterS])

  return (
    <div className="page-content page-enter">
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="search-wrap flex-1" style={{ minWidth: 200 }}>
          <span className="search-icon">🔍</span>
          <input 
            className="form-control" 
            placeholder="Rechercher un examen ou un patient..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
        <select 
          className="form-control" 
          style={{ width: 210 }} 
          value={filterS} 
          onChange={(e) => setFilterS(e.target.value)}
        >
          <option>Tous</option>
          {STATUTS_EXAMEN.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <Card>
        <CardHeader
          title="Gestion des Examens (Laboratoire)"
          subtitle={`${filtered.length} examen(s) à traiter`}
        />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Date prescrite</th>
                <th>Examen</th>
                <th>Type</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                    Aucun examen en attente
                  </td>
                </tr>
              ) : (
                filtered.map((e) => {
                  const p = patients.find((x) => x.id === e.patient_id)
                  return (
                    <tr key={e.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <Avatar name={p ? `${p.prenom} ${p.nom}` : '?'} size="sm" color={p?.photo_color || '#1565C0'} />
                          <span style={{ fontWeight: 600 }}>{p ? `${p.prenom} ${p.nom}` : 'Inconnu'}</span>
                        </div>
                      </td>
                      <td>{formatDate(e.date)}</td>
                      <td className="td-bold">{e.nom}</td>
                      <td><Badge variant="badge-blue">{e.type}</Badge></td>
                      <td><Badge>{e.statut}</Badge></td>
                      <td>
                        <button 
                          className="btn btn-sm btn-primary" 
                          onClick={() => setEditTarget(e)}
                        >
                          {e.statut === 'Résultat disponible' ? 'Modifier résultat' : 'Saisir résultat'}
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal 
        show={!!editTarget} 
        onClose={() => setEditTarget(null)} 
        title="Saisir les résultats de l'examen" 
        size="md"
      >
        {editTarget && (
          <ExamenForm
            initial={editTarget}
            patients={patients}
            consultations={consultations}
            onSubmit={(d) => { 
                // Quand le laborantin soumet, on s'assure que le statut est mis à jour si un résultat est saisi
                const updatedData = { ...d };
                if (d.resultat && d.statut === 'En attente') {
                    updatedData.statut = "Résultat disponible";
                }
                updateExamen(editTarget.id, updatedData); 
                setEditTarget(null); 
            }}
            onClose={() => setEditTarget(null)}
          />
        )}
      </Modal>
    </div>
  )
}
