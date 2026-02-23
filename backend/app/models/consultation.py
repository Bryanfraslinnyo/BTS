"""
Modèle Consultation
===================
Correspond exactement aux 3 onglets du ConsultationForm.jsx :

Onglet "Informations" :
  patient_id    → patient_id       (FK → patients.id)
  date          → date             (DATE)
  heure         → heure            (TIME)
  type          → type_consult     (ENUM — mot réservé SQL évité)
  specialite    → specialite       (ENUM)
  medecin       → medecin_id       (FK → medecins.id)
  motif         → motif            (TEXT)
  statut        → statut           (ENUM)

Onglet "Clinique" :
  poids         → poids            (NUMERIC 5,2 — kg)
  taille        → taille           (NUMERIC 5,1 — cm)
  temperature   → temperature      (NUMERIC 4,1 — °C)
  pouls         → pouls            (SMALLINT — bpm)
  saturation    → saturation       (NUMERIC 4,1 — %)
  tension       → tension          (VARCHAR — ex. "130/80")
  notes         → notes_cliniques  (TEXT)

Onglet "Diagnostic" :
  diagnostic    → diagnostic       (TEXT)
  ordonnance    → ordonnance       (TEXT)
"""
from app.extensions import db
from .base import TimestampMixin
from .medecin import SPECIALITE_ENUM   # partagé — défini une seule fois


# ── Enums (miroir exact de constants.js) ─────────────

TYPE_CONSULT_ENUM = db.Enum(
    "Consultation initiale",
    "Consultation de suivi",
    "Urgence",
    "Téléconsultation",
    "Bilan",
    "Consultation pré-opératoire",
     "Odontologie",
     "Kinésithérapie",
    name="type_consult_enum",
)

# SPECIALITE_ENUM importé depuis medecin.py (pas de doublon)

STATUT_CONSULT_ENUM = db.Enum(
    "Planifiée", "En cours", "Terminée", "Annulée",
    name="statut_consult_enum",
)


class Consultation(TimestampMixin, db.Model):
    __tablename__ = "consultations"

    # ── Clé primaire ──────────────────────────────────
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    # ── Relations patient / médecin ───────────────────
    patient_id = db.Column(
        db.Integer,
        db.ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    patient = db.relationship("Patient", back_populates="consultations")

    medecin_id = db.Column(
        db.Integer,
        db.ForeignKey("medecins.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    medecin_obj = db.relationship(
        "Medecin",
        back_populates="consultations_medecin",
        foreign_keys=[medecin_id],
    )

    # ── Onglet 1 : Informations ───────────────────────
    date  = db.Column(db.Date, nullable=False, index=True)
    heure = db.Column(db.Time, nullable=True)

    type_consult = db.Column(
        TYPE_CONSULT_ENUM,
        nullable=False,
        default="Consultation initiale",
        comment="maps to 'type' in frontend (type est réservé en Python/SQL)",
    )

    specialite = db.Column(
        SPECIALITE_ENUM,
        nullable=False,
        default="Médecine Générale",
    )

    motif  = db.Column(db.Text, nullable=False)

    statut = db.Column(
        STATUT_CONSULT_ENUM,
        nullable=False,
        default="Planifiée",
        index=True,
    )

    # ── Onglet 2 : Examen clinique ────────────────────
    poids       = db.Column(db.Numeric(5, 2), nullable=True, comment="kg")
    taille      = db.Column(db.Numeric(5, 1), nullable=True, comment="cm")
    temperature = db.Column(db.Numeric(4, 1), nullable=True, comment="°C")
    pouls       = db.Column(db.SmallInteger,  nullable=True, comment="bpm")
    saturation  = db.Column(db.Numeric(4, 1), nullable=True, comment="% SpO₂")
    tension     = db.Column(db.String(20),    nullable=True, comment="ex. 130/80 mmHg")

    notes_cliniques = db.Column(
        db.Text, nullable=True,
        comment="maps to 'notes' in frontend",
    )

    # ── Onglet 3 : Diagnostic & Ordonnance ───────────
    diagnostic = db.Column(db.Text, nullable=True)
    ordonnance = db.Column(db.Text, nullable=True)

    # ── Relation examens ─────────────────────────────
    examens = db.relationship(
        "Examen",
        back_populates="consultation",
        cascade="all, delete-orphan",
        lazy="dynamic",
    )

    # ── Index composites ─────────────────────────────
    __table_args__ = (
        db.Index("ix_consult_patient_date", "patient_id", "date"),
        db.Index("ix_consult_date_statut",  "date", "statut"),
    )

    # ── Propriétés calculées ─────────────────────────
    @property
    def medecin_label(self) -> str:
        """Nom du médecin formaté → 'Dr. Prenom Nom'."""
        if self.medecin_obj:
            return self.medecin_obj.nom_complet
        return ""

    @property
    def imc(self):
        """Calcul IMC côté serveur (redondant avec le frontend, utile pour les stats)."""
        if self.poids and self.taille and float(self.taille) > 0:
            return round(float(self.poids) / (float(self.taille) / 100) ** 2, 1)
        return None

    def __repr__(self) -> str:
        return (
            f"<Consultation #{self.id} | "
            f"patient={self.patient_id} | "
            f"{self.date} {self.heure} | "
            f"{self.statut}>"
        )