"""
Routes Auth
===========
POST /api/auth/login   → connexion, retourne les infos user
POST /api/auth/logout  → déconnexion (côté client suffit, mais endpoint propre)
GET  /api/auth/me      → retourne l'utilisateur courant (via session Flask)

Note : utilise les sessions Flask (côté serveur).
Pour une app React SPA on utilise généralement un cookie de session
ou un JWT. Ici on utilise la session Flask avec un cookie httpOnly.
"""
from datetime import datetime, timezone
from flask import Blueprint, jsonify, request, session
from app.extensions import db
from app.models.user import User

bp = Blueprint("auth", __name__)


@bp.post("/login")
def login():
    """
    POST /api/auth/login
    Body : { "username": "...", "password": "..." }
    Retourne : { "user": {...}, "message": "Connexion réussie" }
    """
    data     = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip().lower()
    password = data.get("password") or ""

    if not username or not password:
        return jsonify({"message": "Identifiant et mot de passe requis."}), 400

    user = User.query.filter_by(username=username, actif=True).first()

    if not user or not user.check_password(password):
        return jsonify({"message": "Identifiant ou mot de passe incorrect."}), 401

    # Stocker l'ID en session
    session["user_id"] = user.id
    session.permanent = True

    # Mettre à jour la date de dernière connexion
    user.derniere_connexion = datetime.now(timezone.utc)
    db.session.commit()

    return jsonify({
        "user":    user.to_safe_dict(),
        "message": "Connexion réussie.",
    }), 200


@bp.post("/logout")
def logout():
    """POST /api/auth/logout — efface la session."""
    session.pop("user_id", None)
    return jsonify({"message": "Déconnexion réussie."}), 200


@bp.get("/me")
def me():
    """GET /api/auth/me — retourne l'utilisateur de la session courante."""
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"message": "Non authentifié."}), 401

    user = db.session.get(User, user_id)
    if not user or not user.actif:
        session.pop("user_id", None)
        return jsonify({"message": "Session expirée."}), 401

    return jsonify({"user": user.to_safe_dict()}), 200