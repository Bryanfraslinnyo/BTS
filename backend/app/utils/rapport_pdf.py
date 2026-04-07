"""
Génération de rapports médicaux en PDF - Version Professionnelle Sobre
Design médical classique, élégant et conforme aux standards médicaux
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm, mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, Image, Flowable
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.graphics.shapes import Drawing, Line
from datetime import datetime
import io
import os
from typing import Dict, List, Optional
from PIL import Image as PILImage


class SectionLine(Flowable):
    """Ligne de séparation élégante"""
    def __init__(self, width, color=colors.HexColor('#2C5F8D'), thickness=1):
        Flowable.__init__(self)
        self.width = width
        self.color = color
        self.thickness = thickness
    
    def draw(self):
        self.canv.saveState()
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(self.thickness)
        self.canv.line(0, 0, self.width, 0)
        self.canv.restoreState()


class RapportMedicalPDF:
    """Générateur de rapports médicaux professionnels"""
    
    def __init__(self, pagesize=A4, logo_path: Optional[str] = None):
        self.pagesize = pagesize
        self.logo_path = logo_path
        self.styles = getSampleStyleSheet()
        
        # Palette sobre et professionnelle
        self.colors = {
            'primary': colors.HexColor('#2C5F8D'),      # Bleu médical classique
            'primary_light': colors.HexColor('#4A7BA7'), # Bleu clair
            'text': colors.HexColor('#2C3E50'),         # Texte principal foncé
            'text_secondary': colors.HexColor('#7F8C8D'),# Texte secondaire
            'border': colors.HexColor('#BDC3C7'),       # Bordures grises
            'bg_light': colors.HexColor('#F8F9FA'),     # Fond très clair
            'white': colors.white,
            'black': colors.black,
        }
        
        self._setup_styles()
    
    def _setup_styles(self):
        """Configuration des styles sobres et professionnels"""
        
        # Titre principal
        self.styles.add(ParagraphStyle(
            name='TitrePrincipal',
            parent=self.styles['Heading1'],
            fontSize=20,
            textColor=self.colors['primary'],
            spaceAfter=20,
            spaceBefore=10,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold',
            leading=24
        ))
        
        # Section
        self.styles.add(ParagraphStyle(
            name='Section',
            parent=self.styles['Heading2'],
            fontSize=14,
            textColor=self.colors['primary'],
            spaceAfter=10,
            spaceBefore=16,
            fontName='Helvetica-Bold',
            leading=18,
            borderWidth=0,
            borderPadding=0,
            borderColor=None,
            leftIndent=0
        ))
        
        # Sous-section
        self.styles.add(ParagraphStyle(
            name='SubSection',
            parent=self.styles['Normal'],
            fontSize=12,
            textColor=self.colors['text'],
            spaceAfter=8,
            spaceBefore=10,
            fontName='Helvetica-Bold',
            leading=15
        ))
        
        # Corps de texte
        self.styles.add(ParagraphStyle(
            name='CorpsTexte',
            parent=self.styles['Normal'],
            fontSize=11,
            leading=15,
            textColor=self.colors['text'],
            alignment=TA_JUSTIFY,
            spaceAfter=8,
            fontName='Helvetica'
        ))
        
        # Texte en gras
        self.styles.add(ParagraphStyle(
            name='TexteGras',
            parent=self.styles['Normal'],
            fontSize=11,
            leading=15,
            textColor=self.colors['text'],
            fontName='Helvetica-Bold'
        ))
        
        # Petit texte
        self.styles.add(ParagraphStyle(
            name='PetitTexte',
            parent=self.styles['Normal'],
            fontSize=9,
            textColor=self.colors['text_secondary'],
            leading=12,
            fontName='Helvetica'
        ))
        
        # Légende
        self.styles.add(ParagraphStyle(
            name='Legende',
            parent=self.styles['Normal'],
            fontSize=8,
            textColor=self.colors['text_secondary'],
            leading=10,
            fontName='Helvetica',
            alignment=TA_CENTER
        ))
        
        # Pied de page
        self.styles.add(ParagraphStyle(
            name='Footer',
            parent=self.styles['Normal'],
            fontSize=8,
            textColor=self.colors['text_secondary'],
            alignment=TA_CENTER,
            leading=10,
            fontName='Helvetica'
        ))
        
        # En-tête établissement
        self.styles.add(ParagraphStyle(
            name='EnTeteEtablissement',
            parent=self.styles['Normal'],
            fontSize=16,
            textColor=self.colors['primary'],
            fontName='Helvetica-Bold',
            leading=20,
            alignment=TA_LEFT
        ))
    
    def _create_header(self, etablissement: str = "CENTRE DE SANTÉ IUG", 
                      adresse: str = "Douala, Cameroun", 
                      tel: str = "Tél: +237 6XX XXX XXX",
                      email: str = "contact@iug-health.cm"):
        """En-tête sobre et professionnel"""
        elements = []
        
        # Données de l'en-tête
        header_data = []
        
        # Logo (si disponible)
        logo_cell = None
        if self.logo_path and os.path.exists(self.logo_path):
            try:
                img = PILImage.open(self.logo_path)
                img.thumbnail((80, 80), PILImage.Resampling.LANCZOS)
                img_buffer = io.BytesIO()
                img.save(img_buffer, format='PNG')
                img_buffer.seek(0)
                logo = Image(img_buffer, width=60, height=60)
                logo_cell = logo
            except:
                pass
        
        # Informations établissement
        info_lines = [
            f'<font name="Helvetica-Bold" size="16" color="{self.colors["primary"].hexval()}">{etablissement}</font>',
            f'<font size="10">{adresse}</font>',
            f'<font size="9">{tel}</font>',
            f'<font size="9">{email}</font>'
        ]
        
        info_text = '<br/>'.join(info_lines)
        info_para = Paragraph(info_text, self.styles['Normal'])
        
        # Tableau d'en-tête
        if logo_cell:
            header_data = [[logo_cell, info_para]]
            header_table = Table(header_data, colWidths=[1.2*inch, 5*inch])
            header_table.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('ALIGN', (0, 0), (0, 0), 'LEFT'),
                ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
            ]))
        else:
            header_table = info_para
        
        elements.append(header_table)
        elements.append(Spacer(1, 0.1 * inch))
        
        # Ligne de séparation
        elements.append(SectionLine(6.5*inch, self.colors['primary'], 2))
        elements.append(Spacer(1, 0.2 * inch))
        
        return elements
    
    def _create_patient_info(self, patient: Dict):
        """Section informations patient sobre"""
        elements = []
        
        # Titre de section
        elements.append(Paragraph("INFORMATIONS PATIENT", self.styles['Section']))
        elements.append(Spacer(1, 0.1 * inch))
        
        # Calcul de l'âge
        age_str = ""
        if patient.get('date_naissance'):
            try:
                dob = datetime.strptime(str(patient['date_naissance']), '%Y-%m-%d')
                age = (datetime.now() - dob).days // 365
                age_str = f"{age} ans"
            except:
                age_str = "N/A"
        
        # Données patient
        data = [
            ['Nom complet:', f"{patient.get('prenom', '')} {patient.get('nom', '')}".upper()],
            ['Date de naissance:', f"{patient.get('date_naissance', 'N/A')} ({age_str})"],
            ['Sexe:', patient.get('sexe', 'N/A')],
            ['Groupe sanguin:', patient.get('groupe_sanguin', 'N/A')],
        ]
        
        # Ajouter téléphone et email si disponibles
        if patient.get('telephone'):
            data.append(['Téléphone:', patient.get('telephone')])
        if patient.get('email'):
            data.append(['Email:', patient.get('email')])
        
        # Tableau
        patient_table = Table(data, colWidths=[2*inch, 4*inch])
        patient_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 0), (-1, -1), self.colors['text']),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('LINEBELOW', (0, 0), (-1, -2), 0.5, self.colors['border']),
        ]))
        
        elements.append(patient_table)
        elements.append(Spacer(1, 0.2 * inch))
        
        return elements
    
    def _create_vitals_table(self, consultation: Dict):
        """Tableau des constantes vitales sobre"""
        elements = []
        
        vitals_data = []
        
        # Collecter les constantes disponibles
        if consultation.get('poids'):
            vitals_data.append(['Poids:', f"{consultation['poids']} kg"])
        if consultation.get('taille'):
            vitals_data.append(['Taille:', f"{consultation['taille']} cm"])
        if consultation.get('temperature'):
            vitals_data.append(['Température:', f"{consultation['temperature']} °C"])
        if consultation.get('pouls'):
            vitals_data.append(['Pouls:', f"{consultation['pouls']} bpm"])
        if consultation.get('tension'):
            vitals_data.append(['Tension artérielle:', f"{consultation['tension']} mmHg"])
        if consultation.get('saturation'):
            vitals_data.append(['SpO₂:', f"{consultation['saturation']} %"])
        
        if vitals_data:
            vitals_table = Table(vitals_data, colWidths=[2*inch, 2*inch])
            vitals_table.setStyle(TableStyle([
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('TEXTCOLOR', (0, 0), (-1, -1), self.colors['text']),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                ('GRID', (0, 0), (-1, -1), 0.5, self.colors['border']),
                ('BACKGROUND', (0, 0), (0, -1), self.colors['bg_light']),
            ]))
            elements.append(vitals_table)
        else:
            elements.append(Paragraph(
                "<i>Aucune constante vitale enregistrée</i>",
                self.styles['PetitTexte']
            ))
        
        return elements
    
    def generer_rapport_consultation(self, consultation: Dict, patient: Dict, 
                                     output_path: str,
                                     etablissement: str = "CENTRE DE SANTÉ IUG",
                                     adresse: str = "Douala, Cameroun", 
                                     tel: str = "Tél: +237 6XX XXX XXX",
                                     email: str = "contact@iug-health.cm"):
        """Générer un rapport de consultation sobre et professionnel"""
        
        doc = SimpleDocTemplate(
            output_path, 
            pagesize=self.pagesize,
            leftMargin=0.75*inch,
            rightMargin=0.75*inch,
            topMargin=0.6*inch,
            bottomMargin=0.6*inch
        )
        
        story = []
        
        # En-tête
        story.extend(self._create_header(etablissement, adresse, tel, email))
        
        # Titre du document
        story.append(Paragraph("RAPPORT DE CONSULTATION MÉDICALE", 
                              self.styles['TitrePrincipal']))
        story.append(Spacer(1, 0.3 * inch))
        
        # Informations patient
        story.extend(self._create_patient_info(patient))
        
        # === CONSULTATION ===
        story.append(Paragraph("DÉTAILS DE LA CONSULTATION", self.styles['Section']))
        story.append(Spacer(1, 0.1 * inch))
        
        # Informations générales
        consult_data = [
            ['Date:', f"{consultation.get('date', 'N/A')} a {consultation.get('heure', 'N/A')}"],
            ['Type de consultation:', consultation.get('type_consult') or 'N/A'],
            ['Specialite:', consultation.get('specialite') or 'N/A'],
            ['Statut:', consultation.get('statut') or 'N/A'],
        ]
        
        # Médecin
        medecin = consultation.get('medecin')
        if medecin:
            if isinstance(medecin, dict):
                med_text = f"Dr. {medecin.get('prenom', '')} {medecin.get('nom', '')}"
                if medecin.get('specialite'):
                    med_text += f", {medecin['specialite']}"
            else:
                med_text = str(medecin)
            consult_data.append(['Médecin traitant:', med_text])
        
        consult_table = Table(consult_data, colWidths=[2*inch, 4*inch])
        consult_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 0), (-1, -1), self.colors['text']),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('LINEBELOW', (0, 0), (-1, -2), 0.5, self.colors['border']),
        ]))
        
        story.append(consult_table)
        story.append(Spacer(1, 0.2 * inch))
        
        # === MOTIF ===
        story.append(Paragraph("Motif de consultation", self.styles['SubSection']))
        motif_text = consultation.get('motif') or 'Non specifie'
        story.append(Paragraph(motif_text, self.styles['CorpsTexte']))
        story.append(Spacer(1, 0.2 * inch))
        
        # === CONSTANTES VITALES ===
        story.append(Paragraph("Constantes vitales", self.styles['SubSection']))
        story.append(Spacer(1, 0.05 * inch))
        story.extend(self._create_vitals_table(consultation))
        story.append(Spacer(1, 0.2 * inch))
        
        # === EXAMEN CLINIQUE ===
        if consultation.get('notes_cliniques'):
            story.append(Paragraph("Examen clinique", self.styles['SubSection']))
            story.append(Paragraph(consultation['notes_cliniques'], 
                                  self.styles['CorpsTexte']))
            story.append(Spacer(1, 0.2 * inch))
        
        # === DIAGNOSTIC ===
        if consultation.get('diagnostic'):
            story.append(Paragraph("Diagnostic", self.styles['SubSection']))
            story.append(Paragraph(consultation['diagnostic'], 
                                  self.styles['CorpsTexte']))
            story.append(Spacer(1, 0.2 * inch))
        
        # === ORDONNANCE ===
        if consultation.get('ordonnance'):
            story.append(PageBreak())
            
            # En-tête de la nouvelle page
            story.extend(self._create_header(etablissement, adresse, tel, email))
            
            story.append(Paragraph("ORDONNANCE MÉDICALE", 
                                  self.styles['TitrePrincipal']))
            story.append(Spacer(1, 0.2 * inch))
            
            # Info patient résumée
            patient_resume = f"<b>Patient:</b> {patient.get('prenom', '')} {patient.get('nom', '')}"
            story.append(Paragraph(patient_resume, self.styles['CorpsTexte']))
            story.append(Paragraph(
                f"<b>Date:</b> {consultation.get('date', '')}",
                self.styles['CorpsTexte']
            ))
            story.append(Spacer(1, 0.15 * inch))
            
            # Médecin prescripteur
            if medecin:
                if isinstance(medecin, dict):
                    prescripteur = f"<b>Prescrit par:</b> Dr. {medecin.get('prenom', '')} {medecin.get('nom', '')}"
                else:
                    prescripteur = f"<b>Prescrit par:</b> {medecin}"
                story.append(Paragraph(prescripteur, self.styles['CorpsTexte']))
                story.append(Spacer(1, 0.2 * inch))
            
            # Ligne de séparation
            story.append(SectionLine(6.5*inch, self.colors['border'], 1))
            story.append(Spacer(1, 0.2 * inch))
            
            # Liste des médicaments
            story.append(Paragraph("<b>Prescription:</b>", self.styles['SubSection']))
            story.append(Spacer(1, 0.1 * inch))
            
            ordonnance_lines = consultation['ordonnance'].strip().split('\n')
            med_data = []
            
            for i, ligne in enumerate(ordonnance_lines, 1):
                if ligne.strip():
                    med_data.append([f"{i}.", ligne.strip()])
            
            if med_data:
                med_table = Table(med_data, colWidths=[0.3*inch, 5.7*inch])
                med_table.setStyle(TableStyle([
                    ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                    ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 0), (-1, -1), 10),
                    ('TEXTCOLOR', (0, 0), (-1, -1), self.colors['text']),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('TOPPADDING', (0, 0), (-1, -1), 6),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                    ('LINEBELOW', (0, 0), (-1, -2), 0.25, self.colors['border']),
                ]))
                story.append(med_table)
            
            # Zone de signature
            story.append(Spacer(1, 0.8 * inch))
            
            # Ligne pour signature
            signature_drawing = Drawing(2.5*inch, 40)
            signature_drawing.add(Line(0, 30, 2.5*inch, 30, 
                                      strokeColor=self.colors['text'], 
                                      strokeWidth=0.5))
            story.append(signature_drawing)
            
            story.append(Paragraph("Signature et cachet du médecin", 
                                  self.styles['Legende']))
        
        # === PIED DE PAGE ===
        story.append(Spacer(1, 0.5 * inch))
        
        footer_text = f"Document médical confidentiel - {etablissement}<br/>" \
                     f"Édité le {datetime.now().strftime('%d/%m/%Y à %H:%M')}"
        story.append(Paragraph(footer_text, self.styles['Footer']))
        
        # Générer le PDF
        doc.build(story)
        return output_path
    
    def generer_fiche_patient(self, patient: Dict, 
                             consultations: List[Dict] = None,
                             examens: List[Dict] = None,
                             output_path: str = None,
                             etablissement: str = "CENTRE DE SANTÉ IUG",
                             adresse: str = "Douala, Cameroun",
                             tel: str = "Tél: +237 6XX XXX XXX",
                             email: str = "contact@iug-health.cm"):
        """Générer une fiche patient sobre"""
        
        if consultations is None:
            consultations = []
        if examens is None:
            examens = []
        
        doc = SimpleDocTemplate(
            output_path, 
            pagesize=self.pagesize,
            leftMargin=0.75*inch,
            rightMargin=0.75*inch,
            topMargin=0.6*inch,
            bottomMargin=0.6*inch
        )
        
        story = []
        story.extend(self._create_header(etablissement, adresse, tel, email))
        
        story.append(Paragraph("FICHE PATIENT", self.styles['TitrePrincipal']))
        story.append(Spacer(1, 0.3 * inch))
        
        story.extend(self._create_patient_info(patient))
        
        # Antécédents médicaux
        if patient.get('antecedents'):
            story.append(Paragraph("Antécédents médicaux", self.styles['SubSection']))
            story.append(Paragraph(patient['antecedents'], self.styles['CorpsTexte']))
            story.append(Spacer(1, 0.15 * inch))
        
        # Allergies
        if patient.get('allergies'):
            story.append(Paragraph("Allergies", self.styles['SubSection']))
            story.append(Paragraph(patient['allergies'], self.styles['CorpsTexte']))
            story.append(Spacer(1, 0.15 * inch))
        
        # Historique des consultations
        if consultations:
            story.append(Spacer(1, 0.1 * inch))
            story.append(Paragraph(
                f"HISTORIQUE DES CONSULTATIONS ({len(consultations)})", 
                self.styles['Section']
            ))
            story.append(Spacer(1, 0.1 * inch))
            
            # Tableau des consultations
            consult_table_data = [['Date', 'Type', 'Médecin', 'Diagnostic']]
            
            for consult in consultations[:10]:  # Max 10
                date = consult.get('date', 'N/A')
                type_c = (consult.get('type_consult') or 'N/A')[:20]
                
                medecin = consult.get('medecin', {})
                if isinstance(medecin, dict) and medecin:
                    med_name = f"Dr. {medecin.get('nom', 'N/A')}"
                elif medecin:
                    med_name = str(medecin)[:20]
                else:
                    med_name = 'N/A'
                
                diag_raw = consult.get('diagnostic') or 'N/A'
                diagnostic = diag_raw[:30]
                if len(diag_raw) > 30:
                    diagnostic += '...'
                
                consult_table_data.append([date, type_c, med_name, diagnostic])
            
            consult_history_table = Table(
                consult_table_data, 
                colWidths=[1*inch, 1.5*inch, 1.5*inch, 2*inch]
            )
            consult_history_table.setStyle(TableStyle([
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('TEXTCOLOR', (0, 0), (-1, -1), self.colors['text']),
                ('BACKGROUND', (0, 0), (-1, 0), self.colors['bg_light']),
                ('GRID', (0, 0), (-1, -1), 0.5, self.colors['border']),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ]))
            
            story.append(consult_history_table)
        
        # Examens
        if examens:
            story.append(Spacer(1, 0.2 * inch))
            story.append(Paragraph(f"EXAMENS MÉDICAUX ({len(examens)})", 
                                  self.styles['Section']))
            story.append(Spacer(1, 0.1 * inch))
            
            exam_data = [['Date', 'Type', 'Nom', 'Statut']]
            
            for exam in examens[:10]:
                date = exam.get('date', 'N/A')
                type_e = (exam.get('type_examen') or 'N/A')[:20]
                nom = (exam.get('nom') or 'N/A')[:30]
                statut = exam.get('statut') or 'N/A'
                
                exam_data.append([date, type_e, nom, statut])
            
            exam_table = Table(exam_data, colWidths=[1*inch, 1.5*inch, 2.5*inch, 1*inch])
            exam_table.setStyle(TableStyle([
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('TEXTCOLOR', (0, 0), (-1, -1), self.colors['text']),
                ('BACKGROUND', (0, 0), (-1, 0), self.colors['bg_light']),
                ('GRID', (0, 0), (-1, -1), 0.5, self.colors['border']),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ]))
            
            story.append(exam_table)
        
        # Footer
        story.append(Spacer(1, 0.5 * inch))
        footer_text = f"Fiche patient - {etablissement}<br/>" \
                     f"Édité le {datetime.now().strftime('%d/%m/%Y à %H:%M')}"
        story.append(Paragraph(footer_text, self.styles['Footer']))
        
        doc.build(story)
        return output_path
    
    def generer_ordonnance(self, consultation: Dict, patient: Dict,
                          output_path: str,
                          etablissement: str = "CENTRE DE SANTÉ IUG",
                          adresse: str = "Douala, Cameroun",
                          tel: str = "Tél: +237 6XX XXX XXX",
                          email: str = "contact@iug-health.cm"):
        """Générer une ordonnance seule"""
        
        if not consultation.get('ordonnance'):
            raise ValueError("Aucune ordonnance dans cette consultation")
        
        doc = SimpleDocTemplate(
            output_path, 
            pagesize=self.pagesize,
            leftMargin=0.75*inch,
            rightMargin=0.75*inch,
            topMargin=0.6*inch,
            bottomMargin=0.6*inch
        )
        
        story = []
        story.extend(self._create_header(etablissement, adresse, tel, email))
        
        story.append(Paragraph("ORDONNANCE MÉDICALE", 
                              self.styles['TitrePrincipal']))
        story.append(Spacer(1, 0.3 * inch))
        
        # Info patient
        patient_info = [
            ['Patient:', f"{patient.get('prenom', '')} {patient.get('nom', '')}".upper()],
            ['Date:', consultation.get('date', 'N/A')],
        ]
        
        patient_table = Table(patient_info, colWidths=[1.5*inch, 4*inch])
        patient_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        
        story.append(patient_table)
        story.append(Spacer(1, 0.15 * inch))
        
        # Médecin
        medecin = consultation.get('medecin')
        if medecin:
            if isinstance(medecin, dict):
                prescripteur = f"Prescrit par Dr. {medecin.get('prenom', '')} {medecin.get('nom', '')}"
            else:
                prescripteur = f"Prescrit par {medecin}"
            story.append(Paragraph(prescripteur, self.styles['CorpsTexte']))
            story.append(Spacer(1, 0.2 * inch))
        
        # Ligne de séparation
        story.append(SectionLine(6.5*inch, self.colors['border'], 1))
        story.append(Spacer(1, 0.2 * inch))
        
        # Médicaments
        story.append(Paragraph("Prescription:", self.styles['SubSection']))
        story.append(Spacer(1, 0.1 * inch))
        
        ordonnance_lines = consultation['ordonnance'].strip().split('\n')
        med_data = []
        
        for i, ligne in enumerate(ordonnance_lines, 1):
            if ligne.strip():
                med_data.append([f"{i}.", ligne.strip()])
        
        if med_data:
            med_table = Table(med_data, colWidths=[0.3*inch, 5.7*inch])
            med_table.setStyle(TableStyle([
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 11),
                ('TEXTCOLOR', (0, 0), (-1, -1), self.colors['text']),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('LINEBELOW', (0, 0), (-1, -2), 0.25, self.colors['border']),
            ]))
            story.append(med_table)
        
        # Signature
        story.append(Spacer(1, 1 * inch))
        
        signature_drawing = Drawing(2.5*inch, 40)
        signature_drawing.add(Line(0, 30, 2.5*inch, 30, 
                                  strokeColor=self.colors['text'], 
                                  strokeWidth=0.5))
        story.append(signature_drawing)
        story.append(Paragraph("Signature et cachet du médecin", 
                              self.styles['Legende']))
        
        # Footer
        story.append(Spacer(1, 0.5 * inch))
        footer_text = f"Ordonnance - {etablissement}<br/>" \
                     f"Édité le {datetime.now().strftime('%d/%m/%Y à %H:%M')}"
        story.append(Paragraph(footer_text, self.styles['Footer']))
        
        doc.build(story)
        return output_path