import { useState, useEffect, useCallback } from 'react'

/**
 * Hook pour gerer les toasts d'erreur
 * Usage: const { errors, showError, dismissError } = useErrorToast()
 */
export function useErrorToast() {
  const [errors, setErrors] = useState([])

  const showError = useCallback((message, title = 'Erreur') => {
    const id = Date.now() + Math.random()
    setErrors(prev => [...prev, { id, title, message }])
    
    // Auto-dismiss apres 6 secondes
    setTimeout(() => {
      setErrors(prev => prev.filter(e => e.id !== id))
    }, 6000)
  }, [])

  const dismissError = useCallback((id) => {
    setErrors(prev => prev.filter(e => e.id !== id))
  }, [])

  return { errors, showError, dismissError }
}

/**
 * Composant d'affichage des toasts d'erreur
 */
export function ErrorToastContainer({ errors, onDismiss }) {
  if (!errors || errors.length === 0) return null

  return (
    <div className="error-toast-container">
      {errors.map(err => (
        <div key={err.id} className="error-toast">
          <span className="error-toast-icon">⚠️</span>
          <div className="error-toast-content">
            <div className="error-toast-title">{err.title}</div>
            <div className="error-toast-message">{err.message}</div>
          </div>
          <button className="error-toast-close" onClick={() => onDismiss(err.id)}>×</button>
        </div>
      ))}
    </div>
  )
}
