"""
Modèle Examen
=============
Correspond aux champs gérés par ExamenForm.jsx
et stockés dans seedData.js (seedExamens).

Champs frontend → colonne DB :
  patient_id      → patient_id         (FK → patients.id)
  consultation_id → consultation_id    (FK → consultations.id, nullable)
  date            → date               (DATE)
  type            → type_examen        (ENUM)
  nom             → nom                (VARCHAR)
  statut          → statut             (ENUM)
  resultat        → resultat           (TEXT)
  medecin         → medecin_id         (FK → medecins.id)
"""
from app.extensions import db
from .base import TimestampMixin


# ── Enums (miroir exact de constants.js) ─────────────

TYPE_EXAMEN_ENUM = db.Enum(
    "Biologie", "Imagerie", "Cardiologie", "Neurologie",
    "Ophtalmologie", "Microbiologie", "Anatomo-pathologie", "Autre",
    name="type_examen_enum",
)

STATUT_EXAMEN_ENUM = db.Enum(
    "En attente",
    "En cours d'analyse",
    "Résultat disponible",
    name="statut_examen_enum",
)


class Examen(TimestampMixin, db.Model):
    __tablename__ = "examens"

    # ── Clé primaire ──────────────────────────────────
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    # ── FK Patient (CASCADE) ──────────────────────────
    patient_id = db.Column(
        db.Integer,
        db.ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    patient = db.relationship("Patient", back_populates="examens")

    # ── FK Consultation (SET NULL si consultation supprimée) ──
    consultation_id = db.Column(
        db.Integer,
        db.ForeignKey("consultations.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    consultation = db.relationship("Consultation", back_populates="examens")

    # ── FK Médecin prescripteur ───────────────────────
    medecin_id = db.Column(
        db.Integer,
        db.ForeignKey("medecins.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    medecin_obj = db.relationship(
        "Medecin",
        back_populates="examens",
        foreign_keys=[medecin_id],
    )

    # ── Données examen ────────────────────────────────
    date = db.Column(db.Date, nullable=False, index=True)

    type_examen = db.Column(
        TYPE_EXAMEN_ENUM,
        nullable=False,
        default="Biologie",
        comment="maps to 'type' in frontend",
    )

    nom = db.Column(
        db.String(200),
        nullable=False,
        comment="Nom de l'examen, ex. 'NFS', 'Radiographie thoracique F+P'",
    )

    statut = db.Column(
        STATUT_EXAMEN_ENUM,
        nullable=False,
        default="En attente",
        index=True,
    )

    resultat = db.Column(
        db.Text,
        nullable=True,
        comment="Résultats textuels de l'examen",
    )

    vu_par_medecin = db.Column(
        db.Boolean,
        nullable=False,
        default=False,
        comment="Indique si le médecin prescripteur a vu le résultat",
    )

    # ── Index composites ─────────────────────────────
    __table_args__ = (
        db.Index("ix_examen_patient_date",  "patient_id", "date"),
        db.Index("ix_examen_statut",        "statut"),
    )

    # ── Propriétés calculées ─────────────────────────
    @property
    def medecin_label(self) -> str:
        if self.medecin_obj:
            return self.medecin_obj.nom_complet
        return ""

    @property
    def a_resultat(self) -> bool:
        return self.statut == "Résultat disponible" and bool(self.resultat)

    def __repr__(self) -> str:
        return (
            f"<Examen #{self.id} | {self.nom} | "
            f"patient={self.patient_id} | {self.statut}>"
        )