import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    # ── Core ──────────────────────────────────────────
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
    DEBUG = False
    TESTING = False

    # ── Database ──────────────────────────────────────
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        # Format MySQL : mysql+pymysql://user:pass@host:port/db?charset=utf8mb4
        "mysql+pymysql://root:@localhost:3306/iug_health_db?charset=utf8mb4",
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False

    # Options MySQL : reconnexion automatique + charset
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,     # teste la connexion avant utilisation
        "pool_recycle":  3600,     # recycle les connexions toutes les heures
        "connect_args": {
            "charset": "utf8mb4",  # obligatoire pour les accents et emojis
        },
    }

    # ── CORS ──────────────────────────────────────────
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

    # ── Session ───────────────────────────────────────
    SESSION_COOKIE_HTTPONLY  = True
    SESSION_COOKIE_SAMESITE  = "Lax"
    PERMANENT_SESSION_LIFETIME = 86400  # 24h en secondes

    # ── JSON ──────────────────────────────────────────
    JSON_SORT_KEYS = False


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_ECHO = True


class ProductionConfig(Config):
    DEBUG = False


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SQLALCHEMY_ECHO = False


configs = {
    "development": DevelopmentConfig,
    "production":  ProductionConfig,
    "testing":     TestingConfig,
}