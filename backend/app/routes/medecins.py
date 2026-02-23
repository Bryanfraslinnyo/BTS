from flask import Blueprint, jsonify, request
from app.extensions import db
from app.models import Medecin
from app.schemas.medecin import medecin_schema, medecins_schema, medecin_list_schema

bp = Blueprint("medecins", __name__)


@bp.get("/")
def list_medecins():
    """GET /api/medecins/ — liste pour les dropdowns frontend."""
    medecins = Medecin.query.filter_by(actif=True).order_by(Medecin.nom).all()
    return jsonify(medecin_list_schema.dump(medecins))


@bp.get("/<int:id>")
def get_medecin(id):
    m = db.get_or_404(Medecin, id)
    return jsonify(medecin_schema.dump(m))


@bp.post("/")
def create_medecin():
    data = request.get_json()
    m = medecin_schema.load(data, session=db.session)
    db.session.add(m)
    db.session.commit()
    return jsonify(medecin_schema.dump(m)), 201


@bp.put("/<int:id>")
def update_medecin(id):
    m = db.get_or_404(Medecin, id)
    data = request.get_json()
    m = medecin_schema.load(data, instance=m, session=db.session, partial=True)
    db.session.commit()
    return jsonify(medecin_schema.dump(m))


@bp.delete("/<int:id>")
def delete_medecin(id):
    m = db.get_or_404(Medecin, id)
    m.actif = False   # soft delete
    db.session.commit()
    return jsonify({"message": "Médecin désactivé"}), 200