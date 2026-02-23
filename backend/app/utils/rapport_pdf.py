"""
Génération de rapports médicaux en PDF
Utilise ReportLab pour créer des rapports professionnels
"""

from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, Image, KeepTogether
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from datetime import datetime
import io
from typing import Dict, List, Any


class RapportMedicalPDF:
    """Générateur de rapports médicaux en PDF"""
    
    def __init__(self, pagesize=A4):
        self.pagesize = pagesize
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Configuration des styles personnalisés"""
        # Titre principal
        self.styles.add(ParagraphStyle(
            name='TitrePrincipal',
            parent=self.styles['Heading1'],
            fontSize=18,
            textColor=colors.HexColor('#2c3e50'),
            spaceAfter=20,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        # Sous-titre
        self.styles.add(ParagraphStyle(
            name='SousTitre',
            parent=self.styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#34495e'),
            spaceAfter=12,
            spaceBefore=12,
            fontName='Helvetica-Bold'
        ))
        
        # Section
        self.styles.add(ParagraphStyle(
            name='Section',
            parent=self.styles['Heading3'],
            fontSize=12,
            textColor=colors.HexColor('#2980b9'),
            spaceAfter=6,
            spaceBefore=10,
            fontName='Helvetica-Bold'
        ))
        
        # Corps de texte
        self.styles.add(ParagraphStyle(
            name='CorpsTexte',
            parent=self.styles['Normal'],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#2c3e50')
        ))
        
        # Petit texte (notes)
        self.styles.add(ParagraphStyle(
            name='PetitTexte',
            parent=self.styles['Normal'],
            fontSize=8,
            textColor=colors.HexColor('#7f8c8d'),
            leading=10
        ))
        
        # En-tête
        self.styles.add(ParagraphStyle(
            name='EnTete',
            parent=self.styles['Normal'],
            fontSize=9,
            textColor=colors.HexColor('#95a5a6'),
            alignment=TA_RIGHT
        ))
    
    def _create_header(self, etablissement: str = "Centre Médical"):
        """Créer l'en-tête du document"""
        elements = []
        
        # Logo / Nom de l'établissement
        title = Paragraph(
            f"<b>{etablissement}</b>",
            self.styles['TitrePrincipal']
        )
        elements.append(title)
        
        # Date de génération
        date_gen = datetime.now().strftime("%d/%m/%Y à %H:%M")
        date_para = Paragraph(
            f"<i>Document généré le {date_gen}</i>",
            self.styles['PetitTexte']
        )
        elements.append(date_para)
        elements.append(Spacer(1, 0.3 * inch))
        
        return elements
    
    def _create_patient_header(self, patient: Dict[str, Any]):
        """Créer l'en-tête patient"""
        elements = []
        
        # Calculer l'âge
        age = ""
        if patient.get('dob'):  # Changé de 'date_naissance' à 'dob'
            from datetime import date
            dob = patient['dob']
            if isinstance(dob, str):
                dob = datetime.strptime(dob, '%Y-%m-%d').date()
            today = date.today()
            age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
            age = f"{age} ans"
        
        # Informations patient dans un tableau
        patient_data = [
            ['Patient:', f"{patient.get('prenom', '')} {patient.get('nom', '')}"],
            ['Date de naissance:', f"{patient.get('dob', '')} ({age})"],
            ['Sexe:', patient.get('sexe', '')],
            ['Groupe sanguin:', patient.get('groupe_sanguin', '')],
            ['Téléphone:', patient.get('tel', '')],  # Changé de 'telephone' à 'tel'
        ]
        
        if patient.get('allergies') and patient.get('allergies') != 'Aucune':
            patient_data.append(['Allergies:', patient.get('allergies')])
        
        table = Table(patient_data, colWidths=[2*inch, 4*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#ecf0f1')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#2c3e50')),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('PADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#bdc3c7')),
        ]))
        
        elements.append(table)
        elements.append(Spacer(1, 0.3 * inch))
        
        return elements
    
    def generer_fiche_patient(self, patient: Dict, consultations: List[Dict], 
                              examens: List[Dict], output_path: str):
        """Générer une fiche patient complète"""
        doc = SimpleDocTemplate(output_path, pagesize=self.pagesize)
        story = []
        
        # En-tête
        story.extend(self._create_header())
        
        # Titre
        title = Paragraph("FICHE PATIENT", self.styles['TitrePrincipal'])
        story.append(title)
        story.append(Spacer(1, 0.2 * inch))
        
        # Informations patient
        story.extend(self._create_patient_header(patient))
        
        # Antécédents
        if patient.get('antecedents'):
            story.append(Paragraph("Antécédents médicaux", self.styles['Section']))
            story.append(Paragraph(patient['antecedents'], self.styles['CorpsTexte']))
            story.append(Spacer(1, 0.2 * inch))
        
        # Médecin référent
        medecin_ref = patient.get('medecin_ref')
        if medecin_ref:
            story.append(Paragraph("Médecin référent", self.styles['Section']))
            # Si c'est une chaîne, l'utiliser directement
            if isinstance(medecin_ref, str):
                medecin_text = medecin_ref
            else:
                # Si c'est un dictionnaire, formater
                medecin_text = f"Dr. {medecin_ref.get('prenom', '')} {medecin_ref.get('nom', '')} - {medecin_ref.get('specialite', '')}"
            story.append(Paragraph(medecin_text, self.styles['CorpsTexte']))
            story.append(Spacer(1, 0.2 * inch))
        
        # Historique des consultations
        if consultations:
            story.append(PageBreak())
            story.append(Paragraph(f"Historique des consultations ({len(consultations)})", 
                                 self.styles['SousTitre']))
            story.append(Spacer(1, 0.1 * inch))
            
            for consultation in sorted(consultations, key=lambda x: x.get('date', ''), reverse=True):
                story.extend(self._format_consultation(consultation))
        
        # Examens médicaux
        if examens:
            story.append(PageBreak())
            story.append(Paragraph(f"Examens médicaux ({len(examens)})", 
                                 self.styles['SousTitre']))
            story.append(Spacer(1, 0.1 * inch))
            
            for examen in sorted(examens, key=lambda x: x.get('date', ''), reverse=True):
                story.extend(self._format_examen(examen))
        
        # Générer le PDF
        doc.build(story)
        return output_path
    
    def _format_consultation(self, consultation: Dict):
        """Formatter une consultation pour le PDF"""
        elements = []
        
        # Date et type
        date_str = consultation.get('date', '')
        heure_str = consultation.get('heure', '')
        type_str = consultation.get('type', 'Consultation')  # Changé de 'type_consult' à 'type'
        
        title = f"<b>{type_str}</b> - {date_str} {heure_str}"
        elements.append(Paragraph(title, self.styles['Section']))
        
        # Tableau des informations
        data = []
        
        medecin = consultation.get('medecin')
        if medecin:
            if isinstance(medecin, str):
                data.append(['Médecin:', medecin])
            else:
                data.append(['Médecin:', f"Dr. {medecin.get('prenom', '')} {medecin.get('nom', '')} - {medecin.get('specialite', '')}"])
        
        data.append(['Spécialité:', consultation.get('specialite', '')])
        data.append(['Statut:', consultation.get('statut', '')])
        data.append(['Motif:', consultation.get('motif', '')])
        
        if data:
            table = Table(data, colWidths=[1.5*inch, 4.5*inch])
            table.setStyle(TableStyle([
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('PADDING', (0, 0), (-1, -1), 6),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ]))
            elements.append(table)
        
        # Diagnostic
        if consultation.get('diagnostic'):
            elements.append(Spacer(1, 0.1 * inch))
            elements.append(Paragraph("<b>Diagnostic:</b>", self.styles['CorpsTexte']))
            elements.append(Paragraph(consultation['diagnostic'], self.styles['CorpsTexte']))
        
        # Ordonnance
        if consultation.get('ordonnance'):
            elements.append(Spacer(1, 0.1 * inch))
            elements.append(Paragraph("<b>Ordonnance:</b>", self.styles['CorpsTexte']))
            # Traiter chaque ligne de l'ordonnance
            for ligne in consultation['ordonnance'].split('\n'):
                if ligne.strip():
                    elements.append(Paragraph(f"• {ligne.strip()}", self.styles['CorpsTexte']))
        
        elements.append(Spacer(1, 0.3 * inch))
        
        return elements
    
    def _format_examen(self, examen: Dict):
        """Formatter un examen pour le PDF"""
        elements = []
        
        # Date et nom
        date_str = examen.get('date', '')
        nom = examen.get('nom', 'Examen')
        type_exam = examen.get('type', '')  # Changé de 'type_examen' à 'type'
        
        title = f"<b>{nom}</b> ({type_exam}) - {date_str}"
        elements.append(Paragraph(title, self.styles['Section']))
        
        # Informations
        data = [
            ['Type:', type_exam],
            ['Statut:', examen.get('statut', '')],
        ]
        
        medecin = examen.get('medecin')
        if medecin:
            if isinstance(medecin, str):
                data.append(['Prescripteur:', medecin])
            else:
                data.append(['Prescripteur:', f"Dr. {medecin.get('prenom', '')} {medecin.get('nom', '')}"])
        
        table = Table(data, colWidths=[1.5*inch, 4.5*inch])
        table.setStyle(TableStyle([
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('PADDING', (0, 0), (-1, -1), 6),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ]))
        elements.append(table)
        
        # Résultats
        if examen.get('resultat'):
            elements.append(Spacer(1, 0.1 * inch))
            elements.append(Paragraph("<b>Résultats:</b>", self.styles['CorpsTexte']))
            elements.append(Paragraph(examen['resultat'], self.styles['CorpsTexte']))
        
        elements.append(Spacer(1, 0.3 * inch))
        
        return elements
    
    def generer_rapport_consultation(self, consultation: Dict, patient: Dict, output_path: str):
        """Générer un rapport de consultation"""
        doc = SimpleDocTemplate(output_path, pagesize=self.pagesize)
        story = []
        
        # En-tête
        story.extend(self._create_header())
        
        # Titre
        title = Paragraph("RAPPORT DE CONSULTATION", self.styles['TitrePrincipal'])
        story.append(title)
        story.append(Spacer(1, 0.2 * inch))
        
        # Informations patient
        story.extend(self._create_patient_header(patient))
        
        # Détails de la consultation
        story.append(Paragraph("Détails de la consultation", self.styles['SousTitre']))
        story.append(Spacer(1, 0.1 * inch))
        
        # Informations générales
        data = [
            ['Date:', f"{consultation.get('date', '')} {consultation.get('heure', '')}"],
            ['Type:', consultation.get('type', '')],  # Changé
            ['Spécialité:', consultation.get('specialite', '')],
            ['Statut:', consultation.get('statut', '')],
        ]
        
        medecin = consultation.get('medecin')
        if medecin:
            if isinstance(medecin, str):
                data.append(['Médecin:', medecin])
            else:
                data.append(['Médecin:', f"Dr. {medecin.get('prenom', '')} {medecin.get('nom', '')} - {medecin.get('specialite', '')}"])
        
        table = Table(data, colWidths=[2*inch, 4*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#ecf0f1')),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('PADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#bdc3c7')),
        ]))
        story.append(table)
        story.append(Spacer(1, 0.2 * inch))
        
        # Motif
        story.append(Paragraph("Motif de consultation", self.styles['Section']))
        story.append(Paragraph(consultation.get('motif', ''), self.styles['CorpsTexte']))
        story.append(Spacer(1, 0.2 * inch))
        
        # Examen clinique
        if consultation.get('notes'):  # Changé de 'notes_cliniques' à 'notes'
            story.append(Paragraph("Examen clinique", self.styles['Section']))
            
            # Constantes vitales
            constantes_data = []
            if consultation.get('poids'):
                constantes_data.append(['Poids:', f"{consultation['poids']} kg"])
            if consultation.get('taille'):
                constantes_data.append(['Taille:', f"{consultation['taille']} cm"])
            if consultation.get('temperature'):
                constantes_data.append(['Température:', f"{consultation['temperature']} °C"])
            if consultation.get('pouls'):
                constantes_data.append(['Pouls:', f"{consultation['pouls']} bpm"])
            if consultation.get('tension'):
                constantes_data.append(['Tension:', f"{consultation['tension']} mmHg"])
            if consultation.get('saturation'):
                constantes_data.append(['SpO2:', f"{consultation['saturation']} %"])
            
            if constantes_data:
                const_table = Table(constantes_data, colWidths=[1.5*inch, 2*inch])
                const_table.setStyle(TableStyle([
                    ('FONTSIZE', (0, 0), (-1, -1), 9),
                    ('PADDING', (0, 0), (-1, -1), 6),
                    ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#ecf0f1')),
                ]))
                story.append(const_table)
                story.append(Spacer(1, 0.1 * inch))
            
            story.append(Paragraph(consultation.get('notes', ''), self.styles['CorpsTexte']))
            story.append(Spacer(1, 0.2 * inch))
        
        # Diagnostic
        if consultation.get('diagnostic'):
            story.append(Paragraph("Diagnostic", self.styles['Section']))
            story.append(Paragraph(consultation['diagnostic'], self.styles['CorpsTexte']))
            story.append(Spacer(1, 0.2 * inch))
        
        # Ordonnance
        if consultation.get('ordonnance'):
            story.append(PageBreak())
            story.append(Paragraph("ORDONNANCE", self.styles['SousTitre']))
            story.append(Spacer(1, 0.2 * inch))
            
            # Re-afficher les infos patient
            story.extend(self._create_patient_header(patient))
            
            # Médecin prescripteur
            medecin = consultation.get('medecin')
            if medecin:
                if isinstance(medecin, str):
                    med_text = medecin
                else:
                    med_text = f"Prescrit par Dr. {medecin.get('prenom', '')} {medecin.get('nom', '')} - {medecin.get('specialite', '')}"
                story.append(Paragraph(med_text, self.styles['CorpsTexte']))
                story.append(Spacer(1, 0.2 * inch))
            
            # Liste des médicaments
            lignes = consultation['ordonnance'].split('\n')
            for i, ligne in enumerate(lignes, 1):
                if ligne.strip():
                    story.append(Paragraph(f"{i}. {ligne.strip()}", self.styles['CorpsTexte']))
            
            story.append(Spacer(1, 0.3 * inch))
            story.append(Paragraph(
                f"Date: {consultation.get('date', '')}",
                self.styles['CorpsTexte']
            ))
        
        # Générer le PDF
        doc.build(story)
        return output_path