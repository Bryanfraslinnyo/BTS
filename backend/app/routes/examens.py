from flask import Blueprint, jsonify, request, abort
from app.extensions import db
from app.models import Examen
from app.utils.auth import get_current_user, get_current_user_or_none, apply_doctor_filter
from app.schemas.examen import examen_schema, examens_schema

bp = Blueprint("examens", __name__)

# Liste des champs modifiables pour les examens
MODIFIABLE_FIELDS = {
    'patient_id', 'consultation_id', 'medecin_id', 'date',
    'type_examen', 'nom', 'statut', 'resultat', 'vu_par_medecin'
}


@bp.get("/")
def list_examens():
    """Liste paginee de tous les examens"""
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 50, type=int)

    query = Examen.query
    user = get_current_user_or_none()
    
    if user and user.role == 'medecin' and user.medecin_id:
        query = query.filter(Examen.medecin_id == user.medecin_id)
    # laborantin et admin voient tout

    pagination = query.order_by(
        Examen.date.desc()
    ).paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        "data": examens_schema.dump(pagination.items),
        "total": pagination.total,
        "page": pagination.page,
        "pages": pagination.pages,
    })


@bp.get("/<int:id>")
def get_examen(id):
    """Recuperer un examen par ID"""
    e = db.get_or_404(Examen, id)
    return jsonify(examen_schema.dump(e))


@bp.post("/")
def create_examen():
    data = request.get_json()
    user = get_current_user_or_none()
    
    # Auto-assignation si c'est un medecin qui prescrit
    if user and user.role == 'medecin' and user.medecin_id:
        data['medecin_id'] = user.medecin_id

    # Filtrer les donnees
    valid_fields = ['patient_id', 'consultation_id', 'medecin_id', 'date', 
                    'type_examen', 'nom', 'statut', 'resultat']
    filtered_data = {k: v for k, v in data.items() if k in valid_fields}
    
    loaded = examen_schema.load(filtered_data)
    
    e = Examen(**loaded)
    db.session.add(e)
    db.session.commit()
    return jsonify(examen_schema.dump(e)), 201

@bp.put("/<int:id>")
def update_examen(id):
    """Mettre a jour un examen existant"""
    e = db.get_or_404(Examen, id)
    data = request.get_json()
    
    # FILTRER les champs en lecture seule
    filtered_data = {k: v for k, v in data.items() if k in MODIFIABLE_FIELDS}
    
    # Mettre a jour l'instance avec les donnees filtrees
    for key, value in filtered_data.items():
        if hasattr(e, key):
            setattr(e, key, value)
    
    db.session.commit()
    
    return jsonify(examen_schema.dump(e))


@bp.delete("/<int:id>")
def delete_examen(id):
    """Supprimer un examen"""
    e = db.get_or_404(Examen, id)
    db.session.delete(e)
    db.session.commit()
    
    return jsonify({"message": "Examen supprime"}), 200