import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useErrorToast, ErrorToastContainer } from '../components/ui/ErrorToast.jsx'

const AppContext = createContext(null)
const API_URL = '/api'

async function apiFetch(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `HTTP ${response.status}`)
  }
  return response.json()
}

export function AppProvider({ children }) {
  const [patients, setPatients] = useState([])
  const [consultations, setConsultations] = useState([])
  const [examens, setExamens] = useState([])
  const [medecins, setMedecins] = useState([])
  const [loading, setLoading] = useState(true)
  const [activePage, setActivePage] = useState('dashboard')
  const [pageParams, setPageParams] = useState({})
  const { errors, showError, dismissError } = useErrorToast()

  // Fonction d'extraction des données
  const extractData = useCallback((response) => {
    if (Array.isArray(response)) return response
    if (response && response.data) return response.data
    if (response && response.items) return response.items
    return []
  }, [])

  // Fonction de chargement des données
  const loadData = useCallback(async () => {
    try {
      console.log('🔄 Chargement des données...')
      
      const [patientsRes, consultsRes, examensRes, medecinsRes] = await Promise.all([
        apiFetch('/patients/'),
        apiFetch('/consultations/'),
        apiFetch('/examens/'),
        apiFetch('/medecins/'),
      ])
      
      console.log('📥 Réponse consultations brute:', consultsRes)
      
      const consultationsData = extractData(consultsRes)
      
      // 🔍 Vérifier que les constantes vitales sont présentes
      if (consultationsData.length > 0) {
        console.log('📥 Première consultation:', consultationsData[0])
        console.log('📥 Champs disponibles:', Object.keys(consultationsData[0]))
        console.log('📥 Constantes vitales:', {
          poids: consultationsData[0].poids,
          taille: consultationsData[0].taille,
          temperature: consultationsData[0].temperature,
          pouls: consultationsData[0].pouls,
          saturation: consultationsData[0].saturation,
          tension: consultationsData[0].tension,
          notes: consultationsData[0].notes
        })
      }
      
      setPatients(extractData(patientsRes))
      setConsultations(consultationsData)
      setExamens(extractData(examensRes))
      setMedecins(extractData(medecinsRes))
      
      console.log('✅ Données chargées avec succès')
    } catch (err) {
      console.error('❌ Erreur chargement:', err)
    }
  }, [extractData])

  // Force reload avec gestion du loading
  const forceReload = useCallback(async () => {
    console.log('🔄 Force reload...')
    setLoading(true)
    await loadData()
    setLoading(false)
  }, [loadData])

  // Chargement initial
  useEffect(() => {
    const initialLoad = async () => {
      console.log('🔄 Chargement initial...')
      setLoading(true)
      await loadData()
      setLoading(false)
    }
    initialLoad()
  }, [loadData])

  const navigate = useCallback((page, params = {}) => {
    setActivePage(page)
    setPageParams(params)
  }, [])

  const getMedecin = useCallback((id) => {
    return medecins.find(m => m.id === id) || null
  }, [medecins])

  const addPatient = useCallback(async (data) => {
    try {
      const result = await apiFetch('/patients/', { method: 'POST', body: JSON.stringify(data) })
      setPatients((prev) => [...prev, result])
      return result
    } catch (err) {
      showError(err.message, 'Impossible de creer le patient')
      throw err
    }
  }, [showError])

  const updatePatient = useCallback(async (id, data) => {
    try {
      const result = await apiFetch(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) })
      setPatients((prev) => prev.map((p) => (p.id === id ? result : p)))
      return result
    } catch (err) {
      showError(err.message, 'Impossible de modifier le patient')
      throw err
    }
  }, [showError])

  const deletePatient = useCallback(async (id) => {
    try {
      await apiFetch(`/patients/${id}`, { method: 'DELETE' })
      setPatients((prev) => prev.filter((p) => p.id !== id))
      setConsultations((prev) => prev.filter((c) => c.patient_id !== id))
      setExamens((prev) => prev.filter((e) => e.patient_id !== id))
    } catch (err) {
      showError(err.message, 'Impossible de supprimer le patient')
      throw err
    }
  }, [showError])

  const getPatient = useCallback((id) => patients.find((p) => p.id === id), [patients])

  const addConsultations = useCallback(async (data) => {
    try {
      const result = await apiFetch('/consultations/', { 
        method: 'POST', 
        body: JSON.stringify(data) 
      })
      await forceReload()
      return result
    } catch (err) {
      showError(err.message, 'Impossible de creer la consultation')
      throw err
    }
  }, [forceReload, showError])

  const updateConsultation = useCallback(async (id, data) => {
    try {
      const result = await apiFetch(`/consultations/${id}`, { 
        method: 'PUT', 
        body: JSON.stringify(data) 
      })
      await forceReload()
      return result
    } catch (err) {
      showError(err.message, 'Impossible de modifier la consultation')
      throw err
    }
  }, [forceReload, showError])

  const deleteConsultation = useCallback(async (id) => {
    try {
      await apiFetch(`/consultations/${id}`, { method: 'DELETE' })
      await forceReload()
    } catch (err) {
      showError(err.message, 'Impossible de supprimer la consultation')
      throw err
    }
  }, [forceReload, showError])

  const addExamen = useCallback(async (data) => {
    try {
      const result = await apiFetch('/examens/', { method: 'POST', body: JSON.stringify(data) })
      setExamens((prev) => [...prev, result])
      return result
    } catch (err) {
      showError(err.message, 'Impossible de creer l\'examen')
      throw err
    }
  }, [showError])

  const updateExamen = useCallback(async (id, data) => {
    try {
      const result = await apiFetch(`/examens/${id}`, { method: 'PUT', body: JSON.stringify(data) })
      setExamens((prev) => prev.map((e) => (e.id === id ? result : e)))
      return result
    } catch (err) {
      showError(err.message, 'Impossible de modifier l\'examen')
      throw err
    }
  }, [showError])

  const deleteExamen = useCallback(async (id) => {
    try {
      await apiFetch(`/examens/${id}`, { method: 'DELETE' })
      setExamens((prev) => prev.filter((e) => e.id !== id))
    } catch (err) {
      showError(err.message, 'Impossible de supprimer l\'examen')
      throw err
    }
  }, [showError])

  const addMedecin = useCallback(async (data) => {
    const result = await apiFetch('/medecins/', { method: 'POST', body: JSON.stringify(data) })
    setMedecins((prev) => [...prev, result])
    return result
  }, [])

  const updateMedecin = useCallback(async (id, data) => {
    const result = await apiFetch(`/medecins/${id}`, { method: 'PUT', body: JSON.stringify(data) })
    setMedecins((prev) => prev.map((m) => (m.id === id ? result : m)))
    return result
  }, [])

  const deleteMedecin = useCallback(async (id) => {
    await apiFetch(`/medecins/${id}`, { method: 'DELETE' })
    setMedecins((prev) => prev.map((m) => (m.id === id ? { ...m, actif: false } : m)))
  }, [])

  const getPatientConsultations = useCallback(
    (patientId) => consultations.filter((c) => c.patient_id === patientId),
    [consultations]
  )

  const getPatientExamens = useCallback(
    (patientId) => examens.filter((e) => e.patient_id === patientId),
    [examens]
  )

  const getConsultationExamens = useCallback(
    (consultId) => examens.filter((e) => e.consultation_id === consultId),
    [examens]
  )

  // Statistiques
  const today = new Date().toISOString().split('T')[0]
  const todayConsultationsList = consultations.filter((c) => c.date === today)

  const stats = {
    totalPatients: patients.length,
    totalConsultations: consultations.length,
    todayConsultations: todayConsultationsList.length,
    todayConsultationsList: todayConsultationsList,
    pendingExamens: examens.filter((e) => e.statut === 'En attente').length,
    terminatedConsults: consultations.filter((c) => c.statut === 'Terminée').length,
    plannedConsults: consultations.filter((c) => c.statut === 'Planifiée').length,
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh', 
        fontSize: 18, 
        color: '#666' 
      }}>
        Chargement...
      </div>
    )
  }

  return (
    <AppContext.Provider
      value={{
        patients, 
        consultations, 
        examens, 
        stats, 
        activePage, 
        pageParams, 
        navigate,
        addPatient, 
        updatePatient, 
        deletePatient, 
        getPatient, 
        getPatientConsultations, 
        getPatientExamens,
        addConsultations,  // ← Correction: maintenant c'est addConsultations (avec s) qui crée
        updateConsultation, 
        deleteConsultation, 
        getConsultationExamens,
        addExamen, 
        updateExamen, 
        deleteExamen, 
        getMedecin, 
        medecins,
        addMedecin, 
        updateMedecin, 
        deleteMedecin,
        forceReload,
      }}
    >
      {children}
      <ErrorToastContainer errors={errors} onDismiss={dismissError} />
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}