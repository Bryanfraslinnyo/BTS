"""
Mixin partagé : timestamps automatiques + méthodes utilitaires.
Tous les modèles IUG Health l'héritent.
"""
from datetime import datetime, timezone
from app.extensions import db


class TimestampMixin:
    """Ajoute created_at / updated_at sur chaque table."""

    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def save(self):
        """Raccourci add + commit."""
        db.session.add(self)
        db.session.commit()
        return self

    def delete(self):
        """Raccourci delete + commit."""
        db.session.delete(self)
        db.session.commit()

    def to_dict(self):
        """Sérialisation basique via les colonnes SQLAlchemy."""
        return {
            c.name: getattr(self, c.name)
            for c in self.__table__.columns
        }