from marshmallow import fields, pre_load, validate
from app.extensions import ma
from app.models.medecin import Medecin

SPECIALITES = [
    "Médecine Générale", "Cardiologie", "Pneumologie", "Neurologie",
    "Gynécologie", "Pédiatrie", "Dermatologie", "Ophtalmologie",
    "ORL", "Traumatologie", "Endocrinologie", "Hépato-Gastroentérologie",
    "Kinésithérapie", "Odontologie",
    # versions sans accents aussi acceptées
    "Medecine Generale", "Cardiologie", "Pneumologie", "Neurologie",
    "Gynecologie", "Pediatrie", "Dermatologie", "Ophtalmologie",
    "ORL", "Traumatologie", "Endocrinologie", "Hepato-Gastroenterologie",
]


class MedecinSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Medecin
        load_instance = True
        include_fk = False
        exclude = ("consultations_medecin", "consultations_ref", "examens")

    # Champ calculé — format attendu par le frontend ("Dr. Prenom Nom")
    nom_complet = fields.String(dump_only=True)

    # Validation
    specialite = fields.String(validate=validate.OneOf(SPECIALITES))
    @pre_load
    def convert_empty_to_none(self, data, **kwargs):
        """Convertit les chaînes vides en None"""
        for field in ['tel', 'email']:
            if field in data and data[field] == '':
                data[field] = None
        return data


class MedecinListSchema(ma.SQLAlchemyAutoSchema):
    """Version allégée mais complète pour les dropdowns du frontend."""
    class Meta:
        model = Medecin
        load_instance = True
        fields = ("id", "prenom", "nom", "nom_complet", "specialite", 
                  "matricule", "tel", "email", "actif")

    nom_complet = fields.String(dump_only=True)


medecin_schema      = MedecinSchema()
medecins_schema     = MedecinSchema(many=True)
medecin_list_schema = MedecinListSchema(many=True)