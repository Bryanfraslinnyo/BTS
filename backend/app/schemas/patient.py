"""
Schémas Patient — réécriture avec Schema de base
"""
from marshmallow import Schema, fields, post_load


class PatientSchema(Schema):
    id              = fields.Integer(dump_only=True)
    nom             = fields.String(required=True)
    prenom          = fields.String(required=True)
    dob             = fields.Date(format="%Y-%m-%d", load_default=None, allow_none=True)
    sexe            = fields.String(load_default="Masculin")
    tel             = fields.String(load_default=None, allow_none=True)
    email           = fields.String(load_default=None, allow_none=True)
    adresse         = fields.String(load_default=None, allow_none=True)
    groupe_sanguin  = fields.String(load_default=None, allow_none=True)
    allergies       = fields.String(load_default="Aucune", allow_none=True)
    antecedents     = fields.String(load_default=None, allow_none=True)
    medecin_ref_id  = fields.Integer(load_default=None, allow_none=True)
    medecin_ref      = fields.String(dump_only=True)
    assurance       = fields.String(load_default=None, allow_none=True)
    num_assurance   = fields.String(load_default=None, allow_none=True)
    photo_color     = fields.String(load_default="#1565C0")
    actif           = fields.Boolean(dump_only=True)
    nom_complet      = fields.String(dump_only=True)
    nb_consultations = fields.Integer(dump_only=True)
    created_at       = fields.DateTime(dump_only=True)
    updated_at       = fields.DateTime(dump_only=True)

    @post_load
    def rename_fields(self, data, **kwargs):
        if "dob" in data:
            data["date_naissance"] = data.pop("dob")
        if "tel" in data:
            data["telephone"] = data.pop("tel")
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
            "nom":             obj.nom,
            "prenom":          obj.prenom,
            "nom_complet":     obj.nom_complet if hasattr(obj, "nom_complet") else f"{obj.prenom} {obj.nom}",
            "dob":             obj.date_naissance.isoformat() if obj.date_naissance else None,
            "sexe":            obj.sexe,
            "tel":             obj.telephone,
            "email":           obj.email,
            "adresse":         obj.adresse,
            "groupe_sanguin":  obj.groupe_sanguin,
            "allergies":       obj.allergies,
            "antecedents":     obj.antecedents,
            "medecin_ref_id":  obj.medecin_ref_id,
            "medecin_ref":     obj.medecin_ref_label if hasattr(obj, "medecin_ref_label") else None,
            "assurance":       obj.assurance,
            "num_assurance":   obj.num_assurance,
            "photo_color":     obj.photo_color,
            "actif":           obj.actif,
            "nb_consultations": obj.nb_consultations if hasattr(obj, "nb_consultations") else 0,
            "created_at":      obj.created_at.isoformat() if obj.created_at else None,
            "updated_at":      obj.updated_at.isoformat() if obj.updated_at else None,
        }


class PatientListSchema(PatientSchema):
    pass


class PatientDetailSchema(PatientSchema):
    consultations = fields.List(fields.Dict(), dump_only=True)
    examens       = fields.List(fields.Dict(), dump_only=True)

    def _dump_one(self, obj):
        d = super()._dump_one(obj)
        from app.schemas.consultation import ConsultationListSchema
        from app.schemas.examen import ExamenListSchema
        d["consultations"] = ConsultationListSchema().dump(list(obj.consultations))
        d["examens"]       = ExamenListSchema().dump(list(obj.examens))
        return d


patient_schema        = PatientSchema()
patients_schema       = PatientListSchema(many=True)
patient_detail_schema = PatientDetailSchema()
_schema        = PatientSchema()
patients_schema       = PatientListSchema(many=True)
patient_detail_schema = PatientDetailSchema()