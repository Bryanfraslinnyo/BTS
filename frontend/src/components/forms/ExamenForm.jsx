import { useState, useMemo, useEffect } from 'react'
import Avatar from '../ui/Avatar.jsx'
import PatientSearchInput from './PatientSearchInput.jsx'
import { TYPES_EXAMEN, STATUTS_EXAMEN, MEDECINS } from '../../utils/constants.js'
import { today, formatDate, calcAge } from '../../utils/helpers.js'
import MedecinSelect from './MedecinSelect.jsx'
import { useApp } from '../../context/Appcontext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const defaultForm = {
  patient_id: '', consultation_id: '', date: today(),
  type: 'Biologie', nom: '', statut: 'En attente',
  resultat: '', medecin_id: null,
}

export default function ExamenForm({ initial = {}, patients, consultations, preselectedPatient, onSubmit, onClose }) {
  const [form, setForm] = useState({ ...defaultForm, ...initial })
  const { medecins } = useApp()
  const { user } = useAuth()
  const [selPatient, setSelP] = useState(
    preselectedPatient ||
    (initial.patient_id ? patients.find((p) => p.id === initial.patient_id) : null)
  )
  const [errors, setErrors] = useState({})

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const relConsults = useMemo(
    () => consultations.filter((c) => c.patient_id === (selPatient?.id || form.patient_id)),
    [consultations, selPatient, form.patient_id]
  )
    const [selectedMedecin, setSelectedMedecin] = useState(null)

    useEffect(() => {
    if (initial.medecin_ref_id && medecins && medecins.length > 0) {
      const med = medecins.find(m => m.id === initial.medecin_ref_id)
      setSelectedMedecin(med || null)
    }
  }, [medecins, initial.medecin_ref_id])

  const validate = () => {
    const e = {}
    if (!selPatient && !form.patient_id) e.patient = 'Patient requis'
    if (!form.nom.trim()) e.nom = "Nom de l'examen requis"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onSubmit({ ...form, patient_id: selPatient?.id || form.patient_id })
  }

  return (
    <>
      <div className="modal-body">
        <div className="form-group">
          <label className="form-label">Patient *</label>
          {preselectedPatient ? (
            <div className="patient-preview">
              <Avatar name={`${preselectedPatient.prenom} ${preselectedPatient.nom}`} size="sm" color={preselectedPatient.photo_color} />
              <div>
                <div className="patient-preview-name">{preselectedPatient.prenom} {preselectedPatient.nom}</div>
                <div className="patient-preview-sub">{preselectedPatient.tel} · {calcAge(preselectedPatient.dob)} ans</div>
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
          <div className="form-group">
            <label className="form-label">Date</label>
            <input type="date" className="form-control" value={form.date} onChange={(e) => set('date', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Consultation liée</label>
            <select className="form-control" value={form.consultation_id} onChange={(e) => set('consultation_id', e.target.value)}>
              <option value="">— Aucune —</option>
              {relConsults.map((c) => (
                <option key={c.id} value={c.id}>
                  {formatDate(c.date)} – {c.motif?.slice(0, 30)}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Type d'examen</label>
            <select className="form-control" value={form.type} onChange={(e) => set('type', e.target.value)}>
              {TYPES_EXAMEN.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Statut</label>
            <select className="form-control" value={form.statut} onChange={(e) => set('statut', e.target.value)}>
              {STATUTS_EXAMEN.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Nom de l'examen *</label>
          <input className="form-control" value={form.nom} onChange={(e) => set('nom', e.target.value)} placeholder="Ex: NFS, Radiographie thoracique, ECG, HbA1c..." />
          {errors.nom && <div className="form-error">{errors.nom}</div>}
        </div>

        {user?.role === 'admin' && (
          <div className="form-group">
            <label className="form-label">Médecin prescripteur</label>
            <MedecinSelect 
              value={form.medecin_id}
              onChange={(m) => {
                setSelectedMedecin(m)
                set('medecin_id', m?.id || null)
              }}
              disabled={false}
            />
          </div>
        )}

        <div className="form-group mb-0">
          <label className="form-label">Résultats</label>
          <textarea
            className="form-control"
            rows={4}
            value={form.resultat}
            onChange={(e) => set('resultat', e.target.value)}
            placeholder="Résultats de l'examen, valeurs et interprétation..."
          />
        </div>
      </div>

      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
        <button className="btn btn-primary" onClick={handleSubmit}>
          {initial.id ? '✓ Enregistrer' : '+ Créer l\'examen'}
        </button>
      </div>
    </>
  )
}
