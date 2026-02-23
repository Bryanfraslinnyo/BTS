import { useState } from 'react'
import { useApp } from '../context/Appcontext.jsx'
import Card, { CardHeader, CardBody } from '../components/ui/Card.jsx'
import Modal from '../components/ui/Modal.jsx'
import Avatar from '../components/ui/Avatar.jsx'
import Badge from '../components/ui/Badge.jsx'
import Tabs from '../components/ui/Tabs.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import ConsultationForm from '../components/forms/ConsultationForm.jsx'
import ExamenForm from '../components/forms/ExamenForm.jsx'
import { formatDate, calcAge, calcBMI, vitalStatus } from '../utils/helpers.js'
import RapportGenerator from '../components/RapportGenerator.jsx'

const TABS = [
  { id: 'overview',      label: '📋 Dossier médical' },
  { id: 'consultations', label: '🩺 Consultations' },
  { id: 'examens',       label: '🔬 Examens' },
]

export default function PatientDetailPage() {
  const { patients, consultations, examens, addConsultations, addExamen, navigate, pageParams } = useApp()
  const [tab, setTab] = useState('overview')
  const [showConsult, setShowConsult] = useState(false)
  const [showExam, setShowExam] = useState(false)
  const [showRapportModal, setShowRapportModal] = useState(false)

  // Trouver le patient - À L'INTÉRIEUR de la fonction
  const patient = patients.find((p) => p.id === pageParams?.id)
  
  // Vérifier si le patient existe - À L'INTÉRIEUR de la fonction
  if (!patient) {
    return (
      <div className="page-content">
        <EmptyState 
          icon="❓" 
          title="Patient introuvable" 
          description="Ce dossier n'existe pas ou a été supprimé." 
          action={
            <button className="btn btn-primary" onClick={() => navigate('patients')}>
              ← Retour aux patients
            </button>
          } 
        />
      </div>
    )
  }

  // Le reste du code À L'INTÉRIEUR de la fonction
  const pC = [...consultations.filter((c) => c.patient_id === patient.id)].sort((a, b) => new Date(b.date) - new Date(a.date))
  const pE = [...examens.filter((e) => e.patient_id === patient.id)].sort((a, b) => new Date(b.date) - new Date(a.date))
  const last = pC[0]
  const bmi = last ? calcBMI(last.poids, last.taille) : null

  const vitals = last ? [
    { label: 'Poids',       value: last.poids,       unit: 'kg',   type: null,          show: !!last.poids },
    { label: 'Taille',      value: last.taille,      unit: 'cm',   type: null,          show: !!last.taille },
    { label: 'IMC',         value: bmi || '–',        unit: 'kg/m²', type: null,         show: !!bmi },
    { label: 'Tension',     value: last.tension,     unit: 'mmHg', type: null,          show: !!last.tension },
    { label: 'Pouls',       value: last.pouls,       unit: 'bpm',  type: 'pouls',       show: !!last.pouls },
    { label: 'SpO₂',        value: last.saturation,  unit: '%',    type: 'saturation',  show: !!last.saturation },
  ].filter((v) => v.show) : []

  const tabLabels = TABS.map((t) => {
    if (t.id === 'consultations') return { ...t, label: `🩺 Consultations (${pC.length})` }
    if (t.id === 'examens')       return { ...t, label: `🔬 Examens (${pE.length})` }
    return t
  })

  return (
    <div className="page-content page-enter">
      {/* ── Patient Header ── */}
      <Card className="mb-5">
        <CardBody>
          <div className="flex gap-5 items-start">
            <Avatar name={`${patient.prenom} ${patient.nom}`} size="xl" color={patient.photo_color} />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 style={{ fontSize: 22, fontFamily: 'var(--font-display)', fontWeight: 800 }}>{patient.prenom} {patient.nom}</h2>
                <Badge variant={patient.sexe === 'Féminin' ? 'badge-red' : 'badge-blue'}>{patient.sexe}</Badge>
                <Badge variant="badge-gray">Gr. {patient.groupe_sanguin}</Badge>
              </div>
              <div className="flex gap-5 flex-wrap mb-3" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {patient.dob && <span>🎂 {formatDate(patient.dob)} ({calcAge(patient.dob)} ans)</span>}
                {patient.tel && <span>📞 {patient.tel}</span>}
                {patient.email && <span>✉️ {patient.email}</span>}
                {patient.adresse && <span>📍 {patient.adresse}</span>}
              </div>
              <div className="pill-group">
                {patient.allergies && patient.allergies !== 'Aucune' && (
                  <Badge variant="badge-red">⚠️ Allergies: {patient.allergies}</Badge>
                )}
                {patient.antecedents && (
                  <Badge variant="badge-orange">📋 {patient.antecedents.slice(0, 50)}{patient.antecedents.length > 50 ? '…' : ''}</Badge>
                )}
                {patient.assurance && (
                  <Badge variant="badge-gray">🛡️ {patient.assurance} · {patient.num_assurance}</Badge>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button className="btn btn-primary" onClick={() => setShowConsult(true)}>+ Nouvelle consultation</button>
              <button className="btn btn-secondary" onClick={() => setShowExam(true)}>+ Nouvel examen</button>
              <button className="btn btn-secondary" onClick={() => setShowRapportModal(true)}>
                📄 Générer fiche patient
              </button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ── Last Vitals ── */}
      {vitals.length > 0 && (
        <div className="mb-5">
          <div className="section-divider">
            Dernières constantes
            <span style={{ fontSize: 11, fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--text-muted)' }}>
              (consultation du {formatDate(last.date)})
            </span>
          </div>
          <div className="vitals-grid">
            {vitals.map((v, i) => {
              const status = v.type ? vitalStatus(v.type, v.value) : 'normal'
              return (
                <div key={i} className="vital-card">
                  <div className="vital-value">{v.value}</div>
                  <div className="vital-unit">{v.unit}</div>
                  <div className="vital-label">{v.label}</div>
                  <div className={`vital-status ${status}`}>
                    {status === 'normal' ? '✓ Normal' : status === 'warning' ? '⚠ Attention' : '🚨 Critique'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <Tabs tabs={tabLabels} active={tab} onChange={setTab} />

      {/* ── Tab: Overview ── */}
      {tab === 'overview' && (
        <div className="grid-2">
          <Card>
            <CardHeader title="Informations personnelles" />
            <CardBody>
              <div className="info-grid">
                {[
                  ['Prénom', patient.prenom],
                  ['Nom', patient.nom],
                  ['Date de naissance', formatDate(patient.dob)],
                  ['Âge', patient.dob ? `${calcAge(patient.dob)} ans` : '–'],
                  ['Sexe', patient.sexe],
                  ['Groupe sanguin', patient.groupe_sanguin],
                  ['Téléphone', patient.tel || '–'],
                  ['Email', patient.email || '–'],
                  ['Adresse', patient.adresse || '–'],
                  ['Médecin référent', patient.medecin_ref],
                ].map(([l, v], i) => (
                  <div key={i} className="info-item">
                    <div className="info-label">{l}</div>
                    <div className="info-value">{v}</div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <div>
            <Card className="mb-4">
              <CardHeader title="⚠️ Allergies" />
              <CardBody>
                <p style={{ fontSize: 14, fontWeight: 600, color: patient.allergies && patient.allergies !== 'Aucune' ? 'var(--red-700)' : 'var(--green-700)' }}>
                  {patient.allergies || 'Aucune allergie connue'}
                </p>
              </CardBody>
            </Card>
            <Card className="mb-4">
              <CardHeader title="📋 Antécédents médicaux" />
              <CardBody>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {patient.antecedents || 'Aucun antécédent notable'}
                </p>
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="🛡️ Assurance" />
              <CardBody>
                <div className="info-label" style={{ marginBottom: 4 }}>Assureur</div>
                <div className="info-value" style={{ marginBottom: 12 }}>{patient.assurance || '–'}</div>
                <div className="info-label" style={{ marginBottom: 4 }}>N° police / adhérent</div>
                <div className="info-value">{patient.num_assurance || '–'}</div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* ── Tab: Consultations (Timeline) ── */}
      {tab === 'consultations' && (
        pC.length === 0 ? (
          <Card><EmptyState icon="🩺" title="Aucune consultation" description="Ce patient n'a pas encore de consultation enregistrée." action={<button className="btn btn-primary" onClick={() => setShowConsult(true)}>+ Créer une consultation</button>} /></Card>
        ) : (
          <div>
            {pC.map((c, i) => (
              <div key={c.id} className="timeline-item">
                <div className="timeline-track">
                  <div className={`timeline-dot ${c.statut === 'Terminée' ? 'done' : c.statut === 'Urgence' ? 'urgent' : ''}`} />
                  {i < pC.length - 1 && <div className="timeline-line" />}
                </div>
                <div className="timeline-content">
                  <div className="timeline-meta">{formatDate(c.date)} à {c.heure}</div>
                  <div className="timeline-card" onClick={() => navigate('consultation-detail', { id: c.id })}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{c.type}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.specialite} · {c.medecin}</div>
                      </div>
                      <Badge>{c.statut}</Badge>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}><strong>Motif:</strong> {c.motif}</p>
                    {c.diagnostic && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}><strong>Diagnostic:</strong> {c.diagnostic}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ── Tab: Examens ── */}
      {tab === 'examens' && (
        pE.length === 0 ? (
          <Card><EmptyState icon="🔬" title="Aucun examen" description="Aucun examen médical prescrit pour ce patient." action={<button className="btn btn-primary" onClick={() => setShowExam(true)}>+ Prescrire un examen</button>} /></Card>
        ) : (
          <Card>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Date</th><th>Type</th><th>Examen</th><th>Médecin</th><th>Statut</th><th>Résultat</th></tr></thead>
                <tbody>
                  {pE.map((e) => (
                    <tr key={e.id}>
                      <td>{formatDate(e.date)}</td>
                      <td><Badge variant="badge-blue">{e.type}</Badge></td>
                      <td className="td-bold">{e.nom}</td>
                      <td style={{ fontSize: 12 }}>{e.medecin}</td>
                      <td><Badge>{e.statut}</Badge></td>
                      <td style={{ fontSize: 11.5, color: 'var(--text-muted)', maxWidth: 200, whiteSpace: 'pre-wrap' }}>
                        {e.resultat ? e.resultat.slice(0, 80) + (e.resultat.length > 80 ? '…' : '') : '–'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )
      )}

      {/* Modals */}
      <Modal show={showConsult} onClose={() => setShowConsult(false)} title="Nouvelle consultation" size="lg">
        <ConsultationForm
          patients={[patient]}
          preselectedPatient={patient}
          onSubmit={(data) => { addConsultations(data); setShowConsult(false) }}
          onClose={() => setShowConsult(false)}
        />
      </Modal>

      <Modal show={showExam} onClose={() => setShowExam(false)} title="Nouvel examen" size="md">
        <ExamenForm
          patients={[patient]}
          consultations={consultations}
          preselectedPatient={patient}
          onSubmit={(data) => { addExamen(data); setShowExam(false) }}
          onClose={() => setShowExam(false)}
        />
      </Modal>

      {/* Modal de génération de rapport */}
      <Modal show={showRapportModal} onClose={() => setShowRapportModal(false)} title="Générer un rapport" size="lg">
        <RapportGenerator
          type="patient"
          data={patient}
          onClose={() => setShowRapportModal(false)}
        />
      </Modal>
    </div>
  )
}