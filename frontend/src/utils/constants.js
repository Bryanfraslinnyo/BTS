// ══════════════════════════════════════════════════
// IUG HEALTH — App-wide Constants
// ══════════════════════════════════════════════════

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export const SPECIALITES = [
  'Médecine Générale',
  'Cardiologie',
  'Pneumologie',
  'Neurologie',
  'Gynécologie',
  'Pédiatrie',
  'Dermatologie',
  'Ophtalmologie',
  'Kinésithérapie',
  'Odontologie',
  'ORL',
  'Traumatologie',
  'Endocrinologie',
  'Hépato-Gastroentérologie',
]

export const TYPES_CONSULTATION = [
  'Consultation initiale',
  'Consultation de suivi',
  'Urgence',
  'Téléconsultation',
  'Bilan',
  'Consultation pré-opératoire',
]

export const STATUTS_CONSULTATION = ['Planifiée', 'En cours', 'Terminée', 'Annulée']

export const STATUTS_EXAMEN = [
  'En attente',
  "En cours d'analyse",
  'Résultat disponible',
]

export const TYPES_EXAMEN = [
  'Biologie',
  'Imagerie',
  'Cardiologie',
  'Neurologie',
  'Ophtalmologie',
  'Microbiologie',
  'Anatomo-pathologie',
  'Autre',
]

export const MEDECINS = [
  'Dr. Bah Ibrahim',
  'Dr. Sylla Oumou',
  'Dr. Keita Boubacar',
  'Dr. Diallo Aminata',
  'Dr. Condé Souleymane',
  'Dr. Traoré Mariama',
]

export const SEXES = ['Masculin', 'Féminin']

export const AVATAR_COLORS = [
  '#1565C0',
  '#7B1FA2',
  '#2E7D32',
  '#F57C00',
  '#00ACC1',
  '#C62828',
  '#0277BD',
  '#558B2F',
  '#6D4C41',
  '#00695C',
]

/** Chart palette - 10 distinct colors */
export const CHART_PALETTE = [
  '#1565C0',
  '#00ACC1',
  '#2E7D32',
  '#F57C00',
  '#7B1FA2',
  '#42A5F5',
  '#C62828',
  '#0277BD',
  '#558B2F',
  '#6D4C41',
]

/** Status → badge class mapping */
export const STATUS_BADGE_MAP = {
  Terminée:                'badge-green',
  Planifiée:               'badge-blue',
  'En cours':              'badge-cyan',
  Annulée:                 'badge-red',
  'Résultat disponible':   'badge-green',
  "En cours d'analyse":    'badge-cyan',
  'En attente':            'badge-orange',
}

/** Navigation items */
export const NAV_GROUPS = [
  {
    label: 'Principal',
    items: [
      { id: 'dashboard',     label: 'Tableau de bord', icon: '🏠' },
      { id: 'consultations', label: 'Consultations',   icon: '📋' },
      { id: 'patients',      label: 'Patients',         icon: '👥' },
    ],
  },
  {
    label: 'Médical',
    items: [
      { id: 'examens', label: 'Examens',       icon: '🔬' },
      { id: 'laborantin', label: 'Laboratoire',   icon: '🧪' },
      { id: 'stats',   label: 'Statistiques',  icon: '📊' },
      { id: 'medecins', label: 'Médecins',     icon: '👨‍⚕️' },
    ],
  },
]

/** Pages that link to a parent for breadcrumb/back nav */
export const DETAIL_PAGES = {
  'patient-detail':      'patients',
  'consultation-detail': 'consultations',
  'medecin-detail':      'medecins',
}