"""Tests unitaires des modèles IUG Health."""
from datetime import date, time
from app.models import Medecin, Patient, Consultation, Examen


def test_medecin_nom_complet(db):
    m = Medecin(prenom="Ibrahim", nom="Bah", specialite="Cardiologie")
    db.session.add(m)
    db.session.commit()
    assert m.nom_complet == "Dr. Ibrahim Bah"


def test_patient_creation(db):
    p = Patient(
        nom="Diallo", prenom="Amadou",
        date_naissance=date(1985, 3, 12),
        sexe="Masculin", groupe_sanguin="B+",
    )
    db.session.add(p)
    db.session.commit()
    assert p.nom_complet == "Amadou Diallo"
    assert p.nb_consultations == 0


def test_consultation_imc(db):
    m = Medecin(prenom="Test", nom="Doc", specialite="Médecine Générale")
    p = Patient(nom="Test", prenom="Patient", sexe="Masculin")
    db.session.add_all([m, p])
    db.session.flush()

    c = Consultation(
        patient_id=p.id, medecin_id=m.id,
        date=date.today(), heure=time(9, 0),
        type_consult="Consultation initiale",
        specialite="Médecine Générale",
        motif="Test", statut="Planifiée",
        poids=70, taille=175,
    )
    db.session.add(c)
    db.session.commit()
    # IMC = 70 / (1.75)^2 = 22.9
    assert c.imc == 22.9


def test_cascade_delete_patient(db):
    m = Medecin(prenom="Cascade", nom="Doc", specialite="Cardiologie")
    p = Patient(nom="Del", prenom="Test", sexe="Féminin")
    db.session.add_all([m, p])
    db.session.flush()

    c = Consultation(
        patient_id=p.id, medecin_id=m.id,
        date=date.today(), heure=time(10, 0),
        type_consult="Urgence", specialite="Cardiologie",
        motif="Urgence test", statut="En cours",
    )
    db.session.add(c)
    db.session.flush()

    e = Examen(
        patient_id=p.id, consultation_id=c.id,
        date=date.today(), type_examen="Biologie",
        nom="NFS", statut="En attente",
    )
    db.session.add(e)
    db.session.commit()

    cid, eid = c.id, e.id

    # Supprimer patient → cascade consultation + examen
    db.session.delete(p)
    db.session.commit()

    assert Consultation.query.get(cid) is None
    assert Examen.query.get(eid) is None