from flask import Blueprint, jsonify, request
from sqlalchemy import or_, func
from app.extensions import db
from app.models import Patient
from app.schemas.patient import (
    patient_schema, patients_schema, patient_detail_schema
)

bp = Blueprint("patients", __name__)

# Liste des champs modifiables pour les patients
MODIFIABLE_FIELDS = {
    'nom', 'prenom', 'date_naissance', 'sexe', 'telephone', 'email',
    'adresse', 'groupe_sanguin', 'allergies', 'antecedents',
    'medecin_ref_id', 'assurance', 'num_assurance', 'photo_color'
}


@bp.get("/")
def list_patients():
    """
    GET /api/patients/
    Query params :
      q        — recherche nom/prénom/email/téléphone
      actif    — true/false (défaut: true)
      page     — numéro de page (défaut: 1)
      per_page — taille de page (défaut: 50)
    """
    q       = request.args.get("q", "").strip()
    actif   = request.args.get("actif", "true").lower() == "true"
    page    = int(request.args.get("page", 1))
    per_page= int(request.args.get("per_page", 50))

    query = Patient.query

    if q:
        like = f"%{q}%"
        query = query.filter(
            or_(
                func.concat(Patient.prenom, " ", Patient.nom).ilike(like),
                Patient.nom.ilike(like),
                Patient.prenom.ilike(like),
                Patient.telephone.ilike(like),
                Patient.email.ilike(like),
            )
        )

    query = query.order_by(Patient.nom, Patient.prenom)
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "data":       patients_schema.dump(pagination.items),
        "total":      pagination.total,
        "page":       page,
        "per_page":   per_page,
        "pages":      pagination.pages,
    })


@bp.get("/<int:id>")
def get_patient(id):
    """GET /api/patients/<id> — dossier complet (PatientDetailPage)."""
    p = db.get_or_404(Patient, id)
    return jsonify(patient_detail_schema.dump(p))

from marshmallow import ValidationError

@bp.post("/")
def create_patient():
    try:
        data = request.get_json()
        loaded = patient_schema.load(data)
    except ValidationError as err:
        return jsonify(err.messages), 400

    p = Patient()
    for key, value in loaded.items():
        if hasattr(p, key):
            setattr(p, key, value)

    db.session.add(p)
    db.session.commit()

    return jsonify(patient_detail_schema.dump(p)), 201



@bp.put("/<int:id>")
def update_patient(id):
    """Mettre à jour un patient existant"""
    p = db.get_or_404(Patient, id)
    data = request.get_json()
    
    # 🔑 FILTRER les champs en lecture seule (id, nom_complet, nb_consultations, etc.)
    filtered_data = {k: v for k, v in data.items() if k in MODIFIABLE_FIELDS}
    
    # Charger avec l'instance existante pour mise à jour
    for key, value in filtered_data.items():
        if hasattr(p, key):
            setattr(p, key, value)
    
    db.session.commit()
    return jsonify(patient_detail_schema.dump(p))


@bp.delete("/<int:id>")
def delete_patient(id):
    """
    DELETE /api/patients/<id>
    Suppression en cascade (consultations + examens) via SQLAlchemy.
    """
    p = db.get_or_404(Patient, id)
    db.session.delete(p)
    db.session.commit()
    return jsonify({"message": f"Patient {id} supprimé"}), 200


@bp.get("/<int:id>/consultations")
def get_patient_consultations(id):
    """GET /api/patients/<id>/consultations — timeline PatientDetailPage."""
    from app.schemas.consultation import consultations_schema
    p = db.get_or_404(Patient, id)
    consults = p.consultations.order_by(None).all()
    return jsonify(consultations_schema.dump(consults))


@bp.get("/<int:id>/examens")
def get_patient_examens(id):
    """GET /api/patients/<id>/examens — onglet examens PatientDetailPage."""
    from app.schemas.examen import examens_schema
    p = db.get_or_404(Patient, id)
    examens = p.examens.order_by(None).all()
    return jsonify(examens_schema.dump(examens))