-- =====================================================
-- Création des ENUMs (types énumérés)
-- =====================================================

-- Sexe
CREATE TYPE sexe_enum AS ENUM ('Masculin', 'Féminin');

-- Groupe sanguin
CREATE TYPE groupe_sanguin_enum AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');

-- Spécialité médicale
CREATE TYPE specialite_enum AS ENUM (
    'Médecine Générale', 'Cardiologie', 'Pneumologie', 'Neurologie',
    'Gynécologie', 'Pédiatrie', 'Dermatologie', 'Ophtalmologie',
    'Kinésithérapie', 'Odontologie', 'ORL', 'Traumatologie',
    'Endocrinologie', 'Hépato-Gastroentérologie'
);

-- Type de consultation
CREATE TYPE type_consult_enum AS ENUM (
    'Consultation initiale', 'Consultation de suivi', 'Urgence',
    'Téléconsultation', 'Bilan', 'Consultation pré-opératoire',
    'Odontologie', 'Kinésithérapie'
);

-- Statut de consultation
CREATE TYPE statut_consult_enum AS ENUM ('Planifiée', 'En cours', 'Terminée', 'Annulée');

-- Type d'examen
CREATE TYPE type_examen_enum AS ENUM (
    'Biologie', 'Imagerie', 'Cardiologie', 'Neurologie',
    'Ophtalmologie', 'Microbiologie', 'Anatomo-pathologie', 'Autre'
);

-- Statut d'examen
CREATE TYPE statut_examen_enum AS ENUM ('En attente', 'En cours d''analyse', 'Résultat disponible');

-- Rôle utilisateur
CREATE TYPE user_role_enum AS ENUM ('admin', 'medecin', 'secretaire', 'infirmier');


-- =====================================================
-- Création des tables
-- =====================================================

-- Table medecins
CREATE TABLE medecins (
    id SERIAL PRIMARY KEY,
    prenom VARCHAR(80) NOT NULL,
    nom VARCHAR(80) NOT NULL,
    specialite specialite_enum NOT NULL DEFAULT 'Médecine Générale',
    matricule VARCHAR(40) UNIQUE,
    tel VARCHAR(30),
    email VARCHAR(120) UNIQUE,
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Table patients
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(80) NOT NULL,
    prenom VARCHAR(80) NOT NULL,
    date_naissance DATE,
    sexe sexe_enum NOT NULL DEFAULT 'Masculin',
    telephone VARCHAR(30),
    email VARCHAR(120),
    adresse VARCHAR(255),
    groupe_sanguin groupe_sanguin_enum,
    allergies TEXT DEFAULT 'Aucune',
    antecedents TEXT,
    medecin_ref_id INTEGER REFERENCES medecins(id) ON DELETE SET NULL,
    assurance VARCHAR(80),
    num_assurance VARCHAR(60),
    photo_color VARCHAR(10) NOT NULL DEFAULT '#1565C0',
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Table consultations
CREATE TABLE consultations (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    medecin_id INTEGER REFERENCES medecins(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    heure TIME,
    type_consult type_consult_enum NOT NULL DEFAULT 'Consultation initiale',
    specialite specialite_enum NOT NULL DEFAULT 'Médecine Générale',
    motif TEXT NOT NULL,
    statut statut_consult_enum NOT NULL DEFAULT 'Planifiée',
    poids NUMERIC(5, 2),
    taille NUMERIC(5, 1),
    temperature NUMERIC(4, 1),
    pouls SMALLINT,
    saturation NUMERIC(4, 1),
    tension VARCHAR(20),
    notes_cliniques TEXT,
    diagnostic TEXT,
    ordonnance TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Table examens
CREATE TABLE examens (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    consultation_id INTEGER REFERENCES consultations(id) ON DELETE SET NULL,
    medecin_id INTEGER REFERENCES medecins(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    type_examen type_examen_enum NOT NULL DEFAULT 'Biologie',
    nom VARCHAR(200) NOT NULL,
    statut statut_examen_enum NOT NULL DEFAULT 'En attente',
    resultat TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Table users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(60) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nom VARCHAR(120) NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'medecin',
    role_label VARCHAR(120),
    photo_color VARCHAR(10) NOT NULL DEFAULT '#1565C0',
    medecin_id INTEGER REFERENCES medecins(id) ON DELETE SET NULL,
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    derniere_connexion TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
