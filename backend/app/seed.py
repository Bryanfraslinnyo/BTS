"""
Script de seed — IUG Health
============================
Peuple la base de données avec les mêmes données que seedData.js
pour garantir la cohérence frontend / backend.

Usage :
    flask seed        (via commande CLI custom)
    python -m app.seed
"""
from datetime import date, time
from app.extensions import db
from app.models import Medecin, Patient, Consultation, Examen


def run_seed(app):
    with app.app_context():
        # Évite les doublons
        if Medecin.query.count() > 0:
            print("Base deja peuplee, seed ignore.")
            return

        print(" Peuplement de la base de données...")

        # ── Médecins ─────────────────────────────────────
        medecins = [
            Medecin(prenom="Ibrahim",   nom="Bah",     specialite="Cardiologie"),
            Medecin(prenom="Oumou",     nom="Sylla",   specialite="Médecine Générale"),
            Medecin(prenom="Boubacar",  nom="Keita",   specialite="Pneumologie"),
            Medecin(prenom="Aminata",   nom="Diallo",  specialite="Gynécologie"),
            Medecin(prenom="Souleymane",nom="Condé",   specialite="Pédiatrie"),
            Medecin(prenom="Mariama",   nom="Traoré",  specialite="Médecine Générale"),
        ]
        db.session.add_all(medecins)
        db.session.flush()

        bah_id, sylla_id, keita_id, diallo_id = (
            medecins[0].id, medecins[1].id, medecins[2].id, medecins[3].id
        )

        # ── Patients ──────────────────────────────────────
        patients = [
            Patient(
                nom="Diallo", prenom="Amadou",
                date_naissance=date(1985, 3, 12),
                sexe="Masculin", telephone="+224 621 123 456",
                email="amadou.diallo@email.com", adresse="Kaloum, Conakry",
                groupe_sanguin="B+", allergies="Pénicilline",
                antecedents="Hypertension artérielle",
                medecin_ref_id=bah_id,
                assurance="CNSS", num_assurance="CNSS-2024-001",
                photo_color="#1565C0",
            ),
            Patient(
                nom="Camara", prenom="Fatoumata",
                date_naissance=date(1992, 7, 25),
                sexe="Féminin", telephone="+224 655 234 567",
                email="fatoumata.camara@email.com", adresse="Matam, Conakry",
                groupe_sanguin="O+", allergies="Aucune",
                antecedents="Diabète type 2",
                medecin_ref_id=sylla_id,
                assurance="SOTELGUI", num_assurance="SOT-2023-452",
                photo_color="#7B1FA2",
            ),
            Patient(
                nom="Bah", prenom="Mamadou",
                date_naissance=date(1978, 11, 8),
                sexe="Masculin", telephone="+224 664 345 678",
                email="mamadou.bah@email.com", adresse="Ratoma, Conakry",
                groupe_sanguin="A+", allergies="Aspirine, Ibuprofène",
                antecedents="Asthme chronique",
                medecin_ref_id=keita_id,
                assurance="CBAO", num_assurance="CBAO-0055-78",
                photo_color="#2E7D32",
            ),
            Patient(
                nom="Kouyaté", prenom="Mariama",
                date_naissance=date(1999, 2, 14),
                sexe="Féminin", telephone="+224 628 456 789",
                email="mariama.kouyate@email.com", adresse="Dixinn, Conakry",
                groupe_sanguin="AB+", allergies="Latex",
                antecedents="Aucun antécédent notable",
                medecin_ref_id=bah_id,
                assurance="Privée", num_assurance="PRIV-2024-789",
                photo_color="#F57C00",
            ),
            Patient(
                nom="Soumah", prenom="Ibrahima",
                date_naissance=date(1965, 6, 30),
                sexe="Masculin", telephone="+224 622 567 890",
                email="ibrahima.soumah@email.com", adresse="Lambanyi, Conakry",
                groupe_sanguin="O-", allergies="Morphine",
                antecedents="Diabète, Hypertension artérielle",
                medecin_ref_id=keita_id,
                assurance="CNSS", num_assurance="CNSS-2019-334",
                photo_color="#00ACC1",
            ),
            Patient(
                nom="Condé", prenom="Aissatou",
                date_naissance=date(2005, 9, 1),
                sexe="Féminin", telephone="+224 610 678 901",
                email="aissatou.conde@email.com", adresse="Hamdallaye, Conakry",
                groupe_sanguin="A-", allergies="Aucune",
                antecedents="Aucun",
                medecin_ref_id=sylla_id,
                assurance="FONAC", num_assurance="FNC-2023-901",
                photo_color="#C62828",
            ),
        ]
        db.session.add_all(patients)
        db.session.flush()

        p1, p2, p3, p4, p5, p6 = [p.id for p in patients]

        # ── Consultations ─────────────────────────────────
        today = date.today()
        consultations = [
            Consultation(
                patient_id=p1, medecin_id=bah_id,
                date=date(2025, 11, 10), heure=time(9, 0),
                type_consult="Consultation de suivi", specialite="Cardiologie",
                motif="Contrôle tension artérielle mensuel", statut="Terminée",
                diagnostic="HTA bien contrôlée sous traitement en cours",
                ordonnance="Amlodipine 5mg – 1cp/j\nRamipril 5mg – 1cp/j soir",
                notes_cliniques="Patient coopératif. TA: 130/80 mmHg. Bonne tolérance.",
                poids=78, taille=175, temperature=36.8, pouls=72, saturation=98, tension="130/80",
            ),
            Consultation(
                patient_id=p2, medecin_id=sylla_id,
                date=date(2025, 11, 12), heure=time(10, 30),
                type_consult="Consultation de suivi", specialite="Médecine Générale",
                motif="Glycémie élevée et fatigue persistante", statut="Terminée",
                diagnostic="Déséquilibre glycémique – à rééquilibrer",
                ordonnance="Metformine 850mg – 2cp/j aux repas\nRégime alimentaire strict conseillé",
                notes_cliniques="Glycémie à jeun: 1.8 g/L. HbA1c en cours.",
                poids=65, taille=162, temperature=37.0, pouls=78, saturation=97, tension="120/75",
            ),
            Consultation(
                patient_id=p3, medecin_id=keita_id,
                date=date(2025, 11, 14), heure=time(14, 0),
                type_consult="Urgence", specialite="Pneumologie",
                motif="Crise d'asthme sévère – difficultés respiratoires", statut="Terminée",
                diagnostic="Exacerbation asthmatique sévère",
                ordonnance="Salbutamol spray – 2 bouffées/4h pendant 5j\nPrednisolone 40mg – 1cp/j pendant 5j",
                notes_cliniques="Patient stabilisé après nébulisation. DEP: 320 L/min à l'arrivée.",
                poids=82, taille=180, temperature=37.2, pouls=95, saturation=94, tension="125/85",
            ),
            Consultation(
                patient_id=p1, medecin_id=bah_id,
                date=date(2025, 11, 18), heure=time(11, 0),
                type_consult="Bilan", specialite="Cardiologie",
                motif="Bilan annuel cardiovasculaire complet", statut="Terminée",
                diagnostic="Bilan cardiovasculaire satisfaisant",
                ordonnance="Continuer traitement antihypertenseur en cours\nEcho-cardiographie programmée dans 3 mois",
                notes_cliniques="ECG normal. Pas d'anomalie détectée.",
                poids=79, taille=175, temperature=36.6, pouls=70, saturation=99, tension="128/78",
            ),
            Consultation(
                patient_id=p4, medecin_id=bah_id,
                date=date(2025, 11, 20), heure=time(9, 30),
                type_consult="Consultation initiale", specialite="Gynécologie",
                motif="Douleurs abdominales basses récurrentes", statut="Terminée",
                diagnostic="Dysménorrhée primaire",
                ordonnance="Ibuprofène 400mg – selon besoin (max 3/j)\nÉchographie pelvienne à programmer",
                notes_cliniques="Patiente anxieuse. Examen clinique normal. Cycles irréguliers depuis 6 mois.",
                poids=58, taille=165, temperature=36.9, pouls=80, saturation=99, tension="115/70",
            ),
            Consultation(
                patient_id=p5, medecin_id=keita_id,
                date=date(2025, 11, 22), heure=time(15, 0),
                type_consult="Consultation de suivi", specialite="Médecine Générale",
                motif="Suivi trimestriel diabète et hypertension", statut="Terminée",
                diagnostic="Comorbidités chroniques globalement équilibrées",
                ordonnance="Metformine 1000mg – 2cp/j\nAmlodipine 10mg – 1cp/j matin\nContrôle dans 3 mois",
                notes_cliniques="Glycémie: 1.4 g/L. TA: 135/85 mmHg. IMC: 31.1 – surpoids.",
                poids=90, taille=170, temperature=37.1, pouls=76, saturation=97, tension="135/85",
            ),
            Consultation(
                patient_id=p2, medecin_id=sylla_id,
                date=today, heure=time(11, 0),
                type_consult="Consultation de suivi", specialite="Médecine Générale",
                motif="Suivi mensuel glycémie", statut="En cours",
                poids=65, taille=162, temperature=37.0, pouls=75, saturation=98, tension="118/74",
            ),
            Consultation(
                patient_id=p6, medecin_id=sylla_id,
                date=today, heure=time(14, 30),
                type_consult="Consultation initiale", specialite="Pédiatrie",
                motif="Fièvre persistante depuis 3 jours – 38.5°C", statut="Planifiée",
                poids=52, taille=160, temperature=38.5, pouls=90, saturation=96, tension="110/70",
            ),
        ]
        db.session.add_all(consultations)
        db.session.flush()

        c1, c2, c3, c4, c5, c6 = [c.id for c in consultations[:6]]

        # ── Examens ───────────────────────────────────────
        examens = [
            Examen(
                patient_id=p1, consultation_id=c1, medecin_id=bah_id,
                date=date(2025, 11, 10), type_examen="Biologie",
                nom="Bilan lipidique complet", statut="Résultat disponible",
                resultat="Cholestérol total: 5.2 mmol/L\nLDL: 3.1 mmol/L\nHDL: 1.4 mmol/L\nTriglycérides: 1.8 mmol/L",
            ),
            Examen(
                patient_id=p2, consultation_id=c2, medecin_id=sylla_id,
                date=date(2025, 11, 12), type_examen="Biologie",
                nom="HbA1c + Glycémie à jeun", statut="Résultat disponible",
                resultat="HbA1c: 8.2%\nGlycémie à jeun: 1.8 g/L\nInsuline: 14.2 µUI/mL",
            ),
            Examen(
                patient_id=p3, consultation_id=c3, medecin_id=keita_id,
                date=date(2025, 11, 14), type_examen="Imagerie",
                nom="Radiographie thoracique F+P", statut="Résultat disponible",
                resultat="Surcharge hilaire bilatérale modérée. Pas de pneumothorax.",
            ),
            Examen(
                patient_id=p1, consultation_id=c4, medecin_id=bah_id,
                date=date(2025, 11, 18), type_examen="Cardiologie",
                nom="ECG 12 dérivations", statut="Résultat disponible",
                resultat="Rythme sinusal régulier. FC: 70 bpm. Axe normal. Pas d'anomalie.",
            ),
            Examen(
                patient_id=p5, consultation_id=c6, medecin_id=keita_id,
                date=date(2025, 11, 22), type_examen="Biologie",
                nom="Bilan rénal + glycémie + NFS", statut="En attente",
            ),
            Examen(
                patient_id=p4, consultation_id=c5, medecin_id=bah_id,
                date=date(2025, 11, 20), type_examen="Imagerie",
                nom="Échographie pelvienne", statut="En cours d'analyse",
            ),
        ]
        db.session.add_all(examens)
        db.session.commit()

        print(f"  - {len(medecins)} medecins")
        print(f"  - {len(patients)} patients")
        print(f"  - {len(consultations)} consultations")
        print(f"  - {len(examens)} examens")

        # ── Utilisateurs ──────────────────────────────────
        from app.models.user import User

        users_data = [
            dict(username="bah.ibrahim",   password="iug2024",  nom="Bah Ibrahim",
                 role="medecin",    role_label="Médecin Chef · Cardiologie",
                 photo_color="#1565C0", medecin_id=medecins[0].id),
            dict(username="sylla.oumou",   password="iug2024",  nom="Sylla Oumou",
                 role="medecin",    role_label="Médecin · Médecine Générale",
                 photo_color="#7B1FA2", medecin_id=medecins[1].id),
            dict(username="keita.boubacar",password="iug2024",  nom="Keita Boubacar",
                 role="medecin",    role_label="Médecin · Pneumologie",
                 photo_color="#2E7D32", medecin_id=medecins[2].id),
            dict(username="labo.test",     password="labo123",  nom="Labo Tech",
                 role="laborantin", role_label="Technicien de Laboratoire",
                 photo_color="#00695C", medecin_id=None),
            dict(username="admin",         password="admin123", nom="Administrateur",
                 role="admin",      role_label="Administrateur système",
                 photo_color="#F57C00", medecin_id=None),
        ]
        for ud in users_data:
            u = User(
                username=ud["username"], nom=ud["nom"],
                role=ud["role"], role_label=ud["role_label"],
                photo_color=ud["photo_color"], medecin_id=ud["medecin_id"],
            )
            u.set_password(ud["password"])
            db.session.add(u)

        db.session.commit()
        print(f"  - {len(users_data)} utilisateurs")
        print(" Seed termine avec succes !")