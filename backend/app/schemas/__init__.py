from .medecin import MedecinSchema, MedecinListSchema
from .patient import PatientSchema, PatientListSchema, PatientDetailSchema
from .consultation import ConsultationSchema, ConsultationListSchema, ConsultationDetailSchema
from .examen import ExamenSchema, ExamenListSchema

__all__ = [
    "MedecinSchema", "MedecinListSchema",
    "PatientSchema", "PatientListSchema", "PatientDetailSchema",
    "ConsultationSchema", "ConsultationListSchema", "ConsultationDetailSchema",
    "ExamenSchema", "ExamenListSchema",
]