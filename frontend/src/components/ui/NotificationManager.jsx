import { useState, useEffect, useCallback } from 'react'
import { useApp } from '../../context/Appcontext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function NotificationManager({ isOpen, onClose }) {
  const { consultations, examens, updateExamen } = useApp()
  const { user } = useAuth()
  const [alerts, setAlerts] = useState([])

  const buildAlerts = useCallback(() => {
    if (!user) return
    const now = new Date()
    const newAlerts = []

    // 1. Consultations imminentes (medecin)
    if (user.role === 'medecin') {
      const upcoming = consultations.filter(c => {
        if (c.statut !== 'Planifiée') return false
        const startTime = new Date(`${c.date}T${c.heure || '00:00'}`)
        const diffMins = (startTime - now) / 60000
        return diffMins > -10 && diffMins <= 30
      })

      upcoming.forEach(c => {
        const startTime = new Date(`${c.date}T${c.heure || '00:00'}`)
        const diffMins = Math.round((startTime - now) / 60000)
        let timeLabel = diffMins > 0 ? `dans ${diffMins} min` : 'maintenant'

        newAlerts.push({
          id: `cons-${c.id}`,
          type: 'consultation',
          icon: '📋',
          title: 'Consultation imminente',
          message: `${c.patient_nom || 'Patient'} - ${c.heure} (${timeLabel})`,
          time: c.heure,
        })
      })
    }

    // 2. Resultats d'examens non vus (medecin)
    if (user.role === 'medecin') {
      const newResults = examens.filter(e =>
        (e.statut === 'Terminé' || e.statut === 'Résultat disponible') &&
        !e.vu_par_medecin
      )

      newResults.forEach(e => {
        newAlerts.push({
          id: `exam-${e.id}`,
          type: 'examen',
          icon: '🧪',
          title: 'Resultat disponible',
          message: `${e.nom || 'Examen'} - ${e.patient_nom || 'Patient'}`,
          examenId: e.id,
        })
      })
    }

    // 3. Examens en attente (laborantin)
    if (user.role === 'laborantin') {
      const pending = examens.filter(e => e.statut === 'En attente')
      pending.forEach(e => {
        newAlerts.push({
          id: `labo-${e.id}`,
          type: 'examen',
          icon: '🔬',
          title: 'Examen en attente',
          message: `${e.nom || 'Examen'} - ${e.patient_nom || 'Patient'}`,
        })
      })
    }

    setAlerts(newAlerts)
  }, [consultations, examens, user])

  // Rebuild alerts every 10 seconds and on data change
  useEffect(() => {
    buildAlerts()
    const interval = setInterval(buildAlerts, 10000)
    return () => clearInterval(interval)
  }, [buildAlerts])

  const dismissAlert = (alert) => {
    if (alert.type === 'examen' && alert.examenId) {
      updateExamen(alert.examenId, { vu_par_medecin: true })
    }
    setAlerts(prev => prev.filter(a => a.id !== alert.id))
  }

  const dismissAll = () => {
    // Mark all examen alerts as seen
    alerts.filter(a => a.examenId).forEach(a => {
      updateExamen(a.examenId, { vu_par_medecin: true })
    })
    setAlerts([])
  }

  // Expose count for badge
  NotificationManager.alertCount = alerts.length

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="notif-backdrop" onClick={onClose} />

      {/* Panel */}
      <div className="notif-panel">
        <div className="notif-panel-header">
          <span className="notif-panel-title">
            🔔 Notifications {alerts.length > 0 && <span className="notif-count-badge">{alerts.length}</span>}
          </span>
          {alerts.length > 0 && (
            <button className="notif-clear-btn" onClick={dismissAll}>
              Tout effacer
            </button>
          )}
        </div>

        <div className="notif-panel-body">
          {alerts.length === 0 ? (
            <div className="notif-empty">
              <span className="notif-empty-icon">✅</span>
              <p>Aucune notification</p>
              <p className="notif-empty-sub">Vous êtes à jour !</p>
            </div>
          ) : (
            alerts.map(alert => (
              <div key={alert.id} className={`notif-row ${alert.type}`}>
                <span className="notif-row-icon">{alert.icon}</span>
                <div className="notif-row-content">
                  <div className="notif-row-title">{alert.title}</div>
                  <div className="notif-row-message">{alert.message}</div>
                </div>
                <button className="notif-row-dismiss" onClick={() => dismissAlert(alert)}>×</button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
