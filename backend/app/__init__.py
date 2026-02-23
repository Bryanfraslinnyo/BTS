import os
from flask import Flask
from .extensions import db, ma, migrate, cors
from .config import configs

def create_app(env: str = None) -> Flask:
    """Application Factory."""
    env = env or os.getenv("FLASK_ENV", "development")
    app = Flask(__name__)
    app.config.from_object(configs[env])

    # ── Extensions ────────────────────────────────────
   # ── Extensions ────────────────────────────────────
    db.init_app(app)
    ma.init_app(app)
    migrate.init_app(app, db)
    
    # CORS - accepte toutes les origines en développement
    cors.init_app(
        app,
        resources={r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type"],
        }},
        supports_credentials=True,
    )

    # ── Importer les modèles (nécessaire pour Flask-Migrate) ──
    with app.app_context():
        from . import models  # noqa: F401

    # ── Blueprints ────────────────────────────────────
    from .routes.medecins     import bp as medecins_bp
    from .routes.patients     import bp as patients_bp
    from .routes.consultations import bp as consultations_bp
    from .routes.examens      import bp as examens_bp
    from .routes.stats        import bp as stats_bp
    from .routes.rapports     import bp as rapports_bp
    

    app.register_blueprint(medecins_bp,      url_prefix="/api/medecins")
    app.register_blueprint(patients_bp,      url_prefix="/api/patients")
    app.register_blueprint(consultations_bp, url_prefix="/api/consultations")
    app.register_blueprint(examens_bp,       url_prefix="/api/examens")
    app.register_blueprint(stats_bp,         url_prefix="/api/stats")
    app.register_blueprint(rapports_bp, url_prefix='/api/rapports')  # ← AJOUTER CETTE LIGNE
        
        # Pour debug - afficher toutes les routes
    print("\n" + "="*60)
    print("📍 ROUTES API ENREGISTRÉES :")
    print("="*60)
    for rule in app.url_map.iter_rules():
        if '/api/' in rule.rule:
                print(f"  {list(rule.methods)} {rule.rule}")
        print("="*60 + "\n")

    # ── Commandes CLI ─────────────────────────────────
    @app.cli.command("seed")
    def seed_command():
        """Peuple la base avec les données de démo."""
        from .seed import run_seed
        run_seed(app)

    @app.cli.command("reset-db")
    def reset_db():
        """Supprime et recrée toutes les tables + seed."""
        db.drop_all()
        db.create_all()
        from .seed import run_seed
        run_seed(app)

    # ── Health check ──────────────────────────────────
    @app.get("/api/health")
    def health():
        return {"status": "ok", "env": env}

    return app