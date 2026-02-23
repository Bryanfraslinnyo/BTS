import { useState } from 'react'
import { Download, FileText, Printer, Calendar } from 'lucide-react'

export default function RapportGenerator({ type, data, onClose }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // ✅ URL de l'API Flask
  const API_URL = 'http://localhost:5001'

  /**
   * Télécharger un rapport
   * @param {string} endpoint - Endpoint de l'API (ex: /api/rapports/patient/7/fiche)
   * @param {string} filename - Nom du fichier par défaut
   */
  const telechargerRapport = async (endpoint, filename) => {
    setLoading(true)
    setError(null)

    try {
      // ✅ CORRECTION : Utiliser l'URL complète de l'API Flask
      const url = `${API_URL}${endpoint}`
      console.log('📥 Téléchargement depuis:', url)
      
      const response = await fetch(url)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erreur serveur:', errorText)
        throw new Error(`Erreur ${response.status}: ${errorText}`)
      }

      // Récupérer le blob
      const blob = await response.blob()
      console.log('✅ PDF reçu, taille:', blob.size, 'bytes')
      
      // Créer un lien de téléchargement
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)

      console.log('✅ Téléchargement terminé:', filename)

      // Fermer le modal après succès
      setTimeout(() => {
        if (onClose) onClose()
      }, 500)

    } catch (err) {
      console.error('❌ Erreur téléchargement:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const genererFichePatient = () => {
    const endpoint = `/api/rapports/patient/${data.id}/fiche`
    const filename = `fiche_patient_${data.nom}_${data.prenom}.pdf`
    telechargerRapport(endpoint, filename)
  }

  const genererRapportConsultation = () => {
    const endpoint = `/api/rapports/consultation/${data.id}/rapport`
    const filename = `consultation_${data.date}.pdf`
    telechargerRapport(endpoint, filename)
  }

  const genererOrdonnance = () => {
    const endpoint = `/api/rapports/patient/${data.patient_id}/ordonnance/${data.id}`
    const filename = `ordonnance_${data.date}.pdf`
    telechargerRapport(endpoint, filename)
  }

  const genererStatistiquesMensuelles = () => {
    const mois = new Date().toISOString().slice(0, 7) // YYYY-MM
    const endpoint = `/api/rapports/statistiques/mensuel?mois=${mois}`
    const filename = `statistiques_${mois}.pdf`
    telechargerRapport(endpoint, filename)
  }

  return (
    <>
      <div className="modal-body">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <FileText size={48} style={{ color: 'var(--primary)', margin: '0 auto' }} />
          <h3 style={{ marginTop: 16, marginBottom: 8 }}>Générer un rapport</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Sélectionnez le type de rapport à générer
          </p>
        </div>

        {error && (
          <div style={{
            padding: 12,
            marginBottom: 16,
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: 6,
            color: '#c33',
            fontSize: 14
          }}>
            <strong>Erreur :</strong> {error}
            <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
              Vérifiez que le serveur Flask est démarré sur http://localhost:5001
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Fiche patient */}
          {type === 'patient' && (
            <button
              className="btn btn-outline"
              onClick={genererFichePatient}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                textAlign: 'left'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  📋 Fiche patient complète
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Historique complet : consultations et examens
                </div>
              </div>
              <Download size={20} />
            </button>
          )}

          {/* Rapport de consultation */}
          {type === 'consultation' && (
            <>
              <button
                className="btn btn-outline"
                onClick={genererRapportConsultation}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  textAlign: 'left'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    🩺 Rapport de consultation
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    Détails complets avec diagnostic et ordonnance
                  </div>
                </div>
                <Download size={20} />
              </button>

              {data.ordonnance && (
                <button
                  className="btn btn-outline"
                  onClick={genererOrdonnance}
                  disabled={loading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    textAlign: 'left'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>
                      💊 Ordonnance uniquement
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      Format imprimable pour la pharmacie
                    </div>
                  </div>
                  <Printer size={20} />
                </button>
              )}
            </>
          )}

          {/* Statistiques */}
          {type === 'statistiques' && (
            <button
              className="btn btn-outline"
              onClick={genererStatistiquesMensuelles}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                textAlign: 'left'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  📊 Rapport statistique mensuel
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Activité du mois en cours
                </div>
              </div>
              <Download size={20} />
            </button>
          )}
        </div>

        {loading && (
          <div style={{
            marginTop: 24,
            padding: 16,
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 8,
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: 8 }}>⏳ Génération du rapport en cours...</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Le téléchargement démarrera automatiquement
            </div>
          </div>
        )}
      </div>

      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onClose} disabled={loading}>
          Fermer
        </button>
      </div>
    </>
  )
}