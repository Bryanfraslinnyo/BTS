from flask import Blueprint, jsonify, request, send_file
from app.extensions import db
from app.models import Patient, Consultation, Examen
from app.schemas.patient import patient_schema
from app.schemas.consultation import consultation_schema, consultations_schema
from app.schemas.examen import examen_schema, examens_schema
import os
from datetime import datetime
import tempfile

# Import du générateur PDF
from app.utils.rapport_pdf import RapportMedicalPDF

bp = Blueprint("rapports", __name__)

# Créer un dossier temporaire pour les rapports
TEMP_DIR = tempfile.gettempdir()


@bp.get("/patient/<int:patient_id>/fiche")
def generer_fiche_patient(patient_id):
    """
    Générer une fiche patient complète en PDF
    GET /api/rapports/patient/<id>/fiche
    """
    try:
        # Récupérer le patient
        patient = db.session.get(Patient, patient_id)
        if not patient:
            return jsonify({"error": "Patient non trouvé"}), 404
        
        # Récupérer toutes les consultations
        consultations = Consultation.query.filter_by(patient_id=patient_id).order_by(
            Consultation.date.desc()
        ).all()
        
        # Récupérer tous les examens
        examens = Examen.query.filter_by(patient_id=patient_id).order_by(
            Examen.date.desc()
        ).all()
        
        # Sérialiser les données
        patient_data = patient_schema.dump(patient)
        consultations_data = consultations_schema.dump(consultations) if consultations else []
        examens_data = examens_schema.dump(examens) if examens else []
        
        # Générer le nom du fichier
        filename = f"fiche_patient_{patient.nom}_{patient.prenom}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        output_path = os.path.join(TEMP_DIR, filename)
        
        # Générer le PDF
        generator = RapportMedicalPDF()
        generator.generer_fiche_patient(
            patient=patient_data,
            consultations=consultations_data,
            examens=examens_data,
            output_path=output_path
        )
        
        # Envoyer le fichier
        return send_file(
            output_path,
            as_attachment=True,
            download_name=filename,
            mimetype='application/pdf'
        )
    
    except Exception as e:
        print(f"❌ Erreur génération fiche patient: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@bp.get("/consultation/<int:consultation_id>/rapport")
def generer_rapport_consultation(consultation_id):
    """
    Générer un rapport de consultation en PDF
    GET /api/rapports/consultation/<id>/rapport
    """
    try:
        # Récupérer la consultation
        consultation = db.session.get(Consultation, consultation_id)
        if not consultation:
            return jsonify({"error": "Consultation non trouvée"}), 404
        
        # Récupérer le patient
        patient = db.session.get(Patient, consultation.patient_id)
        if not patient:
            return jsonify({"error": "Patient non trouvé"}), 404
        
        # Sérialiser les données
        consultation_data = consultation_schema.dump(consultation)
        patient_data = patient_schema.dump(patient)
        
        # Générer le nom du fichier
        filename = f"consultation_{patient.nom}_{patient.prenom}_{consultation.date.strftime('%Y%m%d')}.pdf"
        output_path = os.path.join(TEMP_DIR, filename)
        
        # Générer le PDF
        generator = RapportMedicalPDF()
        generator.generer_rapport_consultation(
            consultation=consultation_data,
            patient=patient_data,
            output_path=output_path
        )
        
        # Envoyer le fichier
        return send_file(
            output_path,
            as_attachment=True,
            download_name=filename,
            mimetype='application/pdf'
        )
    
    except Exception as e:
        print(f"❌ Erreur génération rapport consultation: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@bp.get("/patient/<int:patient_id>/ordonnance/<int:consultation_id>")
def generer_ordonnance(patient_id, consultation_id):
    """
    Générer uniquement l'ordonnance d'une consultation
    GET /api/rapports/patient/<patient_id>/ordonnance/<consultation_id>
    """
    try:
        # Récupérer la consultation
        consultation = db.session.get(Consultation, consultation_id)
        if not consultation:
            return jsonify({"error": "Consultation non trouvée"}), 404
        
        # Vérifier que la consultation appartient bien au patient
        if consultation.patient_id != patient_id:
            return jsonify({"error": "Consultation non trouvée pour ce patient"}), 404
        
        # Récupérer le patient
        patient = db.session.get(Patient, patient_id)
        if not patient:
            return jsonify({"error": "Patient non trouvé"}), 404
        
        # Sérialiser les données
        consultation_data = consultation_schema.dump(consultation)
        patient_data = patient_schema.dump(patient)
        
        # Générer le nom du fichier
        filename = f"ordonnance_{patient.nom}_{patient.prenom}_{consultation.date.strftime('%Y%m%d')}.pdf"
        output_path = os.path.join(TEMP_DIR, filename)
        
        # Générer le PDF (réutilise la fonction rapport_consultation)
        generator = RapportMedicalPDF()
        generator.generer_rapport_consultation(
            consultation=consultation_data,
            patient=patient_data,
            output_path=output_path
        )
        
        # Envoyer le fichier
        return send_file(
            output_path,
            as_attachment=True,
            download_name=filename,
            mimetype='application/pdf'
        )
    
    except Exception as e:
        print(f"❌ Erreur génération ordonnance: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@bp.get("/statistiques/mensuel")
def generer_rapport_statistiques():
    """
    Générer un rapport statistique mensuel (JSON)
    GET /api/rapports/statistiques/mensuel?mois=2026-02
    """
    try:
        # Récupérer le mois depuis les paramètres de requête
        mois = request.args.get('mois', datetime.now().strftime('%Y-%m'))
        
        try:
            annee, mois_num = mois.split('-')
            annee = int(annee)
            mois_num = int(mois_num)
        except:
            return jsonify({"error": "Format de mois invalide. Utilisez YYYY-MM"}), 400
        
        # Calculer les dates de début et fin du mois
        from datetime import date
        from calendar import monthrange
        
        debut_mois = date(annee, mois_num, 1)
        _, dernier_jour = monthrange(annee, mois_num)
        fin_mois = date(annee, mois_num, dernier_jour)
        
        # Statistiques des consultations
        consultations = Consultation.query.filter(
            Consultation.date >= debut_mois,
            Consultation.date <= fin_mois
        ).all()
        
        # Statistiques des examens
        examens = Examen.query.filter(
            Examen.date >= debut_mois,
            Examen.date <= fin_mois
        ).all()
        
        # Nouveaux patients du mois
        nouveaux_patients = Patient.query.filter(
            Patient.created_at >= debut_mois,
            Patient.created_at <= fin_mois
        ).count()
        
        # Préparer les statistiques
        stats = {
            "periode": f"{mois}",
            "total_consultations": len(consultations),
            "total_examens": len(examens),
            "nouveaux_patients": nouveaux_patients,
            "consultations_par_specialite": {},
            "consultations_par_statut": {},
            "examens_par_type": {},
            "examens_par_statut": {}
        }
        
        # Analyser les consultations
        for consult in consultations:
            # Par spécialité
            spec = consult.specialite or "Non spécifié"
            stats["consultations_par_specialite"][spec] = stats["consultations_par_specialite"].get(spec, 0) + 1
            
            # Par statut
            statut = consult.statut or "Non spécifié"
            stats["consultations_par_statut"][statut] = stats["consultations_par_statut"].get(statut, 0) + 1
        
        # Analyser les examens
        for examen in examens:
            # Par type
            type_ex = examen.type_examen or "Non spécifié"
            stats["examens_par_type"][type_ex] = stats["examens_par_type"].get(type_ex, 0) + 1
            
            # Par statut
            statut = examen.statut or "Non spécifié"
            stats["examens_par_statut"][statut] = stats["examens_par_statut"].get(statut, 0) + 1
        
        return jsonify(stats)
    
    except Exception as e:
        print(f"❌ Erreur génération statistiques: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# Route de test
@bp.get("/test")
def test_rapports():
    """Route de test pour vérifier que le blueprint fonctionne"""
    return jsonify({
        "message": "✅ Blueprint rapports fonctionne !",
        "routes_disponibles": [
            "GET /api/rapports/patient/<id>/fiche",
            "GET /api/rapports/consultation/<id>/rapport",
            "GET /api/rapports/patient/<id>/ordonnance/<id>",
            "GET /api/rapports/statistiques/mensuel?mois=YYYY-MM",
            "GET /api/rapports/test"
        ]
    })