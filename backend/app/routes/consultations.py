from flask import Blueprint, jsonify, request
from app.extensions import db
from app.models import Consultation
from app.schemas.consultation import consultation_schema, consultations_schema

bp = Blueprint("consultations", __name__)

# Liste des champs modifiables pour les consultations
MODIFIABLE_FIELDS = {
    'patient_id', 'medecin_id', 'date', 'heure', 'type_consult',
    'specialite', 'motif', 'statut', 'poids', 'taille', 'temperature',
    'pouls', 'saturation', 'tension', 'notes_cliniques', 'diagnostic',
    'ordonnance'
}


@bp.get("/")
def list_consultations():
    """Liste paginée de toutes les consultations"""
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 50, type=int)
    
    consultations = Consultation.query.order_by(
        Consultation.date.desc(), 
        Consultation.heure.desc()
    ).paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        "data": consultations_schema.dump(consultations.items),
        "total": consultations.total,
        "page": consultations.page,
        "pages": consultations.pages,
    })


@bp.get("/<int:id>")
def get_consultation(id):
    """Récupérer une consultation par ID"""
    c = db.get_or_404(Consultation, id)
    return jsonify(consultation_schema.dump(c))


@bp.post("/")
def create_consultation():
    data = request.get_json()
    
    # Filtrer les données pour ne garder que les champs valides
    valid_fields = ['patient_id', 'date', 'heure', 'type', 'specialite', 
                    'medecin_id', 'motif', 'statut', 'diagnostic', 'ordonnance',
                    'notes', 'poids', 'taille', 'temperature', 'pouls', 
                    'saturation', 'tension']
    
    filtered_data = {k: v for k, v in data.items() if k in valid_fields}
    
    # ⚠️ RETIREZ session=db.session
    loaded = consultation_schema.load(filtered_data)  # ← PLUS DE session
    
    c = Consultation(**loaded)
    db.session.add(c)
    db.session.commit()
    return jsonify(consultation_schema.dump(c)), 201


@bp.put("/<int:id>")
def update_consultation(id):
    """Mettre à jour une consultation existante"""
    c = db.get_or_404(Consultation, id)
    data = request.get_json()
    
    # 🔑 FILTRER les champs en lecture seule
    filtered_data = {k: v for k, v in data.items() if k in MODIFIABLE_FIELDS}
    
    # 🔧 Mettre à jour l'instance avec les données filtrées
    for key, value in filtered_data.items():
        if hasattr(c, key):
            setattr(c, key, value)
    
    db.session.commit()
    
    return jsonify(consultation_schema.dump(c))


@bp.delete("/<int:id>")
def delete_consultation(id):
    """Supprimer une consultation"""
    c = db.get_or_404(Consultation, id)
    db.session.delete(c)
    db.session.commit()
    
    return jsonify({"message": "Consultation supprimée"}), 200