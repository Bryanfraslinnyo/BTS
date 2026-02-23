import { useState, useEffect } from 'react'
import { useApp } from '../context/Appcontext.jsx'
import Card, { CardHeader, CardBody } from '../components/ui/Card.jsx'
import Modal from '../components/ui/Modal.jsx'
import Avatar from '../components/ui/Avatar.jsx'
import Badge from '../components/ui/Badge.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import ConsultationForm from '../components/forms/ConsultationForm.jsx'
import { formatDate, formatDateTime } from '../utils/helpers.js'
import RapportGenerator from '../components/RapportGenerator.jsx'

export default function ConsultationDetailPage() {
  const { patients, consultations, examens, updateConsultation, navigate, pageParams, forceReload } = useApp()
  const [editMode, setEditMode] = useState(false)
  const [showRapportModal, setShowRapportModal] = useState(false)
  const [localLoading, setLocalLoading] = useState(false)

  // 🔍 LOGS DE DÉBOGAGE
  console.log('🔍 ConsultationDetailPage - Rendu')
  console.log('🔍 pageParams:', pageParams)
  console.log('🔍 Toutes les consultations:', consultations)
  console.log('🔍 ID recherché:', pageParams?.id)
  console.log('🔍 Type de ID:', typeof pageParams?.id)

  // Trouver la consultation avec conversion d'ID si nécessaire
  const consult = consultations.find((c) => {
    // Comparaison flexible (string vs number)
    return String(c.id) === String(pageParams?.id)
  })

  console.log('🔍 Consultation trouvée:', consult)

  // Effet pour forcer le rechargement si la consultation n'est pas trouvée
  useEffect(() => {
    if (!consult && pageParams?.id && !localLoading) {
      console.log('🔍 Consultation non trouvée, tentative de rechargement...')
      setLocalLoading(true)
      forceReload().finally(() => {
        setLocalLoading(false)
      })
    }
  }, [consult, pageParams?.id, forceReload, localLoading])

  // Vérifier si la consultation existe
  if (!consult) {
    return (
      <div className="page-content">
        <EmptyState 
          icon="❓" 
          title="Consultation introuvable" 
          description={localLoading ? "Chargement en cours..." : "Cette consultation n'existe pas ou a été supprimée."} 
          action={
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-secondary" onClick={() => navigate('consultations')}>
                ← Retour
              </button>
              {!localLoading && (
                <button className="btn btn-primary" onClick={() => forceReload()}>
                  🔄 Réessayer
                </button>
              )}
            </div>
          } 
        />
      </div>
    )
  }

  // Trouver le patient associé
  const patient = patients.find((p) => String(p.id) === String(consult.patient_id))
  const relExams = examens.filter((e) => String(e.consultation_id) === String(consult.id))

  console.log('🔍 Patient trouvé:', patient)
  console.log('🔍 Examens liés:', relExams)

  // Constantes vitales
  const vitals = [
    { label: 'Poids',       value: consult.poids,       unit: 'kg' },
    { label: 'Taille',      value: consult.taille,      unit: 'cm' },
    { label: 'Température', value: consult.temperature, unit: '°C' },
    { label: 'Tension',     value: consult.tension,     unit: 'mmHg' },
    { label: 'Pouls',       value: consult.pouls,       unit: 'bpm' },
    { label: 'SpO₂',        value: consult.saturation,  unit: '%' },
  ].filter((v) => v.value !== null && v.value !== undefined && v.value !== '')

  return (
    <div className="page-content page-enter">
      {/* ── Header avec bouton de rapport ── */}
      <Card className="mb-5">
        <CardBody>
          <div className="flex gap-4 items-center">
            {patient && <Avatar name={`${patient.prenom} ${patient.nom}`} size="lg" color={patient.photo_color} />}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20 }}>
                  {patient ? `${patient.prenom} ${patient.nom}` : 'Patient inconnu'}
                </h2>
                <Badge>{consult.statut}</Badge>
              </div>
              <div className="flex gap-4 flex-wrap" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                <span>📅 {formatDateTime(consult.date, consult.heure)}</span>
                <span>📋 {consult.type}</span>
                <span>🏥 {consult.specialite}</span>
                <span>👨‍⚕️ {consult.medecin}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {patient && (
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('patient-detail', { id: patient.id })}>
                  👤 Dossier patient
                </button>
              )}
              <button className="btn btn-primary btn-sm" onClick={() => setEditMode(true)}>
                ✏️ Modifier
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowRapportModal(true)}>
                📄 Rapport
              </button>
              <button 
                className="btn btn-warning btn-sm" 
                onClick={() => forceReload()}
                style={{ marginLeft: 10 }}
              >
                🔄 Recharger
              </button>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid-2 mb-5">
        {/* Left column */}
        <div>
          <Card className="mb-4">
            <CardHeader title="🩺 Motif de consultation" />
            <CardBody>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                {consult.motif || 'Non renseigné'}
              </p>
            </CardBody>
          </Card>

          {consult.diagnostic && (
            <Card className="mb-4">
              <CardHeader title="✅ Diagnostic" />
              <CardBody>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>{consult.diagnostic}</p>
              </CardBody>
            </Card>
          )}

          {consult.ordonnance && (
            <Card>
              <CardHeader title="💊 Ordonnance" />
              <CardBody>
                <pre style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.9, fontFamily: 'inherit', whiteSpace: 'pre-wrap', background: 'var(--surface-2)', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border)' }}>
                  {consult.ordonnance}
                </pre>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div>
          {vitals.length > 0 && (
            <Card className="mb-4">
              <CardHeader title="📊 Constantes vitales" />
              <div className="card-body" style={{ padding: '14px 18px' }}>
                <div className="vitals-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {vitals.map((v, i) => (
                    <div key={i} className="vital-card" style={{ padding: '10px' }}>
                      <div className="vital-value" style={{ fontSize: 18 }}>{v.value}</div>
                      <div className="vital-unit">{v.unit}</div>
                      <div className="vital-label" style={{ fontSize: 11 }}>{v.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {consult.notes && (
            <Card className="mb-4">
              <CardHeader title="📝 Notes cliniques" />
              <CardBody>
                <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.8 }}>{consult.notes}</p>
              </CardBody>
            </Card>
          )}

          {relExams.length > 0 && (
            <Card>
              <CardHeader title={`🔬 Examens prescrits (${relExams.length})`} />
              <div>
                {relExams.map((e) => (
                  <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderBottom: '1px solid var(--border)' }}>
                    <Badge variant="badge-blue">{e.type}</Badge>
                    <span style={{ fontWeight: 600, fontSize: 13, flex: 1 }}>{e.nom}</span>
                    <Badge>{e.statut}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {!consult.diagnostic && !consult.notes && vitals.length === 0 && relExams.length === 0 && (
            <Card>
              <EmptyState 
                icon="📝" 
                title="Consultation en cours" 
                description="Modifiez cette consultation pour compléter les informations cliniques et le diagnostic." 
                action={
                  <button className="btn btn-primary btn-sm" onClick={() => setEditMode(true)}>
                    ✏️ Compléter
                  </button>
                } 
              />
            </Card>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal show={editMode} onClose={() => setEditMode(false)} title="Modifier la consultation" size="lg">
        <ConsultationForm
          initial={consult}
          patients={patients}
          preselectedPatient={patient}
          onSubmit={async (data) => { 
            await updateConsultation(consult.id, data); 
            setEditMode(false);
            // Recharger après modification
            forceReload();
          }}
          onClose={() => setEditMode(false)}
        />
      </Modal>

      {/* Modal de génération de rapport */}
      <Modal show={showRapportModal} onClose={() => setShowRapportModal(false)} title="Générer un rapport" size="lg">
        <RapportGenerator
          type="consultation"
          data={consult}
          onClose={() => setShowRapportModal(false)}
        />
      </Modal>
    </div>
  )
}