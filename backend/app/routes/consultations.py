from flask import Blueprint, jsonify, request, abort
from datetime import datetime, date as dt_date
from app.extensions import db
from app.models import Consultation
from app.utils.auth import get_current_user, get_current_user_or_none, apply_doctor_filter
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
    
    query = Consultation.query
    query = apply_doctor_filter(query, Consultation)
    
    pagination = query.order_by(
        Consultation.date.desc(), 
        Consultation.heure.desc()
    ).paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        "data": consultations_schema.dump(pagination.items),
        "total": pagination.total,
        "page": pagination.page,
        "pages": pagination.pages,
    })


@bp.get("/<int:id>")
def get_consultation(id):
    """Récupérer une consultation par ID"""
    c = db.get_or_404(Consultation, id)
    user = get_current_user_or_none()
    if user and user.role == 'medecin' and c.medecin_id != user.medecin_id:
        abort(403, description="Acces refuse a cette consultation.")
    return jsonify(consultation_schema.dump(c))


@bp.post("/")
def create_consultation():
    data = request.get_json()
    user = get_current_user_or_none()
    
    # ── VALIDATION DE LA DATE ──────────────────────────
    cons_date = datetime.strptime(data.get('date'), '%Y-%m-%d').date() if data.get('date') else None
    cons_time = datetime.strptime(data.get('heure'), '%H:%M').time() if data.get('heure') else None
    
    if cons_date and cons_date < dt_date.today():
        return jsonify({"message": "La date de consultation ne peut pas être dans le passé."}), 400
    
    if cons_date == dt_date.today() and cons_time and cons_time < datetime.now().time():
        return jsonify({"message": "L'heure de consultation est déjà passée."}), 400

    # ── AUTO-ASSIGNATION DU MÉDECIN ───────────────────
    if user and user.role == 'medecin' and user.medecin_id:
        data['medecin_id'] = user.medecin_id

    # Filtrer les données pour ne garder que les champs valides
    valid_fields = ['patient_id', 'date', 'heure', 'type', 'specialite', 
                    'medecin_id', 'motif', 'statut', 'diagnostic', 'ordonnance',
                    'notes', 'poids', 'taille', 'temperature', 'pouls', 
                    'saturation', 'tension']
    
    filtered_data = {k: v for k, v in data.items() if k in valid_fields}
    loaded = consultation_schema.load(filtered_data)
    
    c = Consultation(**loaded)
    db.session.add(c)
    db.session.commit()
    return jsonify(consultation_schema.dump(c)), 201


@bp.put("/<int:id>")
def update_consultation(id):
    """Mettre à jour une consultation existante"""
    c = db.get_or_404(Consultation, id)
    data = request.get_json()
    
    #  FILTRER les champs en lecture seule
    filtered_data = {k: v for k, v in data.items() if k in MODIFIABLE_FIELDS}
    
    #  Mettre à jour l'instance avec les données filtrées
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