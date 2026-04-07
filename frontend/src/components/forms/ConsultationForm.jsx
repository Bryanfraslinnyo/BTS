import { useEffect, useState } from 'react'
import Avatar from '../ui/Avatar.jsx'
import Tabs from '../ui/Tabs.jsx'
import { useApp } from '../../context/Appcontext.jsx' 
import { useAuth } from '../../context/AuthContext.jsx'
import PatientSearchInput from './PatientSearchInput.jsx'
import { TYPES_CONSULTATION, SPECIALITES, MEDECINS, STATUTS_CONSULTATION } from '../../utils/constants.js'
import { today, calcAge } from '../../utils/helpers.js'
import MedecinSelect from './MedecinSelect.jsx'

const FORM_TABS = [
  { id: 'info',     label: '📋 Informations' },
  { id: 'clinique', label: '🩺 Examen clinique' },
  { id: 'diag',     label: '💊 Diagnostic & Ordonnance' },
]

const defaultForm = {
  patient_id: '', date: today(), heure: '08:00',
  type: 'Consultation initiale', specialite: 'Médecine Générale',
  medecin_id: null, motif: '', statut: 'Planifiée',
  diagnostic: '', ordonnance: '', notes: '',
  poids: '', taille: '', temperature: '', pouls: '', saturation: '', tension: '',
}

export default function ConsultationForm({ initial = {}, patients, onSubmit, onClose, preselectedPatient }) {
  const [form, setForm]       = useState({ ...defaultForm, ...initial })
  const { medecins } = useApp()
  const { user } = useAuth()
  const [selPatient, setSelP] = useState(
    preselectedPatient ||
    (initial.patient_id ? patients.find((p) => p.id === initial.patient_id) : null)
  )
  const [tab, setTab]   = useState('info')
  const [errors, setErrors] = useState({})
  const [selectedMedecin, setSelectedMedecin] = useState(null)

    useEffect(() => {
    if (initial.medecin_ref_id && medecins && medecins.length > 0) {
      const med = medecins.find(m => m.id === initial.medecin_ref_id)
      setSelectedMedecin(med || null)
    }
  }, [medecins, initial.medecin_ref_id])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!selPatient && !form.patient_id) e.patient = 'Patient requis'
    if (!form.motif.trim()) e.motif = 'Motif requis'
    if (!form.date) e.date = 'Date requise'
    
    // Frontend Date Validation
    const d = new Date(form.date)
    const todayDate = new Date()
    todayDate.setHours(0,0,0,0)
    if (d < todayDate) e.date = 'La date ne peut pas être passée'
    
    setErrors(e)
    return Object.keys(e).length === 0
  }

const handleSubmit = () => {
  if (!validate()) return
  
  // Convertir les champs numériques
  const formData = {
    ...form,
    patient_id: selPatient?.id || form.patient_id,
    // Convertir les strings vides en null pour les champs numériques
    poids: form.poids === '' ? null : parseFloat(form.poids),
    taille: form.taille === '' ? null : parseFloat(form.taille),
    temperature: form.temperature === '' ? null : parseFloat(form.temperature),
    pouls: form.pouls === '' ? null : parseInt(form.pouls, 10),
    saturation: form.saturation === '' ? null : parseFloat(form.saturation),
    
  }
  
  onSubmit(formData)
}

  const isEdit = !!initial.id

  return (
    <>
      <div className="modal-body">
        <Tabs tabs={FORM_TABS} active={tab} onChange={setTab} />

        {/* ── Tab: Informations ── */}
        {tab === 'info' && (
          <div>
            <div className="form-group">
              <label className="form-label">Patient *</label>
              {preselectedPatient ? (
                <div className="patient-preview">
                  <Avatar name={`${preselectedPatient.prenom} ${preselectedPatient.nom}`} size="sm" color={preselectedPatient.photo_color} />
                  <div>
                    <div className="patient-preview-name">{preselectedPatient.prenom} {preselectedPatient.nom}</div>
                    <div className="patient-preview-sub">{preselectedPatient.tel} · {calcAge(preselectedPatient.dob)} ans · Gr. {preselectedPatient.groupe_sanguin}</div>
                  </div>
                </div>
              ) : (
                <PatientSearchInput
                  patients={patients}
                  value={selPatient}
                  onSelect={(p) => { setSelP(p); set('patient_id', p?.id || '') }}
                />
              )}
              {errors.patient && <div className="form-error">{errors.patient}</div>}
            </div>

            <div className="form-grid-2">
              <div className="form-group mb-0">
                <label className="form-label">Date *</label>
                <input type="date" className="form-control" value={form.date} onChange={(e) => set('date', e.target.value)} />
                {errors.date && <div className="form-error">{errors.date}</div>}
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Heure</label>
                <input type="time" className="form-control" value={form.heure} onChange={(e) => set('heure', e.target.value)} />
              </div>
            </div>

            <div className="form-grid-2 mt-4">
              <div className="form-group mb-0">
                <label className="form-label">Type de consultation</label>
                <select className="form-control" value={form.type} onChange={(e) => set('type', e.target.value)}>
                  {TYPES_CONSULTATION.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Spécialité</label>
                <select className="form-control" value={form.specialite} onChange={(e) => set('specialite', e.target.value)}>
                  {SPECIALITES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="form-grid-2 mt-4">
              {user?.role === 'admin' ? (
                <div className="form-group mb-0">
                  <label className="form-label">Médecin</label>
                  <MedecinSelect 
                    value={form.medecin_id}
                    onChange={(m) => {
                      setSelectedMedecin(m)
                      set('medecin_id', m?.id || null)
                    }}
                    disabled={false}
                  />
                </div>
              ) : (
                <div className="form-group mb-0">
                   <label className="form-label">Médecin</label>
                   <input className="form-control" value={user?.nom} disabled />
                </div>
              )}
              <div className="form-group mb-0">
                <label className="form-label">Statut</label>
                <select className="form-control" value={form.statut} onChange={(e) => set('statut', e.target.value)}>
                  {STATUTS_CONSULTATION.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group mt-4">
              <label className="form-label">Motif de consultation *</label>
              <textarea className="form-control" rows={3} value={form.motif} onChange={(e) => set('motif', e.target.value)} placeholder="Décrivez le motif de la consultation..." />
              {errors.motif && <div className="form-error">{errors.motif}</div>}
            </div>
          </div>
        )}

        {/* ── Tab: Examen Clinique ── */}
        {tab === 'clinique' && (
          <div>
            <div className="section-divider">Constantes vitales</div>
            <div className="form-grid-3">
              {[
                { k: 'poids',       l: 'Poids (kg)',       t: 'number', ph: '70',     step: '0.1' },
                { k: 'taille',      l: 'Taille (cm)',      t: 'number', ph: '170',    step: '1' },
                { k: 'temperature', l: 'Température (°C)', t: 'number', ph: '37.0',   step: '0.1' },
                { k: 'pouls',       l: 'Pouls (bpm)',      t: 'number', ph: '72',     step: '1' },
                { k: 'saturation',  l: 'SpO₂ (%)',         t: 'number', ph: '98',     step: '0.1' },
                { k: 'tension',     l: 'Tension (mmHg)',   t: 'text',   ph: '120/80', step: null },
              ].map(({ k, l, t, ph, step }) => (
                <div key={k} className="form-group mb-0">
                  <label className="form-label">{l}</label>
                  <input
                    type={t}
                    step={step}
                    className="form-control"
                    value={form[k]}
                    onChange={(e) => set(k, e.target.value)}
                    placeholder={ph}
                  />
                </div>
              ))}
            </div>

            <div className="form-group mt-4">
              <label className="form-label">Notes cliniques</label>
              <textarea className="form-control" rows={4} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Observations cliniques, antécédents pertinents pour cette consultation..." />
            </div>
          </div>
        )}

        {/* ── Tab: Diagnostic ── */}
        {tab === 'diag' && (
          <div>
            <div className="form-group">
              <label className="form-label">Diagnostic</label>
              <textarea className="form-control" rows={3} value={form.diagnostic} onChange={(e) => set('diagnostic', e.target.value)} placeholder="Diagnostic principal et différentiel..." />
            </div>
            <div className="form-group mb-0">
              <label className="form-label">Ordonnance</label>
              <textarea
                className="form-control"
                rows={6}
                value={form.ordonnance}
                onChange={(e) => set('ordonnance', e.target.value)}
                placeholder={'Médicament 1 – Dosage – Durée\nMédicament 2 – Dosage – Durée\n...'}
                style={{ fontFamily: 'inherit', fontSize: 13 }}
              />
              <div className="form-hint">Un médicament par ligne. Ex: Amoxicilline 500mg – 3cp/j – 7 jours</div>
            </div>
          </div>
        )}
      </div>

      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
        <button className="btn btn-primary" onClick={handleSubmit}>
          {isEdit ? '✓ Enregistrer les modifications' : '+ Créer la consultation'}
        </button>
      </div>
    </>
  )
}
