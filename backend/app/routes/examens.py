from flask import Blueprint, jsonify, request
from app.extensions import db
from app.models import Examen
from app.schemas.examen import examen_schema, examens_schema

bp = Blueprint("examens", __name__)

# Liste des champs modifiables pour les examens
MODIFIABLE_FIELDS = {
    'patient_id', 'consultation_id', 'medecin_id', 'date',
    'type_examen', 'nom', 'statut', 'resultat'
}


@bp.get("/")
def list_examens():
    """Liste paginée de tous les examens"""
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 50, type=int)
    
    examens = Examen.query.order_by(
        Examen.date.desc()
    ).paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        "data": examens_schema.dump(examens.items),
        "total": examens.total,
        "page": examens.page,
        "pages": examens.pages,
    })


@bp.get("/<int:id>")
def get_examen(id):
    """Récupérer un examen par ID"""
    e = db.get_or_404(Examen, id)
    return jsonify(examen_schema.dump(e))


@bp.post("/")
def create_examen():
    data = request.get_json()
    
    # Filtrer les données
    valid_fields = ['patient_id', 'consultation_id', 'medecin_id', 'date', 
                    'type', 'nom', 'statut', 'resultat']
    filtered_data = {k: v for k, v in data.items() if k in valid_fields}
    
    # ⚠️ RETIRER session=db.session
    loaded = examen_schema.load(filtered_data)  # ← PLUS DE session
    
    e = Examen(**loaded)
    db.session.add(e)
    db.session.commit()
    return jsonify(examen_schema.dump(e)), 201

@bp.put("/<int:id>")
def update_examen(id):
    """Mettre à jour un examen existant"""
    e = db.get_or_404(Examen, id)
    data = request.get_json()
    
    # 🔑 FILTRER les champs en lecture seule
    filtered_data = {k: v for k, v in data.items() if k in MODIFIABLE_FIELDS}
    
    # 🔧 Mettre à jour l'instance avec les données filtrées
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
    
    return jsonify({"message": "Examen supprimé"}), 200