"""
Modèle Medecin
==============
Référentiel des médecins de l'établissement.

Cohérence frontend :
  - Le frontend stocke le médecin comme une simple chaîne (ex. "Dr. Bah Ibrahim").
  - Ce modèle permet de centraliser les médecins et d'exposer
    leur nom complet sous la forme attendue par le frontend.
  - Les FK dans Consultation et Patient pointent vers ce modèle.
"""
from app.extensions import db
from .base import TimestampMixin


# ── SPECIALITE_ENUM — partagé avec Consultation ──────
# Défini ici une seule fois, importé dans consultation.py
SPECIALITE_ENUM = db.Enum(
    "Médecine Générale", "Cardiologie", "Pneumologie", "Neurologie",
    "Gynécologie", "Pédiatrie", "Dermatologie", "Ophtalmologie",
    "Kinésithérapie", "Odontologie",
    "ORL", "Traumatologie", "Endocrinologie", "Hépato-Gastroentérologie",
    name="specialite_enum",
)


class Medecin(TimestampMixin, db.Model):
    __tablename__ = "medecins"

    # ── Clé primaire ──────────────────────────────────
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    # ── Identité ──────────────────────────────────────
    prenom = db.Column(db.String(80), nullable=False)
    nom    = db.Column(db.String(80), nullable=False)

    # ── Professionnel ─────────────────────────────────
    specialite = db.Column(
        SPECIALITE_ENUM,
        nullable=False,
        default="Médecine Générale",
    )
    matricule = db.Column(db.String(40), unique=True, nullable=True)
    tel       = db.Column(db.String(30), nullable=True)
    email     = db.Column(db.String(120), unique=True, nullable=True)

    # ── Activité ──────────────────────────────────────
    actif = db.Column(db.Boolean, nullable=False, default=True)

    # ── Relations (back_populates côté Consultation) ──
    consultations_medecin = db.relationship(
        "Consultation", back_populates="medecin_obj",
        foreign_keys="Consultation.medecin_id",
        lazy="dynamic",
    )
    consultations_ref = db.relationship(
        "Patient", back_populates="medecin_ref_obj",
        foreign_keys="Patient.medecin_ref_id",
        lazy="dynamic",
    )
    examens = db.relationship(
        "Examen", back_populates="medecin_obj",
        foreign_keys="Examen.medecin_id",
        lazy="dynamic",
    )

    # ── Propriété : nom complet formaté ───────────────
    @property
    def nom_complet(self) -> str:
        """Retourne 'Dr. Prenom Nom' — format attendu par le frontend."""
        return f"Dr. {self.prenom} {self.nom}"

    def __repr__(self) -> str:
        return f"<Medecin {self.nom_complet} | {self.specialite}>"