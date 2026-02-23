import { useState, useEffect } from 'react'
import Avatar from '../ui/Avatar.jsx'
import { BLOOD_GROUPS, SEXES, AVATAR_COLORS } from '../../utils/constants.js'
import { useApp } from '../../context/Appcontext.jsx' 
import MedecinSelect from './MedecinSelect.jsx'

const defaultForm = {
  nom: '', 
  prenom: '', 
  dob: '', 
  sexe: 'Masculin',
  tel: '', 
  email: '', 
  adresse: '', 
  groupe_sanguin: 'A+',
  allergies: 'Aucune', 
  antecedents: '',
  assurance: '', 
  num_assurance: '',
  photo_color: AVATAR_COLORS[0],
  medecin_ref_id: null
}

export default function PatientForm({ initial = {}, onSubmit, onClose }) {
  const { medecins } = useApp()
  const [form, setForm] = useState({ ...defaultForm, ...initial })
  const [errors, setErrors] = useState({})
  const [selectedMedecin, setSelectedMedecin] = useState(null)

  // Initialiser le médecin sélectionné si on est en mode édition
  useEffect(() => {
    if (initial.medecin_ref_id && medecins && medecins.length > 0) {
      const med = medecins.find(m => m.id === initial.medecin_ref_id)
      setSelectedMedecin(med || null)
    }
  }, [medecins, initial.medecin_ref_id])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.prenom?.trim()) e.prenom = 'Prénom requis'
    if (!form.nom?.trim()) e.nom = 'Nom requis'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onSubmit(form)
  }

  const isEdit = !!initial.id

  return (
    <>
      <div className="modal-body">
        {/* Color picker */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 24, alignItems: 'center' }}>
          <Avatar 
            name={`${form.prenom} ${form.nom}`.trim() || '?'} 
            size="xl" 
            color={form.photo_color} 
          />
          <div>
            <div className="form-label" style={{ marginBottom: 10 }}>Couleur du profil</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {AVATAR_COLORS.map((c) => (
                <div
                  key={c}
                  onClick={() => set('photo_color', c)}
                  style={{
                    width: 26, 
                    height: 26,
                    borderRadius: '50%',
                    background: c,
                    cursor: 'pointer',
                    border: form.photo_color === c ? '3px solid var(--text-primary)' : '3px solid transparent',
                    transition: 'all 0.15s',
                    flexShrink: 0,
                  }}
                  title={c}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="section-divider">Identité</div>
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Prénom *</label>
            <input 
              className="form-control" 
              value={form.prenom || ''} 
              onChange={(e) => set('prenom', e.target.value)} 
              placeholder="Prénom" 
            />
            {errors.prenom && <div className="form-error">{errors.prenom}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Nom *</label>
            <input 
              className="form-control" 
              value={form.nom || ''} 
              onChange={(e) => set('nom', e.target.value)} 
              placeholder="Nom de famille" 
            />
            {errors.nom && <div className="form-error">{errors.nom}</div>}
          </div>
          <div className="form-group mb-0">
            <label className="form-label">Date de naissance</label>
            <input 
              type="date" 
              className="form-control" 
              value={form.dob || ''} 
              onChange={(e) => set('dob', e.target.value)} 
            />
          </div>
          <div className="form-group mb-0">
            <label className="form-label">Sexe</label>
            <select 
              className="form-control" 
              value={form.sexe || 'Masculin'} 
              onChange={(e) => set('sexe', e.target.value)}
            >
              {SEXES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="section-divider mt-5">Contact</div>
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Téléphone</label>
            <input 
              className="form-control" 
              value={form.tel || ''} 
              onChange={(e) => set('tel', e.target.value)} 
              placeholder="+237 000 000 000" 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-control" 
              value={form.email || ''} 
              onChange={(e) => set('email', e.target.value)} 
              placeholder="email@exemple.com" 
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Adresse</label>
          <input 
            className="form-control" 
            value={form.adresse || ''} 
            onChange={(e) => set('adresse', e.target.value)} 
            placeholder="Quartier, Commune, Ville" 
          />
        </div>

        <div className="section-divider mt-5">Informations médicales</div>
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Groupe sanguin</label>
            <select 
              className="form-control" 
              value={form.groupe_sanguin || 'A+'} 
              onChange={(e) => set('groupe_sanguin', e.target.value)}
            >
              {BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Médecin référent</label>
            <MedecinSelect 
              value={form.medecin_ref_id}
              onChange={(m) => {
                setSelectedMedecin(m)
                set('medecin_ref_id', m?.id || null)
              }}
              disabled={false}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Allergies</label>
          <input 
            className="form-control" 
            value={form.allergies || ''} 
            onChange={(e) => set('allergies', e.target.value)} 
            placeholder="Pénicilline, Latex, Aspirine..." 
          />
          <div className="form-hint">Séparer par des virgules. Indiquer "Aucune" si pas d'allergie connue.</div>
        </div>
        <div className="form-group mb-0">
          <label className="form-label">Antécédents médicaux</label>
          <textarea 
            className="form-control" 
            rows={3} 
            value={form.antecedents || ''} 
            onChange={(e) => set('antecedents', e.target.value)} 
            placeholder="Maladies chroniques, chirurgies, antécédents familiaux pertinents..." 
          />
        </div>

        <div className="section-divider mt-5">Assurance</div>
        <div className="form-grid-2">
          <div className="form-group mb-0">
            <label className="form-label">Assureur</label>
            <input 
              className="form-control" 
              value={form.assurance || ''} 
              onChange={(e) => set('assurance', e.target.value)} 
              placeholder="CNSS, Privée, SOTELGUI..." 
            />
          </div>
          <div className="form-group mb-0">
            <label className="form-label">N° police / adhérent</label>
            <input 
              className="form-control" 
              value={form.num_assurance || ''} 
              onChange={(e) => set('num_assurance', e.target.value)} 
              placeholder="Numéro d'assurance" 
            />
          </div>
        </div>
      </div>

      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
        <button className="btn btn-primary" onClick={handleSubmit}>
          {isEdit ? '✓ Enregistrer les modifications' : '+ Ajouter le patient'}
        </button>
      </div>
    </>
  )
}