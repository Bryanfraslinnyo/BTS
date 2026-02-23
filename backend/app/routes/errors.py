from flask import jsonify
from marshmallow import ValidationError
from sqlalchemy.exc import IntegrityError


def register_error_handlers(app):
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"error": "Requête invalide", "detail": str(e)}), 400

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Ressource introuvable"}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({"error": "Méthode non autorisée"}), 405

    @app.errorhandler(422)
    def unprocessable(e):
        return jsonify({"error": "Données invalides", "detail": str(e)}), 422

    @app.errorhandler(ValidationError)
    def marshmallow_error(e):
        return jsonify({"error": "Validation échouée", "messages": e.messages}), 422

    @app.errorhandler(IntegrityError)
    def integrity_error(e):
        return jsonify({"error": "Conflit de données (doublon ou contrainte violée)"}), 409

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Erreur serveur interne"}), 500