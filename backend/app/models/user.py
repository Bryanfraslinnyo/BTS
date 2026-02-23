"""
Modèle User
===========
Gère les comptes de connexion du personnel médical.

Relation avec Medecin :
  Un User peut être lié à un Medecin (medecin_id nullable).
  Un médecin qui se connecte a donc son profil médical lié.

Champs :
  username     → identifiant de connexion (unique)
  password_hash→ hash bcrypt (jamais le mot de passe en clair)
  nom          → nom d'affichage (ex. "Bah Ibrahim")
  role         → 'admin' | 'medecin' | 'secretaire' | 'infirmier'
  role_label   → texte affiché dans la topbar (ex. "Médecin Chef · Cardiologie")
  photo_color  → couleur avatar (hex)
  actif        → soft delete / désactivation de compte
  medecin_id   → FK optionnelle vers la table medecins
"""
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db
from .base import TimestampMixin


ROLE_ENUM = db.Enum(
    "admin", "medecin", "secretaire", "infirmier",
    name="user_role_enum",
)


class User(TimestampMixin, db.Model):
    __tablename__ = "users"

    # ── Clé primaire ──────────────────────────────────
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    # ── Identifiants ──────────────────────────────────
    username      = db.Column(db.String(60), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)

    # ── Profil affiché ────────────────────────────────
    nom         = db.Column(db.String(120), nullable=False)
    role        = db.Column(ROLE_ENUM, nullable=False, default="medecin")
    role_label  = db.Column(db.String(120), nullable=True)
    photo_color = db.Column(db.String(10), nullable=False, default="#1565C0")

    # ── Lien avec un médecin (optionnel) ─────────────
    medecin_id = db.Column(
        db.Integer,
        db.ForeignKey("medecins.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    medecin = db.relationship("Medecin", foreign_keys=[medecin_id], lazy="joined")

    # ── État du compte ────────────────────────────────
    actif              = db.Column(db.Boolean, nullable=False, default=True)
    derniere_connexion = db.Column(db.DateTime, nullable=True)

    # ── Gestion du mot de passe ───────────────────────
    def set_password(self, plain_password: str) -> None:
        """Hash et stocke le mot de passe. Ne jamais stocker en clair."""
        self.password_hash = generate_password_hash(plain_password)

    def check_password(self, plain_password: str) -> bool:
        """Vérifie le mot de passe contre le hash stocké."""
        return check_password_hash(self.password_hash, plain_password)

    # ── Sérialisation sécurisée (sans hash) ──────────
    def to_safe_dict(self) -> dict:
        """Dictionnaire sûr pour le frontend — sans password_hash."""
        return {
            "id":          self.id,
            "username":    self.username,
            "nom":         self.nom,
            "role":        self.role,
            "role_label":  self.role_label,
            "photo_color": self.photo_color,
            "medecin_id":  self.medecin_id,
            "actif":       self.actif,
        }

    def __repr__(self) -> str:
        return f"<User {self.username} | {self.role}>"