"""
Schémas Consultation — réécriture avec marshmallow.Schema de base
On abandonne SQLAlchemyAutoSchema pour ce modèle car les alias
type_consult/notes_cliniques causent une collision irrésoluble
avec l'auto-génération de champs.
"""
from marshmallow import Schema, fields, validate, validates, ValidationError, post_load
from app.models.consultation import Consultation
from app.extensions import db

TYPES_CONSULT = [
    "Consultation initiale", "Consultation de suivi",
    "Urgence", "Teleconsultation", "Bilan", "Consultation pre-operatoire",
]
SPECIALITES = [
    "Medecine Generale", "Cardiologie", "Pneumologie", "Neurologie",
    "Gynecologie", "Pediatrie", "Dermatologie", "Ophtalmologie",
    "ORL", "Traumatologie", "Endocrinologie", "Hepato-Gastroenterologie",
         "Odontologie","Kinésithérapie",
    # versions avec accents aussi acceptees
    "Médecine Générale", "Gynécologie", "Pédiatrie",
    "Hépato-Gastroentérologie", "Téléconsultation",
    "Consultation pré-opératoire",
]
STATUTS = ["Planifiee", "En cours", "Terminee", "Annulee",
           "Planifiée", "Terminée", "Annulée"]


class ConsultationSchema(Schema):
    # -- Lecture + Ecriture
    id          = fields.Integer(dump_only=True)
    patient_id  = fields.Integer(required=True)
    date        = fields.Date(format="%Y-%m-%d", required=True)
    heure       = fields.Time(format="%H:%M", load_default=None, allow_none=True)
    type        = fields.String(load_default="Consultation initiale")
    specialite  = fields.String(load_default="Médecine Générale")
    medecin_id  = fields.Integer(load_default=None, allow_none=True)
    motif       = fields.String(required=True)
    statut      = fields.String(load_default="Planifiée")
    diagnostic  = fields.String(load_default=None, allow_none=True)
    ordonnance  = fields.String(load_default=None, allow_none=True)
    notes       = fields.String(load_default=None, allow_none=True)

    # Constantes vitales
    poids       = fields.Float(load_default=None, allow_none=True)
    taille      = fields.Float(load_default=None, allow_none=True)
    temperature = fields.Float(load_default=None, allow_none=True)
    pouls       = fields.Integer(load_default=None, allow_none=True)
    saturation  = fields.Float(load_default=None, allow_none=True)
    tension     = fields.String(load_default=None, allow_none=True)

    # -- Lecture seule
    medecin = fields.String(dump_only=True, load_default=None, attribute="medecin_label")
    imc        = fields.Float(dump_only=True, allow_none=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

    @post_load
    def make_object(self, data, **kwargs):
        """Mappe les alias vers les vrais noms de colonnes."""
        # "type" -> type_consult
        if "type" in data:
            data["type_consult"] = data.pop("type")
        # "notes" -> notes_cliniques
        if "notes" in data:
            data["notes_cliniques"] = data.pop("notes")
        return data

    def dump(self, obj, **kwargs):
        """Override dump pour mapper les colonnes vers les alias."""
        if obj is None:
            return {}
        # Si c'est une liste, déléguer
        if isinstance(obj, list):
            return [self._dump_one(o) for o in obj]
        return self._dump_one(obj)

    def _dump_one(self, obj):
        d = {}
        d["id"]          = obj.id
        d["patient_id"]  = obj.patient_id
        d["date"]        = obj.date.isoformat() if obj.date else None
        d["heure"]       = obj.heure.strftime("%H:%M") if obj.heure else None
        d["type"]        = obj.type_consult
        d["specialite"]  = obj.specialite
        d["medecin_id"]  = obj.medecin_id
        d["medecin"]     = obj.medecin_label if hasattr(obj, "medecin_label") else None
        d["motif"]       = obj.motif
        d["statut"]      = obj.statut
        d["diagnostic"]  = obj.diagnostic
        d["ordonnance"]  = obj.ordonnance
        d["notes"]       = obj.notes_cliniques
        d["poids"]       = float(obj.poids) if obj.poids is not None else None
        d["taille"]      = float(obj.taille) if obj.taille is not None else None
        d["temperature"] = float(obj.temperature) if obj.temperature is not None else None
        d["pouls"]       = obj.pouls
        d["saturation"]  = float(obj.saturation) if obj.saturation is not None else None
        d["tension"]     = obj.tension
        d["imc"]         = obj.imc if hasattr(obj, "imc") else None
        d["created_at"]  = obj.created_at.isoformat() if obj.created_at else None
        d["updated_at"]  = obj.updated_at.isoformat() if obj.updated_at else None
        return d


class ConsultationListSchema(Schema):
    """Vue allégée - liste + timeline - AVEC CONSTANTES VITALES."""
    id         = fields.Integer(dump_only=True)
    patient_id = fields.Integer(dump_only=True)
    date       = fields.Date(format="%Y-%m-%d", dump_only=True)
    heure      = fields.Time(format="%H:%M", dump_only=True, allow_none=True)
    type       = fields.String(dump_only=True)
    specialite = fields.String(dump_only=True)
    medecin    = fields.String(dump_only=True)
    motif      = fields.String(dump_only=True)
    statut     = fields.String(dump_only=True)
    diagnostic = fields.String(dump_only=True, allow_none=True)
    
    #  CONSTANTES VITALES - AJOUTÉES POUR L'AFFICHAGE
    poids       = fields.Float(dump_only=True, allow_none=True)
    taille      = fields.Float(dump_only=True, allow_none=True)
    temperature = fields.Float(dump_only=True, allow_none=True)
    pouls       = fields.Integer(dump_only=True, allow_none=True)
    saturation  = fields.Float(dump_only=True, allow_none=True)
    tension     = fields.String(dump_only=True, allow_none=True)
    notes       = fields.String(dump_only=True, allow_none=True)
    ordonnance  = fields.String(dump_only=True, allow_none=True)

    def dump(self, obj, **kwargs):
        if isinstance(obj, list):
            return [self._dump_one(o) for o in obj]
        return self._dump_one(obj)

    def _dump_one(self, obj):
        return {
            "id":         obj.id,
            "patient_id": obj.patient_id,
            "date":       obj.date.isoformat() if obj.date else None,
            "heure":      obj.heure.strftime("%H:%M") if obj.heure else None,
            "type":       obj.type_consult,
            "specialite": obj.specialite,
            "medecin":    obj.medecin_label if hasattr(obj, "medecin_label") else None,
            "motif":      obj.motif,
            "statut":     obj.statut,
            "diagnostic": obj.diagnostic,
            # 🩺 CONSTANTES VITALES - Sérialisation complète
            "poids":       float(obj.poids) if obj.poids is not None else None,
            "taille":      float(obj.taille) if obj.taille is not None else None,
            "temperature": float(obj.temperature) if obj.temperature is not None else None,
            "pouls":       obj.pouls,
            "saturation":  float(obj.saturation) if obj.saturation is not None else None,
            "tension":     obj.tension,
            "notes":       obj.notes_cliniques,
            "ordonnance":  obj.ordonnance,
        }


class ConsultationDetailSchema(ConsultationSchema):
    """Vue complète avec examens imbriqués."""
    examens = fields.List(fields.Dict(), dump_only=True)

    def _dump_one(self, obj):
        d = super()._dump_one(obj)
        # Examens liés
        from app.schemas.examen import ExamenListSchema
        exam_schema = ExamenListSchema()
        examens_list = list(obj.examens) if obj.examens else []
        d["examens"] = exam_schema.dump(examens_list)
        return d


# Instances réutilisées dans les routes
consultation_schema        = ConsultationSchema()
consultations_schema       = ConsultationListSchema(many=True)
consultation_detail_schema = ConsultationDetailSchema()