# Migrations MySQL — IUG Health Backend

Ce guide liste **tous les fichiers à modifier** pour passer de PostgreSQL à MySQL.

---

## 1. `requirements.txt` ✅ déjà modifié

Remplacer `psycopg2-binary` par le driver MySQL :

```
# Supprimer :
psycopg2-binary==2.9.9

# Ajouter :
PyMySQL==1.1.1
cryptography==42.0.8      # requis par PyMySQL pour l'auth MySQL 8+
```

---

## 2. `.env` / `.env.example` — URL de connexion

```ini
# PostgreSQL (ancien)
DATABASE_URL=postgresql://iug_user:iug_pass@localhost:5432/iug_health_db

# MySQL (nouveau)
DATABASE_URL=mysql+pymysql://iug_user:iug_pass@localhost:3306/iug_health_db?charset=utf8mb4
```

> Le paramètre `charset=utf8mb4` est **obligatoire** pour supporter les caractères
> accentués (é, è, ç…) et les emojis présents dans les données médicales.

---

## 3. `app/config.py` — ajouter les options MySQL

```python
class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", ...)

    # Ajouter ce bloc pour MySQL :
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping":    True,          # détecte les connexions mortes
        "pool_recycle":     3600,          # recycle les connexions toutes les heures
        "connect_args": {
            "charset": "utf8mb4",
        },
    }
```

---

## 4. `app/models/consultation.py` — ENUM dupliqué

MySQL ne supporte pas le paramètre `create_constraint=False` de SQLAlchemy.
Il faut **un seul** ENUM `specialite_enum` dans toute la base.

**Modifier** `consultation.py`, remplacer :

```python
# AVANT — cause une erreur MySQL (CREATE TYPE non supporté)
SPECIALITE_ENUM = db.Enum(
    "Médecine Générale", ...,
    name="specialite_enum",
    create_constraint=False,   # ← supprimer cette ligne
)
```

**Par** un import depuis `medecin.py` :

```python
# APRÈS — réutiliser l'enum défini dans medecin.py
from .medecin import SPECIALITE_ENUM   # ← importer au lieu de recréer
```

Et dans `medecin.py`, extraire l'enum à part :

```python
# medecin.py — déplacer en haut du fichier
SPECIALITE_ENUM = db.Enum(
    "Médecine Générale", "Cardiologie", "Pneumologie", "Neurologie",
    "Gynécologie", "Pédiatrie", "Dermatologie", "Ophtalmologie",
    "ORL", "Traumatologie", "Endocrinologie", "Hépato-Gastroentérologie",
    name="specialite_enum",
)
```

> **Note MySQL** : les ENUMs MySQL sont définis inline dans la colonne,
> pas comme des types séparés (contrairement à PostgreSQL).
> SQLAlchemy gère ça automatiquement — `name=` est ignoré sur MySQL.

---

## 5. `app/models/base.py` — `TimestampMixin` sans `timezone`

MySQL 5.7 ne supporte pas `DATETIME(timezone=True)`.
MySQL 8+ le supporte partiellement.

**Modifier** :

```python
# AVANT
created_at = db.Column(db.DateTime(timezone=True), ...)
updated_at = db.Column(db.DateTime(timezone=True), ...)

# APRÈS (compatible MySQL 5.7+)
created_at = db.Column(db.DateTime, ...)
updated_at = db.Column(db.DateTime, ...)
```

Et dans `user.py` :

```python
# AVANT
derniere_connexion = db.Column(db.DateTime(timezone=True), nullable=True)

# APRÈS
derniere_connexion = db.Column(db.DateTime, nullable=True)
```

---

## 6. `app/models/patient.py` — `ENUM` réutilisé

```python
# AVANT (crée un type PostgreSQL)
SEXE_ENUM = db.Enum("Masculin", "Féminin", name="sexe_enum")
GROUPE_SANGUIN_ENUM = db.Enum("A+", ..., name="groupe_sanguin_enum")

# APRÈS (MySQL inline, pas de name nécessaire mais laissez-le pour la lisibilité)
# Pas de changement de code requis — SQLAlchemy gère automatiquement la différence.
# Juste supprimer si vous avez des erreurs "type already exists"
```

---

## 7. `app/routes/stats.py` — `date_part` → `YEAR`/`MONTH`

La fonction `date_part` est spécifique à PostgreSQL.

**Modifier** `stats.py` :

```python
# AVANT (PostgreSQL)
from sqlalchemy import extract
extract("month", Consultation.date)
extract("year", Consultation.date)

# APRÈS (MySQL — extract fonctionne aussi, pas de changement !)
# SQLAlchemy traduit automatiquement extract() pour MySQL.
# PAS DE MODIFICATION REQUISE pour extract().
```

**Mais** dans `by_age()`, `func.date_part` est PostgreSQL-only :

```python
# AVANT (PostgreSQL uniquement)
func.date_part("year", func.age(Patient.date_naissance))

# APRÈS (MySQL compatible)
from sqlalchemy import func
from datetime import date

# Remplacer la méthode by_age() entièrement par du Python :
@bp.get("/by-age")
def by_age():
    patients = Patient.query.filter(
        Patient.actif == True,
        Patient.date_naissance.isnot(None)
    ).all()

    today = date.today()
    tranches = {"0-17": 0, "18-30": 0, "31-45": 0, "46-60": 0, "60+": 0}

    for p in patients:
        age = (today - p.date_naissance).days // 365
        if age <= 17:        tranches["0-17"]  += 1
        elif age <= 30:      tranches["18-30"] += 1
        elif age <= 45:      tranches["31-45"] += 1
        elif age <= 60:      tranches["46-60"] += 1
        else:                tranches["60+"]   += 1

    return jsonify([
        {"tranche": t, "patients": v}
        for t, v in tranches.items()
    ])
```

---

## 8. Création de la base MySQL

```sql
-- Connexion en root MySQL :
CREATE DATABASE iug_health_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE USER 'iug_user'@'localhost' IDENTIFIED BY 'iug_pass';
GRANT ALL PRIVILEGES ON iug_health_db.* TO 'iug_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 9. Initialisation et démarrage

```bash
# 1. Installer les dépendances
pip install -r requirements.txt

# 2. Copier et configurer l'env
cp .env.example .env
# Éditer DATABASE_URL dans .env

# 3. Initialiser Flask-Migrate
flask db init
flask db migrate -m "initial"
flask db upgrade

# 4. Peupler avec les données de démo
flask seed

# 5. Lancer
flask run
```

---

## Récapitulatif des fichiers à modifier

| Fichier | Modification |
|---|---|
| `requirements.txt` | ✅ déjà fait — `psycopg2` → `PyMySQL + cryptography` |
| `.env` | `DATABASE_URL` → `mysql+pymysql://...?charset=utf8mb4` |
| `app/config.py` | Ajouter `SQLALCHEMY_ENGINE_OPTIONS` avec `pool_pre_ping` |
| `app/models/base.py` | `DateTime(timezone=True)` → `DateTime` |
| `app/models/user.py` | `DateTime(timezone=True)` → `DateTime` |
| `app/models/medecin.py` | Extraire `SPECIALITE_ENUM` en haut du fichier |
| `app/models/consultation.py` | Importer `SPECIALITE_ENUM` depuis `medecin.py` |
| `app/routes/stats.py` | Réécrire `by_age()` sans `func.date_part` |
| SQL init | Créer la base avec `utf8mb4` |
