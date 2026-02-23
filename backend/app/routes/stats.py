"""
Routes Stats
============
Alimente StatsPage.jsx et DashboardPage.jsx.
Tous les calculs qui étaient côté frontend (useMemo) sont reproduits ici.
"""
from datetime import date
from flask import Blueprint, jsonify
from sqlalchemy import func, extract, case
from app.extensions import db
from app.models import Patient, Consultation, Examen

bp = Blueprint("stats", __name__)


@bp.get("/dashboard")
def dashboard_stats():
    """
    GET /api/stats/dashboard
    Retourne les 4 KPIs du DashboardPage + planning du jour.
    """
    today = date.today()

    total_patients      = Patient.query.filter_by(actif=True).count()
    total_consultations = Consultation.query.count()
    today_consultations = Consultation.query.filter(Consultation.date == today).count()
    terminated          = Consultation.query.filter_by(statut="Terminée").count()
    pending_examens     = Examen.query.filter_by(statut="En attente").count()

    return jsonify({
        "total_patients":       total_patients,
        "total_consultations":  total_consultations,
        "today_consultations":  today_consultations,
        "terminated_consultations": terminated,
        "pending_examens":      pending_examens,
        "completion_rate": round(
            (terminated / total_consultations * 100) if total_consultations else 0, 1
        ),
    })


@bp.get("/monthly")
def monthly_stats():
    """
    GET /api/stats/monthly
    Activité mensuelle (consultations + examens) — AreaChart / BarChart.
    """
    year = date.today().year

    consult_by_month = (
        db.session.query(
            extract("month", Consultation.date).label("mois"),
            func.count(Consultation.id).label("consultations"),
        )
        .filter(extract("year", Consultation.date) == year)
        .group_by("mois")
        .all()
    )

    examen_by_month = (
        db.session.query(
            extract("month", Examen.date).label("mois"),
            func.count(Examen.id).label("examens"),
        )
        .filter(extract("year", Examen.date) == year)
        .group_by("mois")
        .all()
    )

    MOIS_FR = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"]
    c_map   = {int(r.mois): r.consultations for r in consult_by_month}
    e_map   = {int(r.mois): r.examens       for r in examen_by_month}

    data = [
        {
            "mois":          MOIS_FR[i],
            "consultations": c_map.get(i + 1, 0),
            "examens":       e_map.get(i + 1, 0),
        }
        for i in range(12)
    ]
    return jsonify(data)


@bp.get("/by-specialite")
def by_specialite():
    """
    GET /api/stats/by-specialite
    Consultations regroupées par spécialité — BarChart horizontal.
    """
    rows = (
        db.session.query(
            Consultation.specialite.label("name"),
            func.count(Consultation.id).label("value"),
        )
        .group_by(Consultation.specialite)
        .order_by(func.count(Consultation.id).desc())
        .all()
    )
    return jsonify([{"name": r.name, "value": r.value} for r in rows])


@bp.get("/by-statut")
def by_statut():
    """
    GET /api/stats/by-statut
    Consultations par statut — PieChart.
    """
    rows = (
        db.session.query(
            Consultation.statut.label("name"),
            func.count(Consultation.id).label("value"),
        )
        .group_by(Consultation.statut)
        .all()
    )
    return jsonify([{"name": r.name, "value": r.value} for r in rows])


@bp.get("/by-medecin")
def by_medecin():
    """
    GET /api/stats/by-medecin
    Consultations par médecin — barres de progression.
    """
    from app.models import Medecin
    rows = (
        db.session.query(
            func.concat("Dr. ", Medecin.prenom, " ", Medecin.nom).label("name"),
            func.count(Consultation.id).label("value"),
        )
        .join(Medecin, Consultation.medecin_id == Medecin.id)
        .group_by(Medecin.id, Medecin.prenom, Medecin.nom)
        .order_by(func.count(Consultation.id).desc())
        .all()
    )
    return jsonify([{"name": r.name, "value": r.value} for r in rows])


@bp.get("/by-age")
def by_age():
    """
    GET /api/stats/by-age
    Patients par tranche d'âge — compatible MySQL (calcul Python).
    """
    from datetime import date as date_type
    patients_list = Patient.query.filter(
        Patient.actif == True,
        Patient.date_naissance.isnot(None)
    ).all()

    today = date_type.today()
    tranches = {"0-17": 0, "18-30": 0, "31-45": 0, "46-60": 0, "60+": 0}

    for p in patients_list:
        age = (today - p.date_naissance).days // 365
        if age <= 17:
            tranches["0-17"] += 1
        elif age <= 30:
            tranches["18-30"] += 1
        elif age <= 45:
            tranches["31-45"] += 1
        elif age <= 60:
            tranches["46-60"] += 1
        else:
            tranches["60+"] += 1

    return jsonify([
        {"tranche": t, "patients": v}
        for t, v in tranches.items()
    ])