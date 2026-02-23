"""
Schémas Examen — réécriture avec Schema de base
type_examen est exposé sous le nom "type" vers le frontend.
"""
from marshmallow import Schema, fields, post_load

TYPES_EXAMEN = [
    "Biologie", "Imagerie", "Cardiologie", "Neurologie",
    "Ophtalmologie", "Microbiologie", "Anatomo-pathologie", "Autre",
]
STATUTS_EXAMEN = ["En attente", "En cours d'analyse", "Résultat disponible"]


class ExamenSchema(Schema):
    id              = fields.Integer(dump_only=True)
    patient_id      = fields.Integer(required=True)
    consultation_id = fields.Integer(load_default=None, allow_none=True)
    medecin_id      = fields.Integer(load_default=None, allow_none=True)
    date            = fields.Date(format="%Y-%m-%d", required=True)
    type            = fields.String(load_default="Biologie")
    nom             = fields.String(required=True)
    statut          = fields.String(load_default="En attente")
    resultat        = fields.String(load_default=None, allow_none=True)

    medecin    = fields.String(dump_only=True)
    a_resultat = fields.Boolean(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

    @post_load
    def rename_fields(self, data, **kwargs):
        if "type" in data:
            data["type_examen"] = data.pop("type")
        return data

    def dump(self, obj, **kwargs):
        if isinstance(obj, list):
            return [self._dump_one(o) for o in obj]
        if obj is None:
            return {}
        return self._dump_one(obj)

    def _dump_one(self, obj):
        return {
            "id":              obj.id,
            "patient_id":      obj.patient_id,
            "consultation_id": obj.consultation_id,
            "medecin_id":      obj.medecin_id,
            "date":            obj.date.isoformat() if obj.date else None,
            "type":            obj.type_examen,
            "nom":             obj.nom,
            "statut":          obj.statut,
            "resultat":        obj.resultat,
            "medecin":         obj.medecin_label if hasattr(obj, "medecin_label") else None,
            "a_resultat":      obj.a_resultat if hasattr(obj, "a_resultat") else False,
            "created_at":      obj.created_at.isoformat() if obj.created_at else None,
            "updated_at":      obj.updated_at.isoformat() if obj.updated_at else None,
        }


class ExamenListSchema(ExamenSchema):
    pass


examen_schema  = ExamenSchema()
examens_schema = ExamenListSchema(many=True)
