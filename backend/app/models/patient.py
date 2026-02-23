"""
Modèle Patient
==============
Correspond exactement aux champs gérés par PatientForm.jsx
et stockés dans seedData.js (seedPatients).

Champs frontend → colonne DB :
  nom             → nom
  prenom          → prenom
  dob             → date_naissance     (DATE)
  sexe            → sexe               (ENUM)
  tel             → telephone
  email           → email
  adresse         → adresse
  groupe_sanguin  → groupe_sanguin     (ENUM)
  allergies       → allergies          (TEXT)
  antecedents     → antecedents        (TEXT)
  medecin_ref     → medecin_ref_id     (FK → medecins.id)
  assurance       → assurance
  num_assurance   → num_assurance
  photo_color     → photo_color        (code hex CSS)
"""
from app.extensions import db
from .base import TimestampMixin


# ── Enums partagés avec le frontend ──────────────────
SEXE_ENUM = db.Enum("Masculin", "Féminin", name="sexe_enum")

GROUPE_SANGUIN_ENUM = db.Enum(
    "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-",
    name="groupe_sanguin_enum",
)


class Patient(TimestampMixin, db.Model):
    __tablename__ = "patients"

    # ── Clé primaire ──────────────────────────────────
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    # ── Identité ──────────────────────────────────────
    nom    = db.Column(db.String(80), nullable=False, index=True)
    prenom = db.Column(db.String(80), nullable=False, index=True)

    date_naissance = db.Column(db.Date, nullable=True)

    sexe = db.Column(
        SEXE_ENUM,
        nullable=False,
        default="Masculin",
    )

    # ── Contact ───────────────────────────────────────
    telephone = db.Column(db.String(30), nullable=True)
    email     = db.Column(db.String(120), nullable=True, index=True)
    adresse   = db.Column(db.String(255), nullable=True)

    # ── Informations médicales ────────────────────────
    groupe_sanguin = db.Column(
        GROUPE_SANGUIN_ENUM,
        nullable=True,
    )

    allergies   = db.Column(db.Text, nullable=True, default="Aucune")
    antecedents = db.Column(db.Text, nullable=True)

    # ── Médecin référent (FK) ─────────────────────────
    medecin_ref_id = db.Column(
        db.Integer,
        db.ForeignKey("medecins.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    medecin_ref_obj = db.relationship(
        "Medecin",
        back_populates="consultations_ref",
        foreign_keys=[medecin_ref_id],
    )

    # ── Assurance ────────────────────────────────────
    assurance     = db.Column(db.String(80), nullable=True)
    num_assurance = db.Column(db.String(60), nullable=True)

    # ── UI / avatar ──────────────────────────────────
    photo_color = db.Column(
        db.String(10),
        nullable=False,
        default="#1565C0",
        comment="Code couleur hexadécimal affiché dans l'avatar frontend",
    )

    # ── Soft delete ──────────────────────────────────
    actif = db.Column(db.Boolean, nullable=False, default=True)

    # ── Relations ────────────────────────────────────
    consultations = db.relationship(
        "Consultation",
        back_populates="patient",
        cascade="all, delete-orphan",
        order_by="Consultation.date.desc()",
        lazy="dynamic",
    )
    examens = db.relationship(
        "Examen",
        back_populates="patient",
        cascade="all, delete-orphan",
        order_by="Examen.date.desc()",
        lazy="dynamic",
    )

    # ── Contraintes / Index ──────────────────────────
    __table_args__ = (
        db.Index("ix_patient_nom_prenom", "nom", "prenom"),
    )

    # ── Propriétés calculées ─────────────────────────
    @property
    def nom_complet(self) -> str:
        return f"{self.prenom} {self.nom}"

    @property
    def medecin_ref_label(self) -> str:
        """Retourne le nom du médecin référent formaté comme le frontend."""
        if self.medecin_ref_obj:
            return self.medecin_ref_obj.nom_complet
        return ""

    @property
    def nb_consultations(self) -> int:
        return self.consultations.count()

    def __repr__(self) -> str:
        return f"<Patient {self.nom_complet} | {self.groupe_sanguin}>"