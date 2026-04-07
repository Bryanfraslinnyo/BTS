from flask import session, abort
from app.extensions import db
from app.models.user import User

def get_current_user():
    """
    Recupere l'utilisateur actuellement connecte via la session Flask.
    Leve un 401 si non connecte.
    """
    user_id = session.get("user_id")
    if not user_id:
        abort(401, description="Connexion requise.")
    
    user = db.session.get(User, user_id)
    if not user or not user.actif:
        session.pop("user_id", None)
        abort(401, description="Session invalide ou compte desactive.")
    
    return user

def get_current_user_or_none():
    """
    Recupere l'utilisateur connecte, ou None si pas de session.
    Contrairement a get_current_user(), ne leve PAS d'erreur.
    """
    user_id = session.get("user_id")
    if not user_id:
        return None
    
    user = db.session.get(User, user_id)
    if not user or not user.actif:
        return None
    
    return user

def apply_doctor_filter(query, model_class, user=None):
    """
    Applique un filtre de medecin si l'utilisateur est un medecin.
    Si pas d'utilisateur connecte, retourne la query sans filtre.
    """
    if user is None:
        user = get_current_user_or_none()
    
    if user is None:
        return query
    
    # Si c'est un medecin, on filtre par son medecin_id
    if user.role == 'medecin' and user.medecin_id:
        if hasattr(model_class, 'medecin_id'):
            return query.filter(model_class.medecin_id == user.medecin_id)
        elif hasattr(model_class, 'medecin_ref_id'):
            return query.filter(model_class.medecin_ref_id == user.medecin_id)
    
    return query
